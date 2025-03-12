# Data Import

## 1. Overview
IoTDB supports two methods for data import:
* Data Import Tool: Use the import-data.sh (Unix/OS X) or import-data.bat (Windows) script in the tools directory to manually import CSV, SQL, or TsFile (open-source time-series file format) data into IoTDB.
* TsFile Auto-Loading Feature

<table style="text-align: left;">
  <tbody>
     <tr>   <th>File Format</th>
            <th>IoTDB Tool</th>        
            <th>Description</th>
      </tr>
      <tr>
            <td>CSV</td>  
            <td rowspan="3">import-data.sh/bat</td> 
            <td>Can be used for single or batch import of CSV files into IoTDB</td> 
      </tr>
      <tr>
            <td>SQL</td>   
            <td>Can be used for single or batch import of SQL files into IoTDB</td> 
      </tr>
       <tr>
            <td rowspan="2">TsFile</td> 
            <td>Can be used for single or batch import of TsFile files into IoTDB</td>
      </tr>
      <tr>
            <td>TsFile Auto-Loading Feature</td>
            <td>Can automatically monitor a specified directory for newly generated TsFiles and load them into IoTDB.</td>       
      </tr>
</tbody>
</table>

## 2. Data Import Tool
### 2.1 Common Parameters

| Short       | Full Parameter     | Description                                                                                                                                                                                      | Required        | Default                                       |
| ------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |-----------------------------------------------|
| `-ft`   | `--file_type`  | File type: `csv`, `sql`, `tsfile`.                                                                                                                                                   | ​**Yes** | -                                             |
| `-h`    | `--host`       | IoTDB server hostname.                                                                                                                                                                           | No              | `127.0.0.1`                                   |
| `-p`    | `--port`       | IoTDB server port.                                                                                                                                                                               | No              | `6667`                                        |
| `-u`    | `--username`   | Username.                                                                                                                                                                                        | No              | `root`                                        |
| `-pw`   | `--password`   | Password.                                                                                                                                                                                        | No              | `root`                                        |
| `-s`    | `--source`     | Local path to the file/directory to import. ​​**Supported formats**​: CSV, SQL, TsFile. Unsupported formats trigger error: `The file name must end with "csv", "sql", or "tsfile"!` | ​**Yes** | -                                             |
| `-tn`   | `--thread_num` | Maximum parallel threads                                                                                                                                   | No              | `8` <br> Range: 0 to Integer.Max(2147483647). |
| `-tz`   | `--timezone`   | Timezone (e.g., `+08:00`, `-01:00`).                                                                                                                                                     | No              | System default                                |
| `-help` | `--help`       | Display help (general or format-specific: `-help csv`).                                                                                                                                      | No              | -                                             |

###  2.2 CSV Format 

#### 2.2.1 Command 
```Shell
# Unix/OS X
> tools/import-data.sh -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
       -s <source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] [-aligned <use the aligned interface>] 
      [-ti <type_infer>] [-tp <timestamp precision (ms/us/ns)>] [-tz <timezone>] [-batch <batch_size>] 
      [-tn <thread_num>]
      
# Windows
> tools\import-data.bat -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
       -s <source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] [-aligned <use the aligned interface>] 
      [-ti <type_infer>] [-tp <timestamp precision (ms/us/ns)>] [-tz <timezone>] [-batch <batch_size>] 
      [-tn <thread_num>]
```

#### 2.2.2 CSV-Specific Parameters 

| Short          | Full Parameter                | Description                                              | Required | Default         |
| ---------------- | ------------------------------- |----------------------------------------------------------| ---------- |-----------------|
| `-fd`      | `--fail_dir`              | Directory to save failed files.                          | No       | YOUR_CSV_FILE_PATH |
| `-lpf`     | `--lines_per_failed_file` | Max lines per failed file.                               | No       | `100000`  <br> Range: 0 to Integer.Max(2147483647).      |
| `-aligned` | `--use_aligned`           | Import as aligned time series.                           | No       | `false`         |
| `-batch`   | `--batch_size`            | Rows processed per API call. | No       | `100000` <br> Range: 0 to Integer.Max(2147483647).        |
| `-ti`      | `--type_infer`            | Type mapping (e.g., `BOOLEAN=text,INT=long`).            | No       | -               |
| `-tp`      | `--timestamp_precision`   | Timestamp precision: `ms`, `us`, `ns`.                   | No       | `ms`            |

#### 2.2.3 Examples 

```Shell
# Valid Example
> tools/import-data.sh -ft csv -h 127.0.0.1 -p 6667 -u root -pw root -s /path/sql 
      -fd /path/failure/dir -lpf 100  -aligned true -ti "BOOLEAN=text,INT=long,FLOAT=double" 
      -tp ms -tz +08:00 -batch 5000  -tn 4
      
# Error Example
> tools/import-data.sh -ft csv -s /non_path
error: Source file or directory /non_path does not exist

> tools/import-data.sh -ft csv -s /path/sql -tn 0
error: Invalid thread number '0'. Please set a positive integer.
```

###  2.3 SQL Format 

####  2.3.1 Command 

```Shell
# Unix/OS X
> tools/import-data.sh -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
        -s<source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] [-tz <timezone>] 
        [-batch <batch_size>] [-tn <thread_num>]
      
# Windows
> tools\import-data.bat -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
        -s<source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] [-tz <timezone>] 
        [-batch <batch_size>] [-tn <thread_num>]
```

####  2.3.2 SQL-Specific Parameters 

| Short        | Full Parameter                | Description                                                        | Required | Default          |
| -------------- | ------------------------------- | -------------------------------------------------------------------- | ---------- | ------------------ |
| `-fd`    | `--fail_dir`              | Directory to save failed files.                                    | No       |YOUR_CSV_FILE_PATH|
| `-lpf`   | `--lines_per_failed_file` | Max lines per failed file.    | No       | `100000` <br> Range: 0 to Integer.Max(2147483647).    |
| `-batch` | `--batch_size`            | Rows processed per API call. | No       | `100000`  <br> Range: 0 to Integer.Max(2147483647).   |

####  2.3.3 Examples 

```Shell
# Valid Example
> tools/import-data.sh -ft sql -h 127.0.0.1 -p 6667 -u root -pw root -s /path/sql 
        -fd /path/failure/dir -lpf 500  -tz +08:00 
        -batch 100000  -tn 4
      
# Error Example
> tools/import-data.sh -ft sql -s /path/sql -fd /non_path
error: Source file or directory /path/sql does not exist


> tools/import-data.sh -ft sql -s /path/sql -tn 0
error: Invalid thread number '0'. Please set a positive integer.
```
###  2.4 TsFile Format 

#### 2.4.1 Command 

```Shell
# Unix/OS X
> tools/import-data.sh -ft <format> [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
        -s <source> -os <on_success> [-sd <success_dir>] -of <on_fail> [-fd <fail_dir>]
        [-tn <thread_num> ] [-tz <timezone>] [-tp <timestamp precision (ms/us/ns)>]
      
# Windows
> tools\import-data.bat -ft <format> [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
        -s <source> -os <on_success> [-sd <success_dir>] -of <on_fail> [-fd <fail_dir>]
        [-tn <thread_num> ] [-tz <timezone>] [-tp <timestamp precision (ms/us/ns)>]
```
####  2.4.2 TsFile-Specific Parameters 

| Short     | Full Parameter              | Description                                                                                                                                                                                                                                                                       | Required        | Default                   |
| ----------- | ----------------------------- |-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| ----------------- | --------------------------- |
| `-os` | `--on_success`          | Action for successful files:<br> `none`: Do not delete the file.<br> `mv`: Move the successful file to the target directory.<br> `cp`:Create a hard link (copy) of the successful file to the target directory.<br> `delete`:Delete the file.                                     | ​**Yes** | -                         |
| `-sd` | `--success_dir`         | Target directory for `mv`/`cp` actions on success. Required if `-os` is `mv`/`cp`.    The file name will be flattened and concatenated with the original file name.                                                                                                               | Conditional     | `${EXEC_DIR}/success` |
| `-of` | `--on_fail`             | Action for failed files:<br> `none`:Skip the file.<br> `mv`:Move the failed file to the target directory.<br> `cp`:Create a hard link (copy) of the failed file to the target directory.<br> `delete`:Delete the file..                                                           | ​**Yes** | -                         |
| `-fd` | `--fail_dir`            | Target directory for `mv`/`cp` actions on failure. Required if `-of` is `mv`/`cp`.  The file name will be flattened and concatenated with the original file name.                                                                                                                 | Conditional     | `${EXEC_DIR}/fail`    |
| `-tp` | `--timestamp_precision` | TsFile timestamp precision: `ms`, `us`, `ns`. <br> For non-remote TsFile imports: Use -tp to specify the timestamp precision of the TsFile. The system will manually verify if the timestamp precision matches the server. If it does not match, an error will be returned. <br> ​For remote TsFile imports: Use -tp to specify the timestamp precision of the TsFile. The Pipe system will automatically verify if the timestamp precision matches. If it does not match, a Pipe error will be returned. | No              | `ms`                  |

#### 2.4.3 Examples 

```Shell
# Valid Example
> tools/import-data.sh -ft tsfile -h 127.0.0.1 -p 6667 -u root -pw root 
      -s /path/sql -os mv -of cp -sd /path/success/dir -fd /path/failure/dir 
      -tn 8 -tz +08:00 -tp ms
      
# Error Example
> tools/import-data.sh -ft tsfile -s /path/sql -os mv -of cp 
           -fd /path/failure/dir  -tn 8 
error: Missing option --success_dir (or -sd) when --on_success is 'mv' or 'cp'

> tools/import-data.sh -ft tsfile -s /path/sql -os mv -of cp 
          -sd /path/success/dir -fd /path/failure/dir  -tn 0 
error: Invalid thread number '0'. Please set a positive integer.
```


## 3. TsFile Auto-Loading

This feature enables IoTDB to automatically monitor a specified directory for new TsFiles and load them into the database without manual intervention.

![](/img/Data-import2.png)

### 3.1 Configuration

Add the following parameters to `iotdb-system.properties` (template: `iotdb-system.properties.template`):

| Parameter                                          | Description                                                                           | Value Range                     | Required | Default                     | Hot-Load?             |
| ---------------------------------------------------- |---------------------------------------------------------------------------------------| --------------------------------- | ---------- | ----------------------------- | ----------------------- |
| `load_active_listening_enable`                 | Enable auto-loading.                                                                  | `true`/`false`          | Optional | `true`                  | Yes                   |
| `load_active_listening_dirs`                   | Directories to monitor (subdirectories included). Multiple paths separated by commas. | String                          | Optional | `ext/load/pending`      | Yes                   |
| `load_active_listening_fail_dir`               | Directory to store failed TsFiles.  Only can set one.                                 | String                          | Optional | `ext/load/failed`       | Yes                   |
| `load_active_listening_max_thread_num`         | Maximum Threads for TsFile Loading Tasks:The default value for this parameter, when commented out, is max(1, CPU cores / 2). If the value set by the user falls outside the range [1, CPU cores / 2], it will be reset to the default value of max(1, CPU cores / 2).                    | `1` to `Long.MAX_VALUE` | Optional | `max(1, CPU_CORES / 2)` | No (restart required) |
| `load_active_listening_check_interval_seconds` | Active Listening Polling Interval (in seconds):The active listening feature for TsFiles is implemented through polling the target directory. This configuration specifies the time interval between two consecutive checks of the `load_active_listening_dirs`. After each check, the next check will be performed after `load_active_listening_check_interval_seconds` seconds. If the polling interval set by the user is less than 1, it will be reset to the default value of 5 seconds.                                                | `1` to `Long.MAX_VALUE` | Optional | `5`                     | No (restart required) |

### 3.2 Notes

1. ​​**Mods Files**​: If TsFiles have associated `.mods` files, move `.mods` files to the monitored directory ​**before** their corresponding TsFiles. Ensure `.mods` and TsFiles are in the same directory.
2. ​​**Restricted Directories**​: Do NOT set Pipe receiver directories, data directories, or other system paths as monitored directories.
3. ​​**Directory Conflicts**​: Ensure `load_active_listening_fail_dir` does not overlap with `load_active_listening_dirs` or its subdirectories.
4. ​​**Permissions**​: The monitored directory must have write permissions. Files are deleted after successful loading; insufficient permissions may cause duplicate loading.
