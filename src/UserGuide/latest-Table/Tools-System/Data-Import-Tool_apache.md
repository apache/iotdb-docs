# Data Import

## 1. Functional Overview

IoTDB supports three methods for data import:
- Data Import Tool: Use the `import-data.sh/bat` script in the `tools` directory to manually import CSV, SQL, or TsFile (open-source time-series file format) data into IoTDB.
- `TsFile` Auto-Loading Feature
- Load `TsFile` SQL 

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
            <td rowspan="3">TsFile</td> 
            <td>Can be used for single or batch import of TsFile files into IoTDB</td>
      </tr>
      <tr>
            <td>TsFile Auto-Loading Feature</td>  
            <td>Can automatically monitor a specified directory for newly generated TsFiles and load them into IoTDB</td> 
      </tr>
      <tr>
            <td>Load SQL</td>  
            <td>Can be used for single or batch import of TsFile files into IoTDB</td> 
      </tr>
</tbody>
</table>

- Does not support the Object data type.

## 2. Data Import Tool
### 2.1 Common Parameters

| Short       | Full Parameter     | Description                                                                                                                                                                                      | Required        | Default                                     |
| ------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |---------------------------------------------|
| `-ft`   | `--file_type`  | File type: `csv`, `sql`, `tsfile`.                                                                                                                                                   | ​**Yes** | -                                           |
| `-h`    | `--host`       | IoTDB server hostname.                                                                                                                                                                           | No              | `127.0.0.1`                                 |
| `-p`    | `--port`       | IoTDB server port.                                                                                                                                                                               | No              | `6667`                                      |
| `-u`    | `--username`   | Username.                                                                                                                                                                                        | No              | `root`                                      |
| `-pw`   | `--password`   | Password.                                                                                                                                                                                        | No              | `root`    |
|
|`-sql_dialect`|`--sql_dialect`|Select server model : tree or table | No      | `tree`                                      |
|` -db `|`--database` |​Target database , applies only to `-sql_dialect=table` |Yes when `-sql_dialect = table`  | -                                           |
|`-table` |`--table `|Target table , required for CSV imports in table model | No  | -                                           |
|
| `-s`    | `--source`     | Local path to the file/directory to import. ​​**Supported formats**​: CSV, SQL, TsFile. Unsupported formats trigger error: `The file name must end with "csv", "sql", or "tsfile"!` | ​**Yes** | -                                           |
| `-tn`   | `--thread_num` | Maximum parallel threads                                                                                                                                   | No              | `8` <br> Range: 0 to Integer.Max(2147483647). |
| `-tz`   | `--timezone`   | Timezone (e.g., `+08:00`, `-01:00`).                                                                                                                                                     | No              | System default                              |
| `-help` | `--help`       | Display help (general or format-specific: `-help csv`).                                                                                                                                      | No              | -                                           |

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
# Before version V2.0.4.x 
> tools\import-data.bat -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
        [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
       -s <source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] [-aligned <use the aligned interface>] 
      [-ti <type_infer>] [-tp <timestamp precision (ms/us/ns)>] [-tz <timezone>] [-batch <batch_size>] 
      [-tn <thread_num>]
      
# V2.0.4.x and later versions
> tools\windows\import-data.bat -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
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
# Before version V2.0.4.x
> tools\import-data.bat -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
        [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
        -s<source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] [-tz <timezone>] 
        [-batch <batch_size>] [-tn <thread_num>]
        
# V2.0.4.x and later versions
> tools\windows\import-data.bat -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
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
# Before version V2.0.4.x
> tools\import-data.bat -ft <format> [-sql_dialect<sql_dialect>] -db<database> -table<table> 
         [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
        -s <source> -os <on_success> [-sd <success_dir>] -of <on_fail> [-fd <fail_dir>]
        [-tn <thread_num> ] [-tz <timezone>] [-tp <timestamp precision (ms/us/ns)>]
        
# V2.0.4.x and later versions        
> tools\windows\import-data.bat -ft <format> [-sql_dialect<sql_dialect>] -db<database> -table<table> 
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

## 3. TsFile Auto-Loading

This feature enables IoTDB to automatically monitor a specified directory for new TsFiles and load them into the database without manual intervention.

![](/img/Data-import2.png)

### 3.1 Configuration

Add the following parameters to `iotdb-system.properties` (template: `iotdb-system.properties.template`):

| Parameter                                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Value Range              | Required | Default                     | Hot-Load?             |
| ---------------------------------------------------- |----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------| ---------- | ----------------------------- | ----------------------- |
| `load_active_listening_enable`                 | Enable auto-loading.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `true`/`false`           | Optional | `true`                  | Yes                   |
| `load_active_listening_dirs`                   | Directories to monitor (subdirectories included). Multiple paths separated by commas. <br>Note: In the table model, the directory name where the file is located will be used as the database.                                                                                                                                                                                                                                                                                               | String                   | Optional | `ext/load/pending`      | Yes                   |
| `load_active_listening_fail_dir`               | Directory to store failed TsFiles.  Only can set one.                                                                                                                                                                                                                                                                                                                                                                                                                                        | String                   | Optional | `ext/load/failed`       | Yes                   |
| `load_active_listening_max_thread_num`         | Maximum Threads for TsFile Loading Tasks:The default value for this parameter, when commented out, is max(1, CPU cores / 2). If the value set by the user falls outside the range [1, CPU cores / 2], it will be reset to the default value of max(1, CPU cores / 2).                                                                                                                                                                                                                        | `1` to `Long.MAX_VALUE`  | Optional | `max(1, CPU_CORES / 2)` | No (restart required) |
| `load_active_listening_check_interval_seconds` | Active Listening Polling Interval (in seconds):The active listening feature for TsFiles is implemented through polling the target directory. This configuration specifies the time interval between two consecutive checks of the `load_active_listening_dirs`. After each check, the next check will be performed after `load_active_listening_check_interval_seconds` seconds. If the polling interval set by the user is less than 1, it will be reset to the default value of 5 seconds. | `1` to `Long.MAX_VALUE`  | Optional | `5`                     | No (restart required) |

### 3.2 Examples

```bash
load_active_listening_dir/
├─sensors/
│  ├─temperature/
│  │   └─temperature-table.TSFILE

```

- Table model TsFile
  - `temperature-table.TSFILE`: will be imported into the `temperature` database (because it is located in the `sensors/temperature/` directory)


### 3.3 Notes

1. ​​**Mods Files**​: If TsFiles have associated `.mods` files, move `.mods` files to the monitored directory ​**before** their corresponding TsFiles. Ensure `.mods` and TsFiles are in the same directory.
2. ​​**Restricted Directories**​: Do NOT set Pipe receiver directories, data directories, or other system paths as monitored directories.
3. ​​**Directory Conflicts**​: Ensure `load_active_listening_fail_dir` does not overlap with `load_active_listening_dirs` or its subdirectories.
4. ​​**Permissions**​: The monitored directory must have write permissions. Files are deleted after successful loading; insufficient permissions may cause duplicate loading.


## 4. Load SQL

IoTDB supports importing one or multiple TsFile files containing time series into another running IoTDB instance directly via SQL execution through the CLI.

### 4.1 Command

```SQL
load '<path/dir>' with (
    'attribute-key1'='attribute-value1',
    'attribute-key2'='attribute-value2',
)
```

* `<path/dir>` : The path to a TsFile or a folder containing multiple TsFiles.
* `<attributes>`: Optional parameters, as described below.

| Key                            | Key Description                                                                                                                                                                                                                                                                                                                          | Value Type  | Value Range                    | Value is Required | Default Value              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|--------------------------------|-------------------|----------------------------|
| `database-level`               | When the database corresponding to the TsFile does not exist, the database hierarchy level can be specified via the ` database-level` parameter. The default is the level set in `iotdb-common.properties`. For example, setting level=1 means the prefix path of level 1 in all time series in the TsFile will be used as the database. | Integer     | `[1: Integer.MAX_VALUE]`       | No                | 1                          |
| `on-success`                   | Action for successfully loaded TsFiles: `delete` (delete the TsFile after successful import) or `none` (retain the TsFile in the source folder).                                                                                                                                                                                         | String      | `delete / none`                | No                 | delete                     |
| `model`                        | Specifies whether the TsFile uses the `table` model or `tree` model.                                                                                                                                                                                                                                                                     | String      | `tree / table`                 | No                  | Aligns with `-sql_dialect` |
| `database-name`                | Table model only: Target database for import. Automatically created if it does not exist. The database-name must not include the `root.` prefix (an error will occur if included).                                                                                                                                                       | String      | `-`                            | No                  | null                       |
| `convert-on-type-mismatch`     | Whether to perform type conversion during loading if data types in the TsFile mismatch the target schema.                                                                                                                                                                                                                                | Boolean     | `true / false`                 | No                  | true                       |
| `verify`                       | Whether to validate the schema before loading the TsFile.                                                                                                                                                                                                                                                                                | Boolean     | `true / false`                 | No                  | true                       |
| `tablet-conversion-threshold`  | Size threshold (in bytes) for converting TsFiles into tablet format during loading. Default: `-1` (no conversion for any TsFile).                                                                                                                                                                                                        | Integer     | `[-1,0 :`​`Integer.MAX_VALUE]` | No                 | -1                         |
| `async`                        | Whether to enable asynchronous loading. If enabled, TsFiles are moved to an active-load directory and loaded into the `database-name` asynchronously.                                                                                                                                                                                    | Boolean     | `true / false`                 | No                 | false                      |

### 4.2 Example

```SQL
-- Create target database: database2
IoTDB> create database database2
Msg: The statement is executed successfully.

IoTDB> use database2
Msg: The statement is executed successfully.

IoTDB:database2> show tables details
+---------+-------+------+-------+
|TableName|TTL(ms)|Status|Comment|
+---------+-------+------+-------+
+---------+-------+------+-------+
Empty set.

-- Import tsfile by excuting load sql 
IoTDB:database2> load '/home/dump0.tsfile' with ( 'on-success'='none', 'database-name'='database2')
Msg: The statement is executed successfully.

-- Verify whether the import was successful
IoTDB:database2> select * from table2
+-----------------------------+------+--------+---------+-----------+--------+------+-----------------------------+
|                         time|region|plant_id|device_id|temperature|humidity|status|                 arrival_time|
+-----------------------------+------+--------+---------+-----------+--------+------+-----------------------------+
|2024-11-30T00:00:00.000+08:00|  上海|    3002|      101|       90.0|    35.2|  true|                         null|
|2024-11-29T00:00:00.000+08:00|  上海|    3001|      101|       85.0|    35.1|  null|2024-11-29T10:00:13.000+08:00|
|2024-11-27T00:00:00.000+08:00|  北京|    1001|      101|       85.0|    35.1|  true|2024-11-27T16:37:01.000+08:00|
|2024-11-29T11:00:00.000+08:00|  上海|    3002|      100|       null|    45.1|  true|                         null|
|2024-11-28T08:00:00.000+08:00|  上海|    3001|      100|       85.0|    35.2| false|2024-11-28T08:00:09.000+08:00|
|2024-11-26T13:37:00.000+08:00|  北京|    1001|      100|       90.0|    35.1|  true|2024-11-26T13:37:34.000+08:00|
+-----------------------------+------+--------+---------+-----------+--------+------+-----------------------------+
```
