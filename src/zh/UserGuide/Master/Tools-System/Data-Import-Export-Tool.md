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

# 数据导入导出脚本

IoTDB 提供了数据导入导出脚本（tools/export-data、tools/import-data，V1.3.2 及之后版本支持；历史版本可使用 tools/export-csv、tools/import-csv 脚本，使用参考[文档](./TsFile-Import-Export-Tool.md)），用于实现 IoTDB 内部数据与外部文件的交互，适用于单个文件或目录文件批量操作。

## 支持的数据格式

- **CSV**：纯文本格式，存储格式化数据，需按照下文指定 CSV 格式进行构造
- **SQL**：包含自定义 SQL 语句的文件

## export-data 脚本（数据导出）

### 运行命令

```Bash
# Unix/OS X
>tools/export-data.sh  -h <ip> -p <port> -u <username> -pw <password> -t <directory> [-tf <time-format> -datatype <true/false> -q <query command> -s <source sql file> -tfn <target file name> -lpf <int> -type <export type> -aligned <true/false>]

# Windows
>tools\export-data.bat -h <ip> -p <port> -u <username> -pw <password> -t <directory> [-tf <time-format> -datatype <true/false> -q <query command> -s <source sql file> -tfn <target file name> -lpf <int> -type <export type> -aligned <true/false>]
```

参数介绍：

| 参数      | 定义                                                                                                                                                           | 是否必填     | 默认                     |
| :-------- |:-------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------| :----------------------- |
| -h        | 数据库IP地址                                                                                                                                                      | 否        | 127.0.0.1                |
| -p        | 数据库端口                                                                                                                                                        | 否        | 6667                     |
| -u        | 数据库连接用户名                                                                                                                                                     | 否        | root                     |
| -pw       | 数据库连接密码                                                                                                                                                      | 否        | root                     |
| -t        | 导出的 CSV 或 SQL 文件的输出路径                                                                                                                                        | 是        |                          |
| -datatype | 是否在 CSV 文件的 header 中时间序列的后面打印出对应的数据类型，选项为 true 或者 false                                                                                                      | 否        | true                     |
| -q        | 在命令中直接指定想要执行的查询语句（目前仅支持部分语句，详细明细见下表）<br/>说明：-q 与 -s 参数必填其一，同时填写则 -q 生效。详细支持的 SQL 语句示例，请参考下方“SQL语句支持明细”                                                       | 否        |                          |
| -s        | 指定 SQL 文件，该文件可包含一条或多条 SQL 语句。如果包含多条 SQL 语句，语句之间应该用换行(回车)进行分割。每一条 SQL 语句对应一个或多个输出的CSV或 SQL 文件<br/>说明：-q 与 -s 参数必填其一，同时填写则-q生效。详细支持的 SQL 语句示例，请参考下方“SQL语句支持规则” | 否        |                          |
| -type     | 指定导出的文件类型，选项为 csv 或者 sql                                                                                                                                     | 否        | csv                      |
| -tf       | 指定时间格式。时间格式必须遵守[ISO 8601](https://calendars.wikia.org/wiki/ISO_8601)标准，或时间戳（`timestamp`）<br/>说明：只在 -type 为 csv 时生效                                           | 否        | yyyy-MM-dd HH:mm:ss.SSSz |
| -lpf      | 指定导出的 dump 文件最大行数                                                                                                                                            | 否        | 10000                    |
| -timeout  | 指定 session 查询时的超时时间，单位为ms                                                                                                                                    | 否        | -1                       |

 SQL 语句支持规则：

1. 只支持查询语句，非查询语句（如：元数据管理、系统管理等语句）不支持。对于不支持的 SQL ，程序会自动跳过，同时输出错误信息。
2. 查询语句中目前版本仅支持原始数据的导出，如果有使用 group by、聚合函数、udf、操作运算符等则不支持导出为 SQL。原始数据导出时请注意，若导出多个设备数据，请使用 align by device 语句。详细示例如下：

|                               | 支持导出 | 示例                                          |
|-------------------------------| -------- | --------------------------------------------- |
| 原始数据单设备查询                     | 支持     | select * from root.s_0.d_0                    |
| 原始数据多设备查询（aligin by device）   | 支持     | select * from root.** align by device         |
| 原始数据多设备查询（无 aligin by device） | 不支持   | select * from root.**<br/>select * from root.s_0.* |

### 运行示例

- 导出某 SQL 执行范围下的所有数据至 CSV 文件。
    ```Bash
    # Unix/OS X
    >tools/export-data.sh -t ./data/ -q 'select * from root.stock.**'
    # Windows
    >tools/export-data.bat -t ./data/ -q 'select * from root.stock.**'
    ```

- 导出结果
    ```Bash
    Time,root.stock.Legacy.0700HK.L1_BidPrice,root.stock.Legacy.0700HK.Type,root.stock.Legacy.0700HK.L1_BidSize,root.stock.Legacy.0700HK.Domain,root.stock.Legacy.0700HK.L1_BuyNo,root.stock.Legacy.0700HK.L1_AskPrice
    2024-07-29T18:37:18.700+08:00,0.9666617,3.0,0.021367407654674264,-6.0,false,0.8926191
    2024-07-29T18:37:19.701+08:00,0.3057328,3.0,0.9965377284981661,-5.0,false,0.15167356
    ```
- 导出 SQL 文件内所有 SQL 执行范围下的所有数据至 CSV 文件。
    ```Bash
    # Unix/OS X
    >tools/export-data.sh -t ./data/ -s export.sql
    # Windows
    >tools/export-data.bat -t ./data/ -s export.sql
    ```

- export.sql 文件内容（-s 参数指向的文件）
  ```SQL
  select * from root.stock.** limit 100
  select * from root.db.** limit 100
  ```

- 导出结果文件1
  ```Bash
  Time,root.stock.Legacy.0700HK.L1_BidPrice,root.stock.Legacy.0700HK.Type,root.stock.Legacy.0700HK.L1_BidSize,root.stock.Legacy.0700HK.Domain,root.stock.Legacy.0700HK.L1_BuyNo,root.stock.Legacy.0700HK.L1_AskPrice
  2024-07-29T18:37:18.700+08:00,0.9666617,3.0,0.021367407654674264,-6.0,false,0.8926191
  2024-07-29T18:37:19.701+08:00,0.3057328,3.0,0.9965377284981661,-5.0,false,0.15167356
  ```

- 导出结果文件2
  ```Bash
  Time,root.db.Random.RandomBoolean
  2024-07-22T17:16:05.820+08:00,true
  2024-07-22T17:16:02.597+08:00,false
  ```
- 将 IoTDB 数据库中在 SQL 文件内定义的数据，以对齐的格式将其导出为 SQL 语句。
    ```Bash
    # Unix/OS X
    >tools/export-data.sh -h 127.0.0.1 -p 6667 -u root -p root -t ./data/ -s export.sql -type sql -aligned true
    # Windows
    >tools/export-data.bat -h 127.0.0.1 -p 6667 -u root -p root -t ./data/ -s export.sql -type sql -aligned true
    ```

- 导出结果
  ```Bash
  INSERT INTO root.stock.Legacy.0700HK(TIMESTAMP,L1_BidPrice,Type,L1_BidSize,Domain,L1_BuyNo,L1_AskPrice) ALIGNED VALUES (1722249629831,0.62308747,2.0,0.012206747854849653,-6.0,false,0.14164352);
  INSERT INTO root.stock.Legacy.0700HK(TIMESTAMP,L1_BidPrice,Type,L1_BidSize,Domain,L1_BuyNo,L1_AskPrice) ALIGNED VALUES (1722249630834,0.7520042,3.0,0.22760657101910464,-5.0,true,0.089064896);
  INSERT INTO root.stock.Legacy.0700HK(TIMESTAMP,L1_BidPrice,Type,L1_BidSize,Domain,L1_BuyNo,L1_AskPrice) ALIGNED VALUES (1722249631835,0.3981064,3.0,0.6254559288663467,-6.0,false,0.9767922);
  ```
- 将某 SQL 执行范围下的所有数据导出至 CSV 文件，指定导出的时间格式为`yyyy-MM-dd HH:mm:ss`，且表头时间序列的后面打印出对应的数据类型。
    ```Bash
    # Unix/OS X
    >tools/export-data.sh -t ./data/ -tf 'yyyy-MM-dd HH:mm:ss' -datatype true -q "select * from root.stock.**" -type csv
    # Windows
    >tools/export-data.bat -t ./data/ -tf 'yyyy-MM-dd HH:mm:ss' -datatype true -q "select * from root.stock.**" -type csv
    ```

- 导出结果
  ```Bash
  Time,root.stock.Legacy.0700HK.L1_BidPrice(DOUBLE),root.stock.Legacy.0700HK.Type(DOUBLE),root.stock.Legacy.0700HK.L1_BidSize(DOUBLE),root.stock.Legacy.0700HK.Domain(DOUBLE),root.stock.Legacy.0700HK.L1_BuyNo(BOOLEAN),root.stock.Legacy.0700HK.L1_AskPrice(DOUBLE)
  2024-07-30 10:33:55,0.44574088,3.0,0.21476832811611501,-4.0,true,0.5951748
  2024-07-30 10:33:56,0.6880933,3.0,0.6289119476165305,-5.0,false,0.114634395
  ```

## import-data 脚本（数据导入）

### 导入文件示例

#### CSV 文件示例

注意，在导入 CSV 数据前，需要特殊处理下列的字符：

1. 如果 Text 类型的字段中包含特殊字符如`,`需要使用`\`来进行转义。
2. 可以导入像`yyyy-MM-dd'T'HH:mm:ss`， `yyy-MM-dd HH:mm:ss`， 或者 `yyyy-MM-dd'T'HH:mm:ss.SSSZ`格式的时间。
3. 时间列`Time`应该始终放在第一列。

示例一：时间对齐，并且 header 中不包含数据类型的数据。

```SQL
Time,root.test.t1.str,root.test.t2.str,root.test.t2.var
1970-01-01T08:00:00.001+08:00,"123hello world","123\,abc",100
1970-01-01T08:00:00.002+08:00,"123",,
```

示例二：时间对齐，并且 header 中包含数据类型的数据（Text 类型数据支持加双引号和不加双引号）

```SQL
Time,root.test.t1.str(TEXT),root.test.t2.str(TEXT),root.test.t2.var(INT32)
1970-01-01T08:00:00.001+08:00,"123hello world","123\,abc",100
1970-01-01T08:00:00.002+08:00,123,hello world,123
1970-01-01T08:00:00.003+08:00,"123",,
1970-01-01T08:00:00.004+08:00,123,,12
```

示例三：设备对齐，并且 header 中不包含数据类型的数据

```SQL
Time,Device,str,var
1970-01-01T08:00:00.001+08:00,root.test.t1,"123hello world",
1970-01-01T08:00:00.002+08:00,root.test.t1,"123",
1970-01-01T08:00:00.001+08:00,root.test.t2,"123\,abc",100
```

示例四：设备对齐，并且 header 中包含数据类型的数据（Text 类型数据支持加双引号和不加双引号）

```SQL
Time,Device,str(TEXT),var(INT32)
1970-01-01T08:00:00.001+08:00,root.test.t1,"123hello world",
1970-01-01T08:00:00.002+08:00,root.test.t1,"123",
1970-01-01T08:00:00.001+08:00,root.test.t2,"123\,abc",100
1970-01-01T08:00:00.002+08:00,root.test.t1,hello world,123
```

#### SQL 文件示例

> 对于不支持的 SQL ，不合法的 SQL ，执行失败的 SQL 都会放到失败目录下的失败文件里（默认为 文件名.failed）

```SQL
INSERT INTO root.stock.Legacy.0700HK(TIMESTAMP,L1_BidPrice,Type,L1_BidSize,Domain,L1_BuyNo,L1_AskPrice) VALUES (1721728578812,0.21911979,4.0,0.7129878488375604,-5.0,false,0.65362453);
INSERT INTO root.stock.Legacy.0700HK(TIMESTAMP,L1_BidPrice,Type,L1_BidSize,Domain,L1_BuyNo,L1_AskPrice) VALUES (1721728579812,0.35814416,3.0,0.04674720094979623,-5.0,false,0.9365247);
INSERT INTO root.stock.Legacy.0700HK(TIMESTAMP,L1_BidPrice,Type,L1_BidSize,Domain,L1_BuyNo,L1_AskPrice) VALUES (1721728580813,0.20012152,3.0,0.9910098187911393,-4.0,true,0.70040536);
INSERT INTO root.stock.Legacy.0700HK(TIMESTAMP,L1_BidPrice,Type,L1_BidSize,Domain,L1_BuyNo,L1_AskPrice) VALUES (1721728581814,0.034122765,4.0,0.9313345284181858,-4.0,true,0.9945297);
```

### 运行命令

```Bash
# Unix/OS X
>tools/import-data.sh -h <ip> -p <port> -u <username> -pw <password> -s <xxx.csv/sql> [-fd <./failedDirectory> -aligned <true/false> -batch <int> -tp <ms/ns/us> -typeInfer <boolean=text,float=double...> -lpf <int>]

# Windows
>tools\import-data.bat -h <ip> -p <port> -u <username> -pw <password> -s <xxx.csv/sql> [-fd <./failedDirectory> -aligned <true/false> -batch <int> -tp <ms/ns/us> -typeInfer <boolean=text,float=double...> -lpf <int>]
```

> 虽然 IoTDB 具有类型推断的能力，但我们仍然推荐在导入数据前创建元数据，因为这可以避免不必要的类型转换错误。如下：

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

参数介绍：

| 参数           | 定义                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 是否必填 | 默认                      |
|:-------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| :------- | :------------------------ |
| -h           | 数据库 IP 地址                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 否       | 127.0.0.1                 |
| -p           | 数据库端口                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 否       | 6667                      |
| -u           | 数据库连接用户名                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 否       | root                      |
| -pw          | 数据库连接密码                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 否       | root                      |
| -s           | 指定想要导入的数据，这里可以指定文件或者文件夹。如果指定的是文件夹，将会把文件夹中所有的后缀为 csv 或者 sql 的文件进行批量导入。                                                                                                                                                                                                                                                                                                                                                                                                        | 是       |                           |
| -fd          | 指定存放失败 SQL 文件的目录，如果未指定这个参数，失败的文件将会被保存到源数据的目录中。<br/>说明：对于不支持的 SQL ，不合法的 SQL ，执行失败的 SQL 都会放到失败目录下的失败文件里（默认为 文件名.failed）                                                                                                                                                                                                                                                                                                                                                        | 否       | 源文件名加上`.failed`后缀 |
| -aligned     | 指定是否使用`aligned`接口，选项为 true 或者 false <br/>说明：这个参数只在导入文件为csv文件时生效                                                                                                                                                                                                                                                                                                                                                                                                              | 否       | false                     |
| -batch       | 用于指定每一批插入的数据的点数（最小值为1，最大值为 Integer.*MAX_VALUE*）。如果程序报了`org.apache.thrift.transport.TTransportException: Frame size larger than protect max size`这个错的话，就可以适当的调低这个参数。                                                                                                                                                                                                                                                                                                          | 否       | `100000`                  |
| -tp          | 指定时间精度，可选值包括`ms`（毫秒），`ns`（纳秒），`us`（微秒）                                                                                                                                                                                                                                                                                                                                                                                                                                       | 否       | `ms`                      |
| -lpf         | 指定每个导入失败文件写入数据的行数                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 否       | 10000                     |
| -typeInfer   | 用于指定类型推断规则，如<srcTsDataType1=dstTsDataType1,srcTsDataType2=dstTsDataType2,...>。<br/>说明：用于指定类型推断规则.`srcTsDataType` 包括 `boolean`,`int`,`long`,`float`,`double`,`NaN`.`dstTsDataType` 包括 `boolean`,`int`,`long`,`float`,`double`,`text`.当`srcTsDataType`为`boolean`, `dstTsDataType`只能为`boolean`或`text`.当`srcTsDataType`为`NaN`, `dstTsDataType`只能为`float`, `double`或`text`.当`srcTsDataType`为数值类型, `dstTsDataType`的精度需要高于`srcTsDataType`.例如:`-typeInfer boolean=text,float=double` | 否       |                           |

### 运行示例

- 导入当前`data`目录下的`dump0_0.sql`数据到本机 IoTDB 数据库中。

```Bash
# Unix/OS X
>tools/import-data.sh -s ./data/dump0_0.sql
# Windows
>tools/import-data.bat -s ./data/dump0_0.sql
```

- 将当前`data`目录下的所有数据以对齐的方式导入到本机 IoTDB 数据库中。

```Bash
# Unix/OS X
>tools/import-data.sh -s ./data/ -fd ./failed/ -aligned true
# Windows
>tools/import-data.bat -s ./data/ -fd ./failed/ -aligned true
```

- 导入当前`data`目录下的`dump0_0.csv`数据到本机 IoTDB 数据库中。

```Bash
# Unix/OS X
>tools/import-data.sh -s ./data/dump0_0.csv -fd ./failed/
# Windows
>tools/import-data.bat -s ./data/dump0_0.csv -fd ./failed/
```

- 将当前`data`目录下的`dump0_0.csv`数据以对齐的方式，一批导入100000条导入到`192.168.100.1`IP所在主机的 IoTDB 数据库中，失败的记录记在当前`failed`目录下，每个文件最多记1000条。

```Bash
# Unix/OS X
>tools/import-data.sh -h 192.168.100.1 -p 6667 -u root -pw root -s ./data/dump0_0.csv -fd ./failed/ -aligned true -batch 100000 -tp ms -typeInfer boolean=text,float=double -lpf 1000
# Windows
>tools/import-data.bat -h 192.168.100.1 -p 6667 -u root -pw root -s ./data/dump0_0.csv -fd ./failed/ -aligned true -batch 100000 -tp ms -typeInfer boolean=text,float=double -lpf 1000
```