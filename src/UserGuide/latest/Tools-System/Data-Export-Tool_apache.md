# Data Export

## 1. Overview
The data export tool, export-data.sh (Unix/OS X) or export-data.bat (Windows), located in the tools directory, allows users to export query results from specified SQL statements into CSV, SQL, or TsFile (open-source time-series file format) formats. The specific functionalities are as follows:

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
            <td >TsFile</td> 
            <td>Open-source time-series file format.</td>
      </tr> 
</tbody>
</table>


## 2. Detailed Functionality
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
# Before version V2.0.4.x
> tools\export-data.bat -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>] -t <target_directory> 
               [-pfn <prefix_file_name>] [-dt <datatype>] [-lpf <lines_per_file>] [-tf <time_format>] 
               [-tz <timezone>] [-q <query_command>] [-timeout <query_timeout>]

# V2.0.4.x and later versions           
> tools\windows\export-data.bat -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>] -t <target_directory> 
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
## 2.3 SQL Format
#### 2.3.1 Command
```Shell
# Unix/OS X
> tools/export-data.sh -ft<format> [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
          -t <target_directory> [-pfn <prefix_file_name>] [-aligned <export aligned insert sql>]
          -lpf <lines_per_file> - [-tf <time_format>] [-tz <timezone>] [-q <query_command>] [-timeout <query_timeout>]
      
# Windows
# Before version V2.0.4.x
> tools\export-data.bat -ft<format> [-h <host> -p <port> -u <username> -pw <password>] 
          -t <target_directory> [-pfn <prefix_file_name>  -aligned <export aligned insert sql>  
          -lpf <lines_per_file> -tf <time_format> -tz <timezone> -q <query_command> -timeout <query_timeout>]
          
# V2.0.4.x and later versions          
> tools\windows\export-data.bat -ft<format> [-h <host> -p <port> -u <username> -pw <password>] 
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
# Before version V2.0.4.x
> tools\export-data.bat -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
        -t <target_directory> [-pfn <prefix_file_name>] [-q <query_command>] [-timeout <query_timeout>]
        
# V2.0.4.x and later versions        
> tools\windows\export-data.bat -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
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
