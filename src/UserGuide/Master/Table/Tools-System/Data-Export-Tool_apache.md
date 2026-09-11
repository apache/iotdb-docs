# Data Export

## 1. Function Overview

IoTDB supports two methods for data export:

* Data Export Tool: `export-data.sh/bat` is located in the `tools` directory and can export query results of specified SQL statements into CSV, SQL, and TsFile (open-source time-series file format) formats.
* Copy SQL Export to TsFile: Write query results back to a TsFile at a specified path via SQL.

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
            <td>Copy SQL</td>
            <td>Open-source time-series file format.</td>
      </tr>
</tbody>
</table>

## 2. Data Export Tool
### 2.1 Common Parameters
| Short          | Full Parameter           | Description                                                                                                                                                                                                                                | Required        | Default                                      |
|----------------|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| ----------------- |----------------------------------------------|
| `-ft`          | `--file_type`            | Export file type: `csv`, `sql`, `tsfile`.                                                                                                                                                                                                  | ​**Yes** | -                                            |
| `-h`           | `--host`                 | Hostname of the IoTDB server.                                                                                                                                                                                                              | No              | `127.0.0.1`                                  |
| `-p`           | `--port`                 | Port number of the IoTDB server.                                                                                                                                                                                                           | No              | `6667`                                       |
| `-u`           | `--username`             | Username for authentication.                                                                                                                                                                                                               | No              | `root`                                       |
| `-pw`          | `--password`             | Password for authentication. Supported for hidden input since V2.0.10                                                                                                                                                                                                               | No              | `root`                                        |
| `-sql_dialect` | `--sql_dialect`          | Select server model : tree or table                                                                                                                                                                                                        | No                     | tree                                         |
| `-db `         | `--database`             | The target database to be exported only takes effect when `-sql_dialect` is of the table type.                                                                                                                                             | Yes when `-sql_dialect = table`| -                                            |
| `-table`       | `--table`                | The target table to be exported only takes effect when `-sql_dialect` is of the table type. If the `-q` parameter is specified, this parameter will not take effect. If the export type is tsfile/sql, this parameter is mandatory.        | ​ No        | -                                            |
| `-start_time`  | `--start_time`           | The start time of the data to be exported only takes effect when `-sql_dialect` is of the table type. If `-q` is specified, this parameter will not take effect. The supported time formats are the same as those for the `-tf` parameter. |No           | -                                            |
| `-end_time`    | `--end_time`             | The end time of the data to be exported only takes effect when `-sql_dialect` is set to the table type. If `-q` is specified, this parameter will not take effect.                                                                         | No                                                    | -                                            |
| `-t`           | `--target`               | Target directory for the output files. If the path does not exist, it will be created.                                                                                                                                                     | ​**Yes** | -                                            |
| `-pfn`         | `--prefix_file_name`     | Prefix for the exported file names. For example, `abc` will generate files like `abc_0.tsfile`, `abc_1.tsfile`.                                                                                                                            | No              | `dump_0.tsfile`                              |
| `-q`           | `--query`                | SQL query command to execute. Starting from v2.0.8, semicolons in SQL statements are automatically removed, and query execution proceeds normally.                                                                                         | No              | -                                                                                           |
| `-timeout`     | `--query_timeout`        | Query timeout in milliseconds (ms).                                                                                                                                                                                                        | No              | `-1` (before v2.0.8)<br>`Long.MAX_VALUE` (v2.0.8 and later)<br>(Range: `-1~Long.MAX_VALUE`) |
| `-help`        | `--help`                 | Display help information.                                                                                                                                                                                                                  | No              | -                                            |
| `-usessl`      | `--use_ssl`              | Use SSL protocol. Supported since V2.0.10                                                                                                                                                                                              | No      | -                                    |
| `-ts`          | `--trust_store`          | Trust store. Supports hidden input. Supported since V2.0.10                                                                                                                                                                            | No      | -                                    |
| `-tpw`         | `--trust_store_password` | Trust store password. Supports hidden input. Supported since V2.0.10                                                                                                                                                                   | No        | -                                    |

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
## 2.3 SQL Format
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

## 3. Copy SQL

> **Note: This feature is supported since V2.0.11.**

### 3.1 Command

```SQL
// ---------------------------------------- Copy Statement ---------------------------------------------------------
copyToStatement
    : COPY '(' query ')' TO fileName=string ((WITH)? copyToStatementOptions)?
    | COPY tableName=qualifiedName ('(' tableColumns=identifierList ')')? TO fileName=string ((WITH)? copyToStatementOptions)?
    ;

copyToStatementOptions
    : '(' copyToStatementOption (',' copyToStatementOption)* ')'
    ;

copyToStatementOption
    : FORMAT identifier
    | TABLE identifier
    | TAGS '(' identifierList ')'
    | TIME identifier
    | MEMORY_THRESHOLD memory=INTEGER_VALUE
    ;
```

#### Parameters

| Name | Description | Default |
|---|---|---|
| FORMAT | Export format. Currently only TsFile is supported. | TsFile |
| TABLE | Specifies the table name in the generated TsFile. | If the query SQL involves only one table, that table name is used; otherwise, `default` is used. |
| TIME | Specifies which column in the result set is used as the TIME column.<br>When manually specified: an error is reported if the column type is not TIMESTAMP or the specified column cannot be found.<br>When not manually specified: an error is also reported if a column named `time` exists but its type is not TIMESTAMP.<br>The time column is constructed with the following priority:<br>1. The column with the same name as the time column of the single table involved in the query<br>2. The column named "time" with the TIMESTAMP type as the time column<br>3. Use the current number of written rows for the corresponding device as time to generate the time column, with the column name "time" | - |
| TAGS | Specifies which columns are TAG columns. When there are multiple TAG columns, the order in the final generated table is consistent with the specified order.<br>When manually specified: an error is reported if a column does not exist, a column type is not STRING, or duplicate column names exist.<br>If the query involves only one table and all tag columns of the table can be found in the query result set, they are inferred as the tag columns of that table; otherwise, the default value is an empty list, meaning all columns except the TIME column are treated as FIELD columns | Empty list |
| MEMORY_THRESHOLD | Used for memory control when generating the TsFile (unit: byte). An error is reported when the manually specified value is less than or equal to 0. | 32MB |

#### Result Set

| Column | Data Type | Description |
|---|---|---|
| path | STRING | Absolute path of the generated target file |
| row_count | INT64 | Total number of written rows |
| device_count | INT64 | Number of generated devices |
| size_in_bytes | INT64 | Size of the generated target file |
| table_name | STRING | Table name in the target file. If it is auto-generated, it will be marked with `(auto_gen)`. |
| time_column | STRING | Name of the time column of the table in the target file. If it is auto-generated, it will be marked with `(auto_gen)`. |
| tag_columns | STRING | Names of the tag columns of the table in the target file, separated by `,`. |

#### Other Notes

* File generation location:
  * If a file name is specified, the generated TsFile is saved under `${dn_data_dirs}/copy_to` of the DataNode directly connected to the client. When multiple directories are configured, the file is generated according to the strategy of the configuration item `dn_multi_dir_strategy`.
  * If a path is specified, the file is saved under the specified path.
* Possible exceptions during execution:
  * An error is reported when out-of-order timestamps exist while writing to the TsFile according to the given schema
  * An error is reported when the file name is invalid or the target file already exists
  * Duplicate column names exist in the query result
  * Insufficient disk space

### 3.2 Examples

Taking table1 in the [Sample Data](../Reference/Sample-Data.md) as an example

1. Export all data in table1 to the file copysql1.tsfile via a select statement

```SQL
IoTDB:database1> copy (select * from table1) to 'copysql1.tsfile'
+-----------------------------------------------------+---------+------------+-------------+----------+-----------+-----------------------------+
|                                                 path|row_count|device_count|size_in_bytes|table_name|time_column|                  tag_columns|
+-----------------------------------------------------+---------+------------+-------------+----------+-----------+-----------------------------+
|    /iotdb/data/datanode/data/copy_to/copysql1.tsfile|       18|           6|         4636|    table1|       time|[region, plant_id, device_id]|
+-----------------------------------------------------+---------+------------+-------------+----------+-----------+-----------------------------+
Total line number = 1
It costs 0.336s
```

2. Export all data in table1 to the file copysql2.tsfile via the table name

```SQL
IoTDB:database1> copy table1 to 'copysql2.tsfile'
+-----------------------------------------------------+---------+------------+-------------+----------+-----------+-----------------------------+
|                                                 path|row_count|device_count|size_in_bytes|table_name|time_column|                  tag_columns|
+-----------------------------------------------------+---------+------------+-------------+----------+-----------+-----------------------------+
|    /iotdb/data/datanode/data/copy_to/copysql2.tsfile|       18|           6|         4636|    table1|       time|[region, plant_id, device_id]|
+-----------------------------------------------------+---------+------------+-------------+----------+-----------+-----------------------------+
Total line number = 1
It costs 0.048s
```

3. Export part of the data in table1 to the file copysql3.tsfile via the table name (columns)

```SQL
IoTDB:database1> copy table1 (device_id,temperature) to 'copysql3.tsfile'
+-----------------------------------------------------+---------+------------+-------------+----------+--------------+-----------+
|                                                 path|row_count|device_count|size_in_bytes|table_name|   time_column|tag_columns|
+-----------------------------------------------------+---------+------------+-------------+----------+--------------+-----------+
|    /iotdb/data/datanode/data/copy_to/copysql3.tsfile|       18|           1|          558|    table1|time(auto_gen)|         []|
+-----------------------------------------------------+---------+------------+-------------+----------+--------------+-----------+
Total line number = 1
It costs 0.064s
```

4. Export the aggregation results of part of the data in table1 to the file copysql4.tsfile via a select statement

```SQL
IoTDB:database1> copy (select count(temperature), count(humidity) from table1 group by device_id) to 'copysql4.tsfile'
+-----------------------------------------------------+---------+------------+-------------+----------+--------------+-----------+
|                                                 path|row_count|device_count|size_in_bytes|table_name|   time_column|tag_columns|
+-----------------------------------------------------+---------+------------+-------------+----------+--------------+-----------+
|    /iotdb/data/datanode/data/copy_to/copysql4.tsfile|        2|           1|          543|    table1|time(auto_gen)|         []|
+-----------------------------------------------------+---------+------------+-------------+----------+--------------+-----------+
Total line number = 1
It costs 0.155s
```

5. Export part of the data in table1 to the file copysql5.tsfile via a select statement, and specify the target table, time column, and tag columns

```SQL
IoTDB:database1> copy (select time,region,device_id,temperature from table1 order by time) to 'copysql5.tsfile' (TABLE copytable, TIME time, TAGS (region,device_id))
+-----------------------------------------------------+---------+------------+-------------+----------+-----------+-------------------+
|                                                 path|row_count|device_count|size_in_bytes|table_name|time_column|        tag_columns|
+-----------------------------------------------------+---------+------------+-------------+----------+-----------+-------------------+
|    /iotdb/data/datanode/data/copy_to/copysql5.tsfile|       18|           4|         1199| copytable|       time|[region, device_id]|
+-----------------------------------------------------+---------+------------+-------------+----------+-----------+-------------------+
Total line number = 1
It costs 0.047s
```
