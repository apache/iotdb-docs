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

# Table Management

Before starting to use the table management functionality, we recommend familiarizing yourself with the following related background knowledge for a better understanding and application of the table management features:
* [Timeseries Data Model](../Background-knowledge/Navigating_Time_Series_Data_timecho.md): Understand the basic concepts and characteristics of time series data to establish a foundation for data modeling.
* [Modeling Scheme Design](../Background-knowledge/Data-Model-and-Terminology_timecho.md): Master the IoTDB time series model and its applicable scenarios to provide a design basis for table management.

## 1. Table Management

### 1.1 Create a Table

#### 1.1.1 Manually create a table with CREATE

Manually create a table within the current or specified database.The format is "database name. table name".

**Syntax:**

```SQL
createTableStatement
    : CREATE TABLE (IF NOT EXISTS)? qualifiedName
        '(' (columnDefinition (',' columnDefinition)*)? ')'
        charsetDesc?
        comment?
        (WITH properties)?
     ;

charsetDesc
    : DEFAULT? (CHAR SET | CHARSET | CHARACTER SET) EQ? identifierOrString
    ;

columnDefinition
    : identifier columnCategory=(TAG | ATTRIBUTE | TIME) charsetName? comment?
    | identifier type (columnCategory=(TAG | ATTRIBUTE | TIME | FIELD))? charsetName? comment?
    ;

charsetName
    : CHAR SET identifier
    | CHARSET identifier
    | CHARACTER SET identifier
    ;

comment
    : COMMENT string
    ;
```

**Note:**

1. When creating a table, you do not need to specify a time column. IoTDB automatically adds a column named "time" and places it as the first column. All other columns can be added by enabling the `enable_auto_create_schema` option in the database configuration, or through the session interface for automatic creation or by using table modification statements.
2. Since version V2.0.8.2, tables support custom naming of the time column during creation. The order of the custom time column in the table is determined by the order in the creation SQL. The related constraints are as follows:

   - When the column category is set to TIME, the data type must be TIMESTAMP.
   - Each table allows at most one time column (columnCategory = TIME).
   - If no time column is explicitly defined, no other column can use "time" as its name to avoid conflicts with the system's default time column naming.
3. The column category can be omitted and defaults to FIELD. When the column category is TAG or ATTRIBUTE, the data type must be STRING (can be omitted).
4. The TTL of a table defaults to the TTL of its database. If the default value is used, this attribute can be omitted or set to default.
5. <TABLE_NAME> table name has the following characteristics:

   - It is case-insensitive and, upon successful creation, is uniformly displayed in lowercase.
   - The name can include special characters, such as `~!`"%`, etc.
   - Table names containing special characters or Chinese characters must be enclosed in double quotation marks ("") during creation.

      - Note: In SQL, special characters or Chinese table names must be enclosed in double quotes. In the native API, no additional quotes are needed; otherwise, the table name will include the quote characters.
   - When naming a table, the outermost double quotation marks (`""`) will not appear in the actual table name.
   - ```sql
      -- In SQL
      "a""b" --> a"b
      """""" --> ""
      -- In API
      "a""b" --> "a""b"
     ```
6. columnDefinition column names have the same characteristics as table names and can include the special character `.`.
7. COMMENT adds a comment to the table.

**Examples:** 

```SQL
CREATE TABLE table1 (
  time TIMESTAMP TIME,
  region STRING TAG,
  plant_id STRING TAG,
  device_id STRING TAG,
  model_id STRING ATTRIBUTE,
  maintenance STRING ATTRIBUTE COMMENT 'maintenance',
  temperature FLOAT FIELD COMMENT 'temperature',
  humidity FLOAT FIELD COMMENT 'humidity',
  status Boolean FIELD COMMENT 'status',
  arrival_time TIMESTAMP FIELD COMMENT 'arrival_time'
) COMMENT 'table1' WITH (TTL=31536000000);


CREATE TABLE if not exists tableB ();

CREATE TABLE tableC (
  "Site" STRING TAG,
  "Temperature" int32 FIELD COMMENT 'temperature'
 ) with (TTL=DEFAULT);
 
 -- Custom time column: named time_test, located in the second column of the table.
 CREATE TABLE table1 (
     region STRING TAG, 
     time_user_defined TIMESTAMP TIME, 
     temperature FLOAT FIELD
 );
```

Note: If your terminal does not support multi-line paste (e.g., Windows CMD), please reformat the SQL statement into a single line before execution.

### 1.2 View Tables

Used to view all tables and their properties in the current or a specified database.

**Syntax:**

```SQL
SHOW TABLES (DETAILS)? ((FROM | IN) database_name)?
```

**Note:**

1. If the `FROM` or `IN` clause is specified, the command lists all tables in the specified database.
2. If neither `FROM` nor `IN` is specified, the command lists all tables in the currently selected database. If no database is selected (`USE` statement not executed), an error is returned.
3. When the `DETAILS` option is used, the command shows the current state of each table:
   1. `USING`: The table is available and operational.
   2. `PRE_CREATE`: The table is in the process of being created or the creation has failed; the table is not available.
   3. `PRE_DELETE`: The table is in the process of being deleted or the deletion has failed; the table will remain permanently unavailable.

**Examples:**

```SQL
show tables from database1;
```
```shell
+---------+---------------+
|TableName|        TTL(ms)|
+---------+---------------+
|   table1|    31536000000|
+---------+---------------+
```
```sql
show tables details from database1;
```
```shell
+---------------+-----------+------+-------+
|      TableName|    TTL(ms)|Status|Comment|
+---------------+-----------+------+-------+
|         table1|31536000000| USING| table1|
+---------------+-----------+------+-------+
```

### 1.3 View Table Columns

Used to view column names, data types, categories, and states of a table.

**Syntax:**

```SQL
(DESC | DESCRIBE) <TABLE_NAME> (DETAILS)?
```

**Note:** If the `DETAILS` option is specified, detailed state information of the columns is displayed:

- `USING`: The column is in normal use.
- `PRE_DELETE`: The column is being deleted or the deletion has failed; it is permanently unavailable.



**Examples:** 

```SQL
desc table1;
```
```shell
+------------+---------+---------+
|  ColumnName| DataType| Category|
+------------+---------+---------+
|        time|TIMESTAMP|     TIME|
|      region|   STRING|      TAG|
|    plant_id|   STRING|      TAG|
|   device_id|   STRING|      TAG|
|    model_id|   STRING|ATTRIBUTE|
| maintenance|   STRING|ATTRIBUTE|
| temperature|    FLOAT|    FIELD|
|    humidity|    FLOAT|    FIELD|
|      status|  BOOLEAN|    FIELD|
|arrival_time|TIMESTAMP|    FIELD|
+------------+---------+---------+
```
```sql
desc table1 details;
```
```shell
+------------+---------+---------+------+------------+
|  ColumnName| DataType| Category|Status|     Comment|
+------------+---------+---------+------+------------+
|        time|TIMESTAMP|     TIME| USING|        null|
|      region|   STRING|      TAG| USING|        null|
|    plant_id|   STRING|      TAG| USING|        null|
|   device_id|   STRING|      TAG| USING|        null|
|    model_id|   STRING|ATTRIBUTE| USING|        null|
| maintenance|   STRING|ATTRIBUTE| USING| maintenance|
| temperature|    FLOAT|    FIELD| USING| temperature|
|    humidity|    FLOAT|    FIELD| USING|    humidity|
|      status|  BOOLEAN|    FIELD| USING|      status|
|arrival_time|TIMESTAMP|    FIELD| USING|arrival_time|
+------------+---------+---------+------+------------+
```

### 1.4 View Table Creation Statement

Retrieves the complete definition statement of a table or view under the table model. This feature automatically fills in all default values that were omitted during creation, so the displayed statement may differ from the original CREATE statement.

> This feature is supported starting from v2.0.5.

**Syntax:**

```SQL
SHOW CREATE TABLE <TABLE_NAME>
```

**Note:：**

1. This statement does not support queries on system tables.

**Example:**

```SQL
show create table table1;
```
```shell
+------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table|                                                                                                                                                                                                                                                                     Create Table|
+------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|table1|CREATE TABLE "table1" ("region" STRING TAG,"plant_id" STRING TAG,"device_id" STRING TAG,"model_id" STRING ATTRIBUTE,"maintenance" STRING ATTRIBUTE,"temperature" FLOAT FIELD,"humidity" FLOAT FIELD,"status" BOOLEAN FIELD,"arrival_time" TIMESTAMP FIELD) WITH (ttl=31536000000)|
+------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
Total line number = 1
```


### 1.5 Update Tables

Used to update a table, including adding or deleting columns, modify column type (V2.0.8.2) and configuring table properties.

**Syntax:**

```SQL
#addColumn;
ALTER TABLE (IF EXISTS)? tableName=qualifiedName ADD COLUMN (IF NOT EXISTS)? column=columnDefinition;  
#dropColumn;              
| ALTER TABLE (IF EXISTS)? tableName=qualifiedName DROP COLUMN (IF EXISTS)? column=identifier;   
#setTableProperties;                  
// set TTL can use this;
| ALTER TABLE (IF EXISTS)? tableName=qualifiedName SET PROPERTIES propertyAssignments;                
| COMMENT ON TABLE tableName=qualifiedName IS 'table_comment';
| COMMENT ON COLUMN tableName.column IS 'column_comment';
#changeColumndatatype;
| ALTER TABLE (IF EXISTS)? tableName=qualifiedName ALTER COLUMN (IF EXISTS)? column=identifier SET DATA TYPE new_type=type;
```

**Note:：**

1. The `SET PROPERTIES` operation currently only supports configuring the `TTL` property of a table
2. The delete column function only supports deleting the ATTRIBUTE and FILD columns, and the TAG column does not support deletion.
3. The modified comment will overwrite the original comment. If null is specified, the previous comment will be erased.
4. Since version V2.0.8.2, modifying the data type of a column is supported. Currently, only columns with Category type FIELD can be modified.

   * If the time series is concurrently deleted during the modification process, an error will be reported.
   * The new data type must be compatible with the original type. The specific compatibility is shown in the following table:

**Example:** 

```SQL
ALTER TABLE table1 ADD COLUMN IF NOT EXISTS a TAG COMMENT 'a';
ALTER TABLE table1 ADD COLUMN IF NOT EXISTS b FLOAT FIELD COMMENT 'b';
ALTER TABLE table1 set properties TTL=3600;
COMMENT ON TABLE table1 IS 'table1';
COMMENT ON COLUMN table1.a IS null;
ALTER TABLE table1 ALTER COLUMN IF EXISTS b SET DATA TYPE DOUBLE;
```

### 1.6 Delete Tables

Used to delete a table.

**Syntax:**

```SQL
DROP TABLE (IF EXISTS)? <TABLE_NAME>
```

**Examples:**

```SQL
DROP TABLE table1;
DROP TABLE database1.table1;
```

## 1.7 Metadata Query
Under the table model, the **total number of measurement points** equals the sum of measurement points of all tables. Currently, the number of measurement points in a single table can be calculated with the formula:
**Measurement points per single table = Number of devices × Number of field columns**.
Support for directly querying measurement points under the table model via SQL statements will be available in future updates. Please stay tuned.

Take `table1` in the [sample data](../Reference/Sample-Data.md) as an example.

In the organizational structure of this sample, there are three tag columns (`region`, `plant_id`, `device_id`) and four field columns (`temperature`, `humidity`, `status`, `arrival_time`).

A unique device is identified by the combination of all tag columns. Each unique combination of `region` + `plant_id` + `device_id` represents an independent device.

The sample data defines 2 regions: Beijing and Shanghai. Details are as follows:
- **Beijing**: 1 factory with ID 1001
   - 2 devices under this factory: IDs 100 and 101
- **Shanghai**: 2 factories with IDs 3001 and 3002
   - Factory 3001: 2 devices (IDs 100, 101)
   - Factory 3002: 2 devices (IDs 100, 101)

In total, there are 6 unique tag combinations in the table, corresponding to 6 independent devices.

### Complete Calculation Example for Single-Table Measurement Points
1. Query the number of devices
```sql
IoTDB:database1> count devices from table1
+--------------+
|count(devices)|
+--------------+
|             6|
+--------------+
Total line number = 1
It costs 0.019s
```

2. Calculate the total measurement points of the single table
- Number of devices: 6
- Number of field columns: 4
- Total measurement points of the table: **6 × 4 = 24**

