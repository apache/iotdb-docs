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

In IoTDB, identifiers are used to represent the names of databases, tables, columns, functions, and other objects.

## 1. Naming Rules

1. **Starting Character**: An identifier must begin with a letter.
2. **Subsequent Characters**: Identifiers can include letters, digits, and underscores.
3. **Special Characters**: If an identifier contains characters other than letters, digits, and underscores, it must be enclosed in double quotes (`"`).
4. **Escape Characters**: In double-quoted identifiers, a double quote character can be represented using two consecutive double quotes (`""`).

### 1.1 Examples

Here are some examples of valid identifiers:

```sql
test
"table$partitions"
"identifierWith"
"double"
"quotes"
```

The following are examples of invalid identifiers that must be enclosed in double quotes to be used:

```sql
table-name // contains a hyphen
123SchemaName // starts with a number
colum$name@field  // contains special characters and is not enclosed in double quotes
```

## 2. Case Sensitivity

Identifiers in IoTDB are case-insensitive. The system does not preserve the original case of identifiers during storage, but query results display column names in the same case as specified in the SELECT clause of the query.

> Identifiers enclosed in double quotes are also case-insensitive.

### 2.1 Example

Suppose a column named `Device_id` is created. When inspecting the table schema, it appears as `device_id`, but query results reflect the column name in the format specified by the user during the query (e.g., `Device_ID`).

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