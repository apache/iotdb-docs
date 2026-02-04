# 数据导出

## 1. 功能概述

数据导出工具 `export-data.sh/bat` 位于 `tools` 目录下，能够将指定 SQL 的查询结果导出为 CSV、SQL 及 TsFile（开源时间序列文件格式）格式。具体功能如下：

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
            <td >TsFile</td> 
            <td>开源时序数据文件格式</td>
      </tr> 
</tbody>
</table>

- 不支持 Object 数据类型。

## 2. 功能详解

### 2.1 公共参数

| 参数缩写   | 参数全称             | 参数含义                                                             | 是否为必填项 | 默认值                                                                         |
| ------------ | ---------------------- | ---------------------------------------------------------------------- | -------------- |-----------------------------------------------------------------------------|
| -ft       | --file\_type         | 导出文件的类型，可以选择：csv、sql、tsfile                           | √           |                                                                             |
| -h        | -- host              | 主机名                                                               | 否           | 127.0.0.1                                                                   |
| -p        | --port               | 端口号                                                               | 否           | 6667                                                                        |
| -u        | --username           | 用户名                                                               | 否           | root                                                                        |
| -pw       | --password           | 密码                                                                 | 否           | TimechoDB@2021 (V2.0.6 版本之前为 root)                                          |
| -sql_dialect | --sql_dialect     | 选择 server 是树模型还是表模型，当前支持 tree 和 table 类型  | 否                      | tree                                                                        |
| -db        | --database  | ​将要导出的目标数据库，只在`-sql_dialect`为 table 类型下生效。| `-sql_dialect`为 table 时必填| -                                                                           |
| -table|--table      | 将要导出的目标表，只在`-sql_dialect`为 table 类型下生效。如果指定了`-q`参数则此参数不生效，如果导出类型为 tsfile/sql 则此参数必填。| ​ 否        | -                                                                           |
| -start_time  | --start_time  |将要导出的数据起始时间，只有`-sql_dialect`为 table 类型时生效。如果填写了`-q`，则此参数不生效。支持的时间类型同`-tf`参数。|否           | -                                                                           |
|-end_time   |--end_time   | 将要导出的数据的终止时间，只有`-sql_dialect`为 table 类型时生效。如果填写了`-q`，则此参数不生效。| 否                                                    | -                                                                           |
| -t       | --target             | 指定输出文件的目标文件夹，如果路径不存在新建文件夹                   | √           |                                                                             |
| -pfn     | --prefix\_file\_name | 指定导出文件的名称。例如：abc,生成的文件是abc\_0.tsfile、abc\_1.tsfile | 否           | dump\_0.tsfile                                                              |
| -q       | --query              | 要执行的查询语句。自 V2.0.8-beta 起，SQL 语句中的分号将被自动移除，查询执行保持正常。    | 否           | 无                                                                           |
| -timeout | --query\_timeout     | 会话查询的超时时间(ms)                                      | 否           | `-1`(V2.0.8-beta 之前)<br>`Long.MAX_VALUE`(V2.0.8-beta 及之后)<br>范围：`-1~Long.MAX_VALUE` |
| -help    | --help               | 显示帮助信息                                                         | 否           |                                                                             |

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
