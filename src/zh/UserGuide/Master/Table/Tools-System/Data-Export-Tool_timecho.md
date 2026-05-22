# 数据导出

## 1. 功能概述

IoTDB 支持两种方式进行数据导出：

* 数据导出工具 ：`export-data.sh/bat` 位于 `tools `目录下，能够将指定 SQL 的查询结果导出为 CSV、SQL 及 TsFile （开源时间序列文件格式）格式。
* 基于 PIPE 框架的 TsFileBackup：`tsfile-backup.sh/bat`位于 `tools `目录下，能够使用 PIPE 将指定的数据文件导出为 TsFile 格式。

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
            <td>tsfile-backup.sh/bat</td> 
            <td>开源时序数据文件格式，支持 Object 数据类型</td>
      </tr>
</tbody>
</table>


## 2. 数据导出工具

### 2.1 公共参数

| 参数缩写         | 参数全称                    | 参数含义                                                                                 | 是否为必填项 | 默认值                                                                         |
|--------------|-------------------------|--------------------------------------------------------------------------------------| -------------- |-----------------------------------------------------------------------------|
| -ft          | --file\_type            | 导出文件的类型，可以选择：csv、sql、tsfile                                                          | √           |                                                                             |
| -h           | -- host                 | 主机名                                                                                  | 否           | 127.0.0.1                                                                   |
| -p           | --port                  | 端口号                                                                                  | 否           | 6667                                                                        |
| -u           | --username              | 用户名                                                                                  | 否           | root                                                                        |
| -pw          | --password              | 密码，自 V2.0.9.1 起支持隐藏输入                                                                                   | 否           | TimechoDB@2021 (V2.0.6 版本之前为 root)                                          |
| -sql_dialect | --sql_dialect           | 选择 server 是树模型还是表模型，当前支持 tree 和 table 类型                                             | 否                      | tree                                                                        |
| -db          | --database              | ​将要导出的目标数据库，只在`-sql_dialect`为 table 类型下生效。                                           | `-sql_dialect`为 table 时必填| -                                                                           |
| -table       | --table                 | 将要导出的目标表，只在`-sql_dialect`为 table 类型下生效。如果指定了`-q`参数则此参数不生效，如果导出类型为 tsfile/sql 则此参数必填。 | ​ 否        | -                                                                           |
| -start_time  | --start_time            | 将要导出的数据起始时间，只有`-sql_dialect`为 table 类型时生效。如果填写了`-q`，则此参数不生效。支持的时间类型同`-tf`参数。         |否           | -                                                                           |
| -end_time    | --end_time              | 将要导出的数据的终止时间，只有`-sql_dialect`为 table 类型时生效。如果填写了`-q`，则此参数不生效。                        | 否                                                    | -                                                                           |
| -t           | --target                | 指定输出文件的目标文件夹，如果路径不存在新建文件夹                                                            | √           |                                                                             |
| -pfn         | --prefix\_file\_name    | 指定导出文件的名称。例如：abc,生成的文件是abc\_0.tsfile、abc\_1.tsfile                                   | 否           | dump\_0.tsfile                                                              |
| -q           | --query                 | 要执行的查询语句。自 V2.0.8 起，SQL 语句中的分号将被自动移除，查询执行保持正常。                                       | 否           | 无                                                                           |
| -timeout     | --query\_timeout        | 会话查询的超时时间(ms)                                                                        | 否           | `-1`(V2.0.8 之前)<br>`Long.MAX_VALUE`(V2.0.8 及之后)<br>范围：`-1~Long.MAX_VALUE` |
| -help        | --help                  | 显示帮助信息                                                                               | 否           |                                                                             |
| -usessl      | --use_ssl               | 使用 SSL 协议，自 V2.0.9.1 起支持                                                             | 否      | -                                    |
| -ts          | --trust_store           | 信任库。支持隐藏输入，自 V2.0.9.1 起支持                                                            | 否      | -                                    |
| -tpw         | --trust_store_password  | 信任库密码。支持隐藏输入，自 V2.0.9.1 起支持                                                          | 否        | -                                    |

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

## 3. 基于 PIPE 框架的 TsFileBackup

IoTDB 自 **V2.0.9.2** 版本起支持 `tsfile-backup.sh/bat` 脚本，该脚本能够自动生成并向服务端发送 `CREATE PIPE` SQL 指令，将指定的数据文件导出为 TsFile 格式。

**注意：**

1. **使用该脚本需联系天谋团队获取相关的 jar 包（tsfile-remote-sink-<version>-jar-with-dependencies.jar），并放至 IoTDB 可访问的路径（例如所有数据节点主机）。**
2. **该脚本支持 Object 类型数据导出为 TsFile 文件。**

### 3.1 运行命令

```Shell
# Unix/OS X
> tools/tsfile-backup.sh [-sql_dialect <sql_dialect>] [-h <host>] [-p <port>]
       [-u <username>] [-pw <password>] [-path <path>] [-db <db>] [-table
       <table>] [-s <start_time>] [-e <end_time>] [-t <target_directory>] 
       [-th <target_host>] [-tu <target_host_user>] [-tp <target_host_port>]
       [--rate_limit] [--plugin_jar] [-help]
# Windows
> tools\windows>tsfile-backup.bat [-sql_dialect <sql_dialect>] [-h <host>] [-p <port>]
       [-u <username>] [-pw <password>] [-path <path>]  [-db <db>] [-table
       <table>] [-s <start_time>] [-e <end_time>] [-t <target_directory>] 
       [-th <target_host>] [-tu <target_host_user>] [-tp <target_host_port>]
       [--rate_limit] [--plugin_jar] [-help]
```

### 3.2 脚本参数

| 参数缩写           | 参数全称                 | 参数含义                                                                                                 | 是否为必填项 | 默认值             |
| -------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------- | -------------------- |
| `-sql_dialect` | `--sql_dialect`      | 指定数据模型类型，可选值：`tree`(树模型) 或`table`(表模型)。                                     | 是           | -                  |
| `-h`           | `--host`             | 本地主机地址。指当前数据所在的 IoTDB 实例 IP。                                                           | 否           | `127.0.0.1`    |
| `-p`           | `--port`             | 端口号，IoTDB RPC 服务端口。                                                                             | 否           | `6667`         |
| `-u`           | `--user`             | 用户名，用于登录 IoTDB 验证。                                                                            | 否           | `root`         |
| `-pw`          | `--password`         | 密码，对应用户的IoTDB密码，支持隐藏输入。                                                                | 否           | `root`         |
| `-t`           | `--target`           | 导出目标目录。在 SCP 模式下，此路径指远程服务器上的绝对物理路径。TsFile 和关联的 Object 目录将导出至此。 | 是           | -                  |
| `-db`          | `--database`         | 数据库名称 (表模型可选)                                                                                  | 否           | `.*`           |
| `-table`       | `--table`            | 表名 (表模型可选)                                                                                        | 否           | `.*`           |
| `-s`           | `--start_time`       | 起始时间。支持 ISO8601 格式（如 2026-01-01T00:00:00）或毫秒时间戳。仅导出该时间点及之后的数据。          | 否           | -                  |
| `-e`           | `--end_time`         | 截止时间。格式同上。仅导出该时间点之前的数据。                                                           | 否           | -                  |
| `-th`          | `--target_host`      | 远程目标主机 IP，默认自动识别启动脚本的IP。指定此参数后，脚本将自动配置 Pipe 使用 SCP 模式进行数据传输。 | 否           | -                  |
| `-tu`          | `--target_host_user` | 远程主机用户名。用于 SSH/SCP 登录目标服务器。                                                            | 否           | -                  |
| `-tpw`         | `--target_host_pw`   | 远程主机密码。用于远程身份验证，支持隐藏输入。                                                           | 否           | -                  |
| `-tp`          | `--target_host_port` | 远程 SSH 端口。                                                                                          | 否           | `22`           |
| `--rate_limit` | `--rate_limit`       | 发送速率限制。单位：字节/秒 (Bytes/s)。防止导出任务占用过多网络带宽。                                    | 否           | -                  |
| `--plugin_jar` | `--plugin_jar`       | 指定 Pipe 插件的Jar包路径                                                                                | 否           | -                  |
| `-help`        | `--help`             | 查看帮助                                                                                                 | 否           | -                  |

### 3.3 运行示例

示例一：SCP 远程导出（将数据发送到另一台服务器）

```Bash
./tsfile-backup.sh -sql_dialect table -db test_db -t /remote/archive/ -th 192.168.1.100 -tu backup_user -tpw ComplexPass123!
```

示例二：带限速的远程 Object 数据导出

```Bash
./tsfile-backup.sh -sql_dialect table -t /mnt/backup/ -th 10.0.0.5 -tu iot_admin -tpw Admin@2026 --rate_limit 5242880
```

示例三：指定 Pipe jar 目录

```Bash
./tsfile-backup.sh -sql_dialect table -db test  -table .* -tu luoluoyuyu -tpw  -t /tmp/backup --plugin_jar /local/lib/tsfile-remote-sink-2.0.8-SNAPSHOT-jar-with-dependencies.jar
```