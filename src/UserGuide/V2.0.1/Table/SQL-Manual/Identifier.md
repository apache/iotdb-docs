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

# Identifiers

In IoTDB, identifiers are used to identify database, table, column, function, or other object names.

## Naming Rules

- __First Character__：Identifiers must begin with a letter.
- __Subsequent Characters__：Can include letters, numbers, and underscores.
- __Special Characters__：If an identifier contains characters other than letters, numbers, and underscores, it must be enclosed in double quotes (`"`).
- __Escape Character__：Within double-quoted identifiers, two consecutive double quotes (`""`) are used to represent a single double quote character.

### Examples

Here are some valid identifier examples:

```sql
test
"table$partitions"
"identifierWith"
"double"
"quotes"
```

Invalid identifier examples that must be quoted with double quotes:

```sql
table-name // contains a hyphen
123SchemaName // starts with a number
colum$name@field  // contains special characters and is not enclosed in double quotes
```

## Case Sensitivity

Identifiers are not case-sensitive, and the system does not retain the original case when storing identifiers. The column names in the query results will be displayed based on the case specified by the user in the SELECT clause.

> Identifiers enclosed in double quotes are also not case-sensitive.

### Example

When a column named `Device_id` is created, it is seen as `device_id` when viewing the table, but the returned result column matches the format specified by the user in the query as `Device_ID`:

```sql
IoTDB> create table table1(Device_id STRING TAG, Model STRING ATTRIBUTE, TemPerature FLOAT FIELD, Humidity DOUBLE FIELD)

IoTDB> desc table1;
+-----------+---------+-----------+
| ColumnName| DataType|   Category|
+-----------+---------+-----------+
|       time|TIMESTAMP|       TIME|
|  device_id|   STRING|        TAG|
|      model|   STRING|  ATTRIBUTE|
|temperature|    FLOAT|      FIELD|
|   humidity|   DOUBLE|      FIELD|
+-----------+---------+-----------+

IoTDB> select TiMe, Device_ID, MoDEL, TEMPerature, HUMIdity from table1;
+-----------------------------+---------+------+-----------+--------+
|                         TiMe|Device_ID| MoDEL|TEMPerature|HUMIdity|
+-----------------------------+---------+------+-----------+--------+
|1970-01-01T08:00:00.001+08:00|       d1|modelY|       27.2|    67.0|
+-----------------------------+---------+------+-----------+--------+
```