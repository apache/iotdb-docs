# Data Export

## 1. Overview
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
| `-t`       | `--target`           | Target directory for the output files. If the path does not exist, it will be created.                                      | ​**Yes** | -                                             |
| `-pfn`     | `--prefix_file_name` | Prefix for the exported file names. For example, `abc` will generate files like `abc_0.tsfile`, `abc_1.tsfile`. | No              | `dump_0.tsfile`                               |
| `-q`       | `--query`            | SQL query command to execute.                                                                                               | No              | -                                             |
| `-timeout` | `--query_timeout`    | Query timeout in milliseconds (ms).                                                                                         | No              | `-1` (Range: -1~Long max=9223372036854775807) |
| `-help`    | `--help`             | Display help information.                                                                                                   | No              | -                                             |

### 2.2 CSV Format
#### 2.2.1 Command

```Shell
# Unix/OS X
> tools/export-data.sh -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>] -t <target_directory> 
               [-pfn <prefix_file_name>] [-dt <datatype>] [-lpf <lines_per_file>] [-tf <time_format>] 
               [-tz <timezone>] [-q <query_command>] [-timeout <query_timeout>]
# Windows
> tools\export-data.bat -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>] -t <target_directory> 
               [-pfn <prefix_file_name>] [-dt <datatype>] [-lpf <lines_per_file>] [-tf <time_format>] 
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
> tools/export-data.sh -ft csv -h 127.0.0.1 -p 6667 -u root -pw root -t /path/export/dir 
              -pfn exported-data.csv -dt true -lpf 1000 -tf "yyyy-MM-dd HH:mm:ss"
              -tz +08:00 -q "SELECT * FROM root.ln" -timeout 20000    
                
# Error Example
> tools/export-data.sh -ft csv -h 127.0.0.1 -p 6667 -u root -pw root
Parse error: Missing required option: t
```
### 2.3 SQL Format
#### 2.3.1 Command
```Shell
# Unix/OS X
> tools/export-data.sh -ft<format> [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
          -t <target_directory> [-pfn <prefix_file_name>] [-aligned <export aligned insert sql>]
          -lpf <lines_per_file> - [-tf <time_format>] [-tz <timezone>] [-q <query_command>] [-timeout <query_timeout>]
      
# Windows
> tools\export-data.bat -ft<format> [-h <host> -p <port> -u <username> -pw <password>] 
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
> tools/export-data.sh -ft sql -h 127.0.0.1 -p 6667 -u root -pw root -t /path/export/dir 
              -pfn exported-data.csv -aligned true -lpf 1000 -tf "yyyy-MM-dd HH:mm:ss"
              -tz +08:00 -q "SELECT * FROM root.ln" -timeout 20000    
                
# Error Example
> tools/export-data.sh -ft sql -h 127.0.0.1 -p 6667 -u root -pw root
Parse error: Missing required option: t
```

### 2.4 TsFile Format

#### 2.4.1 Command

```Shell
# Unix/OS X
> tools/export-data.sh -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
        -t <target_directory> [-pfn <prefix_file_name>] [-q <query_command>] [-timeout <query_timeout>]
      
# Windows
> tools\export-data.bat -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
        -t <target_directory> [-pfn <prefix_file_name>] [-q <query_command>] [-timeout <query_timeout>]
```

#### 2.4.2 TsFile-Specific Parameters

* None

#### 2.4.3 Examples

```Shell
# Valid Example
> tools/export-data.sh -ft tsfile -h 127.0.0.1 -p 6667 -u root -pw root -t /path/export/dir 
              -pfn export-data.tsfile -q "SELECT * FROM root.ln"  -timeout 10000
   
# Error Example
> tools/export-data.sh -ft tsfile -h 127.0.0.1 -p 6667 -u root -pw root
Parse error: Missing required option: t
```

## 3. ExportTsFile Based on Data Subscription

The `export-tsfile.sh/bat` script supported in IoTDB V2.0.4.x can automatically create a data subscription with TsFile as the PayLoad, exporting specified data files into TsFile format.

### 3.1 Command

```Shell
# Unix/OS X
> tools/export-tsfile.sh [-sql_dialect <sql_dialect>] [-h <host>] [-p <port>]
       [-u <username>] [-pw <password>] [-path <path>]  [-start_time <start_time>] [-end_time <end_time>] [-t
       <target_directory>] [-tn <thread_num>] [-help]
      
# Windows
> tools\windows>export-tsfile.bat [-sql_dialect <sql_dialect>] [-h <host>] [-p <port>]
       [-u <username>] [-pw <password>] [-path <path>] [-start_time <start_time>] [-end_time <end_time>] [-t
       <target_directory>] [-tn <thread_num>] [-help]
```

### 3.2 Parameters

| Short          | Full Parameter                | Description                                                            | Required | Default                    |
| -------------------- |-----------------|------------------------------------------------------------------------|----------|----------------------------|
| `-sql_dialect` | `--sql_dialect` | Choose between tree or table model for the source data.                | No       | `tree`                     |
| `-h`           | `--host`        | IP address of the server node where the source data resides.           | No       | `127.0.0.1`                |
| `-p`           | `--port`        | Port number of the source data server.                                 | No       | `6667`                     |
| `-u`           | `--user`        | username                                                               | No       | `root`                     |
| `-pw`          | `--password`    | password                                                               | No       | `root`                     |
| `-t`           | `-target`       | Directory path to save the exported files.                             | No       | `$IOTDB_HOME/tools/target` |
| `-path`        | `--path`        | Sequence path prefix for tree model exports. Windows: wrap paths in "" | No       | `root.**`                  |
| `-start_time`  | `--start_time`  | Beginning timestamp of the data to export                              | No       | -                          |
| `-end_time`    | `--end_time`    | Ending timestamp of the data to export                                 | No       | -                          |
| `-tn`          | `--thread_num`  | Number of parallel threads for export.                                 | No       | -                          |
| `-help`        | `--help`        | Display usage instructions and parameter details.                      |          | -                          |

### 3.3 Examples

```Bash
> tools\windows>export-tsfile.bat -sql_dialect tree -path "root.**"

Starting IoTDB Client Export Script

sequence-root.db-10-2887-1746520919075-1-1-0.tsfile
sequence-root.db-9-2887-1746520891051-1-1-0.tsfile
sequence-root.db-10-2889-1747361763179-1-0-0.tsfile
Export TsFile Count: 3

```
