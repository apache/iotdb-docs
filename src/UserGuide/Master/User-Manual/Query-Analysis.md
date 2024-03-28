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

# Query Analysis
## Overview

The significance of query analysis lies in assisting users to understand the execution mechanism and performance bottlenecks of queries, thereby achieving query optimization and performance improvement. This concerns not only the efficiency of query execution but also directly affects the user experience of applications and the effective use of resources. To conduct effective query analysis, IoTDB provides query analysis tools: Explain and Explain Analyze.

The Explain tool allows users to preview the execution plan of a query SQL, including how IoTDB organizes data retrieval and processing.

Explain Analyze goes further by adding performance analysis, fully executing the SQL and displaying the time and resources consumed during the execution of the query. It provides detailed information for IoTDB users to deeply understand query details and perform query optimization.
### Explain
The Explain command allows users to view the execution plan of an SQL query. The execution plan is presented in the form of operators, describing how IoTDB will execute the query. The output of Explain includes information such as data access strategies, whether filter conditions are pushed down, and the distribution of the query plan across different nodes, providing users with a means to visualize the internal logic of the query execution. Its syntax is as follows:

```sql
EXPLAIN <SELECT_STATEMENT>
```
Where SELECT_STATEMENT is the SQL statement related to the query. An example of usage is as follows:
```sql
insert into root.explain.data(timestamp, column1, column2) values(1710494762, "hello", "explain")

explain select * from root.explain.data
```
Execute the SQL and get the following result：
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
It can be seen that IoTDB retrieves the data for column1 and column2 through two separate SeriesScan nodes, and finally connects them using fullOuterTimeJoin.
### Explain Analyze
Explain Analyze is a performance analysis SQL built into the IoTDB query engine. Unlike Explain, it executes the corresponding query plan and collects execution information. It can be used to track the specific performance distribution of a query, observe resources, and conduct performance tuning and anomaly analysis.

Compared to other analysis methods where can be attached in IoTDB, Explain Analyze does not require deployment effort and can analyze individual SQL statements, allowing for more precise problem identification:

|Method|Installation Difficulty|Impact on Business|Supports Distributed System|Analysis of Individual SQL|
|:----|:----|:----|:----|:----|
|Arthas Sampling|Requires downloading and running files on the machine: some internal networks cannot directly install Arthas; and sometimes, it requires restarting the application after installation|CPU sampling may affect the response speed of online business|No|Online businesses usually have various query loads, and the overall monitoring metrics and sampling results can only reflect the overall load and response times of all queries, unable to analyze the response time of individual slow SQL|
|Monitor Tool|Requires enabling monitoring services or deploying Grafana, and open-source users do not have a monitoring dashboard|Recording metrics will bring additional response time|Yes| Same as Arthas|
|Explain Analyze|No installation required, available upon starting IoTDB|Only affects the single query being analyzed, with no impact on other online loads|Yes|Allows for tracking and analysis of individual SQL statements|

Its syntax is as following：
```sql
EXPLAIN ANALYZE [VERBOSE] <SELECT_STATEMENT>
```
In it, SELECT_STATEMENT corresponds to the query statement to be analyzed. By default, in order to simplify the results as much as possible, EXPLAIN ANALYZE will omit some information. Specifying VERBOSE can be used to output this information.

The result set of EXPLAIN ANALYZE will include the following information:

![image.png](https://alioss.timecho.com/docs/img/image.png) 

QueryStatistics contains the statistical information at the query level, primarily including the time consumed during the plan parsing phase, Fragment metadata, and other information.

FragmentInstance is IoTDB's encapsulation of a query plan on a node. Each node will output a Fragment information in the result set, mainly including FragmentStatistics and operator information.

FragmentStatistics includes the statistical information of a Fragment, such as the total actual duration (wall-clock time), the TsFiles involved, scheduling information, etc. The information of a Fragment is also displayed in a tree hierarchy of plan nodes within that Fragment, including:
* CPU runtime
* Number of output rows
* Number of times a specific interface is called
* Memory usage
* Node-specific custom information

Below is an example of Explain Analyze:

```sql
insert into root.explain.analyze.data(timestamp, column1, column2, column3) values(1710494762, "hello", "explain", "analyze")
insert into root.explain.analyze.data(timestamp, column1, column2, column3) values(1710494862, "hello2", "explain2", "analyze2")
insert into root.explain.analyze.data(timestamp, column1, column2, column3) values(1710494962, "hello3", "explain3", "analyze3")
explain analyze select column2 from root.explain.analyze.data order by column1
```
Get result following:
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
#### PlanNode Compaction in the Result Of EXPLAIN ANALYZE    

![image-cyxm.png](https://alioss.timecho.com/docs/img/image-cyxm.png)


In a Fragment, the information of all nodes executed in the current node will be output. However, when a query involves too many series, outputting each seriesScanNode can lead to an excessively large result set from Explain Analyze. Therefore, when the same type of nodes exceeds 10, all nodes of the same type under the current Fragment will be merged. The statistical information is also accumulated after the merge, and some customized information that cannot be merged will be directly discarded.

The threshold for triggering the merge of nodes can be set by modifying the configuration item `merge_threshold_of_explain_analyze` in iotdb-common.properties, and this parameter supports hot loading. Below is a part of the result example after triggering a merge:

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


#### Query Timeout Handling
Explain Analyze is a unique type of query. When it times out, we are unable to obtain the analysis results from the return. To address this, allowing for the investigation of timeout reasons through analysis results even in cases of timeout, Explain Analyze offers a timed logging mechanism. After certain intervals, the current results of Explain Analyze are output in text form to a dedicated log file. This way, when a query times out, one can go to the logs to investigate the corresponding log for troubleshooting.

The logging interval is calculated based on the query's timeout setting, ensuring that there are at least two records of results in case of a timeout.