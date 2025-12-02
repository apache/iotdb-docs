# 数据导入

## 1. 功能概述

IoTDB 支持三种方式进行数据导入：
- 数据导入工具 ：`import-data.sh/bat` 位于 `tools` 目录下，可以将 `CSV`、`SQL`、及`TsFile`（开源时序文件格式）的数据导入 `IoTDB`。
- `TsFile` 自动加载功能。
- `Load SQL` 导入 `TsFile` 。

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
            <td rowspan="3">TsFile</td>
            <td>可用于单个或一个目录的 TsFile 文件批量导入 IoTDB</td>
      </tr>
      <tr>
            <td>TsFile 自动加载</td>  
            <td>可以监听指定路径下新产生的 TsFile 文件，并将其加载进 IoTDB</td> 
      </tr>
      <tr>
            <td>Load SQL</td>  
            <td>可用于单个或一个目录的 TsFile 文件批量导入 IoTDB</td> 
      </tr>
</tbody>
</table>

## 2. 数据导入工具

### 2.1 公共参数

| 参数缩写 | 参数全称      | 参数含义                                                                                                                                    | 是否为必填项 | 默认值                       |
| ---------- | --------------- |-----------------------------------------------------------------------------------------------------------------------------------------| -------------- |---------------------------|
| -ft      | --file\_type  | 导入文件的类型，可以选择：csv、sql、tsfile                                                                                                             | √           |
|
| -h       | -- host       | 主机名                                                                                                                                     | 否           | 127.0.0.1                 |
| -p       | --port        | 端口号                                                                                                                                     | 否           | 6667                      |
| -u       | --username    | 用户名                                                                                                                                     | 否           | root                      |
| -pw      | --password    | 密码                                                                                                                                      | 否           | root                         |
| -s       | --source      | 待加载的脚本文件(夹)的本地目录路径<br>如果为csv sql tsfile这三个支持的格式，直接导入<br>不支持的格式，报错提示`The file name must end with "csv" or "sql"or "tsfile"!`  | √           |
|
| -tn      | --thread\_num | 最大并行线程数                                                                                                                                 | 否           | 8<br>范围：0～Integer.Max=2147483647 |
| -tz      | --timezone    | 时区设置，例如`+08:00`或`-01:00`                                                                                                                | 否           | 本机系统时间                    |
| -help    | --help        | 显示帮助信息,支持分开展示和全部展示`-help`或`-help csv`                                                                                                   | 否           |
|

### 2.2 CSV 格式

#### 2.2.1 运行命令

```Shell
# Unix/OS X
> tools/import-data.sh -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
       -s <source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] [-aligned <use the aligned interface>] 
      [-ti <type_infer>] [-tp <timestamp precision (ms/us/ns)>] [-tz <timezone>] [-batch <batch_size>] 
      [-tn <thread_num>]
      
# Windows
# V2.0.4.x 版本之前
> tools\import-data.bat -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
       -s <source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] [-aligned <use the aligned interface>] 
      [-ti <type_infer>] [-tp <timestamp precision (ms/us/ns)>] [-tz <timezone>] [-batch <batch_size>] 
      [-tn <thread_num>]
      
# V2.0.4.x 版本及之后  
> tools\windows\import-data.bat -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>]
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
> tools/import-data.sh -ft csv -h 127.0.0.1 -p 6667 -u root -pw root -s /path/sql 
      -fd /path/failure/dir -lpf 100  -aligned true -ti "BOOLEAN=text,INT=long,FLOAT=double" 
      -tp ms -tz +08:00 -batch 5000  -tn 4
      
# 异常示例
> tools/import-data.sh -ft csv -s /non_path
error: Source file or directory /non_path does not exist

> tools/import-data.sh -ft csv -s /path/sql -tn 0
error: Invalid thread number '0'. Please set a positive integer. 
```

#### 2.3.4 导入说明

1. CSV 导入规范

- 特殊字符转义规则：若Text类型的字段中包含特殊字符（例如逗号,），需使用反斜杠（\）​进行转义处理。
- 支持的时间格式：yyyy-MM-dd'T'HH:mm:ss， yyy-MM-dd HH:mm:ss， 或者 yyyy-MM-dd'T'HH:mm:ss.SSSZ。
- 时间戳列​必须作为数据文件的首列存在。

2. CSV 文件示例

- 时间对齐

```sql
-- header 中不包含数据类型
  Time,root.test.t1.str,root.test.t2.str,root.test.t2.var
  1970-01-01T08:00:00.001+08:00,"123hello world","123\,abc",100
  1970-01-01T08:00:00.002+08:00,"123",,

-- header 中包含数据类型（Text 类型数据支持加双引号和不加双引号）
Time,root.test.t1.str(TEXT),root.test.t2.str(TEXT),root.test.t2.var(INT32)
1970-01-01T08:00:00.001+08:00,"123hello world","123\,abc",100
1970-01-01T08:00:00.002+08:00,123,hello world,123
1970-01-01T08:00:00.003+08:00,"123",,
1970-01-01T08:00:00.004+08:00,123,,12
```

- 设备对齐

```sql
-- header 中不包含数据类型
  Time,Device,str,var
  1970-01-01T08:00:00.001+08:00,root.test.t1,"123hello world",
  1970-01-01T08:00:00.002+08:00,root.test.t1,"123",
  1970-01-01T08:00:00.001+08:00,root.test.t2,"123\,abc",100

-- header 中包含数据类型（Text 类型数据支持加双引号和不加双引号）
Time,Device,str(TEXT),var(INT32)
1970-01-01T08:00:00.001+08:00,root.test.t1,"123hello world",
1970-01-01T08:00:00.002+08:00,root.test.t1,"123",
1970-01-01T08:00:00.001+08:00,root.test.t2,"123\,abc",100
1970-01-01T08:00:00.002+08:00,root.test.t1,hello world,123
```

### 2.3 SQL 格式

#### 2.2.1 运行命令

```Shell
# Unix/OS X
> tools/import-data.sh -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
        -s<source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] [-tz <timezone>] 
        [-batch <batch_size>] [-tn <thread_num>]
      
# Windows
# V2.0.4.x 版本之前
> tools\import-data.bat -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
        -s<source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] [-tz <timezone>] 
        [-batch <batch_size>] [-tn <thread_num>]
        
# V2.0.4.x 版本及之后 
> tools\import-data.bat -ft<format>  [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
        -s<source> [-fd <fail_dir>] [-lpf <lines_per_failed_file>] [-tz <timezone>] 
        [-batch <batch_size>] [-tn <thread_num>]
```

#### 2.2.2 私有参数

| 参数缩写 | 参数全称                   | 参数含义                                                                          | 是否为必填项 | 默认值                                   |
| ---------- | ---------------------------- | ----------------------------------------------------------------------------------- | -------------- |---------------------------------------|
| -fd      | --fail\_dir                | 指定保存失败文件的目录                                                            | 否           | YOUR\_CSV\_FILE\_PATH                 |
| -lpf     | --lines\_per\_failed\_file | 指定失败文件最大写入数据的行数                                                    | 否           | 100000<br>范围：0～Integer.Max=2147483647 |
| -batch   | --batch\_size              | 指定每调用一次接口处理的数据行数（最小值为1，最大值为Integer.​*MAX\_VALUE*​） | 否           | 100000<br>范围：0～Integer.Max=2147483647 |

#### 2.2.3 运行示例

```Shell
# 正确示例
> tools/import-data.sh -ft sql -h 127.0.0.1 -p 6667 -u root -pw root -s /path/sql 
        -fd /path/failure/dir -lpf 500  -tz +08:00 
        -batch 100000  -tn 4
      
# 异常示例
> tools/import-data.sh -ft sql -s /path/sql -fd /non_path
error: Source file or directory /path/sql does not exist


> tools/import-data.sh -ft sql -s /path/sql -tn 0
error: Invalid thread number '0'. Please set a positive integer. 
```

### 2.4 TsFile 格式

#### 2.4.1 运行命令

```Shell
# Unix/OS X
> tools/import-data.sh -ft <format> [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
        -s <source> -os <on_success> [-sd <success_dir>] -of <on_fail> [-fd <fail_dir>]
        [-tn <thread_num> ] [-tz <timezone>] [-tp <timestamp precision (ms/us/ns)>]
      
# Windows
# V2.0.4.x 版本之前
> tools\import-data.bat -ft <format> [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
        -s <source> -os <on_success> [-sd <success_dir>] -of <on_fail> [-fd <fail_dir>]
        [-tn <thread_num> ] [-tz <timezone>] [-tp <timestamp precision (ms/us/ns)>]
        
# V2.0.4.x 版本及之后    
> tools\windows\import-data.bat -ft <format> [-h <host>] [-p <port>] [-u <username>] [-pw <password>] 
        -s <source> -os <on_success> [-sd <success_dir>] -of <on_fail> [-fd <fail_dir>]
        [-tn <thread_num> ] [-tz <timezone>] [-tp <timestamp precision (ms/us/ns)>]
```

#### 2.4.2 私有参数

| 参数缩写 | 参数全称               | 参数含义                                                                                                                             | 是否为必填项                                    | 默认值                |
| ---------- | ------------------------ |----------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------| -------------------- |
| -os| --on\_succcess| 1. none：不删除 <br> 2. mv：移动成功的文件到目标文件夹 <br>3. cp：硬连接（拷贝）成功的文件到目标文件夹 <br>4. delete：删除                                               | √                                         ||
| -sd      | --success\_dir         | 当`--on_succcess`为mv或cp时，mv或cp的目标文件夹。文件的文件名变为文件夹打平后拼接原有文件名                                                                         | 当`--on_succcess`为mv或cp时需要填写                | `${EXEC_DIR}/success`|
| -of| --on\_fail| 1. none：跳过 <br>2. mv：移动失败的文件到目标文件夹 <br>3. cp：硬连接（拷贝）失败的文件到目标文件夹 <br>4. delete：删除                                                 | √                                         ||
| -fd      | --fail\_dir            | 当`--on_fail`指定为mv或cp时，mv或cp的目标文件夹。文件的文件名变为文件夹打平后拼接原有文件名                                                                           | 当`--on_fail`指定为mv或cp时需要填写                  | `${EXEC_DIR}/fail`   |
| -tp      | --timestamp\_precision | 时间戳精度<br>tsfile非远程导入：-tp 指定tsfile文件的时间精度 手动校验和服务器的时间戳是否一致 不一致返回报错信息 <br>远程导入：-tp 指定tsfile文件的时间精度 pipe自动校验时间戳精度是否一致 不一致返回pipe报错信息 | 否：<br>1. ms（毫秒）<br>2. us（微秒）<br>3. ns（纳秒） | ms|


#### 2.4.3 运行示例

```Shell
# 正确示例
> tools/import-data.sh -ft tsfile -h 127.0.0.1 -p 6667 -u root -pw root 
      -s /path/sql -os mv -of cp -sd /path/success/dir -fd /path/failure/dir 
      -tn 8 -tz +08:00 -tp ms
      
# 异常示例
> tools/import-data.sh -ft tsfile -s /path/sql -os mv -of cp 
           -fd /path/failure/dir  -tn 8 
error: Missing option --success_dir (or -sd) when --on_success is 'mv' or 'cp'

> tools/import-data.sh -ft tsfile -s /path/sql -os mv -of cp 
          -sd /path/success/dir -fd /path/failure/dir  -tn 0 
error: Invalid thread number '0'. Please set a positive integer. 
```
## 3. TsFile 自动加载功能

本功能允许 IoTDB 主动监听指定目录下的新增 TsFile，并将 TsFile 自动加载至 IoTDB 中。通过此功能，IoTDB 能自动检测并加载 TsFile，无需手动执行任何额外的加载操作。

![](/img/Data-import1.png)

### 3.1 配置参数

可通过从配置文件模版 `iotdb-system.properties.template` 中找到下列参数，添加到 IoTDB 配置文件 `iotdb-system.properties` 中开启 TsFile 自动加载功能。完整配置如下：

| **配置参数**                                | **参数说明**                                                                                                                                                                                                                                                             | **value 取值范围**   | **是否必填** | **默认值**       | **加载方式** |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------- | ------------------------ | -------------------- |
| load\_active\_listening\_enable                   | 是否开启 DataNode 主动监听并且加载 tsfile 的功能（默认开启）。                                                                                                                                                                                                                 | Boolean: true，false       | 选填               | true                   | 热加载             |
| load\_active\_listening\_dirs                     | 需要监听的目录（自动包括目录中的子目录），如有多个使用 “，“ 隔开默认的目录为 `ext/load/pending`（支持热装载）                                                                                                                                                                  | String: 一个或多个文件目录 | 选填               | `ext/load/pending`       | 热加载             |
| load\_active\_listening\_fail\_dir                | 执行加载 tsfile 文件失败后将文件转存的目录，只能配置一个                                                                                                                                                                                                                       | String: 一个文件目录       | 选填               | `ext/load/failed`        | 热加载             |
| load\_active\_listening\_max\_thread\_num         | 同时执行加载 tsfile 任务的最大线程数，参数被注释掉时的默值为 max(1, CPU 核心数 / 2)，当用户设置的值不在这个区间[1, CPU核心数 /2]内时，会设置为默认值 (1, CPU 核心数 / 2)                                                                                                       | Long: [1, Long.MAX\_VALUE] | 选填               | max(1, CPU 核心数 / 2) | 重启后生效         |
| load\_active\_listening\_check\_interval\_seconds | 主动监听轮询间隔，单位秒。主动监听 tsfile 的功能是通过轮询检查文件夹实现的。该配置指定了两次检查 `load_active_listening_dirs` 的时间间隔，每次检查完成 `load_active_listening_check_interval_seconds` 秒后，会执行下一次检查。当用户设置的轮询间隔小于 1 时，会被设置为默认值 5 秒 | Long: [1, Long.MAX\_VALUE] | 选填               | 5                      | 重启后生效         |

### 3.2 注意事项

1. 如果待加载的文件中，存在 mods 文件，应优先将 mods 文件移动到监听目录下面，然后再移动 tsfile 文件，且 mods 文件应和对应的 tsfile 文件处于同一目录。防止加载到 tsfile 文件时，加载不到对应的 mods 文件
2. 禁止设置 Pipe 的 receiver 目录、存放数据的 data 目录等作为监听目录
3. 禁止 `load_active_listening_fail_dir` 与 `load_active_listening_dirs` 存在相同的目录，或者互相嵌套
4. 保证 `load_active_listening_dirs` 目录有足够的权限，在加载成功之后，文件将会被删除，如果没有删除权限，则会重复加载

## 4. Load SQL

IoTDB 支持通过 CLI 执行 SQL 直接将存有时间序列的一个或多个 TsFile 文件导入到另外一个正在运行的 IoTDB 实例中。

### 4.1 运行命令

```SQL
load '<path/dir>' with (
    'attribute-key1'='attribute-value1',
    'attribute-key2'='attribute-value2',
)
```

* `<path/dir>` ：文件本身，或是包含若干文件的文件夹路径
* `<attributes>`：可选参数，具体如下表所示

| Key                                   | Key 描述                                                                                                                                                                 | Value 类型 | Value 取值范围                          | Value 是否必填 | Value 默认值             |
| --------------------------------------- |------------------------------------------------------------------------------------------------------------------------------------------------------------------------| ------------ | ----------------------------------------- | ---------------- | -------------------------- |
| `database-level`                  | 当 tsfile 对应的 database 不存在时，可以通过` database-level`参数的值来制定 database 的级别，默认为`iotdb-common.properties`中设置的级别。<br>例如当设置 level 参数为 1 时表明此 tsfile 中所有时间序列中层级为1的前缀路径是 database。 | Integer   | `[1: Integer.MAX_VALUE]`            | 否             | 1                        |
| `on-success`                      | 表示对于成功载入的 tsfile 的处置方式:默认为`delete`，即tsfile 成功加载后将被删除;`none `表明 tsfile 成功加载之后依然被保留在源文件夹,                                                                                | String     | `delete / none`                     | 否             | delete                  |
| `model`                           | 指定写入的 tsfile 是表模型还是树模型                                                                                                                                                 | String     | `tree / table`                      | 否             | 与`-sql_dialect`一致 |
| `database-name`                   | **仅限表模型有效**: 文件导入的目标 database，不存在时会自动创建，`database-name`中不允许包括"`root.`"前缀，如果包含，将会报错。                                                                                    | String     | `-`                                 | 否             | null                     |
| `convert-on-type-mismatch`    | 加载 tsfile 时，如果数据类型不一致，是否进行转换                                                                                                                                           | Boolean    | `true / false`                      | 否             | true                     |
| `verify`                          | 加载 tsfile 前是否校验 schema                                                                                                                                                 | Boolean    | `true / false`                      | 否             | true                     |
| `tablet-conversion-threshold` | 转换为 tablet 形式的 tsfile 大小阈值，针对小文件 tsfile 加载，采用将其转换为 tablet 形式进行写入:默认值为 -1，即任意大小 tsfile 都不进行转换                                                                           | Integer    | `[-1,0 :`​`Integer.MAX_VALUE]` | 否             | -1                       |
| `async`                           | 是否开启异步加载 tsfile，将文件移到 active load 目录下面，所有的 tsfile 都 load 到`database-name`下.                                                                                            | Boolean    | `true / false`                      | 否             | false                    |

### 4.2 运行示例

```SQL
-- 准备待导入环境
IoTDB> show databases
+-------------+-----------------------+---------------------+-------------------+---------------------+
|     Database|SchemaReplicationFactor|DataReplicationFactor|TimePartitionOrigin|TimePartitionInterval|
+-------------+-----------------------+---------------------+-------------------+---------------------+
|root.__system|                      1|                    1|                  0|            604800000|
+-------------+-----------------------+---------------------+-------------------+---------------------+

-- 通过load sql 导入 tsfile
IoTDB> load '/home/dump1.tsfile' with ( 'on-success'='none')
Msg: The statement is executed successfully.

-- 验证数据导入成功
IoTDB> select * from root.testdb.**
+-----------------------------+------------------------------------+---------------------------------+-------------------------------+
|                         Time|root.testdb.device.model.temperature|root.testdb.device.model.humidity|root.testdb.device.model.status|
+-----------------------------+------------------------------------+---------------------------------+-------------------------------+
|2025-04-17T10:35:47.218+08:00|                                22.3|                             19.4|                           true|
+-----------------------------+------------------------------------+---------------------------------+-------------------------------+
```