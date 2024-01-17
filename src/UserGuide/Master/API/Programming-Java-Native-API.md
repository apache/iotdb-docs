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

# Java Native API

## Installation

### Dependencies

* JDK >= 1.8+
* Maven >= 3.9+

### How to install

In root directory:
> mvn clean install -pl iotdb-client/session -am -DskipTests

### Using IoTDB Java Native API with Maven

```xml
<dependencies>
    <dependency>
      <groupId>org.apache.iotdb</groupId>
      <artifactId>iotdb-session</artifactId>
      <version>1.0.0</version>
    </dependency>
</dependencies>
```

## Syntax Convention

- **IoTDB-SQL interface:** The input SQL parameter needs to conform to the [syntax conventions](../stage/Syntax-Conventions/Literal-Values.md) and be escaped for JAVA strings. For example, you need to add a backslash before the double-quotes. (That is: after JAVA escaping, it is consistent with the SQL statement executed on the command line.)
- **Other interfaces:**
  - The node names in path or path prefix: The node names are required to be escaped by backticks (`) in the SQL statement.
  - Identifiers (such as template names): The identifiers are required to be escaped by backticks (`) in the SQL statement.
- **Code example for syntax convention could be found at:** `example/session/src/main/java/org/apache/iotdb/SyntaxConventionRelatedExample.java`

## Native APIs

In this section we will demonstrate the commonly used interfaces and their parameters in the Native API:

### Initialization

* Initialize a Session

``` java
// use default configuration 
session = new Session.Builder.build();

// initialize with a single node
session = 
    new Session.Builder()
        .host(String host)
        .port(int port)
        .build();

// initialize with multiple nodes
session = 
    new Session.Builder()
        .nodeUrls(List<String> nodeUrls)
        .build();

// other configurations
session = 
    new Session.Builder()
        .fetchSize(int fetchSize)
        .username(String username)
        .password(String password)
        .thriftDefaultBufferSize(int thriftDefaultBufferSize)
        .thriftMaxFrameSize(int thriftMaxFrameSize)
        .enableRedirection(boolean enableRedirection)
        .version(Version version)
        .build();
```

`Version` represents the SQL semantic version used by the client, which is used to be compatible with the SQL semantics of `0.12` when upgrading `0.13`. The possible values are: `V_0_12`, `V_0_13`, `V_1_0`.

* Open a Session

``` java
void open()
```

* Open a session, with a parameter specifying whether to enable RPC compression
  
``` java
void open(boolean enableRPCCompression)
```

Notice: The RPC compression setting of the client is required to match that of the IoTDB server

* Close a Session

``` java
void close()
```

### Data Definition Interface (DDI)

#### Database Management

* Create database

``` java
void setStorageGroup(String storageGroupId)    
```

* Delete one or several databases

``` java
void deleteStorageGroup(String storageGroup)
void deleteStorageGroups(List<String> storageGroups)
```

#### Timeseries Management

* Create one or multiple timeseries

``` java
void createTimeseries(String path, TSDataType dataType,
      TSEncoding encoding, CompressionType compressor, Map<String, String> props,
      Map<String, String> tags, Map<String, String> attributes, String measurementAlias)
      
void createMultiTimeseries(List<String> paths, List<TSDataType> dataTypes,
      List<TSEncoding> encodings, List<CompressionType> compressors,
      List<Map<String, String>> propsList, List<Map<String, String>> tagsList,
      List<Map<String, String>> attributesList, List<String> measurementAliasList)
```

* Create aligned timeseries
```
void createAlignedTimeseries(String prefixPath, List<String> measurements,
      List<TSDataType> dataTypes, List<TSEncoding> encodings,
      List <CompressionType> compressors, List<String> measurementAliasList);
```

Attention: Alias of measurements are **not supported** currently.

* Delete one or several timeseries

``` java
void deleteTimeseries(String path)
void deleteTimeseries(List<String> paths)
```

* Check whether the specific timeseries exists.

``` java
boolean checkTimeseriesExists(String path)
```

#### Schema Template

Creation of a schema-templates will help to improve performance when ingesting data of a large number of identical devices. 
You can use Template, InternalNode and MeasurementNode types to describe the structure of the template, and use `createSchemaTemplate` to create it inside the current session.

``` java
public void createSchemaTemplate(Template template);

Class Template {
    private String name;
    private boolean directShareTime;
    Map<String, Node> children;
    public Template(String name, boolean isShareTime);
    
    public void addToTemplate(Node node);
    public void deleteFromTemplate(String name);
    public void setShareTime(boolean shareTime);
}

Abstract Class Node {
    private String name;
    public void addChild(Node node);
    public void deleteChild(Node node);
}

Class MeasurementNode extends Node {
    TSDataType dataType;
    TSEncoding encoding;
    CompressionType compressor;
    public MeasurementNode(String name, 
                           TSDataType dataType, 
                           TSEncoding encoding,
                          CompressionType compressor);
}
```

> We strongly recommend you create only flat templates and don't make use of the ability to create hierarchical structures as tree-structured templates may not be supported in further version of IoTDB.

A snippet of using above Method and Class：

``` java
MeasurementNode nodeX = new MeasurementNode("x", TSDataType.FLOAT, TSEncoding.RLE, CompressionType.SNAPPY);
MeasurementNode nodeY = new MeasurementNode("y", TSDataType.FLOAT, TSEncoding.RLE, CompressionType.SNAPPY);
MeasurementNode nodeSpeed = new MeasurementNode("speed", TSDataType.DOUBLE, TSEncoding.GORILLA, CompressionType.SNAPPY);

// This is the template we suggest to implement
Template flatTemplate = new Template("flatTemplate");
template.addToTemplate(nodeX);
template.addToTemplate(nodeY);
template.addToTemplate(nodeSpeed);

createSchemaTemplate(flatTemplate);
```

You can query measurements inside templates with these APIS:

```java
// Return the amount of measurements inside a template
int countMeasurementsInTemplate(String templateName);

// Returns true if path points to a measurement, otherwise it returns false
boolean isMeasurementInTemplate(String templateName, String path);

// Returns true if path exists in template, otherwise it returns false
boolean isPathExistInTemplate(String templateName, String path);

// Return all measurement paths inside a given template
List<String> showMeasurementsInTemplate(String templateName);

// Return all measurement paths matching the designated pattern inside a given template
List<String> showMeasurementsInTemplate(String templateName, String pattern);
```

To use a schema template, you can set the measurement template named `templateName` at path `prefixPath`.

> **Please notice that, we strongly recommend not setting templates on the nodes above the database to accommodate future updates and collaboration between modules.**

``` java
void setSchemaTemplate(String templateName, String prefixPath)
```

Before using a template, you should first create the template using the following example:

``` java
void createSchemaTemplate(Template template)
```

After assigning template to a certain path, you can use the template to create a timeseries for given device paths using the following call: 

``` java
void createTimeseriesUsingSchemaTemplate(List<String> devicePathList)
```
Alternatively you can write data directly without creating the timeseies firs hereby triggering the timeseries auto-creation, which automatically uses the template assigned to the provided path.

After setting template to a certain path, you can query for info about template using the interface in the following example:

``` java
/** @return All template names. */
public List<String> showAllTemplates();

/** @return All paths have been set to designated template. */
public List<String> showPathsTemplateSetOn(String templateName);

/** @return All paths are using designated template. */
public List<String> showPathsTemplateUsingOn(String templateName)
```

If you to remove a schema template, you can drop it with following interface. 
Make sure the template you are trying to remove has been unset from MTree and is no longer used.

``` java
void unsetSchemaTemplate(String prefixPath, String templateName);
public void dropSchemaTemplate(String templateName);
```

Unset the schema template named `templateName` from path `prefixPath`. 
When you issue this interface, you should assure that there is a template named `templateName` set at the path `prefixPath`.

> Attention: Unsetting a template from node a path or descendant nodes which already contain data referencing this template is **not supported**

### Data Manipulation Interface (DMI)

#### Insert

It is recommended to use insertTablet to help improve write efficiency.

* Insert a Tablet，which contains multiple rows for a device. Each row has the same measurements:
  * **Better Write Performance**
  * **Support batch write**
  * **Support null values**: fill the null value with any value, and then mark the null value via BitMap

``` java
void insertTablet(Tablet tablet)

public class Tablet {
  /** deviceId of this tablet */
  public String prefixPath;
  /** the list of measurement schemas for creating the tablet */
  private List<MeasurementSchema> schemas;
  /** timestamps in this tablet */
  public long[] timestamps;
  /** each object is a primitive type array, which represents values of one measurement */
  public Object[] values;
  /** each bitmap represents the existence of each value in the current column. */
  public BitMap[] bitMaps;
  /** the number of rows to include in this tablet */
  public int rowSize;
  /** the maximum number of rows for this tablet */
  private int maxRowNumber;
  /** whether this tablet store data of aligned timeseries or not */
  private boolean isAligned;
}
```

* Insert multiple Tablets

``` java
void insertTablets(Map<String, Tablet> tablet)
```

* Insert a Record, which contains multiple measurement values for a device at a given time. 

  The correspondence between the Object type and the TSDataType type is shown in the following table.

  | TSDataType | Object         |
  | ---------- | -------------- |
  | BOOLEAN    | Boolean        |
  | INT32      | Integer        |
  | INT64      | Long           |
  | FLOAT      | Float          |
  | DOUBLE     | Double         |
  | TEXT       | String, Binary |

``` java
void insertRecord(String deviceId, 
   long time, 
   List<String> measurements,
   List<TSDataType> types, 
   List<Object> values)
```

* Insert multiple Records

``` java
void insertRecords(List<String> deviceIds, 
    List<Long> times,
    List<List<String>> measurementsList, 
    List<List<TSDataType>> typesList,
    List<List<Object>> valuesList)
```

* Insert multiple Records that belong to the same device.

``` java
void insertRecordsOfOneDevice(String deviceId,
    List<Long> times,
    List<List<String>> measurementsList, 
    List<List<TSDataType>> typesList,
    List<List<Object>> valuesList)
```

#### Insert with type inference

If type-information is not present, all values will be converted to their `String` representation. 
The server then performs type inference to guess the datatype, based on this string-representation. 
For example, if value string equals "true", it can be automatically inferred to be a `Boolean` type. If string value is "3.2", it can be automatically inferred as a `Float` type. 
However, please keep in mind, that this process of guessing the type for a given value comes at a performance cost. 

The following variants demonstrate the insertion of data, using type inference:  

* Insert a Record, which contains multiple measurement values for a device at given times:

``` java
void insertRecord(String prefixPath, long time, List<String> measurements, List<String> values)
```

* Insert multiple Records:

``` java
void insertRecords(List<String> deviceIds, List<Long> times, 
   List<List<String>> measurementsList, List<List<String>> valuesList)
```

* Insert multiple Records that belong to the same device:

``` java
void insertStringRecordsOfOneDevice(String deviceId, List<Long> times,
        List<List<String>> measurementsList, List<List<String>> valuesList)
```

#### Insert of Aligned Timeseries

The insertion of aligned timeseries uses interfaces like `insertAlignedXXX`, and others similar to the above interfaces:

* insertAlignedRecord
* insertAlignedRecords
* insertAlignedRecordsOfOneDevice
* insertAlignedStringRecordsOfOneDevice
* insertAlignedTablet
* insertAlignedTablets

#### Delete

* Delete data with timestamps before or equal to a given timestamp of one or several timeseries:

``` java
void deleteData(String path, long time)
void deleteData(List<String> paths, long time)
```

#### Query

* Time-series raw data query with time range:
 - The specified query time-range is a left-closed right-open interval, including the start time but excluding the end time.

``` java
SessionDataSet executeRawDataQuery(List<String> paths, long startTime, long endTime);
```

* Last query: 
  - Query the last data, whose timestamp is greater than or equal lastTime.
    ``` java
    SessionDataSet executeLastDataQuery(List<String> paths, long lastTime);
    ```
  - Query the latest point of the specified series of single device quickly, and support redirection;
    If you are sure that the query path is valid, set 'isLegalPathNodes' to true to avoid performance penalties from path verification.
    ``` java
    SessionDataSet executeLastDataQueryForOneDevice(
        String db, String device, List<String> sensors, boolean isLegalPathNodes);
    ```

* Aggregation query:
  - Support specified query time range: The specified query time range is a left-closed right-open interval, including the start time but not the end time.
  - Support GROUP BY TIME.

``` java
SessionDataSet executeAggregationQuery(List<String> paths, List<Aggregation> aggregations);

SessionDataSet executeAggregationQuery(
    List<String> paths, List<Aggregation> aggregations, long startTime, long endTime);

SessionDataSet executeAggregationQuery(
    List<String> paths,
    List<Aggregation> aggregations,
    long startTime,
    long endTime,
    long interval);

SessionDataSet executeAggregationQuery(
    List<String> paths,
    List<Aggregation> aggregations,
    long startTime,
    long endTime,
    long interval,
    long slidingStep);
```

### IoTDB-SQL Interface

* Execute query statement

Query statements return data.

``` java
SessionDataSet executeQueryStatement(String sql)
```

* Execute non query statement

Non-Query statements don't return data (Delete, Create, ... statements)

``` java
void executeNonQueryStatement(String sql)
```

### Write Test Interface (to profile network cost)

These methods **don't** insert data into database. 
The server just return after accepting the request.

* Test the network and client cost of insertRecord

``` java
void testInsertRecord(String deviceId, long time, List<String> measurements, List<String> values)

void testInsertRecord(String deviceId, long time, List<String> measurements,
        List<TSDataType> types, List<Object> values)
```

* Test the network and client cost of insertRecords

``` java
void testInsertRecords(List<String> deviceIds, List<Long> times,
        List<List<String>> measurementsList, List<List<String>> valuesList)
        
void testInsertRecords(List<String> deviceIds, List<Long> times,
        List<List<String>> measurementsList, List<List<TSDataType>> typesList
        List<List<Object>> valuesList)
```

* Test the network and client cost of insertTablet

``` java
void testInsertTablet(Tablet tablet)
```

* Test the network and client cost of insertTablets

``` java
void testInsertTablets(Map<String, Tablet> tablets)
```

### Coding Examples

To get more information about the following methods, please have a look at [Session.java](https://github.com/apache/iotdb/blob/master/iotdb-client/session/src/main/java/org/apache/iotdb/session/Session.java).

The sample code for using these methods is located in [SessionExample.java](https://github.com/apache/iotdb/blob/master/example/session/src/main/java/org/apache/iotdb/SessionExample.java)，which provides an example of how to open an IoTDB session and execute a batch insertion.

For examples of aligned timeseries and schema template, you can refer to [AlignedTimeseriesSessionExample.java](https://github.com/apache/iotdb/blob/master/example/session/src/main/java/org/apache/iotdb/AlignedTimeseriesSessionExample.java).

## Session Pool for Native API

We provide a connection pool (`SessionPool`) for Native API.
When creating such a SessionPool, you need to define the pool size.

If you can not get a session connection within 60 seconds, a warning will be logged but the program will hang.

If a session has finished an operation, it will be put back to the pool automatically.

If a session connection is broken, the session will be removed automatically and the pool will try to create a new session and redo the operation.

You can also specify an url list of multiple reachable nodes when creating a SessionPool, just as you would, when creating a Session to ensure high availability of clients in distributed cluster environments.

For query operations:

1. When using SessionPool to query data, the result set is `SessionDataSetWrapper`.
2. Given a `SessionDataSetWrapper`, if you have not scanned all the data in it and stop to use it, you have to call `SessionPool.closeResultSet(wrapper)` manually.
3. When you call `hasNext()` and `next()` of a `SessionDataSetWrapper` and there is an exception, then you have to call `SessionPool.closeResultSet(wrapper)` manually.
4. You can call `getColumnNames()` of `SessionDataSetWrapper` to get the column names of query result.

Examples: [SessionPoolTest.java](https://github.com/apache/iotdb/blob/master/iotdb-client/session/src/test/java/org/apache/iotdb/session/pool/SessionPoolTest.java)
Or: [SessionPoolExample.java](https://github.com/apache/iotdb/blob/master/example/session/src/main/java/org/apache/iotdb/SessionPoolExample.java)

## Cluster information related APIs (only works in the cluster mode)

Cluster information related APIs allow users to retrieve information about the cluster like where a database will be persisted to or the status of each node in the cluster.

To use the APIs, please add the following dependency in your pom file:

```xml
<dependencies>
    <dependency>
      <groupId>org.apache.iotdb</groupId>
      <artifactId>iotdb-thrift-cluster</artifactId>
      <version>1.0.0</version>
    </dependency>
</dependencies>
```

How to open a connection:

```java
import org.apache.thrift.protocol.TBinaryProtocol;
import org.apache.thrift.transport.TSocket;
import org.apache.thrift.transport.TTransport;
import org.apache.thrift.transport.TTransportException;
import org.apache.iotdb.rpc.RpcTransportFactory;

public class CluserInfoClient {
  TTransport transport;
  ClusterInfoService.Client client;
  public void connect() {
    transport =
            RpcTransportFactory.INSTANCE.getTransport(
                    new TSocket(
                            // the RPC address
                            IoTDBDescriptor.getInstance().getConfig().getRpcAddress(),
                            // the RPC port
                            ClusterDescriptor.getInstance().getConfig().getClusterRpcPort()));
    try {
      transport.open();
    } catch (TTransportException e) {
      Assert.fail(e.getMessage());
    }
    //get the client
    client = new ClusterInfoService.Client(new TBinaryProtocol(transport));
  }
  public void close() {
    transport.close();
  }
}
```

APIs in `ClusterInfoService.Client`:


* Get the physical hash ring of the cluster:

```java
list<Node> getRing();
```

* Get data partition information of input path and time range:

```java 
/**
 * @param path input path (should contains a database name as its prefix)
 * @return the data partition info. If the time range only covers one data partition, the the size
 * of the list is one.
 */
list<DataPartitionEntry> getDataPartition(1:string path, 2:long startTime, 3:long endTime);
```

* Get metadata partition information of input path:
```java  
/**
 * @param path input path (should contains a database name as its prefix)
 * @return metadata partition information
 */
list<Node> getMetaPartition(1:string path);
```

* Get the status (alive or not) of all nodes:
```java
/**
 * @return key: node, value: live or not
 */
map<Node, bool> getAllNodeStatus();
```

* get the raft group info (voteFor, term, etc..) of the connected node
  (Notice that this API is rarely used by users):
```java  
/**
 * @return A multi-line string with each line representing the total time consumption, invocation
 *     number, and average time consumption.
 */
string getInstrumentingInfo();
```
