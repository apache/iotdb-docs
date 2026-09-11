# 数据导出

## 1. 功能概述

IoTDB 支持两种方式进行数据导出：

* 数据导出工具 ：`export-data.sh/bat` 位于 `tools `目录下，能够将指定 SQL 的查询结果导出为 CSV、SQL 及 TsFile （开源时间序列文件格式）格式。
* Copy SQL 导出 TsFile：通过 SQL 将查询结果写回到指定路径的 TsFile 中。

<table style="text-align: left;">
  <tbody>
     <tr>   <th>文件格式</th>
            <th>IoTDB工具</th>
            <th>具体介绍</th>
      </tr>
      <tr>
            <td>CSV</td>
            <td rowspan="3">export-data.sh/bat</td>
            <td>纯文本格式，存储格式化数据，需按照下文指定 CSV 格式进行构造</td>
      </tr>
      <tr>
            <td>SQL</td>
            <td>包含自定义 SQL 语句的文件</td>
      </tr>
       <tr>
            <td rowspan="2">TsFile</td>
            <td>开源时序数据文件格式</td>
      </tr>
      <tr>
            <td>Copy SQL</td>
            <td>开源时序数据文件格式</td>
      </tr>
</tbody>
</table>

## 2. 数据导出工具

### 2.1 公共参数

| 参数缩写         | 参数全称                   | 参数含义                                                        | 是否为必填项 | 默认值                                                                       |
|--------------|------------------------| ----------------------------------------------------------------- | -------------- |---------------------------------------------------------------------------|
| -ft          | --file\_type           | 导出文件的类型，可以选择：csv、sql、tsfile                       | √           |                                                                           |
| -h           | -- host                | 主机名                                                          | 否           | 127.0.0.1                                                                 |
| -p           | --port                 | 端口号                                                          | 否           | 6667                                                                      |
| -u           | --username             | 用户名                                                          | 否           | root                                                                      |
| -pw          | --password             | 密码，自 V2.0.10 起支持隐藏输入                                                             | 否           | root                                                                      |
| -sql_dialect | --sql_dialect          | 选择 server 是树模型还是表模型，当前支持 tree 和 table 类型  | 否                      | tree                                                                      |
| -db          | --database             | ​将要导出的目标数据库，只在`-sql_dialect`为 table 类型下生效。| `-sql_dialect`为 table 时必填| -                                                                         |
| -table       | --table                | 将要导出的目标表，只在`-sql_dialect`为 table 类型下生效。如果指定了`-q`参数则此参数不生效，如果导出类型为 tsfile/sql 则此参数必填。| ​ 否        | -                                                                         |
| -start_time  | --start_time           |将要导出的数据起始时间，只有`-sql_dialect`为 table 类型时生效。如果填写了`-q`，则此参数不生效。支持的时间类型同`-tf`参数。|否           | -                                                                         |
| -end_time    | --end_time             | 将要导出的数据的终止时间，只有`-sql_dialect`为 table 类型时生效。如果填写了`-q`，则此参数不生效。| 否                                                    | -                                                                         |
| -t           | --target               | 指定输出文件的目标文件夹，如果路径不存在新建文件夹                   | √           |                                                                           |
| -pfn         | --prefix\_file\_name   | 指定导出文件的名称。例如：abc,生成的文件是abc\_0.tsfile、abc\_1.tsfile | 否           | dump\_0.tsfile                                                            |
| -q           | --query                | 要执行的查询语句。自 V2.0.8 起，SQL 语句中的分号将被自动移除，查询执行保持正常。    | 否           | 无                                                                         |
| -timeout     | --query\_timeout       | 会话查询的超时时间(ms)                                     | 否           | `-1`(V2.0.8 之前)<br>`Long.MAX_VALUE`(V2.0.8 及之后)<br>范围：`-1~Long.MAX_VALUE` |
| -help        | --help                 | 显示帮助信息                                                    | 否           |                                                                           |
| -usessl      | --use_ssl              | 使用 SSL 协议，自 V2.0.10 起支持                        | 否      | -                                    |
| -ts          | --trust_store          | 信任库。支持隐藏输入，自 V2.0.10 起支持                       | 否      | -                                    |
| -tpw         | --trust_store_password | 信任库密码。支持隐藏输入，自 V2.0.10 起支持                     | 否        | -                                    |

### 2.2 CSV 格式

#### 2.2.1 运行命令

```Shell
# Unix/OS X
> tools/export-data.sh -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-start_time<start_time>] [-end_time<end_time>] [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
                -t <target_directory> [-pfn <prefix_file_name>] [-dt <datatype>] [-lpf <lines_per_file>] [-tf <time_format>] 
               [-tz <timezone>] [-q <query_command>] [-timeout <query_timeout>]
# Windows
# V2.0.4.x 版本之前
> tools\export-data.bat -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-start_time<start_time>] [-end_time<end_time>] [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
                -t <target_directory> [-pfn <prefix_file_name>] [-dt <datatype>] [-lpf <lines_per_file>] [-tf <time_format>] 
               [-tz <timezone>] [-q <query_command>] [-timeout <query_timeout>]
               
# V2.0.4.x 版本及之后 
> tools\windows\export-data.bat -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-start_time<start_time>] [-end_time<end_time>] [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
                -t <target_directory> [-pfn <prefix_file_name>] [-dt <datatype>] [-lpf <lines_per_file>] [-tf <time_format>] 
               [-tz <timezone>] [-q <query_command>] [-timeout <query_timeout>]
```

#### 2.2.2 私有参数

| 参数缩写 | 参数全称           | 参数含义                                                                                                                                                                                     | 是否为必填项 | 默认值                                  |
| ---------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |--------------------------------------|
| -dt      | --datatype         | 是否在 CSV 文件的表头输出时间序列的数据类型，可以选择`true`或`false`                                                                                                                   | 否           | false                                |
| -lpf     | --lines\_per\_file | 每个转储文件的行数                                                                                                                                                                           | 否           | 10000<br>范围：0～Integer.Max=2147483647 |
| -tf      | --time\_format     | 指定 CSV 文件中的时间格式。可以选择：1) 时间戳（数字、长整型）；2) ISO8601（默认）；3) 用户自定义模式，如`yyyy-MM-dd HH:mm:ss`（默认为ISO8601）。SQL 文件中的时间戳输出不受时间格式设置影响 | 否| ISO8601                              |
| -tz      | --timezone         | 设置时区，例如`+08:00`或`-01:00`                                                                                                                                                     | 否           | 本机系统时间                               |

#### 2.2.3 运行示例：

```Shell
# 正确示例
> export-data.sh -ft csv -sql_dialect table -t /path/export/dir -db database1 -q "select * from table1"

# 异常示例
> export-data.sh -ft csv -sql_dialect table -t /path/export/dir -q "select * from table1"
Parse error: Missing required option: db
```

### 2.3 SQL 格式

#### 2.3.1 运行命令

```Shell
# Unix/OS X
> tools/export-data.sh -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-start_time<start_time>] [-end_time<end_time>] [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
          -t <target_directory> [-pfn <prefix_file_name>] [-aligned <export aligned insert sql>]
          -lpf <lines_per_file> - [-tf <time_format>] [-tz <timezone>] [-q <query_command>] [-timeout <query_timeout>]
      
# Windows
# V2.0.4.x 版本之前
> tools\export-data.bat -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-start_time<start_time>] [-end_time<end_time>] [-h <host> -p <port> -u <username> -pw <password>] 
          -t <target_directory> [-pfn <prefix_file_name>  -aligned <export aligned insert sql>  
          -lpf <lines_per_file> -tf <time_format> -tz <timezone> -q <query_command> -timeout <query_timeout>]
          
# V2.0.4.x 版本及之后  
> tools\windows\export-data.bat -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-start_time<start_time>] [-end_time<end_time>] [-h <host> -p <port> -u <username> -pw <password>] 
          -t <target_directory> [-pfn <prefix_file_name>  -aligned <export aligned insert sql>  
          -lpf <lines_per_file> -tf <time_format> -tz <timezone> -q <query_command> -timeout <query_timeout>]
```

#### 2.3.2 私有参数

| 参数缩写 | 参数全称           | 参数含义                                                                                                                                                                                     | 是否为必填项 | 默认值                               |
| ---------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | -------------------------------------- |
| -aligned | --use\_aligned     | 是否导出为对齐的 SQL 格式                                                                                                                                                                      | 否           | true                                 |
| -lpf     | --lines\_per\_file | 每个转储文件的行数                                                                                                                                                                           | 否           | 10000<br>范围：0～Integer.Max=2147483647 |
| -tf      | --time\_format     | 指定 CSV 文件中的时间格式。可以选择：1) 时间戳（数字、长整型）；2) ISO8601（默认）；3) 用户自定义模式，如`yyyy-MM-dd HH:mm:ss`（默认为ISO8601）。SQL 文件中的时间戳输出不受时间格式设置影响 | 否| ISO8601|
| -tz      | --timezone         | 设置时区，例如`+08:00`或`-01:00`                                                                                                                                                     | 否           | 本机系统时间                         |

#### 2.3.3 运行示例：

```Shell
# 正确示例
> export-data.sh -ft sql -sql_dialect table -t /path/export/dir -db database1 -start_time 1

# 异常示例
> export-data.sh -ft sql -sql_dialect table -t /path/export/dir -start_time 1
Parse error: Missing required option: db
```

### 2.4 TsFile 格式

#### 2.4.1 运行命令

```Shell
# Unix/OS X
> tools/export-data.sh -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-start_time<start_time>] [-end_time<end_time>] [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
        -t <target_directory> [-pfn <prefix_file_name>] [-q <query_command>] [-timeout <query_timeout>]
      
# Windows
# V2.0.4.x 版本之前
> tools\export-data.bat -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-start_time<start_time>] [-end_time<end_time>] [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
        -t <target_directory> [-pfn <prefix_file_name>] [-q <query_command>] [-timeout <query_timeout>]
        
# V2.0.4.x 版本及之后 
> tools\windows\export-data.bat -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
                [-start_time<start_time>] [-end_time<end_time>] [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
        -t <target_directory> [-pfn <prefix_file_name>] [-q <query_command>] [-timeout <query_timeout>]
```

#### 2.4.2 私有参数

* 无

#### 2.4.3 运行示例：

```Shell
# 正确示例
> /tools/export-data.sh -ft tsfile -sql_dialect table -t /path/export/dir -db database1 -start_time 0

# 异常示例
> /tools/export-data.sh -ft tsfile -sql_dialect table -t /path/export/dir -start_time 0
Parse error: Missing required option: db
```

## 3. Copy SQL

> **注意：该功能自 V2.0.11 版本起支持。**

### 3.1 运行命令

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

#### 参数介绍

| 名称 | 说明 | 默认值 |
|---|---|---|
| FORMAT | 导出格式，当前仅有 TsFile | TsFile |
| TABLE | 指定生成的 TsFile 中的 Table 名称 | 如果查询 SQL 仅涉及一个 table，使用这个 table 名，否则使用 `default` |
| TIME | 指定使用结果集中的哪一列作为 TIME 列。<br>手动指定时：列类型非 TIMESTAMP、找不到指定列均会报错；<br>未手动指定时：若存在列名 time 但类型非 TIMESTAMP 也会报错。<br>按以下优先级构造 time 列：<br>1. 查询仅涉及的一个 table 中的 time 列名称相同的列<br>2. 寻找列名为 "time" 且类型为 TIMESTAMP 的列作为时间列<br>3. 使用对应 device 写入的当前行数作为 time 生成时间列，列名为 "time" | - |
| TAGS | 指定哪些列为 TAG 列，有多个 TAG 列时，最终生成的 table 内的顺序和指定的顺序一致。<br>手动指定时：列不存在、列类型非 STRING、存在重复列名均会报错。<br>如果查询仅涉及一个 table，且 table 所有 tag 列在查询结果集中可以找到，则推断为这个 table 的 tag 列，否则默认值为空列表，即除了 TIME 列以外其余所有列都被视为 FIELD 列 | 空列表 |
| MEMORY_THRESHOLD | 用于在生成 TsFile 时进行内存控制（单位：byte），手动指定数值小于等于 0 时将报错 | 32MB |

#### 结果集说明

| 列名 | 数据类型 | 说明 |
|---|---|---|
| path | STRING | 生成的目标文件的绝对路径 |
| row_count | INT64 | 总写入行数 |
| device_count | INT64 | 生成的设备数量 |
| size_in_bytes | INT64 | 生成的目标文件大小 |
| table_name | STRING | 目标文件中的表名，如果是自动生成的，会通过 `(auto_gen)` 进行标记 |
| time_column | STRING | 目标文件中的表的 time 列名，如果是自动生成的，会通过 `(auto_gen)` 进行标记 |
| tag_columns | STRING | 目标文件中的表的 tag 列名，以 `,` 分隔 |

#### 其他注意事项

* 对于文件生成位置：
  * 如果指定的是文件名，生成的 TsFile 保存在客户端直连的 DataNode 的 `${dn_data_dirs}/copy_to` 下，配置多个目录时，按照配置项 `dn_multi_dir_strategy` 的策略生成；
  * 如果指定的是一个路径，则放在指定的路径下。
* 执行过程中可能出现的异常：
  * 按照给定的 schema 写入 TsFile，存在乱序时间戳时报错
  * 非法文件名或目标文件已存在时报错
  * 查询结果中存在重复列名
  * 磁盘空间不足

### 3.2 运行示例

以[示例数据](../Reference/Sample-Data.md)中 table1 为例

1. 通过 select 语句将 table1 中的全部数据导出到文件 copysql1.tsfile

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

2. 通过表名将 table1 中的全部数据导出到文件 copysql2.tsfile

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

3. 通过表名(列)的方式将 table1 中的部分数据导出到文件 copysql3.tsfile

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

4. 通过 select 语句将 table1 中部分数据的聚合结果导出到文件 copysql4.tsfile

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

5. 通过 select 语句将 table1 中的部分数据导出到文件 copysql5.tsfile ，并指定目标表、time列及 tag 列

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
