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

# Prometheus

The deployment of monitoring tools can be referenced in the document [Monitoring Panel Deployment](../Deployment-and-Maintenance/Monitoring-panel-deployment.md) chapter.

## Prometheus Mapping Relationship for Monitoring Metrics

> For a monitoring metric with Metric Name as `name`, Tags as `K1=V1, ..., Kn=Vn`, the following mapping applies, where `value` is the specific value.

| Monitoring Metric Type | Mapping Relationship                                         |
| ---------------------- | ------------------------------------------------------------ |
| Counter                | `name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn"} value` |
| AutoGauge, Gauge       | `name{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn"} value` |
| Histogram              | `name_max{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn"} value` <br> `name_sum{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn"} value` <br> `name_count{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn"} value` <br> `name{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn", quantile="0.5"} value` <br> `name{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn", quantile="0.99"} value` |
| Rate                   | `name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn"} value` <br> `name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn", rate="m1"} value` <br> `name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn", rate="m5"} value` <br> `name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn", rate="m15"} value` <br> `name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn", rate="mean"} value` |
| Timer                  | `name_seconds_max{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn"} value` <br> `name_seconds_sum{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn"} value` <br> `name_seconds_count{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn"} value` <br> `name_seconds{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn", quantile="0.5"} value` <br> `name_seconds{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn", quantile="0.99"} value` |

## Modifying Configuration Files

1) Taking DataNode as an example, modify the `iotdb-system.properties` configuration file as follows:

```properties
dn_metric_reporter_list=PROMETHEUS
dn_metric_level=CORE
dn_metric_prometheus_reporter_port=9091
```

2) Start the IoTDB DataNode.

3) Open a browser or use `curl` to access `http://server_ip:9091/metrics`, and you will get metric data as follows:

```
...
# HELP file_count
# TYPE file_count gauge
file_count{name="wal",} 0.0
file_count{name="unseq",} 0.0
file_count{name="seq",} 2.0
...
```

## Prometheus + Grafana

As shown above, IoTDB exposes monitoring metrics in the standard Prometheus format. You can use Prometheus to collect and store these metrics and Grafana to visualize them.

The relationship between IoTDB, Prometheus, and Grafana is illustrated below:

![iotdb_prometheus_grafana](/img/UserGuide/System-Tools/Metrics/iotdb_prometheus_grafana.png)

1. IoTDB continuously collects monitoring metrics during operation.
2. Prometheus pulls monitoring metrics from IoTDB's HTTP interface at fixed intervals (configurable).
3. Prometheus stores the pulled monitoring metrics in its TSDB.
4. Grafana queries monitoring metrics from Prometheus at fixed intervals (configurable) and visualizes them.

From the interaction flow, it is clear that additional work is required to deploy and configure Prometheus and Grafana.

For example, you can configure Prometheus as follows (some parameters can be adjusted as needed) to pull metrics from IoTDB:

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

For more details, refer to the following documents:

- [Prometheus Installation and Usage Documentation](https://prometheus.io/docs/prometheus/latest/getting_started/)
- [Prometheus Configuration for Pulling Metrics from HTTP Interface](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config)
- [Grafana Installation and Usage Documentation](https://grafana.com/docs/grafana/latest/getting-started/getting-started/)
- [Grafana Querying Data from Prometheus and Plotting Documentation](https://prometheus.io/docs/visualization/grafana/#grafana-support-for-prometheus)

## Apache IoTDB Dashboard

The `Apache IoTDB Dashboard` is a companion product of IoTDB Enterprise Edition, supporting unified centralized operation and maintenance management. It allows monitoring multiple clusters through a single monitoring panel. You can contact the business team to obtain the Dashboard's JSON file.

![Apache IoTDB Dashboard](/img/%E7%9B%91%E6%8E%A7%20default%20cluster.png)

![Apache IoTDB Dashboard](/img/%E7%9B%91%E6%8E%A7%20cluster2.png)

### Cluster Overview

You can monitor, but not limited to:

- Total CPU cores, total memory space, total disk space of the cluster.
- Number of ConfigNodes and DataNodes in the cluster.
- Cluster uptime.
- Cluster write speed.
- Current CPU, memory, and disk usage of each node in the cluster.
- Node-specific information.

![](/img/%E7%9B%91%E6%8E%A7%20%E6%A6%82%E8%A7%88.png)

### Data Writing

You can monitor, but not limited to:

- Average write latency, median latency, 99th percentile latency.
- Number and size of WAL files.
- Node WAL flush SyncBuffer latency.

![](/img/%E7%9B%91%E6%8E%A7%20%E5%86%99%E5%85%A5.png)

### Data Query

You can monitor, but not limited to:

- Node query loading time series metadata latency.
- Node query reading time series latency.
- Node query modifying time series metadata latency.
- Node query loading Chunk metadata list latency.
- Node query modifying Chunk metadata latency.
- Node query filtering by Chunk metadata latency.
- Node query constructing Chunk Reader latency average.

![](/img/%E7%9B%91%E6%8E%A7%20%E6%9F%A5%E8%AF%A2.png)

### Storage Engine

You can monitor, but not limited to:

- Number and size of files by type.
- Number and size of TsFiles in various stages.
- Number and latency of various tasks.

![](/img/%E7%9B%91%E6%8E%A7%20%E5%AD%98%E5%82%A8%E5%BC%95%E6%93%8E.png)

### System Monitoring

You can monitor, but not limited to:

- System memory, swap memory, process memory.
- Disk space, file count, file size.
- JVM GC time ratio, GC count by type, GC data volume, heap memory usage by generation.
- Network transmission rate, packet sending rate.

![](/img/%E7%9B%91%E6%8E%A7%20%E7%B3%BB%E7%BB%9F%20%E5%86%85%E5%AD%98%E4%B8%8E%E7%A1%AC%E7%9B%98.png)

![](/img/%E7%9B%91%E6%8E%A7%20%E7%B3%BB%E7%BB%9Fjvm.png)

![](/img/%E7%9B%91%E6%8E%A7%20%E7%B3%BB%E7%BB%9F%20%E7%BD%91%E7%BB%9C.png)