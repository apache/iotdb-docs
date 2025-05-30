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

# Grafana 插件(IoTDB)

Grafana 是开源的指标量监测和可视化工具，可用于展示时序数据和应用程序运行分析。

在 IoTDB 项目中，我们开发了 Grafana 插件，该插件通过调用 IoTDB REST 服务来展现 IoTDB 中时序数据 ，提供了众多时序数据的可视化方法。Grafana 插件相较于 IoTDB-Grafana-Connector 连接器执行效率更高、支持的查询种类更多。只要在您部署环境允许的情况下，*我们都推荐直接使用 Grafana 插件而不使用 IoTDB-Grafana-Connector 连接器*。

## 1. 部署 Grafana 插件

### 1.1 安装 Grafana 

* Grafana 组件下载地址：https://grafana.com/grafana/download
* 版本 >= 9.3.0

### 1.2 grafana-plugin 获取

####  Grafana官方下载 apache-iotdb-datasource

二进制文件下载地址：https://grafana.com/api/plugins/apache-iotdb-datasource/versions/1.0.0/download

### 1.3 grafana-plugin 插件安装

#### 方式一 使用 grafana-cli 工具安装(推荐)

* 使用 grafana-cli 工具从命令行安装 apache-iotdb-datasource，命令内容如下：

```shell
grafana-cli plugins install apache-iotdb-datasource
```

#### 方式二 使用Grafana 界面安装(推荐)

从本地 Grafana 点击 Configuration -> Plugins -> 搜索 IoTDB 进行插件安装

#### 方式三 手动安装grafana-plugin 插件(不推荐)

* 拷贝上述生成的前端工程目标文件夹到 Grafana 的插件目录中 `${Grafana文件目录}\data\plugins\`。如果没有此目录可以手动建或者启动grafana会自动建立，当然也可以修改plugins的位置,具体请查看下面的修改Grafana 的插件目录位置说明。

* 启动Grafana服务，如果 Grafana 服务已启动，则需要停止Grafana服务,然后再启动Grafana。

更多有关Grafana详情，请点 [这里](https://grafana.com/docs/grafana/latest/plugins/installation/)

### 1.4 启动 Grafana

进入 Grafana 的安装目录，使用以下命令启动 Grafana：
* Windows 系统：

```shell
bin\grafana-server.exe
```
* Linux 系统：

```shell
sudo service grafana-server start
```
* MacOS 系统：

```shell
brew services start grafana
```
更多详情，请点 [这里](https://grafana.com/docs/grafana/latest/installation/)


### 1.5 配置 IoTDB REST 服务

进入 `{iotdb 目录}/conf`，打开 `iotdb-system.properties` 文件，并作如下修改：

```properties
# Is the REST service enabled
enable_rest_service=true

# the binding port of the REST service
rest_service_port=18080
```

启动（重启）IoTDB 使配置生效，此时 IoTDB REST 服务处于运行状态。



## 2. 使用 Grafana 插件

### 2.1 访问 Grafana dashboard

Grafana 以网页的 dashboard 形式为您展示数据，在使用时请您打开浏览器，访问 `http://<ip>:<port>`。

注：IP 为您的 Grafana 所在的服务器 IP，Port 为 Grafana 的运行端口（默认 3000）。

在本地试用时，Grafana  dashboard 的默认地址为 `http://localhost:3000/`。

默认登录的用户名和密码都是 `admin`。



### 2.2 添加 IoTDB 数据源

点击左侧的 `设置` 图标，选择 `Data Source` 选项，然后再点击 `Add data source`。

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Ecosystem-Integration/Grafana-plugin/datasource_1.png?raw=true">

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Ecosystem-Integration/Grafana-plugin/datasource_2.png?raw=true">

选择 `Apache IoTDB` 数据源，`URL` 一栏填写  `http://<ip>:<port>`。

Ip 为您的 IoTDB 服务器所在的宿主机 IP，port 为 REST 服务的运行端口（默认 18080）。

输入 IoTDB 服务器的 username 和 password，点击 `Save & Test`，出现 `Data source is working` 则提示配置成功。

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/grafana9_datasource.png?raw=true">



### 2.3 创建一个新的 Panel

点击左侧的 `Dashboards` 图标，选择 `Manage`，如下图所示：

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Ecosystem-Integration/Grafana-plugin/manage.png?raw=true">

点击右上方的 `New Dashboard`  图标，选择 `Add an empty panel`，如下图所示：

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Ecosystem-Integration/Grafana-plugin/add-empty-panel.png?raw=true">

Grafana Plugin 支持SQL: Full Customized和SQL: Drop-down List 两种方式，默认是SQL: Full Customized方式。

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Ecosystem-Integration/Grafana-plugin/grafana_input_style.png?raw=true">

#### SQL: Full Customized 输入方式

在 SELECT 输入框、FROM 输入框、WHERE输入框、CONTROL输入框中输入内容，其中 WHERE 和 CONTROL 输入框为非必填。

如果一个查询涉及多个表达式，我们可以点击 SELECT 输入框右侧的 `+` 来添加 SELECT 子句中的表达式，也可以点击 FROM 输入框右侧的 `+` 来添加路径前缀，如下图所示：

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Ecosystem-Integration/Grafana-plugin/grafana_input.png?raw=true">

SELECT 输入框中的内容可以是时间序列的后缀，可以是函数或自定义函数，可以是算数表达式，也可以是它们的嵌套表达式。您还可以使用 as 子句来重命名需要显示的结果序列名字。

下面是 SELECT 输入框中一些合法的输入举例：

*  `s1`
*  `top_k(s1, 'k'='1') as top`
*  `sin(s1) + cos(s1 + s2)` 
*  `udf(s1) as "中文别名"`

FROM 输入框中的内容必须是时间序列的前缀路径，比如 `root.sg.d`。

WHERE 输入框为非必须填写项目，填写内容应当是查询的过滤条件，比如 `time > 0`  或者 `s1 < 1024 and s2 > 1024`。

CONTROL 输入框为非必须填写项目，填写内容应当是控制查询类型、输出格式的特殊子句。其中GROUP BY 输入框支持使用grafana的全局变量来获取当前时间区间变化`$__from`(起始时间)、`$__to`(结束时间)，下面是 CONTROL 输入框中一些合法的输入举例：

*  `GROUP BY ([$__from, $__to), 1d)`
*  `GROUP BY ([$__from, $__to),3h,1d)`
*  `GROUP BY ([2017-11-01T00:00:00, 2017-11-07T23:00:00), 1d)`
*  `GROUP BY ([2017-11-01 00:00:00, 2017-11-07 23:00:00), 3h, 1d)`
*  `GROUP BY ([$__from, $__to), 1m) FILL (PREVIOUSUNTILLAST)`
*  `GROUP BY ([2017-11-07T23:50:00, 2017-11-07T23:59:00), 1m) FILL (PREVIOUSUNTILLAST)` 
*  `GROUP BY ([2017-11-07T23:50:00, 2017-11-07T23:59:00), 1m) FILL (PREVIOUS, 1m)`
*  `GROUP BY ([2017-11-07T23:50:00, 2017-11-07T23:59:00), 1m) FILL (LINEAR, 5m, 5m)`
*  `GROUP BY ((2017-11-01T00:00:00, 2017-11-07T23:00:00], 1d), LEVEL=1`
*  `GROUP BY ([0, 20), 2ms, 3ms), LEVEL=1`

提示：为了避免OOM问题，不推荐使用select * from root.xx.** 这种语句在Grafana plugin中使用。

#### SQL: Drop-down List 输入方式
在 TIME-SERIES 选择框中选择一条时间序列、FUNCTION 选择一个函数、SAMPLING INTERVAL、SLIDING STEP、LEVEL、FILL 输入框中输入内容，其中 TIME-SERIESL 为必填项其余为非必填项。

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Ecosystem-Integration/Grafana-plugin/grafana_input2.png?raw=true">

### 2.4 变量与模板功能的支持

SQL: Full Customized和SQL: Drop-down List两种输入方式都支持 Grafana 的变量与模板功能，下面示例中使用SQL: Full Customized输入方式，SQL: Drop-down List与之类似。

创建一个新的 Panel 后，点击右上角的设置按钮，如下图所示：

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Ecosystem-Integration/Grafana-plugin/setconf.png?raw=true">

选择 `Variables`，点击 `Add variable` ，如下图所示：

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Ecosystem-Integration/Grafana-plugin/addvaribles.png?raw=true">

示例一：输入 `Name`，`Label`，选择Type的`Query`、在Query 中输入show child paths xx ， 点击 `Update` 按钮，如下图所示：

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Ecosystem-Integration/Grafana-plugin/variblesinput.png?raw=true">

应用 Variables，在 `grafana  panel` 中输入变量点击 `save` 按钮，如下图所示

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Ecosystem-Integration/Grafana-plugin/applyvariables.png?raw=true">

示例二：变量嵌套使用，如下图所示
<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Ecosystem-Integration/Grafana-plugin/variblesinput2.png?raw=true">

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Ecosystem-Integration/Grafana-plugin/variblesinput2-1.png?raw=true">

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Ecosystem-Integration/Grafana-plugin/variblesinput2-2.png?raw=true">


示例三：函数变量使用，如下图所示
<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Ecosystem-Integration/Grafana-plugin/variablesinput3.png?raw=true">

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/UserGuide/Ecosystem-Integration/Grafana-plugin/variablesinput3-1.png?raw=true">

上图中Name 是变量名称也是将来我们在panel中使用的变量名称，Label是变量的展示名称如果为空就显示Name的变量反之则显示Label的名称，
Type下拉中有Query、Custom、Text box、Constant、DataSource、Interval、Ad hoc filters等这些都可以在IoTDB的Grafana Plugin 中使用
更加详细介绍用法请查看官方手册(https://grafana.com/docs/grafana/latest/variables/)

除了上面的示例外，还支持下面这些语句:
*  `show databases`
*  `show timeseries`
*  `show child nodes`
*  `show all ttl`
*  `show latest timeseries`
*  `show devices`
*  `select xx from root.xxx limit xx 等sql 查询`

* 提示：如果查询的字段中有布尔类型的数据，会将true转化成1，false转化成0结果值进行显示。

### 2.5 告警功能
本插件支持 Grafana alert功能。在Grafana 9告警界面一共有6个Tab，分别是Alert rules、Contact points、Notification policies、Silences、Alert groups、Admin

* `Alert rules` 告警规则列表，用于展示和配置告警规则
* `Contact points` 为通知渠道，包括DingDing、Email、Slack、WebHook、Prometheus Alertmanager等
* `Notification policies` 配置告警发送到哪个通道的路由，以及发送通知的时间和重复频率，静默配置
* `Silences` 为配置告警静默时间段
* `Alert groups` 告警组，配置的告警触发后会在这里显示
* `Admin` 提供通过JSON方式修改告警配置

1. 在Grafana panel中，点击alerting按钮，如下图所示：

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/grafana9_alert1.png?raw=true">

2. 点击`Create alert rule from this panel`，如下图所示：

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/grafana9_alert2.png?raw=true">

3. 在第1步中设置查询和警报条件，Conditions 表示查询条件，可以配置多个组合查询条件。如下图所示：

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/grafana9_alert3.png?raw=true">

图中的查询条件：min() OF A IS BELOW 0，表示将A选项卡中的最小值在0一下就会触发条件，单击该函数可将其更改为另一个函数。

提示:警报规则中使用的查询不能包含任何模板变量。目前我们只支持条件之间的AND和OR运算符，它们是串行执行的。
例如，我们按以下顺序有 3 个条件： 条件：B（计算为：TRUE）或条件：C（计算为：FALSE）和条件：D（计算为：TRUE） 所以结果将计算为（（对或错）和对）=对。

4. 选择完指标及告警规则后点击`Preview`按钮，进行数据预览如下图所示：
<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/grafana9_alert4.png?raw=true">

5. 在第 2 步中，指定警报评估间隔，对于`Evaluate every`，指定评估频率。必须是 10 秒的倍数。例如，1m，30s。 
对于`Evaluate for`，指定在警报触发之前的持续时间。如下图所示：
<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/grafana9_alert5.png?raw=true">

6. 在第 3 步中，添加存储位置、规则组以及与规则关联的其他元数据。 其中`Rule name`指定规则的名称。规则名称必须是唯一的。
<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/grafana9_alert6.png?raw=true">

7. 在第 4 步中，添加自定义标签。 从下拉列表中选择现有键值对添加自定义标签，或通过输入新键或值来添加新标签。如下图所示：

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/grafana9_alert7.png?raw=true">

8. 单击保存以保存规则或单击保存并退出以保存规则并返回到警报页面。
9. 告警状态常用的有`Normal`、`Pending`、`Firing`等状态，如下图所示：
<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/grafana9_alert8.png?raw=true">
<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="/img/grafana9_alert9.png?raw=true">

10. 我们也可以为告警配置`Contact points`用来接收告警通知，更加详细操作可以参考官方文档(https://grafana.com/docs/grafana/latest/alerting/manage-notifications/create-contact-point/)。

想了解alert更多详细的操作可以查看官方文档https://grafana.com/docs/grafana/latest/alerting/

## 3. 更多

更多关于 Grafana 操作详情可参看 Grafana 官方文档：http://docs.grafana.org/guides/getting_started/。

