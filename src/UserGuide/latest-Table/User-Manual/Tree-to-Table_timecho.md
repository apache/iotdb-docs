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

# Tree-to-Table Mapping

## 1. Functional Overview

IoTDB introduces a tree-to-table function, which enables the creation of table views from existing tree-model data. This allows querying via table views, achieving collaborative processing of both tree and table models for the same dataset:

* During the data writing phase, the tree-model syntax is used, supporting flexible data ingestion and expansion.
* During the data analysis phase, the table-model syntax is adopted, allowing complex data analysis through standard SQL queries.

![](/img/tree-to-table-en-1.png)

> * This feature supports from version V2.0.5.
> * Table views are read-only, so data cannot be written through them.

 ## 2. Feature Description
### 2.1 Creating a Table View
#### 2.1.1 Syntax Definition

```SQL
-- create (or replace) view on tree
CREATE
    [OR REPLACE]
    VIEW view_name ([viewColumnDefinition (',' viewColumnDefinition)*])
    [comment]
    [RESTRICT]
    [WITH properties]
    AS prefixPath

viewColumnDefinition
  : column_name [dataType] TAG [comment]                                    # tagColumn
  | column_name [dataType] TIME [comment]                                   # timeColumn
  | column_name [dataType] FIELD [FROM original_measurement] [comment]    # fieldColumn
  ;
  
comment
  : COMMENT string
  ;
```

> Note: Columns only support tags, fields, or time; attributes are not supported.

#### 2.1.2 Syntax Explanation
1. **`prefixPath`**

Corresponds to the path in the tree model. The last level of the path must be `**`, and no other levels can contain `*`or `**`. This path determines the subtree corresponding to the VIEW.

2. **`view_name`**

The name of the view, which follows the same rules as a table name (for specific constraints, refer to [Create Table](../Basic-Concept/Table-Management_timecho.md#\_1-1-create-a-table)), e.g., `db.view`.

3. **`viewColumnDefinition`**

* `TAG`: Each TAG column corresponds, in order, to the path nodes at the levels following the `prefixPath`.
* `FIELD`: A FIELD column corresponds to a measurement (leaf node) in the tree model.
    * If a FIELD column is specified, the column name uses the declared `column_name`.
        * If `original_measurement`is declared, it maps directly to that measurement in the tree model. Otherwise, the lowercase `column_name`is used as the measurement name for mapping.
        * Mapping multiple FIELD columns to the same measurement name in the tree model is not supported.
        * If the `dataType`for a FIELD column is not specified, the system defaults to the data type of the mapped measurement in the tree model.
        * If a device in the tree model does not contain certain declared FIELD columns, or if their data types are inconsistent with the declared FIELD columns, the value for that FIELD column will always be `NULL`when querying that device.
    * If no FIELD columns are specified, the system automatically scans for all measurements under the `prefixPath`subtree (including all ordinary sequence measurements and measurements defined in any templates whose mounted paths overlap with the `prefixPath`) during creation. The column names will use the measurement names from the tree model.
        * The tree model cannot have measurements with the same name (case-insensitive) but different data types.

4. **`WITH properties`**

Currently, only TTL is supported. It indicates that data older than TTL (in milliseconds) will not be displayed in query results, i.e., effectively `WHERE time > now() - TTL`. If a TTL is also set in the tree model, the query uses the smaller value of the two.

> Note: The table view's TTL does not affect the actual TTL of the devices in the tree model. When data reaches the TTL set in the tree model, it will be physically deleted by the system.

5. **`OR REPLACE`**

A table and a view cannot have the same name. If a table with the same name already exists during creation, an error will be reported. If a view with the same name already exists, it will be replaced.

6. **`RESTRICT`**

This constrains the number of levels of the tree model devices that are matched (starting from the level below the `prefixPath`). If the `RESTRICT`keyword is present, only devices whose level count exactly equals the number of TAG columns are matched. Otherwise, devices whose level count is less than or equal to the number of TAG columns are matched. The default behavior is non-RESTRICT, meaning devices with a level count less than or equal to the number of TAG columns are matched.

#### 2.1.3 Usage Example
1. Tree Model and Table View Schema

![](/img/tree-to-table-en-2.png)

2. Creating the Table View

* Creation Statement:

```SQL
CREATE OR REPLACE VIEW viewdb."wind_turbine"
  (wind_turbine_group String TAG, 
   wind_turbine_number String TAG, 
   voltage DOUBLE FIELD, 
   current DOUBLE FIELD
  ) 
with (ttl=604800000)
AS root.db.**
```

* Detailed Explanation

This statement creates a view named `viewdb.wind_turbine`(an error will occur if `viewdb`does not exist). If the view already exists, it will be replaced.

* It creates a table view for the time series mounted under the tree model path `root.db.**`.
* It has two `TAG` columns, `wind_turbine_group `and `wind_turbine_number`, so the table view will only include devices from the 3rd level of the original tree model.
* It has two `FIELD`columns, `voltage` and `current`. Here, these `FIELD` columns correspond to measurement names in the tree model that are also `voltage` and `current`, and only select time series of type `DOUBLE`.

**Renaming measurement requirement:**

If the measurement name in the tree model is `current_new`, but you want the corresponding `FIELD` column name in the table view to be `current`, the SQL should be changed as follows:

```SQL
CREATE OR REPLACE VIEW viewdb."wind_turbine"
  (wind_turbine_group String TAG, 
   wind_turbine_number String TAG, 
   voltage DOUBLE FIELD, 
   current DOUBLE FIELD FROM current_new
   ) 
with (ttl=604800000)
AS root.db.**
```

### 2.2 Modifying a Table View
#### 2.2.1 Syntax Definition

The ALTER VIEW function supports modifying the view name, adding columns, renaming columns, deleting columns, setting the view's TTL property, and adding comments via COMMENT.

```SQL
-- Rename view
ALTER VIEW [IF EXISTS] viewName RENAME TO to=identifier

-- Add a column to the view
ALTER VIEW [IF EXISTS] viewName ADD COLUMN [IF NOT EXISTS] viewColumnDefinition
viewColumnDefinition
  : column_name [dataType] TAG                                     # tagColumn
  | column_name [dataType] FIELD [FROM original_measurement]     # fieldColumn

-- Rename a column in the view
ALTER VIEW [IF EXISTS] viewName RENAME COLUMN [IF EXISTS] oldName TO newName

-- Delete a column from the view
ALTER VIEW [IF EXISTS] viewName DROP COLUMN [IF EXISTS] columnName

-- Modify the view's TTL
ALTER VIEW [IF EXISTS] viewName SET PROPERTIES propertyAssignments

-- Add comments
COMMENT ON VIEW qualifiedName IS (string | NULL) #commentView
COMMENT ON COLUMN qualifiedName '.' column=identifier IS (string | NULL) #commentColumn
```

#### 2.2.2 Syntax Explanation
1. The `SET PROPERTIES`operation currently only supports configuring the TTL property for the table view.
2. The `DROP COLUMN`function only supports deleting FIELD columns; TAG columns cannot be deleted.
3. Modifying the comment will overwrite the original comment. If set to `null`, the previous comment will be erased.
#### 2.2.3 Usage Examples

```SQL
-- Rename view
ALTER VIEW IF EXISTS tableview1 RENAME TO tableview

-- Add a column to the view
ALTER VIEW IF EXISTS tableview ADD COLUMN IF NOT EXISTS temperature float field

-- Rename a column in the view
ALTER VIEW IF EXISTS tableview RENAME COLUMN IF EXISTS temperature TO temp

-- Delete a column from the view
ALTER VIEW IF EXISTS tableview DROP COLUMN IF EXISTS temp

-- Modify the view's TTL
ALTER VIEW IF EXISTS tableview SET PROPERTIES TTL=3600

-- Add comments
COMMENT ON VIEW tableview IS 'Tree to Table'
COMMENT ON COLUMN tableview.status is Null
```

### 2.3 Deleting a Table View
#### 2.3.1 Syntax Definition

```SQL
DROP VIEW [IF EXISTS] viewName
```

#### 2.3.2 Usage Example

```SQL
DROP VIEW IF EXISTS tableview
```

### 2.4 Viewing Table Views
#### 2.4.1 **`Show Tables`**
1. Syntax Definition

```SQL
SHOW TABLES (DETAILS)? ((FROM | IN) database_name)?
```

2. Syntax Explanation

The `SHOW TABLES (DETAILS)`statement displays the type information of tables or views through the `TABLE_TYPE`field in the result set:

| Type                                       | `TABLE_TYPE`Field Value |
| -------------------------------------------- | ----------------------------- |
| Ordinary Table（Table)                     | `BASE TABLE`            |
| Tree-to-Table View （Tree View)            | `VIEW FROM TREE`        |
| System Table（Iinformation\_schema.Tables) | `SYSTEM VIEW`           |

3. Usage Examples

```SQL
IoTDB> show tables details from database1
+-----------+-----------+------+---------------+--------------+
|  TableName|    TTL(ms)|Status|        Comment|     TableType|
+-----------+-----------+------+---------------+--------------+
|  tableview|        INF| USING| Tree to Table |VIEW FROM TREE|
|     table1|31536000000| USING|           null|    BASE TABLE|
|     table2|31536000000| USING|           null|    BASE TABLE|
+-----------+-----------+------+---------------+--------------+

IoTDB> show tables details from information_schema 
+--------------+-------+------+-------+-----------+
|     TableName|TTL(ms)|Status|Comment|  TableType|
+--------------+-------+------+-------+-----------+
|       columns|    INF| USING|   null|SYSTEM VIEW|
|  config_nodes|    INF| USING|   null|SYSTEM VIEW|
|configurations|    INF| USING|   null|SYSTEM VIEW|
|    data_nodes|    INF| USING|   null|SYSTEM VIEW|
|     databases|    INF| USING|   null|SYSTEM VIEW|
|     functions|    INF| USING|   null|SYSTEM VIEW|
|      keywords|    INF| USING|   null|SYSTEM VIEW|
|        models|    INF| USING|   null|SYSTEM VIEW|
|         nodes|    INF| USING|   null|SYSTEM VIEW|
|  pipe_plugins|    INF| USING|   null|SYSTEM VIEW|
|         pipes|    INF| USING|   null|SYSTEM VIEW|
|       queries|    INF| USING|   null|SYSTEM VIEW|
|       regions|    INF| USING|   null|SYSTEM VIEW|
| subscriptions|    INF| USING|   null|SYSTEM VIEW|
|        tables|    INF| USING|   null|SYSTEM VIEW|
|        topics|    INF| USING|   null|SYSTEM VIEW|
|         views|    INF| USING|   null|SYSTEM VIEW|
+--------------+-------+------+-------+-----------+
```

#### 2.4.2 **`Show Create Table/View`**
1. Syntax Definition

```SQL
SHOW CREATE TABLE|VIEW viewname;
```

2. Syntax Explanation

* The `SHOW CREATE TABLE`statement can be used to display the complete creation information for ordinary tables or views.
* The `SHOW CREATE VIEW`statement can only be used to display the complete creation information for views.
* Neither statement can be used to display system tables.

3. Usage Examples

```SQL
IoTDB> show create table tableview
+---------+-------------------------------------------------------------------------------------------------------------------------------------------------------------+
|     View|                                                                                                                                                  Create View|
+---------+-------------------------------------------------------------------------------------------------------------------------------------------------------------+
|tableview|CREATE VIEW "tableview" ("device" STRING TAG,"model" STRING TAG,"status" BOOLEAN FIELD,"hardware" STRING FIELD) COMMENT '树转表' WITH (ttl=INF) AS root.ln.**|
+---------+-------------------------------------------------------------------------------------------------------------------------------------------------------------+

IoTDB> show create view tableview
+---------+-------------------------------------------------------------------------------------------------------------------------------------------------------------+
|     View|                                                                                                                                                  Create View|
+---------+-------------------------------------------------------------------------------------------------------------------------------------------------------------+
|tableview|CREATE VIEW "tableview" ("device" STRING TAG,"model" STRING TAG,"status" BOOLEAN FIELD,"hardware" STRING FIELD) COMMENT '表视图' WITH (ttl=INF) AS root.ln.**|
+---------+-------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

### 2.5 Query Differences Between Non-aligned and Aligned Devices

Queries on tree-to-table views may yield different results compared to equivalent tree model `ALIGN BY DEVICE`queries when dealing with null values in aligned and non-aligned devices.

* Aligned Devices
    * Tree Model Query Behavior:Rows where all selected time series have null values are not retained.
    * Table View Query Behavior:Consistent with the table model, rows where all selected fields are null are retained.
* Non-aligned Devices
    * Tree Model Query Behavior:Rows where all selected time series have null values are not retained.
    * Table View Query Behavior:Consistent with the tree model, rows where all selected fields are null are not retained.
* Explanation Example
    * Aligned

  ```SQL
  -- Write data in tree model (aligned)
  CREATE ALIGNED TIMESERIES root.db.battery.b1(voltage INT32, current FLOAT)
  INSERT INTO root.db.battery.b1(time, voltage, current) aligned values (1, 1, 1)
  INSERT INTO root.db.battery.b1(time, voltage, current) aligned values (2, null, 1)
  
  -- Create VIEW statement
  CREATE VIEW view1 (battery_id TAG, voltage INT32 FIELD, current FLOAT FIELD) as root.db.battery.**
  
  -- Query
  IoTDB> select voltage from view1
  +-------+
  |voltage|
  +-------+
  |      1|
  |   null|
  +-------+
  Total line number = 2
  ```

    * Non-aligned

  ```SQL
  -- Write data in tree model (non-aligned)
  CREATE TIMESERIES root.db.battery.b1.voltage INT32
  CREATE TIMESERIES root.db.battery.b1.current FLOAT
  INSERT INTO root.db.battery.b1(time, voltage, current) values (1, 1, 1)
  INSERT INTO root.db.battery.b1(time, voltage, current) values (2, null, 1)
  
  -- Create VIEW statement
  CREATE VIEW view1 (battery_id TAG, voltage INT32 FIELD, current FLOAT FIELD) as root.db.battery.**
  
  -- Query
  IoTDB> select voltage from view1
  +-------+
  |voltage|
  +-------+
  |      1|
  +-------+
  Total line number = 1
  
  -- Can only ensure all rows are retrieved if the query specifies all FIELD columns, or only non-FIELD columns
  IoTDB> select voltage,current from view1
  +-------+-------+
  |voltage|current|
  +-------+-------+
  |      1|    1.0|
  |   null|    1.0|
  +-------+-------+
  Total line number = 2
  
  IoTDB> select battery_id from view1
  +-----------+
  |battery_id|
  +-----------+
  |         b1|
  |         b1|
  +-----------+
  Total line number = 2
  
  -- If the query involves only some FIELD columns, the final number of rows depends on the number of rows after aligning the specified FIELD columns by timestamp.
  IoTDB> select time,voltage from view1
  +-----------------------------+-------+
  |                         time|voltage|
  +-----------------------------+-------+
  |1970-01-01T08:00:00.001+08:00|      1|
  +-----------------------------+-------+
  Total line number = 1
  ```

## 3. Scenario Examples
### 3.1 Managing Multiple Device Types in the Original Tree Model

* The scenario involves managing different types of devices, each with its own hierarchical path and set of measurements.
* During Data Writing: Create branches under the database node according to device type. Each device type can have a different measurement structure.
* During Querying: Create a separate table for each device type. Each table will have different tags and sets of measurements.

![](/img/tree-to-table-en-3.png)

**SQL for Creating a Table View:**

```SQL
-- Wind Turbine Table 
CREATE VIEW viewdb.wind_turbine
  (wind_turbine_group String TAG, 
   wind_turbine_number String TAG, 
   voltage DOUBLE FIELD, 
   current DOUBLE FIELD
   ) 
AS root.db.wind_turbine.**

-- Motor Table
CREATE VIEW viewdb.motor
  ( motor_group String TAG, 
    motor_number String TAG, 
    power FLOAT FIELD, 
    electricity FLOAT FIELD,
    temperature FLOAT FIELD
   ) 
AS root.db.motor.**
```

### 3.2 Original Tree Model Contains Only Measurements, No Devices

This scenario occurs in systems like station monitoring where each measurement has a unique identifier but cannot be mapped to specific physical devices.

> Wide Table Form

![](/img/tree-to-table-en-4.png)

**SQL for Creating a Table View:**

```SQL
CREATE VIEW viewdb.machine
  (DCS_PIT_02105A DOUBLE FIELD, 
   DCS_PIT_02105B DOUBLE FIELD,
   DCS_PIT_02105C DOUBLE FIELD,
   ...
   DCS_XI_02716A DOUBLE FIELD
   ) 
AS root.db.**
```

### 3.3 Original Tree Model Where a Device Has Both Sub-devices and Measurements

This scenario is common in energy storage systems where each hierarchical level requires monitoring of parameters like voltage and current.

* Writing Phase: Model according to physical monitoring points at each hierarchical level
* Querying Phase: Create multiple tables based on device categories to manage information at each structural level

![](/img/tree-to-table-en-5.png)

**SQL for Creating a Table View:**

```SQL
-- Battery Compartment
CREATE VIEW viewdb.battery_compartment
  (station String TAG, 
   batter_compartment String TAG, 
   voltage DOUBLE FIELD, 
   current DOUBLE FIELD
   ) 
RESTRICT
AS root.db.**

-- Battery Stack
CREATE VIEW viewdb.battery_stack
  (station String TAG, 
   batter_compartment String TAG, 
   battery_stack String TAG, 
   voltage DOUBLE FIELD, 
   current DOUBLE FIELD
   ) 
RESTRICT
AS root.db.**

-- Battery Cluster
CREATE VIEW viewdb.battery_cluster
  (station String TAG, 
   batter_compartment String TAG, 
   battery_stackString TAG, 
   battery_cluster String TAG,
   voltage DOUBLE FIELD, 
   current DOUBLE FIELD
   ) 
RESTRICT
AS 'root.db.**'

-- Battery Ceil
CREATE VIEW viewdb.battery_ceil
  (station String TAG, 
   batter_compartment String TAG, 
   battery_cluster String TAG, 
   battery_cluster String TAG,
   battery_ceil String TAG,
   voltage DOUBLE FIELD, 
   current DOUBLE FIELD
   )
RESTRICT
AS root.db.**
```

### 3.4 Original Tree Model Where a Device Has Only One Measurement Under It

> Narrow Table Form

#### 3.4.1 All Measurements Have the Same Data Type

![](/img/tree-to-table-en-6.png)

**SQL for Creating a Table View:**

```SQL
CREATE VIEW viewdb.machine
  (
   sensor_id STRING TAG,
   value DOUBLE FIELD
   ) 
AS root.db.**
```

#### 3.4.2 Measurements Have Different Data Types
##### 3.4.2.1 Create a Narrow Table View for Each Data Type of Measurement

**Advantage: ​**The number of table views is constant, only related to the data types in the system.

**Disadvantage: ​**When querying the value of a specific measurement, its data type must be known in advance to determine which table view to query.

![](/img/tree-to-table-en-7.png)

**SQL for Creating a Table View:**

```SQL
CREATE VIEW viewdb.machine_float
  (
   sensor_id STRING TAG,
   value FLOAT FIELD
   ) 
AS root.db.**

CREATE VIEW viewdb.machine_double
  (
   sensor_id STRING TAG,
   value DOUBLE FIELD
   ) 
AS root.db.**

CREATE VIEW viewdb.machine_int32
  (
   sensor_id STRING TAG,
   value INT32 FIELD
   ) 
AS root.db.**

CREATE VIEW viewdb.machine_int64
  (
   sensor_id STRING TAG,
   value INT64 FIELD
   ) 
AS root.db.**

...
```

##### 3.4.2.2 Create a Table for Each Measurement

**Advantage: ​**When querying the value of a specific measurement, there's no need to first check its data type to determine which table to query, making the process simple and convenient.

**Disadvantage: ​**When there are a large number of measurements, it will introduce too many table views, requiring the writing of a large number of view creation statements.

![](/img/tree-to-table-en-8.png)

**SQL for Creating a Table View:**

```SQL
CREATE VIEW viewdb.DCS_PIT_02105A
  (
   value FLOAT FIELD
   ) 
AS root.db.DCS_PIT_02105A.**

CREATE VIEW viewdb.DCS_PIT_02105B
  (
   value DOUBLE FIELD
   ) 
AS root.db.DCS_PIT_02105B.**

CREATE VIEW viewdb.DCS_XI_02716A
  (
   value INT64 FIELD
   ) 
AS root.db.DCS_XI_02716A.**

......
```
