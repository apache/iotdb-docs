# 数据导出

## 1. 功能概述

数据导出工具 export-data.sh/bat 位于 tools 目录下，能够将指定 SQL 的查询结果导出为 CSV、SQL 及 TsFile（开源时间序列文件格式）格式。具体功能如下：

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


## 2. 功能详解

### 2.1 公共参数

| 参数缩写 | 参数全称             | 参数含义                                                             | 是否为必填项 | 默认值                                      |
| ---------- | ---------------------- | ---------------------------------------------------------------------- | -------------- |------------------------------------------|
| -ft      | --file\_type         | 导出文件的类型，可以选择：csv、sql、tsfile                           | √           |                                          |
| -h       | -- host              | 主机名                                                               | 否           | 127.0.0.1                                |
| -p       | --port               | 端口号                                                               | 否           | 6667                                     |
| -u       | --username           | 用户名                                                               | 否           | root                                     |
| -pw      | --password           | 密码                                                                 | 否           | root                                     |
| -t       | --target             | 指定输出文件的目标文件夹，如果路径不存在新建文件夹                   | √           |                                          |
| -pfn     | --prefix\_file\_name | 指定导出文件的名称。例如：abc,生成的文件是abc\_0.tsfile、abc\_1.tsfile | 否           | dump\_0.tsfile                           |
| -q       | --query              | 要执行的查询命令                                                     | 否           | 无                                        |
| -timeout | --query\_timeout     | 会话查询的超时时间(ms)                                               | 否           | -1<br>范围：-1～Long max=9223372036854775807 |
| -help    | --help               | 显示帮助信息                                                         | 否           |                                          |

### 2.2 Csv 格式

#### 2.2.1 运行命令

```Shell
# Unix/OS X
> tools/export-data.sh -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>] -t <target_directory> 
               [-pfn <prefix_file_name>] [-dt <datatype>] [-lpf <lines_per_file>] [-tf <time_format>] 
               [-tz <timezone>] [-q <query_command>] [-timeout <query_timeout>]
# Windows
# V2.0.4.x 版本之前
> tools\export-data.bat -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>] -t <target_directory> 
               [-pfn <prefix_file_name>] [-dt <datatype>] [-lpf <lines_per_file>] [-tf <time_format>] 
               [-tz <timezone>] [-q <query_command>] [-timeout <query_timeout>]
               
# V2.0.4.x 版本及之后
> tools\windows\export-data.bat -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>] -t <target_directory> 
               [-pfn <prefix_file_name>] [-dt <datatype>] [-lpf <lines_per_file>] [-tf <time_format>] 
               [-tz <timezone>] [-q <query_command>] [-timeout <query_timeout>]
```

#### 2.2.2 私有参数

| 参数缩写 | 参数全称           | 参数含义                                                                                                                                                                                     | 是否为必填项 | 默认值                                  |
| ---------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |--------------------------------------|
| -dt      | --datatype         | 是否在CSV文件的表头输出时间序列的数据类型，可以选择`true`或`false`                                                                                                                   | 否           | false                                |
| -lpf     | --lines\_per\_file | 每个转储文件的行数                                                                                                                                                                           | 否           | 10000<br>范围：0～Integer.Max=2147483647 |
| -tf      | --time\_format     | 指定CSV文件中的时间格式。可以选择：1) 时间戳（数字、长整型）；2) ISO8601（默认）；3) 用户自定义模式，如`yyyy-MM-dd HH:mm:ss`（默认为ISO8601）。SQL文件中的时间戳输出不受时间格式设置影响 | 否| ISO8601                              |
| -tz      | --timezone         | 设置时区，例如`+08:00`或`-01:00`                                                                                                                                                     | 否           | 本机系统时间                               |

#### 2.2.3 运行示例：

```Shell
# 正确示例
> tools/export-data.sh -ft csv -h 127.0.0.1 -p 6667 -u root -pw root -t /path/export/dir 
              -pfn exported-data.csv -dt true -lpf 1000 -tf "yyyy-MM-dd HH:mm:ss"
              -tz +08:00 -q "SELECT * FROM root.ln" -timeout 20000    
                
# 异常示例
> tools/export-data.sh -ft csv -h 127.0.0.1 -p 6667 -u root -pw root
Parse error: Missing required option: t 
```

### 2.3 Sql 格式

#### 2.3.1 运行命令

```Shell
# Unix/OS X
> tools/export-data.sh -ft<format> [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
          -t <target_directory> [-pfn <prefix_file_name>] [-aligned <export aligned insert sql>]
          -lpf <lines_per_file> - [-tf <time_format>] [-tz <timezone>] [-q <query_command>] [-timeout <query_timeout>]
      
# Windows
# V2.0.4.x 版本之前
> tools\export-data.bat -ft<format> [-h <host> -p <port> -u <username> -pw <password>] 
          -t <target_directory> [-pfn <prefix_file_name>  -aligned <export aligned insert sql>  
          -lpf <lines_per_file> -tf <time_format> -tz <timezone> -q <query_command> -timeout <query_timeout>]
          
# V2.0.4.x 版本及之后
> tools\windows\export-data.bat -ft<format> [-h <host> -p <port> -u <username> -pw <password>] 
          -t <target_directory> [-pfn <prefix_file_name>  -aligned <export aligned insert sql>  
          -lpf <lines_per_file> -tf <time_format> -tz <timezone> -q <query_command> -timeout <query_timeout>]
```

#### 2.3.2 私有参数

| 参数缩写 | 参数全称           | 参数含义                                                                                                                                                                                     | 是否为必填项 | 默认值                               |
| ---------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | -------------------------------------- |
| -aligned | --use\_aligned     | 是否导出为对齐的SQL格式                                                                                                                                                                      | 否           | true                                 |
| -lpf     | --lines\_per\_file | 每个转储文件的行数                                                                                                                                                                           | 否           | 10000<br>范围：0～Integer.Max=2147483647 |
| -tf      | --time\_format     | 指定CSV文件中的时间格式。可以选择：1) 时间戳（数字、长整型）；2) ISO8601（默认）；3) 用户自定义模式，如`yyyy-MM-dd HH:mm:ss`（默认为ISO8601）。SQL文件中的时间戳输出不受时间格式设置影响 | 否| ISO8601|
| -tz      | --timezone         | 设置时区，例如`+08:00`或`-01:00`                                                                                                                                                     | 否           | 本机系统时间                         |

#### 2.3.3 运行示例：

```Shell
# 正确示例
> tools/export-data.sh -ft sql -h 127.0.0.1 -p 6667 -u root -pw root -t /path/export/dir 
              -pfn exported-data.csv -aligned true -lpf 1000 -tf "yyyy-MM-dd HH:mm:ss"
              -tz +08:00 -q "SELECT * FROM root.ln" -timeout 20000    
                
# 异常示例
> tools/export-data.sh -ft sql -h 127.0.0.1 -p 6667 -u root -pw root
Parse error: Missing required option: t 
```

### 2.4 TsFile 格式

#### 2.4.1 运行命令

```Shell
# Unix/OS X
> tools/export-data.sh -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
        -t <target_directory> [-pfn <prefix_file_name>] [-q <query_command>] [-timeout <query_timeout>]
      
# Windows
# V2.0.4.x 版本之前
> tools\export-data.bat -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
        -t <target_directory> [-pfn <prefix_file_name>] [-q <query_command>] [-timeout <query_timeout>]
        
# V2.0.4.x 版本及之后        
> tools\windows\export-data.bat -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
        -t <target_directory> [-pfn <prefix_file_name>] [-q <query_command>] [-timeout <query_timeout>]       
```

#### 2.4.2 私有参数

* 无

#### 2.4.3 运行示例：

```Shell
# 正确示例
> tools/export-data.sh -ft tsfile -h 127.0.0.1 -p 6667 -u root -pw root -t /path/export/dir 
              -pfn export-data.tsfile -q "SELECT * FROM root.ln"  -timeout 10000
   
# 异常示例
> tools/export-data.sh -ft tsfile -h 127.0.0.1 -p 6667 -u root -pw root
Parse error: Missing required option: t 
```
