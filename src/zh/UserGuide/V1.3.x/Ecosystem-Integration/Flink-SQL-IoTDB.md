# flink-sql-iotdb-connector

flink-sql-iotdb-connector 将 Flink SQL 或者 Flink Table 与 IoTDB 无缝衔接了起来，使得在 Flink 的任务中可以对 IoTDB 进行实时读写，具体可以应用到如下场景中：

1. 实时数据同步：将数据从一个数据库实时同步到另一个数据库。
2. 实时数据管道：构建实时数据处理管道，处理和分析数据库中的数据。
3. 实时数据分析：实时分析数据库中的数据，提供实时的业务洞察。
4. 实时应用：将数据库中的数据实时应用于实时应用程序，如实时报表、实时推荐等。
5. 实时监控：实时监控数据库中的数据，检测异常和错误。

## 读写模式

| 读模式（Source）          | 写模式（Sink）             |
| ------------------------- | -------------------------- |
| Bounded Scan, Lookup, CDC | Streaming Sink, Batch Sink |

### 读模式（Source）

* **Bounded Scan：** bounded scan 的主要实现方式是通过指定  `时间序列` 以及 `查询条件的上下界（可选）`来进行查询，并且查询结果通常为多行数据。这种查询无法获取到查询之后更新的数据。

* **Lookup：** lookup 查询模式与 scan 查询模式不同，bounded scan 是对一个时间范围内的数据进行查询，而 `lookup` 查询只会对一个精确的时间点进行查询，所以查询结果只有一行数据。另外只有 `lookup join` 的右表才能使用 lookup 查询模式。

* **CDC:** 主要用于 Flink 的 `ETL` 任务当中。当 IoTDB 中的数据发生变化时，flink 会通过我们提供的 `CDC connector` 感知到，我们可以将感知到的变化数据转发给其他的外部数据源，以此达到 ETL 的目的。

### 写模式（Sink）

* **Streaming sink：** 用于 Flink 的 streaming mode 中，会将 Flink 中 Dynamic Table 的增删改记录实时的同步到 IoTDB 中。

* **Batch sink：** 用于 Flink 的 batch mode 中，用于将 Flink 的批量计算结果一次性写入 IoTDB 中。

## 使用方式

我们提供的 flink-sql-iotdb-connector 总共提供两种使用方式，一种是在项目开发过程中通过 Maven 的方式引用，另外一种是在 Flink 的 sql-client 中使用。我们将分别介绍这两种使用方式。

> 📌注：flink 版本要求 1.17.0 及以上
### Maven

我们只需要在项目的 pom 文件中添加以下依赖即可：

```xml
<dependency>
    <groupId>org.apache.iotdb</groupId>
    <artifactId>flink-sql-iotdb-connector</artifactId>
    <version>${iotdb.version}</version>
</dependency>
```

### sql-client

如果需要在 sql-client 中使用 flink-sql-iotdb-connector，先通过以下步骤来配置环境：

1. 在 [官网](https://iotdb.apache.org/Download/) 下载带依赖的 flink-sql-iotdb-connector  的 jar 包。

2. 将 jar 包拷贝到 `$FLINK_HOME/lib` 目录下。

3. 启动 Flink 集群。

4. 启动 sql-client。

此时就可以在 sql-client 中使用 flink-sql-iotdb-connector 了。

## 表结构规范

无论使用哪种类型的连接器，都需要满足以下的表结构规范：

- 所有使用 `IoTDB connector` 的表，第一列的列名必须是 `Time_`，而且数据类型必须是 `BIGINT` 类型。
- 除了 `Time_` 列以外的列名必须以 `root.` 开头。另外列名中的任意节点不能是纯数字，如果有纯数字，或者其他非法字符，必须使用反引号扩起来。比如：路径 root.sg.d0.123 是一个非法路径，但是 root.sg.d0.\`123\` 就是一个合法路径。
- 无论使用 `pattern` 或者 `sql` 从 IoTDB 中查询数据，查询结果的时间序列名需要包含 Flink 中除了 `Time_` 以外的所有列名。如果没有查询结果中没有相应的列名，则该列将用 null 去填充。
- flink-sql-iotdb-connector 中支持的数据类型有：`INT`, `BIGINT`, `FLOAT`, `DOUBLE`, `BOOLEAN`, `STRING`。Flink Table 中每一列的数据类型与其 IoTDB 中对应的时间序列类型都要匹配上，否则将会报错，并退出 Flink 任务。

以下用几个例子来说明 IoTDB 中的时间序列与 Flink Table 中列的对应关系。

## 读模式（Source）

### Scan Table (Bounded)

#### 参数

| 参数                     | 必填 | 默认           | 类型   | 描述                                                         |
| ------------------------ | ---- | -------------- | ------ | ------------------------------------------------------------ |
| nodeUrls                 | 否   | 127.0.0.1:6667 | String | 用来指定 IoTDB 的 datanode 地址，如果 IoTDB 是用集群模式搭建的话，可以指定多个地址，每个节点用逗号隔开。 |
| user                     | 否   | root           | String | IoTDB 用户名                                                 |
| password                 | 否   | root           | String | IoTDB 密码                                                   |
| scan.bounded.lower-bound | 否   | -1L            | Long   | bounded 的 scan 查询时的时间戳下界（包括），参数大于`0`时有效。 |
| scan.bounded.upper-bound | 否   | -1L            | Long   | bounded 的 scan 查询时的时间戳下界（包括），参数大于`0`时有效。 |
| sql                      | 是   | 无             | String | 用于在 IoTDB 端做查询。                                      |

#### 示例

该示例演示了如何在一个 Flink Table Job 中从 IoTDB 中通过`scan table`的方式读取数据：  
当前 IoTDB 中的数据如下：
```text
IoTDB> select ** from root;
+-----------------------------+-------------+-------------+-------------+
|                         Time|root.sg.d0.s0|root.sg.d1.s0|root.sg.d1.s1|
+-----------------------------+-------------+-------------+-------------+
|1970-01-01T08:00:00.001+08:00|    1.0833644|      2.34874|    1.2414109|
|1970-01-01T08:00:00.002+08:00|     4.929185|    3.1885583|    4.6980085|
|1970-01-01T08:00:00.003+08:00|    3.5206156|    3.5600138|    4.8080945|
|1970-01-01T08:00:00.004+08:00|    1.3449302|    2.8781595|    3.3195343|
|1970-01-01T08:00:00.005+08:00|    3.3079383|    3.3840187|    3.7278645|
+-----------------------------+-------------+-------------+-------------+
Total line number = 5
It costs 0.028s
```

```java
import org.apache.flink.table.api.*;

public class BoundedScanTest {
  public static void main(String[] args) throws Exception {
    // setup table environment
    EnvironmentSettings settings = EnvironmentSettings
            .newInstance()
            .inStreamingMode()
            .build();
    TableEnvironment tableEnv = TableEnvironment.create(settings);
    // setup schema
    Schema iotdbTableSchema =
            Schema.newBuilder()
                    .column("Time_", DataTypes.BIGINT())
                    .column("root.sg.d0.s0", DataTypes.FLOAT())
                    .column("root.sg.d1.s0", DataTypes.FLOAT())
                    .column("root.sg.d1.s1", DataTypes.FLOAT())
                    .build();
    // register table
    TableDescriptor iotdbDescriptor =
            TableDescriptor.forConnector("IoTDB")
                    .schema(iotdbTableSchema)
                    .option("nodeUrls", "127.0.0.1:6667")
                    .option("sql", "select ** from root")
                    .build();
    tableEnv.createTemporaryTable("iotdbTable", iotdbDescriptor);

    // output table
    tableEnv.from("iotdbTable").execute().print();
  }
}
```
执行完以上任务后，Flink 的控制台中输出的表如下：
```text
+----+----------------------+--------------------------------+--------------------------------+--------------------------------+
| op |                Time_ |                  root.sg.d0.s0 |                  root.sg.d1.s0 |                  root.sg.d1.s1 |
+----+----------------------+--------------------------------+--------------------------------+--------------------------------+
| +I |                    1 |                      1.0833644 |                        2.34874 |                      1.2414109 |
| +I |                    2 |                       4.929185 |                      3.1885583 |                      4.6980085 |
| +I |                    3 |                      3.5206156 |                      3.5600138 |                      4.8080945 |
| +I |                    4 |                      1.3449302 |                      2.8781595 |                      3.3195343 |
| +I |                    5 |                      3.3079383 |                      3.3840187 |                      3.7278645 |
+----+----------------------+--------------------------------+--------------------------------+--------------------------------+
```

### Lookup Point

#### 参数

| 参数                  | 必填 | 默认           | 类型    | 描述                                                         |
| --------------------- | ---- | -------------- | ------- | ------------------------------------------------------------ |
| nodeUrls              | 否   | 127.0.0.1:6667 | String  | 用来指定 IoTDB 的 datanode 地址，如果 IoTDB 是用集群模式搭建的话，可以指定多个地址，每个节点用逗号隔开。 |
| user                  | 否   | root           | String  | IoTDB 用户名                                                 |
| password              | 否   | root           | String  | IoTDB 密码                                                   |
| lookup.cache.max-rows | 否   | -1             | Integer | lookup 查询时，缓存表的最大行数，参数大于`0`时生效。         |
| lookup.cache.ttl-sec  | 否   | -1             | Integer | lookup 查询时，单点数据的丢弃时间，单位为`秒`。              |
| sql                   | 是   | 无             | String  | 用于在 IoTDB 端做查询。                                      |

#### 示例

该示例演示了如何将 IoTDB 中的`device`作为维度表进行`lookup`查询：

* 使用 `datagen connector` 生成两个字段作为 `Lookup Join` 的左表。第一个字段为自增字段，用来表示时间戳。第二个字段为随机字段，用来表示一个
  measurement 产生的时间序列。
* 通过 `IoTDB connector` 注册一个表作为 `Lookup Join` 的右表。
* 将两个表 join 起来。

当前 IoTDB 中的数据如下：

```text
IoTDB> select ** from root;
+-----------------------------+-------------+-------------+-------------+
|                         Time|root.sg.d0.s0|root.sg.d1.s0|root.sg.d1.s1|
+-----------------------------+-------------+-------------+-------------+
|1970-01-01T08:00:00.001+08:00|    1.0833644|      2.34874|    1.2414109|
|1970-01-01T08:00:00.002+08:00|     4.929185|    3.1885583|    4.6980085|
|1970-01-01T08:00:00.003+08:00|    3.5206156|    3.5600138|    4.8080945|
|1970-01-01T08:00:00.004+08:00|    1.3449302|    2.8781595|    3.3195343|
|1970-01-01T08:00:00.005+08:00|    3.3079383|    3.3840187|    3.7278645|
+-----------------------------+-------------+-------------+-------------+
Total line number = 5
It costs 0.028s
```

```java
import org.apache.flink.table.api.DataTypes;
import org.apache.flink.table.api.EnvironmentSettings;
import org.apache.flink.table.api.Schema;
import org.apache.flink.table.api.TableDescriptor;
import org.apache.flink.table.api.TableEnvironment;

public class LookupTest {
  public static void main(String[] args) {
    // setup environment
    EnvironmentSettings settings = EnvironmentSettings
            .newInstance()
            .inStreamingMode()
            .build();
    TableEnvironment tableEnv = TableEnvironment.create(settings);

    // register left table
    Schema dataGenTableSchema =
            Schema.newBuilder()
                    .column("Time_", DataTypes.BIGINT())
                    .column("s0", DataTypes.INT())
                    .build();

    TableDescriptor datagenDescriptor =
            TableDescriptor.forConnector("datagen")
                    .schema(dataGenTableSchema)
                    .option("fields.Time_.kind", "sequence")
                    .option("fields.Time_.start", "1")
                    .option("fields.Time_.end", "5")
                    .option("fields.s0.min", "1")
                    .option("fields.s0.max", "1")
                    .build();
    tableEnv.createTemporaryTable("leftTable", datagenDescriptor);

    // register right table
    Schema iotdbTableSchema =
            Schema.newBuilder()
                    .column("Time_", DataTypes.BIGINT())
                    .column("root.sg.d0.s0", DataTypes.FLOAT())
                    .column("root.sg.d1.s0", DataTypes.FLOAT())
                    .column("root.sg.d1.s1", DataTypes.FLOAT())
                    .build();

    TableDescriptor iotdbDescriptor =
            TableDescriptor.forConnector("IoTDB")
                    .schema(iotdbTableSchema)
                    .option("sql", "select ** from root")
                    .build();
    tableEnv.createTemporaryTable("rightTable", iotdbDescriptor);

    // join
    String sql =
            "SELECT l.Time_, l.s0,r.`root.sg.d0.s0`, r.`root.sg.d1.s0`, r.`root.sg.d1.s1`"
                    + "FROM (select *,PROCTIME() as proc_time from leftTable) AS l "
                    + "JOIN rightTable FOR SYSTEM_TIME AS OF l.proc_time AS r "
                    + "ON l.Time_ = r.Time_";

    // output table
    tableEnv.sqlQuery(sql).execute().print();
  }
}
```
执行完以上任务后，Flink 的控制台中输出的表如下：
```text
+----+----------------------+-------------+---------------+----------------------+--------------------------------+
| op |                Time_ |          s0 | root.sg.d0.s0 |        root.sg.d1.s0 |                  root.sg.d1.s1 |
+----+----------------------+-------------+---------------+----------------------+--------------------------------+
| +I |                    5 |           1 |     3.3079383 |            3.3840187 |                      3.7278645 |
| +I |                    2 |           1 |      4.929185 |            3.1885583 |                      4.6980085 |
| +I |                    1 |           1 |     1.0833644 |              2.34874 |                      1.2414109 |
| +I |                    4 |           1 |     1.3449302 |            2.8781595 |                      3.3195343 |
| +I |                    3 |           1 |     3.5206156 |            3.5600138 |                      4.8080945 |
+----+----------------------+-------------+---------------+----------------------+--------------------------------+
```

### CDC

#### 参数

| 参数          | 必填 | 默认           | 类型    | 描述                                                         |
| ------------- | ---- | -------------- | ------- | ------------------------------------------------------------ |
| nodeUrls      | 否   | 127.0.0.1:6667 | String  | 用来指定 IoTDB 的 datanode 地址，如果 IoTDB 是用集群模式搭建的话，可以指定多个地址，每个节点用逗号隔开。 |
| user          | 否   | root           | String  | IoTDB 用户名                                                 |
| password      | 否   | root           | String  | IoTDB 密码                                                   |
| mode          | 是   | BOUNDED        | ENUM    | **必须将此参数设置为 `CDC` 才能启动**                        |
| sql           | 是   | 无             | String  | 用于在 IoTDB 端做查询。                                      |
| cdc.port      | 否   | 8080           | Integer | 在 IoTDB 端提供 CDC 服务的端口号。                           |
| cdc.task.name | 是   | 无             | String  | 当 mode 参数设置为 CDC 时是必填项。用于在 IoTDB 端创建 Pipe 任务。 |
| cdc.pattern   | 是   | 无             | String  | 当 mode 参数设置为 CDC 时是必填项。用于在 IoTDB 端作为发送数据的过滤条件。 |

#### 示例

该示例演示了如何通过 `CDC Connector` 去获取 IoTDB 中指定路径下的变化数据：

* 通过 `CDC Connector` 创建一张 `CDC` 表。
* 将 `CDC` 表打印出来。

```java
import org.apache.flink.table.api.*;

public class CDCTest {
  public static void main(String[] args) {
    // setup environment
    EnvironmentSettings settings = EnvironmentSettings
            .newInstance()
            .inStreamingMode()
            .build();
    TableEnvironment tableEnv = TableEnvironment.create(settings);
    // setup schema
    Schema iotdbTableSchema = Schema
            .newBuilder()
            .column("Time_", DataTypes.BIGINT())
            .column("root.sg.d0.s0", DataTypes.FLOAT())
            .column("root.sg.d1.s0", DataTypes.FLOAT())
            .column("root.sg.d1.s1", DataTypes.FLOAT())
            .build();

    // register table
    TableDescriptor iotdbDescriptor = TableDescriptor
            .forConnector("IoTDB")
            .schema(iotdbTableSchema)
            .option("mode", "CDC")
            .option("cdc.task.name", "test")
            .option("cdc.pattern", "root.sg")
            .build();
    tableEnv.createTemporaryTable("iotdbTable", iotdbDescriptor);

    // output table
    tableEnv.from("iotdbTable").execute().print();
  }
}
```
运行以上的 Flink CDC 任务，然后在 IoTDB-cli 中执行以下 SQL：
```sql
insert into root.sg.d1(timestamp,s0,s1) values(6,1.0,1.0);
insert into root.sg.d1(timestamp,s0,s1) values(7,1.0,1.0);
insert into root.sg.d1(timestamp,s0,s1) values(6,2.0,1.0);
insert into root.sg.d0(timestamp,s0) values(7,2.0);
```
然后，Flink 的控制台中将打印该条数据：
```text
+----+----------------------+--------------------------------+--------------------------------+--------------------------------+
| op |                Time_ |                  root.sg.d0.s0 |                  root.sg.d1.s0 |                  root.sg.d1.s1 |
+----+----------------------+--------------------------------+--------------------------------+--------------------------------+
| +I |                    7 |                         <NULL> |                            1.0 |                            1.0 |
| +I |                    6 |                         <NULL> |                            1.0 |                            1.0 |
| +I |                    6 |                         <NULL> |                            2.0 |                            1.0 |
| +I |                    7 |                            2.0 |                         <NULL> |                         <NULL> |
```

## 写模式（Sink）

### Streaming Sink

#### 参数

| 参数     | 必填 | 默认           | 类型    | 描述                                                         |
| -------- | ---- | -------------- | ------- | ------------------------------------------------------------ |
| nodeUrls | 否   | 127.0.0.1:6667 | String  | 用来指定 IoTDB 的 datanode 地址，如果 IoTDB 是用集群模式搭建的话，可以指定多个地址，每个节点用逗号隔开。 |
| user     | 否   | root           | String  | IoTDB 用户名                                                 |
| password | 否   | root           | String  | IoTDB 密码                                                   |
| aligned  | 否   | false          | Boolean | 向 IoTDB 写入数据时是否调用`aligned`接口。                   |

#### 示例

该示例演示了如何在一个 Flink Table 的 Streaming Job 中如何将数据写入到 IoTDB 中：

* 通过 `datagen connector` 生成一张源数据表。
* 通过 `IoTDB connector` 注册一个输出表。
* 将数据源表的数据插入到输出表中。

```java
import org.apache.flink.table.api.DataTypes;
import org.apache.flink.table.api.EnvironmentSettings;
import org.apache.flink.table.api.Schema;
import org.apache.flink.table.api.Table;
import org.apache.flink.table.api.TableDescriptor;
import org.apache.flink.table.api.TableEnvironment;

public class StreamingSinkTest {
    public static void main(String[] args) {
        // setup environment
        EnvironmentSettings settings = EnvironmentSettings
                .newInstance()
                .inStreamingMode()
                .build();
        TableEnvironment tableEnv = TableEnvironment.create(settings);

        // create data source table
        Schema dataGenTableSchema = Schema
                .newBuilder()
                .column("Time_", DataTypes.BIGINT())
                .column("root.sg.d0.s0", DataTypes.FLOAT())
                .column("root.sg.d1.s0", DataTypes.FLOAT())
                .column("root.sg.d1.s1", DataTypes.FLOAT())
                .build();
        TableDescriptor descriptor = TableDescriptor
                .forConnector("datagen")
                .schema(dataGenTableSchema)
                .option("rows-per-second", "1")
                .option("fields.Time_.kind", "sequence")
                .option("fields.Time_.start", "1")
                .option("fields.Time_.end", "5")
                .option("fields.root.sg.d0.s0.min", "1")
                .option("fields.root.sg.d0.s0.max", "5")
                .option("fields.root.sg.d1.s0.min", "1")
                .option("fields.root.sg.d1.s0.max", "5")
                .option("fields.root.sg.d1.s1.min", "1")
                .option("fields.root.sg.d1.s1.max", "5")
                .build();
        // register source table
        tableEnv.createTemporaryTable("dataGenTable", descriptor);
        Table dataGenTable = tableEnv.from("dataGenTable");

        // create iotdb sink table
        TableDescriptor iotdbDescriptor = TableDescriptor
                .forConnector("IoTDB")
                .schema(dataGenTableSchema)
                .build();
        tableEnv.createTemporaryTable("iotdbSinkTable", iotdbDescriptor);

        // insert data
        dataGenTable.executeInsert("iotdbSinkTable").print();
    }
}
```

上述任务执行完成后，在 IoTDB 的 cli 中查询结果如下：

```text
IoTDB> select ** from root;
+-----------------------------+-------------+-------------+-------------+
|                         Time|root.sg.d0.s0|root.sg.d1.s0|root.sg.d1.s1|
+-----------------------------+-------------+-------------+-------------+
|1970-01-01T08:00:00.001+08:00|    1.0833644|      2.34874|    1.2414109|
|1970-01-01T08:00:00.002+08:00|     4.929185|    3.1885583|    4.6980085|
|1970-01-01T08:00:00.003+08:00|    3.5206156|    3.5600138|    4.8080945|
|1970-01-01T08:00:00.004+08:00|    1.3449302|    2.8781595|    3.3195343|
|1970-01-01T08:00:00.005+08:00|    3.3079383|    3.3840187|    3.7278645|
+-----------------------------+-------------+-------------+-------------+
Total line number = 5
It costs 0.054s
```

### Batch Sink

#### 参数

| 参数     | 必填 | 默认           | 类型    | 描述                                                         |
| -------- | ---- | -------------- | ------- | ------------------------------------------------------------ |
| nodeUrls | 否   | 127.0.0.1:6667 | String  | 用来指定 IoTDB 的 datanode 地址，如果 IoTDB 是用集群模式搭建的话，可以指定多个地址，每个节点用逗号隔开。 |
| user     | 否   | root           | String  | IoTDB 用户名                                                 |
| password | 否   | root           | String  | IoTDB 密码                                                   |
| aligned  | 否   | false          | Boolean | 向 IoTDB 写入数据时是否调用`aligned`接口。                   |

#### 示例

该示例演示了如何在一个 Flink Table 的 Batch Job 中如何将数据写入到 IoTDB 中：

* 通过 `IoTDB connector` 生成一张源数据表。
* 通过 `IoTDB connector` 注册一个输出表。
* 将原数据表中的列重命名后写入写回 IoTDB。

```java
import org.apache.flink.table.api.DataTypes;
import org.apache.flink.table.api.EnvironmentSettings;
import org.apache.flink.table.api.Schema;
import org.apache.flink.table.api.Table;
import org.apache.flink.table.api.TableDescriptor;
import org.apache.flink.table.api.TableEnvironment;

import static org.apache.flink.table.api.Expressions.$;

public class BatchSinkTest {
  public static void main(String[] args) {
    // setup environment
    EnvironmentSettings settings = EnvironmentSettings
            .newInstance()
            .inBatchMode()
            .build();
    TableEnvironment tableEnv = TableEnvironment.create(settings);

    // create source table
    Schema sourceTableSchema = Schema
            .newBuilder()
            .column("Time_", DataTypes.BIGINT())
            .column("root.sg.d0.s0", DataTypes.FLOAT())
            .column("root.sg.d1.s0", DataTypes.FLOAT())
            .column("root.sg.d1.s1", DataTypes.FLOAT())
            .build();
    TableDescriptor sourceTableDescriptor = TableDescriptor
            .forConnector("IoTDB")
            .schema(sourceTableSchema)
            .option("sql", "select ** from root.sg.d0,root.sg.d1")
            .build();

    tableEnv.createTemporaryTable("sourceTable", sourceTableDescriptor);
    Table sourceTable = tableEnv.from("sourceTable");
    // register sink table
    Schema sinkTableSchema = Schema
            .newBuilder()
            .column("Time_", DataTypes.BIGINT())
            .column("root.sg.d2.s0", DataTypes.FLOAT())
            .column("root.sg.d3.s0", DataTypes.FLOAT())
            .column("root.sg.d3.s1", DataTypes.FLOAT())
            .build();
    TableDescriptor sinkTableDescriptor = TableDescriptor
            .forConnector("IoTDB")
            .schema(sinkTableSchema)
            .build();
    tableEnv.createTemporaryTable("sinkTable", sinkTableDescriptor);

    // insert data
    sourceTable.renameColumns(
            $("root.sg.d0.s0").as("root.sg.d2.s0"),
            $("root.sg.d1.s0").as("root.sg.d3.s0"),
            $("root.sg.d1.s1").as("root.sg.d3.s1")
    ).insertInto("sinkTable").execute().print();
  }
}
```

上述任务执行完成后，在 IoTDB 的 cli 中查询结果如下：

```text
IoTDB> select ** from root;
+-----------------------------+-------------+-------------+-------------+-------------+-------------+-------------+
|                         Time|root.sg.d0.s0|root.sg.d1.s0|root.sg.d1.s1|root.sg.d2.s0|root.sg.d3.s0|root.sg.d3.s1|
+-----------------------------+-------------+-------------+-------------+-------------+-------------+-------------+
|1970-01-01T08:00:00.001+08:00|    1.0833644|      2.34874|    1.2414109|    1.0833644|      2.34874|    1.2414109|
|1970-01-01T08:00:00.002+08:00|     4.929185|    3.1885583|    4.6980085|     4.929185|    3.1885583|    4.6980085|
|1970-01-01T08:00:00.003+08:00|    3.5206156|    3.5600138|    4.8080945|    3.5206156|    3.5600138|    4.8080945|
|1970-01-01T08:00:00.004+08:00|    1.3449302|    2.8781595|    3.3195343|    1.3449302|    2.8781595|    3.3195343|
|1970-01-01T08:00:00.005+08:00|    3.3079383|    3.3840187|    3.7278645|    3.3079383|    3.3840187|    3.7278645|
+-----------------------------+-------------+-------------+-------------+-------------+-------------+-------------+
Total line number = 5
It costs 0.015s
```