# Data Import Tools

## 1. Introduction to Import Tools

The IoTDB import tool suite is divided into two types: active listening and loading TsFile and import scripts. The import scripts include the `import-tsfile.sh/bat` script specifically for importing TsFile files and the `import-data.sh/bat` script that supports the import of CSV and SQL formats, which can be used for single file import or batch import of a directory.


## 2. Active Listening and Loading TsFile

Users only need to specify the sending end file directory and the receiving end target directory through the data collection forwarding program, and the files will be automatically synchronized to the scheduled receiving end directory. With the active listening feature of DataNode, files placed in the scheduled receiving end directory can be automatically detected and loaded by IoTDB without any additional loading operations. This automated process not only simplifies the user's operational steps but also reduces potential errors in the operation process, effectively reducing the complexity for users during use.


### 2.1 Configuration Parameters

| **Configuration Parameter**                                 | **Description**                                                 | **Value Range**             | **Required** | **Default Value**             | **Loading Method** |
| -------------------------------------------- | ------------------------------------------------------------ | -------------------------- | ------------ | ---------------------- | ---------------- |
| load_active_listening_enable                 | Whether to enable the DataNode's active listening and loading of tsfile functionality (default is enabled).	 | Boolean: true，false       | Optional	         | true                   | Hot Loading           |
| load_active_listening_dirs                   | The directories to be listened to (automatically includes subdirectories of the directory), if there are multiple, separate with “,”. The default directory is ext/load/pending (supports hot loading).	 | String: one or more file directories | Optional	         | ext/load/pending       | Hot Loading           |
| load_active_listening_fail_dir               | The directory to which files are transferred after the execution of loading tsfile files fails, only one directory can be configured.	     | String: one file directory       | Optional	         | ext/load/failed        | Hot Loading           |
| load_active_listening_max_thread_num         | The maximum number of threads to perform loading tsfile tasks simultaneously. The default value when the parameter is commented out is max(1, CPU core count / 2). When the user sets a value not in the range [1, CPU core count / 2], it will be set to the default value (1, CPU core count / 2).	 | Long: [1, Long.MAX_VALUE]  | Optional	         | max(1, CPU core count / 2) | Effective after restart       |
| load_active_listening_check_interval_seconds | Active listening polling interval in seconds. The function of actively listening to tsfile is achieved by polling the folder. This configuration specifies the time interval between two checks of load_active_listening_dirs, and the next check will be executed after load_active_listening_check_interval_seconds seconds of each check. When the user sets the polling interval to less than 1, it will be set to the default value of 5 seconds.	 | Long: [1, Long.MAX_VALUE]  | Optional	         | 5                      | Effective after restart       |


### 2.2 Precautions

1. If there is a mods file in the files to be loaded, the mods file should be moved to the listening directory first, and then the tsfile files should be moved, with the mods file and the corresponding tsfile file in the same directory. This prevents the loading of tsfile files without the corresponding mods files.

```SQL
FUNCTION moveFilesToListeningDirectory(sourceDirectory, listeningDirectory)
    // Move mods files
    modsFiles = searchFiles(sourceDirectory, "*mods*")
    IF modsFiles IS NOT EMPTY
        FOR EACH file IN modsFiles
            MOVE(file, listeningDirectory)
        END FOR
    END IF

    // Move tsfile files
    tsfileFiles = searchFiles(sourceDirectory, "*tsfile*")
    IF tsfileFiles IS NOT EMPTY
        FOR EACH file IN tsfileFiles
            MOVE(file, listeningDirectory)
        END FOR
    END IF
END FUNCTION

FUNCTION searchFiles(directory, pattern)
    matchedFiles = []
    FOR EACH file IN directory.files
        IF file.name MATCHES pattern
            APPEND file TO matchedFiles
        END IF
    END FOR
    RETURN matchedFiles
END FUNCTION

FUNCTION MOVE(sourceFile, targetDirectory)
    // Implement the logic of moving files from sourceFile to targetDirectory
END FUNCTION
```

2. Prohibit setting the receiver directory of Pipe, the data directory for storing data, etc., as the listening directory.

3. Prohibit `load_active_listening_fail_dir` from having the same directory as `load_active_listening_dirs`, or each other's nesting.

4. Ensure that the `load_active_listening_dirs` directory has sufficient permissions. After the load is successful, the files will be deleted. If there is no delete permission, it will lead to repeated loading.

## 3. Import Scripts

### 3.1 Supported Data Types

- CSV: Pure text format for storing formatted data, must comply with the specified CSV format below.

- SQL: Files containing IoTDB SQL statements.

- TsFile: IoTDB native time series data file format.


### 3.2 load-tsfile Script

Supports TsFile: The file format for time series used in IoTDB.

#### 3.2.1 Command

```Bash
# Unix/OS X
>tools/load-tsfile.sh -h <ip> -p <port> -u <username> -pw <password> -s <source> -os <on_success> [-sd <success_dir>] -of <on_fail> [-fd <fail_dir>] [-tn <thread_num>] 

# Windows
>tools\load-tsfile.bat -h <ip> -p <port> -u <username> -pw <password>  -s <source> -os <on_success> [-sd <success_dir>] -of <on_fail> [-fd <fail_dir>] [-tn <thread_num>] 
```

#### 3.2.2 Parameter Introduction


| **Parameter** | **Description**                                                     | **Required**                        | **Default**            |
| -------- | ------------------------------------------------------------ | ----------------------------------- | ------------------- |
| -h       | Hostname                                                       | No                                  | root                |
| -p       | Port                                                       | No                                  | root                |
| -u       | Username                                                       | No                                  | 127.0.0.1           |
| -pw      | Password                                                         | No                                  | 6667                |
| -s       | The local directory path of the script file (folder) to be loaded	                          | Yes                                  |                     |
| -os      | none: Do not delete <br> mv: Move successful files to the target folder <br> cp: Hard link (copy) successful files to the target folder <br> delete: Delete	 | Yes                                  |                     |
| -sd      | When --on_success is mv or cp, the target folder for mv or cp. The file name of the file becomes the folder flattened and then concatenated with the original file name.	 | When --on_success is mv or cp, it is required to fill in Yes	 | ${EXEC_DIR}/success |
| -of      | none: Skip <br> mv: Move failed files to the target folder <br> cp: Hard link (copy) failed files to the target folder  <br> delete: Delete	 | Yes                                  |                     |
| -fd      | When --on_fail is specified as mv or cp, the target folder for mv or cp. The file name of the file becomes the folder flattened and then concatenated with the original file name.	 | When --on_fail is specified as mv or cp, it is required to fill in	   | ${EXEC_DIR}/fail    |
| -tn      | Maximum number of parallel threads	                                               | Yes                                  | 8                   |

#### 3.2.3 Running Examples

```Bash
# Unix/OS X
> tools/load-tsfile.sh -h 127.0.0.1 -p 6667 -u root -pw root -s /path/sql -os delete -of delete -tn 8
> tools/load-tsfile.sh -h 127.0.0.1 -p 6667 -u root -pw root -s /path/sql -os mv -of cp -sd /path/success/dir -fd /path/failure/dir -tn 8 

# Windows
> tools/load_data.bat -h 127.0.0.1 -p 6667 -u root -pw root -s /path/sql -os mv -of cp -sd /path/success/dir -fd /path/failure/dir -tn 8 
> tools/load_data.bat -h 127.0.0.1 -p 6667 -u root -pw root -s /path/sql -os delete -of delete -tn 8 
```

## 3.3 import-data Script

Supports CSV: A plain text format for storing formatted data, which needs to be constructed according to the specified CSV format below.

Supports SQL: A file containing custom SQL statements.

#### 3.3.1 Command

```Bash
# Unix/OS X
>tools/import-data.sh -h <ip> -p <port> -u <username> -pw <password> -s <xxx.csv/sql> [-fd <./failedDirectory> -aligned <true/false> -batch <int> -tp <ms/ns/us> -typeInfer <boolean=text,float=double...> -lpf <int>]

# Windows
>tools\import-data.bat -h <ip> -p <port> -u <username> -pw <password> -s <xxx.csv/sql> [-fd <./failedDirectory> -aligned <true/false> -batch <int> -tp <ms/ns/us> -typeInfer <boolean=text,float=double...> -lpf <int>]
```

#### 3.3.2 Parameter Introduction

| **Parameter**  | **Definition**                                                     | **Required** | **Default**                 |
| --------- | ------------------------------------------------------------ | ------------ | ------------------------ |
| -h        |  Hostname                                                 | No           | 127.0.0.1                |
| -p        |  Port	                                                   | No           | 6667                     |
| -u        | Username	                                             | No           | root                     |
| -pw       | Password	                                               | No           | root                     |
| -s         | Specify the data to be imported, here you can specify files or folders. If a folder is specified, all files with suffixes of csv or sql in the folder will be batch imported (In V1.3.2, the parameter is `-f`) | Yes           |                           |
| -fd        | Specify the directory for storing failed SQL files. If this parameter is not specified, failed files will be saved in the source data directory. Note: For unsupported SQL, illegal SQL, and failed SQL, they will be put into the failed directory under the failed file (default is the file name with `.failed` suffix)  | No           |The source filename with `.failed` suffix |
| -aligned   | Specify whether to use the `aligned` interface, options are true or false. Note: This parameter is only effective when importing csv files. | No           | false                     |
| -batch     | Used to specify the number of data points per batch (minimum value is 1, maximum value is Integer.*MAX_VALUE*). If the program reports the error `org.apache.thrift.transport.TTransportException: Frame size larger than protect max size`, you can appropriately reduce this parameter. | No           | 100000                    |
| -tp        |  Specify the time precision, options include `ms` (milliseconds), `ns` (nanoseconds), `us` (microseconds) | No           | ms                        |
| -lpf       | Specify the number of data lines written per failed file (In V1.3.2, the parameter is `-linesPerFailedFile`) | No           | 10000                     |
| -typeInfer | Used to specify type inference rules, such as <srcTsDataType1=dstTsDataType1,srcTsDataType2=dstTsDataType2,...>. Note: Used to specify type inference rules. `srcTsDataType` includes `boolean`, `int`, `long`, `float`, `double`, `NaN`. `dstTsDataType` includes `boolean`, `int`, `long`, `float`, `double`, `text`. When `srcTsDataType` is `boolean`, `dstTsDataType` can only be `boolean` or `text`. When `srcTsDataType` is `NaN`, `dstTsDataType` can only be `float`, `double`, or `text`. When `srcTsDataType` is a numerical type, the precision of `dstTsDataType` needs to be higher than `srcTsDataType`. For example: `-typeInfer boolean=text,float=double`  | No           |                           |

#### 3.3.3 Running Examples

- Import the `dump0_0.sql` data in the current `data` directory to the local IoTDB database.

```Bash
# Unix/OS X
>tools/import-data.sh -s ./data/dump0_0.sql
# Windows
>tools/import-data.bat -s ./data/dump0_0.sql
```

- Import all data in the current `data` directory in an aligned manner to the local IoTDB database.

```Bash
# Unix/OS X
>tools/import-data.sh -s ./data/ -fd ./failed/ -aligned true
# Windows
>tools/import-data.bat -s ./data/ -fd ./failed/ -aligned true
```

- Import the `dump0_0.csv` data in the current `data` directory to the local IoTDB database.

```Bash
# Unix/OS X
>tools/import-data.sh -s ./data/dump0_0.csv -fd ./failed/
# Windows
>tools/import-data.bat -s ./data/dump0_0.csv -fd ./failed/
```

- Import the `dump0_0.csv` data in the current `data` directory in an aligned manner, batch import 100000 lines to the IoTDB database on the host with IP `192.168.100.1`, record failures in the current `failed` directory, with a maximum of 1000 lines per file.


```Bash
# Unix/OS X
>tools/import-data.sh -h 192.168.100.1 -p 6667 -u root -pw root -s ./data/dump0_0.csv -fd ./failed/ -aligned true -batch 100000 -tp ms -typeInfer boolean=text,float=double -lpf 1000
# Windows
>tools/import-data.bat -h 192.168.100.1 -p 6667 -u root -pw root -s ./data/dump0_0.csv -fd ./failed/ -aligned true -batch 100000 -tp ms -typeInfer boolean=text,float=double -lpf 1000
```