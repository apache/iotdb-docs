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

# 1 Monitoring Board Install and Deploy
From the IoTDB 1.0 version, we introduced the system monitoring module, you can complete the IoTDB important operational indicators for monitoring, this article describes how to open the system monitoring module in the IoTDB distribution, and the use of Prometheus + Grafana way to complete the visualisation of the system monitoring indicators.

## 1.1 pre-preparation

### 1.1.1 software requirement

1. IoTDB: version 1.0 and above, you may contact your sales for the relevant installer
2. Prometheus: version 2.30.3 and above, download from the official website: https://prometheus.io/download/
3. Grafana: version 8.4.2 and above, download from the official website: https://grafana.com/grafana/download
4. IoTDB Dashboards: IoTDB Dashboard is a tool for Enterprise IoTDB, and you may contact your sales for the relevant installer.

### 1.1.2 Start ConfigNode
1. Enter the `iotdb-enterprise-1.x.x.x-bin` package
2. Modify the configuration file `conf/iotdb-system.properties` and modify the following configuration. Other configurations remain unchanged:

```properties
cn_metric_reporter_list=PROMETHEUS
cn_metric_level=IMPORTANT
cn_metric_prometheus_reporter_port=9091
```

3. Run the script to start ConfigNode: `./sbin/start-confignode.sh`. If the following prompt appears, the startup is successful:

![](https://spricoder.oss-cn-shanghai.aliyuncs.com/Apache%20IoTDB/metric/cluster-introduce/1.png)

4. Enter the http://localhost:9091/metrics URL in the browser, and you can view the following monitoring item information:

![](https://spricoder.oss-cn-shanghai.aliyuncs.com/Apache%20IoTDB/metric/cluster-introduce/2.png)

5. Similarly, the other two ConfigNode nodes can be configured to ports 9092 and 9093 respectively.

### 1.1.3 Start DataNode
1. Enter the `iotdb-enterprise-1.x.x.x-bin` package
2. Modify the configuration file `conf/iotdb-system.properties` and modify the following configuration. Other configurations remain unchanged:

```properties
dn_metric_reporter_list=PROMETHEUS
dn_metric_level=IMPORTANT
dn_metric_prometheus_reporter_port=9094
```

3. Run the script to start DataNode: `./sbin/start-datanode.sh`. If the following prompt appears, the startup is successful:

![](https://spricoder.oss-cn-shanghai.aliyuncs.com/Apache%20IoTDB/metric/cluster-introduce/3.png)

4. Enter the `http://localhost:9094/metrics` URL in the browser, and you can view the following monitoring item information:

![](https://spricoder.oss-cn-shanghai.aliyuncs.com/Apache%20IoTDB/metric/cluster-introduce/4.png)

5. Similarly, the other two DataNodes can be configured to ports 9095 and 9096.

### 1.1.4 clarification

Please confirm that the IoTDB cluster has been started before performing the following operations.

This doc will build the monitoring dashboard on one machine (1 ConfigNode and 1 DataNode) environment, other cluster configurations are similar, users can adjust the configuration according to their own cluster situation (the number of ConfigNode and DataNode). The basic configuration information of the cluster built in this paper is shown in the table below.

| NODETYPE   | NODEIP    | Monitor Pusher | Monitor Level | Monitor Port |
| ---------- | --------- | -------------- | ------------ | --------- |
| ConfigNode | 127.0.0.1 | PROMETHEUS     | IMPORTANT    | 9091      |
| ConfigNode | 127.0.0.1 | PROMETHEUS     | IMPORTANT    | 9092      |
| ConfigNode | 127.0.0.1 | PROMETHEUS     | IMPORTANT    | 9093      |
| DataNode   | 127.0.0.1 | PROMETHEUS     | IMPORTANT    | 9094      |
| DataNode   | 127.0.0.1 | PROMETHEUS     | IMPORTANT    | 9095      |
| DataNode   | 127.0.0.1 | PROMETHEUS     | IMPORTANT    | 9096      |

## 1.2 configure Prometheus capture monitoring metrics

1. Download the installation package. Download the Prometheus binary package locally, unzip it and go to the corresponding folder:

```Shell
tar xvfz prometheus-*.tar.gz
cd prometheus-*
```

2. Modify the configuration. Modify the Prometheus configuration file prometheus.yml as follows:
   a. Added confignode task to collect monitoring data from ConfigNode
   b. Add datanode task to collect monitoring data from DataNode

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

3. Start Promethues. the default expiration time for Prometheus monitoring data is 15d. in production environments, it is recommended to adjust the expiration time to 180d or more in order to track historical monitoring data for a longer period of time, as shown in the following startup command:

```Shell
./prometheus --config.file=prometheus.yml --storage.tsdb.retention.time=180d
```

4. Confirm the startup is successful. Enter http://localhost:9090 in the browser to enter Prometheus, click to enter the Target interface under Status (Figure 1 below), when you see State are Up, it means the configuration is successful and connected (Figure 2 below), click the link on the left side to jump to the webpage monitoring.

![](https://alioss.timecho.com/docs/img/1a.PNG)
![](https://alioss.timecho.com/docs/img/2a.PNG)



## 1.3 Using Grafana to View Monitoring Data

### 1.3.1 Step1：Grafana Installation, Configuration and Startup

1. Download the binary package of Grafana locally, unzip it and go to the corresponding folder:

```Shell
tar -zxvf grafana-*.tar.gz
cd grafana-*
```

2. Start Grafana and enter:

```Shell
./bin/grafana-server web 
```

3. Enter http://localhost:3000 in your browser to access Grafana, the default initial username and password are both admin.
4. First we configure the Data Source in Configuration to be Prometheus.

![](https://alioss.timecho.com/upload/3aea.jpg)

5. When configuring the Data Source, pay attention to the URL where Prometheus is located, and click Save & Test after configuration, the Data source is working prompt appears, then the configuration is successful.

![](https://alioss.timecho.com/upload/4aen.jpg)

### 1.3.2 Step2：Import the IoTDB Dashboards

1. Enter Grafana，click Browse of Dashboards

![](https://alioss.timecho.com/docs/img/5a.png)

2. Click the Import button on the right

![](https://alioss.timecho.com/docs/img/6a.png)

3. Select a way to import Dashboard
   a. Upload the Json file of the downloaded Dashboard locally
   b. Paste the contents of the Dashboard's Json file

![](https://alioss.timecho.com/docs/img/7a.png)

1. Select Prometheus in the Dashboard as the Data Source you just configured and click Import

![](https://alioss.timecho.com/docs/img/8a.png)

5. Then enter the Apache ConfigNode Dashboard and see the following monitoring panel

![](https://alioss.timecho.com/docs/img/confignode.png)

6. Similarly, we can import Apache DataNode Dashboard and see the following monitoring panel:

![](https://alioss.timecho.com/docs/img/datanode.png)

7. Similarly, we can import the Apache Performance Overview Dashboard and see the following monitoring panel:

![](https://alioss.timecho.com/docs/img/performance.png)

8. Similarly, we can import the Apache System Overview Dashboard and see the following monitoring panel:

![](https://alioss.timecho.com/docs/img/system.png)

### 1.3.3 Step3：Creating a new Dashboard for data visualisation

1. First create the Dashboard, then create the Panel.

![](https://alioss.timecho.com/docs/img/11a.png)

2. After that, you can visualize the monitoring-related data in the panel according to your needs (all relevant monitoring metrics can be filtered by selecting confignode/datanode in the job first).

![](https://alioss.timecho.com/upload/12aen.jpg)

3. Once the visualisation of the monitoring metrics selected for attention is complete, we get a panel like this:

![](https://alioss.timecho.com/docs/img/13a.png)