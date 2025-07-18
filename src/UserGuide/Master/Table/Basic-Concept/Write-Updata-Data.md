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

Since attributes generally do not change over time, it is recommended to update attribute values using the `UPDATE` statement described below，Please refer to the following [Data Update](#2-data-updates).

<div style="text-align: center;">
  <img src="/img/%E6%95%B0%E6%8D%AE%E5%86%99%E5%85%A5%E8%8B%B1%E6%96%87.png" alt="" style="width: 70%;"/>
</div>


### 1.2 Automatically Create Tables via Session Insertion

When inserting data via the Session API, IoTDB can automatically create table structures based on the data insertion request, eliminating the need for manual table creation.

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
('Frankfurt', '3001', '3', '1', '10', 4, 90.0, 1200.0)
('Frankfurt', '3001', '3', '1', '10', 5, 90.0, 1200.0)


insert into table1
("region", "plant_id", "device_id", Time, "temperature", "displacement")
values
('Frankfurt', '3001', '3', 4, 90.0, 1200.0)
('Frankfurt', '3001', '3', 5, 90.0, 1200.0)
```

#### Notes

- Referencing non-existent columns in SQL will result in an error code `COLUMN_NOT_EXIST(616)`.
- Data type mismatches between the insertion data and the column's data type will result in an error code `DATA_TYPE_MISMATCH(614)`.


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
