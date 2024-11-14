# Data Export Script

## 1. Introduction to Export Tools

Export tools can export data queried from SQL into specified formats, including the `export-tsfile.sh/bat` script for exporting TsFile files and the `export-data.sh/bat` script that supports exporting in CSV and SQL formats.

## 2. Supported Data Types

- CSV: A plain text format for storing formatted data, which needs to be constructed according to the specified CSV format mentioned below.

- SQL: A file containing custom SQL statements.

- TsFile: The file format for time series used in IoTDB.

## 3. export-tsfile Script

Supports TsFile: The file format for time series used in IoTDB.


#### 3.1 Command

```Bash
# Unix/OS X
tools/export-tsfile.sh  -h <ip> -p <port> -u <username> -pw <password> -td <directory> [-f <export filename> -q <query command> -s <sql file>]

# Windows
tools\export-tsfile.bat -h <ip> -p <port> -u <username> -pw <password> -td <directory> [-f <export filename> -q <query command> -s <sql file>]
```

#### 3.2 Parameter Introduction

| **Parameter** | **Definition**                                                     | **Required** | **Default**  |
| -------- | ------------------------------------------------------------ | ------------ | --------- |
| -h       | Hostname                                                       | No           | root      |
| -p       | Port 	                                                       | No           | root      |
| -u       | Username	                                                       | No           | 127.0.0.1 |
| -pw      | Password                                                         | No           | 6667      |
| -t       | Target file directory, used to specify the directory where the output file should be saved	               | Yes           | -         |
| -tfn     | Name of the export file	                                               | No           | -         |
| -q       | Number of query commands to be executed, possibly used for batch execution of queries	               | No           | -         |
| -s       | SQL file path, used to specify the location of the file containing the SQL statements to be executed	        | No           | -         |
| -timeout | Session query timeout, used to specify the maximum allowed time before the query operation is automatically terminated	 | No           | -         |

In addition, if the `-s` and `-q` parameters are not used, after the export script is started, you need to enter the query statement according to the program prompt, and different query results will be saved to different TsFile files.



#### 3.3 Running Examples

```Bash
# Unix/OS X
tools/export-tsfile.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./
# or
tools/export-tsfile.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -q "select * from root.**"
# Or
tools/export-tsfile.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -s ./sql.txt
# Or
tools/export-tsfile.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -s ./sql.txt -f myTsFile
# Or
tools/export-tsfile.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -s ./sql.txt -f myTsFile -t 10000

# Windows
tools/export-tsfile.bat -h 127.0.0.1 -p 6667 -u root -pw root -td ./
# Or
tools/export-tsfile.bat -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -q "select * from root.**"
# Or
tools/export-tsfile.bat -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -s ./sql.txt
# Or
tools/export-tsfile.bat -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -s ./sql.txt -f myTsFile
# Or
tools/export-tsfile.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -s ./sql.txt -f myTsFile -t 10000
```

## 4. export-data Script

Supports CSV: A plain text format for storing formatted data, which needs to be constructed according to the specified CSV format below.

Supports SQL: A file containing custom SQL statements.

#### 4.1 Command

```Bash
# Unix/OS X
>tools/export-data.sh  -h <ip> -p <port> -u <username> -pw <password> -t <directory> [-tf <time-format> -datatype <true/false> -q <query command> -s <source sql file> -tfn <target file name> -lpf <int> -type <export type> -aligned <true/false>]

# Windows
>tools\export-data.bat -h <ip> -p <port> -u <username> -pw <password> -t <directory> [-tf <time-format> -datatype <true/false> -q <query command> -s <source sql file> -tfn <target file name> -lpf <int> -type <export type> -aligned <true/false>]
```

#### 4.2 Parameter Introduction

| **Parameter**  | **Definition**                                                     | **Required** | **Default**                 |
| --------- | ------------------------------------------------------------ | ------------ | ------------------------ |
| -h        |  Hostname                                                 | No           | 127.0.0.1                |
| -p        |  Port	                                                   | No           | 6667                     |
| -u        | Username	                                             | No           | root                     |
| -pw       | Password	                                               | No           | root                     |
| -t        | Exported CSV or SQL file output path (In V1.3.2, the parameter was `-td`)	   | Yes           |                          |
| -datatype | Whether to print the corresponding data type behind the time series in the CSV file header, options are true or false	 | No           | true                     |
| -q        | Directly specify the query statement to be executed in the command (currently only supports some statements, detailed list see below) Note: -q and -s parameters are required to fill in one, if filled in at the same time, -q takes effect. For detailed supported SQL statement examples, please refer to "SQL Statement Support Details" below	 | 否           |                          |
| -s        | Specify the SQL file, which may contain one or more SQL statements. If it contains multiple SQL statements, they should be separated by newlines (carriage returns). Each SQL statement corresponds to one or more output CSV or SQL files. Note: -q and -s parameters are required to fill in one, if filled in at the same time, -q takes effect. For detailed supported SQL statement examples, please refer to "SQL Statement Support Rules" below	 | 否           |                          |
| -type     | Specify the type of exported file, options are csv or sql	                      | No           | csv                      |
| -tf       | Specify the time format. The time format must comply with the[ISO 8601](https://calendars.wikia.org/wiki/ISO_8601)standard, or `timestamp` Explanation: Only effective when the - type is CSV | 否           | yyyy-MM-dd HH:mm:ss.SSSz |
| -lpf      | Specify the maximum number of lines in the dump file to be exported (V1.3.2 version parameter is`-linesPerFile`) | No           | 10000                    |
| -timeout  | Specify the timeout period for session queries, in ms                      | No           | -1                       |

#### 4.3 SQL 语句支持规则

1. Only query statements are supported; non-query statements (such as metadata management, system management, etc.) are not supported. For unsupported SQL, the program will automatically skip and output an error message.

2. In query statements, the current version only supports the export of raw data. If there are group by, aggregate functions, UDFs, operational operators, etc., they are not supported for export as SQL. When exporting raw data, please note that if exporting data from multiple devices, please use the align by device statement. Detailed examples are as follows:


|                                           | **支持导出** | **示例**                                      |
| ----------------------------------------- | ------------ | --------------------------------------------- |
| Raw data single device query	                        | Supported         | select * from root.s_0.d_0                    |
| | 原始数据多设备查询（aligin by device）    | Supported         | select * from root.** align by device         |
    | 支持         | select * from root.** align by device         |
| Raw data multi-device query (without align by device)	| Not Supported	       | select * from root.**select * from root.s_0.* |

#### 4.4 Running Examples

- Export all data within the scope of a SQL execution to a CSV file.

```Bash
# Unix/OS X
>tools/export-data.sh  -h <ip> -p <port> -u <username> -pw <password> -t <directory> [-tf <time-format> -datatype <true/false> -q <query command> -s <source sql file> -tfn <target file name> -lpf <int> -type <export type> -aligned <true/false>]

# Windows
>tools\export-data.bat -h <ip> -p <port> -u <username> -pw <password> -t <directory> [-tf <time-format> -datatype <true/false> -q <query command> -s <source sql file> -tfn <target file name> -lpf <int> -type <export type> -aligned <true/false>]
```

- Export results

```Bash
Time,root.stock.Legacy.0700HK.L1_BidPrice,root.stock.Legacy.0700HK.Type,root.stock.Legacy.0700HK.L1_BidSize,root.stock.Legacy.0700HK.Domain,root.stock.Legacy.0700HK.L1_BuyNo,root.stock.Legacy.0700HK.L1_AskPrice
2024-07-29T18:37:18.700+08:00,0.9666617,3.0,0.021367407654674264,-6.0,false,0.8926191
2024-07-29T18:37:19.701+08:00,0.3057328,3.0,0.9965377284981661,-5.0,false,0.15167356
```

- Export all data within the scope of all SQL executions in a SQL file to a CSV file.


```Bash
# Unix/OS X
>tools/export-data.sh -t ./data/ -s export.sql
# Windows
>tools/export-data.bat -t ./data/ -s export.sql
```

- Content of export.sql file (file pointed to by -s parameter)


```Bash
select * from root.stock.** limit 100
select * from root.db.** limit 100
```

- Export result file 1


```Bash
Time,root.stock.Legacy.0700HK.L1_BidPrice,root.stock.Legacy.0700HK.Type,root.stock.Legacy.0700HK.L1_BidSize,root.stock.Legacy.0700HK.Domain,root.stock.Legacy.0700HK.L1_BuyNo,root.stock.Legacy.0700HK.L1_AskPrice
2024-07-29T18:37:18.700+08:00,0.9666617,3.0,0.021367407654674264,-6.0,false,0.8926191
2024-07-29T18:37:19.701+08:00,0.3057328,3.0,0.9965377284981661,-5.0,false,0.15167356
```

- Export result file 2


```Bash
Time,root.db.Random.RandomBoolean
2024-07-22T17:16:05.820+08:00,true
2024-07-22T17:16:02.597+08:00,false
```

- Export data defined in the SQL file within the IoTDB database in an aligned format as SQL statements.


```Bash
# Unix/OS X
>tools/export-data.sh -h 127.0.0.1 -p 6667 -u root -p root -t ./data/ -s export.sql -type sql -aligned true
# Windows
>tools/export-data.bat -h 127.0.0.1 -p 6667 -u root -p root -t ./data/ -s export.sql -type sql -aligned true
```

- Export results


```Bash
INSERT INTO root.stock.Legacy.0700HK(TIMESTAMP,L1_BidPrice,Type,L1_BidSize,Domain,L1_BuyNo,L1_AskPrice) ALIGNED VALUES (1722249629831,0.62308747,2.0,0.012206747854849653,-6.0,false,0.14164352);
INSERT INTO root.stock.Legacy.0700HK(TIMESTAMP,L1_BidPrice,Type,L1_BidSize,Domain,L1_BuyNo,L1_AskPrice) ALIGNED VALUES (1722249630834,0.7520042,3.0,0.22760657101910464,-5.0,true,0.089064896);
INSERT INTO root.stock.Legacy.0700HK(TIMESTAMP,L1_BidPrice,Type,L1_BidSize,Domain,L1_BuyNo,L1_AskPrice) ALIGNED VALUES (1722249631835,0.3981064,3.0,0.6254559288663467,-6.0,false,0.9767922);
```

- Export all data within the scope of a SQL execution to a CSV file, specifying the export time format as `yyyy-MM-dd HH:mm:ss`, and print the corresponding data type behind the table header time series.


```Bash
# Unix/OS X
>tools/export-data.sh -h 127.0.0.1 -p 6667 -u root -p root -t ./data/ -s export.sql -type sql -aligned true
# Windows
>tools/export-data.bat -h 127.0.0.1 -p 6667 -u root -p root -t ./data/ -s export.sql -type sql -aligned true
```

- Export results


```Bash
Time,root.stock.Legacy.0700HK.L1_BidPrice(DOUBLE),root.stock.Legacy.0700HK.Type(DOUBLE),root.stock.Legacy.0700HK.L1_BidSize(DOUBLE),root.stock.Legacy.0700HK.Domain(DOUBLE),root.stock.Legacy.0700HK.L1_BuyNo(BOOLEAN),root.stock.Legacy.0700HK.L1_AskPrice(DOUBLE)
2024-07-30 10:33:55,0.44574088,3.0,0.21476832811611501,-4.0,true,0.5951748
2024-07-30 10:33:56,0.6880933,3.0,0.6289119476165305,-5.0,false,0.114634395
```