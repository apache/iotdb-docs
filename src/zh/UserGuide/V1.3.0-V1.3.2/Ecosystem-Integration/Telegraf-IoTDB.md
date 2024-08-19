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

# Telegraf 介绍
Telegraf 是一个开源代理工具，用于收集、处理和传输度量数据,由 InfluxData 开发。
Telegraf 有以下这些特点:
* 插件体系结构: Telegraf 的强大之处在于其广泛的插件生态系统。它支持多种输入、输出和处理器插件，可以与各种数据源和目标无缝集成。
* 数据收集: Telegraf 擅长从不同来源收集度量数据，例如系统指标、日志、数据库等。其多功能性使其适用于监视应用程序、基础架构和物联网设备。
* 输出目标: 一旦收集到数据，可以将其发送到各种输出目标，包括流行的数据库如 InfluxDB。这种灵活性使 Telegraf 适应不同的监视和分析设置。
* 配置简易: Telegraf 的配置使用 TOML 文件进行。这种简单性使用户能够轻松定义输入、输出和处理器，使定制变得简单明了。
* 社区与支持: 作为开源项目，Telegraf 受益于活跃的社区。用户可以通过论坛和文档贡献插件、报告问题并寻求帮助。

# Telegraf IoTDB 输出插件
这个输出插件保存 Telegraf 中的监控信息到 Apache IoTDB 的后端，支持 session 连接和数据写入。

## 注意事项
1. 在使用这个插件前，需要配置 IP 地址，端口号，用户名，密码以及其他数据库服务器的信息，另外还有数据转换，时间单位和其他配置。
2. 输出到 IoTDB 的路径需要满足章节 ‘语法约定’ 中的要求
3. 查看 https://github.com/influxdata/telegraf/tree/master/plugins/outputs/iotdb 了解如何配置 Telegraf IoTDB Output 插件.

## 示例
以下是一个使用 Telegraf 收集 CPU 数据输出到 IoTDB 的示例。
1. 使用 telegraf 命令生成配置文件
```
telegraf --sample-config --input-filter cpu --output-filter iotdb > cpu_iotdb.conf
```
2. 修改 input cpu 插件的配置
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
3. 修改 output iotdb 插件的配置
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
4. 使用这个配置文件运行 Telegraf，一段时间后，可以在 IoTDB 中查询到收集的这些数据

