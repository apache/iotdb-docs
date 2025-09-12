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
# 可视化控制台部署

可视化控制台是IoTDB配套工具之一（类似 Navicat for MySQL）。它用于数据库部署实施、运维管理、应用开发各阶段的官方应用工具体系，让数据库的使用、运维和管理更加简单、高效，真正实现数据库低成本的管理和运维。本文档将帮助您安装Workbench。

  <div style="display: flex;justify-content: space-between;">        		
    <img src="/img/%E9%A6%96%E9%A1%B5.png" alt=" " style="width: 50%;"/>
    <img src="/img/workbench-1.png" alt=" " style="width: 50%;"/>     
  </div>

可视化控制台工具的使用说明可参考文档 [使用说明](../Tools-System/Workbench_timecho.md) 章节。

## 1. 安装准备

| 准备内容 |           名称            |                           版本要求                           |                        官方链接                        |
| :------: | :-----------------------: | :----------------------------------------------------------: | :----------------------------------------------------: |
| 操作系统 |      Windows或Linux       |                              -                               |                           -                            |
| 安装环境 |            JDK            | 1.5.4及以下版本需要 >= 1.8，1.5.5及以上版本需要 >= 17（下载时请根据机器配置选择ARM或x64安装包）  |  https://www.oracle.com/java/technologies/downloads/   |
| 相关软件 |        Prometheus         |                        需要 >=V2.30.3                        |            https://prometheus.io/download/             |
|  数据库  |           IoTDB           |                      需要>=V1.2.0企业版                      |               您可联系商务或技术支持获取               |
|  控制台  | IoTDB-Workbench-`<version>`|                              -                               | 您可根据附录版本对照表进行选择后联系商务或技术支持获取 |

## 2. 安装步骤

### 2.1 步骤一：IoTDB 开启监控指标采集

1. 打开监控配置项。IoTDB中监控有关的配置项默认是关闭的，在部署监控面板前，您需要打开相关配置项（注意开启监控配置后需要重启服务）。

<table>
<tbody>
          <tr>
                <th>配置项</th>
                <th>所在配置文件</th>        
                <th>配置说明</th>
          </tr>
          <tr>
                <td>cn_metric_reporter_list</td>   
                <td rowspan="3">conf/iotdb-system.properties</td> 
                <td>请在配置文件中添加该配置项，值设置为PROMETHEUS</td> 
          </tr>
          <tr>
                <td>cn_metric_level</td>   
                <td>请在配置文件中添加该配置项，值设置为IMPORTANT</td> 
          </tr>
          <tr>
                <td>cn_metric_prometheus_reporter_port</td>   
                <td>请在配置文件中添加该配置项，可保持默认设置9091，如设置其他端口，不与其他端口冲突即可</td> 
          </tr>
          <tr>
                <td>dn_metric_reporter_list</td>   
                <td rowspan="4">conf/iotdb-system.properties</td> 
                <td>请在配置文件中添加该配置项，值设置为PROMETHEUS</td> 
          </tr>
          <tr>
                <td>dn_metric_level</td>   
                <td>请在配置文件中添加该配置项，值设置为IMPORTANT</td> 
          </tr>
          <tr>
                <td>dn_metric_prometheus_reporter_port</td>   
                <td>请在配置文件中添加该配置项，可保持默认设置9092，如设置其他端口，不与其他端口冲突即可</td> 
          </tr>
          <tr>
                <td>dn_metric_internal_reporter_type</td>   
                <td>请在配置文件中添加该配置项，值设置为IOTDB</td> 
          </tr>
          <tr>
                <td>enable_audit_log</td>   
                <td rowspan="3">conf/iotdb-system.properties</td> 
                <td>请在配置文件中添加该配置项，值设置为true</td> 
          </tr>
          <tr>
                <td>audit_log_storage</td>   
                <td>请在配置文件中添加该配置项，值设置为IOTDB,LOGGER</td> 
          </tr>
          <tr>
                <td>audit_log_operation</td>   
                <td>请在配置文件中添加该配置项，值设置为DML,DDL,QUERY</td> 
          </tr>
</tbody>
</table>

2. 重启所有节点。修改3个节点的监控指标配置后，可重新启动所有节点的confignode和datanode服务：

    ```shell
    ./sbin/stop-standalone.sh      #先停止confignode和datanode
    ./sbin/start-confignode.sh  -d #启动confignode
    ./sbin/start-datanode.sh  -d   #启动datanode 
    ```

3. 重启后，通过客户端确认各节点的运行状态，若状态都为Running，则为配置成功：

   ![](/img/%E5%90%AF%E5%8A%A8.png)

### 2.2 步骤二：安装、配置Prometheus监控

1. 确保Prometheus安装完成(官方安装说明可参考：https://prometheus.io/docs/introduction/first_steps/)
2. 解压安装包，进入解压后的文件夹：

    ```Shell
    tar xvfz prometheus-*.tar.gz
    cd prometheus-*
    ```

3. 修改配置。修改配置文件prometheus.yml如下
   1. 新增confignode任务收集ConfigNode的监控数据
   2. 新增datanode任务收集DataNode的监控数据

    ```shell
    global:
    scrape_interval: 15s 
    evaluation_interval: 15s 
    scrape_configs:
    - job_name: "prometheus"
        static_configs:
        - targets: ["localhost:9090"]
    - job_name: "confignode"
        static_configs:
        - targets: ["iotdb-1:9091","iotdb-2:9091","iotdb-3:9091"]
        honor_labels: true
    - job_name: "datanode"
        static_configs:
        - targets: ["iotdb-1:9092","iotdb-2:9092","iotdb-3:9092"]
        honor_labels: true
    ```

4. 启动Prometheus。Prometheus 监控数据的默认过期时间为15天，在生产环境中，建议将其调整为180天以上，以对更长时间的历史监控数据进行追踪，启动命令如下所示：

    ```Shell
    ./prometheus --config.file=prometheus.yml --storage.tsdb.retention.time=180d
    ```

5. 确认启动成功。在浏览器中输入 `http://IP:port`，进入Prometheus，点击进入Status下的Target界面，当看到State均为Up时表示配置成功并已经联通。

    <div style="display: flex;justify-content: space-between;">
      <img src="/img/%E5%90%AF%E5%8A%A8_1.png" alt=""  style="width: 50%;"  /> 
      <img src="/img/%E5%90%AF%E5%8A%A8_2.png" alt="" style="width: 48%;"/>
    </div>

### 2.3 步骤三：安装Workbench

1. 进入iotdb-Workbench-`<version>`的config目录

2. 修改Workbench配置文件：进入`config`文件夹下修改配置文件`application-prod.properties`。若您是在本机安装则无需修改，若是部署在服务器上则需修改IP地址
    > Workbench可以部署在本地或者云服务器，只要能与 IoTDB 连接即可

   | 配置项           | 修改前                            | 修改后                                 |
      | ---------------- | --------------------------------- | -------------------------------------- |
      | pipe.callbackUrl | pipe.callbackUrl=`http://127.0.0.1` | pipe.callbackUrl=`http://<部署Workbench的IP地址>` |

    ![](/img/workbench-conf-1.png)

3. 启动程序：请在IoTDB-Workbench-`<version>`的sbin文件夹下执行启动命令

    Windows版：
    ```shell
    # 后台启动Workbench
    start.bat -d
    ``` 

    Linux版：
    ```shell
    # 后台启动Workbench
    ./start.sh -d
    ```

4. 可以通过`jps`命令进行启动是否成功，如图所示即为启动成功：

   ![](/img/windows-jps.png)

5. 验证是否成功：浏览器中打开:"`http://服务器ip:配置文件中端口`"进行访问，例如:"`http://127.0.0.1:9190`"，当出现登录界面时即为成功

    ![](/img/workbench.png)


## 3. 附录：IoTDB与控制台版本对照表

| **控制台版本号** | **版本说明**                                               | **可支持IoTDB版本**    |
|------------|--------------------------------------------------------|-------------------|
| V2.0.1-beta  | V2.x系列首个版本，支持树、表双模型                                    | V2.0 及以上版本，AI分析模块仅支持2.0.5以上版本       |
| V1.5.7    | 优化测点列表中测点名称拆分为设备名称和测点，测点选择区域支持左右滚动，以及导出文件列顺序与页面保持一致    | V1.3.4及以上的1.x系列版本  |
| V1.5.6     | 优化 CSV 格式导入导出功能：导入时，支持标签、别名为非必填项；导出时，支持测点描述里反引号包裹引号的场景 | V1.3.4及以上的1.x系列版本 |
| V1.5.5     | 新增服务器时钟，支持企业版激活数据库                                     | V1.3.4及以上的1.x系列版本 |
| V1.5.4     | 新增实例管理中prometheus设置的认证功能                               | V1.3.4及以上的1.x系列版本 |
| V1.5.1     | 新增AI分析功能以及模式匹配功能                                       | V1.3.2及以上的1.x系列版本 |
| V1.4.0     | 新增树模型展示及英文版                                            | V1.3.2及以上的1.x系列版本 |
| V1.3.1     | 分析功能新增分析方式，优化导入模版等功能                                   | V1.3.2及以上的1.x系列版本 |
| V1.3.0     | 新增数据库配置功能，优化部分版本细节                                     | V1.3.2及以上的1.x系列版本 |
| V1.2.6     | 优化各模块权限控制功能                                            | V1.3.1及以上的1.x系列版本 |
| V1.2.5     | 可视化功能新增“常用模版”概念，所有界面优化补充页面缓存等功能                        | V1.3.0及以上的1.x系列版本 |
| V1.2.4     | 计算功能新增“导入、导出”功能，测点列表新增“时间对齐”字段                         | V1.2.2及以上的1.x系列版本 |
| V1.2.3     | 首页新增“激活详情”，新增分析等功能                                     | V1.2.2及以上的1.x系列版本 |
| V1.2.2     | 优化“测点描述”展示内容等功能                                        | V1.2.2及以上的1.x系列版本 |
| V1.2.1     | 数据同步界面新增“监控面板”，优化Prometheus提示信息                        | V1.2.2及以上的1.x系列版本 |
| V1.2.0     | 全新Workbench版本升级                                        | V1.2.0及以上的1.x系列版本 |
