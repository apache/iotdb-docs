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
# 双活版部署指导

## 1. 什么是双活版？

双活通常是指两个独立的单机(或集群)，实时进行镜像同步，它们的配置完全独立，可以同时接收外界的写入，每一个独立的单机(或集群)都可以将写入到自己的数据同步到另一个单机(或集群)中，两个单机(或集群)的数据可达到最终一致。

- 两个单机(或集群)可构成一个高可用组：当其中一个单机(或集群)停止服务时，另一个单机(或集群)不会受到影响。当停止服务的单机(或集群)再次启动时，另一个单机(或集群)会将新写入的数据同步过来。业务可以绑定两个单机(或集群)进行读写，从而达到高可用的目的。
- 双活部署方案允许在物理节点少于 3 的情况下实现高可用，在部署成本上具备一定优势。同时可以通过电力、网络的双环网，实现两套单机(或集群)的物理供应隔离，保障运行的稳定性。
- 目前双活能力为企业版功能。

![](/img/%E5%8F%8C%E6%B4%BB%E5%90%8C%E6%AD%A5.png)

## 2. 注意事项

1. 部署时推荐优先使用`hostname`进行IP配置，可避免后期修改主机ip导致数据库无法启动的问题。设置hostname需要在目标服务器上配置`/etc/hosts`，如本机ip是192.168.1.3，hostname是iotdb-1，则可以使用以下命令设置服务器的 hostname，并使用hostname配置IoTDB的`cn_internal_address`、`dn_internal_address`。

    ```Bash
    echo "192.168.1.3  iotdb-1" >> /etc/hosts 
    ```

2. 有些参数首次启动后不能修改，请参考下方的"安装步骤"章节来进行设置。

3. 推荐部署监控面板，可以对重要运行指标进行监控，随时掌握数据库运行状态，监控面板可以联系商务获取，部署监控面板步骤可以参考[文档](https://www.timecho.com/docs/zh/UserGuide/latest/Deployment-and-Maintenance/Monitoring-panel-deployment.html)

## 3. 安装步骤

我们以两台单机A和B构建的双活版IoTDB为例，A和B的ip分别是192.168.1.3 和 192.168.1.4 ，这里用hostname来表示不同的主机，规划如下：

| 机器 | 机器ip      | 主机名  |
| ---- | ----------- | ------- |
| A    | 192.168.1.3 | iotdb-1 |
| B    | 192.168.1.4 | iotdb-2 |

### Step1：分别安装两套独立的 IoTDB

在2个机器上分别安装 IoTDB，单机版部署文档可参考[文档](../Deployment-and-Maintenance/Stand-Alone-Deployment_timecho.md)，集群版部署文档可参考[文档](../Deployment-and-Maintenance/Cluster-Deployment_timecho.md)。**推荐 A、B 集群的各项配置保持一致，以实现最佳的双活效果。**

### Step2：在机器A上创建数据同步任务至机器B

- 在机器A上创建数据同步流程，即机器A上的数据自动同步到机器B，使用sbin目录下的cli工具连接A上的IoTDB数据库：

    ```Bash
    ./sbin/start-cli.sh  -h iotdb-1
    ```

- 创建并启动数据同步命令，SQL 如下:

    ```Bash
    create pipe AB
    with source (
    'source.forwarding-pipe-requests' = 'false' 
    )
    with sink (
    'sink'='iotdb-thrift-sink',
    'sink.ip'='iotdb-2',
    'sink.port'='6667'
    )
    ```

- 注意：为了避免数据无限循环，需要将A和B上的参数`source.forwarding-pipe-requests` 均设置为 `false`，表示不转发从另一pipe传输而来的数据。

### Step3：在机器B上创建数据同步任务至机器A

  - 在机器B上创建数据同步流程，即机器B上的数据自动同步到机器A，使用sbin目录下的cli工具连接B上的IoTDB数据库：

    ```Bash
    ./sbin/start-cli.sh  -h iotdb-2
    ```

    创建并启动pipe，SQL 如下:

    ```Bash
    create pipe BA
    with source (
    'source.forwarding-pipe-requests' = 'false' 
    )
    with sink (
    'sink'='iotdb-thrift-sink',
    'sink.ip'='iotdb-1',
    'sink.port'='6667'
    )
    ```

- 注意：为了避免数据无限循环，需要将A和B上的参数`source.forwarding-pipe-requests` 均设置为 `false`，表示不转发从另一pipe传输而来的数据。

### Step4：验证部署

上述数据同步流程创建完成后，即可启动双活集群。

#### 检查集群运行状态

```Bash
#在2个节点分别执行show cluster命令检查IoTDB服务状态
show  cluster
```

**机器A**:

![](/img/%E5%8F%8C%E6%B4%BB-A.png)

**机器B**:

![](/img/%E5%8F%8C%E6%B4%BB-B.png)

确保每一个 ConfigNode 和 DataNode 都处于 Running 状态。

#### 检查同步状态

- 机器A上检查同步状态

```Bash
show pipes
```

![](/img/show%20pipes-A.png)

- 机器B上检查同步状态

```Bash
show pipes
```

![](/img/show%20pipes-B.png)

确保每一个 pipe 都处于 RUNNING 状态。

### Step5：停止双活版 IoTDB

- 在机器A的执行下列命令：

    ```SQL
    ./sbin/start-cli.sh -h iotdb-1  #登录cli
    IoTDB> stop pipe AB             #停止数据同步流程
    ./sbin/stop-standalone.sh       #停止数据库服务
    ```

- 在机器B的执行下列命令：

    ```SQL
    ./sbin/start-cli.sh -h iotdb-2  #登录cli
    IoTDB> stop pipe BA             #停止数据同步流程
    ./sbin/stop-standalone.sh       #停止数据库服务
    ```