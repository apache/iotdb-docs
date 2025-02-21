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

# Cluster Management Tools

## Data Directory Overview Tool

The IoTDB data directory overview tool is designed to print out the structural overview information of the data directory. The tool is located at `tools/tsfile/print-iotdb-data-dir`.

### Usage

- **Windows:**

```bash
.\print-iotdb-data-dir.bat <IoTDB data directory path, use commas to separate multiple directories> (<output result storage path>)
```

- **Linux or MacOS:**

```shell
./print-iotdb-data-dir.sh <IoTDB data directory path, use commas to separate multiple directories> (<output result storage path>)
```

**Note:** If the output result storage path is not set, the relative path `"IoTDB_data_dir_overview.txt"` will be used as the default.

### Example

Taking Windows system as an example:

`````````````````````````bash
.\print-iotdb-data-dir.bat D:\github\master\iotdb\data\datanode\data
````````````````````````
Starting Printing the IoTDB Data Directory Overview
````````````````````````
output save path: IoTDB_data_dir_overview.txt
data dir num: 1
143  [main] WARN  o.a.i.t.c.conf.TSFileDescriptor - not found iotdb-system.properties, use the default configs.
|==============================================================
|D:\github\master\iotdb\data\datanode\data
|--sequence
|  |--root.redirect0
|  |  |--1
|  |  |  |--0
|  |--root.redirect1
|  |  |--2
|  |  |  |--0
|  |--root.redirect2
|  |  |--3
|  |  |  |--0
|  |--root.redirect3
|  |  |--4
|  |  |  |--0
|  |--root.redirect4
|  |  |--5
|  |  |  |--0
|  |--root.redirect5
|  |  |--6
|  |  |  |--0
|  |--root.sg1
|  |  |--0
|  |  |  |--0
|  |  |  |--2760
|--unsequence
|==============================================================
`````````````````````````

## TsFile Overview Tool

The TsFile overview tool is used to print the content of a TsFile in a sketch mode. The tool is located at `tools/tsfile/print-tsfile`.

### Usage

- **Windows:**

```bash
.\print-tsfile-sketch.bat <TsFile file path> (<output result storage path>)
```

- **Linux or MacOS:**

```shell
./print-tsfile-sketch.sh <TsFile file path> (<output result storage path>)
```

**Note:** If the output result storage path is not set, the relative path `"TsFile_sketch_view.txt"` will be used as the default.

### Example

Taking Windows system as an example:

`````````````````````````bash
.\print-tsfile.bat D:\github\master\1669359533965-1-0-0.tsfile D:\github\master\sketch.txt
````````````````````````
Starting Printing the TsFile Sketch
````````````````````````
TsFile path: D:\github\master\1669359533965-1-0-0.tsfile
Sketch save path: D:\github\master\sketch.txt
148  [main] WARN  o.a.i.t.c.conf.TSFileDescriptor - not found iotdb-system.properties, use the default configs.
-------------------------------- TsFile Sketch --------------------------------
file path: D:\github\master\1669359533965-1-0-0.tsfile
file length: 2974

            POSITION|   CONTENT
            --------    -------
                   0|   [magic head] TsFile
                   6|   [version number] 3
||||||||||||||||||||| [Chunk Group] of root.sg1.d1, num of Chunks:3
                   7|   [Chunk Group Header]
                    |           [marker] 0
                    |           [deviceID] root.sg1.d1
                  20|   [Chunk] of root.sg1.d1.s1, startTime: 1669359533948 endTime: 1669359534047 count: 100 [minValue:-9032452783138882770,maxValue:9117677033041335123,firstValue:7068645577795875906,lastValue:-5833792328174747265,sumValue:5.795959009889246E19]
                    |           [chunk header] marker=5, measurementID=s1, dataSize=864, dataType=INT64, compressionType=SNAPPY, encodingType=RLE
                    |           [page]  UncompressedSize:862, CompressedSize:860
                 893|   [Chunk] of root.sg1.d1.s2, startTime: 1669359533948 endTime: 1669359534047 count: 100 [minValue:-8806861312244965718,maxValue:9192550740609853234,firstValue:1150295375739457693,lastValue:-2839553973758938646,sumValue:8.2822564314572677E18]
                    |           [chunk header] marker=5, measurementID=s2, dataSize=864, dataType=INT64, compressionType=SNAPPY, encodingType=RLE
                    |           [page]  UncompressedSize:862, CompressedSize:860
                1766|   [Chunk] of root.sg1.d1.s3, startTime: 1669359533948 endTime: 1669359534047 count: 100 [minValue:-9076669333460323191,maxValue:9175278522960949594,firstValue:2537897870994797700,lastValue:7194625271253769397,sumValue:-2.126008424849926E19]
                    |           [chunk header] marker=5, measurementID=s3, dataSize=864, dataType=INT64, compressionType=SNAPPY, encodingType=RLE
                    |           [page]  UncompressedSize:862, CompressedSize:860
||||||||||||||||||||| [Chunk Group] of root.sg1.d1 ends
                2656|   [marker] 2
                2657|   [TimeseriesIndex] of root.sg1.d1.s1, tsDataType:INT64, startTime: 1669359533948 endTime: 1669359534047 count: 100 [minValue:-9032452783138882770,maxValue:9117677033041335123,firstValue:7068645577795875906,lastValue:-5833792328174747265,sumValue:5.795959009889246E19]
                    |           [ChunkIndex] offset=20
                2728|   [TimeseriesIndex] of root.sg1.d1.s2, tsDataType:INT64, startTime: 1669359533948 endTime: 1669359534047 count: 100 [minValue:-8806861312244965718,maxValue:9192550740609853234,firstValue:1150295375739457693,lastValue:-2839553973758938646,sumValue:8.2822564314572677E18]
                    |           [ChunkIndex] offset=893
                2799|   [TimeseriesIndex] of root.sg1.d1.s3, tsDataType:INT64, startTime: 1669359533948 endTime: 1669359534047 count: 100 [minValue:-9076669333460323191,maxValue:9175278522960949594,firstValue:2537897870994797700,lastValue:7194625271253769397,sumValue:-2.126008424849926E19]
                    |           [ChunkIndex] offset=1766
                2870|   [IndexOfTimerseriesIndex Node] type=LEAF_MEASUREMENT
                    |           <s1, 2657>
                    |           <endOffset, 2870>
||||||||||||||||||||| [TsFileMetadata] begins
                2891|   [IndexOfTimerseriesIndex Node] type=LEAF_DEVICE
                    |           <root.sg1.d1, 2870>
                    |           <endOffset, 2891>
                    |   [meta offset] 2656
                    |   [bloom filter] bit vector byte array length=31, filterSize=256, hashFunctionSize=5
||||||||||||||||||||| [TsFileMetadata] ends
                2964|   [TsFileMetadataSize] 73
                2968|   [magic tail] TsFile
                2974|   END of TsFile
---------------------------- IndexOfTimerseriesIndex Tree -----------------------------
        [MetadataIndex:LEAF_DEVICE]
        └──────[root.sg1.d1,2870]
                        [MetadataIndex:LEAF_MEASUREMENT]
                        └──────[s1,2657]
---------------------------------- TsFile Sketch End ----------------------------------
`````````````````````````

**Explanation:**

- The left side of the "|" separator represents the actual position in the TsFile, and the right side represents the sketch content.
- The "|||||||||||||||||||||" is added for enhanced readability and is not actual data stored in the TsFile.
- The final printed "IndexOfTimerseriesIndex Tree" is a reorganized print of the metadata index tree at the end of the TsFile for intuitive understanding and is not the actual data stored in the TsFile.

## TsFile Resource Overview Tool

The TsFile resource overview tool is used to print out the content of TsFile resource files. The tool is located at `tools/tsfile/print-tsfile-resource-files`.

### Usage

- **Windows:**

```bash
.\print-tsfile-resource-files.bat <TsFile resource file directory path, or a single TsFile resource file path>
```

- **Linux or MacOS:**

```shell
./print-tsfile-resource-files.sh <TsFile resource file directory path, or a single TsFile resource file path>
```

### Example

Taking Windows system as an example:

`````````````````````````bash
.\print-tsfile-resource-files.bat D:\github\master\iotdb\data\datanode\data\sequence\root.sg1\0\0
````````````````````````
Starting Printing the TsFileResources
````````````````````````
147  [main] WARN  o.a.i.t.c.conf.TSFileDescriptor - not found iotdb-system.properties, use the default configs.
230  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Cannot find IOTDB_HOME or IOTDB_CONF environment variable when loading config file iotdb-system.properties, use default configuration
231  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Couldn't load the configuration iotdb-system.properties from any of the known sources.
233  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Cannot find IOTDB_HOME or IOTDB_CONF environment variable when loading config file iotdb-system.properties, use default configuration
237  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Couldn't load the configuration iotdb-system.properties from any of the known sources.
Analyzing D:\github\master\iotdb\data\datanode\data\sequence\root.sg1\0\0\1669359533489-1-0-0.tsfile ...

Resource plan index range [9223372036854775807, -9223372036854775808]
device root.sg1.d1, start time 0 (1970-01-01T08:00+08:00[GMT+08:00]), end time 99 (1970-01-01T08:00:00.099+08:00[GMT+08:00])

Analyzing the resource file folder D:\github\master\iotdb\data\datanode\data\sequence\root.sg1\0\0 finished.
`````````````````````````

`````````````````````````bash
.\print-tsfile-resource-files.bat D:\github\master\iotdb\data\datanode\data\sequence\root.sg1\0\0\1669359533489-1-0-0.tsfile.resource
````````````````````````
Starting Printing the TsFileResources
````````````````````````
178  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Cannot find IOTDB_HOME or IOTDB_CONF environment variable when loading config file iotdb-system.properties, use default configuration
186  [main] WARN  o.a.i.t.c.conf.TSFileDescriptor - not found iotdb-system.properties, use the default configs.
187  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Couldn't load the configuration iotdb-system.properties from any of the known sources.
188  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Cannot find IOTDB_HOME or IOTDB_CONF environment variable when loading config file iotdb-system.properties, use default configuration
192  [main] WARN  o.a.iotdb.db.conf.IoTDBDescriptor - Couldn't load the configuration iotdb-system.properties from any of the known sources.
Analyzing D:\github\master\iotdb\data\datanode\data\sequence\root.sg1\0\0\1669359533489-1-0-0.tsfile ...

Resource plan index range [9223372036854775807, -9223372036854775808]
device root.sg1.d1, start time 0 (1970-01-01T08:00+08:00[GMT+08:00]), end time 99 (1970-01-01T08:00:00.099+08:00[GMT+08:00])

Analyzing the resource file D:\github\master\iotdb\data\datanode\data\sequence\root.sg1\0\0\1669359533489-1-0-0.tsfile.resource finished.
`````````````````````````