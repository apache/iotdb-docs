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

<!--The deployment of monitoring tools can be referenced in the document [Monitoring Panel Deployment](../Deployment-and-Maintenance/Monitoring-panel-deployment.md) chapter.-->
## 1. Prometheus Mapping Relationship for Monitoring Metrics

> For a monitoring metric with Metric Name as `name`, Tags as `K1=V1, ..., Kn=Vn`, the following mapping applies, where `value` is the specific value.

| Monitoring Metric Type | Mapping Relationship                                         |
| ---------------------- | ------------------------------------------------------------ |
| Counter                | `name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn"} value` |
| AutoGauge, Gauge       | `name{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn"} value` |
| Histogram              | `name_max{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn"} value` <br> `name_sum{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn"} value` <br> `name_count{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn"} value` <br> `name{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn", quantile="0.5"} value` <br> `name{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn", quantile="0.99"} value` |
| Rate                   | `name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn"} value` <br> `name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn", rate="m1"} value` <br> `name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn", rate="m5"} value` <br> `name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn", rate="m15"} value` <br> `name_total{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn", rate="mean"} value` |
| Timer                  | `name_seconds_max{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn"} value` <br> `name_seconds_sum{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn"} value` <br> `name_seconds_count{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn"} value` <br> `name_seconds{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn", quantile="0.5"} value` <br> `name_seconds{cluster="clusterName", nodeType="nodeType", nodeId="nodeId",k1="V1" , ..., Kn="Vn", quantile="0.99"} value` |

## 2. Modifying Configuration Files

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

## 3. Prometheus + Grafana

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
