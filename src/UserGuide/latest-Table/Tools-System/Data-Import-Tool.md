# Data Import

## 1. Functional Overview
The data import tool `import-data.sh/bat` is located in the `tools` directory and can import data in ​CSV, ​SQL, and ​TsFile (an open-source time-series file format) into ​IoTDB. Its specific functionalities are as follows:

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
            <td>TsFile</td> 
            <td>Can be used for single or batch import of TsFile files into IoTDB</td>
      </tr> 
</tbody>
</table>

## 2. Detailed Features
### 2.1 Common Parameters

| Short       | Full Parameter     | Description                                                                                                                                                                                      | Required        | Default                                       |
| ------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |-----------------------------------------------|
| `-ft`   | `--file_type`  | File type: `csv`, `sql`, `tsfile`.                                                                                                                                                   | ​**Yes** | -                                             |
| `-h`    | `--host`       | IoTDB server hostname.                                                                                                                                                                           | No              | `127.0.0.1`                                   |
| `-p`    | `--port`       | IoTDB server port.                                                                                                                                                                               | No              | `6667`                                        |
| `-u`    | `--username`   | Username.                                                                                                                                                                                        | No              | `root`                                        |
| `-pw`   | `--password`   | Password.                                                                                                                                                                                        | No              | `root`                                        |
|
|`-sql_dialect`|`--sql_dialect`|Select server model : tree or table | No      | `tree` |
|` -db `|`--database` |​Target database , applies only to `-sql_dialect=table` |Yes when `-sql_dialect = table`  | - |
|`-table` |`--table `|Target table , required for CSV imports in table model | No  | - |
|
| `-s`    | `--source`     | Local path to the file/directory to import. ​​**Supported formats**​: CSV, SQL, TsFile. Unsupported formats trigger error: `The file name must end with "csv", "sql", or "tsfile"!` | ​**Yes** | -                                             |
| `-tn`   | `--thread_num` | Maximum parallel threads                                                                                                                                   | No              | `8` <br> Range: 0 to Integer.Max(2147483647). |
| `-tz`   | `--timezone`   | Timezone (e.g., `+08:00`, `-01:00`).                                                                                                                                                     | No              | System default                                |
| `-help` | `--help`       | Display help (general or format-specific: `-help csv`).                                                                                                                                      | No              | -                                             |

###  2.2 CSV Format 

#### 2.2.1 Command 
```Shell
# Unix/OS X
> tools/import-data.sh -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table> 
     [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
       -s <source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] [-aligned <use the aligned interface>] 
      [-ti <type_infer>] [-tp <timestamp precision (ms/us/ns)>] [-tz <timezone>] [-batch <batch_size>] 
      [-tn <thread_num>]
      
# Windows
> tools\import-data.bat -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
        [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
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
> tools/import-data.sh -ft csv -sql_dialect table -s ./csv/dump0_0.csv  -db database1 -table table1

# Error Example
> tools/import-data.sh -ft csv -sql_dialect table -s ./csv/dump0_1.csv  -table table1
Parse error: Missing required option: db

> tools/import-data.sh -ft csv -sql_dialect table -s ./csv/dump0_1.csv -db database1 -table table5
There are no tables or the target table table5 does not exist
```

#### 2.2.4 Import Notes

1. CSV Import Specifications

- Special Character Escaping Rules: If a text-type field contains special characters (e.g., commas `,`), they must be escaped using a backslash (`\`).
- Supported Time Formats: `yyyy-MM-dd'T'HH:mm:ss`, `yyyy-MM-dd HH:mm:ss`, or `yyyy-MM-dd'T'HH:mm:ss.SSSZ`.
- Timestamp Column Requirement: The timestamp column must be the first column in the data file.  

2. CSV File Example

```sql
time,region,device,model,temperature,humidity
1970-01-01T08:00:00.001+08:00,"SH","101","F",90.0,35.2
1970-01-01T08:00:00.002+08:00,"SH","101","F",90.0,34.8
```


###  2.3 SQL Format 

####  2.3.1 Command 

```Shell
# Unix/OS X
> tools/import-data.sh -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table> 
         [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
        -s<source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] [-tz <timezone>] 
        [-batch <batch_size>] [-tn <thread_num>]
      
# Windows
> tools\import-data.bat -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
        [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
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
> tools/import-data.sh -ft sql -sql_dialect table -s ./sql/dump0_0.sql -db database1 

# Error Example
> tools/import-data.sh -ft sql -sql_dialect table -s ./sql/dump1_1.sql -db database1
Source file or directory ./sql/dump1_1.sql does not exist

# When the ​target table exists but metadata is incompatible or ​data is malformed, the system will generate a .failed file and log error details. 
# Log Example
Fail to insert measurements '[column.name]' caused by [data type is not consistent, input '[column.value]', registered '[column.DataType]']
```
###  2.4 TsFile Format 

#### 2.4.1 Command 

```Shell
# Unix/OS X
> tools/import-data.sh -ft <format> [-sql_dialect<sql_dialect>] -db<database> -table<table> 
         [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
        -s <source> -os <on_success> [-sd <success_dir>] -of <on_fail> [-fd <fail_dir>]
        [-tn <thread_num> ] [-tz <timezone>] [-tp <timestamp precision (ms/us/ns)>]
      
# Windows
> tools\import-data.bat -ft <format> [-sql_dialect<sql_dialect>] -db<database> -table<table> 
         [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
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
> tools/import-data.sh -ft tsfile -sql_dialect table -s ./tsfile -db database1 -os none -of none

# Error Example
> tools/import-data.sh -ft tsfile -sql_dialect table -s ./tsfile -db database1 
Parse error: Missing required options: os, of
```
