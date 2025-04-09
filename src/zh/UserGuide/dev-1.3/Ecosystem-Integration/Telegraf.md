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

## 1、产品概述

### 1.1 Telegraf

[Telegraf](https://www.influxdata.com/time-series-platform/telegraf/) 是一个开源代理工具，用于收集、处理和传输度量数据，由 InfluxData 开发。

Telegraf 有以下这些特点：

- 插件体系结构：Telegraf 的强大之处在于其广泛的插件生态系统。它支持多种输入、输出和处理器插件，可以与各种数据源和目标无缝集成。
  - 数据收集：Telegraf 擅长从不同来源收集度量数据，例如系统指标、日志、数据库等。其多功能性使其适用于监视应用程序、基础架构和物联网设备。
  - 输出目标：一旦收集到数据，可以将其发送到各种输出目标，包括流行的数据库如 InfluxDB。这种灵活性使 Telegraf 适应不同的监视和分析设置。
- 配置简易：Telegraf 的配置使用 TOML 文件进行。这种简单性使用户能够轻松定义输入、输出和处理器，使定制变得简单明了。
- 社区与支持：作为开源项目，Telegraf 受益于活跃的社区。用户可以通过论坛和文档贡献插件、报告问题并寻求帮助。

### 1.2 Telegraf-IoTDB 插件

Telegraf-IoTDB 插件可以将保存在 Telegraf 中的监控信息输出存储到 IoTDB，输出插件使用了 IoTDB session 进行连接和数据写入。

![](/img/Telegraf.png)

## 2、安装要求

Telegraf支持多种操作系统，包括Linux、Windows、macOS，Telegraf 的安装推荐使用`root`管理员权限才能成功完成，具体安装要求请查看 [安装要求](https://docs.influxdata.com/telegraf/v1/install/)

## 3、安装步骤

具体安装步骤请查看 [安装步骤](https://docs.influxdata.com/telegraf/v1/install/)

- 注：此插件为Telegraf内置插件，无需进行二次安装

## 4、使用说明

### 4.1 设置输入源

在“telegraf.conf”配置文件中找到“INPUT PLUGINS”来配置输入源，具体配置内容如下表所示

| 配置项            | 说明                                                         | 备注                                                         |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| alias             | 命名插件的实例                                               |                                                              |
| interval          | 收集此指标的频率。普通插件使用单个全局间隔，但如果某个特定输入的运行频率应更低或更高，您可以在此处进行配置。`interval`可以增加间隔以减少数据输入速率限制。 |                                                              |
| precision         | 覆盖`precision`代理的设置。收集的指标四舍五入到指定的精度`interval`。当在服务输入上设置此值（例如`statsd`：）时，输出数据库可能会合并在同一时间戳发生的多个事件。 |                                                              |
| collection_jitter | 覆盖`collection_jitter`代理的设置。Collection jitter 用于通过随机的`interval` |                                                              |
| name_override     | 输出到 IoTDB 时使用的自定义时间序列路径名                    | 输出的路径名称需满足“[语法要求](../Reference/Syntax-Rule.md)”要求 |
| name_prefix       | 指定附加到测量名称的前缀                                     |                                                              |
| name_suffix       | 指定附加到测量名称的后缀                                     |                                                              |

![](/img/Telegraf_1.png)

### 4.2 设置输出源

在“telegraf.conf”配置文件中找到“outputs.iotdb”来配置输出源，具体配置内容如下表所示，具体输入源示例可查看 [输出源示例](https://docs.influxdata.com/telegraf/v1/configuration/#output-configuration-examples)

| 配置项              | 说明           | 修改前                              | 修改后                                            | 备注                                                         |
| ------------------- | -------------- | ----------------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| host                | IoTDB 的 host  | # host = "127.0.0.1"                | host = "部署 IoTDB 的 host"                       | 默认为 127.0.0.1                                             |
| port                | IoTDB 的端口号 | # port = "6667"                     | port = "部署 IoTDB 的端口号"                      | 默认为 6667                                                  |
| user                | IoTDB 的用户名 | # user = "root"                     | user = "IoTDB 的用户名"                           | 默认为 root                                                  |
| password            | IoTDB 的密码 | # password = "root"                 | password= "IoTDB 的密码"                        | 默认为 root                                                  |
| timestamp_precision | 时间戳精度     | timestamp_precision = "millisecond" | timestamp_precision = "与 IoTDB 相同的时间戳精度" | 您可以通过查看"iotdb-system.properties"中"timestamp_precision"字段即可 |
| sanitize_tag        | 数据库版本     | 无                                  | sanitize_tag = "0.13/1.0/1.1/1.2/1.3"             |                                                              |

![](/img/Telegraf_2.png)

### 4.3 启动Telegraf服务

```Bash
telegraf -config /path/to/telegraf.conf
```

## 5、使用示例

以下是一个使用 Telegraf 收集 CPU 数据并使用 Telegraf-IoTDB 输出到 IoTDB 的示例。使用 telegraf 命令生成配置文件

```Bash
telegraf --sample-config --input-filter cpu --output-filter iotdb > cpu_iotdb.conf
```

1. 在 cpu_iotdb.conf 中修改 input cpu 插件的配置。其中，“name_override” 字段为输出到 IoTDB 时使用的自定义时间序列路径名

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

2. 在 cpu_iotdb.conf 中修改 output iotdb 插件的配置

| 配置项              | 说明           | 修改前                              | 修改后                                            | 备注                                                         |
| ------------------- | -------------- | ----------------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| host                | IoTDB 的 host  | # host = "127.0.0.1"                | host = "部署 IoTDB 的 host"                       | 默认为 127.0.0.1                                             |
| port                | IoTDB 的端口号 | # port = "6667"                     | port = "部署 IoTDB 的端口号"                      | 默认为 6667                                                  |
| user                | IoTDB 的用户名 | # user = "root"                     | user = "IoTDB 的用户名"                           | 默认为 root                                                  |
| password            | IoTDB 的密码 | # password = "root"                 | password= "IoTDB 的密码"                        | 默认为 root                                                  |
| timestamp_precision | 时间戳精度     | timestamp_precision = "millisecond" | timestamp_precision = "与 IoTDB 相同的时间戳精度" | 您可以通过查看"iotdb-system.properties"中"timestamp_precision"字段即可 |
| sanitize_tag        | 数据库版本     | 无                                  | sanitize_tag = "0.13/1.0/1.1/1.2/1.3"             |                                                              |

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

3. 使用 cpu_iotdb.conf 配置文件运行 Telegraf：运行一段时间后，可以在 IoTDB 中查询到 Telegraf 收集上报的数据