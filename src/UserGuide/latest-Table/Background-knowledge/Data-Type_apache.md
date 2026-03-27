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

# Data Type

## 1. Basic Data Types

IoTDB supports the following ten data types:

- **BOOLEAN** (Boolean value)
- **INT32** (32-bit integer)
- **INT64** (64-bit integer)
- **FLOAT** (Single-precision floating-point number)
- **DOUBLE** (Double-precision floating-point number)
- **TEXT** (Text data, suitable for long strings, Not recommended)
- **STRING** (String data with additional statistical information for optimized queries)
- **BLOB** (Large binary object)
- **OBJECT** (Large Binary Object)
  > Supported since V2.0.8-beta
- **TIMESTAMP** (Timestamp, representing precise moments in time)
- **DATE** (Date, storing only calendar date information)

The difference between **STRING** and **TEXT**:

- **STRING** stores text data and includes additional statistical information to optimize value-filtering queries.
- **TEXT** is suitable for storing long text strings without additional query optimization.

The differences between **OBJECT** and **BLOB** types are as follows:

|                      | **OBJECT**                                                                                                              | **BLOB**                             |
|----------------------|-------------------------------------------------------------------------------------------------------------------------|--------------------------------------|
| **Write Amplification** (Lower is better)   | Low (Write amplification factor is always 1)                                                                                   | High (Write amplification factor = 2 + number of merges) |
| **Space Amplification** (Lower is better)  | Low (Merge & release on write)                                                                                               | High (Merge on read and release on compact) |
| **Query Results** | When querying an OBJECT column by default, returns metadata like: `(Object) XX.XX KB`.  Actual OBJECT data storage path: `${data_dir}/object_data`. Use `READ_OBJECT` function to retrieve raw content | Directly returns raw binary content |

### 1.1 Floating-Point Precision Configuration

For **FLOAT** and **DOUBLE** series using **RLE** or **TS_2DIFF** encoding, the number of decimal places can be set via the **MAX_POINT_NUMBER** attribute during series creation.

For example:  

```SQL
CREATE TIMESERIES root.vehicle.d0.s0 WITH DATATYPE=FLOAT, ENCODING=RLE, 'MAX_POINT_NUMBER'='2';
```

If not specified, the system will use the configuration in the `iotdb-system.properties` file under the `float_precision` item (default is 2 decimal places).  

### 1.2 Data Type Compatibility

If the written data type does not match the registered data type of a series:  

- **Incompatible types** → The system will issue an error.
- **Compatible types** → The system will automatically convert the written data type to match the registered type.

The compatibility of data types is shown in the table below:  

| Registered Data Type | Compatible Write Data Types            |
|:---------------------|:---------------------------------------|
| BOOLEAN              | BOOLEAN                                |
| INT32                | INT32                                  |
| INT64                | INT32, INT64, TIMESTAMP                |
| FLOAT                | INT32, FLOAT                           |
| DOUBLE               | INT32, INT64, FLOAT, DOUBLE, TIMESTAMP |
| TEXT                 | TEXT, STRING                           |
| STRING               | TEXT, STRING                           |
| BLOB                 | TEXT, STRING, BLOB                     |
| OBJECT               | OBJECT                                 |
| TIMESTAMP            | INT32, INT64, TIMESTAMP                |
| DATE                 | DATE                                   |

## 2. Timestamp Types

A timestamp represents the moment when data is recorded. IoTDB supports two types:

- **Absolute timestamps**: Directly specify a point in time.
- **Relative timestamps**: Define time offsets from a reference point (e.g., `now()`).

### 2.1 Absolute Timestamp

IoTDB supports timestamps in two formats:

1. **LONG**: Milliseconds since the Unix epoch (1970-01-01 00:00:00 UTC).
2. **DATETIME**: Human-readable date-time strings. (including **DATETIME-INPUT** and **DATETIME-DISPLAY** subcategories).  

When entering a timestamp, users can use either a LONG value or a DATETIME string. Supported input formats include:

<div style="text-align: center;">

**DATETIME-INPUT Type Supports Format**


| format                       |
| :--------------------------- |
| yyyy-MM-dd HH:mm:ss          |
| yyyy/MM/dd HH:mm:ss          |
| yyyy.MM.dd HH:mm:ss          |
| yyyy-MM-dd HH:mm:ssZZ        |
| yyyy/MM/dd HH:mm:ssZZ        |
| yyyy.MM.dd HH:mm:ssZZ        |
| yyyy/MM/dd HH:mm:ss.SSS      |
| yyyy-MM-dd HH:mm:ss.SSS      |
| yyyy.MM.dd HH:mm:ss.SSS      |
| yyyy-MM-dd HH:mm:ss.SSSZZ    |
| yyyy/MM/dd HH:mm:ss.SSSZZ    |
| yyyy.MM.dd HH:mm:ss.SSSZZ    |
| ISO8601 standard time format |


</div>

> **Note:** `ZZ` represents a time zone offset (e.g., `+0800` for Beijing Time, `-0500` for Eastern Standard Time).

IoTDB supports timestamp display in **LONG** format or **DATETIME-DISPLAY** format, allowing users to customize time output. 

<div style="text-align: center;">

**Syntax for Custom Time Formats in DATETIME-DISPLAY**


| Symbol |           Meaning           | Presentation |              Examples              |
| :----: | :-------------------------: | :----------: | :--------------------------------: |
|   G    |             era             |     era      |                era                 |
|   C    |    century of era (>=0)     |    number    |                 20                 |
|   Y    |      year of era (>=0)      |     year     |                1996                |
|        |                             |              |                                    |
|   x    |          weekyear           |     year     |                1996                |
|   w    |      week of weekyear       |    number    |                 27                 |
|   e    |         day of week         |    number    |                 2                  |
|   E    |         day of week         |     text     |            Tuesday; Tue            |
|        |                             |              |                                    |
|   y    |            year             |     year     |                1996                |
|   D    |         day of year         |    number    |                189                 |
|   M    |        month of year        |    month     |           July; Jul; 07            |
|   d    |        day of month         |    number    |                 10                 |
|        |                             |              |                                    |
|   a    |       halfday of day        |     text     |                 PM                 |
|   K    |   hour of halfday (0~11)    |    number    |                 0                  |
|   h    | clockhour of halfday (1~12) |    number    |                 12                 |
|        |                             |              |                                    |
|   H    |     hour of day (0~23)      |    number    |                 0                  |
|   k    |   clockhour of day (1~24)   |    number    |                 24                 |
|   m    |       minute of hour        |    number    |                 30                 |
|   s    |      second of minute       |    number    |                 55                 |
|   S    |     fraction of second      |    millis    |                978                 |
|        |                             |              |                                    |
|   z    |          time zone          |     text     |     Pacific Standard Time; PST     |
|   Z    |     time zone offset/id     |     zone     | -0800; -08:00; America/Los_Angeles |
|        |                             |              |                                    |
|   '    |       escape for text       |  delimiter   |                                    |
|   ''   |        single quote         |   literal    |                 '                  |

</div>

### 2.2 Relative Timestamp

Relative timestamps allow specifying time offsets from **now()** or a **DATETIME** reference.

The formal definition is:  

```Plain
Duration = (Digit+ ('Y'|'MO'|'W'|'D'|'H'|'M'|'S'|'MS'|'US'|'NS'))+  
RelativeTime = (now() | DATETIME) ((+|-) Duration)+  
```

  <div style="text-align: center;">

  **The syntax of the duration unit**


  | Symbol |   Meaning   |       Presentation       | Examples |
  | :----: | :---------: | :----------------------: | :------: |
  |   y    |    year     |       1y=365 days        |    1y    |
  |   mo   |    month    |       1mo=30 days        |   1mo    |
  |   w    |    week     |        1w=7 days         |    1w    |
  |   d    |     day     |         1d=1 day         |    1d    |
  |        |             |                          |          |
  |   h    |    hour     |     1h=3600 seconds      |    1h    |
  |   m    |   minute    |      1m=60 seconds       |    1m    |
  |   s    |   second    |       1s=1 second        |    1s    |
  |        |             |                          |          |
  |   ms   | millisecond | 1ms=1000_000 nanoseconds |   1ms    |
  |   us   | microsecond |   1us=1000 nanoseconds   |   1us    |
  |   ns   | nanosecond  |     1ns=1 nanosecond     |   1ns    |

  </div>

**Examples:**  

```Plain
now() - 1d2h // A time 1 day and 2 hours earlier than the server time  
now() - 1w   // A time 1 week earlier than the server time  
```

> **Note:** There must be spaces on both sides of `+` and `-` operators.  