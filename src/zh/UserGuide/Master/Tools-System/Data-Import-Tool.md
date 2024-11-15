# 数据导入工具

## 1. 导入工具介绍

IoTDB 导入工具包分为两种：主动监听并加载 TsFile 和导入脚本。导入脚本中含专门用于导入 TsFile 文件的`import-tsfile.sh/bat` 脚本和支持 CSV 和 SQL 格式的导入的 `import-data.sh/bat` 脚本，可用于单个文件导入或一个目录的批量导入。

## 2. 主动监听并加载 TsFile

用户只需通过数据采集转发程序指定发送端的文件目录和接收端的目标目录，文件的自动同步至预定接收端目录。通过DataNode的主动监听功能，放入预定接收端目录中的文件，IoTDB便能自动检测并加载这些文件，无需手动执行任何额外的加载操作。这种自动化流程不仅简化了用户的操作步骤，还减少了操作过程中可能出现的错误，有效降低了用户在使用过程中的复杂性。

### 2.1 配置参数

| **配置参数**                                 | **参数说明**                                                 | **value 取值范围**             | **是否必填** | **默认值**             | **加载方式** |
| -------------------------------------------- | ------------------------------------------------------------ | -------------------------- | ------------ | ---------------------- | ---------------- |
| load_active_listening_enable                 | 是否开启 DataNode 主动监听并且加载 tsfile 的功能（默认开启）。 | Boolean: true，false       | 选填         | true                   | 热加载           |
| load_active_listening_dirs                   | 需要监听的目录（自动包括目录中的子目录），如有多个使用 “，“ 隔开默认的目录为 ext/load/pending（支持热装载） | String: 一个或多个文件目录 | 选填         | ext/load/pending       | 热加载           |
| load_active_listening_fail_dir               | 执行加载 tsfile 文件失败后将文件转存的目录，只能配置一个     | String: 一个文件目录       | 选填         | ext/load/failed        | 热加载           |
| load_active_listening_max_thread_num         | 同时执行加载 tsfile 任务的最大线程数，参数被注释掉时的默值为 max(1, CPU 核心数 / 2)，当用户设置的值不在这个区间[1, CPU核心数 /2]内时，会设置为默认值 (1, CPU 核心数 / 2) | Long: [1, Long.MAX_VALUE]  | 选填         | max(1, CPU 核心数 / 2) | 重启后生效       |
| load_active_listening_check_interval_seconds | 主动监听轮询间隔，单位秒。主动监听 tsfile 的功能是通过轮询检查文件夹实现的。该配置指定了两次检查 load_active_listening_dirs 的时间间隔，每次检查完成 load_active_listening_check_interval_seconds 秒后，会执行下一次检查。当用户设置的轮询间隔小于 1 时，会被设置为默认值 5 秒 | Long: [1, Long.MAX_VALUE]  | 选填         | 5                      | 重启后生效       |


### 2.2 注意事项

1. 如果待加载的文件中，存在 mods 文件，应优先将 mods 文件移动到监听目录下面，然后再移动 tsfile 文件，且 mods 文件应和对应的 tsfile 文件处于同一目录。防止加载到 tsfile 文件时，加载不到对应的 mods 文件
```SQL
FUNCTION moveFilesToListeningDirectory(sourceDirectory, listeningDirectory)
    // 移动 mods 文件
    modsFiles = searchFiles(sourceDirectory, "*mods*")
    IF modsFiles IS NOT EMPTY
        FOR EACH file IN modsFiles
            MOVE(file, listeningDirectory)
        END FOR
    END IF

    // 移动 tsfile 文件
    tsfileFiles = searchFiles(sourceDirectory, "*tsfile*")
    IF tsfileFiles IS NOT EMPTY
        FOR EACH file IN tsfileFiles
            MOVE(file, listeningDirectory)
        END FOR
    END IF
END FUNCTION

FUNCTION searchFiles(directory, pattern)
    matchedFiles = []
    FOR EACH file IN directory.files
        IF file.name MATCHES pattern
            APPEND file TO matchedFiles
        END IF
    END FOR
    RETURN matchedFiles
END FUNCTION

FUNCTION MOVE(sourceFile, targetDirectory)
    // 实现文件从 sourceFile 移动到 targetDirectory 的逻辑
END FUNCTION
```

2. 禁止设置 Pipe 的 receiver 目录、存放数据的 data 目录等作为监听目录

3. 禁止 `load_active_listening_fail_dir` 与 `load_active_listening_dirs` 存在相同的目录，或者互相嵌套

4. 保证 `load_active_listening_dirs` 目录有足够的权限，在加载成功之后，文件将会被删除，如果没有删除权限，则会重复加载

## 3.导入脚本

### 3.1 支持的数据类型

- CSV：纯文本格式，存储格式化数据，需符合下文指定 CSV 格式
- SQL：包含 IoTDB SQL 语句的文件
- TsFile： IoTDB 原生时序数据文件格式

### 3.2 load-tsfile 脚本

支持 TsFile： IoTDB 中使用的时间序列的文件格式

#### 3.2.1 运行命令

```Bash
# Unix/OS X
>tools/load-tsfile.sh -h <ip> -p <port> -u <username> -pw <password> -s <source> -os <on_success> [-sd <success_dir>] -of <on_fail> [-fd <fail_dir>] [-tn <thread_num>] 

# Windows
>tools\load-tsfile.bat -h <ip> -p <port> -u <username> -pw <password>  -s <source> -os <on_success> [-sd <success_dir>] -of <on_fail> [-fd <fail_dir>] [-tn <thread_num>] 
```

#### 3.2.2 参数介绍

| **参数** | **定义**                                                     | **是否必填**                        | **默认**            |
| -------- | ------------------------------------------------------------ | ----------------------------------- | ------------------- |
| -h       | 主机名                                                       | 否                                  | root                |
| -p       | 端口号                                                       | 否                                  | root                |
| -u       | 用户名                                                       | 否                                  | 127.0.0.1           |
| -pw      | 密码                                                         | 否                                  | 6667                |
| -s       | 待加载的脚本文件(夹)的本地目录路径                           | 是                                  |                     |
| -os      | none：不删除<br>mv：移动成功的文件到目标文件夹<br>cp：硬连接（拷贝）成功的文件到目标文件夹<br>delete：删除 | 是                                  |                     |
| -sd      | 当--on_succcess为mv或cp时，mv或cp的目标文件夹。文件的文件名变为文件夹打平后拼接原有文件名 | 当--on_succcess为mv或cp时需要填写是 | ${EXEC_DIR}/success |
| -of      | none：跳过<br>mv：移动失败的文件到目标文件夹<br>cp：硬连接（拷贝）失败的文件到目标文件夹<br>delete：删除 | 是                                  |                     |
| -fd      | 当--on_fail指定为mv或cp时，mv或cp的目标文件夹。文件的文件名变为文件夹打平后拼接原有文件名 | 当--on_fail指定为mv或cp时需要填写   | ${EXEC_DIR}/fail    |
| -tn      | 最大并行线程数                                               | 是                                  | 8                   |

#### 3.2.3 运行示例：

```Bash
# Unix/OS X
> tools/load-tsfile.sh -h 127.0.0.1 -p 6667 -u root -pw root -s /path/sql -os delete -of delete -tn 8
> tools/load-tsfile.sh -h 127.0.0.1 -p 6667 -u root -pw root -s /path/sql -os mv -of cp -sd /path/success/dir -fd /path/failure/dir -tn 8 

# Windows
> tools/load_data.bat -h 127.0.0.1 -p 6667 -u root -pw root -s /path/sql -os mv -of cp -sd /path/success/dir -fd /path/failure/dir -tn 8 
> tools/load_data.bat -h 127.0.0.1 -p 6667 -u root -pw root -s /path/sql -os delete -of delete -tn 8 
```

## 3.3 import-data 脚本

支持 CSV：纯文本格式，存储格式化数据，需按照下文指定 CSV 格式进行构造

支持 SQL：包含自定义 SQL 语句的文件

#### 3.3.1 运行命令：

```Bash
# Unix/OS X
>tools/import-data.sh -h <ip> -p <port> -u <username> -pw <password> -s <xxx.csv/sql> [-fd <./failedDirectory> -aligned <true/false> -batch <int> -tp <ms/ns/us> -typeInfer <boolean=text,float=double...> -lpf <int>]

# Windows
>tools\import-data.bat -h <ip> -p <port> -u <username> -pw <password> -s <xxx.csv/sql> [-fd <./failedDirectory> -aligned <true/false> -batch <int> -tp <ms/ns/us> -typeInfer <boolean=text,float=double...> -lpf <int>]
```

#### 3.3.2 参数介绍：

| **参数**   | **定义**                                                     | **是否必填** | **默认**                  |
| ---------- | ------------------------------------------------------------ | ------------ | ------------------------- |
| -h         | 数据库IP地址                                                 | 否           | 127.0.0.1                 |
| -p         | 数据库端口                                                   | 否           | 6667                      |
| -u         | 数据库连接用户名                                             | 否           | root                      |
| -pw        | 数据库连接密码                                               | 否           | root                      |
| -s         | 指定想要导入的数据，这里可以指定文件或者文件夹。如果指定的是文件夹，将会把文件夹中所有的后缀为 csv 或者 sql 的文件进行批量导入(V1.3.2版本参数是`-f`) | 是           |                           |
| -fd        | 指定存放失败 SQL 文件的目录，如果未指定这个参数，失败的文件将会被保存到源数据的目录中。 说明：对于不支持的 SQL ，不合法的 SQL ，执行失败的 SQL 都会放到失败目录下的失败文件里（默认为 文件名.failed） | 否           | 源文件名加上`.failed`后缀 |
| -aligned   | 指定是否使用`aligned`接口，选项为 true 或者 false 说明：这个参数只在导入文件为csv文件时生效 | 否           | false                     |
| -batch     | 用于指定每一批插入的数据的点数（最小值为1，最大值为 Integer.*MAX_VALUE*）。如果程序报了`org.apache.thrift.transport.TTransportException: Frame size larger than protect max size`这个错的话，就可以适当的调低这个参数。 | 否           | 100000                    |
| -tp        | 指定时间精度，可选值包括`ms`（毫秒），`ns`（纳秒），`us`（微秒） | 否           | ms                        |
| -lpf       | 指定每个导入失败文件写入数据的行数(V1.3.2版本参数是`-linesPerFailedFile`) | 否           | 10000                     |
| -typeInfer | 用于指定类型推断规则，如<srcTsDataType1=dstTsDataType1,srcTsDataType2=dstTsDataType2,...>。 说明：用于指定类型推断规则.`srcTsDataType` 包括 `boolean`,`int`,`long`,`float`,`double`,`NaN`.`dstTsDataType` 包括 `boolean`,`int`,`long`,`float`,`double`,`text`.当`srcTsDataType`为`boolean`, `dstTsDataType`只能为`boolean`或`text`.当`srcTsDataType`为`NaN`, `dstTsDataType`只能为`float`, `double`或`text`.当`srcTsDataType`为数值类型, `dstTsDataType`的精度需要高于`srcTsDataType`.例如:`-typeInfer boolean=text,float=double` | 否           |                           |

#### 3.3.3 运行示例：

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