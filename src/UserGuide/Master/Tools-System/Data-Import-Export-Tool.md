<!--

    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at
    
        http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.

-->

# Data Import Export Tool

IoTDB provides data import and export scripts (tools/export-data, tools/import-data, supported in versions 1.3.2 and above; for historical versions, tools/export-csv, tools/import-csv scripts can be used, see the reference link for usage [Import Export Tool](./Import-Export-Tool.md) ), which are used to facilitate the interaction between IoTDB internal data and external files, suitable for batch operations of single files or directories.


## Supported Data Formats

- **CSV** : Plain text format for storing formatted data, which must be constructed according to the specified CSV format below.
- **SQL** : Files containing custom SQL statements.

# export-data Script (Data Export)

## Command

```Bash
# Unix/OS X
>tools/export-data.sh  -h <ip> -p <port> -u <username> -pw <password> -t <directory> [-tf <time-format> -datatype <true/false> -q <query command> -s <source sql file> -tfn <target file name> -lpf <int> -type <export type> -aligned <true/false>]

# Windows
>tools\export-data.bat -h <ip> -p <port> -u <username> -pw <password> -t <directory> [-tf <time-format> -datatype <true/false> -q <query command> -s <source sql file> -tfn <target file name> -lpf <int> -type <export type> -aligned <true/false>]
```

Parameter Introduction:

| Parameter    | Definition                                                                                                                                                                                                                                                                                                                                                                                                                              | Required    | Default                  |
|:-------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:------------|:-------------------------|
| -h           | Database IP address                                                                                                                                                                                                                                                                                                                                                                                                                     | No           | 127.0.0.1                |
| -p           | Database port                                                                                                                                                                                                                                                                                                                                                                                                                           | No           | 6667                     |
| -u           | Database connection username                                                                                                                                                                                                                                                                                                                                                                                                            | No           | root                     |
| -pw          | Database connection password                                                                                                                                                                                                                                                                                                                                                                                                            | No           | root                     |
| -t           | Output path for the exported CSV or SQL file                                                                                                                                                                                                                                                                                                                                                                                            | Yes           |                          |
| -datatype    | Whether to print the corresponding data type behind the time series in the CSV file header, options are true or false                                                                                                                                                                                                                                                                                                                   | No           | true                     |
| -q           | Directly specify the query statement to be executed in the command (currently only supports some statements, see the table below for details). <br/>Note: -q and -s parameters must be filled in one, and -q takes effect if both are filled. For detailed examples of supported SQL statements, please refer to the "SQL Statement Support Details" below.                                                                                  | No           |                          |
| -s           | Specify an SQL file, which may contain one or more SQL statements. If there are multiple SQL statements, they should be separated by newlines (returns). Each SQL statement corresponds to one or more output CSV or SQL files. <br/>Note: -q and -s parameters must be filled in one, and -q takes effect if both are filled. For detailed examples of supported SQL statements, please refer to the "SQL Statement Support Details" below. | No           |                          |
| -type        | Specify the type of exported file, options are csv or sql                                                                                                                                                                                                                                                                                                                                                                               | No           | csv                      |
| -tf          | Specify the time format. The time format must comply with the [ISO 8601](https://calendars.wikia.org/wiki/ISO_8601) standard or timestamp. <br/>Note: Only effective when -type is csv                                                                                                                                                                                                                                                       | No           | yyyy-MM-dd HH:mm:ss.SSSz |
| -lpf         | Specify the maximum number of lines for the exported dump file                                                                                                                                                                                                                                                                                                                                                                          | No           | 10000                    |
| -timeout     | Specify the timeout time for session queries in milliseconds                                                                                                                                                                                                                                                                                                                                                                            | No           | -1                       |

SQL Statement Support Rules:

1. Only query statements are supported; non-query statements (such as metadata management, system management, etc.) are not supported. For unsupported SQL, the program will automatically skip and output an error message.
2. In the current version of query statements, only the export of raw data is supported. If there are group by, aggregate functions, UDFs, or operational operators, they are not supported for export as SQL. When exporting raw data, please note that if exporting data from multiple devices, please use the align by device statement. Detailed examples are as follows:

|                                                        | Supported for Export | Example                                       |
|--------------------------------------------------------|----------------------|-----------------------------------------------|
| Raw data single device query                           | Supported            | select * from root.s_0.d_0                    |
| Raw data multi-device query (align by device)          | Supported            | select * from root.** align by device         |
| Raw data multi-device query (without align by device)  | Unsupported          | select * from root.**<br/>select * from root.s_0.* |

## Running Examples

- Export all data within a certain SQL execution range to a CSV file.
  ```Bash
  # Unix/OS X
  >tools/export-data.sh -t ./data/ -q 'select * from root.stock.**'
  # Windows
  >tools/export-data.bat -t ./data/ -q 'select * from root.stock.**'
  ```

- Export Results
  ```Bash
  Time,root.stock.Legacy.0700HK.L1_BidPrice,root.stock.Legacy.0700HK.Type,root.stock.Legacy.0700HK.L1_BidSize,root.stock.Legacy.0700HK.Domain,root.stock.Legacy.0700HK.L1_BuyNo,root.stock.Legacy.0700HK.L1_AskPrice
  2024-07-29T18:37:18.700+08:00,0.9666617,3.0,0.021367407654674264,-6.0,false,0.8926191
  2024-07-29T18:37:19.701+08:00,0.3057328,3.0,0.9965377284981661,-5.0,false,0.15167356
  ```
- All data within the scope of all SQL statements in the SQL file is exported to CSV files.
    ```Bash
    # Unix/OS X
    >tools/export-data.sh -t ./data/ -s export.sql
    # Windows
    >tools/export-data.bat -t ./data/ -s export.sql
    ```

- Contents of export.sql File (Pointed to by -s Parameter)
  ```SQL
  select * from root.stock.** limit 100
  select * from root.db.** limit 100
  ```

- Export Result File 1
  ```Bash
  Time,root.stock.Legacy.0700HK.L1_BidPrice,root.stock.Legacy.0700HK.Type,root.stock.Legacy.0700HK.L1_BidSize,root.stock.Legacy.0700HK.Domain,root.stock.Legacy.0700HK.L1_BuyNo,root.stock.Legacy.0700HK.L1_AskPrice
  2024-07-29T18:37:18.700+08:00,0.9666617,3.0,0.021367407654674264,-6.0,false,0.8926191
  2024-07-29T18:37:19.701+08:00,0.3057328,3.0,0.9965377284981661,-5.0,false,0.15167356
  ```

- Export Result File 2
  ```Bash
  Time,root.db.Random.RandomBoolean
  2024-07-22T17:16:05.820+08:00,true
  2024-07-22T17:16:02.597+08:00,false
  ```
- Export Data in SQL File to SQL Statements with Aligned Format
    ```Bash
    # Unix/OS X
    >tools/export-data.sh -h 127.0.0.1 -p 6667 -u root -p root -t ./data/ -s export.sql -type sql -aligned true
    # Windows
    >tools/export-data.bat -h 127.0.0.1 -p 6667 -u root -p root -t ./data/ -s export.sql -type sql -aligned true
    ```

- Export Results
  ```Bash
  INSERT INTO root.stock.Legacy.0700HK(TIMESTAMP,L1_BidPrice,Type,L1_BidSize,Domain,L1_BuyNo,L1_AskPrice) ALIGNED VALUES (1722249629831,0.62308747,2.0,0.012206747854849653,-6.0,false,0.14164352);
  INSERT INTO root.stock.Legacy.0700HK(TIMESTAMP,L1_BidPrice,Type,L1_BidSize,Domain,L1_BuyNo,L1_AskPrice) ALIGNED VALUES (1722249630834,0.7520042,3.0,0.22760657101910464,-5.0,true,0.089064896);
  INSERT INTO root.stock.Legacy.0700HK(TIMESTAMP,L1_BidPrice,Type,L1_BidSize,Domain,L1_BuyNo,L1_AskPrice) ALIGNED VALUES (1722249631835,0.3981064,3.0,0.6254559288663467,-6.0,false,0.9767922);
  ```
- Export Data in a Certain SQL Execution Range to a CSV File with Specified Time Format and Data Types
    ```Bash
    # Unix/OS X
    >tools/export-data.sh -t ./data/ -tf 'yyyy-MM-dd HH:mm:ss' -datatype true -q "select * from root.stock.**" -type csv
    # Windows
    >tools/export-data.bat -t ./data/ -tf 'yyyy-MM-dd HH:mm:ss' -datatype true -q "select * from root.stock.**" -type csv
    ```

- Export Results
  ```Bash
  Time,root.stock.Legacy.0700HK.L1_BidPrice(DOUBLE),root.stock.Legacy.0700HK.Type(DOUBLE),root.stock.Legacy.0700HK.L1_BidSize(DOUBLE),root.stock.Legacy.0700HK.Domain(DOUBLE),root.stock.Legacy.0700HK.L1_BuyNo(BOOLEAN),root.stock.Legacy.0700HK.L1_AskPrice(DOUBLE)
  2024-07-30 10:33:55,0.44574088,3.0,0.21476832811611501,-4.0,true,0.5951748
  2024-07-30 10:33:56,0.6880933,3.0,0.6289119476165305,-5.0,false,0.114634395
  ```

# import-data Script (Data Import)

## Import File Examples

### CSV File Example

Note that before importing CSV data, special characters need to be handled as follows:

1. If the text type field contains special characters such as `,`, it should be escaped with `\`.
2. You can import times in formats like `yyyy-MM-dd'T'HH:mm:ss`, `yyyy-MM-dd HH:mm:ss`, or `yyyy-MM-dd'T'HH:mm:ss.SSSZ`.
3. The time column `Time` should always be in the first column.

Example 1: Time Aligned, No Data Types in Header

```SQL
Time,root.test.t1.str,root.test.t2.str,root.test.t2.var
1970-01-01T08:00:00.001+08:00,"123hello world","123\,abc",100
1970-01-01T08:00:00.002+08:00,"123",,
```

Example 2: Time Aligned, Data Types in Header(Text type data supports double quotation marks and non double quotation marks)

```SQL
Time,root.test.t1.str(TEXT),root.test.t2.str(TEXT),root.test.t2.var(INT32)
1970-01-01T08:00:00.001+08:00,"123hello world","123\,abc",100
1970-01-01T08:00:00.002+08:00,123,hello world,123
1970-01-01T08:00:00.003+08:00,"123",,
1970-01-01T08:00:00.004+08:00,123,,12
```
Example 3: Device Aligned, No Data Types in Header

```SQL
Time,Device,str,var
1970-01-01T08:00:00.001+08:00,root.test.t1,"123hello world",
1970-01-01T08:00:00.002+08:00,root.test.t1,"123",
1970-01-01T08:00:00.001+08:00,root.test.t2,"123\,abc",100
```

Example 4: Device Aligned, Data Types in Header (Text type data supports double quotation marks and non double quotation marks)

```SQL
Time,Device,str(TEXT),var(INT32)
1970-01-01T08:00:00.001+08:00,root.test.t1,"123hello world",
1970-01-01T08:00:00.002+08:00,root.test.t1,"123",
1970-01-01T08:00:00.001+08:00,root.test.t2,"123\,abc",100
1970-01-01T08:00:00.002+08:00,root.test.t1,hello world,123
```

### SQL File Example

> For unsupported SQL, illegal SQL, or failed SQL executions, they will be placed in the failed directory under the failed file (default to filename.failed).

```SQL
INSERT INTO root.stock.Legacy.0700HK(TIMESTAMP,L1_BidPrice,Type,L1_BidSize,Domain,L1_BuyNo,L1_AskPrice) VALUES (1721728578812,0.21911979,4.0,0.7129878488375604,-5.0,false,0.65362453);
INSERT INTO root.stock.Legacy.0700HK(TIMESTAMP,L1_BidPrice,Type,L1_BidSize,Domain,L1_BuyNo,L1_AskPrice) VALUES (1721728579812,0.35814416,3.0,0.04674720094979623,-5.0,false,0.9365247);
INSERT INTO root.stock.Legacy.0700HK(TIMESTAMP,L1_BidPrice,Type,L1_BidSize,Domain,L1_BuyNo,L1_AskPrice) VALUES (1721728580813,0.20012152,3.0,0.9910098187911393,-4.0,true,0.70040536);
INSERT INTO root.stock.Legacy.0700HK(TIMESTAMP,L1_BidPrice,Type,L1_BidSize,Domain,L1_BuyNo,L1_AskPrice) VALUES (1721728581814,0.034122765,4.0,0.9313345284181858,-4.0,true,0.9945297);
```

## Command

```Bash
# Unix/OS X
>tools/import-data.sh -h <ip> -p <port> -u <username> -pw <password> -s <xxx.csv/sql> [-fd <./failedDirectory> -aligned <true/false> -batch <int> -tp <ms/ns/us> -typeInfer <boolean=text,float=double...> -lpf <int>]

# Windows
>tools\import-data.bat -h <ip> -p <port> -u <username> -pw <password> -s <xxx.csv/sql> [-fd <./failedDirectory> -aligned <true/false> -batch <int> -tp <ms/ns/us> -typeInfer <boolean=text,float=double...> -lpf <int>]
```

> Although IoTDB has the ability to infer types, it is still recommended to create metadata before importing data to avoid unnecessary type conversion errors. For example:

```SQL
CREATE DATABASE root.fit.d1;
CREATE DATABASE root.fit.d2;
CREATE DATABASE root.fit.p;
CREATE TIMESERIES root.fit.d1.s1 WITH DATATYPE=INT32,ENCODING=RLE;
CREATE TIMESERIES root.fit.d1.s2 WITH DATATYPE=TEXT,ENCODING=PLAIN;
CREATE TIMESERIES root.fit.d2.s1 WITH DATATYPE=INT32,ENCODING=RLE;
CREATE TIMESERIES root.fit.d2.s3 WITH DATATYPE=INT32,ENCODING=RLE;
CREATE TIMESERIES root.fit.p.s1 WITH DATATYPE=INT32,ENCODING=RLE;
```

Parameter Introduction:

| Parameter                                                                      | Definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Required | Default                                          |
|:-------------------------------------------------------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------|:-------------------------------------------------|
| -h                                                                             | Database IP address	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | No       | 127.0.0.1                                        |
| -p                                                                             | Database port                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | No       | 6667                                             |
| -u                                                                             | Database connection username                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | No       | root                                             |
| -pw                                                                            | Database connection password                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | No       | root                                             |
| -s                                                                             | Specify the data you want to import, here you can specify a file or folder. If a folder is specified, all files with the suffix CSV or SQL in the folder will be imported in bulk.                                                                                                                                                                                                                                                                                                                                                                               | Yes      |                                                  |
| -fd                                                                            | Specify the directory to store the failed SQL files. If this parameter is not specified, the failed files will be saved to the directory of the source data. <br/>Note: For unsupported SQL, illegal SQL, and failed SQL, they will be placed in the failed file in the failed directory (default file name is. failed)                                                                                                                                                                                                                                          | No       | Add the suffix '. failed' to the source file name |
| -aligned                                                                       | Specify whether to use the 'aligned' interface, with options of true or false. <br/>Note: This parameter only takes effect when the imported file is a CSV file                                                                                                                                                                                                                                                                                                                                                                                                  | No       | false                                            |
| -batch                                                                         | Used to specify the number of points to be inserted for each batch of data (minimum value is 1, maximum value is Integer.MAX_VALUE). If the program reports' org.apache.hrift.transport ' If TTransportException: Frame size larger than protect max size is incorrect, you can adjust this parameter appropriately.                                                                                                                                                                                                                                             | No       | `100000`                                         |
| -tp                                                                            | Specify time precision, optional values include 'ms' (milliseconds),' ns' (nanoseconds), 'us' (microseconds)                                                                                                                                                                                                                                                                                                                                                                                                                                                     | No       | `ms`                                             |
| -lpf                                                                           | Specify the number of lines to write data to each failed import file                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | No       | 10000                                            |
| `-typeInfer <srcTsDataType1=dstTsDataType1,srcTsDataType2=dstTsDataType2,...>` | Used to specify type inference rules. <br/>Note: Used to specify type inference rules.`srcTsDataType` include `boolean`,`int`,`long`,`float`,`double`,`NaN`.`dstTsDataType` include `boolean`,`int`,`long`,`float`,`double`,`text`.when`srcTsDataType`is`boolean`, `dstTsDataType`can only be`boolean`or`text`.when`srcTsDataType`is`NaN`, `dstTsDataType`can only be`float`, `double`or`text`.when`srcTsDataType`is numeric, the precision of `dstTsDataType`needs to be higher than that of `srcTsDataType`.For example:`-typeInfer boolean=text,float=double` | No       |                 |

## Running Examples

- Import the `dump0_0.sql` data in the current data directory into the local IoTDB database.

```Bash
# Unix/OS X
>tools/import-data.sh -s ./data/dump0_0.sql
# Windows
>tools/import-data.bat -s ./data/dump0_0.sql
```

- Import all data in the current data directory in an aligned manner into the local IoTDB database.

```Bash
# Unix/OS X
>tools/import-data.sh -s ./data/ -fd ./failed/ -aligned true
# Windows
>tools/import-data.bat -s ./data/ -fd ./failed/ -aligned true
```

- Import the `dump0_0.csv` data in the current data directory into the local IoTDB database.

```Bash
# Unix/OS X
>tools/import-data.sh -s ./data/dump0_0.csv -fd ./failed/
# Windows
>tools/import-data.bat -s ./data/dump0_0.csv -fd ./failed/
```

- Import the `dump0_0.csv` data in the current data directory in an aligned manner, batch import 100,000 records into the IoTDB database on the host with IP `192.168.100.1`, record failures in the current `failed` directory, and limit each file to 1,000 records.

```Bash
# Unix/OS X
>tools/import-data.sh -h 192.168.100.1 -p 6667 -u root -pw root -s ./data/dump0_0.csv -fd ./failed/ -aligned true -batch 100000 -tp ms -typeInfer boolean=text,float=double -lpf 1000
# Windows
>tools/import-data.bat -h 192.168.100.1 -p 6667 -u root -pw root -s ./data/dump0_0.csv -fd ./failed/ -aligned true -batch 100000 -tp ms -typeInfer boolean=text,float=double -lpf 1000
```