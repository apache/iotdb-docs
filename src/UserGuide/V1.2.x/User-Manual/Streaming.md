<!--

    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at
    
        http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.

-->

# IoTDB Stream Processing Framework

The IoTDB stream processing framework allows users to implement customized stream processing logic, which can monitor and capture storage engine changes, transform changed data, and push transformed data outward.

We call <font color=RED>a data flow processing task a Pipe</font>. A stream processing task (Pipe) contains three subtasks:

- Extract
- Process
- Send (Connect)

The stream processing framework allows users to customize the processing logic of three subtasks using Java language and process data in a UDF-like manner.
In a Pipe, the three subtasks mentioned above are executed and implemented by three types of plugins. Data flows through these three plugins sequentially for processing:
Pipe Extractor is used to extract data, Pipe Processor is used to process data, Pipe Connector is used to send data, and the final data will be sent to an external system.

**The model for a Pipe task is as follows:**

![任务模型图](https://alioss.timecho.com/docs/img/%E5%90%8C%E6%AD%A5%E5%BC%95%E6%93%8E.jpeg)
A data stream processing task essentially describes the attributes of the Pipe Extractor, Pipe Processor, and Pipe Connector plugins.

Users can configure the specific attributes of these three subtasks declaratively using SQL statements. By combining different attributes, flexible data ETL (Extract, Transform, Load) capabilities can be achieved.

Using the stream processing framework, it is possible to build a complete data pipeline to fulfill various requirements such as *edge-to-cloud synchronization, remote disaster recovery, and read/write load balancing across multiple databases*.

## Custom Stream Processing Plugin Development

### Programming development dependencies

It is recommended to use Maven to build the project. Add the following dependencies in the `pom.xml` file. Please make sure to choose dependencies with the same version as the IoTDB server version.

```xml
<dependency>
    <groupId>org.apache.iotdb</groupId>
    <artifactId>pipe-api</artifactId>
    <version>1.2.1</version>
    <scope>provided</scope>
</dependency>
```

### Event-Driven Programming Model

The design of user programming interfaces for stream processing plugins follows the principles of the event-driven programming model. In this model, events serve as the abstraction of data in the user programming interface. The programming interface is decoupled from the specific execution method, allowing the focus to be on describing how the system expects events (data) to be processed upon arrival.

In the user programming interface of stream processing plugins, events abstract the write operations of database data. Events are captured by the local stream processing engine and passed sequentially through the three stages of stream processing, namely Pipe Extractor, Pipe Processor, and Pipe Connector plugins. User logic is triggered and executed within these three plugins.

To accommodate both low-latency stream processing in low-load scenarios and high-throughput stream processing in high-load scenarios at the edge, the stream processing engine dynamically chooses the processing objects from operation logs and data files. Therefore, the user programming interface for stream processing requires the user to provide the handling logic for two types of events: TabletInsertionEvent for operation log write events and TsFileInsertionEvent for data file write events.

#### **TabletInsertionEvent**

The TabletInsertionEvent is a high-level data abstraction for user write requests, which provides the ability to manipulate the underlying data of the write request by providing a unified operation interface.

For different database deployments, the underlying storage structure corresponding to the operation log write event is different. For stand-alone deployment scenarios, the operation log write event is an encapsulation of write-ahead log (WAL) entries; for distributed deployment scenarios, the operation log write event is an encapsulation of individual node consensus protocol operation log entries.

For write operations generated by different write request interfaces of the database, the data structure of the request structure corresponding to the operation log write event is also different.IoTDB provides many write interfaces such as InsertRecord, InsertRecords, InsertTablet, InsertTablets, and so on, and each kind of write request uses a completely different serialisation method to generate a write request. completely different serialisation methods and generate different binary entries.

The existence of operation log write events provides users with a unified view of data operations, which shields the implementation differences of the underlying data structures, greatly reduces the programming threshold for users, and improves the ease of use of the functionality.

```java
/** TabletInsertionEvent is used to define the event of data insertion. */
public interface TabletInsertionEvent extends Event {

  /**
   * The consumer processes the data row by row and collects the results by RowCollector.
   *
   * @return {@code Iterable<TabletInsertionEvent>} a list of new TabletInsertionEvent contains the
   *     results collected by the RowCollector
   */
  Iterable<TabletInsertionEvent> processRowByRow(BiConsumer<Row, RowCollector> consumer);

  /**
   * The consumer processes the Tablet directly and collects the results by RowCollector.
   *
   * @return {@code Iterable<TabletInsertionEvent>} a list of new TabletInsertionEvent contains the
   *     results collected by the RowCollector
   */
  Iterable<TabletInsertionEvent> processTablet(BiConsumer<Tablet, RowCollector> consumer);
}
```

#### **TsFileInsertionEvent**

The TsFileInsertionEvent represents a high-level abstraction of the database's disk flush operation and is a collection of multiple TabletInsertionEvents.

IoTDB's storage engine is based on the LSM (Log-Structured Merge) structure. When data is written, the write operations are first flushed to log-structured files, while the written data is also stored in memory. When the memory reaches its capacity limit, a flush operation is triggered, converting the data in memory into a database file while deleting the previously written log entries. During the conversion from memory data to database file data, two compression processes, encoding compression and universal compression, are applied. As a result, the data in the database file occupies less space compared to the original data in memory.

In extreme network conditions, directly transferring data files is more cost-effective than transmitting individual write operations. It consumes lower network bandwidth and achieves faster transmission speed. However, there is no such thing as a free lunch. Performing calculations on data in the disk file incurs additional costs for file I/O compared to performing calculations directly on data in memory. Nevertheless, the coexistence of disk data files and memory write operations permits dynamic trade-offs and adjustments. It is based on this observation that the data file write event is introduced into the event model of the plugin.

In summary, the data file write event appears in the event stream of stream processing plugins in the following two scenarios:

1. Historical data extraction: Before a stream processing task starts, all persisted write data exists in the form of TsFiles. When collecting historical data at the beginning of a stream processing task, the historical data is abstracted as TsFileInsertionEvent.

2. Real-time data extraction: During the execution of a stream processing task, if the speed of processing the log entries representing real-time operations is slower than the rate of write requests, the unprocessed log entries will be persisted to disk in the form of TsFiles. When these data are extracted by the stream processing engine, they are abstracted as TsFileInsertionEvent.

```java
/**
 * TsFileInsertionEvent is used to define the event of writing TsFile. Event data stores in disks,
 * which is compressed and encoded, and requires IO cost for computational processing.
 */
public interface TsFileInsertionEvent extends Event {

  /**
   * The method is used to convert the TsFileInsertionEvent into several TabletInsertionEvents.
   *
   * @return {@code Iterable<TabletInsertionEvent>} the list of TabletInsertionEvent
   */
  Iterable<TabletInsertionEvent> toTabletInsertionEvents();
}
```

### Custom Stream Processing Plugin Programming Interface Definition

Based on the custom stream processing plugin programming interface, users can easily write data extraction plugins, data processing plugins, and data sending plugins, allowing the stream processing functionality to adapt flexibly to various industrial scenarios.
#### Data Extraction Plugin Interface

Data extraction is the first stage of the three-stage process of stream processing, which includes data extraction, data processing, and data sending. The data extraction plugin (PipeExtractor) serves as a bridge between the stream processing engine and the storage engine. It captures various data write events by listening to the behavior of the storage engine.
```java
/**
 * PipeExtractor
 *
 * <p>PipeExtractor is responsible for capturing events from sources.
 *
 * <p>Various data sources can be supported by implementing different PipeExtractor classes.
 *
 * <p>The lifecycle of a PipeExtractor is as follows:
 *
 * <ul>
 *   <li>When a collaboration task is created, the KV pairs of `WITH EXTRACTOR` clause in SQL are
 *       parsed and the validation method {@link PipeExtractor#validate(PipeParameterValidator)}
 *       will be called to validate the parameters.
 *   <li>Before the collaboration task starts, the method {@link
 *       PipeExtractor#customize(PipeParameters, PipeExtractorRuntimeConfiguration)} will be called
 *       to config the runtime behavior of the PipeExtractor.
 *   <li>Then the method {@link PipeExtractor#start()} will be called to start the PipeExtractor.
 *   <li>While the collaboration task is in progress, the method {@link PipeExtractor#supply()} will
 *       be called to capture events from sources and then the events will be passed to the
 *       PipeProcessor.
 *   <li>The method {@link PipeExtractor#close()} will be called when the collaboration task is
 *       cancelled (the `DROP PIPE` command is executed).
 * </ul>
 */
public interface PipeExtractor extends PipePlugin {

  /**
   * This method is mainly used to validate {@link PipeParameters} and it is executed before {@link
   * PipeExtractor#customize(PipeParameters, PipeExtractorRuntimeConfiguration)} is called.
   *
   * @param validator the validator used to validate {@link PipeParameters}
   * @throws Exception if any parameter is not valid
   */
  void validate(PipeParameterValidator validator) throws Exception;

  /**
   * This method is mainly used to customize PipeExtractor. In this method, the user can do the
   * following things:
   *
   * <ul>
   *   <li>Use PipeParameters to parse key-value pair attributes entered by the user.
   *   <li>Set the running configurations in PipeExtractorRuntimeConfiguration.
   * </ul>
   *
   * <p>This method is called after the method {@link
   * PipeExtractor#validate(PipeParameterValidator)} is called.
   *
   * @param parameters used to parse the input parameters entered by the user
   * @param configuration used to set the required properties of the running PipeExtractor
   * @throws Exception the user can throw errors if necessary
   */
  void customize(PipeParameters parameters, PipeExtractorRuntimeConfiguration configuration)
          throws Exception;

  /**
   * Start the extractor. After this method is called, events should be ready to be supplied by
   * {@link PipeExtractor#supply()}. This method is called after {@link
   * PipeExtractor#customize(PipeParameters, PipeExtractorRuntimeConfiguration)} is called.
   *
   * @throws Exception the user can throw errors if necessary
   */
  void start() throws Exception;

  /**
   * Supply single event from the extractor and the caller will send the event to the processor.
   * This method is called after {@link PipeExtractor#start()} is called.
   *
   * @return the event to be supplied. the event may be null if the extractor has no more events at
   *     the moment, but the extractor is still running for more events.
   * @throws Exception the user can throw errors if necessary
   */
  Event supply() throws Exception;
}
```

#### Data Processing Plugin Interface

Data processing is the second stage of the three-stage process of stream processing, which includes data extraction, data processing, and data sending. The data processing plugin (PipeProcessor) is primarily used for filtering and transforming the various events captured by the data extraction plugin (PipeExtractor).

```java
/**
 * PipeProcessor
 *
 * <p>PipeProcessor is used to filter and transform the Event formed by the PipeExtractor.
 *
 * <p>The lifecycle of a PipeProcessor is as follows:
 *
 * <ul>
 *   <li>When a collaboration task is created, the KV pairs of `WITH PROCESSOR` clause in SQL are
 *       parsed and the validation method {@link PipeProcessor#validate(PipeParameterValidator)}
 *       will be called to validate the parameters.
 *   <li>Before the collaboration task starts, the method {@link
 *       PipeProcessor#customize(PipeParameters, PipeProcessorRuntimeConfiguration)} will be called
 *       to config the runtime behavior of the PipeProcessor.
 *   <li>While the collaboration task is in progress:
 *       <ul>
 *         <li>PipeExtractor captures the events and wraps them into three types of Event instances.
 *         <li>PipeProcessor processes the event and then passes them to the PipeConnector. The
 *             following 3 methods will be called: {@link
 *             PipeProcessor#process(TabletInsertionEvent, EventCollector)}, {@link
 *             PipeProcessor#process(TsFileInsertionEvent, EventCollector)} and {@link
 *             PipeProcessor#process(Event, EventCollector)}.
 *         <li>PipeConnector serializes the events into binaries and send them to sinks.
 *       </ul>
 *   <li>When the collaboration task is cancelled (the `DROP PIPE` command is executed), the {@link
 *       PipeProcessor#close() } method will be called.
 * </ul>
 */
public interface PipeProcessor extends PipePlugin {

  /**
   * This method is mainly used to validate {@link PipeParameters} and it is executed before {@link
   * PipeProcessor#customize(PipeParameters, PipeProcessorRuntimeConfiguration)} is called.
   *
   * @param validator the validator used to validate {@link PipeParameters}
   * @throws Exception if any parameter is not valid
   */
  void validate(PipeParameterValidator validator) throws Exception;

  /**
   * This method is mainly used to customize PipeProcessor. In this method, the user can do the
   * following things:
   *
   * <ul>
   *   <li>Use PipeParameters to parse key-value pair attributes entered by the user.
   *   <li>Set the running configurations in PipeProcessorRuntimeConfiguration.
   * </ul>
   *
   * <p>This method is called after the method {@link
   * PipeProcessor#validate(PipeParameterValidator)} is called and before the beginning of the
   * events processing.
   *
   * @param parameters used to parse the input parameters entered by the user
   * @param configuration used to set the required properties of the running PipeProcessor
   * @throws Exception the user can throw errors if necessary
   */
  void customize(PipeParameters parameters, PipeProcessorRuntimeConfiguration configuration)
          throws Exception;

  /**
   * This method is called to process the TabletInsertionEvent.
   *
   * @param tabletInsertionEvent TabletInsertionEvent to be processed
   * @param eventCollector used to collect result events after processing
   * @throws Exception the user can throw errors if necessary
   */
  void process(TabletInsertionEvent tabletInsertionEvent, EventCollector eventCollector)
          throws Exception;

  /**
   * This method is called to process the TsFileInsertionEvent.
   *
   * @param tsFileInsertionEvent TsFileInsertionEvent to be processed
   * @param eventCollector used to collect result events after processing
   * @throws Exception the user can throw errors if necessary
   */
  default void process(TsFileInsertionEvent tsFileInsertionEvent, EventCollector eventCollector)
          throws Exception {
    for (final TabletInsertionEvent tabletInsertionEvent :
            tsFileInsertionEvent.toTabletInsertionEvents()) {
      process(tabletInsertionEvent, eventCollector);
    }
  }

  /**
   * This method is called to process the Event.
   *
   * @param event Event to be processed
   * @param eventCollector used to collect result events after processing
   * @throws Exception the user can throw errors if necessary
   */
  void process(Event event, EventCollector eventCollector) throws Exception;
}
```

#### Data Sending Plugin Interface

Data sending is the third stage of the three-stage process of stream processing, which includes data extraction, data processing, and data sending. The data sending plugin (PipeConnector) is responsible for sending the various events processed by the data processing plugin (PipeProcessor). It serves as the network implementation layer of the stream processing framework and should support multiple real-time communication protocols and connectors in its interface.

```java
/**
 * PipeConnector
 *
 * <p>PipeConnector is responsible for sending events to sinks.
 *
 * <p>Various network protocols can be supported by implementing different PipeConnector classes.
 *
 * <p>The lifecycle of a PipeConnector is as follows:
 *
 * <ul>
 *   <li>When a collaboration task is created, the KV pairs of `WITH CONNECTOR` clause in SQL are
 *       parsed and the validation method {@link PipeConnector#validate(PipeParameterValidator)}
 *       will be called to validate the parameters.
 *   <li>Before the collaboration task starts, the method {@link
 *       PipeConnector#customize(PipeParameters, PipeConnectorRuntimeConfiguration)} will be called
 *       to config the runtime behavior of the PipeConnector and the method {@link
 *       PipeConnector#handshake()} will be called to create a connection with sink.
 *   <li>While the collaboration task is in progress:
 *       <ul>
 *         <li>PipeExtractor captures the events and wraps them into three types of Event instances.
 *         <li>PipeProcessor processes the event and then passes them to the PipeConnector.
 *         <li>PipeConnector serializes the events into binaries and send them to sinks. The
 *             following 3 methods will be called: {@link
 *             PipeConnector#transfer(TabletInsertionEvent)}, {@link
 *             PipeConnector#transfer(TsFileInsertionEvent)} and {@link
 *             PipeConnector#transfer(Event)}.
 *       </ul>
 *   <li>When the collaboration task is cancelled (the `DROP PIPE` command is executed), the {@link
 *       PipeConnector#close() } method will be called.
 * </ul>
 *
 * <p>In addition, the method {@link PipeConnector#heartbeat()} will be called periodically to check
 * whether the connection with sink is still alive. The method {@link PipeConnector#handshake()}
 * will be called to create a new connection with the sink when the method {@link
 * PipeConnector#heartbeat()} throws exceptions.
 */
public interface PipeConnector extends PipePlugin {

  /**
   * This method is mainly used to validate {@link PipeParameters} and it is executed before {@link
   * PipeConnector#customize(PipeParameters, PipeConnectorRuntimeConfiguration)} is called.
   *
   * @param validator the validator used to validate {@link PipeParameters}
   * @throws Exception if any parameter is not valid
   */
  void validate(PipeParameterValidator validator) throws Exception;

  /**
   * This method is mainly used to customize PipeConnector. In this method, the user can do the
   * following things:
   *
   * <ul>
   *   <li>Use PipeParameters to parse key-value pair attributes entered by the user.
   *   <li>Set the running configurations in PipeConnectorRuntimeConfiguration.
   * </ul>
   *
   * <p>This method is called after the method {@link
   * PipeConnector#validate(PipeParameterValidator)} is called and before the method {@link
   * PipeConnector#handshake()} is called.
   *
   * @param parameters used to parse the input parameters entered by the user
   * @param configuration used to set the required properties of the running PipeConnector
   * @throws Exception the user can throw errors if necessary
   */
  void customize(PipeParameters parameters, PipeConnectorRuntimeConfiguration configuration)
          throws Exception;

  /**
   * This method is used to create a connection with sink. This method will be called after the
   * method {@link PipeConnector#customize(PipeParameters, PipeConnectorRuntimeConfiguration)} is
   * called or will be called when the method {@link PipeConnector#heartbeat()} throws exceptions.
   *
   * @throws Exception if the connection is failed to be created
   */
  void handshake() throws Exception;

  /**
   * This method will be called periodically to check whether the connection with sink is still
   * alive.
   *
   * @throws Exception if the connection dies
   */
  void heartbeat() throws Exception;

  /**
   * This method is used to transfer the TabletInsertionEvent.
   *
   * @param tabletInsertionEvent TabletInsertionEvent to be transferred
   * @throws PipeConnectionException if the connection is broken
   * @throws Exception the user can throw errors if necessary
   */
  void transfer(TabletInsertionEvent tabletInsertionEvent) throws Exception;

  /**
   * This method is used to transfer the TsFileInsertionEvent.
   *
   * @param tsFileInsertionEvent TsFileInsertionEvent to be transferred
   * @throws PipeConnectionException if the connection is broken
   * @throws Exception the user can throw errors if necessary
   */
  default void transfer(TsFileInsertionEvent tsFileInsertionEvent) throws Exception {
    for (final TabletInsertionEvent tabletInsertionEvent :
            tsFileInsertionEvent.toTabletInsertionEvents()) {
      transfer(tabletInsertionEvent);
    }
  }

  /**
   * This method is used to transfer the Event.
   *
   * @param event Event to be transferred
   * @throws PipeConnectionException if the connection is broken
   * @throws Exception the user can throw errors if necessary
   */
  void transfer(Event event) throws Exception;
}
```

## Custom Stream Processing Plugin Management

To ensure the flexibility and usability of user-defined plugins in production environments, the system needs to provide the capability to dynamically manage plugins. This section introduces the management statements for stream processing plugins, which enable the dynamic and unified management of plugins.

### Load Plugin Statement

In IoTDB, to dynamically load a user-defined plugin into the system, you first need to implement a specific plugin class based on PipeExtractor, PipeProcessor, or PipeConnector. Then, you need to compile and package the plugin class into an executable jar file. Finally, you can use the loading plugin management statement to load the plugin into IoTDB.

The syntax of the loading plugin management statement is as follows:

```sql
CREATE PIPEPLUGIN <alias>
AS <Full class name>
USING <URL of jar file>
```

For example, if a user implements a data processing plugin with the fully qualified class name "edu.tsinghua.iotdb.pipe.ExampleProcessor" and packages it into a jar file, which is stored at "https://example.com:8080/iotdb/pipe-plugin.jar", and the user wants to use this plugin in the stream processing engine, marking the plugin as "example". The creation statement for this data processing plugin is as follows:

```sql
CREATE PIPEPLUGIN example
AS 'edu.tsinghua.iotdb.pipe.ExampleProcessor'
USING URI '<https://example.com:8080/iotdb/pipe-plugin.jar>'
```

### 删除插件语句

当用户不再想使用一个插件，需要将插件从系统中卸载时，可以使用如图所示的删除插件语句。

```sql
DROP PIPEPLUGIN <别名>
```

### 查看插件语句

用户也可以按需查看系统中的插件。查看插件的语句如图所示。

```sql
SHOW PIPEPLUGINS
```

## 系统预置的流处理插件

### 预置 extractor 插件

#### iotdb-extractor

作用：抽取 IoTDB 内部的历史或实时数据进入 pipe。


| key                          | value                                            | value 取值范围                         | required or optional with default |
| ---------------------------- | ------------------------------------------------ | -------------------------------------- | --------------------------------- |
| extractor                    | iotdb-extractor                                  | String: iotdb-extractor                | required                          |
| extractor.pattern            | 用于筛选时间序列的路径前缀                       | String: 任意的时间序列前缀             | optional: root                    |
| extractor.history.enable     | 是否抽取历史数据                                 | Boolean: true, false                   | optional: true                    |
| extractor.history.start-time | 抽取的历史数据的开始 event time，包含 start-time | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | optional: Long.MIN_VALUE          |
| extractor.history.end-time   | 抽取的历史数据的结束 event time，包含 end-time   | Long: [Long.MIN_VALUE, Long.MAX_VALUE] | optional: Long.MAX_VALUE          |
| extractor.realtime.enable    | 是否抽取实时数据                                 | Boolean: true, false                   | optional: true                    |

> 🚫 **extractor.pattern 参数说明**
>
> * Pattern 需用反引号修饰不合法字符或者是不合法路径节点，例如如果希望筛选 root.\`a@b\` 或者 root.\`123\`，应设置 pattern 为 root.\`a@b\` 或者 root.\`123\`（具体参考 [单双引号和反引号的使用时机](https://iotdb.apache.org/zh/Download/#_1-0-版本不兼容的语法详细说明)）
> * 在底层实现中，当检测到 pattern 为 root（默认值）时，抽取效率较高，其他任意格式都将降低性能
> * 路径前缀不需要能够构成完整的路径。例如，当创建一个包含参数为 'extractor.pattern'='root.aligned.1' 的 pipe 时：
>
>   * root.aligned.1TS
>   * root.aligned.1TS.\`1\`
>   * root.aligned.100T
>   
>   的数据会被抽取；
>   
>   * root.aligned.\`1\`
>   * root.aligned.\`123\`
>
>   的数据不会被抽取。

> ❗️**extractor.history 的 start-time，end-time 参数说明**
>
> * start-time，end-time 应为 ISO 格式，例如 2011-12-03T10:15:30 或 2011-12-03T10:15:30+01:00

> ✅ **一条数据从生产到落库 IoTDB，包含两个关键的时间概念**
>
> * **event time：** 数据实际生产时的时间（或者数据生产系统给数据赋予的生成时间，是数据点中的时间项），也称为事件时间。
> * **arrival time：** 数据到达 IoTDB 系统内的时间。
>
> 我们常说的乱序数据，指的是数据到达时，其 **event time** 远落后于当前系统时间（或者已经落库的最大 **event time**）的数据。另一方面，不论是乱序数据还是顺序数据，只要它们是新到达系统的，那它们的 **arrival time** 都是会随着数据到达 IoTDB 的顺序递增的。

> 💎 **iotdb-extractor 的工作可以拆分成两个阶段**
>
> 1. 历史数据抽取：所有 **arrival time** < 创建 pipe 时**当前系统时间**的数据称为历史数据
> 2. 实时数据抽取：所有 **arrival time** >= 创建 pipe 时**当前系统时间**的数据称为实时数据
>
> 历史数据传输阶段和实时数据传输阶段，**两阶段串行执行，只有当历史数据传输阶段完成后，才执行实时数据传输阶段。**
>
> 用户可以指定 iotdb-extractor 进行：
>
> * 历史数据抽取（`'extractor.history.enable' = 'true'`, `'extractor.realtime.enable' = 'false'` ）
> * 实时数据抽取（`'extractor.history.enable' = 'false'`, `'extractor.realtime.enable' = 'true'` ）
> * 全量数据抽取（`'extractor.history.enable' = 'true'`, `'extractor.realtime.enable' = 'true'` ）
> * 禁止同时设置 `extractor.history.enable` 和 `extractor.realtime.enable` 为 `false`

### 预置 processor 插件

#### do-nothing-processor

作用：不对 extractor 传入的事件做任何的处理。


| key       | value                | value 取值范围               | required or optional with default |
| --------- | -------------------- | ---------------------------- | --------------------------------- |
| processor | do-nothing-processor | String: do-nothing-processor | required                          |

### 预置 connector 插件

#### do-nothing-connector

作用：不对 processor 传入的事件做任何的处理。


| key       | value                | value 取值范围               | required or optional with default |
| --------- | -------------------- | ---------------------------- | --------------------------------- |
| connector | do-nothing-connector | String: do-nothing-connector | required                          |

## 流处理任务管理

### 创建流处理任务

使用 `CREATE PIPE` 语句来创建流处理任务。以数据同步流处理任务的创建为例，示例 SQL 语句如下：

```sql
CREATE PIPE <PipeId> -- PipeId 是能够唯一标定流处理任务的名字
WITH EXTRACTOR (
  -- 默认的 IoTDB 数据抽取插件
  'extractor'                    = 'iotdb-extractor',
  -- 路径前缀，只有能够匹配该路径前缀的数据才会被抽取，用作后续的处理和发送
  'extractor.pattern'            = 'root.timecho',
  -- 是否抽取历史数据
  'extractor.history.enable'     = 'true',
  -- 描述被抽取的历史数据的时间范围，表示最早时间
  'extractor.history.start-time' = '2011.12.03T10:15:30+01:00',
  -- 描述被抽取的历史数据的时间范围，表示最晚时间
  'extractor.history.end-time'   = '2022.12.03T10:15:30+01:00',
  -- 是否抽取实时数据
  'extractor.realtime.enable'    = 'true',
)
WITH PROCESSOR (
  -- 默认的数据处理插件，即不做任何处理
  'processor'                    = 'do-nothing-processor',
)
WITH CONNECTOR (
  -- IoTDB 数据发送插件，目标端为 IoTDB
  'connector'                    = 'iotdb-thrift-connector',
  -- 目标端 IoTDB 其中一个 DataNode 节点的数据服务 ip
  'connector.ip'                 = '127.0.0.1',
  -- 目标端 IoTDB 其中一个 DataNode 节点的数据服务 port
  'connector.port'               = '6667',
)
```

**创建流处理任务时需要配置 PipeId 以及三个插件部分的参数：**


| 配置项    | 说明                                                | 是否必填                    | 默认实现             | 默认实现说明                                             | 是否允许自定义实现        |
| --------- | --------------------------------------------------- | --------------------------- | -------------------- | -------------------------------------------------------- | ------------------------- |
| PipeId    | 全局唯一标定一个流处理任务的名称                    | <font color=red>必填</font> | -                    | -                                                        | -                         |
| extractor | Pipe Extractor 插件，负责在数据库底层抽取流处理数据 | 选填                        | iotdb-extractor      | 将数据库的全量历史数据和后续到达的实时数据接入流处理任务 | 否                        |
| processor | Pipe Processor 插件，负责处理数据                   | 选填                        | do-nothing-processor | 对传入的数据不做任何处理                                 | <font color=red>是</font> |
| connector | Pipe Connector 插件，负责发送数据                   | <font color=red>必填</font> | -                    | -                                                        | <font color=red>是</font> |

示例中，使用了 iotdb-extractor、do-nothing-processor 和 iotdb-thrift-connector 插件构建数据流处理任务。IoTDB 还内置了其他的流处理插件，**请查看“系统预置流处理插件”一节**。

**一个最简的 CREATE PIPE 语句示例如下：**

```sql
CREATE PIPE <PipeId> -- PipeId 是能够唯一标定流处理任务的名字
WITH CONNECTOR (
  -- IoTDB 数据发送插件，目标端为 IoTDB
  'connector'      = 'iotdb-thrift-connector',
  -- 目标端 IoTDB 其中一个 DataNode 节点的数据服务 ip
  'connector.ip'   = '127.0.0.1',
  -- 目标端 IoTDB 其中一个 DataNode 节点的数据服务 port
  'connector.port' = '6667',
)
```

其表达的语义是：将本数据库实例中的全量历史数据和后续到达的实时数据，同步到目标为 127.0.0.1:6667 的 IoTDB 实例上。

**注意：**

- EXTRACTOR 和 PROCESSOR 为选填配置，若不填写配置参数，系统则会采用相应的默认实现
- CONNECTOR 为必填配置，需要在 CREATE PIPE 语句中声明式配置
- CONNECTOR 具备自复用能力。对于不同的流处理任务，如果他们的 CONNECTOR 具备完全相同 KV 属性的（所有属性的 key 对应的 value 都相同），**那么系统最终只会创建一个 CONNECTOR 实例**，以实现对连接资源的复用。

  - 例如，有下面 pipe1, pipe2 两个流处理任务的声明：

  ```sql
  CREATE PIPE pipe1
  WITH CONNECTOR (
    'connector' = 'iotdb-thrift-connector',
    'connector.thrift.host' = 'localhost',
    'connector.thrift.port' = '9999',
  )

  CREATE PIPE pipe2
  WITH CONNECTOR (
    'connector' = 'iotdb-thrift-connector',
    'connector.thrift.port' = '9999',
    'connector.thrift.host' = 'localhost',
  )
  ```

  - 因为它们对 CONNECTOR 的声明完全相同（**即使某些属性声明时的顺序不同**），所以框架会自动对它们声明的 CONNECTOR 进行复用，最终 pipe1, pipe2 的CONNECTOR 将会是同一个实例。
- 请不要构建出包含数据循环同步的应用场景（会导致无限循环）：

  - IoTDB A -> IoTDB B -> IoTDB A
  - IoTDB A -> IoTDB A

### 启动流处理任务

CREATE PIPE 语句成功执行后，流处理任务相关实例会被创建，但整个流处理任务的运行状态会被置为 STOPPED，即流处理任务不会立刻处理数据。

可以使用 START PIPE 语句使流处理任务开始处理数据：

```sql
START PIPE <PipeId>
```

### 停止流处理任务

使用 STOP PIPE 语句使流处理任务停止处理数据：

```sql
STOP PIPE <PipeId>
```

### 删除流处理任务

使用 DROP PIPE 语句使流处理任务停止处理数据（当流处理任务状态为 RUNNING 时），然后删除整个流处理任务流处理任务：

```sql
DROP PIPE <PipeId>
```

用户在删除流处理任务前，不需要执行 STOP 操作。

### 展示流处理任务

使用 SHOW PIPES 语句查看所有流处理任务：

```sql
SHOW PIPES
```

查询结果如下：

```sql
+-----------+-----------------------+-------+-------------+-------------+-------------+----------------+
|         ID|          CreationTime |  State|PipeExtractor|PipeProcessor|PipeConnector|ExceptionMessage|
+-----------+-----------------------+-------+-------------+-------------+-------------+----------------+
|iotdb-kafka|2022-03-30T20:58:30.689|RUNNING|          ...|          ...|          ...|            None|
+-----------+-----------------------+-------+-------------+-------------+-------------+----------------+
|iotdb-iotdb|2022-03-31T12:55:28.129|STOPPED|          ...|          ...|          ...| TException: ...|
+-----------+-----------------------+-------+-------------+-------------+-------------+----------------+
```

可以使用 `<PipeId>` 指定想看的某个流处理任务状态：

```sql
SHOW PIPE <PipeId>
```

您也可以通过 where 子句，判断某个 \<PipeId\> 使用的 Pipe Connector 被复用的情况。

```sql
SHOW PIPES
WHERE CONNECTOR USED BY <PipeId>
```

### Stream Processing Task Running Status Migration

A stream processing task status can transition through several states during the lifecycle of a data synchronization pipe:

- **STOPPED：** The pipe is in a stopped state. It can have the following possibilities:
  - After the successful creation of a pipe, its initial state is set to stopped
  - The user manually pauses a pipe that is in normal running state, transitioning its status from RUNNING to STOPPED
  - If a pipe encounters an unrecoverable error during execution, its status automatically changes from RUNNING to STOPPED.
- **RUNNING：** The pipe is actively processing data
- **DROPPED：** The pipe is permanently deleted

The following diagram illustrates the different states and their transitions:

![state migration diagram](https://alioss.timecho.com/docs/img/%E7%8A%B6%E6%80%81%E8%BF%81%E7%A7%BB%E5%9B%BE.png)

## Authority Management

### Stream Processing Task

| Authority Name    | Description                 |
| ----------- | -------------------- |
| CREATE_PIPE | Register task,path-independent |
| START_PIPE  | Start task,path-independent |
| STOP_PIPE   | Stop task,path-independent |
| DROP_PIPE   | Uninstall task,path-independent |
| SHOW_PIPES  | Query task,path-independent |
### Stream Processing Task Plugin


| Authority Name          | Description                           |
| ----------------- | ------------------------------ |
| CREATE_PIPEPLUGIN | Register stream processing task plugin,path-independent |
| DROP_PIPEPLUGIN   | Start stream processing task plugin,path-independent |
| SHOW_PIPEPLUGINS  | Query stream processing task plugin,path-independent |

## Configure Parameters

In iotdb-common.properties ：

```Properties
####################
### Pipe Configuration
####################

# Uncomment the following field to configure the pipe lib directory.
# For Windows platform
# If its prefix is a drive specifier followed by "\\", or if its prefix is "\\\\", then the path is
# absolute. Otherwise, it is relative.
# pipe_lib_dir=ext\\pipe
# For Linux platform
# If its prefix is "/", then the path is absolute. Otherwise, it is relative.
# pipe_lib_dir=ext/pipe

# The maximum number of threads that can be used to execute the pipe subtasks in PipeSubtaskExecutor.
# The actual value will be min(pipe_subtask_executor_max_thread_num, max(1, CPU core number / 2)).
# pipe_subtask_executor_max_thread_num=5

# The connection timeout (in milliseconds) for the thrift client.
# pipe_connector_timeout_ms=900000
```