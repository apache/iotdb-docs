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

# 1. 监控面板安装部署
从 IoTDB 1.0 版本开始，我们引入了系统监控模块，可以完成对 IoTDB 的重要运行指标进行监控，本文介绍了如何在 IoTDB 分布式开启系统监控模块，并且使用 Prometheus  + Grafana 的方式完成对系统监控指标的可视化。

## 1.1 前期准备

### 1.1.1 软件要求

1. IoTDB：1.0 版本及以上，可以前往官网下载：https://iotdb.apache.org/Download/
2. Prometheus：2.30.3 版本及以上，可以前往官网下载：https://prometheus.io/download/
3. Grafana：8.4.2 版本及以上，可以前往官网下载：https://grafana.com/grafana/download
4. IoTDB 监控面板：基于企业版IoTDB的数据库监控面板，您可联系商务获取


### 1.1.2 启动 ConfigNode
> 本文以 3C3D 为例

1. 进入`iotdb-enterprise-1.3.x.x-bin`包
2. 修改配置文件`conf/iotdb-confignode.properties`，修改如下配置，其他配置保持不变：

```properties
cn_metric_reporter_list=PROMETHEUS
cn_metric_level=IMPORTANT
cn_metric_prometheus_reporter_port=9091
```

3. 运行脚本启动 ConfigNode：`./sbin/start-confignode.sh`，出现如下提示则为启动成功：

![](https://spricoder.oss-cn-shanghai.aliyuncs.com/Apache%20IoTDB/metric/cluster-introduce/1.png)

4. 在浏览器进入http://localhost:9091/metrics网址，可以查看到如下的监控项信息：

![](https://spricoder.oss-cn-shanghai.aliyuncs.com/Apache%20IoTDB/metric/cluster-introduce/2.png)

5. 同样地，另外两个 ConfigNode 节点可以分别配置到 9092 和 9093 端口。

### 1.1.3 启动 DataNode
1. 进入`iotdb-enterprise-1.3.x.x-bin`包
2. 修改配置文件`conf/iotdb-datanode.properties`，修改如下配置，其他配置保持不变：

```properties
dn_metric_reporter_list=PROMETHEUS
dn_metric_level=IMPORTANT
dn_metric_prometheus_reporter_port=9094
```

3. 运行脚本启动 DataNode：`./sbin/start-datanode.sh`，出现如下提示则为启动成功：

![](https://spricoder.oss-cn-shanghai.aliyuncs.com/Apache%20IoTDB/metric/cluster-introduce/3.png)

4. 在浏览器进入`http://localhost:9094/metrics`网址，可以查看到如下的监控项信息：

![](https://spricoder.oss-cn-shanghai.aliyuncs.com/Apache%20IoTDB/metric/cluster-introduce/4.png)

5. 同样地，另外两个 DataNode 可以配置到 9095 和 9096 端口。

### 1.1.4 说明

进行以下操作前请确认IoTDB集群已启动。

本文将在一台机器（3 个 ConfigNode 和 3 个 DataNode）环境上进行监控面板搭建，其他集群配置是类似的，用户可以根据自己的集群情况（ConfigNode 和 DataNode 的数量）进行配置调整。本文搭建的集群的基本配置信息如下表所示。

| 集群角色   | 节点IP    | 监控模块推送器 | 监控模块级别 | 监控 Port |
| ---------- | --------- | -------------- | ------------ | --------- |
| ConfigNode | 127.0.0.1 | PROMETHEUS     | IMPORTANT    | 9091      |
| ConfigNode | 127.0.0.1 | PROMETHEUS     | IMPORTANT    | 9092      |
| ConfigNode | 127.0.0.1 | PROMETHEUS     | IMPORTANT    | 9093      |
| DataNode   | 127.0.0.1 | PROMETHEUS     | IMPORTANT    | 9094      |
| DataNode   | 127.0.0.1 | PROMETHEUS     | IMPORTANT    | 9095      |
| DataNode   | 127.0.0.1 | PROMETHEUS     | IMPORTANT    | 9096      |

## 1.2 配置 Prometheus 采集监控指标

1. 下载安装包。下载Prometheus的二进制包到本地，解压后进入对应文件夹：

```Shell
tar xvfz prometheus-*.tar.gz
cd prometheus-*
```

2. 修改配置。修改Prometheus的配置文件prometheus.yml如下
   a. 新增 confignode 任务收集 ConfigNode 的监控数据
   b. 新增 datanode 任务收集 DataNode 的监控数据

```YAML
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "prometheus"
    static_configs:
    - targets: ["localhost:9090"]
  - job_name: "confignode"
    static_configs:
    - targets: ["localhost:9091", "localhost:9092", "localhost:9093"]
    honor_labels: true
  - job_name: "datanode"
    static_configs:
    - targets: ["localhost:9094", "localhost:9095", "localhost:9096"]
    honor_labels: true
```

3. 启动Promethues。Prometheus 监控数据的默认过期时间为 15d。在生产环境中，建议将其调整为 180d 以上，以对更长时间的历史监控数据进行追踪，启动命令如下所示：

```Shell
./prometheus --config.file=prometheus.yml --storage.tsdb.retention.time=180d
```

4. 确认启动成功。在浏览器中输入 http://localhost:9090，进入Prometheus，点击进入Status下的Target界面（如下图1），当看到State均为Up时表示配置成功并已经联通（如下图2），点击左侧链接可以跳转到网页监控。

![](https://alioss.timecho.com/docs/img/1a.PNG)
![](https://alioss.timecho.com/docs/img/2a.PNG)

## 1.3 使用 Grafana 查看监控数据

### 1.3.1 Step1：Grafana 安装、配置与启动

1. 下载Grafana的二进制包到本地，解压后进入对应文件夹：

```Shell
tar -zxvf grafana-*.tar.gz
cd grafana-*
```

2. 启动Grafana并进入：

```Shell
./bin/grafana-server web 
```

3. 在浏览器中输入 http://localhost:3000，进入Grafana，默认初始用户名和密码均为 admin。
4. 首先我们在 Configuration 中配置 Data Source 为 Prometheus

![](https://alioss.timecho.com/docs/img/3a.png)

5. 在配置 Data Source 时注意 Prometheus 所在的URL，配置好后点击Save & Test 出现 Data source is working 提示则为配置成功

![](https://alioss.timecho.com/docs/img/4a.png)

### 1.3.2 Step2：导入 IoTDB 监控看板

1. 进入 Grafana，选择 Dashboards 的 Browse

![](https://alioss.timecho.com/docs/img/5a.png)

2. 点击右侧 Import 按钮

![](https://alioss.timecho.com/docs/img/6a.png)

3. 选择一种方式导入 Dashboard
   a. 上传本地已下载的 Dashboard 的 Json 文件
   b. 将 Dashboard 的 Json 文件内容直接粘贴进入

![](https://alioss.timecho.com/docs/img/7a.png)

1. 选择 Dashboard 的 Prometheus 为刚刚配置好的 Data Source，然后点击 Import

![](https://alioss.timecho.com/docs/img/8a.png)

5. 之后进入 Apache ConfigNode Dashboard，就看到如下的监控面板

![](https://alioss.timecho.com/docs/img/confignode.png)

6. 同样，我们可以导入 Apache DataNode Dashboard，看到如下的监控面板：

![](https://alioss.timecho.com/docs/img/datanode.png)

7. 同样，我们可以导入 Apache Performance Overview Dashboard，看到如下的监控面板：

![](https://alioss.timecho.com/docs/img/performance.png)

8. 同样，我们可以导入 Apache System Overview Dashboard，看到如下的监控面板：

![](https://alioss.timecho.com/docs/img/system.png)

### 1.3.3 Step3：创建新的 Dashboard 进行数据可视化

1. 首先创建Dashboard，然后创建Panel

![](https://alioss.timecho.com/docs/img/11a.png)

2. 之后就可以在面板根据自己的需求对监控相关的数据进行可视化（所有相关的监控指标可以先在job中选择confignode/datanode筛选）

![](https://alioss.timecho.com/docs/img/12a.png)

3. 选择关注的监控指标可视化完成后，我们就得到了这样的面板：

![](https://alioss.timecho.com/docs/img/13a.png)