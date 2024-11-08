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
# Docker Deployment

## Environmental Preparation

### Docker Installation

```SQL
#Taking Ubuntu as an example, other operating systems can search for installation methods themselves
#step1: Install some necessary system tools
sudo apt-get update
sudo apt-get -y install apt-transport-https ca-certificates curl software-properties-common
#step2: Install GPG certificate
curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo apt-key add -
#step3: Write software source information
sudo add-apt-repository "deb [arch=amd64] https://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable"
#step4: Update and install Docker CE
sudo apt-get -y update
sudo apt-get -y install docker-ce
#step5: Set Docker to start automatically upon startup
sudo systemctl enable docker
#step6： Verify if Docker installation is successful
docker --version  #Display version information, indicating successful installation
```

### Docker-compose Installation

```SQL
#Installation command
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s  /usr/local/bin/docker-compose  /usr/bin/docker-compose
#Verify if the installation was successful
docker-compose --version  #Displaying version information indicates successful installation
```

## Stand-Alone Deployment

This section demonstrates how to deploy a standalone Docker version of 1C1D.

### Pull Image File

The Docker image of Apache IoTDB has been uploaded tohttps://hub.docker.com/r/apache/iotdb。

Taking obtaining version 1.3.2 as an example, pull the image command:

```bash
docker pull apache/iotdb:1.3.2-standalone
```

View image:

```bash
docker images
```

![](https://alioss.timecho.com/docs/img/%E5%BC%80%E6%BA%90-%E6%8B%89%E5%8F%96%E9%95%9C%E5%83%8F.PNG)

### Create Docker Bridge Network

```Bash
docker network create --driver=bridge --subnet=172.18.0.0/16 --gateway=172.18.0.1  iotdb
```

### Write The Yml File For Docker-Compose

Here we take the example of consolidating the IoTDB installation directory and yml files in the/docker iotdb folder:

The file directory structure is:`/docker-iotdb/iotdb`, `/docker-iotdb/docker-compose-standalone.yml `

```bash
docker-iotdb：
├── iotdb  #Iotdb installation directory
│── docker-compose-standalone.yml #YML file for standalone Docker Composer
```

The complete docker-compose-standalone.yml content is as follows:

```bash
version: "3"
services:
  iotdb-service:
    image: apache/iotdb:1.3.2-standalone #The image used
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
        - ./iotdb/data:/iotdb/data
        - ./iotdb/logs:/iotdb/logs
        - /dev/mem:/dev/mem:ro
    networks:
      iotdb:
        ipv4_address: 172.18.0.6
networks:
  iotdb:
    external: true
```

### Start IoTDB

Use the following command to start:

```bash
cd　/docker-iotdb
docker-compose -f docker-compose-standalone.yml up  -d  #Background startup
```

### Validate Deployment

- Viewing the log, the following words indicate successful startup

```SQL
docker logs -f iotdb-datanode #View log command
2024-07-21 08:22:38,457 [main] INFO  o.a.i.db.service.DataNode:227 - Congratulations, IoTDB DataNode is set up successfully. Now, enjoy yourself!
```

![](https://alioss.timecho.com/docs/img/%E5%BC%80%E6%BA%90-%E9%AA%8C%E8%AF%81%E9%83%A8%E7%BD%B2.png)

- Enter the container to view the service running status and activation information 

View the launched container

```SQL
docker ps
```

![](https://alioss.timecho.com/docs/img/%E5%BC%80%E6%BA%90-%E9%AA%8C%E8%AF%81%E9%83%A8%E7%BD%B22.png)

Enter the container, log in to the database through CLI, and use the `show cluster` command to view the service status and activation status

```SQL
docker exec -it iotdb   /bin/bash        #Entering the container
./start-cli.sh -h iotdb                  #Log in to the database
IoTDB> show cluster                      #View status
```

You can see that all services are running and the activation status shows as activated.

![](https://alioss.timecho.com/docs/img/%E5%BC%80%E6%BA%90-%E9%AA%8C%E8%AF%81%E9%83%A8%E7%BD%B23.png)

### Map/conf Directory (optional)

If you want to directly modify the configuration file in the physical machine in the future, you can map the/conf folder in the container in three steps:

Step 1: Copy the /conf directory from the container to `/docker-iotdb/iotdb/conf`

```bash
docker cp iotdb:/iotdb/conf /docker-iotdb/iotdb/conf
```

Step 2: Add mappings in docker-compose-standalone.yml

```bash
    volumes:
        - ./iotdb/conf:/iotdb/conf   #Add mapping for this/conf folder
        - ./iotdb/data:/iotdb/data
        - ./iotdb/logs:/iotdb/logs
        - /dev/mem:/dev/mem:ro
```

Step 3: Restart IoTDB

```bash
docker-compose  -f docker-compose-standalone.yml  up  -d
```

## Cluster Deployment

This section describes how to manually deploy an instance that includes 3 Config Nodes and 3 Data Nodes, commonly known as a 3C3D cluster.

<div align="center">
    <img src="https://alioss.timecho.com/docs/img/20240705141552.png" alt="" style="width: 60%;"/>
</div>

**Note: The cluster version currently only supports host and overlay networks, and does not support bridge networks.**

Taking the host network as an example, we will demonstrate how to deploy a 3C3D cluster.

### Set Host Name

Assuming there are currently three Linux servers, the IP addresses and service role assignments are as follows:

| Node IP     | Host Name | Service              |
| ----------- | --------- | -------------------- |
| 192.168.1.3 | iotdb-1   | ConfigNode、DataNode |
| 192.168.1.4 | iotdb-2   | ConfigNode、DataNode |
| 192.168.1.5 | iotdb-3   | ConfigNode、DataNode |

Configure the host names on three machines separately. To set the host names, configure `/etc/hosts` on the target server using the following command:

```Bash
echo "192.168.1.3  iotdb-1"  >> /etc/hosts
echo "192.168.1.4  iotdb-2"  >> /etc/hosts
echo "192.168.1.5  iotdb-3"  >> /etc/hosts 
```

### Pull Image File

The Docker image of Apache IoTDB has been uploaded tohttps://hub.docker.com/r/apache/iotdb。

Pull IoTDB images from three servers separately, taking version 1.3.2 as an example. The pull image command is:

```SQL
docker pull apache/iotdb:1.3.2-standalone
```

View image:

```SQL
docker images
```

![](https://alioss.timecho.com/docs/img/%E5%BC%80%E6%BA%90-%E9%9B%86%E7%BE%A4%E7%89%881.png)

### Write The Yml File For Docker Compose

Here we take the example of consolidating the IoTDB installation directory and yml files in the `/docker-iotdb` folder:

The file directory structure is :`/docker-iotdb/iotdb`,  `/docker-iotdb/confignode.yml`，`/docker-iotdb/datanode.yml`

```SQL
docker-iotdb：
├── confignode.yml #Yml file of confignode
├── datanode.yml   #Yml file of datanode
└── iotdb          #IoTDB installation directory
```

On each server, two yml files need to be written, namely confignnode. yml and datanode. yml. The example of yml is as follows:

**confignode.yml：**

```bash
#confignode.yml
version: "3"
services:
  iotdb-confignode:
    image: iotdb-enterprise:1.3.2.3-standalone #The image used
    hostname: iotdb-1|iotdb-2|iotdb-3 #Choose from three options based on the actual situation
    container_name: iotdb-confignode
    command: ["bash", "-c", "entrypoint.sh confignode"]
    restart: always
    environment:
      - cn_internal_address=iotdb-1|iotdb-2|iotdb-3 #Choose from three options based on the actual situation
      - cn_internal_port=10710
      - cn_consensus_port=10720
      - cn_seed_config_node=iotdb-1:10710   #The default first node is the seed node
      - schema_replication_factor=3         #Number of metadata copies
      - data_replication_factor=2           #Number of data replicas
    privileged: true
    volumes:
      - ./iotdb/activation:/iotdb/activation
      - ./iotdb/data:/iotdb/data
      - ./iotdb/logs:/iotdb/logs
      - /usr/sbin/dmidecode:/usr/sbin/dmidecode:ro
      - /dev/mem:/dev/mem:ro
    network_mode: "host"    #Using the host network
```

**datanode.yml：**

```bash
#datanode.yml
version: "3"
services:
  iotdb-datanode:
    image: iotdb-enterprise:1.3.2.3-standalone #The image used
    hostname: iotdb-1|iotdb-2|iotdb-3 #Choose from three options based on the actual situation
    container_name: iotdb-datanode
    command: ["bash", "-c", "entrypoint.sh datanode"]
    restart: always
    ports:
      - "6667:6667"
    privileged: true
    environment:
      - dn_rpc_address=iotdb-1|iotdb-2|iotdb-3 #Choose from three options based on the actual situation
      - dn_internal_address=iotdb-1|iotdb-2|iotdb-3 #Choose from three options based on the actual situation
      - dn_seed_config_node=iotdb-1:10710      #The default first node is the seed node
      - dn_rpc_port=6667
      - dn_internal_port=10730
      - dn_mpp_data_exchange_port=10740
      - dn_schema_region_consensus_port=10750
      - dn_data_region_consensus_port=10760
      - schema_replication_factor=3         #Number of metadata copies
      - data_replication_factor=2           #Number of data replicas
    volumes:
      - ./iotdb/activation:/iotdb/activation
      - ./iotdb/data:/iotdb/data
      - ./iotdb/logs:/iotdb/logs
      - /usr/sbin/dmidecode:/usr/sbin/dmidecode:ro
      - /dev/mem:/dev/mem:ro
    network_mode: "host"   #Using the host network
```

### Starting Confignode For The First Time

First, start configNodes on each of the three servers to obtain the machine code. Pay attention to the startup order, start the first iotdb-1 first, then start iotdb-2 and iotdb-3.

```bash
cd　/docker-iotdb
docker-compose -f confignode.yml up  -d #Background startup
```

### Start Datanode

Start datanodes on 3 servers separately

```SQL
cd /docker-iotdb
docker-compose  -f  datanode.yml  up -d #Background startup
```

![](https://alioss.timecho.com/docs/img/%E5%BC%80%E6%BA%90-%E9%9B%86%E7%BE%A4%E7%89%882.png)

### Validate Deployment

- Viewing the logs, the following words indicate that the datanode has successfully started

    ```SQL
    docker logs -f iotdb-datanode #View log command
    2024-07-21 09:40:58,120 [main] INFO  o.a.i.db.service.DataNode:227 - Congratulations, IoTDB DataNode is set up successfully. Now, enjoy yourself!
    ```

    ![](https://alioss.timecho.com/docs/img/%E5%BC%80%E6%BA%90-%E9%9B%86%E7%BE%A4%E7%89%883.png)

- Enter any container to view the service running status and activation information

    View the launched container

    ```SQL
    docker ps
    ```

    ![](https://alioss.timecho.com/docs/img/%E5%BC%80%E6%BA%90-%E9%9B%86%E7%BE%A4%E7%89%884.png)

    Enter the container, log in to the database through CLI, and use the `show cluster` command to view the service status and activation status

    ```SQL
    docker exec -it iotdb-datanode /bin/bash #Entering the container
    ./start-cli.sh -h iotdb-1                #Log in to the database
    IoTDB> show cluster                      #View status
    ```

    You can see that all services are running and the activation status shows as activated.

    ![](https://alioss.timecho.com/docs/img/%E5%BC%80%E6%BA%90-%E9%9B%86%E7%BE%A4%E7%89%885.png)

### Map/conf Directory (optional)

If you want to directly modify the configuration file in the physical machine in the future, you can map the/conf folder in the container in three steps:

Step 1: Copy the `/conf` directory from the container to `/docker-iotdb/iotdb/conf` on each of the three servers

```bash
docker cp iotdb-confignode:/iotdb/conf /docker-iotdb/iotdb/conf
or
docker cp iotdb-datanode:/iotdb/conf   /docker-iotdb/iotdb/conf 
```

Step 2: Add `/conf` directory mapping in `confignode.yml` and `datanode. yml` on 3 servers

```bash
#confignode.yml
    volumes:
      - ./iotdb/conf:/iotdb/conf  #Add mapping for this /conf folder
      - ./iotdb/data:/iotdb/data
      - ./iotdb/logs:/iotdb/logs
      - /dev/mem:/dev/mem:ro

#datanode.yml
    volumes:
      - ./iotdb/conf:/iotdb/conf   #Add mapping for this /conf folder
      - ./iotdb/data:/iotdb/data
      - ./iotdb/logs:/iotdb/logs
      - /dev/mem:/dev/mem:ro
```

Step 3: Restart IoTDB on 3 servers

```bash
cd /docker-iotdb
docker-compose  -f confignode.yml  up  -d
docker-compose  -f datanode.yml    up  -d
```