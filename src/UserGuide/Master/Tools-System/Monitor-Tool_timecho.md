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

# Monitor Tool

## Prometheus

### The mapping from metric type to prometheus format

> For metrics whose Metric Name is name and Tags are K1=V1, ..., Kn=Vn, the mapping is as follows, where value is a
> specific value

| Metric Type      | Mapping                                                      |
| ---------------- | ------------------------------------------------------------ |
| Counter          | name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn"} value |
| AutoGauge、Gauge | name{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn"} value |
| Histogram        | name_max{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn"} value <br> name_sum{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn"} value <br> name_count{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn"} value <br> name{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn", quantile="0.5"} value <br> name{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn", quantile="0.99"} value |
| Rate             | name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn"} value <br> name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn", rate="m1"} value <br> name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn", rate="m5"} value  <br> name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn", rate="m15"} value <br> name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn", rate="mean"} value |
| Timer            | name_seconds_max{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn"} value <br> name_seconds_sum{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn"} value <br> name_seconds_count{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn"} value <br> name_seconds{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn", quantile="0.5"} value <br> name_seconds{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn", quantile="0.99"} value |

### Config File

1) Taking DataNode as an example, modify the iotdb-system.properties configuration file as follows:

```properties
dn_metric_reporter_list=PROMETHEUS
dn_metric_level=CORE
dn_metric_prometheus_reporter_port=9091
```

Then you can get metrics data as follows

2) Start IoTDB DataNodes
3) Open a browser or use ```curl``` to visit ```http://servier_ip:9091/metrics```, you can get the following metric
    data:

```
...
# HELP file_count
# TYPE file_count gauge
file_count{name="wal",} 0.0
file_count{name="unseq",} 0.0
file_count{name="seq",} 2.0
...
```

### Prometheus + Grafana

As shown above, IoTDB exposes monitoring metrics data in the standard Prometheus format to the outside world. Prometheus
can be used to collect and store monitoring indicators, and Grafana can be used to visualize monitoring indicators.

The following picture describes the relationships among IoTDB, Prometheus and Grafana

![iotdb_prometheus_grafana](https://alioss.timecho.com/docs/img/UserGuide/System-Tools/Metrics/iotdb_prometheus_grafana.png)

1. Along with running, IoTDB will collect its metrics continuously.
2. Prometheus scrapes metrics from IoTDB at a constant interval (can be configured).
3. Prometheus saves these metrics to its inner TSDB.
4. Grafana queries metrics from Prometheus at a constant interval (can be configured) and then presents them on the
    graph.

So, we need to do some additional works to configure and deploy Prometheus and Grafana.

For instance, you can config your Prometheus as follows to get metrics data from IoTDB:

```yaml
job_name: pull-metrics
honor_labels: true
honor_timestamps: true
scrape_interval: 15s
scrape_timeout: 10s
metrics_path: /metrics
scheme: http
follow_redirects: true
static_configs:
  - targets:
      - localhost:9091
```

The following documents may help you have a good journey with Prometheus and Grafana.

[Prometheus getting_started](https://prometheus.io/docs/prometheus/latest/getting_started/)

[Prometheus scrape metrics](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config)

[Grafana getting_started](https://grafana.com/docs/grafana/latest/getting-started/getting-started/)

[Grafana query metrics from Prometheus](https://prometheus.io/docs/visualization/grafana/#grafana-support-for-prometheus)

## Apache IoTDB Dashboard

We introduce the Apache IoTDB Dashboard, designed for unified centralized operations and management. With it, multiple clusters can be monitored through a single panel.

![Apache IoTDB Dashboard](https://alioss.timecho.com/docs/img/%E7%9B%91%E6%8E%A7%20default%20cluster.png)

![Apache IoTDB Dashboard](https://alioss.timecho.com/docs/img/%E7%9B%91%E6%8E%A7%20cluster2.png)


You can access the Dashboard's Json file in the enterprise edition.

### Cluster Overview

Including but not limited to:

- Total cluster CPU cores, memory space, and hard disk space.
- Number of ConfigNodes and DataNodes in the cluster.
- Cluster uptime duration.
- Cluster write speed.
- Current CPU, memory, and disk usage across all nodes in the cluster.
- Information on individual nodes.

![](https://alioss.timecho.com/docs/img/%E7%9B%91%E6%8E%A7%20%E6%A6%82%E8%A7%88.png)


### Data Writing

Including but not limited to:

- Average write latency, median latency, and the 99% percentile latency.
- Number and size of WAL files.
- Node WAL flush SyncBuffer latency.

![](https://alioss.timecho.com/docs/img/%E7%9B%91%E6%8E%A7%20%E5%86%99%E5%85%A5.png)

### Data Querying

Including but not limited to:

- Node query load times for time series metadata.
- Node read duration for time series.
- Node edit duration for time series metadata.
- Node query load time for Chunk metadata list.
- Node edit duration for Chunk metadata.
- Node filtering duration based on Chunk metadata.
- Average time to construct a Chunk Reader.

![](https://alioss.timecho.com/docs/img/%E7%9B%91%E6%8E%A7%20%E6%9F%A5%E8%AF%A2.png)

### Storage Engine

Including but not limited to:

- File count and sizes by type.
- The count and size of TsFiles at various stages.
- Number and duration of various tasks.

![](https://alioss.timecho.com/docs/img/%E7%9B%91%E6%8E%A7%20%E5%AD%98%E5%82%A8%E5%BC%95%E6%93%8E.png)

### System Monitoring

Including but not limited to:

- System memory, swap memory, and process memory.
- Disk space, file count, and file sizes.
- JVM GC time percentage, GC occurrences by type, GC volume, and heap memory usage across generations.
- Network transmission rate, packet sending rate

![](https://alioss.timecho.com/docs/img/%E7%9B%91%E6%8E%A7%20%E7%B3%BB%E7%BB%9F%20%E5%86%85%E5%AD%98%E4%B8%8E%E7%A1%AC%E7%9B%98.png)

![](https://alioss.timecho.com/docs/img/%E7%9B%91%E6%8E%A7%20%E7%B3%BB%E7%BB%9Fjvm.png)

![](https://alioss.timecho.com/docs/img/%E7%9B%91%E6%8E%A7%20%E7%B3%BB%E7%BB%9F%20%E7%BD%91%E7%BB%9C.png)
