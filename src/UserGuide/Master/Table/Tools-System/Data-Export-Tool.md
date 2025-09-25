# Data Export

## 1. Function Overview

IoTDB supports three methods for data export:

* The data export tool: `export-data.sh/bat` is located in the tools directory, allows users to export query results from specified SQL statements into CSV, SQL, or TsFile (open-source time-series file format) formats. The specific functionalities are as follows:
* ExportTsFile based on data subscription: `export_tsfile.sh/bat` is located in the tools directory and can export specified data files to TsFile format using data subscription.

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
            <td>export_tsfile.sh/bat</td>  
            <td>Open-source time-series file format.</td> 
      </tr>
</tbody>
</table>



## 2. Data Export Tool
### 2.1 Common Parameters
| Short          | Full Parameter           | Description                                                                                                                 | Required        | Default                                       |
| ---------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------- |-----------------------------------------------|
| `-ft`      | `--file_type`        | Export file type: `csv`, `sql`, `tsfile`.                                                                       | ​**Yes** | -                                             |
| `-h`       | `--host`             | Hostname of the IoTDB server.                                                                                               | No              | `127.0.0.1`                                   |
| `-p`       | `--port`             | Port number of the IoTDB server.                                                                                            | No              | `6667`                                        |
| `-u`       | `--username`         | Username for authentication.                                                                                                | No              | `root`                                        |
| `-pw`      | `--password`         | Password for authentication.                                                                                                | No              | `root`                                        |
| `-sql_dialect` | `--sql_dialect`     | Select server model : tree or table  | No                     | tree                           |
| `-db `       | `--database`  | The target database to be exported only takes effect when `-sql_dialect` is of the table type.| Yes when `-sql_dialect = table`| -|
| `-table`|`--table`      | The target table to be exported only takes effect when `-sql_dialect` is of the table type. If the `-q` parameter is specified, this parameter will not take effect. If the export type is tsfile/sql, this parameter is mandatory.| ​ No        | -         |
| `-start_time`  | `--start_time`  |The start time of the data to be exported only takes effect when `-sql_dialect` is of the table type. If `-q` is specified, this parameter will not take effect. The supported time formats are the same as those for the `-tf` parameter.|No           | -                                |
|`-end_time`   |`--end_time`   | The end time of the data to be exported only takes effect when `-sql_dialect` is set to the table type. If `-q` is specified, this parameter will not take effect.| No                                                    | -                                  |
| `-t`       | `--target`           | Target directory for the output files. If the path does not exist, it will be created.                                      | ​**Yes** | -                                             |
| `-pfn`     | `--prefix_file_name` | Prefix for the exported file names. For example, `abc` will generate files like `abc_0.tsfile`, `abc_1.tsfile`. | No              | `dump_0.tsfile`                               |
| `-q`       | `--query`            | SQL query command to execute.                                                                                               | No              | -                                             |
| `-timeout` | `--query_timeout`    | Query timeout in milliseconds (ms).                                                                                         | No              | `-1` (Range: -1~Long max=9223372036854775807) |
| `-help`    | `--help`             | Display help information.                                                                                                   | No              | -                                             |

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

## 3. ExportTsFile Based on Data Subscription

The `export-tsfile.sh/bat` script supported in IoTDB V2.0.4.x can automatically create a data subscription with TsFile as the PayLoad, exporting specified data files into TsFile format.

### 3.1 Command

```Shell
# Unix/OS X
> tools/export-tsfile.sh [-sql_dialect <sql_dialect>] [-h <host>] [-p <port>]
       [-u <username>] [-pw <password>]  [-db <db>] [-table <table>] [-start_time <start_time>] [-end_time <end_time>] [-t
       <target_directory>] [-tn <thread_num>] [-help]
      
# Windows
> tools\windows>export-tsfile.bat [-sql_dialect <sql_dialect>] [-h <host>] [-p <port>]
       [-u <username>] [-pw <password>]  [-db <db>] [-table <table>] [-start_time <start_time>] [-end_time <end_time>] [-t
       <target_directory>] [-tn <thread_num>] [-help]
```

### 3.2 Parameters

| Short          | Full Parameter                | Description                                                                         | Required | Default                    |
| -------------------- |-----------------|-------------------------------------------------------------------------------------|----------|----------------------------|
| `-sql_dialect` | `--sql_dialect` | Choose between tree or table model for the source data.                             | No       | `tree`                     |
| `-h`           | `--host`        | IP address of the server node where the source data resides.                        | No       | `127.0.0.1`                |
| `-p`           | `--port`        | Port number of the source data server.                                              | No       | `6667`                     |
| `-u`           | `--user`        | username                                                                            | No       | `root`                     |
| `-pw`          | `--password`    | password                                                                            | No       | `root`                     |
| `-t`           | `-target`       | Directory path to save the exported files.                                          | No       | `$IOTDB_HOME/tools/target` |
| `-db`          | `-database`     | Database name for table model exports. Supports regex (use `.*` for all databases). | No       | `.*`                       |
| `-table`       | `-table`        | Table name for table model exports. Supports regex (use `.*` for all databases).    | No       | `.*`                       |
| `-start_time`  | `--start_time`  | Beginning timestamp of the data to export                                           | No       | -                          |
| `-end_time`    | `--end_time`    | Ending timestamp of the data to export                                              | No       | -                          |
| `-tn`          | `--thread_num`  | Number of parallel threads for export.                                              | No       | -                          |
| `-help`        | `--help`        | Display usage instructions and parameter details.                                   |          | -                          |

### 3.3 Examples

```Bash
> tools\windows>export-tsfile.bat -sql_dialect table -db database1

Starting IoTDB Client Export Script

sequence-database1-2-2864-1744786663074-1-0-0.tsfile
sequence-database1-1-2864-1744786663116-1-0-0.tsfile
sequence-database1-2-2865-1744786663085-1-0-0.tsfile
sequence-database1-1-2661-1747641489473-1-0-0.tsfile
sequence-database1-1-2865-1744786663118-1-0-0.tsfile
sequence-database1-1-2882-1744855878285-3-0-0.tsfile
sequence-database1-2-2882-1744855878319-3-0-0.tsfile
sequence-database1-2-2661-1747639329126-1-1-0.tsfile
Export TsFile Count: 8

```
