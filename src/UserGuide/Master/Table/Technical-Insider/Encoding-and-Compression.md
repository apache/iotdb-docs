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

IoTDB employs various encoding and compression techniques to enhance storage efficiency and reduce I/O operations during data writing and reading. Below is a detailed explanation of the supported encoding and compression methods.

## **Encoding Methods**

IoTDB supports multiple encoding methods tailored for different data types to optimize storage and performance.

1. PLAIN

The default encoding method, meaning no encoding is applied. It supports multiple data types and offers high time efficiency for compression and decompression, but has relatively slow storage efficiency.

1. TS_2DIFF

Second-order differential encoding (TS_2DIFF) is suitable for encoding monotonically increasing or decreasing sequences. It is not ideal for encoding data with significant fluctuations.

1. RLE

Run-Length Encoding (RLE) is ideal for sequences where certain values appear consecutively. It is not effective for sequences where most consecutive values differ.

RLE can also be used to encode floating-point numbers, while it is necessary to specify decimal precision when creating time series. It is suitable to store sequence data where floating-point values appear continuously, but is not recommended for sequences requiring high decimal precision or those with large fluctuations.

> Both RLE and TS_2DIFF encoding for `float` and `double` have precision limitations, with a default of two decimal places. GORILLA encoding is recommended instead.

1. GORILLA

A lossless encoding method suitable for sequences where consecutive values are close to each other. It is not effective for data with large fluctuations.

Currently, there are two versions of GORILLA encoding implementation, it is recommended to use `GORILLA` instead of `GORILLA_V1` (which is deprecated).

Usage restrictions:

- When using GORILLA encoding for `INT32` data, ensure that the sequence does not contain values equal to `Integer.MIN_VALUE`.
- When using GORILLA encoding for `INT64` data, ensure that the sequence does not contain values equal to `Long.MIN_VALUE`.

1. DICTIONARY

A lossless encoding method suitable for data with low cardinality (i.e., a limited number of unique values). It is not recommended for high-cardinality data.

1. ZIGZAG

Maps signed integers to unsigned integers, making it suitable for small integer values.

1. CHIMP

A lossless encoding method designed for streaming floating-point data compression. It is efficient for sequences with small variations and low random noise.

Usage restrictions:

- When using CHIMP encoding for `INT32` data, ensure that the sequence does not contain values equal to `Integer.MIN_VALUE`.
- When using CHIMP encoding for `INT64` data, ensure that the sequence does not contain values equal to `Long.MIN_VALUE`.

1. SPRINTZ

A lossless encoding method combining prediction, ZigZag encoding, bit packing, and run-length encoding. It is best suited for time-series data with small absolute differences (i.e., low fluctuation) and is not effective for data with large variations.

1. RLBE

A lossless encoding method combining differential encoding, bit packing, run-length encoding, Fibonacci encoding, and concatenation. It is suitable for time-series data with a small and steadily increasing trend but is not effective for highly fluctuating data.

### **Data Types and Supported Encoding Methods**

The following table summarizes the recommended and supported encoding methods for each data type:

| **Data Type** | **Recommended Encoding** | **Supported Encoding Methods**                              |
| :------------ | :----------------------- | :---------------------------------------------------------- |
| BOOLEAN       | RLE                      | PLAIN, RLE                                                  |
| INT32         | TS_2DIFF                 | PLAIN, RLE, TS_2DIFF, GORILLA, ZIGZAG, CHIMP, SPRINTZ, RLBE |
| DATE          | TS_2DIFF                 | PLAIN, RLE, TS_2DIFF, GORILLA, ZIGZAG, CHIMP, SPRINTZ, RLBE |
| INT64         | TS_2DIFF                 | PLAIN, RLE, TS_2DIFF, GORILLA, ZIGZAG, CHIMP, SPRINTZ, RLBE |
| TIMESTAMP     | TS_2DIFF                 | PLAIN, RLE, TS_2DIFF, GORILLA, ZIGZAG, CHIMP, SPRINTZ, RLBE |
| FLOAT         | GORILLA                  | PLAIN, RLE, TS_2DIFF, GORILLA, CHIMP, SPRINTZ, RLBE         |
| DOUBLE        | GORILLA                  | PLAIN, RLE, TS_2DIFF, GORILLA, CHIMP, SPRINTZ, RLBE         |
| TEXT          | PLAIN                    | PLAIN, DICTIONARY                                           |
| STRING        | PLAIN                    | PLAIN, DICTIONARY                                           |
| BLOB          | PLAIN                    | PLAIN                                                       |

**Error Handling**: If the data type entered by the user does not match the specified encoding method, the system will display an error message. For example:

```Plain
IoTDB> create timeseries root.ln.wf02.wt02.status WITH DATATYPE=BOOLEAN, ENCODING=TS_2DIFF
Msg: 507: encoding TS_2DIFF does not support BOOLEAN
```

## **Compression Methods**

When the time series is written and encoded as binary data according to the specified type, IoTDB applies compression techniques to further enhance storage efficiency. While both encoding and compression aim to optimize storage, encoding techniques are typically designed for specific data types (e.g., second-order differential encoding is only suitable for INT32 or INT64, and storing floating-point numbers requires multiplying them by 10ⁿ to convert them into integers) before converting the data into a binary stream. Compression methods like SNAPPY operate on the binary stream, making them independent of the data type.

### **Supported Compression Methods**

IoTDB allows specifying the compression method of a column when creating a time series. Currently, IoTDB supports the following compression methods:

- UNCOMPRESSED
- SNAPPY
- LZ4 (Recommended)
- GZIP
- ZSTD
- LZMA2

### **Compression Ratio Statistics**

IoTDB provides compression ratio statistics to monitor the effectiveness of compression. The statistics are stored in：`data/datanode/system/compression_ratio`

- ratio_sum: The total sum of memtable compression ratios.
- memtable_flush_time: The total number of memtable flushes.

The average compression ratio can be calculated as:`Average Compression Ratio = ratio_sum / memtable_flush_time`