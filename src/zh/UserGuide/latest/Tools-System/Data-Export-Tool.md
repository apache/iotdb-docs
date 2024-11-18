# 数据导出

## 1. 导出工具介绍

导出工具可以将 SQL 查询的数据导出为指定的格式，包含用于导出 TsFile 文件的 export-tsfile.sh/bat 脚本和支持 CSV 和 SQL 格式的导出的 export-data.sh/bat 脚本。

## 2. 支持的数据类型

- CSV：纯文本格式，存储格式化数据，需按照下文指定 CSV 格式进行构造

- SQL：包含自定义 SQL 语句的文件

- TsFile： IoTDB 中使用的时间序列的文件格式

## 3. export-tsfile 脚本

支持 TsFile： IoTDB 中使用的时间序列的文件格式

#### 3.1 运行命令

```Bash
# Unix/OS X
tools/export-tsfile.sh  -h <ip> -p <port> -u <username> -pw <password> -td <directory> [-f <export filename> -q <query command> -s <sql file>]

# Windows
tools\export-tsfile.bat -h <ip> -p <port> -u <username> -pw <password> -td <directory> [-f <export filename> -q <query command> -s <sql file>]
```

#### 3.2 参数介绍

| **参数** | **定义**                                                     | **是否必填** | **默认**  |
| -------- | ------------------------------------------------------------ | ------------ | --------- |
| -h       | 主机名                                                       | 否           | root      |
| -p       | 端口号                                                       | 否           | root      |
| -u       | 用户名                                                       | 否           | 127.0.0.1 |
| -pw      | 密码                                                         | 否           | 6667      |
| -t       | 目标文件目录，用于指定输出文件应该保存到的目录               | 是           | -         |
| -tfn     | 导出文件的名称                                               | 否           | -         |
| -q       | 想要执行的查询命令的数量，可能用于批量执行查询               | 否           | -         |
| -s       | SQL 文件路径，用于指定包含要执行的 SQL 语句的文件位置        | 否           | -         |
| -timeout | 会话查询的超时时间，用于指定查询操作在自动终止前允许的最长时间 | 否           | -         |

除此之外，如果没有使用`-s`和`-q`参数，在导出脚本被启动之后你需要按照程序提示输入查询语句，不同的查询结果会被保存到不同的TsFile文件中。

#### 3.3 运行示例

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

## 4. export-data 脚本

支持 CSV：纯文本格式，存储格式化数据，需按照下文指定 CSV 格式进行构造

支持 SQL：包含自定义 SQL 语句的文件

#### 4.1 运行命令

```Bash
# Unix/OS X
>tools/export-data.sh  -h <ip> -p <port> -u <username> -pw <password> -t <directory> [-tf <time-format> -datatype <true/false> -q <query command> -s <source sql file> -tfn <target file name> -lpf <int> -type <export type> -aligned <true/false>]

# Windows
>tools\export-data.bat -h <ip> -p <port> -u <username> -pw <password> -t <directory> [-tf <time-format> -datatype <true/false> -q <query command> -s <source sql file> -tfn <target file name> -lpf <int> -type <export type> -aligned <true/false>]
```

#### 4.2 参数介绍

| **参数**  | **定义**                                                     | **是否必填** | **默认**                 |
| --------- | ------------------------------------------------------------ | ------------ | ------------------------ |
| -h        | 主机名                                                 | 否           | 127.0.0.1                |
| -p        | 端口号                                                   | 否           | 6667                     |
| -u        | 用户名                                             | 否           | root                     |
| -pw       | 密码                                               | 否           | root                     |
| -t        | 导出的 CSV 或 SQL 文件的输出路径(V1.3.2版本参数是`-td`)      | 是           |                          |
| -datatype | 是否在 CSV 文件的 header 中时间序列的后面打印出对应的数据类型，选项为 true 或者 false | 否           | true                     |
| -q        | 在命令中直接指定想要执行的查询语句（目前仅支持部分语句，详细明细见下表）说明：-q 与 -s 参数必填其一，同时填写则 -q 生效。详细支持的 SQL 语句示例，请参考下方“SQL语句支持明细” | 否           |                          |
| -s        | 指定 SQL 文件，该文件可包含一条或多条 SQL 语句。如果包含多条 SQL 语句，语句之间应该用换行(回车)进行分割。每一条 SQL 语句对应一个或多个输出的CSV或 SQL 文件说明：-q 与 -s 参数必填其一，同时填写则-q生效。详细支持的 SQL 语句示例，请参考下方“SQL语句支持规则” | 否           |                          |
| -type     | 指定导出的文件类型，选项为 csv 或者 sql                      | 否           | csv                      |
| -tf       | 指定时间格式。时间格式必须遵守[ISO 8601](https://calendars.wikia.org/wiki/ISO_8601)标准，或时间戳（`timestamp`） 说明：只在 -type 为 csv 时生效 | 否           | yyyy-MM-dd HH:mm:ss.SSSz |
| -lpf      | 指定导出的 dump 文件最大行数(V1.3.2版本参数是`-linesPerFile`) | 否           | 10000                    |
| -timeout  | 指定 session 查询时的超时时间，单位为ms                      | 否           | -1                       |

#### 4.3 SQL 语句支持规则

1. 只支持查询语句，非查询语句（如：元数据管理、系统管理等语句）不支持。对于不支持的 SQL ，程序会自动跳过，同时输出错误信息。
2. 查询语句中目前版本仅支持原始数据的导出，如果有使用 group by、聚合函数、udf、操作运算符等则不支持导出为 SQL。原始数据导出时请注意，若导出多个设备数据，请使用 align by device 语句。详细示例如下：

|                                           | **支持导出** | **示例**                                      |
| ----------------------------------------- | ------------ | --------------------------------------------- |
| 原始数据单设备查询                        | 支持         | select * from root.s_0.d_0                    |
| 原始数据多设备查询（aligin by device）    | 支持         | select * from root.** align by device         |
| 原始数据多设备查询（无 aligin by device） | 不支持       | select * from root.**select * from root.s_0.* |

#### 4.4 运行示例

- 导出某 SQL 执行范围下的所有数据至 CSV 文件。

```Bash
# Unix/OS X
>tools/export-data.sh  -h <ip> -p <port> -u <username> -pw <password> -t <directory> [-tf <time-format> -datatype <true/false> -q <query command> -s <source sql file> -tfn <target file name> -lpf <int> -type <export type> -aligned <true/false>]

# Windows
>tools\export-data.bat -h <ip> -p <port> -u <username> -pw <password> -t <directory> [-tf <time-format> -datatype <true/false> -q <query command> -s <source sql file> -tfn <target file name> -lpf <int> -type <export type> -aligned <true/false>]
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

```Bash
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
>tools/export-data.sh -h 127.0.0.1 -p 6667 -u root -p root -t ./data/ -s export.sql -type sql -aligned true
# Windows
>tools/export-data.bat -h 127.0.0.1 -p 6667 -u root -p root -t ./data/ -s export.sql -type sql -aligned true
```

- 导出结果

```Bash
Time,root.stock.Legacy.0700HK.L1_BidPrice(DOUBLE),root.stock.Legacy.0700HK.Type(DOUBLE),root.stock.Legacy.0700HK.L1_BidSize(DOUBLE),root.stock.Legacy.0700HK.Domain(DOUBLE),root.stock.Legacy.0700HK.L1_BuyNo(BOOLEAN),root.stock.Legacy.0700HK.L1_AskPrice(DOUBLE)
2024-07-30 10:33:55,0.44574088,3.0,0.21476832811611501,-4.0,true,0.5951748
2024-07-30 10:33:56,0.6880933,3.0,0.6289119476165305,-5.0,false,0.114634395
```