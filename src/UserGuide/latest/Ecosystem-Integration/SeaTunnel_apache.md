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


# Apache SeaTunnel

## 1. Overview

SeaTunnel is a distributed integration platform designed for massive data. Leveraging its high performance and elastic scaling capabilities, it connects multi-source heterogeneous data links through standardized Connectors (composed of Source and Sink). The platform uniformly abstracts various data sources into the SeaTunnelRow format via Source. After dynamic resource scheduling and batch processing optimization, it efficiently writes data to different storage systems through Sink. Through the deep integration of the IoTDB Connector with SeaTunnel, it not only addresses core challenges in time-series data scenarios such as **high-throughput writing, multi-source governance, and complex analysis**, but also helps enterprises quickly build **low-cost, highly reliable, and easily scalable** data infrastructure in fields like the Internet of Things and industrial internet, leveraging the out-of-the-box connector ecosystem and automated operation and maintenance capabilities.

## 2. Usage Steps

### 2.1 Environment Preparation

#### 2.1.1 Software Requirements

| Software      | Version       | Installation Reference                                |
| ------------- | ------------- | ----------------------------------------------------- |
| IoTDB         | >= 2.0.5      | [Quick Start](../QuickStart/QuickStart_apache.md)    |
| SeaTunnel     | 2.3.12        | [Official Website](https://seatunnel.apache.org/download) |

* Thrift Version Conflict Resolution (Only required for Spark engine):

```Bash
# Remove older Thrift from Spark
rm -f $SPARK_HOME/jars/libthrift*
# Copy IoTDB's Thrift library to Spark classpath
cp $IOTDB_HOME/lib/libthrift* $SPARK_HOME/jars/
```

#### 2.1.2 Dependency Configuration

1. JDBC

* Spark/Flink Engine: Place the [JDBC driver JAR](https://mvnrepository.com/artifact/org.apache.iotdb/iotdb-jdbc) into the `${SEATUNNEL_HOME}/plugins/` directory.
* SeaTunnel Zeta Engine: Place the [JDBC driver JAR](https://mvnrepository.com/artifact/org.apache.iotdb/iotdb-jdbc) into the `${SEATUNNEL_HOME}/lib/` directory.

2. Connector

Place the corresponding version of the [SeaTunnel Connector](https://mvnrepository.com/artifact/org.apache.seatunnel/connector-iotdb) into the `${SEATUNNEL_HOME}/plugins/` directory.

### 2.2 Reading Data (IoTDB Source Connector)

#### 2.2.1 Configuration Parameters

| **Parameter**              | **Type** | **Required** | **Default** | **Description**                                                                                                                         |
| -------------------------- | -------- | ------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `node_urls`                | string   | yes          | -           | IoTDB cluster address, format: `"host1:port"` or `"host1:port,host2:port"`                                                              |
| `username`                 | string   | yes          | -           | IoTDB username                                                                                                                          |
| `password`                 | string   | yes          | -           | IoTDB password                                                                                                                          |
| `sql_dialect`              | string   | no           | tree        | IoTDB model: `tree` for tree model; `table` for table model                                                                             |
| `sql`                      | string   | yes          | -           | SQL query statement to execute                                                                                                          |
| `database`                 | string   | no           | -           | Database name, only effective in table model                                                                                            |
| `schema`                   | config   | yes          | -           | Data schema definition                                                                                                                   |
| `fetch_size`               | int      | no           | -           | Number of data rows fetched per request from IoTDB during query execution                                                               |
| `lower_bound`              | long     | no           | -           | Lower bound of time range (used for data partitioning by time column)                                                                   |
| `upper_bound`              | long     | no           | -           | Upper bound of time range (used for data partitioning by time column)                                                                   |
| `num_partitions`           | int      | no           | -           | Number of partitions (used when partitioning by time column): <br> 1 partition: uses the full time range <br>  If partitions < (upper_bound - lower_bound), the difference is used as actual partitions |
| `thrift_default_buffer_size`| int     | no           | -           | Thrift protocol buffer size                                                                                                             |
| `thrift_max_frame_size`    | int      | no           | -           | Thrift maximum frame size                                                                                                               |
| `enable_cache_leader`      | boolean  | no           | -           | Whether to enable leader node caching                                                                                                   |
| `version`                  | string   | no           | -           | Client SQL semantic version (`V_0_12` / `V_0_13`)                                                                                       |

#### 2.2.2 Configuration Example

1. Create a new file `iotdb_source_example.conf` in the `${SEATUNNEL_HOME}/config/` directory:

```bash
env {
    parallelism = 2       # Parallelism set to 2
    job.mode = "BATCH"    # Batch mode
}

source {
    IoTDB {
        node_urls = "localhost:6667"
        username = "root"
        password = "root"
        sql = "SELECT temperature, humidity, status FROM root.testdb.seatunnel.source.device align by device"
        schema {
            fields {
                ts = timestamp
                device_name = string
                temperature = double
                humidity = double
                status = boolean
            }
        }
    }
}

sink {
    Console {
    }  # Output to console
}
```

2. Run SeaTunnel with the following command:

```Bash
./bin/seatunnel.sh --config config/iotdb_source_example.conf -e local
```

3. For more details, please refer to the official Apache SeaTunnel documentation on [IoTDB Source Connector](https://seatunnel.apache.org/docs/2.3.12/connector-v2/source/IoTDB).

### 2.3 Writing Data (IoTDB Sink Connector)

#### 2.3.1 Configuration Parameters

| **Parameter**                 | **Type**  | **Required** | **Default**         | **Description**                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------- | --------- | ------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node_urls`                   | Array     | yes          | -                   | IoTDB cluster address, format: `["host1:port"]` or `["host1:port","host2:port"]`                                                                                                                                                                                                                                                                                  |
| `username`                    | String    | yes          | -                   | IoTDB username                                                                                                                                                                                                                                                                                                                                                     |
| `password`                    | String    | yes          | -                   | IoTDB password                                                                                                                                                                                                                                                                                                                                                     |
| `sql_dialect`                 | String    | no           | tree                | IoTDB model: `tree` for tree model; `table` for table model                                                                                                                                                                                                                                                                                                        |
| `storage_group`               | String    | yes          | -                   | IoTDB tree model: specifies the storage group for devices (path prefix) e.g., deviceId = \${storage_group} + "." + \${key_device};  IoTDB table model: specifies the database                                                                                                                                                                                |
| `key_device`                  | String    | yes          | -                   | IoTDB tree model: field name in SeaTunnelRow that specifies the IoTDB device ID;  IoTDB table model: field name in SeaTunnelRow that specifies the IoTDB table name                                                                                                                                                                                          |
| `key_timestamp`               | String    | no           | processing time     | IoTDB tree model: field name in SeaTunnelRow that specifies the IoTDB timestamp (if not specified, processing time is used as timestamp);  IoTDB table model: field name in SeaTunnelRow that specifies the IoTDB time column (if not specified, processing time is used as timestamp)                                                                       |
| `key_measurement_fields`      | Array     | no           | See description     | IoTDB tree model: field names in SeaTunnelRow that specify the list of IoTDB measurements (if not specified, includes all fields except `key_device` and `key_timestamp`);  IoTDB table model: field names in SeaTunnelRow that specify the IoTDB field columns (if not specified, includes all fields except `key_device`, `key_timestamp`, `key_tag_fields`, `key_attribute_fields`) |
| `key_tag_fields`              | Array     | no           | -                   | IoTDB tree model: not applicable;  IoTDB table model: field names in SeaTunnelRow that specify the IoTDB tag columns                                                                                                                                                                                                                                         |
| `key_attribute_fields`        | Array     | no           | -                   | IoTDB tree model: not applicable;  IoTDB table model: field names in SeaTunnelRow that specify the IoTDB attribute columns                                                                                                                                                                                                                                   |
| `batch_size`                  | Integer   | no           | 1024                | For batch writing, data is flushed to IoTDB when the buffer reaches `batch_size` or when the time reaches `batch_interval_ms`                                                                                                                                                                                                                                     |
| `max_retries`                 | Integer   | no           | -                   | Number of retries on failed flush                                                                                                                                                                                                                                                                                                                                  |
| `retry_backoff_multiplier_ms` | Integer   | no           | -                   | Multiplier used to generate the next backoff delay                                                                                                                                                                                                                                                                                                                |
| `max_retry_backoff_ms`        | Integer   | no           | -                   | Maximum wait time before retrying a request to IoTDB                                                                                                                                                                                                                                                                                                              |
| `default_thrift_buffer_size`  | Integer   | no           | -                   | Initial buffer size for Thrift client in IoTDB                                                                                                                                                                                                                                                                                                                    |
| `max_thrift_frame_size`       | Integer   | no           | -                   | Maximum frame size for Thrift client in IoTDB                                                                                                                                                                                                                                                                                                                     |
| `zone_id`                     | string    | no           | -                   | IoTDB client `java.time.ZoneId`                                                                                                                                                                                                                                                                                                                                   |
| `enable_rpc_compression`      | Boolean   | no           | -                   | Enable RPC compression in IoTDB client                                                                                                                                                                                                                                                                                                                            |
| `connection_timeout_in_ms`    | Integer   | no           | -                   | Maximum time (in milliseconds) to wait when connecting to IoTDB                                                                                                                                                                                                                                                                                                   |

#### 2.3.2 Configuration Example

1. Create a new file `iotdb_sink_example.conf` in the `${SEATUNNEL_HOME}/config/` directory:

```bash
# Define runtime environment
env {
  parallelism = 4
  job.mode = "BATCH"
}

source {
    Jdbc {
        url = "jdbc:mysql://localhost:3306/demo_db?useUnicode=true&characterEncoding=UTF-8&rewriteBatchedStatements=true"
        driver = "com.mysql.cj.jdbc.Driver"
        connection_check_timeout_sec = 100
        user = "root"
        password = "IoTDB@2024"
        query = "select * from device"
    }
}

sink {
    IoTDB {
        node_urls = ["localhost:6667"]
        username = "root"
        password = "root"
        key_device = "id"           # Specify the `deviceId` using the device_name field
        key_timestamp = "intime"
        storage_group = "root.mysql"
    }
}
```

2. Run SeaTunnel with the following command:

```Bash
./bin/seatunnel.sh --config config/iotdb_sink_example.conf -e local
```

3. For more configuration parameters and examples, please refer to the official Apache SeaTunnel documentation on [IoTDB Sink Connector](https://seatunnel.apache.org/docs/2.3.12/connector-v2/sink/IoTDB).
