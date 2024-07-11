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

可视化控制台是IoTDB配套工具之一。它用于数据库部署实施、运维管理、应用开发各阶段的官方应用工具体系，让数据库的使用、运维和管理更加简单、高效，真正实现数据库低成本的管理和运维。本文档将帮助您安装Workbench。

  <div style="display: flex;justify-content: space-between;">        		
    <img src="https://alioss.timecho.com/docs/img/%E9%A6%96%E9%A1%B5.PNG" alt=" " style="width: 50%;"/>
    <img src="https://alioss.timecho.com/docs/img/%E6%B5%8B%E7%82%B9%E5%88%97%E8%A1%A8.PNG" alt="" style="width: 50%;"/>     
  </div>

## 安装准备

| 准备内容 |           名称            |                           版本要求                           |                        官方链接                        |
| :------: | :-----------------------: | :----------------------------------------------------------: | :----------------------------------------------------: |
| 操作系统 |      Windows或Linux       |                              -                               |                           -                            |
| 安装环境 |            JDK            | 需要 >=   V1.8.0_162（推荐使用 11 或者 17，下载时请根据机器配置选择ARM或x64安装包） |  https://www.oracle.com/java/technologies/downloads/   |
| 相关软件 |        Prometheus         |                        需要 >=V2.30.3                        |            https://prometheus.io/download/             |
|  数据库  |           IoTDB           |                      需要>=V1.2.0企业版                      |               您可联系商务或技术支持获取               |
|  控制台  | IoTDB-Workbench-`<version>`|                              -                               | 您可根据附录版本对照表进行选择后联系商务或技术支持获取 |

## 安装步骤

### 步骤一：IoTDB 开启监控指标采集

1. 打开监控配置项。IoTDB中监控有关的配置项默认是关闭的，在部署监控面板前，您需要打开相关配置项（注意开启监控配置后需要重启服务）。

    <table>
          <tr>
                <th>配置项</th>
                <th>所在配置文件</th>        
                <th>配置说明</th>
          </tr>
          <tr>
                <td>cn_metric_reporter_list</td>   
                <td rowspan="3">conf/iotdb-system.properties</td> 
                <td>将配置项取消注释，值设置为PROMETHEUS</td> 
          </tr>
          <tr>
                <td>cn_metric_level</td>   
                <td>将配置项取消注释，值设置为IMPORTANT</td> 
          </tr>
          <tr>
                <td>cn_metric_prometheus_reporter_port</td>   
                <td>将配置项取消注释，可保持默认设置9091，如设置其他端口，不与其他端口冲突即可</td> 
          </tr>
          <tr>
                <td>dn_metric_reporter_list</td>   
                <td rowspan="4">conf/iotdb-system.properties</td> 
                <td>将配置项取消注释，值设置为PROMETHEUS</td> 
          </tr>
          <tr>
                <td>dn_metric_level</td>   
                <td>将配置项取消注释，值设置为IMPORTANT</td> 
          </tr>
          <tr>
                <td>dn_metric_prometheus_reporter_port</td>   
                <td>将配置项取消注释，可保持默认设置9092，如设置其他端口，不与其他端口冲突即可</td> 
          </tr>
          <tr>
                <td>dn_metric_internal_reporter_type</td>   
                <td>将配置项取消注释，值设置为IOTDB</td> 
          </tr>
          <tr>
                <td>enable_audit_log</td>   
                <td rowspan="3">conf/iotdb-system.properties</td> 
                <td>将配置项取消注释，值设置为true</td> 
          </tr>
          <tr>
                <td>audit_log_storage</td>   
                <td>将配置项取消注释</td> 
          </tr>
          <tr>
                <td>audit_log_operation</td>   
                <td>将配置项取消注释</td> 
          </tr>
    </table>

2. 重启所有节点。修改3个节点的监控指标配置后，可重新启动所有节点的confignode和datanode服务：

    ```shell
    ./sbin/stop-standalone.sh      #先停止confignode和datanode
    ./sbin/start-confignode.sh  -d #启动confignode
    ./sbin/start-datanode.sh  -d   #启动datanode 
    ```

3. 重启后，通过客户端确认各节点的运行状态，若状态都为Running，则为配置成功：

   ![](https://alioss.timecho.com/docs/img/%E5%90%AF%E5%8A%A8.PNG)

### 步骤二：安装、配置Prometheus监控

1. 确保Prometheus安装完成（官方安装说明可参考：https://prometheus.io/docs/introduction/first_steps/）
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

5. 确认启动成功。在浏览器中输入 http://IP:port，进入Prometheus，点击进入Status下的Target界面，当看到State均为Up时表示配置成功并已经联通。

    <div style="display: flex;justify-content: space-between;">
      <img src="https://alioss.timecho.com/docs/img/%E5%90%AF%E5%8A%A8_1.png" alt=""  style="width: 50%;"  /> 
      <img src="https://alioss.timecho.com/docs/img/%E5%90%AF%E5%8A%A8_2.png" alt="" style="width: 48%;"/>
    </div>

### 步骤三：安装Workbench

#### Windows版：

1. 进入iotdb-Workbench-`<version>`的config目录

2. 修改Workbench配置文件：进入`config`文件夹下修改配置文件`application-prod.properties`。若您是在本机安装则无需修改，若是部署在服务器上则需修改IP地址

   | 配置项           | 修改前                            | 修改后                                 |
      | ---------------- | --------------------------------- | -------------------------------------- |
      | pipe.callbackUrl | pipe.callbackUrl=`http://127.0.0.1` | pipe.callbackUrl=`http://<部署的IP地址>` |

    ![](https://alioss.timecho.com/docs/img/windows.png)

1. 启动程序：请在IoTDB-Workbench-`<version>`的sbin文件夹下执行启动命令

    ```shell
    # 后台启动Workbench
    start.bat -d
    ```

4. 可以通过`jps`命令进行启动是否成功，如图所示即为启动成功：

   ![](https://alioss.timecho.com/docs/img/windows-jps.png)

5. 验证是否成功：浏览器中打开:"http://服务器ip:配置文件中端口"进行访问，例如:"http://127.0.0.1:9190"，当出现登录界面时即为成功

    ![](https://alioss.timecho.com/docs/img/windows-success.png)

#### Linux版：

1. 进入IoTDB-Workbench-`<version>`目录

2. 修改Workbench配置：进入`config`文件夹下修改配置文件`application-prod.properties`。若您是在本机安装则无需修改，若是部署在服务器上则需修改IP地址

   | 配置项           | 修改前                            | 修改后                                 |
      | ---------------- | --------------------------------- | -------------------------------------- |
      | pipe.callbackUrl | pipe.callbackUrl=`http://127.0.0.1` | pipe.callbackUrl=`http://<部署的IP地址>` |

    ![](https://alioss.timecho.com/docs/img/linux.png)

3. 启动程序：请在IoTDB-Workbench-`<version>`的sbin文件夹下执行启动命令

    ```shell
    # 后台启动Workbench
    ./start.sh -d
    ```

4. 可以通过`jps`命令进行启动是否成功,如图所示即为启动成功：

    ![](https://alioss.timecho.com/docs/img/linux-jps.png)

5. 验证是否成功：浏览器中打开 "http://服务器ip:配置文件中端口"进行访问，例如:"http://127.0.0.1:9190"，当出现登录界面时即为成功

    ![](https://alioss.timecho.com/docs/img/linux-success.png)

## 附录：IoTDB与控制台版本对照表

| 控制台版本号 | 版本说明                                                     | 可支持IoTDB版本  |
| ------------ | ------------------------------------------------------------ | ---------------- |
| V1.2.6       | 优化各模块权限控制功能                                       | V1.3.1及以上版本 |
| V1.2.5       | 可视化功能新增“常用模版”概念，所有界面优化补充页面缓存等功能 | V1.3.0及以上版本 |
| V1.2.4       | 计算功能新增“导入、导出”功能，测点列表新增“时间对齐”字段     | V1.2.2及以上版本 |
| V1.2.3       | 首页新增“激活详情”，新增分析等功能                           | V1.2.2及以上版本 |
| V1.2.2       | 优化“测点描述”展示内容等功能                                 | V1.2.2及以上版本 |
| V1.2.1       | 数据同步界面新增“监控面板”，优化Prometheus提示信息           | V1.2.2及以上版本 |
| V1.2.0       | 全新Workbench版本升级                                        | V1.2.0及以上版本 |

