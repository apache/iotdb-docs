# flink-sql-iotdb-connector

## flink 介绍

Apache Flink 功能强大，支持开发和运行多种不同种类的应用程序。它的主要特性包括：批流一体化、精密的状态管理、事件时间支持以及精确一次的状态一致性保障等。Flink 不仅可以运行在包括 YARN、 Mesos、Kubernetes 在内的多种资源管理框架上，还支持在裸机集群上独立部署。在启用高可用选项的情况下，它不存在单点失效问题。事实证明，Flink 已经可以扩展到数千核心，其状态可以达到 TB 级别，且仍能保持高吞吐、低延迟的特性。世界各地有很多要求严苛的流处理应用都运行在 Flink 之上。

### source 的区别

bounded scan：bounded scan 的主要实现方式是通过指定  `时间序列` 以及 `查询条件的上下界（可选）`来进行查询，并且查询结果通常为多行数据。这种查询无法获取到查询之后更新的数据。

lookup：lookup 查询模式与 scan 查询模式不同，bounded scan 是对一个时间范围内的数据进行查询，而 `lookup` 查询只会对一个精确的时间点进行查询，所以查询结果只有一行数据。另外只有 `lookup join` 的右表才能使用 lookup 查询模式。

CDC: 主要用于 Flink 的 `ETL` 任务当中。当 IoTDB 中的数据发生变化时，flink 会通过我们提供的 `CDC connector` 感知到，我们可以将感知到的变化数据转发给其他的外部数据源，以此达到 ETL 的目的。

## 使用方式

我们提供的 flink-sql-iotdb-connector 总共提供两种使用方式，一种是在项目开发过程中通过 Maven 的方式引用，另外一种是在 Flink 的 sql-client 中使用。我们将分别介绍这两种使用方式。

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

## 支持的模式

| Source                    | Sink                       |
| ------------------------- | -------------------------- |
| Bounded Scan, Lookup, CDC | Streaming Sink, Batch Sink |

## 参数

| 参数                       | 必填  | 默认             | 类型      | 描述                                                                 |
| ------------------------ | --- | -------------- | ------- | ------------------------------------------------------------------ |
| nodeUrls                 | 否   | 127.0.0.1:6667 | String  | 用来指定 IoTDB 的 datanode 地址，如果 IoTDB 是用集群模式搭建的话，可以指定多个地址，每个节点用逗号隔开。   |
| user                     | 否   | root           | String  | IoTDB 用户名                                                          |
| password                 | 否   | root           | String  | IoTDB 密码                                                           |
| aligned                  | 否   | false          | Boolean | 向 IoTDB 写入数据时是否调用`aligned`接口。                                      |
| lookup.cache.max-rows    | 否   | -1             | Integer | lookup 查询时，缓存表的最大行数，参数大于`0`时生效。                                    |
| lookup.cache.ttl-sec     | 否   | -1             | Integer | lookup 查询时，单点数据的丢弃时间，单位为`秒`。                                       |
| scan.bounded.lower-bound | 否   | -1L            | Long    | bounded 的 scan 查询时的时间戳下界（包括），参数大于`0`时有效。                           |
| scan.bounded.upper-bound | 否   | -1L            | Long    | bounded 的 scan 查询时的时间戳下界（包括），参数大于`0`时有效。                           |
| mode                     | 否   | BOUNDED        | ENUM    | 当前有 BOUNDED 与 CDC 两个选项。如果需要使用 CDC connector，将参数设置为 CDC 即可。         |
| cdc.port                 | 否   | 8080           | Integer | 在 IoTDB 端提供 CDC 服务的端口号。                                            |
| cdc.task.name            | 否   | 无              | String  | 当 mode 参数设置为 CDC 时是必填项。用于在 IoTDB 端创建 Pipe 任务。                      |
| cdc.pattern              | 否   | 无              | String  | 当 mode 参数设置为 CDC 时是必填项。用于在 IoTDB 端作为发送数据的过滤条件。                     |
| sql                      | 否   | 无              | String  | 当 connector 工作在 `bounded scan` 或者 `lookup` 模式下为必填项。用于在 IoTDB 端做查询。 |

## 示例代码

### Scan Table(Bounded)

该示例演示了如何在一个 Flink Table Job 中从 IoTDB 中通过`scan table`的方式读取数据：

```java
import org.apache.flink.table.api.*;

public class ScanTest {
    public static void main(String[] args) throws Exception {
        // setup table environment

        // setup schema
        Schema iotdbTableSchema =
                Schema.newBuilder()
                        .column("Time_", DataTypes.BIGINT())
                        .column("root.sg.d0.s0", DataTypes.INT())
                        .column("root.sg.d0.s1", DataTypes.BIGINT())
                        .column("root.sg.d0.s2", DataTypes.FLOAT())
                        .column("root.sg.d0.s3", DataTypes.DOUBLE())
                        .column("root.sg.d0.s4", DataTypes.BOOLEAN())
                        .column("root.sg.d0.s5", DataTypes.STRING())
                        .build();
        // register table
        TableDescriptor iotdbDescriptor =
                TableDescriptor.forConnector("IoTDB")
                        .schema(iotdbTableSchema)
                        .option("sql", "select * from root.sg.d0")
                        .build();
        tableEnv.createTemporaryTable("iotdbTable", iotdbDescriptor);

        // output table
        tableEnv.from("iotdbTable").execute().print();
    }
}
```

### Lookup Point

该示例演示了如何将 IoTDB 中的`device`作为维度表进行`lookup`查询：

* 使用 `datagen connector` 生成两个字段作为 `Lookup Join` 的左表。第一个字段为自增字段，用来表示时间戳。第二个字段为随机字段，用来表示一个
  measurement 产生的时间序列。
* 通过 `IoTDB connector` 注册一个表作为 `Lookup Join` 的右表。
* 将两个表 join 起来。

```java
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.table.api.*;
import org.apache.flink.table.api.bridge.java.StreamTableEnvironment;
import org.apache.flink.table.functions.TemporalTableFunction;

import static org.apache.flink.table.api.Expressions.$;

public class LookupTest {
    public static void main(String[] args) {
        // setup environment

        // register left table
        Schema dataGenTableSchema =
                Schema.newBuilder()
                        .column("Time_", DataTypes.BIGINT())
                        .column("s6", DataTypes.INT())
                        .build();

        TableDescriptor datagenDescriptor =
                TableDescriptor.forConnector("datagen")
                        .schema(dataGenTableSchema)
                        .option("fields.Time_.kind", "sequence")
                        .option("fields.Time_.start", "1")
                        .option("fields.Time_.end", "100")
                        .option("fields.s6.min", "1")
                        .option("fields.s6.max", "1")
                        .build();
        tableEnv.createTemporaryTable("leftTable", datagenDescriptor);

        // register right table
        Schema iotdbTableSchema =
                Schema.newBuilder()
                        .column("Time_", DataTypes.BIGINT())
                        .column("root.test.flink.lookup.s0", DataTypes.INT())
                        .column("root.test.flink.lookup.s1", DataTypes.BIGINT())
                        .column("root.test.flink.lookup.s2", DataTypes.FLOAT())
                        .column("root.test.flink.lookup.s3", DataTypes.DOUBLE())
                        .column("root.test.flink.lookup.s4", DataTypes.BOOLEAN())
                        .column("root.test.flink.lookup.s5", DataTypes.STRING())
                        .build();

        TableDescriptor iotdbDescriptor =
                TableDescriptor.forConnector("IoTDB")
                        .schema(iotdbTableSchema)
                        .option("sql", "select * from root.test.flink.lookup")
                        .build();
        tableEnv.createTemporaryTable("rightTable", iotdbDescriptor);

        // join
        String sql =
                "SELECT l.Time_, r.`root.test.flink.lookup.s0`, r.`root.test.flink.lookup.s1`, r.`root.test.flink.lookup.s2`, r.`root.test.flink.lookup.s3`, r.`root.test.flink.lookup.s4`, r.`root.test.flink.lookup.s5`, l.s6 "
                        + "FROM (select *,PROCTIME() as proc_time from leftTable) AS l "
                        + "JOIN rightTable FOR SYSTEM_TIME AS OF l.proc_time AS r "
                        + "ON l.Time_ = r.Time_";

        // output table
        tableEnv.sqlQuery(sql).execute();
    }
}
```

### CDC

该示例演示了如何通过 `CDC Connector` 去获取 IoTDB 中指定路径下的变化数据：

* 通过 `CDC Connector` 创建一张 `CDC` 表。
* 将 `CDC` 表打印出来。

```java
import org.apache.flink.table.api.*;

public class CDCTest {
    public static void main(String[] args) {
        // setup environment

        // setup schema
        Schema iotdbTableSchema = Schema
                .newBuilder()
                .column("Time_", DataTypes.BIGINT())
                .column("root.sg.d0.s0", DataTypes.FLOAT())
                .column("root.sg.d0.s1", DataTypes.FLOAT())
                .column("root.sg.d0.s2", DataTypes.FLOAT())
                .column("root.sg.d0.s3", DataTypes.FLOAT())
                .column("root.sg.d0.s4", DataTypes.STRING())
                .column("root.sg.d0.s5", DataTypes.BOOLEAN())
                .build();

        // register table
        TableDescriptor iotdbDescriptor = TableDescriptor
                .forConnector("IoTDB")
                .schema(iotdbTableSchema)
                .option("mode", "CDC")
                .option("cdc.task.name", "test")
                .option("cdc.pattern", "root.sg.d0")
                .build();
        tableEnv.createTemporaryTable("iotdbTable", iotdbDescriptor);

        // output table
        tableEnv.from("iotdbTable").execute().print();
    }
}
```

### Sink

该示例演示了如何在一个 Flink Table Job 中如何将数据写入到 IoTDB 中：

* 通过 `datagen` connector 生成一张源数据表。
* 通过 `IoTDB` connector 注册一个输出表。
* 将数据源表的数据插入到输出表中。

```java
import org.apache.flink.table.api.*;

public class SinkTest {
    public static void main(String[] args) {
        // setup environment

        // create data source table
        Schema dataGenTableSchema = Schema
                .newBuilder()
                .column("Time_", DataTypes.BIGINT())
                .column("root.sg.d0.s0", DataTypes.FLOAT())
                .column("root.sg.d0.s1", DataTypes.FLOAT())
                .column("root.sg.d0.s2", DataTypes.FLOAT())
                .column("root.sg.d0.s3", DataTypes.FLOAT())
                .column("root.sg.d0.s4", DataTypes.FLOAT())
                .column("root.sg.d0.s5", DataTypes.FLOAT())
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
                .option("fields.root.sg.d0.s1.min", "1")
                .option("fields.root.sg.d0.s1.max", "5")
                .option("fields.root.sg.d0.s2.min", "1")
                .option("fields.root.sg.d0.s2.max", "5")
                .option("fields.root.sg.d0.s3.min", "1")
                .option("fields.root.sg.d0.s3.max", "5")
                .option("fields.root.sg.d0.s4.min", "1")
                .option("fields.root.sg.d0.s4.max", "5")
                .option("fields.root.sg.d0.s5.min", "1")
                .option("fields.root.sg.d0.s5.max", "5")
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

## 注意

1. 所有使用 `IoTDB connector` 的表，第一列的列名必须是 `Time_`，而且数据类型必须是 `BIGINT` 类型。
2. 除了 `Time_` 列以外的列名必须以 `root.` 开头。另外列名中的任意节点不能是纯数字，如果有纯数字，或者其他非法字符，必须使用反引号扩起来。比如：路径  root.sg.d0.123 是一个非法路径，但是 root.sg.d0.\`123\` 就是一个合法路径。 
3. 无论使用 `pattern` 或者 `sql` 从 IoTDB 中查询数据，查询结果的时间序列名需要包含 Flink 中除了 `Time_` 以外的所有列名。如果没有查询结果中没有相应的列名，则该列将用 null 去填充。
4. `IoTDB` connector 支持的数据类型有：`INT`, `BIGINT`, `FLOAT`, `DOUBLE`, `BOOLEAN`, `STRING`。