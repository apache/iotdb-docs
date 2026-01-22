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
* [Timeseries Data Model](../Background-knowledge/Navigating_Time_Series_Data.md): Understand the basic concepts and characteristics of time series data to establish a foundation for data modeling.
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

1. If the time column (`TIME`) is not specified, IoTDB automatically adds one. Other columns can be added using the `enable_auto_create_schema` configuration or session interface commands.
2. Column categories default to `FIELD` if not specified. `TAG` and `ATTRIBUTE` columns must be of type `STRING`.
3. Table `TTL` defaults to the database `TTL`. You can omit this property or set it to `default` if the default value is used.
4. `<TABLE_NAME>`:
   1. Case-insensitive. After creation, it will be displayed uniformly in lowercase.
   2. Can include special characters such as `~!`"`%`, etc.
   3. Names with special or Chinese characters must be enclosed in double quotes (`""`).
   4. Outer double quotes are not retained in the final table name. For example: `"a""b"` becomes `a"b`.
   5. Note: In SQL, table or column names with special characters or Chinese characters must be wrapped in double quotes. However, in the native API, do not add extra quotes—otherwise, the quotation marks will become part of the name itself.
5. **`columnDefinition`**: Column names share the same characteristics as table names and can include special characters such as `.`.
6. COMMENT adds comments to the table.

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
```

Note: If your terminal does not support multi-line paste (e.g., Windows CMD), please reformat the SQL statement into a single line before execution.

#### 1.1.2 Automatically Create Tables via SESSION

Tables can be created automatically when inserting data via session.

**Examples:**

```Java
try (ITableSession session =
    new TableSessionBuilder()
        .nodeUrls(Collections.singletonList("127.0.0.1:6667"))
        .username("root")
        .password("root")
        .build()) {

  session.executeNonQueryStatement("CREATE DATABASE db1");
  session.executeNonQueryStatement("use db1");

  // Insert data without manually creating the table
  List<String> columnNameList =
      Arrays.asList("region_id", "plant_id", "device_id", "model", "temperature", "humidity");
  List<TSDataType> dataTypeList =
      Arrays.asList(
          TSDataType.STRING,
          TSDataType.STRING,
          TSDataType.STRING,
          TSDataType.STRING,
          TSDataType.FLOAT,
          TSDataType.DOUBLE);
  List<ColumnCategory> columnTypeList =
      new ArrayList<>(
          Arrays.asList(
              ColumnCategory.TAG,
              ColumnCategory.TAG,
              ColumnCategory.TAG,
              ColumnCategory.ATTRIBUTE,
              ColumnCategory.FIELD,
              ColumnCategory.FIELD));
  Tablet tablet = new Tablet("table1", columnNameList, dataTypeList, columnTypeList, 100);
  for (long timestamp = 0; timestamp < 100; timestamp++) {
    int rowIndex = tablet.getRowSize();
    tablet.addTimestamp(rowIndex, timestamp);
    tablet.addValue("region_id", rowIndex, "1");
    tablet.addValue("plant_id", rowIndex, "5");
    tablet.addValue("device_id", rowIndex, "3");
    tablet.addValue("model", rowIndex, "A");
    tablet.addValue("temperature", rowIndex, 37.6F);
    tablet.addValue("humidity", rowIndex, 111.1);
    if (tablet.getRowSize() == tablet.getMaxRowNumber()) {
      session.insert(tablet);
      tablet.reset();
    }
  }
  if (tablet.getRowSize() != 0) {
    session.insert(tablet);
    tablet.reset();
  }
}
```

After the code execution is complete, you can use the following statement to verify that the table has been successfully created, including details about the time column, tag columns, attribute columns, and field columns.

```SQL
IoTDB> desc table1
+-----------+---------+-----------+-------+
| ColumnName| DataType|   Category|Comment|
+-----------+---------+-----------+-------+
|       time|TIMESTAMP|       TIME|   null|
|  region_id|   STRING|        TAG|   null|
|   plant_id|   STRING|        TAG|   null|
|  device_id|   STRING|        TAG|   null|
|      model|   STRING|  ATTRIBUTE|   null|
|temperature|    FLOAT|      FIELD|   null|
|   humidity|   DOUBLE|      FIELD|   null|
+-----------+---------+-----------+-------+
```

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
IoTDB> show tables from database1
+---------+---------------+
|TableName|        TTL(ms)|
+---------+---------------+
|   table1|    31536000000|
+---------+---------------+

IoTDB> show tables details from database1
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
IoTDB> desc table1
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

IoTDB> desc table1 details
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

### 1.4 Update Tables

Used to update a table, including adding or deleting columns and configuring table properties.

**Syntax:**

```SQL
ALTER TABLE (IF EXISTS)? tableName=qualifiedName ADD COLUMN (IF NOT EXISTS)? column=columnDefinition                #addColumn
| ALTER TABLE (IF EXISTS)? tableName=qualifiedName DROP COLUMN (IF EXISTS)? column=identifier                     #dropColumn
// set TTL can use this
| ALTER TABLE (IF EXISTS)? tableName=qualifiedName SET PROPERTIES propertyAssignments                #setTableProperties
| COMMENT ON TABLE tableName=qualifiedName IS 'table_comment'
| COMMENT ON COLUMN tableName.column IS 'column_comment'
```

**Note:：**

1. The `SET PROPERTIES` operation currently only supports configuring the `TTL` property of a table
2. The delete column function only supports deleting the ATTRIBUTE and FILD columns, and the TAG column does not support deletion.
3. The modified comment will overwrite the original comment. If null is specified, the previous comment will be erased.

**Example:** 

```SQL
ALTER TABLE table1 ADD COLUMN IF NOT EXISTS a TAG COMMENT 'a'
ALTER TABLE table1 ADD COLUMN IF NOT EXISTS b FLOAT FIELD COMMENT 'b'
ALTER TABLE table1 set properties TTL=3600
COMMENT ON TABLE table1 IS 'table1'
COMMENT ON COLUMN table1.a IS null
```

### 1.5 Delete Tables

Used to delete a table.

**Syntax:**

```SQL
DROP TABLE (IF EXISTS)? <TABLE_NAME>
```

**Examples:**

```SQL
DROP TABLE table1
DROP TABLE database1.table1
```