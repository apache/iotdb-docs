# Data Export

## 1. Function Overview

IoTDB supports two methods for data export:

* Data Export Tool: `export-data.sh/bat` is located in the `tools` directory. It can export the query results of specified SQL statements into CSV, SQL, and TsFile (open-source time-series file format) files.
* PIPE Framework-based TsFileBackup: `tsfile-backup.sh/bat` is located in the `tools` directory. It can export specified data files into TsFile format using the PIPE framework.

<table style="text-align: left;">
  <tbody>
     <tr>   <th>File Format</th>
            <th>IoTDB Tool</th>        
            <th>Description</th>
      </tr>
      <tr>
            <td>CSV</td>  
            <td rowspan="3">export-data.sh/bat</td> 
            <td>Plain text format for storing structured data. Must follow the CSV format specified below.</td> 
      </tr>
      <tr>
            <td>SQL</td>   
            <td>File containing custom SQL statements.</td> 
      </tr>
       <tr>
            <td rowspan="2">TsFile</td> 
            <td>Open-source time-series file format.</td>
      </tr> 
      <tr>
            <td>tsfile-backup.sh/bat</td>
            <td>An open-source time-series data file format,and this script supports the Object data type.</td>
      </tr>
</tbody>
</table>


## 2. Data Export Tool
### 2.1 Common Parameters
| Short          | Full Parameter           | Description                                                                                                                                                                                                                                | Required        | Default                                       |
|----------------|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| ----------------- |-----------------------------------------------|
| `-ft`          | `--file_type`            | Export file type: `csv`, `sql`, `tsfile`.                                                                                                                                                                                                  | ​**Yes** | -                                             |
| `-h`           | `--host`                 | Hostname of the IoTDB server.                                                                                                                                                                                                              | No              | `127.0.0.1`                                   |
| `-p`           | `--port`                 | Port number of the IoTDB server.                                                                                                                                                                                                           | No              | `6667`                                        |
| `-u`           | `--username`             | Username for authentication.                                                                                                                                                                                                               | No              | `root`                                        |
| `-pw`          | `--password`             | Password for authentication. Supported for hidden input since V2.0.9.1                                                                                                                                                                     | No              | `TimechoDB@2021`(Before V2.0.6 it is root)    |
| `-sql_dialect` | `--sql_dialect`          | Select server model : tree or table                                                                                                                                                                                                        | No                     | tree                                          |
| `-db `         | `--database`             | The target database to be exported only takes effect when `-sql_dialect` is of the table type.                                                                                                                                             | Yes when `-sql_dialect = table`| -                                             |
| `-table`       | `--table`                | The target table to be exported only takes effect when `-sql_dialect` is of the table type. If the `-q` parameter is specified, this parameter will not take effect. If the export type is tsfile/sql, this parameter is mandatory.        | ​ No        | -                                             |
| `-start_time`  | `--start_time`           | The start time of the data to be exported only takes effect when `-sql_dialect` is of the table type. If `-q` is specified, this parameter will not take effect. The supported time formats are the same as those for the `-tf` parameter. |No           | -                                             |
| `-end_time`    | `--end_time`             | The end time of the data to be exported only takes effect when `-sql_dialect` is set to the table type. If `-q` is specified, this parameter will not take effect.                                                                         | No                                                    | -                                             |
| `-t`           | `--target`               | Target directory for the output files. If the path does not exist, it will be created.                                                                                                                                                     | ​**Yes** | -                                             |
| `-pfn`         | `--prefix_file_name`     | Prefix for the exported file names. For example, `abc` will generate files like `abc_0.tsfile`, `abc_1.tsfile`.                                                                                                                            | No              | `dump_0.tsfile`                               |
| `-q`           | `--query`                | SQL query command to execute. Starting from v2.0.8, semicolons in SQL statements are automatically removed, and query execution proceeds normally.                                                                                         | No              | -                                                                                                   |
| `-timeout`     | `--query_timeout`        | Query timeout in milliseconds (ms).                                                                                                                                                                                                        | No              | `-1` (before v2.0.8)<br>`Long.MAX_VALUE` (v2.0.8 and later)<br>(Range: `-1~Long.MAX_VALUE`) |
| `-help`        | `--help`                 | Display help information.                                                                                                                                                                                                                  | No              | -                                             |
| `-usessl`      | `--use_ssl`              | Use SSL protocol. Supported since V2.0.9.1                                                                                                                                                                                                 | No      | -                                    |
| `-ts`          | `--trust_store`          | Trust store. Supports hidden input. Supported since V2.0.9.1                                                                                                                                                                               | No      | -                                    |
| `-tpw`         | `--trust_store_password` | Trust store password. Supports hidden input. Supported since V2.0.9.1                                                                                                                                                                      | No        | -                                    |

### 2.2 CSV Format
#### 2.2.1 Command

```Shell
# Unix/OS X
> tools/export-data.sh -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-start_time<start_time>] [-end_time<end_time>] [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
                -t <target_directory> [-pfn <prefix_file_name>] [-dt <datatype>] [-lpf <lines_per_file>] [-tf <time_format>] 
               [-tz <timezone>] [-q <query_command>] [-timeout <query_timeout>]
# Windows
# Before version V2.0.4.x
> tools\export-data.bat -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-start_time<start_time>] [-end_time<end_time>] [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
                -t <target_directory> [-pfn <prefix_file_name>] [-dt <datatype>] [-lpf <lines_per_file>] [-tf <time_format>] 
               [-tz <timezone>] [-q <query_command>] [-timeout <query_timeout>]
               
# V2.0.4.x and later versions
> tools\windows\export-data.bat -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-start_time<start_time>] [-end_time<end_time>] [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
                -t <target_directory> [-pfn <prefix_file_name>] [-dt <datatype>] [-lpf <lines_per_file>] [-tf <time_format>] 
               [-tz <timezone>] [-q <query_command>] [-timeout <query_timeout>]
```
#### 2.2.2 CSV-Specific Parameters

| Short      | Full Parameter         | Description                                                                                                                                                                                         | Required | Default                                  |
| ------------ | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |------------------------------------------|
| `-dt`  | `--datatype`       | Whether to include data types in the CSV file header (`true` or `false`).                                                                                                                   | No       | `false`                                  |
| `-lpf` | `--lines_per_file` | Number of rows per exported file.                                                                                                                                                                   | No       | `10000` (Range：0～Integer.Max=2147483647) |
| `-tf`  | `--time_format`    | Time format for the CSV file. Options: 1) Timestamp (numeric, long), 2) ISO8601 (default), 3) Custom pattern (e.g., `yyyy-MM-dd HH:mm:ss`). SQL file timestamps are unaffected by this setting. | No       | `ISO8601`                                |
| `-tz`  | `--timezone`       | Timezone setting (e.g., `+08:00`, `-01:00`).                                                                                                                                                | No       | System default                           |

#### 2.2.3 Examples

```Shell
# Valid Example
> export-data.sh -ft csv -sql_dialect table -t /path/export/dir -db database1 -q "select * from table1"

# Error Example
> export-data.sh -ft csv -sql_dialect table -t /path/export/dir -q "select * from table1"
Parse error: Missing required option: db
```
### 2.3 SQL Format
#### 2.3.1 Command
```Shell
# Unix/OS X
> tools/export-data.sh -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-start_time<start_time>] [-end_time<end_time>] [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
          -t <target_directory> [-pfn <prefix_file_name>] [-aligned <export aligned insert sql>]
          -lpf <lines_per_file> - [-tf <time_format>] [-tz <timezone>] [-q <query_command>] [-timeout <query_timeout>]
      
# Windows
# Before version V2.0.4.x 
> tools\export-data.bat -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-start_time<start_time>] [-end_time<end_time>] [-h <host> -p <port> -u <username> -pw <password>] 
          -t <target_directory> [-pfn <prefix_file_name>  -aligned <export aligned insert sql>  
          -lpf <lines_per_file> -tf <time_format> -tz <timezone> -q <query_command> -timeout <query_timeout>]
          
# V2.0.4.x and later versions
> tools\windows\export-data.bat -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-start_time<start_time>] [-end_time<end_time>] [-h <host> -p <port> -u <username> -pw <password>] 
          -t <target_directory> [-pfn <prefix_file_name>  -aligned <export aligned insert sql>  
          -lpf <lines_per_file> -tf <time_format> -tz <timezone> -q <query_command> -timeout <query_timeout>]
```
#### 2.3.2 SQL-Specific Parameters

| Short          | Full Parameter         | Description                                                                                                                                                                                         | Required | Default        |
| ---------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------- |
| `-aligned` | `--use_aligned`    | Whether to export as aligned SQL format (`true` or `false`).                                                                                                                                | No       | `true`     |
| `-lpf`     | `--lines_per_file` | Number of rows per exported file.                                                                                                                                                                   | No       | `10000` (Range：0～Integer.Max=2147483647)   |
| `-tf`      | `--time_format`    | Time format for the CSV file. Options: 1) Timestamp (numeric, long), 2) ISO8601 (default), 3) Custom pattern (e.g., `yyyy-MM-dd HH:mm:ss`). SQL file timestamps are unaffected by this setting. | No       | `ISO8601`  |
| `-tz`      | `--timezone`       | Timezone setting (e.g., `+08:00`, `-01:00`).                                                                                                                                                | No       | System default |

#### 2.3.3 Examples
```Shell
# Valid Example
> export-data.sh -ft sql -sql_dialect table -t /path/export/dir -db database1 -start_time 1

# Error Example
> export-data.sh -ft sql -sql_dialect table -t /path/export/dir -start_time 1
Parse error: Missing required option: db
```

### 2.4 TsFile Format

#### 2.4.1 Command

```Shell
# Unix/OS X
> tools/export-data.sh -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-start_time<start_time>] [-end_time<end_time>] [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
        -t <target_directory> [-pfn <prefix_file_name>] [-q <query_command>] [-timeout <query_timeout>]
      
# Windows
# Before version V2.0.4.x 
> tools\export-data.bat -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-start_time<start_time>] [-end_time<end_time>] [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
        -t <target_directory> [-pfn <prefix_file_name>] [-q <query_command>] [-timeout <query_timeout>]
        
# V2.0.4.x and later versions
> tools\windows\export-data.bat -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-start_time<start_time>] [-end_time<end_time>] [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
        -t <target_directory> [-pfn <prefix_file_name>] [-q <query_command>] [-timeout <query_timeout>]
```

#### 2.4.2 TsFile-Specific Parameters

* None

#### 2.4.3 Examples

```Shell
# Valid Example
> /tools/export-data.sh -ft tsfile -sql_dialect table -t /path/export/dir -db database1 -start_time 0

# Error Example
> /tools/export-data.sh -ft tsfile -sql_dialect table -t /path/export/dir -start_time 0
Parse error: Missing required option: db
```


## 3. TsFileBackup Based on PIPE Framework
Since **V2.0.9.2**, IoTDB supports the `tsfile-backup.sh/bat` script. This script can automatically generate and send the `CREATE PIPE` SQL command to the server, exporting specified data files to TsFile format.

**Notes:**
1. **To use this script, contact the Timecho Team to obtain the customized installation package `timechodb-<version>-extension`.**
2. **This script supports exporting Object-type data to TsFile files.**


### 3.1 Execution Commands
```Shell
# Unix/OS X
> tools/tsfile-backup.sh [-sql_dialect <sql_dialect>] [-h <host>] [-p <port>]
       [-u <username>] [-pw <password>] [-path <path>] [-db <db>] [-table
       <table>] [-s <start_time>] [-e <end_time>] [-t <target_directory>] 
       [-th <target_host>] [-tu <target_host_user>] [-tp <target_host_port>]
       [--rate_limit] [--plugin_jar] [-help]

# Windows
> tools\windows\tsfile-backup.bat [-sql_dialect <sql_dialect>] [-h <host>] [-p <port>]
       [-u <username>] [-pw <password>] [-path <path>]  [-db <db>] [-table
       <table>] [-s <start_time>] [-e <end_time>] [-t <target_directory>] 
       [-th <target_host>] [-tu <target_host_user>] [-tp <target_host_port>]
       [--rate_limit] [--plugin_jar] [-help]
```


### 3.2 Script Parameters
| Abbreviation | Full Name          | Description                                                                                                 | Required | Default         |
| ------------ | ------------------ | ----------------------------------------------------------------------------------------------------------- | -------- | --------------- |
| `-sql_dialect` | `--sql_dialect`    | Specifies the data model type. Valid values: `tree` (Tree Model) or `table` (Table Model).                  | Yes      | -               |
| `-h`         | `--host`           | Local host address (IP of the IoTDB instance where the data resides).                                        | No       | `127.0.0.1`     |
| `-p`         | `--port`           | Port number for the IoTDB RPC service.                                                                      | No       | `6667`          |
| `-u`         | `--user`           | Username for IoTDB authentication.                                                                         | No       | `root`          |
| `-pw`        | `--password`       | Password for IoTDB authentication (hidden input supported).                                                 | No       | `root`          |
| `-t`         | `--target`         | Export target directory. In SCP mode, this is an absolute physical path on the remote server. TsFile and associated Object directories will be exported here. | Yes | - |
| `-db`        | `--database`       | Database name (optional for Table Model).                                                                   | No       | `.*`            |
| `-table`     | `--table`          | Table name (optional for Table Model).                                                                      | No       | `.*`            |
| `-s`         | `--start_time`     | Start time (ISO8601 format e.g. `2026-01-01T00:00:00` or millisecond timestamp). Only data from this time onwards is exported. | No | - |
| `-e`         | `--end_time`       | End time (same format as above). Only data before this time is exported.                                    | No       | -               |
| `-th`        | `--target_host`    | Remote target host IP. If specified, the script automatically configures Pipe to use SCP for data transfer. | No       | -               |
| `-tu`        | `--target_host_user` | Username for SSH/SCP login to the remote server.                                                           | No       | -               |
| `-tpw`       | `--target_host_pw` | Password for remote authentication (hidden input supported).                                                | No       | -               |
| `-tp`        | `--target_host_port` | Remote SSH port.                                                                                           | No       | `22`            |
| `--rate_limit` | `--rate_limit`     | Transfer rate limit (unit: Bytes/s) to prevent excessive bandwidth usage.                                   | No       | -               |
| `--plugin_jar` | `--plugin_jar`     | Path to the Pipe plugin JAR file.                                                                           | No       | -               |
| `-help`      | `--help`           | Show help information.                                                                                      | No       | -               |


### 3.3 Execution Examples

Example 1: SCP Remote Export (Send Data to Another Server)

```Bash
./tsfile-backup.sh -sql_dialect table -db test_db -t /remote/archive/ -th 192.168.1.100 -tu backup_user -tpw ComplexPass123!
```

Example 2: Remote Object Data Export with Rate Limiting

```Bash
./tsfile-backup.sh -sql_dialect table -t /mnt/backup/ -th 10.0.0.5 -tu iot_admin -tpw Admin@2026 --rate_limit 5242880
```

Example 3: Specify Pipe Plugin JAR Directory

```Bash
./tsfile-backup.sh -sql_dialect table -db test -table .* -tu luoluoyuyu -tpw -t /tmp/backup --plugin_jar /local/lib/tsfile-remote-sink-2.0.8-SNAPSHOT-jar-with-dependencies.jar
```
