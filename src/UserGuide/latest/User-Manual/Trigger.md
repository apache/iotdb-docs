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

# Trigger

## 1. Instructions

The trigger provides a mechanism for listening to changes in time series data. With user-defined logic, tasks such as alerting and data forwarding can be conducted.

The trigger is implemented based on the reflection mechanism. Users can monitor data changes by implementing the Java interfaces. IoTDB allows users to dynamically register and drop triggers without restarting the server.

The document will help you learn to define and manage triggers.

### 1.1 Pattern for Listening

A single trigger can be used to listen for data changes in a time series that match a specific pattern. For example, a trigger can listen for the data changes of time series `root.sg.a`, or time series that match the pattern `root.sg.*`. When you register a trigger, you can specify the path pattern that the trigger listens on through an SQL statement.

### 1.2 Trigger Type

There are currently two types of triggers, and you can specify the type through an SQL statement when registering a trigger:

- Stateful triggers: The execution logic of this type of trigger may depend on data from multiple insertion statement . The framework will aggregate the data written by different nodes into the same trigger instance for calculation to retain context information. This type of trigger is usually used for sampling or statistical data aggregation for a period of time. information. Only one node in the cluster holds an instance of a stateful trigger.
- Stateless triggers: The execution logic of the trigger is only related to the current input data. The framework does not need to aggregate the data of different nodes into the same trigger instance. This type of trigger is usually used for calculation of single row data and abnormal detection. Each node in the cluster holds an instance of a stateless trigger.

### 1.3 Trigger Event

There are currently two trigger events for the trigger, and other trigger events will be expanded in the future. When you register a trigger, you can specify the trigger event through an SQL statement:

- BEFORE INSERT: Fires before the data is persisted. **Please note that currently the trigger does not support data cleaning and will not change the data to be persisted itself.**
- AFTER INSERT: Fires after the data is persisted.

## 2. How to Implement a Trigger

You need to implement the trigger by writing a Java class, where the dependency shown below is required. If you use [Maven](http://search.maven.org/), you can search for them directly from the [Maven repository](http://search.maven.org/).

### 2.1 Dependency

```xml
<dependency>
  <groupId>org.apache.iotdb</groupId>
  <artifactId>iotdb-server</artifactId>
  <version>1.0.0</version>
  <scope>provided</scope>
</dependency>
```

Note that the dependency version should be correspondent to the target server version.

### 2.2 Interface Description

To implement a trigger, you need to implement the `org.apache.iotdb.trigger.api.Trigger` class.

```java
import org.apache.iotdb.trigger.api.enums.FailureStrategy;
import org.apache.iotdb.tsfile.write.record.Tablet;

public interface Trigger {

  /**
   * This method is mainly used to validate {@link TriggerAttributes} before calling {@link
   * Trigger#onCreate(TriggerAttributes)}.
   *
   * @param attributes TriggerAttributes
   * @throws Exception e
   */
  default void validate(TriggerAttributes attributes) throws Exception {}

  /**
   * This method will be called when creating a trigger after validation.
   *
   * @param attributes TriggerAttributes
   * @throws Exception e
   */
  default void onCreate(TriggerAttributes attributes) throws Exception {}

  /**
   * This method will be called when dropping a trigger.
   *
   * @throws Exception e
   */
  default void onDrop() throws Exception {}

  /**
   * When restarting a DataNode, Triggers that have been registered will be restored and this method
   * will be called during the process of restoring.
   *
   * @throws Exception e
   */
  default void restore() throws Exception {}

  /**
   * Overrides this method to set the expected FailureStrategy, {@link FailureStrategy#OPTIMISTIC}
   * is the default strategy.
   *
   * @return {@link FailureStrategy}
   */
  default FailureStrategy getFailureStrategy() {
    return FailureStrategy.OPTIMISTIC;
  }

  /**
   * @param tablet see {@link Tablet} for detailed information of data structure. Data that is
   *     inserted will be constructed as a Tablet and you can define process logic with {@link
   *     Tablet}.
   * @return true if successfully fired
   * @throws Exception e
   */
  default boolean fire(Tablet tablet) throws Exception {
    return true;
  }
}
```

This class provides two types of programming interfaces: **Lifecycle related interfaces** and **data change listening related interfaces**. All the interfaces in this class are not required to be implemented. When the interfaces are not implemented, the trigger will not respond to the data changes. You can implement only some of these interfaces according to your needs.

Descriptions of the interfaces are as followed.

#### Lifecycle Related Interfaces

| Interface                                                    | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| *default void validate(TriggerAttributes attributes) throws Exception {}* | When you creates a trigger using the `CREATE TRIGGER` statement, you can specify the parameters that the trigger needs to use, and this interface will be used to verify the correctness of the parameters。 |
| *default void onCreate(TriggerAttributes attributes) throws Exception {}* | This interface is called once when you create a trigger using the `CREATE TRIGGER` statement. During the lifetime of each trigger instance, this interface will be called only once. This interface is mainly used for the following functions: helping users to parse custom attributes in SQL statements (using `TriggerAttributes`). You can create or apply for resources, such as establishing external links, opening files, etc. |
| *default void onDrop() throws Exception {}*                  | This interface is called when you drop a trigger using the `DROP TRIGGER` statement. During the lifetime of each trigger instance, this interface will be called only once. This interface mainly has the following functions: it can perform the operation of resource release and can be used to persist the results of trigger calculations. |
| *default void restore() throws Exception {}*                 | When the DataNode is restarted, the cluster will restore the trigger instance registered on the DataNode, and this interface will be called once for stateful trigger during the process. After the DataNode where the stateful trigger instance is located goes down, the cluster will restore the trigger instance on another available DataNode, calling this interface once in the process. This interface can be used to customize recovery logic. |

#### Data Change Listening Related Interfaces

##### Listening Interface

```java
/**
   * @param tablet see {@link Tablet} for detailed information of data structure. Data that is
   *     inserted will be constructed as a Tablet and you can define process logic with {@link
   *     Tablet}.
   * @return true if successfully fired
   * @throws Exception e
   */
  default boolean fire(Tablet tablet) throws Exception {
    return true;
  }
```

When the data changes, the trigger uses the Tablet as the unit of firing operation. You can obtain the metadata and data of the corresponding sequence through Tablet, and then perform the corresponding trigger operation. If the fire process is successful, the return value should be true. If the interface returns false or throws an exception, we consider the trigger fire process as failed. When the trigger fire process fails, we will perform corresponding operations according to the listening strategy interface.

When performing an INSERT operation, for each time series in it, we will detect whether there is a trigger that listens to the path pattern, and then assemble the time series data that matches the path pattern listened by the same trigger into a new Tablet for trigger fire interface. Can be understood as:

```java
Map<PartialPath, List<Trigger>> pathToTriggerListMap => Map<Trigger, Tablet>
```

**Note that currently we do not make any guarantees about the order in which triggers fire.**

Here is an example:

Suppose there are three triggers, and the trigger event of the triggers are all BEFORE INSERT:

- Trigger1 listens on `root.sg.*`
- Trigger2 listens on `root.sg.a`
- Trigger3 listens on `root.sg.b`

Insertion statement:

```sql
insert into root.sg(time, a, b) values (1, 1, 1);
```

The time series `root.sg.a` matches Trigger1 and Trigger2, and the sequence `root.sg.b` matches Trigger1 and Trigger3, then:

- The data of `root.sg.a` and `root.sg.b` will be assembled into a new tablet1, and Trigger1.fire(tablet1) will be executed at the corresponding Trigger Event.
- The data of `root.sg.a` will be assembled into a new tablet2, and Trigger2.fire(tablet2) will be executed at the corresponding Trigger Event.
- The data of `root.sg.b` will be assembled into a new tablet3, and Trigger3.fire(tablet3) will be executed at the corresponding Trigger Event.

##### Listening Strategy Interface

When the trigger fails to fire, we will take corresponding actions according to the strategy set by the listening strategy interface. You can set `org.apache.iotdb.trigger.api.enums.FailureStrategy`. There are currently two strategies, optimistic and pessimistic:

- Optimistic strategy: The trigger that fails to fire does not affect the firing of subsequent triggers, nor does it affect the writing process, that is, we do not perform additional processing on the sequence involved in the trigger failure, only log the failure to record the failure, and finally inform user that data insertion is successful, but the trigger fire part failed.
- Pessimistic strategy: The failure trigger affects the processing of all subsequent Pipelines, that is, we believe that the firing failure of the trigger will cause all subsequent triggering processes to no longer be carried out. If the trigger event of the trigger is BEFORE INSERT, then the insertion will no longer be performed, and the insertion failure will be returned directly.

```java
 /**
   * Overrides this method to set the expected FailureStrategy, {@link FailureStrategy#OPTIMISTIC}
   * is the default strategy.
   *
   * @return {@link FailureStrategy}
   */
  default FailureStrategy getFailureStrategy() {
    return FailureStrategy.OPTIMISTIC;
  }
```

### 2.3 Example

If you use [Maven](http://search.maven.org/), you can refer to our sample project **trigger-example**.

You can find it [here](https://github.com/apache/iotdb/tree/master/example/trigger).

Here is the code from one of the sample projects:

```java
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package org.apache.iotdb.trigger;

import org.apache.iotdb.db.storageengine.trigger.sink.alertmanager.AlertManagerConfiguration;
import org.apache.iotdb.db.storageengine.trigger.sink.alertmanager.AlertManagerEvent;
import org.apache.iotdb.db.storageengine.trigger.sink.alertmanager.AlertManagerHandler;
import org.apache.iotdb.trigger.api.Trigger;
import org.apache.iotdb.trigger.api.TriggerAttributes;
import org.apache.iotdb.tsfile.file.metadata.enums.TSDataType;
import org.apache.iotdb.tsfile.write.record.Tablet;
import org.apache.iotdb.tsfile.write.schema.MeasurementSchema;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;

public class ClusterAlertingExample implements Trigger {
  private static final Logger LOGGER = LoggerFactory.getLogger(ClusterAlertingExample.class);

  private final AlertManagerHandler alertManagerHandler = new AlertManagerHandler();

  private final AlertManagerConfiguration alertManagerConfiguration =
      new AlertManagerConfiguration("http://127.0.0.1:9093/api/v2/alerts");

  private String alertname;

  private final HashMap<String, String> labels = new HashMap<>();

  private final HashMap<String, String> annotations = new HashMap<>();

  @Override
  public void onCreate(TriggerAttributes attributes) throws Exception {
    alertname = "alert_test";

    labels.put("series", "root.ln.wf01.wt01.temperature");
    labels.put("value", "");
    labels.put("severity", "");

    annotations.put("summary", "high temperature");
    annotations.put("description", "{{.alertname}}: {{.series}} is {{.value}}");

    alertManagerHandler.open(alertManagerConfiguration);
  }

  @Override
  public void onDrop() throws IOException {
    alertManagerHandler.close();
  }

  @Override
  public boolean fire(Tablet tablet) throws Exception {
    List<MeasurementSchema> measurementSchemaList = tablet.getSchemas();
    for (int i = 0, n = measurementSchemaList.size(); i < n; i++) {
      if (measurementSchemaList.get(i).getType().equals(TSDataType.DOUBLE)) {
        // for example, we only deal with the columns of Double type
        double[] values = (double[]) tablet.values[i];
        for (double value : values) {
          if (value > 100.0) {
            LOGGER.info("trigger value > 100");
            labels.put("value", String.valueOf(value));
            labels.put("severity", "critical");
            AlertManagerEvent alertManagerEvent =
                new AlertManagerEvent(alertname, labels, annotations);
            alertManagerHandler.onEvent(alertManagerEvent);
          } else if (value > 50.0) {
            LOGGER.info("trigger value > 50");
            labels.put("value", String.valueOf(value));
            labels.put("severity", "warning");
            AlertManagerEvent alertManagerEvent =
                new AlertManagerEvent(alertname, labels, annotations);
            alertManagerHandler.onEvent(alertManagerEvent);
          }
        }
      }
    }
    return true;
  }
}
```

## 3. Trigger Management

You can create and drop a trigger through an SQL statement, and you can also query all registered triggers through an SQL statement.

**We recommend that you stop insertion while creating triggers.**

### 3.1 Create Trigger

Triggers can be registered on arbitrary path patterns. The time series registered with the trigger will be listened to by the trigger. When there is data change on the series, the corresponding fire method in the trigger will be called.

Registering a trigger can be done as follows:

1. Implement a Trigger class as described in the How to implement a Trigger chapter, assuming the class's full class name is `org.apache.iotdb.trigger.ClusterAlertingExample`
2. Package the project into a JAR package.
3. Register the trigger with an SQL statement. During the creation process, the `validate` and `onCreate` interfaces of the trigger will only be called once. For details, please refer to the chapter of How to implement a Trigger.

The complete SQL syntax is as follows:

```sql
// Create Trigger
createTrigger
    : CREATE triggerType TRIGGER triggerName=identifier triggerEventClause ON pathPattern AS className=STRING_LITERAL uriClause? triggerAttributeClause?
    ;

triggerType
    : STATELESS | STATEFUL
    ;

triggerEventClause
    : (BEFORE | AFTER) INSERT
    ;
        
uriClause
    : USING URI uri
    ;

uri
    : STRING_LITERAL
    ;
    
triggerAttributeClause
    : WITH LR_BRACKET triggerAttribute (COMMA triggerAttribute)* RR_BRACKET
    ;

triggerAttribute
    : key=attributeKey operator_eq value=attributeValue
    ;
```

Below is the explanation for the SQL syntax:

- triggerName: The trigger ID, which is globally unique and used to distinguish different triggers, is case-sensitive.
- triggerType: Trigger types are divided into two categories, STATELESS and STATEFUL.
- triggerEventClause: when the trigger fires, BEFORE INSERT and AFTER INSERT are supported now.
- pathPattern：The path pattern the trigger listens on, can contain wildcards * and **.
- className：The class name of the Trigger class.
- jarLocation: Optional. When this option is not specified, by default, we consider that the DBA has placed the JAR package required to create the trigger in the trigger_root_dir directory (configuration item, default is IOTDB_HOME/ext/trigger) of each DataNode node. When this option is specified, we will download and distribute the file resource corresponding to the URI to the trigger_root_dir/install directory of each DataNode.
- triggerAttributeClause: It is used to specify the parameters that need to be set when the trigger instance is created. This part is optional in the SQL syntax.

Here is an example SQL statement to help you understand:

```sql
CREATE STATELESS TRIGGER triggerTest
BEFORE INSERT
ON root.sg.**
AS 'org.apache.iotdb.trigger.ClusterAlertingExample'
USING URI '/jar/ClusterAlertingExample.jar'
WITH (
    "name" = "trigger",
    "limit" = "100"
)
```

The above SQL statement creates a trigger named triggerTest:

- The trigger is stateless.
- Fires before insertion.
- Listens on path pattern root.sg.**
- The implemented trigger class is named `org.apache.iotdb.trigger.ClusterAlertingExample`
- The JAR package URI is http://jar/ClusterAlertingExample.jar
- When creating the trigger instance, two parameters, name and limit, are passed in.

### 3.2 Drop Trigger

The trigger can be dropped by specifying the trigger ID. During the process of dropping the trigger, the `onDrop` interface of the trigger will be called only once.

The SQL syntax is:

```sql
// Drop Trigger
dropTrigger
  : DROP TRIGGER triggerName=identifier
;
```

Here is an example statement:

```sql
DROP TRIGGER triggerTest1
```

The above statement will drop the trigger with ID triggerTest1.

### 3.3 Show Trigger

You can query information about triggers that exist in the cluster through an SQL statement.

The SQL syntax is as follows:

```sql
SHOW TRIGGERS
```

The result set format of this statement is as follows:

| TriggerName  | Event                        | Type                 | State                                       | PathPattern | ClassName                               | NodeId                                  |
| ------------ | ---------------------------- | -------------------- | ------------------------------------------- | ----------- | --------------------------------------- | --------------------------------------- |
| triggerTest1 | BEFORE_INSERT / AFTER_INSERT | STATELESS / STATEFUL | INACTIVE / ACTIVE / DROPPING / TRANSFFERING | root.**     | org.apache.iotdb.trigger.TriggerExample | ALL(STATELESS) / DATA_NODE_ID(STATEFUL) |

### 3.4 Trigger State

During the process of creating and dropping triggers in the cluster, we maintain the states of the triggers. The following is a description of these states:

| State        | Description                                                  | Is it recommended to insert data? |
| ------------ | ------------------------------------------------------------ | --------------------------------- |
| INACTIVE     | The intermediate state of executing `CREATE TRIGGER`, the cluster has just recorded the trigger information on the ConfigNode, and the trigger has not been activated on any DataNode. | NO                                |
| ACTIVE       | Status after successful execution of `CREATE TRIGGE`, the trigger is available on all DataNodes in the cluster. | YES                               |
| DROPPING     | Intermediate state of executing `DROP TRIGGER`, the cluster is in the process of dropping the trigger. | NO                                |
| TRANSFERRING | The cluster is migrating the location of this trigger instance. | NO                                |

## 4. Notes

- The trigger takes effect from the time of registration, and does not process the existing historical data. **That is, only insertion requests that occur after the trigger is successfully registered will be listened to by the trigger. **
- The fire process of trigger is synchronous currently, so you need to ensure the efficiency of the trigger, otherwise the writing performance may be greatly affected. **You need to guarantee concurrency safety of triggers yourself**.
- Please do no register too many triggers in the cluster. Because the trigger information is fully stored in the ConfigNode, and there is a copy of the information in all DataNodes
- **It is recommended to stop writing when registering triggers**. Registering a trigger is not an atomic operation. When registering a trigger, there will be an intermediate state in which some nodes in the cluster have registered the trigger, and some nodes have not yet registered successfully. To avoid write requests on some nodes being listened to by triggers and not being listened to on some nodes, we recommend not to perform writes when registering triggers.
- When the node holding the stateful trigger instance goes down, we will try to restore the corresponding instance on another node. During the recovery process, we will call the restore interface of the trigger class once.
- The trigger JAR package has a size limit, which must be less than min(`config_node_ratis_log_appender_buffer_size_max`, 2G), where `config_node_ratis_log_appender_buffer_size_max` is a configuration item. For the specific meaning, please refer to the IOTDB configuration item description.
- **It is better not to have classes with the same full class name but different function implementations in different JAR packages.** For example, trigger1 and trigger2 correspond to resources trigger1.jar and trigger2.jar respectively. If two JAR packages contain a `org.apache.iotdb.trigger.example.AlertListener` class, when `CREATE TRIGGER` uses this class, the system will randomly load the class in one of the JAR packages, which will eventually leads the inconsistent behavior of trigger and other issues.

## 5. Configuration Parameters

| Parameter                                         | Meaning                                                      |
| ------------------------------------------------- | ------------------------------------------------------------ |
| *trigger_lib_dir*                                 | Directory to save the trigger jar package                    |
| *stateful\_trigger\_retry\_num\_when\_not\_found* | How many times will we retry to found an instance of stateful trigger on DataNodes if not found |
