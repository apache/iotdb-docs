# 数据导入

## 1. 功能概述

数据导出工具 `import-data.sh/bat` 位于 `tools` 目录下，可以将 CSV、SQL、及 TsFile（开源时序文件格式）的数据导入 IoTDB。具体功能如下：

<table style="text-align: left;">
  <tbody>
     <tr>   <th>文件格式</th>
            <th>IoTDB工具</th>        
            <th>具体介绍</th>
      </tr>
      <tr>
            <td>CSV</td>  
            <td rowspan="3">import-data.sh/bat</td> 
            <td>可用于单个或一个目录的 CSV 文件批量导入 IoTDB</td> 
      </tr>
      <tr>
            <td>SQL</td>  
            <td>可用于单个或一个目录的 SQL 文件批量导入 IoTDB</td> 
      </tr>
       <tr>
            <td>TsFile</td>
            <td>可用于单个或一个目录的 TsFile 文件批量导入 IoTDB</td>
      </tr>
</tbody>
</table>

- **表模型 TsFile 导入暂时只支持本地导入。**

## 2. 功能详解

### 2.1 公共参数

| 参数缩写 | 参数全称      | 参数含义                                                                                                                                    | 是否为必填项 | 默认值                              |
| ---------- | --------------- |-----------------------------------------------------------------------------------------------------------------------------------------| -------------- |----------------------------------|
| -ft      | --file\_type  | 导入文件的类型，可以选择：csv、sql、tsfile                                                                                                             | √           |
| -h       | -- host       | 主机名                                                                                                                                     | 否           | 127.0.0.1                        |
| -p       | --port        | 端口号                                                                                                                                     | 否           | 6667                             |
| -u       | --username    | 用户名                                                                                                                                     | 否           | root                             |
| -pw      | --password    | 密码                                                                                                                                      | 否           | root                             |
| -s       | --source      | 待加载的脚本文件(夹)的本地目录路径<br>如果为 csv sql tsfile 这三个支持的格式，直接导入<br>不支持的格式，报错提示`The file name must end with "csv" or "sql"or "tsfile"!`  | √           |
|-sql_dialect|--sql_dialect|选择 server 是树模型还是表模型，当前支持 tree 和 table 类型| 否      | tree |
| -db |--database |数据将要导入的目标库，只在 `-sql_dialect` 为 table 类型下生效。|-sql_dialect 为 table 时必填 | - |
|-table |--table |数据将要导入的目标表，只在 `-sql_dialect` 为 table 类型且文件类型为 csv 条件下生效且必填。  | 否  | - |
| -tn      | --thread\_num | 最大并行线程数                                                                                                                                 | 否           | 8<br>范围：0～Integer.Max=2147483647 |
| -tz      | --timezone    | 时区设置，例如`+08:00`或`-01:00`                                                                                                                | 否           | 本机系统时间                           |
| -help    | --help        | 显示帮助信息,支持分开展示和全部展示`-help`或`-help csv`                                                                                                   | 否           |


### 2.2 CSV 格式

#### 2.2.1 运行命令

```Shell
# Unix/OS X
> tools/import-data.sh -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table> 
     [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
       -s <source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] [-aligned <use the aligned interface>] 
      [-ti <type_infer>] [-tp <timestamp precision (ms/us/ns)>] [-tz <timezone>] [-batch <batch_size>] 
      [-tn <thread_num>]
      
# Windows
> tools\import-data.bat -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
        [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
       -s <source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] [-aligned <use the aligned interface>] 
      [-ti <type_infer>] [-tp <timestamp precision (ms/us/ns)>] [-tz <timezone>] [-batch <batch_size>] 
      [-tn <thread_num>]
```

#### 2.2.2 私有参数

| 参数缩写 | 参数全称                   | 参数含义                                                                          | 是否为必填项                                    | 默认值                                   |
| ---------- | ---------------------------- | ----------------------------------------------------------------------------------- |-------------------------------------------|---------------------------------------|
| -fd      | --fail\_dir                | 指定保存失败文件的目录                                                            | 否                                         | YOUR\_CSV\_FILE\_PATH                 |
| -lpf     | --lines\_per\_failed\_file | 指定失败文件最大写入数据的行数                                                    | 否                                         | 100000<br>范围：0～Integer.Max=2147483647 |
| -aligned | --use\_aligned             | 是否导入为对齐序列                                                                | 否                                         | false                                 |
| -batch   | --batch\_size              | 指定每调用一次接口处理的数据行数（最小值为1，最大值为Integer.​*MAX\_VALUE*​） | 否                                         | 100000<br>范围：0～Integer.Max=2147483647 |
| -ti      | --type\_infer              | 通过选项定义类型信息，例如`"boolean=text,int=long, ..."`                      | 否                                         | 无                                     |
| -tp      | --timestamp\_precision     | 时间戳精度                                                                        | 否：<br>1. ms（毫秒）<br>2. us（微秒）<br>3. ns（纳秒） | ms                                    
|

#### 2.2.3 运行示例

```Shell
# 正确示例
> tools/import-data.sh -ft csv -sql_dialect table -s ./csv/dump0_0.csv  -db database1 -table table1

# 异常示例
> tools/import-data.sh -ft csv -sql_dialect table -s ./csv/dump0_1.csv  -table table1
Parse error: Missing required option: db

> tools/import-data.sh -ft csv -sql_dialect table -s ./csv/dump0_1.csv -db database1 -table table5
There are no tables or the target table table5 does not exist
```

#### 2.2.4 导入说明

1. CSV 导入规范

  - 特殊字符转义规则：若Text类型的字段中包含特殊字符（例如逗号`,`），需使用反斜杠（`\`）​进行转义处理。
  - 支持的时间格式：`yyyy-MM-dd'T'HH:mm:ss`， `yyy-MM-dd HH:mm:ss`， 或者 `yyyy-MM-dd'T'HH:mm:ss.SSSZ` 。
  - 时间戳列​必须作为数据文件的首列存在。

2. CSV 文件示例 

```sql
time,region,device,model,temperature,humidity
1970-01-01T08:00:00.001+08:00,"上海","101","F",90.0,35.2
1970-01-01T08:00:00.002+08:00,"上海","101","F",90.0,34.8
```

### 2.3 SQL 格式

#### 2.3.1 运行命令

```Shell
# Unix/OS X
> tools/import-data.sh -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table> 
         [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
        -s<source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] [-tz <timezone>] 
        [-batch <batch_size>] [-tn <thread_num>]
      
# Windows
> tools\import-data.bat -ft<format> [-sql_dialect<sql_dialect>] -db<database> -table<table>  
        [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
        -s<source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] [-tz <timezone>] 
        [-batch <batch_size>] [-tn <thread_num>]
```

#### 2.3.2 私有参数

| 参数缩写 | 参数全称                   | 参数含义                                                                          | 是否为必填项 | 默认值                                   |
| ---------- | ---------------------------- | ----------------------------------------------------------------------------------- | -------------- |---------------------------------------|
| -fd      | --fail\_dir                | 指定保存失败文件的目录                                                            | 否           | YOUR\_CSV\_FILE\_PATH                 |
| -lpf     | --lines\_per\_failed\_file | 指定失败文件最大写入数据的行数                                                    | 否           | 100000<br>范围：0～Integer.Max=2147483647 |
| -batch   | --batch\_size              | 指定每调用一次接口处理的数据行数（最小值为1，最大值为Integer.​*MAX\_VALUE*​） | 否           | 100000<br>范围：0～Integer.Max=2147483647 |

#### 2.3.3 运行示例

```Shell
# 正确示例
> tools/import-data.sh -ft sql -sql_dialect table -s ./sql/dump0_0.sql -db database1 

# 异常示例
> tools/import-data.sh -ft sql -sql_dialect table -s ./sql/dump1_1.sql -db database1
Source file or directory ./sql/dump1_1.sql does not exist

# 目标表存在但是元数据不适配/数据异常：生成.failed异常文件记录该条信息，日志打印错误信息如下
Fail to insert measurements '[column.name]' caused by [data type is not consistent, input '[column.value]', registered '[column.DataType]']
```

### 2.4 TsFile 格式

#### 2.4.1 运行命令

```Shell
# Unix/OS X
> tools/import-data.sh -ft <format> [-sql_dialect<sql_dialect>] -db<database> -table<table> 
         [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
        -s <source> -os <on_success> [-sd <success_dir>] -of <on_fail> [-fd <fail_dir>]
        [-tn <thread_num> ] [-tz <timezone>] [-tp <timestamp precision (ms/us/ns)>]
      
# Windows
> tools\import-data.bat -ft <format> [-sql_dialect<sql_dialect>] -db<database> -table<table> 
         [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
        -s <source> -os <on_success> [-sd <success_dir>] -of <on_fail> [-fd <fail_dir>]
        [-tn <thread_num> ] [-tz <timezone>] [-tp <timestamp precision (ms/us/ns)>]
```

#### 2.4.2 私有参数

| 参数缩写 | 参数全称               | 参数含义                                                                                                                             | 是否为必填项                                    | 默认值                |
| ---------- | ------------------------ |----------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------| -------------------- |
| -os| --on\_succcess| 1. none：不删除 <br> 2. mv：移动成功的文件到目标文件夹 <br>3. cp：硬连接（拷贝）成功的文件到目标文件夹 <br>4. delete：删除                                               | √                                         ||
| -sd      | --success\_dir         | 当`--on_succcess`为 mv 或 cp 时，mv 或 cp 的目标文件夹。文件的文件名变为文件夹打平后拼接原有文件名                                                                         | 当`--on_succcess`为mv或cp时需要填写                | `${EXEC_DIR}/success`|
| -of| --on\_fail| 1. none：跳过 <br>2. mv：移动失败的文件到目标文件夹 <br>3. cp：硬连接（拷贝）失败的文件到目标文件夹 <br>4. delete：删除                                                 | √                                         ||
| -fd      | --fail\_dir            | 当`--on_fail`指定为 mv 或 cp 时，mv 或 cp 的目标文件夹。文件的文件名变为文件夹打平后拼接原有文件名                                                                           | 当`--on_fail`指定为 mv 或 cp 时需要填写                  | `${EXEC_DIR}/fail`   |
| -tp      | --timestamp\_precision | 时间戳精度<br>tsfile 非远程导入：-tp 指定 tsfile 文件的时间精度 手动校验和服务器的时间戳是否一致 不一致返回报错信息 <br>远程导入：-tp 指定 tsfile 文件的时间精度 pipe 自动校验时间戳精度是否一致 不一致返回 pipe 报错信息 | 否：<br>1. ms（毫秒）<br>2. us（微秒）<br>3. ns（纳秒） | ms|


#### 2.4.3 运行示例

```Shell
# 正确示例
> tools/import-data.sh -ft tsfile -sql_dialect table -s ./tsfile -db database1 -os none -of none

# 异常示例
> tools/import-data.sh -ft tsfile -sql_dialect table -s ./tsfile -db database1 
Parse error: Missing required options: os, of
```
