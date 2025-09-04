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

## 1. Environment Preparation

### 1.1  Install Docker

```Bash
#Taking Ubuntu as an example. For other operating systems, you can search for installation methods on your own.
#step1: Install necessary system tools
sudo apt-get update
sudo apt-get -y install apt-transport-https ca-certificates curl software-properties-common
#step2: Install GPG certificate
curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo apt-key add -
#step3: Add the software source
sudo add-apt-repository "deb [arch=amd64] https://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable"
#step4: Update and install Docker CE
sudo apt-get -y update
sudo apt-get -y install docker-ce
#step5: Set Docker to start automatically on boot
sudo systemctl enable docker
#step6: Verify if Docker is installed successfully
docker --version  #Display version information, indicating successful installation.
```

### 1.2 Install Docker Compose

```Bash
#Installation command
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s  /usr/local/bin/docker-compose  /usr/bin/docker-compose
#Verify the installation
docker-compose --version  #Display version information, indicating successful installation.
```

## 2. Stand-Alone Deployment

This section demonstrates how to deploy a standalone Docker version of 1C1D.


### 2.1 Pull Image File

The Docker image of Apache IoTDB has been uploaded to https://hub.docker.com/r/apache/iotdb.

Taking obtaining version 1.3.2 as an example, pull the image command:

```bash
docker pull apache/iotdb:1.3.2-standalone
```

View image:

```bash
docker images
```

![](/img/%E5%BC%80%E6%BA%90-%E6%8B%89%E5%8F%96%E9%95%9C%E5%83%8F.png)

### 2.2 Create a Docker Bridge Network

```Bash
docker network create --driver=bridge --subnet=172.18.0.0/16 --gateway=172.18.0.1  iotdb
```

### 2.3 Write the Docker-Compose YML File

Assume the IoTDB installation directory and the YML file are placed under the `/docker-iotdb` folder. The directory structure is as follows:`docker-iotdb/iotdb`, `/docker-iotdb/docker-compose-standalone.yml`

```Bash
docker-iotdb：
├── iotdb  #Iotdb installation directory
│── docker-compose-standalone.yml #YML file for standalone Docker Composer
```

The complete content of `docker-compose-standalone.yml` is as follows:

```Bash
version: "3"
services:
  iotdb-service:
    image: apache/iotdb:latest #The image used
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

### 2.4 First Startup

Use the following command to start:

```Bash
cd　/docker-iotdb
docker-compose -f docker-compose-standalone.yml up
```


### 2.5 Verify the Deployment

- Viewing the log, the following words indicate successful startup

```SQL
docker logs -f iotdb-datanode #View log command
2024-07-21 08:22:38,457 [main] INFO  o.a.i.db.service.DataNode:227 - Congratulations, IoTDB DataNode is set up successfully. Now, enjoy yourself!
```

![](/img/%E5%BC%80%E6%BA%90-%E9%AA%8C%E8%AF%81%E9%83%A8%E7%BD%B2.png)

- Enter the container to view the service running status and activation information 

View the launched container

```SQL
docker ps
```

![](/img/%E5%BC%80%E6%BA%90-%E9%AA%8C%E8%AF%81%E9%83%A8%E7%BD%B22.png)

Enter the container, log in to the database through CLI, and use the `show cluster` command to view the service status and activation status

```SQL
docker exec -it iotdb   /bin/bash        #Entering the container
./start-cli.sh -sql_dialect table -h iotdb                  #Log in to the database
IoTDB> show cluster                      #View status
```

You can see that all services are running and the activation status shows as activated.

![](/img/%E5%BC%80%E6%BA%90-%E9%AA%8C%E8%AF%81%E9%83%A8%E7%BD%B23.png)

### 2.6 Map the `/conf` Directory (Optional)


If you want to modify configuration files directly on the physical machine, you can map the `/conf` folder from the container. Follow these steps:

**Step 1**: Copy the `/conf` directory from the container to `/docker-iotdb/iotdb/conf`:

```Bash
docker cp iotdb:/iotdb/conf /docker-iotdb/iotdb/conf
```

**Step 2**: Add the mapping in `docker-compose-standalone.yml`:

```bash
    volumes:
        - ./iotdb/conf:/iotdb/conf   #Add mapping for this/conf folder
        - ./iotdb/data:/iotdb/data
        - ./iotdb/logs:/iotdb/logs
```

**Step 3**: Restart IoTDB:

```Bash
docker-compose  -f docker-compose-standalone.yml  up  -d
```

## 3. Cluster Deployment

This section describes how to manually deploy a cluster consisting of 3 ConfigNodes and 3 DataNodes, commonly referred to as a 3C3D cluster.

<div align="center">
    <img src="/img/20240705141552.png" alt="" style="width: 60%;"/>
</div>

**Note: The cluster version currently only supports host and overlay networks, and does not support bridge networks.** 

Below, we demonstrate how to deploy a 3C3D cluster using the host network as an example.

### 3.1 Set Hostnames

Assume there are 3 Linux servers with the following IP addresses and service roles: 

| Node IP     | Hostname | Services             |
| :---------- | :------- | :------------------- |
| 192.168.1.3 | iotdb-1  | ConfigNode, DataNode |
| 192.168.1.4 | iotdb-2  | ConfigNode, DataNode |
| 192.168.1.5 | iotdb-3  | ConfigNode, DataNode |

On each of the 3 machines, configure the hostnames by editing the `/etc/hosts` file. Use the following commands:

```Bash
echo "192.168.1.3  iotdb-1"  >> /etc/hosts
echo "192.168.1.4  iotdb-2"  >> /etc/hosts
echo "192.168.1.5  iotdb-3"  >> /etc/hosts 
```

### 3.2 Load the Image File

The Docker image of Apache IoTDB has been uploaded tohttps://hub.docker.com/r/apache/iotdb。

Pull IoTDB images from three servers separately, taking version 1.3.2 as an example. The pull image command is:

```SQL
docker pull apache/iotdb:1.3.2-standalone
```

View image:

```SQL
docker images
```

![](/img/%E5%BC%80%E6%BA%90-%E9%9B%86%E7%BE%A4%E7%89%881.png)

### 3.3. Write the Docker-Compose YML Files

Here, we assume the IoTDB installation directory and YML files are placed under the `/docker-iotdb` folder. The directory structure is as follows:

```Bash
docker-iotdb：
├── confignode.yml #ConfigNode YML file 
├── datanode.yml   #DataNode YML file  
└── iotdb          #IoTDB installation directory 
```

On each server, create two YML files: `confignode.yml` and `datanode.yml`. Examples are provided below:

**confignode.yml：**

```Bash
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
    network_mode: "host"    #Using the host network
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
    network_mode: "host"   #Using the host network
    # Note: Some environments set an extremely high container nofile limit (~2^30 = 1073741824).
    # This can make the startup step "Checking whether the ports are already occupied..." appear to hang (lsof slow).
    # If you see that line for a long time, lower the nofile limit by uncommenting below:
    # ulimits:
    #   nofile:
    #     soft: 1048576
    #     hard: 1048576
```

### 3.4 Start ConfigNode for the First Time

Start the ConfigNode on all 3 servers. **Note the startup order**: Start `iotdb-1` first, followed by `iotdb-2` and `iotdb-3`.

Run the following command on each server:

```Bash
cd　/docker-iotdb
docker-compose -f confignode.yml up  -d #Background startup
```

### 3.5 Start DataNode

Start the DataNode on all 3 servers: 

```Bash
cd /docker-iotdb
docker-compose  -f  datanode.yml  up -d #Background startup
```

![](/img/%E5%BC%80%E6%BA%90-%E9%9B%86%E7%BE%A4%E7%89%882.png)

### 3.6  Verify Deployment

- Check the logs: If you see the following message, the DataNode has started successfully.

    ```SQL
    docker logs -f iotdb-datanode #View log command
    2024-07-21 09:40:58,120 [main] INFO  o.a.i.db.service.DataNode:227 - Congratulations, IoTDB DataNode is set up successfully. Now, enjoy yourself!
    ```

    ![](/img/%E5%BC%80%E6%BA%90-%E9%9B%86%E7%BE%A4%E7%89%883.png)

- Enter the container and check the service status:

    View the launched container

    ```SQL
    docker ps
    ```

    ![](/img/%E5%BC%80%E6%BA%90-%E9%9B%86%E7%BE%A4%E7%89%884.png)

    Enter any container, log in to the database via CLI, and use the `show cluster` command to check the service status:

    ```SQL
    docker exec -it iotdb-datanode /bin/bash #Entering the container
    ./start-cli.sh -sql_dialect table -h iotdb-1                #Log in to the database
    IoTDB> show cluster                      #View status
    ```

    If all services are in the `running` state, the IoTDB deployment is successful.

    ![](/img/%E5%BC%80%E6%BA%90-%E9%9B%86%E7%BE%A4%E7%89%885.png)

### 3.7 Map the `/conf` Directory (Optional)

If you want to modify configuration files directly on the physical machine, you can map the `/conf` folder from the container. Follow these steps:

**Step 1**: Copy the `/conf` directory from the container to `/docker-iotdb/iotdb/conf` on all 3 servers:

```Bash
docker cp iotdb-confignode:/iotdb/conf /docker-iotdb/iotdb/conf
or
docker cp iotdb-datanode:/iotdb/conf   /docker-iotdb/iotdb/conf 
```

**Step 2**: Add the `/conf` directory mapping in both `confignode.yml` and `datanode.yml` on all 3 servers:

```bash
#confignode.yml
    volumes:
      - ./iotdb/conf:/iotdb/conf  #Add mapping for this /conf folder
      - ./iotdb/data:/iotdb/data
      - ./iotdb/logs:/iotdb/logs

#datanode.yml
    volumes:
      - ./iotdb/conf:/iotdb/conf   #Add mapping for this /conf folder
      - ./iotdb/data:/iotdb/data
      - ./iotdb/logs:/iotdb/logs
```

**Step 3**: Restart IoTDB on all 3 servers:

```bash
cd /docker-iotdb
docker-compose  -f confignode.yml  up  -d
docker-compose  -f datanode.yml    up  -d
```