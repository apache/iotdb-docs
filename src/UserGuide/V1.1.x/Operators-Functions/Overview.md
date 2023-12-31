<!--

​    Licensed to the Apache Software Foundation (ASF) under one
​    or more contributor license agreements.  See the NOTICE file
​    distributed with this work for additional information
​    regarding copyright ownership.  The ASF licenses this file
​    to you under the Apache License, Version 2.0 (the
​    "License"); you may not use this file except in compliance
​    with the License.  You may obtain a copy of the License at
​    
​        http://www.apache.org/licenses/LICENSE-2.0
​    
​    Unless required by applicable law or agreed to in writing,
​    software distributed under the License is distributed on an
​    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
​    KIND, either express or implied.  See the License for the
​    specific language governing permissions and limitations
​    under the License.

-->

# Quick Start

## Priority of Operators

|priority|operator  |meaning            |
|:---:|:------------|:------------------|
|1    |`-`          |Unary operator negative  |
|1    |`+`          |Unary operator positive  |
|1    |`!`          |Unary operator negation  |
|2    |`*`          |Binary operator multiply |
|2    |`/`          |Binary operator division |
|2    |`%`          |Binary operator remainder|
|3    |`+`          |Binary operator add      |
|3    |`-`          |Binary operator minus    |
|4    |`>`          |Binary compare operator greater than|
|4    |`>=`         |Binary compare operator greater or equal to|
|4    |`<`          |Binary compare operator less than|
|4    |`<=`         |Binary compare operator less or equal to|
|4    |`==`         |Binary compare operator equal to|
|4    |`!=`/`<>`    |Binary compare operator non-equal to|
|5      |`REGEXP`   |`REGEXP` operator|
|5      |`LIKE`    |`LIKE` operator|
|6      |`IN`    |`IN` operator|
|7    |`and`/`&`/`&&`               |Binary logic operator and|
|8    |`or`/ &#124; / &#124;&#124;  |Binary logic operator or|

## About
For applications based on time series data, data quality is vital.
**UDF Library** is IoTDB User Defined Functions (UDF) about data quality, including data profiling, data quality evalution and data repairing.
It effectively meets the demand for data quality in the industrial field.

## Quick Start

1. Download the JAR with all dependencies and the script of registering UDF.
2. Copy the JAR package to `ext\udf` under the directory of IoTDB system (Please put JAR to this directory of all DataNodes if you use Cluster).
3. Run `sbin\start-server.bat` (for Windows) or `sbin\start-server.sh` (for Linux or MacOS) to start IoTDB server.
4. Copy the script to the directory of IoTDB system (under the root directory, at the same level as `sbin`), modify the parameters in the script if needed and run it to register UDF.


## Download

Since our codes are still under review, there are no codes in Apache repository. Before finishing the review, the above files can be downloaded in our [old website](https://thulab.github.io/iotdb-quality/en/Download.html). 


