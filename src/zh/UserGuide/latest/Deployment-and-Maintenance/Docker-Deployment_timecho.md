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
# Docker部署指导

## 1. 环境准备

### 1.1 Docker安装

```Bash
#以ubuntu为例，其他操作系统可以自行搜索安装方法
#step1: 安装一些必要的系统工具
sudo apt-get update
sudo apt-get -y install apt-transport-https ca-certificates curl software-properties-common
#step2: 安装GPG证书
curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo apt-key add -
#step3: 写入软件源信息
sudo add-apt-repository "deb [arch=amd64] https://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable"
#step4: 更新并安装Docker-CE
sudo apt-get -y update
sudo apt-get -y install docker-ce
#step5: 设置docker开机自启动
sudo systemctl enable docker
#step6： 验证docker是否安装成功
docker --version  #显示版本信息，即安装成功
```

### 1.2 docker-compose安装

```Bash
#安装命令
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s  /usr/local/bin/docker-compose  /usr/bin/docker-compose
#验证是否安装成功
docker-compose --version  #显示版本信息即安装成功
```

### 1.3 安装dmidecode插件

默认情况下，linux服务器应该都已安装，如果没有安装的话，可以使用下面的命令安装。

```Bash
sudo apt-get install dmidecode 
```

dmidecode 安装后，查找安装路径：`whereis dmidecode`，这里假设结果为`/usr/sbin/dmidecode`，记住该路径，后面的docker-compose的yml文件会用到。

### 1.4 获取IoTDB的容器镜像

关于IoTDB企业版的容器镜像您可联系商务或技术支持获取。

## 2. 单机版部署

本节演示如何部署1C1D的docker单机版。

### 2.1 load 镜像文件

比如这里获取的IoTDB的容器镜像文件名是：`iotdb-enterprise-1.3.2.3-standalone-docker.tar.gz`

load镜像：

```Bash
docker load -i iotdb-enterprise-1.3.2.3-standalone-docker.tar.gz
```

查看镜像：

```Bash
docker images
```

![](/img/%E5%8D%95%E6%9C%BA-%E6%9F%A5%E7%9C%8B%E9%95%9C%E5%83%8F.png)

### 2.2 创建docker bridge网络

```Bash
docker network create --driver=bridge --subnet=172.18.0.0/16 --gateway=172.18.0.1  iotdb
```

### 2.3 编写docker-compose的yml文件

这里我们以把IoTDB安装目录和yml文件统一放在`/docker-iotdb` 文件夹下为例：

文件目录结构为：`/docker-iotdb/iotdb`, `/docker-iotdb/docker-compose-standalone.yml `

```Bash
docker-iotdb：
├── iotdb  #iotdb安装目录
│── docker-compose-standalone.yml #单机版docker-compose的yml文件
```

完整的`docker-compose-standalone.yml`内容如下：

```Bash
version: "3"
services:
  iotdb-service:
    image: timecho/timechodb:2.0.2.1-standalone #使用的镜像
    hostname: iotdb
    container_name: iotdb
    restart: always       
    ports:
      - "6667:6667"
    environment:
      - cn_internal_address=iotdb
      - cn_internal_port=10710
      - cn_consensus_port=10720
      - cn_seed_config_node=iotdb:10710
      - dn_rpc_address=iotdb
      - dn_internal_address=iotdb
      - dn_rpc_port=6667
      - dn_internal_port=10730
      - dn_mpp_data_exchange_port=10740
      - dn_schema_region_consensus_port=10750
      - dn_data_region_consensus_port=10760
      - dn_seed_config_node=iotdb:10710
    privileged: true
    volumes:
        - ./iotdb/activation:/iotdb/activation
        - ./iotdb/data:/iotdb/data
        - ./iotdb/logs:/iotdb/logs
        - /usr/sbin/dmidecode:/usr/sbin/dmidecode:ro
        - /dev/mem:/dev/mem:ro
    networks:
      iotdb:
        ipv4_address: 172.18.0.6
    # Note: Some environments set an extremely high container nofile limit (~2^30 = 1073741824).
    # This can make the startup step "Checking whether the ports are already occupied..." appear to hang (lsof slow).
    # If you see that line for a long time, lower the nofile limit by uncommenting below:
    # ulimits:
    #   nofile:
    #     soft: 1048576
    #     hard: 1048576
networks:
  iotdb:
    external: true
```

### 2.4 首次启动

使用下面的命令启动：

```Bash
cd　/docker-iotdb
docker-compose -f docker-compose-standalone.yml up
```

由于没有激活，首次启动时会直接退出，属于正常现象，首次启动是为了获取机器码文件，用于后面的激活流程。

![](/img/%E5%8D%95%E6%9C%BA-%E6%BF%80%E6%B4%BB.png)

### 2.5 申请激活

- 首次启动后，在物理机目录`/docker-iotdb/iotdb/activation`下会生成一个 `system_info`文件，将这个文件拷贝给天谋工作人员。

    ![](/img/%E5%8D%95%E6%9C%BA-%E7%94%B3%E8%AF%B7%E6%BF%80%E6%B4%BB1.png)

- 收到工作人员返回的license文件，将license文件拷贝到`/docker-iotdb/iotdb/activation`文件夹下。

    ![](/img/%E5%8D%95%E6%9C%BA-%E7%94%B3%E8%AF%B7%E6%BF%80%E6%B4%BB2.png)

### 2.6 再次启动IoTDB

```Bash
docker-compose -f docker-compose-standalone.yml up  -d
```

![](/img/%E5%90%AF%E5%8A%A8iotdb.png)

### 2.7 验证部署

- 查看日志，有如下字样，表示启动成功

```Bash
docker logs -f iotdb-datanode #查看日志命令
2024-07-19 12:02:32,608 [main] INFO  o.a.i.db.service.DataNode:231 - Congratulations, IoTDB DataNode is set up successfully. Now, enjoy yourself!
```

![](/img/%E5%8D%95%E6%9C%BA-%E9%AA%8C%E8%AF%81%E9%83%A8%E7%BD%B21.png)

- 进入容器，查看服务运行状态及激活信息

    查看启动的容器

    ```Bash
    docker ps
    ```

    ![](/img/%E5%8D%95%E6%9C%BA-%E9%AA%8C%E8%AF%81%E9%83%A8%E7%BD%B22.png)

    进入容器, 通过cli登录数据库, 使用show cluster命令查看服务状态及激活状态

    ```Bash
    docker exec -it iotdb   /bin/bash        #进入容器
    ./start-cli.sh -h iotdb                  #登录数据库
    IoTDB> show cluster                      #查看状态
    ```

    可以看到服务都是running,激活状态显示已激活。

    ![](/img/%E5%8D%95%E6%9C%BA-%E9%AA%8C%E8%AF%81%E9%83%A8%E7%BD%B23.png)

### 2.8 映射/conf目录(可选)

后续如果想在物理机中直接修改配置文件，可以把容器中的/conf文件夹映射出来，分三步：

步骤一：拷贝容器中的/conf目录到`/docker-iotdb/iotdb/conf`

```Bash
docker cp iotdb:/iotdb/conf /docker-iotdb/iotdb/conf
```

步骤二：在docker-compose-standalone.yml中添加映射

```Bash
    volumes:
        - ./iotdb/conf:/iotdb/conf   #增加这个/conf文件夹的映射
        - ./iotdb/activation:/iotdb/activation
        - ./iotdb/data:/iotdb/data
        - ./iotdb/logs:/iotdb/logs
        - /usr/sbin/dmidecode:/usr/sbin/dmidecode:ro
        - /dev/mem:/dev/mem:ro
```

步骤三：重新启动IoTDB

```Bash
docker-compose  -f docker-compose-standalone.yml  up  -d
```

## 3. 集群版部署

本小节描述如何手动部署包括3个ConfigNode和3个DataNode的实例，即通常所说的3C3D集群。

<div align="center">
    <img src="/img/%E9%9B%86%E7%BE%A4%E9%83%A8%E7%BD%B2.png" alt="" style="width: 60%;"/>
</div>

**注意：集群版目前只支持host网络和overlay 网络，不支持bridge网络。**

下面以host网络为例演示如何部署3C3D集群。

### 3.1 设置主机名

假设现在有3台linux服务器，IP地址和服务角色分配如下：

| 节点ip      | 主机名  | 服务                 |
| ----------- | ------- | -------------------- |
| 192.168.1.3 | iotdb-1 | ConfigNode、DataNode |
| 192.168.1.4 | iotdb-2 | ConfigNode、DataNode |
| 192.168.1.5 | iotdb-3 | ConfigNode、DataNode |

在3台机器上分别配置主机名，设置主机名需要在目标服务器上配置/etc/hosts，使用如下命令：

```Bash
echo "192.168.1.3  iotdb-1"  >> /etc/hosts
echo "192.168.1.4  iotdb-2"  >> /etc/hosts
echo "192.168.1.5  iotdb-3"  >> /etc/hosts 
```

### 3.2 load镜像文件

比如获取的IoTDB的容器镜像文件名是：`iotdb-enterprise-1.3.2.3-standalone-docker.tar.gz`

在3台服务器上分别执行load镜像命令：

```Bash
docker load -i iotdb-enterprise-1.3.2.3-standalone-docker.tar.gz
```

查看镜像：

```Bash
docker images
```

![](/img/%E9%95%9C%E5%83%8F%E5%8A%A0%E8%BD%BD.png)

### 3.3 编写docker-compose的yml文件

这里我们以把IoTDB安装目录和yml文件统一放在/docker-iotdb文件夹下为例：

文件目录结构为：`/docker-iotdb/iotdb`，`/docker-iotdb/confignode.yml`，`/docker-iotdb/datanode.yml`

```Bash
docker-iotdb：
├── confignode.yml #confignode的yml文件
├── datanode.yml   #datanode的yml文件
└── iotdb          #IoTDB安装目录
```

在每台服务器上都要编写2个yml文件，即`confignode.yml`和`datanode.yml`，yml示例如下：

**confignode.yml：**

```Bash
#confignode.yml
version: "3"
services:
  iotdb-confignode:
    image: iotdb-enterprise:1.3.2.3-standalone #使用的镜像
    hostname: iotdb-1|iotdb-2|iotdb-3 #根据实际情况选择，三选一
    container_name: iotdb-confignode
    command: ["bash", "-c", "entrypoint.sh confignode"]
    restart: always
    environment:
      - cn_internal_address=iotdb-1|iotdb-2|iotdb-3 #根据实际情况选择，三选一
      - cn_internal_port=10710
      - cn_consensus_port=10720
      - cn_seed_config_node=iotdb-1:10710   #默认第一台为seed节点
      - schema_replication_factor=3         #元数据副本数
      - data_replication_factor=2           #数据副本数
    privileged: true
    volumes:
      - ./iotdb/activation:/iotdb/activation
      - ./iotdb/data:/iotdb/data
      - ./iotdb/logs:/iotdb/logs
      - /usr/sbin/dmidecode:/usr/sbin/dmidecode:ro
      - /dev/mem:/dev/mem:ro
    network_mode: "host"    #使用host网络
    # Note: Some environments set an extremely high container nofile limit (~2^30 = 1073741824).
    # This can make the startup step "Checking whether the ports are already occupied..." appear to hang (lsof slow).
    # If you see that line for a long time, lower the nofile limit by uncommenting below:
    # ulimits:
    #   nofile:
    #     soft: 1048576
    #     hard: 1048576
```

**datanode.yml：**

```Bash
#datanode.yml
version: "3"
services:
  iotdb-datanode:
    image: iotdb-enterprise:1.3.2.3-standalone #使用的镜像
    hostname: iotdb-1|iotdb-2|iotdb-3 #根据实际情况选择，三选一
    container_name: iotdb-datanode
    command: ["bash", "-c", "entrypoint.sh datanode"]
    restart: always
    ports:
      - "6667:6667"
    privileged: true
    environment:
      - dn_rpc_address=iotdb-1|iotdb-2|iotdb-3 #根据实际情况选择，三选一
      - dn_internal_address=iotdb-1|iotdb-2|iotdb-3 #根据实际情况选择，三选一
      - dn_seed_config_node=iotdb-1:10710      #默认第1台为seed节点
      - dn_rpc_port=6667
      - dn_internal_port=10730
      - dn_mpp_data_exchange_port=10740
      - dn_schema_region_consensus_port=10750
      - dn_data_region_consensus_port=10760
      - schema_replication_factor=3         #元数据副本数
      - data_replication_factor=2           #数据副本数
    volumes:
      - ./iotdb/activation:/iotdb/activation
      - ./iotdb/data:/iotdb/data
      - ./iotdb/logs:/iotdb/logs
      - /usr/sbin/dmidecode:/usr/sbin/dmidecode:ro
      - /dev/mem:/dev/mem:ro
    network_mode: "host"   #使用host网络
    # Note: Some environments set an extremely high container nofile limit (~2^30 = 1073741824).
    # This can make the startup step "Checking whether the ports are already occupied..." appear to hang (lsof slow).
    # If you see that line for a long time, lower the nofile limit by uncommenting below:
    # ulimits:
    #   nofile:
    #     soft: 1048576
    #     hard: 1048576
```

### 3.4 首次启动confignode

先在3台服务器上分别启动confignode, 用来获取机器码，注意启动顺序，先启动第1台iotdb-1,再启动iotdb-2和iotdb-3。

```Bash
cd　/docker-iotdb
docker-compose -f confignode.yml up  -d #后台启动
```

### 3.5 申请激活

- 首次启动3个confignode后，在每个物理机目录`/docker-iotdb/iotdb/activation`下都会生成一个`system_info`文件，将3个服务器的`system_info`文件拷贝给天谋工作人员；

  ![](/img/%E5%8D%95%E6%9C%BA-%E7%94%B3%E8%AF%B7%E6%BF%80%E6%B4%BB1.png)

- 将3个license文件分别放入对应的ConfigNode节点的`/docker-iotdb/iotdb/activation`文件夹下；

  ![](/img/%E5%8D%95%E6%9C%BA-%E7%94%B3%E8%AF%B7%E6%BF%80%E6%B4%BB2.png)

- license放入对应的activation文件夹后，confignode会自动激活，不用重启confignode

### 3.6 启动datanode

在3台服务器上分别启动datanode

```Bash
cd /docker-iotdb
docker-compose  -f  datanode.yml  up -d #后台启动
```

![](/img/%E9%9B%86%E7%BE%A4%E7%89%88-dn%E5%90%AF%E5%8A%A8.png)

### 3.7 验证部署

- 查看日志，有如下字样，表示datanode启动成功

    ```Bash
    docker logs -f iotdb-datanode #查看日志命令
    2024-07-20 16:50:48,937 [main] INFO  o.a.i.db.service.DataNode:231 - Congratulations, IoTDB DataNode is set up successfully. Now, enjoy yourself!
    ```

    ![](/img/dn%E5%90%AF%E5%8A%A8.png)

- 进入任意一个容器，查看服务运行状态及激活信息

    查看启动的容器

    ```Bash
    docker ps
    ```

    ![](/img/%E6%9F%A5%E7%9C%8B%E5%AE%B9%E5%99%A8.png)

    进入容器,通过cli登录数据库,使用`show cluster`命令查看服务状态及激活状态

    ```Bash
    docker exec -it iotdb-datanode /bin/bash #进入容器
    ./start-cli.sh -h iotdb-1                #登录数据库
    IoTDB> show cluster                      #查看状态
    ```

    可以看到服务都是running,激活状态显示已激活。

    ![](/img/%E9%9B%86%E7%BE%A4-%E6%BF%80%E6%B4%BB.png)

### 3.8 映射/conf目录(可选)

后续如果想在物理机中直接修改配置文件，可以把容器中的/conf文件夹映射出来，分三步：

步骤一：在3台服务器中分别拷贝容器中的/conf目录到`/docker-iotdb/iotdb/conf`

```Bash
docker cp iotdb-confignode:/iotdb/conf /docker-iotdb/iotdb/conf
或者
docker cp iotdb-datanode:/iotdb/conf   /docker-iotdb/iotdb/conf 
```

步骤二：在3台服务器的`confignode.yml`和`datanode.yml`中添加/conf目录映射

```Bash
#confignode.yml
    volumes:
      - ./iotdb/conf:/iotdb/conf  #增加这个/conf文件夹的映射
      - ./iotdb/activation:/iotdb/activation
      - ./iotdb/data:/iotdb/data
      - ./iotdb/logs:/iotdb/logs
      - /usr/sbin/dmidecode:/usr/sbin/dmidecode:ro
      - /dev/mem:/dev/mem:ro

#datanode.yml
    volumes:
      - ./iotdb/conf:/iotdb/conf   #增加这个/conf文件夹的映射
      - ./iotdb/activation:/iotdb/activation
      - ./iotdb/data:/iotdb/data
      - ./iotdb/logs:/iotdb/logs
      - /usr/sbin/dmidecode:/usr/sbin/dmidecode:ro
      - /dev/mem:/dev/mem:ro
```

步骤三：在3台服务器上重新启动IoTDB

```Bash
cd /docker-iotdb
docker-compose  -f confignode.yml  up  -d
docker-compose  -f datanode.yml    up  -d
```