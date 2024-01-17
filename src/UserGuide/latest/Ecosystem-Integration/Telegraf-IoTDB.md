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

# Telegraf Introduction
Telegraf is an open-source agent that facilitates the collection, processing, and transmission of metric data. Developed by InfluxData.
Telegraf includes the following features:
* Plugin Architecture: Telegraf's strength lies in its extensive plugin ecosystem. It supports a wide range of input, output, and processor plugins, allowing seamless integration with various data sources and destinations.
* Data Collection: Telegraf excels in collecting metrics from diverse sources, such as system metrics, logs, databases, and more. Its versatility makes it suitable for monitoring applications, infrastructure, and IoT devices.
* Output Destinations: Once collected, data can be sent to various output destinations, including popular databases like InfluxDB. This flexibility makes Telegraf adaptable to different monitoring and analytics setups.
* Ease of Configuration: Telegraf's configuration is done using TOML files. This simplicity allows users to define inputs, outputs, and processors with ease, making customization straightforward.
* Community and Support: Being open-source, Telegraf benefits from an active community. Users can contribute plugins, report issues, and seek assistance through forums and documentation.

# Telegraf IoTDB Output Plugin
This output plugin saves Telegraf metrics to an Apache IoTDB backend, supporting session connection and data insertion.

## Precautions
1. Before using this plugin, please configure the IP address, port number, username, password and other information of the database server, as well as some data type conversion, time unit and other configurations.
2. The path should follow the rule in Chapter 'Syntax Rule'
3. See https://github.com/influxdata/telegraf/tree/master/plugins/outputs/iotdb for how to configure this plugin.

## Example
Here is an example that demonstrates how to collect cpu data from Telegraf into IoTDB.
1. generate the configuration file by telegraf
```
telegraf --sample-config --input-filter cpu --output-filter iotdb > cpu_iotdb.conf
```
2. modify the default cpu inputs plugin configuration
```
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
3. modify the IoTDB outputs plugin configuration
```
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
  convert_tags_to = "fields"
```
4. run telegraf with this configuration file, after some time, the data can be found in IoTDB

