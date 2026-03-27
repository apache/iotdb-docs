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

# Benchmark Tool

## 1. **Basic Overview**

IoT-benchmark is a time-series database benchmarking tool developed in Java for big data environments. It was developed and open-sourced by the School of Software, Tsinghua University. The tool is user-friendly, supports various write and query methods, allows storing test information and results for further queries or analysis, and integrates with Tableau for visualizing test results.

Figure 1-1 illustrates the test benchmark process and its extended functionalities, all of which can be streamlined by IoT-benchmark. It supports a variety of workloads, including write-only, read-only, and mixed write-and-read operations. Additionally, it offers software and hardware system monitoring, performance metric measurement, automated database initialization, test data analysis, and system parameter optimization.

![](/img/benchmark-English1.png)

Figure 1-1 *IoT-benchmark Test Benchmark Process*

IoT-benchmark adopts the modular design concept of the YCSB test tool, which separates workload generation, performance measurement, and database interface components. Its modular structure is illustrated in Figure 1-2. Unlike YCSB-based testing tools, IoT-benchmark introduces a system monitoring module that supports the persistence of both test data and system metrics. It also includes load-testing functionalities specifically designed for time-series data scenarios, such as batch writes and multiple out-of-order data insertion modes for IoT environments.

![](/img/benchmark-%20English2.png)

Figure 1-2 *IoT-benchmark Modular Design*

**Supported Databases**

Currently, IoT-benchmark supports the following time series databases, versions and connection methods:

| Database        | Version    | Connection mmethod                                       |
| :-------------- |:-----------| :------------------------------------------------------- |
| IoTDB           | v1.x  v2.x | JDBC, SessionByTablet, SessionByRecord, SessionByRecords |
| InfluxDB        | v1.x  v2.x | SDK                                                      |
| TimescaleDB     | --         | JDBC                                                     |
| OpenTSDB        | --         | HTTP Request                                             |
| QuestDB         | v6.0.7     | JDBC                                                     |
| TDengine        | v2.2.0.2   | JDBC                                                     |
| VictoriaMetrics | v1.64.0    | HTTP Request                                             |
| KairosDB        | --         | HTTP Request                                             |


## 2. **Installation and Operation**

### 2.1 **Prerequisites**

1. Java 8
2. Maven 3.6+
3. The corresponding appropriate version of the database, such as Apache IoTDB 2.0

### 2.2 **How to Obtain**

- **B****inary package****:** Visit https://github.com/thulab/iot-benchmark/releases to download the installation package. Extract the compressed file into a desired folder for use.

- **Source Code** **Compilation (for** **Apache** **IoTDB 2.0 testing):**

  - **Compile the latest IoTDB Session package:** Download the IoTDB source code from https://github.com/apache/iotdb/tree/rc/2.0.5 and run the following command in the root directory to compile the latest IoTDB Session package:

    ```Bash
     mvn clean package install -pl session -am -DskipTests
     ```

  - **Compile the IoT-benchmark test package:** Download the source code from https://github.com/thulab/iot-benchmark and run the following command in the root directory to compile the Apache IoTDB 2.0 test package:.

    ```Bash
     mvn clean package install -pl iotdb-2.0 -am -DskipTests
     ```

  -  The compiled test package will be located at:

  ```Bash
  ./iotdb-2.0/target/iotdb-2.0-0.0.1/iotdb-2.0-0.0.1
  ```

### 2.3 **Test Package Structure**

The directory structure of the test package is shown below. The test configuration file is `conf/config.properties`, and the test startup scripts are `benchmark.sh` (Linux & MacOS) and `benchmark.bat` (Windows). The detailed usage of the files is shown in the table below.

```Shell
-rw-r--r--. 1 root root  2881 Jan  10 01:36 benchmark.bat
-rwxr-xr-x. 1 root root   314 Jan  10 01:36 benchmark.sh
drwxr-xr-x. 2 root root    24 Jan  10 01:36 bin
-rwxr-xr-x. 1 root root  1140 Jan  10 01:36 cli-benchmark.sh
drwxr-xr-x. 2 root root   107 Jan  10 01:36 conf
drwxr-xr-x. 2 root root  4096 Jan  10 01:38 lib
-rw-r--r--. 1 root root 11357 Jan  10 01:36 LICENSE
-rwxr-xr-x. 1 root root   939 Jan  10 01:36 rep-benchmark.sh
-rw-r--r--. 1 root root    14 Jan  10 01:36 routine
```

| Name             | File              | Usage                                               |
| :--------------- | :---------------- | :-------------------------------------------------- |
| benchmark.bat    | -                 | Startup script on Windows                           |
| benchmark.sh     | -                 | Startup script on Linux/Mac                         |
| bin              | startup.sh        | Initialization script folder                        |
| conf             | config.properties | Test scenario configuration file                    |
| lib              | -                 | Dependency library                                  |
| LICENSE          | -                 | License file                                        |
| cli-benchmark.sh | -                 | One-click startup script                            |
| routine          | -                 | Automatic execution of multiple test configurations |
| rep-benchmark.sh | -                 | Automatic execution of multiple test scripts        |



### 2.4 **Execution** **of** **Tests**

1. Modify the configuration file (conf/config.properties) according to test requirements. For example, to test Apache IoTDB 2.0, set the following parameter:

   ```Bash
      DB_SWITCH=IoTDB-200-SESSION_BY_TABLET
      ```

2. Ensure the target time-series database is running.

3. Start IoT-benchmark to execute the test. Monitor the status of both the target database and IoT-benchmark during execution.

4. Upon completion, review the results and analyze the test process.

### 2.5 **Results Interpretation**

All test log files are stored in the `logs` folder, while test results are saved in the `data/csvOutput` folder. For example, the following result matrix illustrates the test outcome:

![](/img/bm4.png)

- **Result Matrix:**
  - OkOperation: Number of successful operations.
  - OkPoint: Number of successfully written points (for write operations) or successfully queried points (for query operations).
  - FailOperation: Number of failed operations.
  - FailPoint: Number of failed write points.
- **Latency (ms) Matrix:**
  - AVG: Average operation latency.
  - MIN: Minimum operation latency.
  - Pn: Quantile values of the overall operation distribution (e.g., P25 represents the 25th percentile, or lower quartile).

## 3. **Main** **Parameters**

### 3.1 IoTDB Service Model

The `IoTDB_DIALECT_MODE` parameter supports two modes: `tree` and `table`. The default value is `tree`.

- **For IoTDB 2.0 and later versions**, the `IoTDB_DIALECT_MODE` parameter must be specified, and only one mode can be set for each IoTDB instance.
- **IoTDB_DIALECT_MODE = tree:**
  - The number of devices must be greater than or equal to the number of databases.

### 3.2 **Working** **Mode**

The `BENCHMARK_WORK_MODE` parameter supports four operational modes:

1. **General Test Mode (****`testWithDefaultPath`****):** Configured via the `OPERATION_PROPORTION` parameter to support write-only, read-only, and mixed read-write operations.
2. **Data Generation Mode (****`generateDataMode`****):** Generates a reusable dataset, which is saved to `FILE_PATH` for subsequent use in the correctness write and correctness query modes.
3. **Single Database Correctness Write Mode (****`verificationWriteMode`****):** Verifies the correctness of dataset writing by writing the dataset generated in data generation mode. This mode supports only IoTDB v1.0+ and InfluxDB v1.x.
4. **Single Database Correctness Query Mode (****`verificationQueryMode`****):** Verifies the correctness of dataset queries after using the correctness write mode. This mode supports only IoTDB v1.0+ and InfluxDB v1.x.

Mode configurations are shown in the following below:

| **Mode name**                          | **BENCHMARK_WORK_MODE** | Description                                             | Required Configuration     |
| :------------------------------------- | :---------------------- | :------------------------------------------------------ | :------------------------- |
| General test mode                      | testWithDefaultPath     | Supports multiple read and write mixed load operations. | `OPERATION_PROPORTION`     |
| Generate data mode                     | generateDataMode        | Generates datasets recognizable by IoT-benchmark.       | `FILE_PATH` and `DATA_SET` |
| Single database correctness write mode | verificationWriteMode   | Writes datasets for correctness verification.           | `FILE_PATH` and `DATA_SET` |
| Single database correctness query mode | verificationQueryMode   | Queries datasets to verify correctness.                 | `FILE_PATH` and `DATA_SET` |

### 3.3 **Server** **Connection** **Information**

Once the working mode is specified, the following parameters must be configured to inform IoT-benchmark of the target time-series database:

| **Parameter** | **Type** | **Example**                   | D**escription**                                        |
| :------------ | :------- | :---------------------------- | :----------------------------------------------------- |
| DB_SWITCH     | String   | `IoTDB-200-SESSION_BY_TABLET` | Specifies the type of time-series database under test. |
| HOST          | String   | `127.0.0.1`                   | Network address of the target time-series database.    |
| PORT          | Integer  | `6667`                        | Network port of the target time-series database.       |
| USERNAME      | String   | `root`                        | Login username for the time-series database.           |
| PASSWORD      | String   | `root`                        | Password for the database login user.                  |
| DB_NAME       | String   | `test`                        | Name of the target time-series database.               |
| TOKEN         | String   | -                             | Authentication token (used for InfluxDB 2.0).          |

### 3.4 **Write Scenario Parameters**

| **Parameter**              | **Type**              | **Example**                 | D**escription**                                                                                                                                                                                                                                                                                      |
| :------------------------- | :-------------------- | :-------------------------- |:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| CLIENT_NUMBER              | Integer               | `100`                       | Total number of clients used for writing.                                                                                                                                                                                                                                                            |
| GROUP_NUMBER               | Integer               | `20`                        | Number of databases (only applicable for IoTDB).                                                                                                                                                                                                                                                     |
| DEVICE_NUMBER              | Integer               | `100`                       | Total number of devices.                                                                                                                                                                                                                                                                             |
| SENSOR_NUMBER              | Integer               | `300`                       | Total number of sensors per device. (Control the number of attribute columns if you use the IoTDB table mode)                                                                                                                                                                                        |
| INSERT_DATATYPE_PROPORTION | String                | `1:1:1:1:1:1:0:0:0:0`       | Ratio of data types: `BOOLEAN:INT32:INT64:FLOAT:DOUBLE:TEXT:STRING:BLOB:TIMESTAMP:DATE`.                                                                                                                                                                                                             |
| POINT_STEP                 | Integer               | `1000`                      | Time interval (in ms) between generated data points.                                                                                                                                                                                                                                                 |
| OP_MIN_INTERVAL            | Integer               | `0`                         | Minimum execution interval for operations (ms): if the operation takes more than the value, the next one will be executed immediately, otherwise wait (OP_MIN_INTERVAL - actual execution time) ms; if it is 0, the parameter is not effective; if it is -1, its value is consistent with POINT_STEP |
| IS_OUT_OF_ORDER            | Boolean               | `false`                     | Specifies whether to write data out of order.                                                                                                                                                                                                                                                        |
| OUT_OF_ORDER_RATIO         | Floating point number | `0.3`                       | Proportion of out-of-order data.                                                                                                                                                                                                                                                                     |
| BATCH_SIZE_PER_WRITE       | Integer               | `1`                         | Number of data rows written per batch.                                                                                                                                                                                                                                                               |
| START_TIME                 | Time                  | `2022-10-30T00:00:00+08:00` | Start timestamp for data generation.                                                                                                                                                                                                                                                                 |
| LOOP                       | Integer               | `86400`                     | Total number of write operations: Each type of operation will be divided according to the proportion defined by `OPERATION_PROPORTION`                                                                                                                                                               |
| OPERATION_PROPORTION       | Character             | `1:0:0:0:0:0:0:0:0:0:0`     | Ratio of operation types (write:Q1:Q2:...:Q10).                                                                                                                                                                                                                                                      |

### 3.5 **Query Scenario Parameters**

| Parameter            | Type      | Example                 | Description                                                  |
| :------------------- | :-------- | :---------------------- | :----------------------------------------------------------- |
| QUERY_DEVICE_NUM     | Integer   | `2`                     | Number of devices involved in each query statement.          |
| QUERY_SENSOR_NUM     | Integer   | `2`                     | Number of sensors involved in each query statement.          |
| QUERY_AGGREGATE_FUN  | Character | `count`                 | Aggregate functions used in queries (`COUNT`, `AVG`, `SUM`, etc.). |
| STEP_SIZE            | Integer   | `1`                     | Time interval step for time filter conditions.               |
| QUERY_INTERVAL       | Integer   | `250000`                | Time interval between query start and end times.             |
| QUERY_LOWER_VALUE    | Integer   | `-5`                    | Threshold for conditional queries (`WHERE value > QUERY_LOWER_VALUE`). |
| GROUP_BY_TIME_UNIT   | Integer   | `20000`                 | The size of the group in the `GROUP BY` statement            |
| LOOP                 | Integer   | `10`                    | Total number of query operations: Each type of operation will be divided according to the proportion defined by `OPERATION_PROPORTION` |
| OPERATION_PROPORTION | Character | `0:0:0:0:0:0:0:0:0:0:1` | Ratio of operation types (`write:Q1:Q2:...:Q10`).            |

### 3.6 **Query Types and Example SQL**

| Number | Query Type                     | IoTDB Sample SQL                                             |
| :----- | :----------------------------- | :----------------------------------------------------------- |
| Q1     | Precise Point Query            | `select v1 from root.db.d1 where time = ?`                   |
| Q2     | Time Range Query               | `select v1 from root.db.d1 where time > ? and time < ?`      |
| Q3     | Time Range with Value Filter   | `select v1 from root.db.d1 where time > ? and time < ? and v1 > ?` |
| Q4     | Time Range Aggregation Query   | `select count(v1) from root.db.d1 where and time > ? and time < ?` |
| Q5     | Full-Time Range with Filtering | `select count(v1) from root.db.d1 where v1 > ?`              |
| Q6     | Range Aggregation with Filter  | `select count(v1) from root.db.d1 where v1 > ? and time > ? and time < ?` |
| Q7     | Time Grouping Aggregation      | `select count(v1) from root.db.d1 group by ([?, ?), ?, ?)`   |
| Q8     | Latest Point Query             | `select last v1 from root.db.d1`                             |
| Q9     | Descending Range Query         | `select v1 from root.sg.d1 where time > ? and time < ? order by time desc` |
| Q10    | Descending Range with Filter   | `select v1 from root.sg.d1 where time > ? and time < ? and v1 > ? order by time desc` |

### 3.7 **Test process and test result persistence**

IoT-benchmark currently supports persisting the test process and test results through configuration parameters.

| **Parameter**         | **Type** | **Example** | D**escription**                                              |
| :-------------------- | :------- | :---------- | :----------------------------------------------------------- |
| TEST_DATA_PERSISTENCE | String   | `None`      | Specifies the result persistence method. Options: `None`, `IoTDB`, `MySQL`, `CSV`. |
| RECORD_SPLIT          | Boolean  | `true`      | Whether to split results into multiple records. (Not supported by IoTDB currently.) |
| RECORD_SPLIT_MAX_LINE | Integer  | `10000000`  | Maximum number of rows per record (10 million rows per database table or CSV file). |
| TEST_DATA_STORE_IP    | String   | `127.0.0.1` | IP address of the database for result storage.               |
| TEST_DATA_STORE_PORT  | Integer  | `6667`      | Port number of the output database.                          |
| TEST_DATA_STORE_DB    | String   | `result`    | Name of the output database.                                 |
| TEST_DATA_STORE_USER  | String   | `root`      | Username for accessing the output database.                  |
| TEST_DATA_STORE_PW    | String   | `root`      | Password for accessing the output database.                  |

**Result Persistence Details**

- **CSV Mode:** If `TEST_DATA_PERSISTENCE` is set to `CSV`, a `data` folder is generated in the IoT-benchmark root directory during and after test execution. This folder contains:
  - `csv` folder: Records the test process.
  - `csvOutput` folder: Stores the test results.
- **MySQL Mode:** If `TEST_DATA_PERSISTENCE` is set to `MySQL`, IoT-benchmark creates the following tables in the specified MySQL database:
  - **Test Process Table:**
    1. Created before the test starts.
    2. Named as: `testWithDefaultPath_<database_name>_<remarks>_<test_start_time>`.
  - **Configuration Table:**
    1. Named `CONFIG`.
    2. Stores the test configuration.
    3. Created if it does not exist.
  - **Final Result Table:**
    1. Named `FINAL_RESULT`.
    2. Stores the test results after test completion.
    3. Created if it does not exist.

### 3.8  Automation Script

#### One-Click Script Startup

The `cli-benchmark.sh` script allows one-click startup of IoTDB, IoTDB Benchmark monitoring, and IoTDB Benchmark testing. However, please note that this script will clear all existing data in IoTDB during startup, so use it with caution.

**Steps to Run:**

1. Edit the `IOTDB_HOME` parameter in `cli-benchmark.sh` to the local IoTDB directory.
2. Start the test by running the following command:

```Bash
> ./cli-benchmark.sh
```

1. After the test completes:
  1. Check test-related logs in the `logs` folder.
  2. Check monitoring-related logs in the `server-logs` folder.

#### Automatic Execution of Multiple Tests

Single tests are often insufficient without comparative results. Therefore, IoT-benchmark provides an interface for executing multiple tests in sequence.

1. **Routine Configuration:** Each line in the `routine` file specifies the parameters that change for each test. For example:

   ```Plain
      LOOP=10 DEVICE_NUMBER=100 TEST
      LOOP=20 DEVICE_NUMBER=50 TEST
      LOOP=50 DEVICE_NUMBER=20 TEST
      ```

In this example, three tests will run sequentially with `LOOP` values of 10, 20, and 50.

Then the test process with 3 LOOP parameters of 10, 20, and 50 is executed in sequence.

**Important Notes:**

- Multiple parameters can be changed in each test using the format:

  ```Bash
    LOOP=20 DEVICE_NUMBER=10 TEST
    ```

- Avoid unnecessary spaces.

- The `TEST` keyword marks the start of a new test.

- Changed parameters persist across subsequent tests unless explicitly reset.

2. **Start the Test:** After configuring the `routine` file, start multi-test execution using the following command

   ```Bash
      > ./rep-benchmark.sh
      ```

Test results will be displayed in the terminal.

**Important Notes:**

- Closing the terminal or losing the client connection will terminate the test process.

- To run the test as a background daemon, execute:

  ```Bash
    > ./rep-benchmark.sh > /dev/null 2>&1 &
    ```

- To monitor progress, check the logs:

  ```Bash
    > cd ./logs
    > tail -f log_info.log
    ```

## 4. Use Case

We take the application of CRRC Qingdao Sifang Vehicle Research Institute Co., Ltd. as an example, and refer to the scene described in "Apache IoTDB in Intelligent Operation and Maintenance Platform Storage" for practical operation instructions.

Test objective: Simulate the actual needs of switching time series databases in the scene of CRRC Qingdao Sifang Institute, and compare the performance of the expected IoTDB and KairosDB used by the original system.

Test environment: In order to ensure that the impact of other irrelevant services and processes on database performance and the mutual influence between different databases are eliminated during the experiment, the local databases in this experiment are deployed and run on multiple independent virtual servers with the same resource configuration. Therefore, this experiment set up 4 Linux (CentOS7 /x86) virtual machines, and deployed IoT-benchmark, IoTDB database, KairosDB database, and MySQL database on them respectively. The specific resource configuration of each virtual machine is shown in Table 4-1. The specific usage of each virtual machine is shown in Table 4-2.

Table 4-1 Virtual machine configuration information

| Hardware Configuration Information | Value   |
| ---------------------------------- | ------- |
| OS system                          | CentOS7 |
| number of CPU cores                | 16      |
| memory                             | 32G     |
| hard disk                          | 200G    |
| network                            | Gigabit    |

Table 4-2 Virtual machine usage

| IP         | Usage         |
| ---------- | ------------- |
| 172.21.4.2 | IoT-benchmark |
| 172.21.4.3 | Apache-iotdb  |
| 172.21.4.4 | KaiosDB       |
| 172.21.4.5 | MySQL         |

### 4.1 Write Test

Scenario description: Create 100 clients to simulate 100 trains, each train has 3000 sensors, the data type is DOUBLE, the data time interval is 500ms (2Hz), and they are sent sequentially. Referring to the above requirements, we need to modify the IoT-benchmark configuration parameters as listed in Table 4-3.

Table 4-3 Configuration parameter information

| Parameter Name             | IoTDB Value                 | KairosDB Value |
| -------------------------- | --------------------------- | -------------- |
| DB_SWITCH                  | IoTDB-013-SESSION_BY_TABLET | KairosDB       |
| HOST                       | 172.21.4.3                  | 172.21.4.4     |
| PORT                       | 6667                        | 8080           |
| BENCHMARK_WORK_MODE        | testWithDefaultPath         |                |
| OPERATION_PROPORTION       | 1:0:0:0:0:0:0:0:0:0:0       |                |
| CLIENT_NUMBER              | 100                         |                |
| GROUP_NUMBER               | 10                          |                |
| DEVICE_NUMBER              | 100                         |                |
| SENSOR_NUMBER              | 3000                        |                |
| INSERT_DATATYPE_PROPORTION | 0:0:0:0:1:0                 |                |
| POINT_STEP                 | 500                         |                |
| OP_MIN_INTERVAL            | 0                           |                |
| IS_OUT_OF_ORDER            | false                       |                |
| BATCH_SIZE_PER_WRITE       | 1                           |                |
| LOOP                       | 10000                       |                |
| TEST_DATA_PERSISTENCE      | MySQL                       |                |
| TEST_DATA_STORE_IP         | 172.21.4.5                  |                |
| TEST_DATA_STORE_PORT       | 3306                        |                |
| TEST_DATA_STORE_DB         | demo                        |                |
| TEST_DATA_STORE_USER       | root                        |                |
| TEST_DATA_STORE_PW         | admin                       |                |
| REMARK                     | demo                        |                |

First, start the tested time series databases Apache-IoTDB and KairosDB on 172.21.4.3 and 172.21.4.4 respectively, and then start server resource monitoring through the ser-benchamrk\.sh script on 172.21.4.2, 172.21.4.3 and 172.21.4.4 (Figure 4-1). Then modify the conf/config.properties files in the iotdb-0.13-0.0.1 and kairosdb-0.0.1 folders in 172.21.4.2 according to Table 4-3 to meet the test requirements. Use benchmark\.sh to start the writing test of Apache-IoTDB and KairosDB successively.


![img](/img/bm5.png)

Figure 4-1 Server monitoring tasks

For example, if we first start the test on KairosDB, IoT-benchmark will create a CONFIG data table in the MySQL database to store the configuration information of this test (Figure 4-2), and there will be a log output of the current test progress during the test execution (Figure 4-3) . When the test is completed, the test result will be output (Figure 4-3), and the result will be written into the FINAL_RESULT data table (Figure 4-4).

![img](/img/bm6.png)

Figure 4-2 Test configuration information table

![img](/img/bm7.png)
![img](/img/bm8.png)
![img](/img/bm9.png)
![img](/img/bm10.png)

Figure 4-3 Test progress and results

![img](/img/bm11.png)



Figure 4-4 Test result table

Afterwards, we will start the test on Apache-IoTDB. The same IoT-benchmark will write the test configuration information in the MySQL database CONFIG data table. During the test execution, there will be a log to output the current test progress. When the test is completed, the test result will be output, and the result will be written into the FINAL_RESULT data table.

According to the test result information, we know that under the same configuration the write delay times of Apache-IoTDB and KairosDB are 55.98ms and 1324.45ms respectively; the write throughputs are 5,125,600.86 points/second and 224,819.01 points/second respectively; the tests were executed respectively 585.30 seconds and 11777.99 seconds. And KairosDB has a write failure. After investigation, it is found that the data disk usage has reached 100%, and there is no disk space to continue receiving data. However, Apache-IoTDB has no write failure, and the disk space occupied after all data is written is only 4.7G (as shown in Figure 4-5); Apache-IoTDB is better than KairosDB in terms of write throughput and disk occupation. Of course, there will be other tests in the follow-up to observe and compare from various aspects, such as query performance, file compression ratio, data security, etc.

![img](/img/bm12.png)


Figure 4-5 Disk usage

So what is the resource usage of each server during the test? What is the specific performance of each write operation? At this time, we can visualize the data in the server monitoring table and test process recording table by installing and using Tableau. The use of Tableau will not be introduced in this article. After connecting to the data table for test data persistence, the specific results are as follows (taking Apache-IoTDB as an example):


![img](/img/bm13.png)
![img](/img/bm14.png)


Figure 4-6 Visualization of testing process in Tableau

### 4.2 Query Test

Scenario description: In the writing test scenario, 10 clients are simulated to perform all types of query tasks on the data stored in the time series database Apache-IoTDB. The configuration is as follows.

Table 4-4 Configuration parameter information

| Parameter Name       | Example               |
| -------------------- | --------------------- |
| CLIENT_NUMBER        | 10                    |
| QUERY_DEVICE_NUM     | 2                     |
| QUERY_SENSOR_NUM     | 2                     |
| QUERY_AGGREGATE_FUN  | count                 |
| STEP_SIZE            | 1                     |
| QUERY_INTERVAL       | 250000                |
| QUERY_LOWER_VALUE    | -5                    |
| GROUP_BY_TIME_UNIT   | 20000                 |
| LOOP                 | 30                    |
| OPERATION_PROPORTION | 0:1:1:1:1:1:1:1:1:1:1 |

Results:

![img](/img/bm15.png)

Figure 4-7 Query test results

### 4.3 Description of Other Parameters

In the previous chapters, the write performance comparison between Apache-IoTDB and KairosDB was performed, but if the user wants to perform a simulated real write rate test, how to configure it? How to control if the test time is too long? Are there any regularities in the generated simulated data? If the IoT-Benchmark server configuration is low, can multiple machines be used to simulate pressure output?

Table 4-5 Configuration parameter information

| Scenario                                                     | Parameter                  | Value                                                        | Notes                                                        |
| ------------------------------------------------------------ | -------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Simulate real write rate                                     | OP_INTERVAL                | -1                                                           | You can also enter an integer to control the operation interval. |
| Specify test duration (1 hour)                               | TEST_MAX_TIME              | 3600000                                                      | The unit is ms; the LOOP execution time needs to be greater than this value. |
| Define the law of simulated data: support all data types, and the number is evenly classified; support five data distributions, and the number is evenly distributed; the length of the string is 10; the number of decimal places is 2. | INSERT_DATATYPE_PROPORTION | 1:1:1:1:1:1                                                  | Data type distribution proportion                            |
| LINE_RATIO                                                   | 1                          | linear                                                       |                                                              |
| SIN_RATIO                                                    | 1                          | Fourier function                                             |                                                              |
| SQUARE_RATIO                                                 | 1                          | Square wave                                                  |                                                              |
| RANDOM_RATIO                                                 | 1                          | Random number                                                |                                                              |
| CONSTANT_RATIO                                               | 1                          | Constant                                                     |                                                              |
| STRING_LENGTH                                                | 10                         | String length                                                |                                                              |
| DOUBLE_LENGTH                                                | 2                          | Decimal places                                               |                                                              |
| Three machines simulate data writing of 300 devices          | BENCHMARK_CLUSTER          | true                                                         | Enable multi-benchmark mode                                  |
| BENCHMARK_INDEX                                              | 0, 1, 3                    | Take the writing parameters in the [write test](./Benchmark.md#_4-1-write-test) as an example: No. 0 is responsible for writing data of device numbers 0-99; No. 1 is responsible for writing data of device numbers 100-199; No. 2 is responsible for writing data of device numbers 200-299. |                                                              |