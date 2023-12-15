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

# Performance

This chapter introduces the performance characteristics of IoTDB from the perspectives of database connection, database read and write performance, and storage performance.
The test tool uses IoTDBBenchmark, an open source time series database benchmark tool.

## Database connection

- Support high concurrent connections, a single server can support tens of thousands of concurrent connections per second.


## Read and write performance

- It has the characteristics of high write throughput, a single core can handle more than tens of thousands of write requests per second, and the write performance of a single server can reach tens of millions of points per second; the cluster can be linearly scaled, and the write performance of the cluster can reach hundreds of millions points/second.
- It has the characteristics of high query throughput and low query latency, a single server supports tens of millions of points/second query throughput, and can aggregate tens of billions of data points in milliseconds.
-
## Storage performance

- Supports the storage of massive data, with the storage and processing capabilities of PB-level data.
- Support high compression ratio, lossless compression can reach 20 times compression ratio, lossy compression can reach 100 times compression ratio.