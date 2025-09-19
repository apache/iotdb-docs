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

# Modeling Scheme Design

This section introduces how to transform time series data application scenarios into IoTDB time series modeling.   

## 1. Time Series Data Model

Before designing an IoTDB data model, it's essential to understand time series data and its underlying structure. For more details, refer to: [Time Series Data Model](../Background-knowledge/Navigating_Time_Series_Data.md)

## 2. Two Time Series Model in IoTDB

IoTDB offers two data modeling syntaxes—tree model and table model, each with its distinct characteristics as follows:

**Tree Model**: It manages data points as objects, with each data point corresponding to a time series. The data point names, segmented by dots, form a tree-like directory structure that corresponds one-to-one with the physical world, making the read and write operations on data points straightforward and intuitive.

> 1. When performing data modeling, to meet sufficient performance requirements, it is recommended that the penultimate layer node (corresponding to the number of devices) in the data path (Path) contains no fewer than 1,000 entries. The number of devices is linked to concurrent processing capability—a higher number of devices ensures more efficient concurrent read and write operations.  
     In scenarios where "the number of devices is small but each device contains a large number of data points" (e.g., only 3 devices, each with 10,000 data points), it is advisable to add a .value level at the end of the path. This increases the total number of nodes in the penultimate layer. Example: root.db.device01.metric.value.
> 2. When constructing tree model [paths](../Basic-Concept/Operate-Metadata_timecho.md#4-path-query), if node naming may include non-standard characters or special symbols, it is recommended to implement a backtick encapsulation strategy for all hierarchical nodes. This approach effectively mitigates issues such as probe registration failures and data write interruptions caused by character parsing errors, ensuring the accuracy of path identifiers in syntax parsing.

**Table Model**: It is recommended to create a table for each type of device. The collection of physical quantities from devices of the same type shares certain commonalities (such as the collection of temperature and humidity physical quantities), allowing for flexible and rich data analysis.

### 2.1 Model Characteristics

Both model syntaxes have their own applicable scenarios.

The following table compares the tree model and the table model from various dimensions, including applicable scenarios and typical operations. Users can choose the appropriate model based on their specific usage requirements to achieve efficient data storage and management.

<table style="text-align: center;">
        <tr>
            <td>Dimension</td>
            <td>Tree Model</td>
            <td>Table Model</td>
        </tr>
        <tr>
            <td>Applicable Scenarios</td>
            <td>Measurements management, monitoring scenarios</td>
            <td>Device management, analysis scenarios</td>
        </tr>
        <tr>
            <td>Typical Operations</td>
            <td>Read and write operations by specifying data point paths</td>
            <td>Data filtering and analysis through tags</td>
        </tr>
        <tr>
            <td>Structural Characteristics</td>
            <td>Flexible addition and deletion, similar to a file system</td>
            <td>Template-based management, facilitating data governance</td>
        </tr>
        <tr>
            <td>Syntax Characteristics</td>
            <td>Concise and flexible</td>
            <td>Rich analysis</td>
        </tr>
        <tr>
            <td>Performance Comparison</td>
            <td colspan="2">Similar</td>
        </tr>
</table>

**Notes:**  

- Both model spaces can coexist within the same cluster instance. Each model follows distinct syntax and database naming conventions, and they remain isolated by default.

- When establishing a database connection via client tools (Cli) or SDKs, specify the model syntax using the `sql_dialect` parameter (Tree syntax is used by default).


## 3. Application Scenarios

The application scenarios mainly include three categories:

- Scenario 1: Using the tree model for data reading and writing.

- Scenario 2: Using the table model for data reading and writing.

- Scenario 3: Sharing the same dataset, using the tree model for data reading and writing, and the table model for data analysis.

### 3.1 Scenario 1: Tree Model

#### 3.1.1 Characteristics

- Simple and intuitive, corresponding one-to-one with monitoring points in the physical world.

- Flexible like a file system, allowing the design of any branch structure.

- Suitable for industrial monitoring scenarios such as DCS and SCADA.

#### 3.1.2 Basic Concepts

| **Concept**                  | **Definition**                                               |
| ---------------------------- | ------------------------------------------------------------ |
| **Database**                 | **Definition**: A path prefixed with `root.`.<br>**Naming Recommendation**: Only include the next level node under `root`, such as `root.db`.<br>**Quantity Recommendation**: The upper limit is related to memory. A single database can fully utilize machine resources; there is no need to create multiple databases for performance reasons.<br>**Creation Method**: Recommended to create manually, but can also be created automatically when a time series is created (defaults to the next level node under `root`). |
| **Time Series (Data Point)** | **Definition**:<br>A path prefixed with the database path, segmented by `.`, and can contain any number of levels, such as `root.db.turbine.device1.metric1`.<br>Each time series can have different data types.<br>**Naming Recommendation**:<br>Only include unique identifiers (similar to a composite primary key) in the path, generally not exceeding 10 levels.<br>Typically, place tags with low cardinality (fewer distinct values) at the front to facilitate system compression of common prefixes.<br>**Quantity Recommendation**:<br>The total number of time series manageable by the cluster is related to total memory; refer to the resource recommendation section.<br>There is no limit to the number of child nodes at any level.<br>**Creation Method**: Can be created manually or automatically during data writing. |
| **Device**                   | **Definition**: The second-to-last level is the device, such as `device1` in `root.db.turbine.device1.metric1`.<br>**Creation Method**: Cannot create a device alone; it exists as time series are created. |


#### 3.1.3 Modeling Examples

##### 3.1.3.1 How to model when managing multiple types of devices?

- If different types of devices in the scenario have different hierarchical paths and data point sets, create branches under the database node by device type. Each device type can have a different data point structure.

<div style="text-align: center;">
      <img src="/img/data-model-new-1-en.png" alt="" style="width: 70%;"/>
</div>

##### 3.1.3.2 How to model when there are no devices, only data points?

- For example, in a monitoring system for a station, each data point has a unique number but does not correspond to any specific device.

<div style="text-align: center;">
      <img src="/img/Data-model-en02.png" alt="" style="width: 70%;"/>
</div>

##### 3.1.3.3 How to model when a device has both sub-devices and data points?

- For example, in an energy storage scenario, each layer of the structure monitors its voltage and current. The following modeling approach can be used.

<div style="text-align: center;">
      <img src="/img/Data-model-en03.png" alt="" style="width: 70%;"/>
</div>


### 3.2 Scenario 2: Table Model

#### 3.2.1 Characteristics

- Models and manages device time series data using time series tables, facilitating analysis with standard SQL.

- Suitable for device data analysis or migrating data from other databases to IoTDB.

#### 3.2.2 Basic Concepts

- Database: Can manage multiple types of devices.

- Time Series Table: Corresponds to a type of device.

| **Category**                     | **Definition**                                               |
| -------------------------------- | ------------------------------------------------------------ |
| **Time Column (TIME)**           | Each time series table must have a time column named `time`, with the data type `TIMESTAMP`. |
| **Tag Column (TAG)** \|          | Unique identifiers (composite primary key) for devices, ranging from 0 to multiple.<br>Tag information cannot be modified or deleted but can be added.<br>Recommended to arrange from coarse to fine granularity. |
| **Data Point Column (FIELD)** \| | A device can collect 1 to multiple data points, with values changing over time.<br>There is no limit to the number of data point columns; it can reach hundreds of thousands. |
| **Attribute Column (ATTRIBUTE)** | Supplementary descriptions of devices, not changing over time.<br>Device attribute information can range from 0 to multiple and can be updated or added.<br>A small number of static attributes that may need modification can be stored here. |

**Data Filtering Efficiency**: Time Column = Tag Column > Attribute Column > Data Point Column.

#### 3.2.3 Modeling Examples

##### 3.2.3.1 How to model when managing multiple types of devices?

- Recommended to create a table for each type of device, with each table having different tags and data point sets.

- Even if devices are related or have hierarchical relationships, it is recommended to create a table for each type of device.

<div style="text-align: center;">
      <img src="/img/data-model-new-2-en.png" alt="" style="width: 70%;"/>
</div>

##### 3.2.3.2 How to model when there are no device identifier columns or attribute columns?

- There is no limit to the number of columns; it can reach hundreds of thousands.

<div style="text-align: center;">
      <img src="/img/Data-model-en05.png" alt="" style="width: 70%;"/>
</div>

##### 3.2.3.3 How to model when a device has both sub-devices and data points?

- Each device has multiple sub-devices and data point information. It is recommended to create a table for each type of device for management.

<div style="text-align: center;">
      <img src="/img/data-model-new-3-en.png" alt="" style="width: 70%;"/>
</div>

### 3.3 Scenario 3: Dual-Model Integration

#### 3.3.1 Characteristics

- Ingeniously combines the advantages of the tree model and table model, sharing the same dataset, with flexible writing and rich querying.

- During the data writing phase, the tree model syntax is used, supporting flexible data access and expansion.

- During the data analysis phase, the table model syntax is used, allowing users to perform complex data analysis using standard SQL queries.

#### 3.3.2 Modeling Examples

##### 3.3.2.1 How to model when managing multiple types of devices?

- Different types of devices in the scenario have different hierarchical paths and data point sets.

- **Tree Model**T: Create branches under the database node by device type, with each device type having a different data point structure.

- **Table View**T: Create a table view for each type of device, with each table view having different tags and data point sets.

<div style="text-align: center;">
      <img src="/img/data-model-new-4-en.png" alt="" style="width: 70%;"/>
</div>

##### 3.3.2.2 How to model when there are no device identifier columns or attribute columns?

- **Tree Model**: Each data point has a unique number but does not correspond to any specific device.
- **Table View**: Place all data points into a single table. There is no limit to the number of data point columns; it can reach hundreds of thousands. If data points have the same data type, they can be treated as the same type of device.

<div style="text-align: center;">
      <img src="/img/Data-model-en08.png" alt="" style="width: 70%;"/>
</div>

##### 3.3.2.3 How to model when a device has both sub-devices and data points?

- **Tree Model**: Model each layer of the structure according to the monitoring points in the physical world.
- **Table View**: Create multiple tables to manage each layer of structural information according to device classification.

<div style="text-align: center;">
      <img src="/img/data-model-new-5-en.png" alt="" style="width: 70%;"/>
</div>
