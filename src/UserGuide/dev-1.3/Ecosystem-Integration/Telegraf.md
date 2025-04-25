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
# Telegraf(IoTDB)

## 1、Product Overview

### 1.1 Telegraf

[Telegraf](https://www.influxdata.com/time-series-platform/telegraf/) is an open-source proxy tool developed by InfluxData for collecting, processing, and transmitting metric data.

Telegraf has the following characteristics:

- Plugin architecture: The strength of Telegraf lies in its extensive plugin ecosystem. It supports multiple input, output, and processor plugins, and can seamlessly integrate with various data sources and targets.
  - Data collection: Telegraf excels at collecting metric data from various sources, such as system metrics, logs, databases, etc. Its versatility makes it suitable for monitoring applications, infrastructure, and IoT devices.
  - Output target: Once data is collected, it can be sent to various output targets, including popular databases such as InfluxDB. This flexibility allows Telegraf to adapt to different monitoring and analysis settings.
- Easy configuration: Telegraf is configured using TOML files. This simplicity enables users to easily define inputs, outputs, and processors, making customization simple and clear.
- Community and Support: As an open-source project, Telegraf benefits from an active community. Users can contribute plugins, report issues, and seek help through forums and documents.

### 1.2 Telegraf-IoTDB Plugin

The Telegraf IoTDB plugin can output and store monitoring information saved in Telegraf to IoTDB. The output plugin uses IoTDB sessions for connection and data writing.

![](/img/telegraf-en.png)

## 2、Installation Requirements

Telegraf supports multiple operating systems, including Linux, Windows, and macOS. It is recommended to use 'root' administrator privileges to successfully install Telegraf. Please refer to the installation requirements for specific [Installation Requirements](https://docs.influxdata.com/telegraf/v1/install/)

## 3、Installation Steps

Please refer to [Installation Steps](https://docs.influxdata.com/telegraf/v1/install/) for specific installation steps

- Note: This plugin is a built-in plugin for Telegraf and does not require secondary installation

## 4、Instructions

### 4.1 Set Input Source

Find 'INPUT PLUGINS' in the' telegraf. conf 'configuration file to configure the input source. The specific configuration content is shown in the table below

| Configuration            |     Description                                                     | Notes                                                         |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| alias             | Example of named plugin                                               |                                                              |
| interval          |Collect the frequency of this indicator. Ordinary plugins use a single global interval, but if the running frequency of a specific input should be lower or higher, you can configure it here` Interval can be increased to reduce data input rate limitations.  |                                                              |
| precision         | Overlay the settings of the 'precision' proxy. The collected indicators are rounded to the specified precision interval. When this value is set on the service input (e.g. `'statsd':`), the output database may merge multiple events that occur at the same timestamp. |                                                              |
| collection_jitter | Overlay the settings of the 'collectic_jitter' proxy. Collection jitter is used to perform random intervals` |                                                              |
| name_override     | Custom time series path name used when outputting to IoTDB                    | The output path name must meet the "[Syntax Requirement](../Reference/Syntax-Rule.md)" requirement |
| name_prefix       |  Specify the prefix attached to the measurement name                                    |                                                              |
| name_suffix       |  Specify the suffix attached to the measurement name                                    |                                                              |

![](/img/Telegraf_1.png)

### 4.2 Set Output Source

Find "outputs. iotdb" in the "telegraf. conf" configuration file to configure the output source. The specific configuration content is shown in the table below. For specific input source examples, please refer to [Output Source Example](https://docs.influxdata.com/telegraf/v1/configuration/#output-configuration-examples)

| Configuration              | Description           | Before Modification                              | After Modification                                            | Notes                                                         |
| ------------------- | -------------- | ----------------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| host                | Host of IoTDB  | # host = "127.0.0.1"                | host = "Deploy IoTDB host"                       | Default is 127.0.0.1                                             |
| port                | The port number of IoTDB | # port = "6667"                     | port = "Port number for deploying IoTDB"                      | Default is 6667                                                  |
| user                | Username for IoTDB | # user = "root"                     | user = "Username for IoTDB"                           |Default as root                                                  |
| password            | Password for IoTDB | # password = "root"                 | password= "Password for IoTDB"                        | Default as root                                                  |
| timestamp_precision | Timestamp accuracy     | timestamp_precision = "millisecond" | timestamp_precision = "Same timestamp accuracy as IoTDB" | You can check the 'timestamp-precision' field in 'iotdb system. properties' |
| sanitize_tag        | Database version     | none                                  | sanitize_tag = "0.13/1.0/1.1/1.2/1.3"             |                                                              |

![](/img/Telegraf_2.png)

### 4.3 Start Telegraf Service

```Bash
telegraf -config /path/to/telegraf.conf
```

## 5、Example Usage

The following is an example of collecting CPU data using Telegraf and outputting it to IoTDB using Telegraf IoTDB. Generate configuration files using the telegraf command

```Bash
telegraf --sample-config --input-filter cpu --output-filter iotdb > cpu_iotdb.conf
```

1. Modify the configuration of the input CPU plugin in cpu_iotdb. conf. Among them, the "name_ooverride" field is the custom time-series path name used when outputting to IoTDB

```Bash
# Read metrics about cpu usage
[[inputs.cpu]]
  ## Whether to report per-cpu stats or not
  percpu = true
  ## Whether to report total system cpu stats or not
  totalcpu = true
  ## If true, collect raw CPU time metrics
  collect_cpu_time = false
  ## If true, compute and report the sum of all non-idle CPU states
  report_active = false
  ## If true and the info is available then add core_id and physical_id tags
  core_tags = false
  name_override = "root.demo.telgraf.cpu"
```

2. Modify the configuration of the output iotdb plugin in cpu_iotdb. conf

| Configuration              | Description           | Before Modification                              | After Modification                                            | Notes                                                         |
| ------------------- | -------------- | ----------------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| host                | Host of IoTDB  | # host = "127.0.0.1"                | host = "Deploy IoTDB host"                       | Default is 127.0.0.1                                             |
| port                | The port number of IoTDB | # port = "6667"                     | port = "Port number for deploying IoTDB"                      | Default is 6667                                                  |
| user                | Username for IoTDB | # user = "root"                     | user = "Username for IoTDB"                           |Default as root                                                  |
| password            | Password for IoTDB | # password = "root"                 | password= "Password for IoTDB"                        | Default as root                                                  |
| timestamp_precision | Timestamp accuracy     | timestamp_precision = "millisecond" | timestamp_precision = "Same timestamp accuracy as IoTDB" | You can check the 'timestamp-precision' field in 'iotdb system. properties' |
| sanitize_tag        | Database version     | none                                  | sanitize_tag = "0.13/1.0/1.1/1.2/1.3"             |                                                              |

```Bash
# Save metrics to an IoTDB Database
[[outputs.iotdb]]
  ## Configuration of IoTDB server connection
  host = "127.0.0.1"
  # port = "6667"

  ## Configuration of authentication
  # user = "root"
  # password = "root"

  ## Timeout to open a new session.
  ## A value of zero means no timeout.
  # timeout = "5s"

  ## Configuration of type conversion for 64-bit unsigned int
  ## IoTDB currently DOES NOT support unsigned integers (version 13.x).
  ## 32-bit unsigned integers are safely converted into 64-bit signed integers by the plugin,
  ## however, this is not true for 64-bit values in general as overflows may occur.
  ## The following setting allows to specify the handling of 64-bit unsigned integers.
  ## Available values are:
  ##   - "int64"       --  convert to 64-bit signed integers and accept overflows
  ##   - "int64_clip"  --  convert to 64-bit signed integers and clip the values on overflow to 9,223,372,036,854,775,807
  ##   - "text"        --  convert to the string representation of the value
  # uint64_conversion = "int64_clip"

  ## Configuration of TimeStamp
  ## TimeStamp is always saved in 64bits int. timestamp_precision specifies the unit of timestamp.
  ## Available value:
  ## "second", "millisecond", "microsecond", "nanosecond"(default)
  timestamp_precision = "millisecond"

  ## Handling of tags
  ## Tags are not fully supported by IoTDB.
  ## A guide with suggestions on how to handle tags can be found here:
  ##     https://iotdb.apache.org/UserGuide/Master/API/InfluxDB-Protocol.html
  ##
  ## Available values are:
  ##   - "fields"     --  convert tags to fields in the measurement
  ##   - "device_id"  --  attach tags to the device ID
  ##
  ## For Example, a metric named "root.sg.device" with the tags `tag1: "private"`  and  `tag2: "working"` and
  ##  fields `s1: 100`  and `s2: "hello"` will result in the following representations in IoTDB
  ##   - "fields"     --  root.sg.device, s1=100, s2="hello", tag1="private", tag2="working"
  ##   - "device_id"  --  root.sg.device.private.working, s1=100, s2="hello"
  # convert_tags_to = "device_id"
   ## Handling of unsupported characters
  ## Some characters in different versions of IoTDB are not supported in path name
  ## A guide with suggetions on valid paths can be found here:
  ## for iotdb 0.13.x           -> https://iotdb.apache.org/UserGuide/V0.13.x/Reference/Syntax-Conventions.html#identifiers
  ## for iotdb 1.x.x and above  -> https://iotdb.apache.org/UserGuide/V1.3.x/User-Manual/Syntax-Rule.html#identifier
  ##
  ## Available values are:
  ##   - "1.0", "1.1", "1.2", "1.3"  -- enclose in `` the world having forbidden character
  ##                                    such as @ $ # : [ ] { } ( ) space
  ##   - "0.13"                      -- enclose in `` the world having forbidden character
  ##                                    such as space
  ##
  ## Keep this section commented if you don't want to sanitize the path
  sanitize_tag = "1.3"
```

3. Run Telegraf using the cpu_iotdb.exe configuration file: After running for a period of time, the data collected and reported by Telegraf can be queried in IoTDB