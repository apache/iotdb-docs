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

## **Prometheus** **Integration**

### **Prometheus Metric Mapping**

The following table illustrates the mapping of IoTDB metrics to the Prometheus-compatible format. For a given metric with `Metric Name = name` and tags `K1=V1, ..., Kn=Vn`, the mapping follows this pattern, where `value` represents the actual measurement.

| **Metric Type**  | **Mapping**                                                  |
| ---------------- | ------------------------------------------------------------ |
| Counter          | name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn"} value |
| AutoGauge, Gauge | name{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn"} value |
| Histogram        | name_max{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn"} value <br> name_sum{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn"} value <br> name_count{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn"} value <br> name{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn", quantile="0.5"} value <br> name{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn", quantile="0.99"} value |
| Rate             | name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn"} value <br> name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn", rate="m1"} value <br> name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn", rate="m5"} value  <br> name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn", rate="m15"} value <br> name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn", rate="mean"} value |
| Timer            | name_seconds_max{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn"} value <br> name_seconds_sum{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn"} value <br> name_seconds_count{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn"} value <br> name_seconds{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn", quantile="0.5"} value <br> name_seconds{cluster="clusterName", nodeType="nodeType", nodeId="nodeId", k1="V1", ..., Kn="Vn", quantile="0.99"} value |

### **Configuration File**

To enable Prometheus metric collection in IoTDB, modify the configuration file as follows:

1. Taking DataNode as an example, modify the iotdb-system.properties configuration file as follows:

```Properties
dn_metric_reporter_list=PROMETHEUS
dn_metric_level=CORE
dn_metric_prometheus_reporter_port=9091
```

1. Start IoTDB DataNodes
2. Use a web browser or `curl` to access `http://server_ip:9091/metrics` to retrieve metric data, such as:

```Plain
...
# HELP file_count
# TYPE file_count gauge
file_count{name="wal",} 0.0
file_count{name="unseq",} 0.0
file_count{name="seq",} 2.0
...
```

### **Prometheus + Grafana** **Integration**

IoTDB exposes monitoring data in the standard Prometheus-compatible format. Prometheus collects and stores these metrics, while Grafana is used for visualization.

**Integration Workflow**

The following picture describes the relationships among IoTDB, Prometheus and Grafana:

![iotdb_prometheus_grafana](/img/UserGuide/System-Tools/Metrics/iotdb_prometheus_grafana.png)

Iotdb-Prometheus-Grafana Workflow

1. IoTDB continuously collects monitoring metrics.
2. Prometheus collects metrics from IoTDB at a configurable interval.
3. Prometheus stores the collected metrics in its internal time-series database (TSDB).
4. Grafana queries Prometheus at a configurable interval and visualizes the metrics.

**Prometheus Configuration Example**

To configure Prometheus to collect IoTDB metrics, modify the `prometheus.yml` file as follows:

```YAML
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

For more details, refer to:

- Prometheus Documentation:
    - [Prometheus getting_started](https://prometheus.io/docs/prometheus/latest/getting_started/)
    - [Prometheus scrape metrics](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#scrape_config)
- Grafana Documentation:
    - [Grafana getting_started](https://grafana.com/docs/grafana/latest/getting-started/getting-started/)
    - [Grafana query metrics from Prometheus](https://prometheus.io/docs/visualization/grafana/#grafana-support-for-prometheus)

## **Apache IoTDB Dashboard**

We introduce the Apache IoTDB Dashboard, designed for unified centralized operations and management, which enables monitoring multiple clusters through a single panel.

![Apache IoTDB Dashboard](/img/%E7%9B%91%E6%8E%A7%20default%20cluster.png)

![Apache IoTDB Dashboard](/img/%E7%9B%91%E6%8E%A7%20cluster2.png)

You can access the Dashboard's Json file in TimechoDB.

### **Cluster Overview**

Including but not limited to:

- Total number of CPU cores, memory capacity, and disk space in the cluster.
- Number of ConfigNodes and DataNodes in the cluster.
- Cluster uptime.
- Cluster write throughput.
- Current CPU, memory, and disk utilization across all nodes.
- Detailed information for individual nodes.

![](/img/%E7%9B%91%E6%8E%A7%20%E6%A6%82%E8%A7%88.png)

### **Data Writing**

Including but not limited to:

- Average write latency, median latency, and the 99% percentile latency.
- Number and size of WAL files.
- WAL flush SyncBuffer latency per node.

![](/img/%E7%9B%91%E6%8E%A7%20%E5%86%99%E5%85%A5.png)

### **Data Querying**

Including but not limited to:

- Time series metadata query load time per node.
- Time series data read duration per node.
- Time series metadata modification duration per node.
- Chunk metadata list loading time per node.
- Chunk metadata modification duration per node.
- Chunk metadata-based filtering duration per node.
- Average time required to construct a Chunk Reader.

![](/img/%E7%9B%91%E6%8E%A7%20%E6%9F%A5%E8%AF%A2.png)

### **Storage Engine**

Including but not limited to:

- File count and size by type.
- Number and size of TsFiles at different processing stages.
- Task count and execution duration for various operations.

![](/img/%E7%9B%91%E6%8E%A7%20%E5%AD%98%E5%82%A8%E5%BC%95%E6%93%8E.png)

### **System Monitoring**

Including but not limited to:

- System memory, swap memory, and process memory usage.
- Disk space, file count, and file size statistics.
- JVM garbage collection (GC) time percentage, GC events by type, GC data volume, and heap memory utilization across generations.
- Network throughput and packet transmission rate.

![](/img/%E7%9B%91%E6%8E%A7%20%E7%B3%BB%E7%BB%9F%20%E5%86%85%E5%AD%98%E4%B8%8E%E7%A1%AC%E7%9B%98.png)

![](/img/%E7%9B%91%E6%8E%A7%20%E7%B3%BB%E7%BB%9Fjvm.png)

![](/img/%E7%9B%91%E6%8E%A7%20%E7%B3%BB%E7%BB%9F%20%E7%BD%91%E7%BB%9C.png)