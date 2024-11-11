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

# 数据库编程
## 触发器
### 使用说明

触发器提供了一种侦听序列数据变动的机制。配合用户自定义逻辑，可完成告警、数据转发等功能。

触发器基于 Java 反射机制实现。用户通过简单实现 Java 接口，即可实现数据侦听。IoTDB 允许用户动态注册、卸载触发器，在注册、卸载期间，无需启停服务器。

#### 侦听模式

IoTDB 的单个触发器可用于侦听符合特定模式的时间序列的数据变动，如时间序列 root.sg.a 上的数据变动，或者符合路径模式 root.**.a 的时间序列上的数据变动。您在注册触发器时可以通过 SQL 语句指定触发器侦听的路径模式。

#### 触发器类型

目前触发器分为两类，您在注册触发器时可以通过 SQL 语句指定类型：

- 有状态的触发器。该类触发器的执行逻辑可能依赖前后的多条数据，框架会将不同节点写入的数据汇总到同一个触发器实例进行计算，来保留上下文信息，通常用于采样或者统计一段时间的数据聚合信息。集群中只有一个节点持有有状态触发器的实例。
- 无状态的触发器。触发器的执行逻辑只和当前输入的数据有关，框架无需将不同节点的数据汇总到同一个触发器实例中，通常用于单行数据的计算和异常检测等。集群中每个节点均持有无状态触发器的实例。

#### 触发时机

触发器的触发时机目前有两种，后续会拓展其它触发时机。您在注册触发器时可以通过 SQL 语句指定触发时机：

- BEFORE INSERT，即在数据持久化之前触发。请注意，目前触发器并不支持数据清洗，不会对要持久化的数据本身进行变动。
- AFTER INSERT，即在数据持久化之后触发。

### 编写触发器

#### 触发器依赖

触发器的逻辑需要您编写 Java 类进行实现。
在编写触发器逻辑时，需要使用到下面展示的依赖。如果您使用 [Maven](http://search.maven.org/)，则可以直接从 [Maven 库](http://search.maven.org/)中搜索到它们。请注意选择和目标服务器版本相同的依赖版本。

``` xml
<dependency>
  <groupId>org.apache.iotdb</groupId>
  <artifactId>iotdb-server</artifactId>
  <version>1.0.0</version>
  <scope>provided</scope>
</dependency>
```

#### 接口说明

编写一个触发器需要实现 `org.apache.iotdb.trigger.api.Trigger` 类。

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

该类主要提供了两类编程接口：**生命周期相关接口**和**数据变动侦听相关接口**。该类中所有的接口都不是必须实现的，当您不实现它们时，它们不会对流经的数据操作产生任何响应。您可以根据实际需要，只实现其中若干接口。

下面是所有可供用户进行实现的接口的说明。

##### 生命周期相关接口

| 接口定义                                                     | 描述                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| *default void validate(TriggerAttributes attributes) throws Exception {}* | 用户在使用 `CREATE TRIGGER` 语句创建触发器时，可以指定触发器需要使用的参数，该接口会用于验证参数正确性。 |
| *default void onCreate(TriggerAttributes attributes) throws Exception {}* | 当您使用`CREATE TRIGGER`语句创建触发器后，该接口会被调用一次。在每一个触发器实例的生命周期内，该接口会且仅会被调用一次。该接口主要有如下作用：帮助用户解析 SQL 语句中的自定义属性（使用`TriggerAttributes`）。 可以创建或申请资源，如建立外部链接、打开文件等。 |
| *default void onDrop() throws Exception {}*                  | 当您使用`DROP TRIGGER`语句删除触发器后，该接口会被调用。在每一个触发器实例的生命周期内，该接口会且仅会被调用一次。该接口主要有如下作用：可以进行资源释放的操作。可以用于持久化触发器计算的结果。 |
| *default void restore() throws Exception {}*                 | 当重启 DataNode 时，集群会恢复 DataNode 上已经注册的触发器实例，在此过程中会为该 DataNode 上的有状态触发器调用一次该接口。有状态触发器实例所在的 DataNode 宕机后，集群会在另一个可用 DataNode 上恢复该触发器的实例，在此过程中会调用一次该接口。该接口可以用于自定义恢复逻辑。 |

##### 数据变动侦听相关接口

###### 侦听接口

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

数据变动时，触发器以 Tablet 作为触发操作的单位。您可以通过 Tablet 获取相应序列的元数据和数据，然后进行相应的触发操作，触发成功则返回值应当为 true。该接口返回 false 或是抛出异常我们均认为触发失败。在触发失败时，我们会根据侦听策略接口进行相应的操作。 

进行一次 INSERT 操作时，对于其中的每条时间序列，我们会检测是否有侦听该路径模式的触发器，然后将符合同一个触发器所侦听的路径模式的时间序列数据组装成一个新的 Tablet 用于触发器的 fire 接口。可以理解成：

```java
Map<PartialPath, List<Trigger>> pathToTriggerListMap => Map<Trigger, Tablet>
```

**请注意，目前我们不对触发器的触发顺序有任何保证。**

下面是示例：

假设有三个触发器，触发器的触发时机均为 BEFORE INSERT

- 触发器 Trigger1 侦听路径模式：root\.sg.*
- 触发器 Trigger2 侦听路径模式：root.sg.a
- 触发器 Trigger3 侦听路径模式：root.sg.b

写入语句：

```sql
insert into root.sg(time, a, b) values (1, 1, 1);
```

序列 root.sg.a 匹配 Trigger1 和 Trigger2，序列 root.sg.b 匹配 Trigger1 和 Trigger3，那么：

- root.sg.a 和 root.sg.b 的数据会被组装成一个新的 tablet1，在相应的触发时机进行 Trigger1.fire(tablet1)
- root.sg.a 的数据会被组装成一个新的 tablet2，在相应的触发时机进行 Trigger2.fire(tablet2)
- root.sg.b 的数据会被组装成一个新的 tablet3，在相应的触发时机进行 Trigger3.fire(tablet3)

###### 侦听策略接口

在触发器触发失败时，我们会根据侦听策略接口设置的策略进行相应的操作，您可以通过下述接口设置 `org.apache.iotdb.trigger.api.enums.FailureStrategy`，目前有乐观和悲观两种策略：

- 乐观策略：触发失败的触发器不影响后续触发器的触发，也不影响写入流程，即我们不对触发失败涉及的序列做额外处理，仅打日志记录失败，最后返回用户写入数据成功，但触发部分失败。
- 悲观策略：失败触发器影响后续所有 Pipeline 的处理，即我们认为该 Trigger 触发失败会导致后续所有触发流程不再进行。如果该触发器的触发时机为 BEFORE INSERT，那么写入也不再进行，直接返回写入失败。

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

您可以参考下图辅助理解，其中 Trigger1 配置采用乐观策略，Trigger2 配置采用悲观策略。Trigger1 和 Trigger2 的触发时机是 BEFORE INSERT，Trigger3 和 Trigger4 的触发时机是 AFTER INSERT。 正常执行流程如下：

<img src="https://alioss.timecho.com/docs/img/UserGuide/Process-Data/Triggers/Trigger_Process_Flow.jpg?raw=true">

<img src="https://alioss.timecho.com/docs/img/UserGuide/Process-Data/Triggers/Trigger_Process_Strategy.jpg?raw=true">


#### 示例

如果您使用 [Maven](http://search.maven.org/)，可以参考我们编写的示例项目 trigger-example。您可以在 [这里](https://github.com/apache/iotdb/tree/master/example/trigger) 找到它。后续我们会加入更多的示例项目供您参考。

下面是其中一个示例项目的代码：

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

import org.apache.iotdb.db.engine.trigger.sink.alertmanager.AlertManagerConfiguration;
import org.apache.iotdb.db.engine.trigger.sink.alertmanager.AlertManagerEvent;
import org.apache.iotdb.db.engine.trigger.sink.alertmanager.AlertManagerHandler;
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
### 管理触发器

您可以通过 SQL 语句注册和卸载一个触发器实例，您也可以通过 SQL 语句查询到所有已经注册的触发器。

**我们建议您在注册触发器时停止写入。**

#### 注册触发器

触发器可以注册在任意路径模式上。被注册有触发器的序列将会被触发器侦听，当序列上有数据变动时，触发器中对应的触发方法将会被调用。

注册一个触发器可以按如下流程进行：

1. 按照编写触发器章节的说明，实现一个完整的 Trigger 类，假定这个类的全类名为 `org.apache.iotdb.trigger.ClusterAlertingExample`
2. 将项目打成 JAR 包。
3. 使用 SQL 语句注册该触发器。注册过程中会仅只会调用一次触发器的 `validate` 和 `onCreate` 接口，具体请参考编写触发器章节。

完整 SQL 语法如下：

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

下面对 SQL 语法进行说明，您可以结合使用说明章节进行理解：

- triggerName：触发器 ID，该 ID 是全局唯一的，用于区分不同触发器，大小写敏感。
- triggerType：触发器类型，分为无状态（STATELESS）和有状态（STATEFUL）两类。
- triggerEventClause：触发时机，目前仅支持写入前（BEFORE INSERT）和写入后（AFTER INSERT）两种。
- pathPattern：触发器侦听的路径模式，可以包含通配符 * 和 **。
- className：触发器实现类的类名。
- uriClause：可选项，当不指定该选项时，我们默认 DBA 已经在各个 DataNode 节点的 trigger_root_dir 目录（配置项，默认为 IOTDB_HOME/ext/trigger）下放置好创建该触发器需要的 JAR 包。当指定该选项时，我们会将该 URI 对应的文件资源下载并分发到各 DataNode 的 trigger_root_dir/install 目录下。
- triggerAttributeClause：用于指定触发器实例创建时需要设置的参数，SQL 语法中该部分是可选项。

下面是一个帮助您理解的 SQL 语句示例：

```sql
CREATE STATELESS TRIGGER triggerTest
BEFORE INSERT
ON root.sg.**
AS 'org.apache.iotdb.trigger.ClusterAlertingExample'
USING URI 'http://jar/ClusterAlertingExample.jar'
WITH (
    "name" = "trigger",
    "limit" = "100"
)
```

上述 SQL 语句创建了一个名为 triggerTest 的触发器：

- 该触发器是无状态的（STATELESS）
- 在写入前触发（BEFORE INSERT）
- 该触发器侦听路径模式为 root\.sg.**
- 所编写的触发器类名为 org.apache.iotdb.trigger.ClusterAlertingExample
- JAR 包的 URI 为 http://jar/ClusterAlertingExample.jar
- 创建该触发器实例时会传入 name 和 limit 两个参数。

#### 卸载触发器

可以通过指定触发器 ID 的方式卸载触发器，卸载触发器的过程中会且仅会调用一次触发器的 `onDrop` 接口。

卸载触发器的 SQL 语法如下：

```sql
// Drop Trigger
dropTrigger
  : DROP TRIGGER triggerName=identifier
;
```

下面是示例语句：

```sql
DROP TRIGGER triggerTest1
```

上述语句将会卸载 ID 为 triggerTest1 的触发器。

#### 查询触发器

可以通过 SQL 语句查询集群中存在的触发器的信息。SQL 语法如下：

```sql
SHOW TRIGGERS
```

该语句的结果集格式如下：

| TriggerName  | Event                        | Type                 | State                                       | PathPattern | ClassName                               | NodeId                                  |
| ------------ | ---------------------------- | -------------------- | ------------------------------------------- | ----------- | --------------------------------------- | --------------------------------------- |
| triggerTest1 | BEFORE_INSERT / AFTER_INSERT | STATELESS / STATEFUL | INACTIVE / ACTIVE / DROPPING / TRANSFFERING | root.**     | org.apache.iotdb.trigger.TriggerExample | ALL(STATELESS) / DATA_NODE_ID(STATEFUL) |


#### 触发器状态说明

在集群中注册以及卸载触发器的过程中，我们维护了触发器的状态，下面是对这些状态的说明：

| 状态         | 描述                                                         | 是否建议写入进行 |
| ------------ | ------------------------------------------------------------ | ---------------- |
| INACTIVE     | 执行 `CREATE TRIGGER` 的中间状态，集群刚在 ConfigNode 上记录该触发器的信息，还未在任何 DataNode 上激活该触发器 | 否               |
| ACTIVE       | 执行 `CREATE TRIGGE` 成功后的状态，集群所有 DataNode 上的该触发器都已经可用 | 是               |
| DROPPING     | 执行 `DROP TRIGGER` 的中间状态，集群正处在卸载该触发器的过程中 | 否               |
| TRANSFERRING | 集群正在进行该触发器实例位置的迁移                           | 否               |

### 重要注意事项

- 触发器从注册时开始生效，不对已有的历史数据进行处理。**即只有成功注册触发器之后发生的写入请求才会被触发器侦听到。**
- 触发器目前采用**同步触发**，所以编写时需要保证触发器效率，否则可能会大幅影响写入性能。**您需要自己保证触发器内部的并发安全性**。
- 集群中**不能注册过多触发器**。因为触发器信息全量保存在 ConfigNode 中，并且在所有 DataNode 都有一份该信息的副本。
- **建议注册触发器时停止写入**。注册触发器并不是一个原子操作，注册触发器时，会出现集群内部分节点已经注册了该触发器，部分节点尚未注册成功的中间状态。为了避免部分节点上的写入请求被触发器侦听到，部分节点上没有被侦听到的情况，我们建议注册触发器时不要执行写入。
- 触发器将作为进程内程序执行，如果您的触发器编写不慎，内存占用过多，由于 IoTDB 并没有办法监控触发器所使用的内存，所以有 OOM 的风险。
- 持有有状态触发器实例的节点宕机时，我们会尝试在另外的节点上恢复相应实例，在恢复过程中我们会调用一次触发器类的 restore 接口，您可以在该接口中实现恢复触发器所维护的状态的逻辑。
- 触发器 JAR 包有大小限制，必须小于 min(`config_node_ratis_log_appender_buffer_size_max`, 2G)，其中 `config_node_ratis_log_appender_buffer_size_max` 是一个配置项，具体含义可以参考 IOTDB 配置项说明。
- **不同的 JAR 包中最好不要有全类名相同但功能实现不一样的类**。例如：触发器 trigger1、trigger2 分别对应资源 trigger1.jar、trigger2.jar。如果两个 JAR 包里都包含一个 `org.apache.iotdb.trigger.example.AlertListener` 类，当 `CREATE TRIGGER` 使用到这个类时，系统会随机加载其中一个 JAR 包中的类，最终导致触发器执行行为不一致以及其他的问题。

### 配置参数

| 配置项                                            | 含义                                           |
| ------------------------------------------------- | ---------------------------------------------- |
| *trigger_lib_dir*                                 | 保存触发器 jar 包的目录位置                    |
| *stateful\_trigger\_retry\_num\_when\_not\_found* | 有状态触发器触发无法找到触发器实例时的重试次数 |

## 连续查询（Continuous Query, CQ）

### 简介
连续查询(Continuous queries, aka CQ) 是对实时数据周期性地自动执行的查询，并将查询结果写入指定的时间序列中。

用户可以通过连续查询实现滑动窗口流式计算，如计算某个序列每小时平均温度，并写入一个新序列中。用户可以自定义 `RESAMPLE` 子句去创建不同的滑动窗口，可以实现对于乱序数据一定程度的容忍。

### 语法

```sql
CREATE (CONTINUOUS QUERY | CQ) <cq_id> 
[RESAMPLE 
  [EVERY <every_interval>] 
  [BOUNDARY <execution_boundary_time>]
  [RANGE <start_time_offset>[, end_time_offset]] 
]
[TIMEOUT POLICY BLOCKED|DISCARD]
BEGIN 
    SELECT CLAUSE
        INTO CLAUSE
        FROM CLAUSE
        [WHERE CLAUSE]
        [GROUP BY(<group_by_interval>[, <sliding_step>]) [, level = <level>]]
        [HAVING CLAUSE]
        [FILL {PREVIOUS | LINEAR | constant}]
        [LIMIT rowLimit OFFSET rowOffset]
        [ALIGN BY DEVICE]
END
```

> 注意：
> 1. 如果where子句中出现任何时间过滤条件，IoTDB将会抛出异常，因为IoTDB会自动为每次查询执行指定时间范围。
> 2. GROUP BY TIME CLAUSE在连续查询中的语法稍有不同，它不能包含原来的第一个参数，即 [start_time, end_time)，IoTDB会自动填充这个缺失的参数。如果指定，IoTDB将会抛出异常。
> 3. 如果连续查询中既没有GROUP BY TIME子句，也没有指定EVERY子句，IoTDB将会抛出异常。

#### 连续查询语法中参数含义的描述

- `<cq_id>` 为连续查询指定一个全局唯一的标识。
- `<every_interval>` 指定了连续查询周期性执行的间隔。现在支持的时间单位有：ns, us, ms, s, m, h, d, w, 并且它的值不能小于用户在`iotdb-system.properties`配置文件中指定的`continuous_query_min_every_interval`。这是一个可选参数，默认等于group by子句中的`group_by_interval`。
- `<start_time_offset>` 指定了每次查询执行窗口的开始时间，即`now()-<start_time_offset>`。现在支持的时间单位有：ns, us, ms, s, m, h, d, w。这是一个可选参数，默认等于`EVERY`子句中的`every_interval`。
- `<end_time_offset>` 指定了每次查询执行窗口的结束时间，即`now()-<end_time_offset>`。现在支持的时间单位有：ns, us, ms, s, m, h, d, w。这是一个可选参数，默认等于`0`.
- `<execution_boundary_time>` 表示用户期待的连续查询的首个周期任务的执行时间。（因为连续查询只会对当前实时的数据流做计算，所以该连续查询实际首个周期任务的执行时间并不一定等于用户指定的时间，具体计算逻辑如下所示）
    - `<execution_boundary_time>` 可以早于、等于或者迟于当前时间。
    - 这个参数是可选的，默认等于`0`。
    - 首次查询执行窗口的开始时间为`<execution_boundary_time> - <start_time_offset>`.
    - 首次查询执行窗口的结束时间为`<execution_boundary_time> - <end_time_offset>`.
    - 第i个查询执行窗口的时间范围是`[<execution_boundary_time> - <start_time_offset> + (i - 1) * <every_interval>, <execution_boundary_time> - <end_time_offset> + (i - 1) * <every_interval>)`。
    - 如果当前时间早于或等于, 那连续查询的首个周期任务的执行时间就是用户指定的`execution_boundary_time`.
    - 如果当前时间迟于用户指定的`execution_boundary_time`，那么连续查询的首个周期任务的执行时间就是`execution_boundary_time + i * <every_interval>`中第一个大于或等于当前时间的值。

> - <every_interval>，<start_time_offset> 和 <group_by_interval> 都应该大于 0
> - <group_by_interval>应该小于等于<start_time_offset>
> - 用户应该根据实际需求，为<start_time_offset> 和 <every_interval> 指定合适的值
>     - 如果<start_time_offset>大于<every_interval>，在每一次查询执行的时间窗口上会有部分重叠
>     - 如果<start_time_offset>小于<every_interval>，在连续的两次查询执行的时间窗口中间将会有未覆盖的时间范围
> - start_time_offset 应该大于end_time_offset

##### `<start_time_offset>`等于`<every_interval>`

![1](https://alioss.timecho.com/docs/img/UserGuide/Process-Data/Continuous-Query/pic1.png?raw=true)

##### `<start_time_offset>`大于`<every_interval>`

![2](https://alioss.timecho.com/docs/img/UserGuide/Process-Data/Continuous-Query/pic2.png?raw=true)

##### `<start_time_offset>`小于`<every_interval>`

![3](https://alioss.timecho.com/docs/img/UserGuide/Process-Data/Continuous-Query/pic3.png?raw=true)

##### `<every_interval>`不为0

![4](https://alioss.timecho.com/docs/img/UserGuide/Process-Data/Continuous-Query/pic4.png?raw=true)

- `TIMEOUT POLICY` 指定了我们如何处理“前一个时间窗口还未执行完时，下一个窗口的执行时间已经到达的场景，默认值是`BLOCKED`.
    - `BLOCKED`意味着即使下一个窗口的执行时间已经到达，我们依旧需要阻塞等待前一个时间窗口的查询执行完再开始执行下一个窗口。如果使用`BLOCKED`策略，所有的时间窗口都将会被依此执行，但是如果遇到执行查询的时间长于周期性间隔时，连续查询的结果会迟于最新的时间窗口范围。
    - `DISCARD`意味着如果前一个时间窗口还未执行完，我们会直接丢弃下一个窗口的执行时间。如果使用`DISCARD`策略，可能会有部分时间窗口得不到执行。但是一旦前一个查询执行完后，它将会使用最新的时间窗口，所以它的执行结果总能赶上最新的时间窗口范围，当然是以部分时间窗口得不到执行为代价。


### 连续查询的用例

下面是用例数据，这是一个实时的数据流，我们假设数据都按时到达。

````
+-----------------------------+-----------------------------+-----------------------------+-----------------------------+-----------------------------+
|                         Time|root.ln.wf02.wt02.temperature|root.ln.wf02.wt01.temperature|root.ln.wf01.wt02.temperature|root.ln.wf01.wt01.temperature|
+-----------------------------+-----------------------------+-----------------------------+-----------------------------+-----------------------------+
|2021-05-11T22:18:14.598+08:00|                        121.0|                         72.0|                        183.0|                        115.0|
|2021-05-11T22:18:19.941+08:00|                          0.0|                         68.0|                         68.0|                        103.0|
|2021-05-11T22:18:24.949+08:00|                        122.0|                         45.0|                         11.0|                         14.0|
|2021-05-11T22:18:29.967+08:00|                         47.0|                         14.0|                         59.0|                        181.0|
|2021-05-11T22:18:34.979+08:00|                        182.0|                        113.0|                         29.0|                        180.0|
|2021-05-11T22:18:39.990+08:00|                         42.0|                         11.0|                         52.0|                         19.0|
|2021-05-11T22:18:44.995+08:00|                         78.0|                         38.0|                        123.0|                         52.0|
|2021-05-11T22:18:49.999+08:00|                        137.0|                        172.0|                        135.0|                        193.0|
|2021-05-11T22:18:55.003+08:00|                         16.0|                        124.0|                        183.0|                         18.0|
+-----------------------------+-----------------------------+-----------------------------+-----------------------------+-----------------------------+
````

#### 配置连续查询执行的周期性间隔

在`RESAMPLE`子句中使用`EVERY`参数指定连续查询的执行间隔，如果没有指定，默认等于`group_by_interval`。

```sql
CREATE CONTINUOUS QUERY cq1
RESAMPLE EVERY 20s
BEGIN
  SELECT max_value(temperature)
  INTO root.ln.wf02.wt02(temperature_max), root.ln.wf02.wt01(temperature_max), root.ln.wf01.wt02(temperature_max), root.ln.wf01.wt01(temperature_max)
  FROM root.ln.*.*
  GROUP BY(10s)
END
```

`cq1`计算出`temperature`传感器每10秒的平均值，并且将查询结果存储在`temperature_max`传感器下，传感器路径前缀使用跟原来一样的前缀。

`cq1`每20秒执行一次，每次执行的查询的时间窗口范围是从过去20秒到当前时间。

假设当前时间是`2021-05-11T22:18:40.000+08:00`，如果把日志等级设置为DEBUG，我们可以在`cq1`执行的DataNode上看到如下的输出：

````
At **2021-05-11T22:18:40.000+08:00**, `cq1` executes a query within the time range `[2021-05-11T22:18:20, 2021-05-11T22:18:40)`.
`cq1` generate 2 lines:
>
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|                         Time|root.ln.wf02.wt02.temperature_max|root.ln.wf02.wt01.temperature_max|root.ln.wf01.wt02.temperature_max|root.ln.wf01.wt01.temperature_max|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|2021-05-11T22:18:20.000+08:00|                            122.0|                             45.0|                             59.0|                            181.0|
|2021-05-11T22:18:30.000+08:00|                            182.0|                            113.0|                             52.0|                            180.0|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
>
At **2021-05-11T22:19:00.000+08:00**, `cq1` executes a query within the time range `[2021-05-11T22:18:40, 2021-05-11T22:19:00)`.
`cq1` generate 2 lines:
>
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|                         Time|root.ln.wf02.wt02.temperature_max|root.ln.wf02.wt01.temperature_max|root.ln.wf01.wt02.temperature_max|root.ln.wf01.wt01.temperature_max|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|2021-05-11T22:18:40.000+08:00|                            137.0|                            172.0|                            135.0|                            193.0|
|2021-05-11T22:18:50.000+08:00|                             16.0|                            124.0|                            183.0|                             18.0|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
>
````

`cq1`并不会处理当前时间窗口以外的数据，即`2021-05-11T22:18:20.000+08:00`以前的数据，所以我们会得到如下结果：

````
> SELECT temperature_max from root.ln.*.*;
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|                         Time|root.ln.wf02.wt02.temperature_max|root.ln.wf02.wt01.temperature_max|root.ln.wf01.wt02.temperature_max|root.ln.wf01.wt01.temperature_max|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|2021-05-11T22:18:20.000+08:00|                            122.0|                             45.0|                             59.0|                            181.0|
|2021-05-11T22:18:30.000+08:00|                            182.0|                            113.0|                             52.0|                            180.0|
|2021-05-11T22:18:40.000+08:00|                            137.0|                            172.0|                            135.0|                            193.0|
|2021-05-11T22:18:50.000+08:00|                             16.0|                            124.0|                            183.0|                             18.0|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
````

#### 配置连续查询的时间窗口大小

使用`RANGE`子句中的`start_time_offset`参数指定连续查询每次执行的时间窗口的开始时间偏移，如果没有指定，默认值等于`EVERY`参数。

```sql
CREATE CONTINUOUS QUERY cq2
RESAMPLE RANGE 40s
BEGIN
  SELECT max_value(temperature)
  INTO root.ln.wf02.wt02(temperature_max), root.ln.wf02.wt01(temperature_max), root.ln.wf01.wt02(temperature_max), root.ln.wf01.wt01(temperature_max)
  FROM root.ln.*.*
  GROUP BY(10s)
END
```

`cq2`计算出`temperature`传感器每10秒的平均值，并且将查询结果存储在`temperature_max`传感器下，传感器路径前缀使用跟原来一样的前缀。

`cq2`每10秒执行一次，每次执行的查询的时间窗口范围是从过去40秒到当前时间。

假设当前时间是`2021-05-11T22:18:40.000+08:00`，如果把日志等级设置为DEBUG，我们可以在`cq2`执行的DataNode上看到如下的输出：

````
At **2021-05-11T22:18:40.000+08:00**, `cq2` executes a query within the time range `[2021-05-11T22:18:00, 2021-05-11T22:18:40)`.
`cq2` generate 4 lines:
>
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|                         Time|root.ln.wf02.wt02.temperature_max|root.ln.wf02.wt01.temperature_max|root.ln.wf01.wt02.temperature_max|root.ln.wf01.wt01.temperature_max|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|2021-05-11T22:18:00.000+08:00|                             NULL|                             NULL|                             NULL|                             NULL|
|2021-05-11T22:18:10.000+08:00|                            121.0|                             72.0|                            183.0|                            115.0|
|2021-05-11T22:18:20.000+08:00|                            122.0|                             45.0|                             59.0|                            181.0|
|2021-05-11T22:18:30.000+08:00|                            182.0|                            113.0|                             52.0|                            180.0|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
>
At **2021-05-11T22:18:50.000+08:00**, `cq2` executes a query within the time range `[2021-05-11T22:18:10, 2021-05-11T22:18:50)`.
`cq2` generate 4 lines:
>
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|                         Time|root.ln.wf02.wt02.temperature_max|root.ln.wf02.wt01.temperature_max|root.ln.wf01.wt02.temperature_max|root.ln.wf01.wt01.temperature_max|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|2021-05-11T22:18:10.000+08:00|                            121.0|                             72.0|                            183.0|                            115.0|
|2021-05-11T22:18:20.000+08:00|                            122.0|                             45.0|                             59.0|                            181.0|
|2021-05-11T22:18:30.000+08:00|                            182.0|                            113.0|                             52.0|                            180.0|
|2021-05-11T22:18:40.000+08:00|                            137.0|                            172.0|                            135.0|                            193.0|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
>
At **2021-05-11T22:19:00.000+08:00**, `cq2` executes a query within the time range `[2021-05-11T22:18:20, 2021-05-11T22:19:00)`.
`cq2` generate 4 lines:
>
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|                         Time|root.ln.wf02.wt02.temperature_max|root.ln.wf02.wt01.temperature_max|root.ln.wf01.wt02.temperature_max|root.ln.wf01.wt01.temperature_max|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|2021-05-11T22:18:20.000+08:00|                            122.0|                             45.0|                             59.0|                            181.0|
|2021-05-11T22:18:30.000+08:00|                            182.0|                            113.0|                             52.0|                            180.0|
|2021-05-11T22:18:40.000+08:00|                            137.0|                            172.0|                            135.0|                            193.0|
|2021-05-11T22:18:50.000+08:00|                             16.0|                            124.0|                            183.0|                             18.0|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
>
````

`cq2`并不会写入全是null值的行，值得注意的是`cq2`会多次计算某些区间的聚合值，下面是计算结果：

````
> SELECT temperature_max from root.ln.*.*;
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|                         Time|root.ln.wf02.wt02.temperature_max|root.ln.wf02.wt01.temperature_max|root.ln.wf01.wt02.temperature_max|root.ln.wf01.wt01.temperature_max|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|2021-05-11T22:18:10.000+08:00|                            121.0|                             72.0|                            183.0|                            115.0|
|2021-05-11T22:18:20.000+08:00|                            122.0|                             45.0|                             59.0|                            181.0|
|2021-05-11T22:18:30.000+08:00|                            182.0|                            113.0|                             52.0|                            180.0|
|2021-05-11T22:18:40.000+08:00|                            137.0|                            172.0|                            135.0|                            193.0|
|2021-05-11T22:18:50.000+08:00|                             16.0|                            124.0|                            183.0|                             18.0|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
````

#### 同时配置连续查询执行的周期性间隔和时间窗口大小

使用`RESAMPLE`子句中的`EVERY`参数和`RANGE`参数分别指定连续查询的执行间隔和窗口大小。并且使用`fill()`来填充没有值的时间区间。

```sql
CREATE CONTINUOUS QUERY cq3
RESAMPLE EVERY 20s RANGE 40s
BEGIN
  SELECT max_value(temperature)
  INTO root.ln.wf02.wt02(temperature_max), root.ln.wf02.wt01(temperature_max), root.ln.wf01.wt02(temperature_max), root.ln.wf01.wt01(temperature_max)
  FROM root.ln.*.*
  GROUP BY(10s)
  FILL(100.0)
END
```

`cq3`计算出`temperature`传感器每10秒的平均值，并且将查询结果存储在`temperature_max`传感器下，传感器路径前缀使用跟原来一样的前缀。如果某些区间没有值，用`100.0`填充。

`cq3`每20秒执行一次，每次执行的查询的时间窗口范围是从过去40秒到当前时间。

假设当前时间是`2021-05-11T22:18:40.000+08:00`，如果把日志等级设置为DEBUG，我们可以在`cq3`执行的DataNode上看到如下的输出：

````
At **2021-05-11T22:18:40.000+08:00**, `cq3` executes a query within the time range `[2021-05-11T22:18:00, 2021-05-11T22:18:40)`.
`cq3` generate 4 lines:
>
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|                         Time|root.ln.wf02.wt02.temperature_max|root.ln.wf02.wt01.temperature_max|root.ln.wf01.wt02.temperature_max|root.ln.wf01.wt01.temperature_max|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|2021-05-11T22:18:00.000+08:00|                            100.0|                            100.0|                            100.0|                            100.0|
|2021-05-11T22:18:10.000+08:00|                            121.0|                             72.0|                            183.0|                            115.0|
|2021-05-11T22:18:20.000+08:00|                            122.0|                             45.0|                             59.0|                            181.0|
|2021-05-11T22:18:30.000+08:00|                            182.0|                            113.0|                             52.0|                            180.0|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
>
At **2021-05-11T22:19:00.000+08:00**, `cq3` executes a query within the time range `[2021-05-11T22:18:20, 2021-05-11T22:19:00)`.
`cq3` generate 4 lines:
>
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|                         Time|root.ln.wf02.wt02.temperature_max|root.ln.wf02.wt01.temperature_max|root.ln.wf01.wt02.temperature_max|root.ln.wf01.wt01.temperature_max|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|2021-05-11T22:18:20.000+08:00|                            122.0|                             45.0|                             59.0|                            181.0|
|2021-05-11T22:18:30.000+08:00|                            182.0|                            113.0|                             52.0|                            180.0|
|2021-05-11T22:18:40.000+08:00|                            137.0|                            172.0|                            135.0|                            193.0|
|2021-05-11T22:18:50.000+08:00|                             16.0|                            124.0|                            183.0|                             18.0|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
>
````

值得注意的是`cq3`会多次计算某些区间的聚合值，下面是计算结果：

````
> SELECT temperature_max from root.ln.*.*;
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|                         Time|root.ln.wf02.wt02.temperature_max|root.ln.wf02.wt01.temperature_max|root.ln.wf01.wt02.temperature_max|root.ln.wf01.wt01.temperature_max|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|2021-05-11T22:18:00.000+08:00|                            100.0|                            100.0|                            100.0|                            100.0|
|2021-05-11T22:18:10.000+08:00|                            121.0|                             72.0|                            183.0|                            115.0|
|2021-05-11T22:18:20.000+08:00|                            122.0|                             45.0|                             59.0|                            181.0|
|2021-05-11T22:18:30.000+08:00|                            182.0|                            113.0|                             52.0|                            180.0|
|2021-05-11T22:18:40.000+08:00|                            137.0|                            172.0|                            135.0|                            193.0|
|2021-05-11T22:18:50.000+08:00|                             16.0|                            124.0|                            183.0|                             18.0|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
````

#### 配置连续查询每次查询执行时间窗口的结束时间

使用`RESAMPLE`子句中的`EVERY`参数和`RANGE`参数分别指定连续查询的执行间隔和窗口大小。并且使用`fill()`来填充没有值的时间区间。

```sql
CREATE CONTINUOUS QUERY cq4
RESAMPLE EVERY 20s RANGE 40s, 20s
BEGIN
  SELECT max_value(temperature)
  INTO root.ln.wf02.wt02(temperature_max), root.ln.wf02.wt01(temperature_max), root.ln.wf01.wt02(temperature_max), root.ln.wf01.wt01(temperature_max)
  FROM root.ln.*.*
  GROUP BY(10s)
  FILL(100.0)
END
```

`cq4`计算出`temperature`传感器每10秒的平均值，并且将查询结果存储在`temperature_max`传感器下，传感器路径前缀使用跟原来一样的前缀。如果某些区间没有值，用`100.0`填充。

`cq4`每20秒执行一次，每次执行的查询的时间窗口范围是从过去40秒到过去20秒。

假设当前时间是`2021-05-11T22:18:40.000+08:00`，如果把日志等级设置为DEBUG，我们可以在`cq4`执行的DataNode上看到如下的输出：

````
At **2021-05-11T22:18:40.000+08:00**, `cq4` executes a query within the time range `[2021-05-11T22:18:00, 2021-05-11T22:18:20)`.
`cq4` generate 2 lines:
>
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|                         Time|root.ln.wf02.wt02.temperature_max|root.ln.wf02.wt01.temperature_max|root.ln.wf01.wt02.temperature_max|root.ln.wf01.wt01.temperature_max|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|2021-05-11T22:18:00.000+08:00|                            100.0|                            100.0|                            100.0|                            100.0|
|2021-05-11T22:18:10.000+08:00|                            121.0|                             72.0|                            183.0|                            115.0|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
>
At **2021-05-11T22:19:00.000+08:00**, `cq4` executes a query within the time range `[2021-05-11T22:18:20, 2021-05-11T22:18:40)`.
`cq4` generate 2 lines:
>
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|                         Time|root.ln.wf02.wt02.temperature_max|root.ln.wf02.wt01.temperature_max|root.ln.wf01.wt02.temperature_max|root.ln.wf01.wt01.temperature_max|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|2021-05-11T22:18:20.000+08:00|                            122.0|                             45.0|                             59.0|                            181.0|
|2021-05-11T22:18:30.000+08:00|                            182.0|                            113.0|                             52.0|                            180.0|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
>
````

值得注意的是`cq4`只会计算每个聚合区间一次，并且每次开始执行计算的时间都会比当前的时间窗口结束时间迟20s, 下面是计算结果：

````
> SELECT temperature_max from root.ln.*.*;
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|                         Time|root.ln.wf02.wt02.temperature_max|root.ln.wf02.wt01.temperature_max|root.ln.wf01.wt02.temperature_max|root.ln.wf01.wt01.temperature_max|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
|2021-05-11T22:18:00.000+08:00|                            100.0|                            100.0|                            100.0|                            100.0|
|2021-05-11T22:18:10.000+08:00|                            121.0|                             72.0|                            183.0|                            115.0|
|2021-05-11T22:18:20.000+08:00|                            122.0|                             45.0|                             59.0|                            181.0|
|2021-05-11T22:18:30.000+08:00|                            182.0|                            113.0|                             52.0|                            180.0|
+-----------------------------+---------------------------------+---------------------------------+---------------------------------+---------------------------------+
````

#### 没有GROUP BY TIME子句的连续查询

不使用`GROUP BY TIME`子句，并在`RESAMPLE`子句中显式使用`EVERY`参数指定连续查询的执行间隔。

```sql
CREATE CONTINUOUS QUERY cq5
RESAMPLE EVERY 20s
BEGIN
  SELECT temperature + 1
  INTO root.precalculated_sg.::(temperature)
  FROM root.ln.*.*
  align by device
END
```

`cq5`计算以`root.ln`为前缀的所有`temperature + 1`的值，并将结果储存在另一个 database `root.precalculated_sg`中。除 database 名称不同外，目标序列与源序列路径名均相同。

`cq5`每20秒执行一次，每次执行的查询的时间窗口范围是从过去20秒到当前时间。

假设当前时间是`2021-05-11T22:18:40.000+08:00`，如果把日志等级设置为DEBUG，我们可以在`cq5`执行的DataNode上看到如下的输出：

````
At **2021-05-11T22:18:40.000+08:00**, `cq5` executes a query within the time range `[2021-05-11T22:18:20, 2021-05-11T22:18:40)`.
`cq5` generate 16 lines:
>
+-----------------------------+-------------------------------+-----------+
|                         Time|                         Device|temperature|
+-----------------------------+-------------------------------+-----------+
|2021-05-11T22:18:24.949+08:00|root.precalculated_sg.wf02.wt02|      123.0| 
|2021-05-11T22:18:29.967+08:00|root.precalculated_sg.wf02.wt02|       48.0|
|2021-05-11T22:18:34.979+08:00|root.precalculated_sg.wf02.wt02|      183.0|
|2021-05-11T22:18:39.990+08:00|root.precalculated_sg.wf02.wt02|       45.0|
|2021-05-11T22:18:24.949+08:00|root.precalculated_sg.wf02.wt01|       46.0| 
|2021-05-11T22:18:29.967+08:00|root.precalculated_sg.wf02.wt01|       15.0|
|2021-05-11T22:18:34.979+08:00|root.precalculated_sg.wf02.wt01|      114.0|
|2021-05-11T22:18:39.990+08:00|root.precalculated_sg.wf02.wt01|       12.0|
|2021-05-11T22:18:24.949+08:00|root.precalculated_sg.wf01.wt02|       12.0| 
|2021-05-11T22:18:29.967+08:00|root.precalculated_sg.wf01.wt02|       60.0|
|2021-05-11T22:18:34.979+08:00|root.precalculated_sg.wf01.wt02|       30.0|
|2021-05-11T22:18:39.990+08:00|root.precalculated_sg.wf01.wt02|       53.0|
|2021-05-11T22:18:24.949+08:00|root.precalculated_sg.wf01.wt01|       15.0| 
|2021-05-11T22:18:29.967+08:00|root.precalculated_sg.wf01.wt01|      182.0|
|2021-05-11T22:18:34.979+08:00|root.precalculated_sg.wf01.wt01|      181.0|
|2021-05-11T22:18:39.990+08:00|root.precalculated_sg.wf01.wt01|       20.0|
+-----------------------------+-------------------------------+-----------+
>
At **2021-05-11T22:19:00.000+08:00**, `cq5` executes a query within the time range `[2021-05-11T22:18:40, 2021-05-11T22:19:00)`.
`cq5` generate 12 lines:
>
+-----------------------------+-------------------------------+-----------+
|                         Time|                         Device|temperature|
+-----------------------------+-------------------------------+-----------+
|2021-05-11T22:18:44.995+08:00|root.precalculated_sg.wf02.wt02|       79.0| 
|2021-05-11T22:18:49.999+08:00|root.precalculated_sg.wf02.wt02|      138.0|
|2021-05-11T22:18:55.003+08:00|root.precalculated_sg.wf02.wt02|       17.0|
|2021-05-11T22:18:44.995+08:00|root.precalculated_sg.wf02.wt01|       39.0| 
|2021-05-11T22:18:49.999+08:00|root.precalculated_sg.wf02.wt01|      173.0|
|2021-05-11T22:18:55.003+08:00|root.precalculated_sg.wf02.wt01|      125.0|
|2021-05-11T22:18:44.995+08:00|root.precalculated_sg.wf01.wt02|      124.0| 
|2021-05-11T22:18:49.999+08:00|root.precalculated_sg.wf01.wt02|      136.0|
|2021-05-11T22:18:55.003+08:00|root.precalculated_sg.wf01.wt02|      184.0|
|2021-05-11T22:18:44.995+08:00|root.precalculated_sg.wf01.wt01|       53.0| 
|2021-05-11T22:18:49.999+08:00|root.precalculated_sg.wf01.wt01|      194.0|
|2021-05-11T22:18:55.003+08:00|root.precalculated_sg.wf01.wt01|       19.0|
+-----------------------------+-------------------------------+-----------+
>
````

`cq5`并不会处理当前时间窗口以外的数据，即`2021-05-11T22:18:20.000+08:00`以前的数据，所以我们会得到如下结果：

````
> SELECT temperature from root.precalculated_sg.*.* align by device;
+-----------------------------+-------------------------------+-----------+
|                         Time|                         Device|temperature|
+-----------------------------+-------------------------------+-----------+
|2021-05-11T22:18:24.949+08:00|root.precalculated_sg.wf02.wt02|      123.0| 
|2021-05-11T22:18:29.967+08:00|root.precalculated_sg.wf02.wt02|       48.0|
|2021-05-11T22:18:34.979+08:00|root.precalculated_sg.wf02.wt02|      183.0|
|2021-05-11T22:18:39.990+08:00|root.precalculated_sg.wf02.wt02|       45.0|
|2021-05-11T22:18:44.995+08:00|root.precalculated_sg.wf02.wt02|       79.0| 
|2021-05-11T22:18:49.999+08:00|root.precalculated_sg.wf02.wt02|      138.0|
|2021-05-11T22:18:55.003+08:00|root.precalculated_sg.wf02.wt02|       17.0|
|2021-05-11T22:18:24.949+08:00|root.precalculated_sg.wf02.wt01|       46.0| 
|2021-05-11T22:18:29.967+08:00|root.precalculated_sg.wf02.wt01|       15.0|
|2021-05-11T22:18:34.979+08:00|root.precalculated_sg.wf02.wt01|      114.0|
|2021-05-11T22:18:39.990+08:00|root.precalculated_sg.wf02.wt01|       12.0|
|2021-05-11T22:18:44.995+08:00|root.precalculated_sg.wf02.wt01|       39.0| 
|2021-05-11T22:18:49.999+08:00|root.precalculated_sg.wf02.wt01|      173.0|
|2021-05-11T22:18:55.003+08:00|root.precalculated_sg.wf02.wt01|      125.0|
|2021-05-11T22:18:24.949+08:00|root.precalculated_sg.wf01.wt02|       12.0| 
|2021-05-11T22:18:29.967+08:00|root.precalculated_sg.wf01.wt02|       60.0|
|2021-05-11T22:18:34.979+08:00|root.precalculated_sg.wf01.wt02|       30.0|
|2021-05-11T22:18:39.990+08:00|root.precalculated_sg.wf01.wt02|       53.0|
|2021-05-11T22:18:44.995+08:00|root.precalculated_sg.wf01.wt02|      124.0| 
|2021-05-11T22:18:49.999+08:00|root.precalculated_sg.wf01.wt02|      136.0|
|2021-05-11T22:18:55.003+08:00|root.precalculated_sg.wf01.wt02|      184.0|
|2021-05-11T22:18:24.949+08:00|root.precalculated_sg.wf01.wt01|       15.0| 
|2021-05-11T22:18:29.967+08:00|root.precalculated_sg.wf01.wt01|      182.0|
|2021-05-11T22:18:34.979+08:00|root.precalculated_sg.wf01.wt01|      181.0|
|2021-05-11T22:18:39.990+08:00|root.precalculated_sg.wf01.wt01|       20.0|
|2021-05-11T22:18:44.995+08:00|root.precalculated_sg.wf01.wt01|       53.0| 
|2021-05-11T22:18:49.999+08:00|root.precalculated_sg.wf01.wt01|      194.0|
|2021-05-11T22:18:55.003+08:00|root.precalculated_sg.wf01.wt01|       19.0|
+-----------------------------+-------------------------------+-----------+
````

### 连续查询的管理

#### 查询系统已有的连续查询

展示集群中所有的已注册的连续查询

```sql
SHOW (CONTINUOUS QUERIES | CQS) 
```

`SHOW (CONTINUOUS QUERIES | CQS)`会将结果集按照`cq_id`排序。

##### 例子

```sql
SHOW CONTINUOUS QUERIES;
```

执行以上sql，我们将会得到如下的查询结果：

| cq_id        | query                                                                                                                                 | state |
|:-------------|---------------------------------------------------------------------------------------------------------------------------------------|-------|
| s1_count_cq  | CREATE CQ s1_count_cq<br/>BEGIN<br/>SELECT count(s1)<br/>INTO root.sg_count.d.count_s1<br/>FROM root.sg.d<br/>GROUP BY(30m)<br/>END   | active |


#### 删除已有的连续查询

删除指定的名为cq_id的连续查询：

```sql
DROP (CONTINUOUS QUERY | CQ) <cq_id>
```

DROP CQ并不会返回任何结果集。

##### 例子

删除名为s1_count_cq的连续查询：

```sql
DROP CONTINUOUS QUERY s1_count_cq;
```

#### 修改已有的连续查询

目前连续查询一旦被创建就不能再被修改。如果想要修改某个连续查询，只能先用`DROP`命令删除它，然后再用`CREATE`命令重新创建。


### 连续查询的使用场景

#### 对数据进行降采样并对降采样后的数据使用不同的保留策略

可以使用连续查询，定期将高频率采样的原始数据（如每秒1000个点），降采样（如每秒仅保留一个点）后保存到另一个 database 的同名序列中。高精度的原始数据所在 database 的`TTL`可能设置的比较短，比如一天，而低精度的降采样后的数据所在的 database `TTL`可以设置的比较长，比如一个月，从而达到快速释放磁盘空间的目的。

#### 预计算代价昂贵的查询

我们可以通过连续查询对一些重复的查询进行预计算，并将查询结果保存在某些目标序列中，这样真实查询并不需要真的再次去做计算，而是直接查询目标序列的结果，从而缩短了查询的时间。

> 预计算查询结果尤其对一些可视化工具渲染时序图和工作台时有很大的加速作用。

#### 作为子查询的替代品

IoTDB现在不支持子查询，但是我们可以通过创建连续查询得到相似的功能。我们可以将子查询注册为一个连续查询，并将子查询的结果物化到目标序列中，外层查询再直接查询哪个目标序列。

##### 例子

IoTDB并不会接收如下的嵌套子查询。这个查询会计算s1序列每隔30分钟的非空值数量的平均值：

```sql
SELECT avg(count_s1) from (select count(s1) as count_s1 from root.sg.d group by([0, now()), 30m));
```

为了得到相同的结果，我们可以：

**1. 创建一个连续查询**

这一步执行内层子查询部分。下面创建的连续查询每隔30分钟计算一次`root.sg.d.s1`序列的非空值数量，并将结果写入目标序列`root.sg_count.d.count_s1`中。

```sql
CREATE CQ s1_count_cq 
BEGIN 
    SELECT count(s1)  
        INTO root.sg_count.d.count_s1
        FROM root.sg.d
        GROUP BY(30m)
END
```

**2. 查询连续查询的结果**

这一步执行外层查询的avg([...])部分。

查询序列`root.sg_count.d.count_s1`的值，并计算平均值：

```sql
SELECT avg(count_s1) from root.sg_count.d;
```


### 连续查询相关的配置参数
| 参数名 | 描述                   | 类型 | 默认值 |
| :---------------------------------- |----------------------|----------|---------------|
| `continuous_query_submit_thread` | 用于周期性提交连续查询执行任务的线程数  | int32    | 2             |
| `continuous_query_min_every_interval_in_ms` | 系统允许的连续查询最小的周期性时间间隔  | duration | 1000          |