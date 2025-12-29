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

# Write & Update Data

## 1. Data Insertion

### 1.1 Syntax

In IoTDB, data insertion follows the general syntax:

```SQL
INSERT INTO <TABLE_NAME> [(COLUMN_NAME[, COLUMN_NAME]*)]? VALUES (COLUMN_VALUE[, COLUMN_VALUE]*)
```

**Basic Constraints**:

1. Tables cannot be automatically created using `INSERT` statements.
2. Columns not specified in the `INSERT` statement will automatically be filled with `null`.
3. If no timestamp is provided, the system will use the current time (`now()`).
4. If a column value does not exist for the identified device, the insertion will overwrite any existing `null` values with the new data.
5. If a column value already exists for the identified device, a new insertion will update the column with the new value.
6. Writing duplicate timestamps will update the values in the columns corresponding to the original timestamps.
7. When an INSERT statement does not specify column names (e.g., INSERT INTO table VALUES (...)), the values in VALUES must strictly follow the physical order of columns in the table (this order can be checked via the DESC table command).

Since attributes generally do not change over time, it is recommended to update attribute values using the `UPDATE` statement described below，Please refer to the following [Data Update](#2-data-updates).

<div style="text-align: center;">
  <img src="/img/%E6%95%B0%E6%8D%AE%E5%86%99%E5%85%A5%E8%8B%B1%E6%96%87.png" alt="" style="width: 70%;"/>
</div>


### 1.2 Automatically Create Tables via Session Insertion

When performing data writing through Session, IoTDB supports schema-less writing: there is no need to manually create tables beforehand. The system automatically constructs the table structure based on the information in the write request, and then directly executes the data writing operation.

**Example:**

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

After execution, you can verify the table creation using the following command:

```SQL
IoTDB> desc table1
+-----------+---------+-----------+
| ColumnName| DataType|   Category|
+-----------+---------+-----------+
|       time|TIMESTAMP|       TIME|
|  region_id|   STRING|        TAG|
|   plant_id|   STRING|        TAG|
|  device_id|   STRING|        TAG|
|      model|   STRING|  ATTRIBUTE|
|temperature|    FLOAT|      FIELD|
|   humidity|   DOUBLE|      FIELD|
+-----------+---------+-----------+
```

### 1.3 Specified Column Insertion

It is possible to insert data for specific columns. Columns not specified will remain `null`.

**Example:**

```SQL
insert into table1("region", "plant_id", "device_id", Time, "temperature", "displacement") values ('Hamburg', '3001', '3', 4, 90.0, 1200.0)


insert into table1("region", "plant_id", "device_id", Time, "temperature") values ('Hamburg, '3001', '3', 5, 90.0)
```

### 1.4 Null Value Insertion

You can explicitly set `null` values for tag columns, attribute columns, and field columns.

**Example**:

Equivalent to the above partial column insertion.

```SQL
# Equivalent to the example above
insert into table1("region", "plant_id", "device_id", "model", "maintenance_cycle", Time, "temperature", "displacement") values ('Hamburg', '3001', '3', null, null, 4, 90.0, 1200.0)

insert into table1("region", "plant_id", "device_id", "model", "maintenance_cycle", Time, "temperature", "displacement") values ('Hamburg', '3001', '3', null, null, 5, 90.0, null)
```

If no tag columns are included, the system will automatically create a device with all tag column values set to `null`.

> **Note:** This operation will not only automatically populate existing tag columns in the table with `null` values but will also populate any newly added tag columns with `null` values in the future.

### 1.5 Multi-Row Insertion

IoTDB supports inserting multiple rows of data in a single statement to improve efficiency.

**Example**:

```SQL
insert into table1
values
(4, 'Frankfurt', '3001', '3', '1', '10', 90.0, 1200.0)
(5, 'Frankfurt', '3001', '3', '1', '10', 90.0, 1200.0)


insert into table1
("region", "plant_id", "device_id", Time, "temperature", "displacement")
values
('Frankfurt', '3001', '3', 4, 90.0, 1200.0)
('Frankfurt', '3001', '3', 5, 90.0, 1200.0)
```

#### Notes

- Referencing non-existent columns in SQL will result in an error code `COLUMN_NOT_EXIST(616)`.
- Data type mismatches between the insertion data and the column's data type will result in an error code `DATA_TYPE_MISMATCH(614)`.


### 1.6 Query Write-back

The IoTDB table model supports the **append-only query write-back** feature, implemented via the `INSERT INTO QUERY` statement. This feature allows writing the results of a query into an **existing** table.

> ​**Note**​: This feature is available starting from version V2.0.6.

#### 1.6.1 Syntax Definition

sql

```sql
INSERT INTO table_name [ ( column [, ... ] ) ] query
```

The **query** component supports three formats, which are illustrated with examples below.

Using the [sample data](../Reference/Sample-Data.md) as the data source, first create the target table:

sql

```sql
IoTDB:database1> CREATE TABLE target_table ( time TIMESTAMP TIME, region STRING TAG, device_id STRING TAG, temperature FLOAT FIELD );
Msg: The statement is executed successfully.
```

1. Write-back via Standard Query Statement

The `query` part is a direct `select ... from ...` query.

​**Example**​: Use a standard query statement to write the `time`, `region`, `device_id`, and `temperature` data of the Beijing region from `table1` into `target_table`.

sql

```sql
IoTDB:database1> insert into target_table select time,region,device_id,temperature from table1 where region = 'Beijing'
Msg: The statement is executed successfully.
IoTDB:database1> select * from target_table where region='Beijing'
+-----------------------------+--------+-----------+-------------+
|                         time|  region|  device_id|  temperature|
+-----------------------------+--------+-----------+-------------+
|2024-11-26T13:37:00.000+08:00| Beijing|        100|         90.0|
|2024-11-26T13:38:00.000+08:00| Beijing|        100|         90.0|
|2024-11-27T16:38:00.000+08:00| Beijing|        101|         null|
|2024-11-27T16:39:00.000+08:00| Beijing|        101|         85.0|
|2024-11-27T16:40:00.000+08:00| Beijing|        101|         85.0|
|2024-11-27T16:41:00.000+08:00| Beijing|        101|         85.0|
|2024-11-27T16:42:00.000+08:00| Beijing|        101|         null|
|2024-11-27T16:43:00.000+08:00| Beijing|        101|         null|
|2024-11-27T16:44:00.000+08:00| Beijing|        101|         null|
+-----------------------------+--------+-----------+-------------+
Total line number = 9
It costs 0.029s
```

2. Write-back via Table Reference Query

The `query` part uses the table reference syntax `table source_table`.

​**Example**​: Use a table reference query to write data from `table3` into `target_table`.

sql

```sql
IoTDB:database1> insert into target_table(time,device_id,temperature) table table3
Msg: The statement is executed successfully.
IoTDB:database1> select * from target_table where region is null
+-----------------------------+------+-----------+-------------+
|                         time|region|  device_id|  temperature|
+-----------------------------+------+-----------+-------------+
|2025-05-13T00:00:00.001+08:00|  null|         d1|         90.0|
|2025-05-13T00:00:01.002+08:00|  null|         d1|         85.0|
|2025-05-13T00:00:02.101+08:00|  null|         d1|         85.0|
|2025-05-13T00:00:03.201+08:00|  null|         d1|         null|
|2025-05-13T00:00:04.105+08:00|  null|         d1|         90.0|
|2025-05-13T00:00:05.023+08:00|  null|         d1|         85.0|
|2025-05-13T00:00:06.129+08:00|  null|         d1|         90.0|
+-----------------------------+------+-----------+-------------+
Total line number = 7
It costs 0.015s
```

3. Write-back via Subquery

The `query` part is a parenthesized subquery.

​**Example**​: Use a subquery to write the `time`, `region`, `device_id`, and `temperature` data from `table1` whose timestamps match the records of the Shanghai region in `table2` into `target_table`.

sql

```sql
IoTDB:database1> insert into target_table (select t1.time, t1.region as region, t1.device_id as device_id, t1.temperature as temperature from table1 t1 where t1.time in (select t2.time from table2 t2 where t2.region = 'Shanghai'))
Msg: The statement is executed successfully.
IoTDB:database1> select * from target_table where region = 'Shanghai'
+-----------------------------+---------+-----------+-------------+
|                         time|   region|  device_id|  temperature|
+-----------------------------+---------+-----------+-------------+
|2024-11-28T08:00:00.000+08:00| Shanghai|        100|         85.0|
|2024-11-29T11:00:00.000+08:00| Shanghai|        100|         null|
+-----------------------------+---------+-----------+-------------+
Total line number = 2
It costs 0.014s
```

#### 1.6.2 Notes

* The source table in the `query` and the target table `table_name` are allowed to be the same table, e.g., `INSERT INTO testtb SELECT * FROM testtb`.
* The target table ​**must already exist**​; otherwise, the error message `550: Table 'xxx.xxx' does not exist` will be thrown.
* The number and data types of columns returned by the query **must exactly match** those of the target table. Type conversion between compatible types is not supported currently. A type mismatch will trigger the error message `701: Insert query has mismatched column types`.
* You can specify a subset of columns in the target table, provided the following rules are met:
  * The timestamp column must be included; otherwise, the error message `701: time column can not be null` will be thrown.
  * At least one **FIELD** column must be included; otherwise, the error message `701: No Field column present` will be thrown.
  * **TAG** columns are optional.
  * The number of specified columns can be less than that of the target table. Missing columns will be automatically filled with `NULL` values.
* For Java applications, the `INSERT INTO QUERY` statement can be executed using the [executeNonQueryStatement](../API/Programming-Java-Native-API_timecho.md#_3-1-itablesession-interface) method.
* For REST API access, the `INSERT INTO QUERY` statement can be executed via the [/rest/table/v1/nonQuery](../API/RestServiceV1.md#_3-3-non-query-interface) endpoint.
* `INSERT INTO QUERY` does **not** support the `EXPLAIN` and `EXPLAIN ANALYZE` commands.
* To execute the query write-back statement successfully, users must have the following permissions:
  * The `SELECT` permission on the source tables involved in the query.
  * The `WRITE` permission on the target table.
  * For more details about user permissions, refer to [Authority Management](../User-Manual/Authority-Management_timecho.md).



## 2. Data Updates

### 2.1 Syntax

```SQL
UPDATE <TABLE_NAME> SET updateAssignment (',' updateAssignment)* (WHERE where=booleanExpression)?

updateAssignment
    : identifier EQ expression
    ;
```

**Note:**

- Updates are allowed only on `ATTRIBUTE` columns.
- `WHERE` conditions:
  - Can only include `TAG` and `ATTRIBUTE` columns; `FIELD` and `TIME` columns are not allowed.
  - Aggregation functions are not supported.
- The result of the `SET` assignment expression must be a `string` type and follow the same constraints as the `WHERE` clause.

**Example**:

```SQL
update table1 set b = a where substring(a, 1, 1) like '%'
```
