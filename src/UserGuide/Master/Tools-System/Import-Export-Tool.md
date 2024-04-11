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

# Import Export Tool

For different scenarios, IoTDB provides users with a variety of operation methods for batch importing data. This chapter introduces the two most commonly used methods for importing in the form of CSV text and importing in the form of TsFile files.

## TsFile Load And Export Tool

### TsFile Load Tool

#### Introduction

The load external tsfile tool allows users to load tsfiles, delete a tsfile, or move a tsfile to target directory from the running Apache IoTDB instance. Alternatively, you can use scripts to load tsfiles into IoTDB, for more information.

#### Load with SQL

The user sends specified commands to the Apache IoTDB system through the Cli tool or JDBC to use the tool.

##### Load Tsfiles

The command to load tsfiles is `load <path/dir> [sglevel=int][verify=true/false][onSuccess=delete/none]`.

This command has two usages:

1. Load a single tsfile by specifying a file path (absolute path).

The first parameter indicates the path of the tsfile to be loaded. This command has three options: sglevel, verify, onSuccess.

SGLEVEL option. If the database correspond to the tsfile does not exist, the user can set the level of database through the fourth parameter. By default, it uses the database level which is set in `iotdb-datanode.properties`.

VERIFY option. If this parameter is true, All timeseries in this loading tsfile will be compared with the timeseries in IoTDB. If existing a measurement which has different datatype with the measurement in IoTDB, the loading process will be stopped and exit. If consistence can be promised, setting false for this parameter will be a better choice.

ONSUCCESS option. The default value is DELETE, which means  the processing method of successfully loaded tsfiles, and DELETE means  after the tsfile is successfully loaded, it will be deleted. NONE means after the tsfile is successfully loaded, it will be remained in the origin dir.

If the `.resource` file corresponding to the file exists, it will be loaded into the data directory and engine of the Apache IoTDB. Otherwise, the corresponding `.resource` file will be regenerated from the tsfile file.

Examples:

* `load '/Users/Desktop/data/1575028885956-101-0.tsfile'`
* `load '/Users/Desktop/data/1575028885956-101-0.tsfile' verify=true`
* `load '/Users/Desktop/data/1575028885956-101-0.tsfile' verify=false`
* `load '/Users/Desktop/data/1575028885956-101-0.tsfile' sglevel=1`
* `load '/Users/Desktop/data/1575028885956-101-0.tsfile' onSuccess=delete`
* `load '/Users/Desktop/data/1575028885956-101-0.tsfile' verify=true sglevel=1`
* `load '/Users/Desktop/data/1575028885956-101-0.tsfile' verify=false sglevel=1`
* `load '/Users/Desktop/data/1575028885956-101-0.tsfile' verify=true onSuccess=none`
* `load '/Users/Desktop/data/1575028885956-101-0.tsfile' verify=false sglevel=1 onSuccess=delete`

2. Load a batch of files by specifying a folder path (absolute path).

The first parameter indicates the path of the tsfile to be loaded. The options above also works for this command.

Examples:

* `load '/Users/Desktop/data'`
* `load '/Users/Desktop/data' verify=false`
* `load '/Users/Desktop/data' verify=true`
* `load '/Users/Desktop/data' verify=true sglevel=1`
* `load '/Users/Desktop/data' verify=false sglevel=1 onSuccess=delete`

**NOTICE**:  When `$IOTDB_HOME$/conf/iotdb-datanode.properties` has `enable_auto_create_schema=true`, it will automatically create metadata in TSFILE, otherwise it will not be created automatically.

#### Load with Script

Run rewrite-tsfile.bat if you are in a Windows environment, or rewrite-tsfile.sh if you are on Linux or Unix.

```bash
./load-tsfile.bat -f filePath [-h host] [-p port] [-u username] [-pw password] [--sgLevel int] [--verify true/false] [--onSuccess none/delete]
-f 			File/Directory to be load, required
-h 			IoTDB Host address, optional field, 127.0.0.1 by default
-p 			IoTDB port, optional field, 6667 by default
-u 			IoTDB user name, optional field, root by default
-pw 		IoTDB password, optional field, root by default
--sgLevel 	Sg level of loading Tsfile, optional field, default_storage_group_level in 				iotdb-common.properties by default
--verify 	Verify schema or not, optional field, True by default
--onSuccess Delete or remain origin TsFile after loading, optional field, none by default
```

##### Example

Assuming that an IoTDB instance is running on server 192.168.0.101:6667, you want to load all TsFile files from the locally saved TsFile backup folder D:\IoTDB\data into this IoTDB instance.

First move to the folder `$IOTDB_HOME/tools/`, open the command line, and execute

```bash
./load-rewrite.bat -f D:\IoTDB\data -h 192.168.0.101 -p 6667 -u root -pw root
```

After waiting for the script execution to complete, you can check that the data in the IoTDB instance has been loaded correctly.

##### Q&A

- Cannot find or load the main class
  - It may be because the environment variable $IOTDB_HOME is not set, please set the environment variable and try again
- -f option must be set!
  - The input command is missing the -f field (file or folder path to be loaded) or the -u field (user name), please add it and re-execute
- What if the execution crashes in the middle and you want to reload?
  - You re-execute the command just now, reloading the data will not affect the correctness after loading

TsFile can help you export the result set in the format of TsFile file to the specified path by executing the sql, command line sql, and sql file.

### TsFile Export Tool

#### Syntax

```shell
# Unix/OS X
> tools/export-tsfile.sh  -h <ip> -p <port> -u <username> -pw <password> -td <directory> [-f <export filename> -q <query command> -s <sql file>]

# Windows
> tools\export-tsfile.bat -h <ip> -p <port> -u <username> -pw <password> -td <directory> [-f <export filename> -q <query command> -s <sql file>]
```

* `-h <host>`:
  - The host address of the IoTDB service.
* `-p <port>`:
  - The port number of the IoTDB service.
* `-u <username>`:
  - The username of the IoTDB service.
* `-pw <password>`:
  - Password for IoTDB service.
* `-td <directory>`:
  - Specify the output path for the exported TsFile file.
* `-f <tsfile name>`:
  - For the file name of the exported TsFile file, just write the file name, and cannot include the file path and suffix. If the sql file or console input contains multiple sqls, multiple files will be generated in the order of sql.
  - Example: There are three SQLs in the file or command line, and -f param is "dump", then three TsFile files: dump0.tsfile、dump1.tsfile、dump2.tsfile will be generated in the target path.
* `-q <query command>`:
  - Directly specify the query statement you want to execute in the command.
  - Example: `select * from root.** limit 100`
* `-s <sql file>`:
  - Specify a SQL file that contains one or more SQL statements. If an SQL file contains multiple SQL statements, the SQL statements should be separated by newlines. Each SQL statement corresponds to an output TsFile file.
* `-t <timeout>`:
  - Specifies the timeout period for session queries, in milliseconds


In addition, if you do not use the `-s` and `-q` parameters, after the export script is started, you need to enter the query statement as prompted by the program, and different query results will be saved to different TsFile files.

#### Example

```shell
# Unix/OS X
> tools/export-tsfile.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./
# or
> tools/export-tsfile.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -q "select * from root.** align by device"
# Or
> tools/export-tsfile.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -s ./sql.txt
# Or
> tools/export-tsfile.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -s ./sql.txt -f myTsFile
# Or
> tools/export-tsfile.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -s ./sql.txt -f myTsFile -t 10000

# Windows
> tools/export-tsfile.bat -h 127.0.0.1 -p 6667 -u root -pw root -td ./
# Or
> tools/export-tsfile.bat -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -q "select * from root.** align by device"
# Or
> tools/export-tsfile.bat -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -s ./sql.txt
# Or
> tools/export-tsfile.bat -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -s ./sql.txt -f myTsFile
# Or
> tools/export-tsfile.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -s ./sql.txt -f myTsFile -t 10000
```

#### Q&A

- It is recommended not to execute the write data command at the same time when loading data, which may lead to insufficient memory in the JVM.

## CSV Tool

The CSV tool can help you import data in CSV format to IoTDB or export data from IoTDB to a CSV file.

### Usage of export-data.sh

#### Syntax

```shell
# Unix/OS X
> tools/export-data.sh  -h <ip> -p <port> -u <username> -pw <password> -td <directory> [-tf <time-format> -datatype <true/false> -q <query command> -s <sql file> -linesPerFile <int>]

# Windows
> tools\export-data.bat -h <ip> -p <port> -u <username> -pw <password> -td <directory> [-tf <time-format> -datatype <true/false> -q <query command> -s <sql file> -linesPerFile <int>]
```

Description:

* `-datatype`:
  - true (by default): print the data type of timesries in the head line of CSV file. i.e., `Time, root.sg1.d1.s1(INT32), root.sg1.d1.s2(INT64)`.
  - false: only print the timeseries name in the head line of the CSV file. i.e., `Time, root.sg1.d1.s1 , root.sg1.d1.s2`
* `-q <query command>`:
  - specifying a query command that you want to execute
  - example: `select * from root.** limit 100`, or `select * from root.** limit 100 align by device`
* `-s <sql file>`:
  - specifying a SQL file which can consist of more than one sql. If there are multiple SQLs in one SQL file, the SQLs should be separated by line breaks. And, for each SQL, a output CSV file will be generated.
* `-td <directory>`:
  - specifying  the directory that the data will be exported
* `-tf <time-format>`:
  - specifying a time format that you want. The time format have to obey [ISO 8601](https://calendars.wikia.org/wiki/ISO_8601) standard. If you want to save the time as the timestamp, then setting `-tf timestamp`
  - example: `-tf yyyy-MM-dd\ HH:mm:ss` or `-tf timestamp`
* `-linesPerFile <int>`:
  - Specifying lines of each dump file, `10000` is default.
  - example: `-linesPerFile 1`
* `-t <timeout>`:
  - Specifies the timeout period for session queries, in milliseconds


More, if you don't use one of `-s` and `-q`, you need to enter some queries after running the export script. The results of the different query will be saved to different CSV files.

#### Example

```shell
# Unix/OS X
> tools/export-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./
# Or
> tools/export-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -tf yyyy-MM-dd\ HH:mm:ss
# or
> tools/export-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -q "select * from root.** align by device"
# Or
> tools/export-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -s sql.txt
# Or
> tools/export-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -tf yyyy-MM-dd\ HH:mm:ss -s sql.txt
# Or
> tools/export-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -tf yyyy-MM-dd\ HH:mm:ss -s sql.txt -linesPerFile 10
# Or
> tools/export-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -tf yyyy-MM-dd\ HH:mm:ss -s sql.txt -linesPerFile 10 -t 10000

# Windows
> tools/export-data.bat -h 127.0.0.1 -p 6667 -u root -pw root -td ./
# Or
> tools/export-data.bat -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -tf yyyy-MM-dd\ HH:mm:ss
# or
> tools/export-data.bat -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -q "select * from root.** align by device"
# Or
> tools/export-data.bat -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -s sql.txt
# Or
> tools/export-data.bat -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -tf yyyy-MM-dd\ HH:mm:ss -s sql.txt
# Or
> tools/export-data.bat -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -tf yyyy-MM-dd\ HH:mm:ss -s sql.txt -linesPerFile 10
# Or
> tools/export-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -tf yyyy-MM-dd\ HH:mm:ss -s sql.txt -linesPerFile 10 -t 10000
```

#### Sample SQL file

```sql
select * from root.**;
select * from root.** align by device;
```

The result of `select * from root.**`

```sql
Time,root.ln.wf04.wt04.status(BOOLEAN),root.ln.wf03.wt03.hardware(TEXT),root.ln.wf02.wt02.status(BOOLEAN),root.ln.wf02.wt02.hardware(TEXT),root.ln.wf01.wt01.hardware(TEXT),root.ln.wf01.wt01.status(BOOLEAN)
1970-01-01T08:00:00.001+08:00,true,"v1",true,"v1",v1,true
1970-01-01T08:00:00.002+08:00,true,"v1",,,,true
```

The result of `select * from root.** align by device`

```sql
Time,Device,hardware(TEXT),status(BOOLEAN)
1970-01-01T08:00:00.001+08:00,root.ln.wf01.wt01,"v1",true
1970-01-01T08:00:00.002+08:00,root.ln.wf01.wt01,,true
1970-01-01T08:00:00.001+08:00,root.ln.wf02.wt02,"v1",true
1970-01-01T08:00:00.001+08:00,root.ln.wf03.wt03,"v1",
1970-01-01T08:00:00.002+08:00,root.ln.wf03.wt03,"v1",
1970-01-01T08:00:00.001+08:00,root.ln.wf04.wt04,,true
1970-01-01T08:00:00.002+08:00,root.ln.wf04.wt04,,true
```

The data of boolean type signed by `true` and `false` without double quotes. And the text data will be enclosed in double quotes.

#### Note

Note that if fields exported by the export tool have the following special characters:

1. `,`: the field will be escaped by `\`.

### Usage of import-data.sh

#### Create Metadata (optional)

```sql
CREATE DATABASE root.fit.d1;
CREATE DATABASE root.fit.d2;
CREATE DATABASE root.fit.p;
CREATE TIMESERIES root.fit.d1.s1 WITH DATATYPE=INT32,ENCODING=RLE;
CREATE TIMESERIES root.fit.d1.s2 WITH DATATYPE=TEXT,ENCODING=PLAIN;
CREATE TIMESERIES root.fit.d2.s1 WITH DATATYPE=INT32,ENCODING=RLE;
CREATE TIMESERIES root.fit.d2.s3 WITH DATATYPE=INT32,ENCODING=RLE;
CREATE TIMESERIES root.fit.p.s1 WITH DATATYPE=INT32,ENCODING=RLE;
```

IoTDB has the ability of type inference, so it is not necessary to create metadata before data import. However, we still recommend creating metadata before importing data using the CSV import tool, as this can avoid unnecessary type conversion errors.

#### Sample CSV File to Be Imported

The data aligned by time, and headers without data type.

```sql
Time,root.test.t1.str,root.test.t2.str,root.test.t2.int
1970-01-01T08:00:00.001+08:00,"123hello world","123\,abc",100
1970-01-01T08:00:00.002+08:00,"123",,
```

The data aligned by time, and headers with data type.（Text type data supports double quotation marks and no double quotation marks）

```sql
Time,root.test.t1.str(TEXT),root.test.t2.str(TEXT),root.test.t2.int(INT32)
1970-01-01T08:00:00.001+08:00,"123hello world","123\,abc",100
1970-01-01T08:00:00.002+08:00,123,hello world,123
1970-01-01T08:00:00.003+08:00,"123",,
1970-01-01T08:00:00.004+08:00,123,,12
```

The data aligned by device, and headers without data type.

```sql
Time,Device,str,int
1970-01-01T08:00:00.001+08:00,root.test.t1,"123hello world",
1970-01-01T08:00:00.002+08:00,root.test.t1,"123",
1970-01-01T08:00:00.001+08:00,root.test.t2,"123\,abc",100
```

The data aligned by device,  and headers with data type.(Text type data supports double quotation marks and no double quotation marks)

```sql
Time,Device,str(TEXT),int(INT32)
1970-01-01T08:00:00.001+08:00,root.test.t1,"123hello world",
1970-01-01T08:00:00.002+08:00,root.test.t1,hello world,123
1970-01-01T08:00:00.003+08:00,root.test.t1,,123
```

#### Syntax

```shell
# Unix/OS X
> tools/import-data.sh -h <ip> -p <port> -u <username> -pw <password> -f <xxx.csv> [-fd <./failedDirectory>] [-aligned <true>] [-tp <ms/ns/us>] [-typeInfer <boolean=text,float=double...>]
# Windows
> tools\import-data.bat -h <ip> -p <port> -u <username> -pw <password> -f <xxx.csv> [-fd <./failedDirectory>] [-aligned <true>] [-tp <ms/ns/us>] [-typeInfer <boolean=text,float=double...>]
```

Description:

* `-f`:
  - the CSV file that you want to import, and it could be a file or a folder. If a folder is specified, all TXT and CSV files in the folder will be imported in batches.
  - example: `-f filename.csv`

* `-fd`:
  - specifying a directory to save files which save failed lines. If you don't use this parameter, the failed file will be saved at original directory, and the filename will be the source filename with suffix `.failed`.
  - example: `-fd ./failed/`

* `-aligned`:
  - whether to use the aligned interface? The option `false` is default.
  - example: `-aligned true`

* `-batch`:
  - specifying the point's number of a batch. If the program throw the exception `org.apache.thrift.transport.TTransportException: Frame size larger than protect max size`, you can lower this parameter as appropriate.
  - example: `-batch 100000`, `100000` is the default value.

* `-tp <time-precision>`:
  - specifying a time precision. Options includes `ms`(millisecond), `ns`(nanosecond), and `us`(microsecond), `ms` is default.

* `-typeInfer <srcTsDataType1=dstTsDataType1,srcTsDataType2=dstTsDataType2,...>`:
  - specifying rules of type inference.
  - Option `srcTsDataType` includes `boolean`,`int`,`long`,`float`,`double`,`NaN`.
  - Option `dstTsDataType` includes `boolean`,`int`,`long`,`float`,`double`,`text`.
  - When `srcTsDataType` is `boolean`, `dstTsDataType` should be between `boolean` and `text`.
  - When `srcTsDataType` is `NaN`, `dstTsDataType` should be among `float`, `double` and `text`.
  - When `srcTsDataType` is Numeric type, `dstTsDataType` precision should be greater than `srcTsDataType`.
  - example: `-typeInfer boolean=text,float=double`

* `-linesPerFailedFile <int>`:
  - Specifying lines of each failed file, `10000` is default.
  - example: `-linesPerFailedFile 1`

#### Example

```sh
# Unix/OS X
> tools/import-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -f example-filename.csv -fd ./failed
# or
> tools/import-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -f example-filename.csv -fd ./failed
# or
> tools\import-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -f example-filename.csv -fd ./failed -tp ns
# or
> tools\import-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -f example-filename.csv -fd ./failed -tp ns -typeInfer boolean=text,float=double
# or
> tools\import-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -f example-filename.csv -fd ./failed -tp ns -typeInfer boolean=text,float=double -linesPerFailedFile 10

# Windows
> tools\import-data.bat -h 127.0.0.1 -p 6667 -u root -pw root -f example-filename.csv
# or
> tools\import-data.bat -h 127.0.0.1 -p 6667 -u root -pw root -f example-filename.csv -fd .\failed
# or
> tools\import-data.bat -h 127.0.0.1 -p 6667 -u root -pw root -f example-filename.csv -fd .\failed -tp ns
# or
> tools\import-data.bat -h 127.0.0.1 -p 6667 -u root -pw root -f example-filename.csv -fd .\failed -tp ns -typeInfer boolean=text,float=double
# or
> tools\import-data.bat -h 127.0.0.1 -p 6667 -u root -pw root -f example-filename.csv -fd .\failed -tp ns -typeInfer boolean=text,float=double -linesPerFailedFile 10

```

#### Note

Note that the following special characters in fields need to be checked before importing:

1. `,` : fields containing `,` should be escaped by `\`.
2. you can input time format like `yyyy-MM-dd'T'HH:mm:ss`, `yyy-MM-dd HH:mm:ss`, or `yyyy-MM-dd'T'HH:mm:ss.SSSZ`.
3. the `Time` column must be the first one.


## SQL Tool

The SQL tool can help you import data in SQL format to IoTDB or export data from IoTDB to a SQL file.

### Usage of export-data.sh

#### Syntax

```shell
# Unix/OS X
> tools/export-data.sh  -h <ip> -p <port> -u <username> -pw <password> -td <directory> [-tf <time-format> -datatype <true/false> -q <query command> -s <sql file> -linesPerFile <int>]

# Windows
> tools\export-data.bat -h <ip> -p <port> -u <username> -pw <password> -td <directory> [-tf <time-format> -datatype <true/false> -q <query command> -s <sql file> -linesPerFile <int>]
```

Description:

* `-q <query command>`:
  - specifying a query command that you want to execute
  - example: `select * from root.** limit 100`, or `select * from root.** limit 100 align by device`
* `-s <sql file>`:
  - specifying a SQL file which can consist of more than one sql. If there are multiple SQLs in one SQL file, the SQLs should be separated by line breaks. And, for each SQL, a output CSV file will be generated.
* `-td <directory>`:
  - specifying  the directory that the data will be exported
* `-tf <time-format>`:
  - specifying a time format that you want. The time format have to obey [ISO 8601](https://calendars.wikia.org/wiki/ISO_8601) standard. If you want to save the time as the timestamp, then setting `-tf timestamp`
  - example: `-tf yyyy-MM-dd\ HH:mm:ss` or `-tf timestamp`
* `-linesPerFile <int>`:
  - Specifying lines of each dump file, `10000` is default.
  - example: `-linesPerFile 1`
* `-t <timeout>`:
  - Specifies the timeout period for session queries, in milliseconds
* `-type`:
  - csv: whether to export as an CSV file? The option `csv` is default.
  - sql: whether to export as an SQL file?
* `-aligned`:
  - whether to use the aligned interface? The option `false` is default.
  - example: `-aligned true`

More, if you don't use one of `-s` and `-q`, you need to enter some queries after running the export script. The results of the different query will be saved to different SQL files.

#### Example

```shell
# Unix/OS X
> tools/export-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -type sql
# Or
> tools/export-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -type sql -tf yyyy-MM-dd\ HH:mm:ss
# or
> tools/export-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -type sql -q "select * from root.sg_0.d_0.*"
# Or
> tools/export-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -type sql -s iotdb.sql -type sql
# Or
> tools/export-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -type sql -tf yyyy-MM-dd\ HH:mm:ss -s iotdb.sql
# Or
> tools/export-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -type sql -tf yyyy-MM-dd\ HH:mm:ss -s iotdb.sql -linesPerFile 10
# Or
> tools/export-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -type sql -tf yyyy-MM-dd\ HH:mm:ss -s iotdb.sql -linesPerFile 10 -t 10000

# Windows
> tools/export-data.bat -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -type sql
# Or
> tools/export-data.bat -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -type sql  -tf yyyy-MM-dd\ HH:mm:ss
# or
> tools/export-data.bat -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -type sql  -q "select * from root.sg_0.d_0.*"
# Or
> tools/export-data.bat -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -type sql -s iotdb.sql -type sql
# Or
> tools/export-data.bat -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -type sql -tf yyyy-MM-dd\ HH:mm:ss -s iotdb.sql
# Or
> tools/export-data.bat -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -type sql -tf yyyy-MM-dd\ HH:mm:ss -s iotdb.sql -linesPerFile 10
# Or
> tools/export-data.bat -h 127.0.0.1 -p 6667 -u root -pw root -td ./ -type sql -tf yyyy-MM-dd\ HH:mm:ss -s iotdb.sql -linesPerFile 10 -t 10000
```

#### Sample SQL file

-SQL export restrictions
-Only export of raw data (select xxx from xxx) is supported. If group by, aggregate function, udf, operator, etc. are used, exporting to SQL is not supported
-If aligning by device is required across multiple devices, exporting SQL is not supported (insert statement cannot cross devices)
-If the sequence does not match the source database data type and the target database sequence type, there is no guarantee that it can be imported

```sql
select * from root.**;
select * from root.** align by device;
```

The result of `select * from root.s_0.d_0`

```sql
INSERT INTO root.s_0.d_0(timestamp,s_0,s_1) VALUES (2023-10-25T16:44:00.081083545,false,23.123);
INSERT INTO root.s_0.d_0(timestamp,s_0,s_1) VALUES (2023-10-25T15:44:10.081083545,true,24.124);
```

The result of `select * from root.** align by device`

```sql
INSERT INTO root.s_0.d_1(timestamp,s_0,s_1) VALUES (2023-06-19T01:05:00.081083545,true,25.125);
INSERT INTO root.s_0.d_1(timestamp,s_0,s_1) VALUES (2023-06-19T02:05:00.081083545,true,25.125);
```

The data of boolean type signed by `true` and `false` without double quotes. And the text data will be enclosed in double quotes.

#### Note

Note that if fields exported by the export tool have the following special characters:

1. `,`: the field will be escaped by `\`.

### Usage of import-data.sh

#### Create Metadata (optional)

```sql
CREATE DATABASE root.fit.d1;
CREATE DATABASE root.fit.d2;
CREATE DATABASE root.fit.p;
CREATE TIMESERIES root.fit.d1.s1 WITH DATATYPE=INT32,ENCODING=RLE;
CREATE TIMESERIES root.fit.d1.s2 WITH DATATYPE=TEXT,ENCODING=PLAIN;
CREATE TIMESERIES root.fit.d2.s1 WITH DATATYPE=INT32,ENCODING=RLE;
CREATE TIMESERIES root.fit.d2.s3 WITH DATATYPE=INT32,ENCODING=RLE;
CREATE TIMESERIES root.fit.p.s1 WITH DATATYPE=INT32,ENCODING=RLE;
```

IoTDB has the ability of type inference, so it is not necessary to create metadata before data import. However, we still recommend creating metadata before importing data using the SQL import tool, as this can avoid unnecessary type conversion errors.

#### Sample SQL File to Be Imported

The data aligned by time.

```sql
INSERT INTO root.s_0.d_0(timestamp,s_0,s_1) VALUES (2023-10-25T16:44:00.081083545,false,23.123);
INSERT INTO root.s_0.d_0(timestamp,s_0,s_1) VALUES (2023-10-25T15:44:10.081083545,true,24.124);
```

The data not aligned by time.（Text type data supports double quotation marks and no double quotation marks）

```sql
INSERT INTO root.s_0.d_1(timestamp,s_0,s_1) ALIGNED VALUES (2023-06-19T01:05:00.081083545,true,25.125);
INSERT INTO root.s_0.d_1(timestamp,s_0,s_1) ALIGNED VALUES (2023-06-19T02:05:00.081083545,true,25.125);
```

#### Syntax

```shell
# Unix/OS X
> tools/import-data.sh -h <ip> -p <port> -u <username> -pw <password> -f <xxx.sql> [-fd <./failedDirectory>] [-aligned <true>] [-tp <ms/ns/us>]
# Windows
> tools\import-data.bat -h <ip> -p <port> -u <username> -pw <password> -f <xxx.sql> [-fd <./failedDirectory>] [-aligned <true>] [-tp <ms/ns/us>]
```

Description:

* `-f`:
  - the CSV file that you want to import, and it could be a file or a folder. If a folder is specified, all TXT and CSV files in the folder will be imported in batches.
  - example: `-f filename.csv`

* `-fd`:
  - specifying a directory to save files which save failed lines. If you don't use this parameter, the failed file will be saved at original directory, and the filename will be the source filename with suffix `.failed`.
  - example: `-fd ./failed/`

* `-batch`:
  - specifying the point's number of a batch. If the program throw the exception `org.apache.thrift.transport.TTransportException: Frame size larger than protect max size`, you can lower this parameter as appropriate.
  - example: `-batch 100000`, `100000` is the default value.

* `-linesPerFailedFile <int>`:
  - Specifying lines of each failed file, `10000` is default.
  - example: `-linesPerFailedFile 1`

#### Example

```sh
# Unix/OS X
> tools/import-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -f example-filename.sql -fd ./failed
> tools/import-data.sh -h 127.0.0.1 -p 6667 -u root -pw root -f ./devices -fd ./failed
# or
> tools/import-data.bat -h 127.0.0.1 -p 6667 -u root -pw root -f example-filename.sql -fd ./failed
> tools/import-data.bat -h 127.0.0.1 -p 6667 -u root -pw root -f ./devices -fd ./failed
```

#### Note

Note that the following special characters in fields need to be checked before importing:

1. `,` : fields containing `,` should be escaped by `\`.
2. you can input time format like `yyyy-MM-dd'T'HH:mm:ss`, `yyy-MM-dd HH:mm:ss`, or `yyyy-MM-dd'T'HH:mm:ss.SSSZ`.
3. the `Time` column must be the first one.