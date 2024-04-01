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

# 运维语句
## 概述

查询分析的意义在于帮助用户理解查询的执行机制和性能瓶颈，从而实现查询优化和性能提升。这不仅关乎到查询的执行效率，也直接影响到应用的用户体验和资源的有效利用。为了进行有效的查询分析，IoTDB提供了查询分析工具：Explain和Explain Analyze。

Explain工具允许用户预览查询SQL的执行计划，包括IoTDB如何组织数据检索和处理。

Explain Analyze则在此基础上增加了性能分析，完整执行SQL并展示查询执行过程中的时间和资源消耗。为IoTDB用户深入理解查询详情以及进行查询优化提供了详细的相关信息。
### Explain
Explain命令允许用户查看SQL查询的执行计划。执行计划以算子的形式展示，描述了IoTDB会如何执行查询。Explain的输出包括了数据访问策略、过滤条件是否下推以及查询计划在不同节点的分配等信息，为用户提供了一种手段，以可视化查询的内部执行逻辑。其语法如下：
```sql
EXPLAIN <SELECT_STATEMENT>
```
其中SELECT_STATEMENT是查询相关的SQL语句。一个使用案例如下：
```sql
insert into root.explain.data(timestamp, column1, column2) values(1710494762, "hello", "explain")

explain select * from root.explain.data
```
执行上方SQL，会得到如下结果：
```
+-----------------------------------------------------------------------+
|                                                      distribution plan|
+-----------------------------------------------------------------------+
|                         ┌───────────────────┐                         |
|                         │FullOuterTimeJoin-3│                         |
|                         │Order: ASC         │                         |
|                         └───────────────────┘                         |
|                 ┌─────────────────┴─────────────────┐                 |
|                 │                                   │                 |
|┌─────────────────────────────────┐ ┌─────────────────────────────────┐|
|│SeriesScan-4                     │ │SeriesScan-5                     │|
|│Series: root.explain.data.column1│ │Series: root.explain.data.column2│|
|│Partition: 3                     │ │Partition: 3                     │|
|└─────────────────────────────────┘ └─────────────────────────────────┘|
+-----------------------------------------------------------------------+
```
不难看出，IoTDB分别通过两个SeriesScan节点去获取column1和column2的数据，最后通过fullOuterTimeJoin将其连接。
### Explain Analyze
Explain Analyze是IOTDB查询引擎自带的性能分析SQL，与Explain不同，它会执行对应的查询计划并统计执行信息，可以用于追踪一条查询的具体性能分布，用于对资源进行观察，进行性能调优与异常分析。

与IoTDB常用的排查手段相比，Explain Analyze没有部署负担，同时能够针对单条sql进行分析，能够更好定位问题：

|方法|安装难度|对业务的影响|支持分布式|单条sql分析|
|:----|:----|:----|:----|:----|
|Arthas抽样|需要在机器上下载并运行文件：部分内网无法直接安装Arthas ；且安装后，有时需要重启应用|CPU 抽样可能会影响线上业务的响应速度|否|线上业务通常都有多种查询负载，整体的监控指标以及抽样结果，只能反映所有查询的整体负载和耗时情况，无法对单条慢sql做耗时分析|
|监控面板|需要开启监控服务并部署grafana，且开源用户没有监控面板|记录指标会带来额外耗时|是| 与Arthas相同|
|Explain Analyze|无需安装，启动IoTDB即可|只会影响当前分析的单条查询，对线上其他负载无影响|是|可以对单条sql进行追踪分析|

其语法如下：
```sql
EXPLAIN ANALYZE [VERBOSE] <SELECT_STATEMENT>
```
其中SELECT_STATEMENT对应需要分析的查询语句；默认情况下，为了尽可能简化结果，EXPLAIN ANALYZE会省略部分信息，指定VERBOSE可以用来输出这些信息。

在EXPLAIN ANALYZE的结果集中，会包含如下信息

![image.png](https://alioss.timecho.com/docs/img/image.png) 

其中，QueryStatistics包含查询层面进的统计信息，主要包含规划解析阶段耗时，Fragment元数据等信息。

FragmentInstance是IoTDB在一个节点上查询计划的封装，每一个节点都会在结果集中输出一份Fragment信息，主要包含FragmentStatistics和算子信息。

其中，FragmentStastistics包含Fragment的统计信息，包括总实际耗时（墙上时间），所涉及到的TsFile，调度信息等情况。在一个Fragment的信息输出同时会以节点树层级的方式展示该Fragment下计划节点的统计信息，主要包括：
* CPU运行时间
* 输出的数据行数
* 指定接口被调用的次数
* 所占用的内存
* 节点专属的定制信息

下面是Explain Analyze的一个样例:
```sql
insert into root.explain.analyze.data(timestamp, column1, column2, column3) values(1710494762, "hello", "explain", "analyze")
insert into root.explain.analyze.data(timestamp, column1, column2, column3) values(1710494862, "hello2", "explain2", "analyze2")
insert into root.explain.analyze.data(timestamp, column1, column2, column3) values(1710494962, "hello3", "explain3", "analyze3")
explain analyze select column2 from root.explain.analyze.data order by column1
```
得到输出如下：
```
+-------------------------------------------------------------------------------------------------+
|                                                                                  Explain Analyze|
+-------------------------------------------------------------------------------------------------+
|Analyze Cost: 1.739 ms                                                                           |
|Fetch Partition Cost: 0.940 ms                                                                   |
|Fetch Schema Cost: 0.066 ms                                                                      |
|Logical Plan Cost: 0.000 ms                                                                      |
|Logical Optimization Cost: 0.000 ms                                                              |
|Distribution Plan Cost: 0.000 ms                                                                 |
|Fragment Instances Count: 1                                                                      |
|                                                                                                 |
|FRAGMENT-INSTANCE[Id: 20240315_115800_00030_1.2.0][IP: 127.0.0.1][DataRegion: 4][State: FINISHED]|
|  Total Wall Time: 25 ms                                                                         |
|  Cost of initDataQuerySource: 0.175 ms                                                          |
|  Seq File(unclosed): 0, Seq File(closed): 1                                                     |
|  UnSeq File(unclosed): 0, UnSeq File(closed): 0                                                 |
|  ready queued time: 0.280 ms, blocked queued time: 2.456 ms                                     |
|    [PlanNodeId 10]: IdentitySinkNode(IdentitySinkOperator)                                      |
|        CPU Time: 0.780 ms                                                                       |
|        output: 1 rows                                                                           |
|        HasNext() Called Count: 3                                                                |
|        Next() Called Count: 2                                                                   |
|        Estimated Memory Size: : 1245184                                                         |
|      [PlanNodeId 5]: TransformNode(TransformOperator)                                           |
|          CPU Time: 0.764 ms                                                                     |
|          output: 1 rows                                                                         |
|          HasNext() Called Count: 3                                                              |
|          Next() Called Count: 2                                                                 |
|          Estimated Memory Size: : 1245184                                                       |
|        [PlanNodeId 4]: SortNode(SortOperator)                                                   |
|            CPU Time: 0.721 ms                                                                   |
|            output: 1 rows                                                                       |
|            HasNext() Called Count: 3                                                            |
|            Next() Called Count: 2                                                               |
|            sortCost/ns: 1125                                                                    |
|            sortedDataSize: 272                                                                  |
|            prepareCost/ns: 610834                                                               |
|          [PlanNodeId 3]: FullOuterTimeJoinNode(FullOuterTimeJoinOperator)                       |
|              CPU Time: 0.706 ms                                                                 |
|              output: 1 rows                                                                     |
|              HasNext() Called Count: 5                                                          |
|              Next() Called Count: 1                                                             |
|            [PlanNodeId 7]: SeriesScanNode(SeriesScanOperator)                                   |
|                CPU Time: 1.085 ms                                                               |
|                output: 1 rows                                                                   |
|                HasNext() Called Count: 2                                                        |
|                Next() Called Count: 1                                                           |
|                SeriesPath: root.explain.analyze.data.column2                                    |
|            [PlanNodeId 8]: SeriesScanNode(SeriesScanOperator)                                   |
|                CPU Time: 1.091 ms                                                               |
|                output: 1 rows                                                                   |
|                HasNext() Called Count: 2                                                        |
|                Next() Called Count: 1                                                           |
|                SeriesPath: root.explain.analyze.data.column1                                    |
+-------------------------------------------------------------------------------------------------+
```
#### EXPLAIN ANALYZE分析结果中的算子压缩

![image-cyxm.png](https://alioss.timecho.com/docs/img/image-cyxm.png)

在Fragment中会输出当前节点中执行的所有节点信息，然而当一次查询涉及的序列过多时，每个节点都被输出会导致Explain Analyze返回的结果集过大，因此当相同类型的节点超过10个时，会合并当前Fragment下所有相同类型的节点。合并后统计信息也被累积，对于一些无法合并的定制信息会直接丢弃。

可以通过修改iotdb-common.properties中的配置项`merge_threshold_of_explain_analyze`来设置触发合并的节点阈值，该参数支持热加载。下面是一个触发合并后的部分结果示例：

```
Analyze Cost: 143.679 ms                                                              
Fetch Partition Cost: 22.023 ms                                                       
Fetch Schema Cost: 63.086 ms                                                          
Logical Plan Cost: 0.000 ms                                                           
Logical Optimization Cost: 0.000 ms                                                   
Distribution Plan Cost: 0.000 ms                                                      
Fragment Instances Count: 2                                                          
                                                                                      
FRAGMENT-INSTANCE[Id: 20240311_041502_00001_1.2.0][IP: 192.168.130.9][DataRegion: 14] 
  Total Wall Time: 39964 ms                                                           
  Cost of initDataQuerySource: 1.834 ms                                               
  Seq File(unclosed): 0, Seq File(closed): 3                                          
  UnSeq File(unclosed): 0, UnSeq File(closed): 0                                      
  ready queued time: 504.334 ms, blocked queued time: 25356.419 ms                    
    [PlanNodeId 20793]: IdentitySinkNode(IdentitySinkOperator) Count: * 1             
        CPU Time: 24440.724 ms                                                        
        input: 71216 rows                                                             
        HasNext() Called Count: 35963                                                 
        Next() Called Count: 35962                                                    
        Estimated Memory Size: : 33882112                                             
      [PlanNodeId 10385]: FullOuterTimeJoinNode(FullOuterTimeJoinOperator) Count: * 8 
          CPU Time: 41437.708 ms                                                      
          input: 243011 rows                                                          
          HasNext() Called Count: 41965                                               
          Next() Called Count: 41958                                                  
          Estimated Memory Size: : 33882112                                           
        [PlanNodeId 11569]: SeriesScanNode(SeriesScanOperator) Count: * 1340          
            CPU Time: 1397.822 ms                                                     
            input: 134000 rows                                                        
            HasNext() Called Count: 2353                                              
            Next() Called Count: 1340                                                 
            Estimated Memory Size: : 32833536                                         
        [PlanNodeId 20778]: ExchangeNode(ExchangeOperator) Count: * 7                 
            CPU Time: 109.245 ms                                                      
            input: 71891 rows                                                         
            HasNext() Called Count: 1431                                              
            Next() Called Count: 1431                                                 
                                                                                      
FRAGMENT-INSTANCE[Id: 20240311_041502_00001_1.3.0][IP: 192.168.130.9][DataRegion: 11] 
  Total Wall Time: 39912 ms                                                           
  Cost of initDataQuerySource: 15.439 ms                                              
  Seq File(unclosed): 0, Seq File(closed): 2                                          
  UnSeq File(unclosed): 0, UnSeq File(closed): 0                                      
  ready queued time: 152.988 ms, blocked queued time: 37775.356 ms                    
    [PlanNodeId 20786]: IdentitySinkNode(IdentitySinkOperator) Count: * 1             
        CPU Time: 2020.258 ms                                                         
        input: 48800 rows                                                             
        HasNext() Called Count: 978                                                   
        Next() Called Count: 978                                                      
        Estimated Memory Size: : 42336256                                             
      [PlanNodeId 20771]: FullOuterTimeJoinNode(FullOuterTimeJoinOperator) Count: * 8 
          CPU Time: 5255.307 ms                                                       
          input: 195800 rows                                                          
          HasNext() Called Count: 2455                                                
          Next() Called Count: 2448                                                   
          Estimated Memory Size: : 42336256                                           
        [PlanNodeId 11867]: SeriesScanNode(SeriesScanOperator) Count: * 1680          
            CPU Time: 1248.080 ms                                                     
            input: 168000 rows                                                        
            HasNext() Called Count: 3198                                              
            Next() Called Count: 1680                                                 
            Estimated Memory Size: : 41287680  

......
```

#### 查询超时处理

Explain Analyze本身是一种特殊的查询，当执行超时的时候，我们是无法从返回结果中获得分析结果的。为了处理该情况，使得在超时的情况下也可以通过分析结果排查超时原因，Explain Analyze提供了**定时日志**机制，每经过一定的时间间隔会将Explain Analyze的当前结果以文本的形式输出到专门的日志中。这样当查询超时时，就可以前往logs中查看对应的日志进行排查。

日志的时间间隔基于查询的超时时间进行计算，可以保证在超时的情况下至少会有两次的结果记录。