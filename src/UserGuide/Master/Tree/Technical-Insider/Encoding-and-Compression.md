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

# Compression & Encoding


## 1. Encoding Methods

To improve the efficiency of data storage, it is necessary to encode data during data writing, thereby reducing the amount of disk space used. In the process of writing and reading data, the amount of data involved in the I/O operations can be reduced to improve performance. IoTDB supports the following encoding methods for different data types:

1. PLAIN

    PLAIN encoding, the default encoding mode, i.e, no encoding, supports multiple data types. It has high compression and decompression efficiency while suffering from low space storage efficiency.

2. TS_2DIFF

    Second-order differential encoding is more suitable for encoding monotonically increasing or decreasing sequence data, and is not recommended for sequence data with large fluctuations.

3. RLE

    Run-length encoding is suitable for storing sequence with continuous values, and is not recommended for sequence data with most of the time different values.

    Run-length encoding can also be used to encode floating-point numbers, while it is necessary to specify reserved decimal digits (MAX\_POINT\_NUMBER) when creating time series. It is more suitable to store sequence data where floating-point values appear continuously, monotonously increasing or decreasing, and it is not suitable for storing sequence data with high precision requirements after the decimal point or with large fluctuations.

    > TS_2DIFF and RLE have precision limit for data type of float and double. By default, two decimal places are reserved. GORILLA is recommended. 

4. GORILLA

    GORILLA encoding is lossless. It is more suitable for numerical sequence with similar values and is not recommended for sequence data with large fluctuations.

    Currently, there are two versions of GORILLA encoding implementation, it is recommended to use `GORILLA` instead of `GORILLA_V1` (deprecated).

    Usage restrictions: When using GORILLA to encode INT32 data, you need to ensure that there is no data point with the value `Integer.MIN_VALUE` in the sequence. When using GORILLA to encode INT64 data, you need to ensure that there is no data point with the value `Long.MIN_VALUE` in the sequence.

5. DICTIONARY

    DICTIONARY encoding is lossless. It is suitable for TEXT data with low cardinality (i.e. low number of distinct values). It is not recommended to use it for high-cardinality data. 

6. ZIGZAG 

    ZIGZAG encoding maps signed integers to unsigned integers so that numbers with a small absolute value (for instance, -1) have a small variant encoded value too. It does this in a way that "zig-zags" back and forth through the positive and negative integers.

7. CHIMP

    CHIMP encoding is lossless. It is the state-of-the-art compression algorithm for streaming floating point data, providing impressive savings compared to earlier approaches. It is suitable for any numerical sequence with similar values and works best for sequence data without large fluctuations and/or random noise.

    Usage restrictions: When using CHIMP to encode INT32 data, you need to ensure that there is no data point with the value `Integer.MIN_VALUE` in the sequence. When using CHIMP to encode INT64 data, you need to ensure that there is no data point with the value `Long.MIN_VALUE` in the sequence.

8. SPRINTZ

    SPRINTZ coding is a type of lossless data compression technique that involves predicting the original time series data, applying Zigzag encoding, bit-packing encoding, and run-length encoding. SPRINTZ encoding is effective for time series data with small absolute differences between values. However, it may not be as effective for time series data with large differences between values, indicating large fluctuation.
9. RLBE

    RLBE is a lossless encoding that combines the ideas of differential encoding, bit-packing encoding, run-length encoding, Fibonacci encoding and concatenation. RLBE encoding is suitable for time series data with increasing and small increment value, and is not suitable for time series data with large fluctuation.


### 1.1 Correspondence between data type and encoding

The five encodings described in the previous sections are applicable to different data types. If the correspondence is wrong, the time series cannot be created correctly. 

The correspondence between the data type and its supported encodings is summarized in the Table below.

| **Data Type** | **Recommended Encoding (default)** | **Supported Encoding**                                      |
| ------------- | --------------------------- | ----------------------------------------------------------- |
| BOOLEAN       | RLE                         | PLAIN, RLE                                                  |
| INT32         | TS_2DIFF                    | PLAIN, RLE, TS_2DIFF, GORILLA, ZIGZAG, CHIMP, SPRINTZ, RLBE |
| DATE          | TS_2DIFF                    | PLAIN, RLE, TS_2DIFF, GORILLA, ZIGZAG, CHIMP, SPRINTZ, RLBE |
| INT64         | TS_2DIFF                    | PLAIN, RLE, TS_2DIFF, GORILLA, ZIGZAG, CHIMP, SPRINTZ, RLBE |
| TIMESTAMP     | TS_2DIFF                    | PLAIN, RLE, TS_2DIFF, GORILLA, ZIGZAG, CHIMP, SPRINTZ, RLBE |
| FLOAT         | GORILLA                     | PLAIN, RLE, TS_2DIFF, GORILLA, CHIMP, SPRINTZ, RLBE         |
| DOUBLE        | GORILLA                     | PLAIN, RLE, TS_2DIFF, GORILLA, CHIMP, SPRINTZ, RLBE         |
| TEXT          | PLAIN                       | PLAIN, DICTIONARY                                           |
| STRING        | PLAIN                       | PLAIN, DICTIONARY                                           |
| BLOB          | PLAIN                       | PLAIN                                                       |

When the data type specified by the user does not correspond to the encoding method, the system will prompt an error. 

As shown below, the second-order difference encoding does not support the Boolean type:

```
IoTDB> create timeseries root.ln.wf02.wt02.status WITH DATATYPE=BOOLEAN, ENCODING=TS_2DIFF
Msg: 507: encoding TS_2DIFF does not support BOOLEAN
```
## 2. Compression

When the time series is written and encoded as binary data according to the specified type, IoTDB compresses the data using compression technology to further improve space storage efficiency. Although both encoding and compression are designed to improve storage efficiency, encoding techniques are usually available only for specific data types (e.g., second-order differential encoding is only suitable for INT32 or INT64 data type, and storing floating-point numbers requires multiplying them by 10m to convert to integers), after which the data is converted to a binary stream. The compression method (SNAPPY) compresses the binary stream, so the use of the compression method is no longer limited by the data type.

### 2.1 Basic Compression Methods

IoTDB allows you to specify the compression method of the column when creating a time series, and supports the following compression methods:

* UNCOMPRESSED

* SNAPPY

* LZ4 (Recommended compression method)

* GZIP

* ZSTD

* LZMA2

The specified syntax for compression is detailed in [Create Timeseries Statement](../SQL-Manual/SQL-Manual_timecho).

### 2.2 Compression Ratio Statistics

Compression ratio statistics file: data/datanode/system/compression_ratio

* ratio_sum: sum of memtable compression ratios
* memtable_flush_time: memtable flush times

The average compression ratio can be calculated by `ratio_sum / memtable_flush_time`