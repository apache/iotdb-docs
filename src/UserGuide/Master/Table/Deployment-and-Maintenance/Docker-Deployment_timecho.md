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

### 1.3 Install dmidecode

By default, Linux servers should already have dmidecode. If not, you can use the following command to install it.

```Bash
sudo apt-get install dmidecode 
```

After installing `dmidecode`, you can locate its installation path by running:`whereis dmidecode`. Assuming the result is `/usr/sbin/dmidecode`, please remember this path as it will be used in the YML file of Docker Compose later.

### 1.4 Obtain the Container Image

For the TimechoDB container image, you can contact the Timecho team to acquire it.

## 2. Stand-Alone Deployment

This section demonstrates how to deploy a standalone Docker version of 1C1D.

### 2.1 Load the Image File

For example, if the IoTDB container image file you obtained is named: `iotdb-enterprise-2.0.x.x-standalone-docker.tar.gz`, use the following command to load the image：

```Bash
docker load -i iotdb-enterprise-2.0.x.x-standalone-docker.tar.gz
```

To view the loaded image, use the following command:

```Bash
docker images
```

![](/img/%E5%8D%95%E6%9C%BA-%E6%9F%A5%E7%9C%8B%E9%95%9C%E5%83%8F.png)

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
    image: timecho/timechodb:2.0.2.1-standalone #The image used
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

### 2.4 First Startup

Use the following command to start:

```Bash
cd　/docker-iotdb
docker-compose -f docker-compose-standalone.yml up
```

Since the system is not activated yet, it will exit immediately after the first startup, which is normal. The purpose of the first startup is to generate the machine code file for the activation process.

![](/img/%E5%8D%95%E6%9C%BA-%E6%BF%80%E6%B4%BB.png)

### 2.5 Apply for Activation

- After the first startup, a `system_info` file will be generated in the physical machine directory `/docker-iotdb/iotdb/activation`. Copy this file and send it to the Timecho team.

    ![](/img/%E5%8D%95%E6%9C%BA-%E7%94%B3%E8%AF%B7%E6%BF%80%E6%B4%BB1.png)

- Once you receive the `license` file, copy it to the `/docker-iotdb/iotdb/activation` folder.

    ![](/img/%E5%8D%95%E6%9C%BA-%E7%94%B3%E8%AF%B7%E6%BF%80%E6%B4%BB2.png)

### 2.6 Start IoTDB Again

```Bash
docker-compose  -f docker-compose-standalone.yml   up  -d
```

![](/img/%E5%90%AF%E5%8A%A8iotdb.png)

### 2.7 Verify the Deployment

- Check the logs: If you see the following message, the startup is successful.

    ```Bash
    docker logs -f iotdb-datanode #View log command
    2024-07-19 12:02:32,608 [main] INFO  o.a.i.db.service.DataNode:231 - Congratulations, IoTDB DataNode is set up successfully. Now, enjoy yourself!
    ```

    ![](/img/%E5%8D%95%E6%9C%BA-%E9%AA%8C%E8%AF%81%E9%83%A8%E7%BD%B21.png)

- Enter the container and check the service status:

    View the launched container

    ```Bash
    docker ps
    ```

    ![](/img/%E5%8D%95%E6%9C%BA-%E9%AA%8C%E8%AF%81%E9%83%A8%E7%BD%B22.png)

    Enter the container, log in to the database through CLI, and use the show cluster command to view the service status and activation status

    ```Bash
    docker exec -it iotdb  /bin/bash         #Enter the container
    ./start-cli.sh -h iotdb                  #Log in to the database
    IoTDB> show cluster                      #Check the service status
    ```

    If all services are in the `running` state, the IoTDB deployment is successful.

    ![](/img/%E5%8D%95%E6%9C%BA-%E9%AA%8C%E8%AF%81%E9%83%A8%E7%BD%B23.png)

### 2.8 Map the `/conf` Directory (Optional)

If you want to modify configuration files directly on the physical machine, you can map the `/conf` folder from the container. Follow these steps:

**Step 1**: Copy the `/conf` directory from the container to `/docker-iotdb/iotdb/conf`:

```Bash
docker cp iotdb:/iotdb/conf /docker-iotdb/iotdb/conf
```

**Step 2**: Add the mapping in `docker-compose-standalone.yml`:

```Bash
    volumes:
        - ./iotdb/conf:/iotdb/conf   # Add this mapping for the /conf folder
        - ./iotdb/data:/iotdb/data
        - ./iotdb/logs:/iotdb/logs
        - /dev/mem:/dev/mem:ro
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

For example, if the IoTDB container image file is named `iotdb-enterprise-2.0.x.x.3-standalone-docker.tar.gz`, execute the following command on all 3 servers to load the image:

```Bash
docker load -i iotdb-enterprise-2.0.x.x-standalone-docker.tar.gz
```

To view the loaded images, run:

```Bash
docker images
```

![](/img/%E9%95%9C%E5%83%8F%E5%8A%A0%E8%BD%BD.png)

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
    image: iotdb-enterprise:2.0.x.x-standalone #The image used
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
    image: iotdb-enterprise:2.0.x.x-standalone #The image used
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

### 3.5 Apply for Activation

- After starting the 3 ConfigNodes for the first time, a `system_info` file will be generated in the `/docker-iotdb/iotdb/activation` directory on each physical machine. Copy the `system_info` files from all 3 servers and send them to the Timecho team.

  ![](/img/%E5%8D%95%E6%9C%BA-%E7%94%B3%E8%AF%B7%E6%BF%80%E6%B4%BB1.png)

- Place the 3 `license` files into the corresponding `/docker-iotdb/iotdb/activation` folders on each ConfigNode server.

  ![](/img/%E5%8D%95%E6%9C%BA-%E7%94%B3%E8%AF%B7%E6%BF%80%E6%B4%BB2.png)

- Once the `license` files are placed in the `activation` folders, the ConfigNodes will automatically activate. **No restart is required for the ConfigNodes.**
  
### 3.6 Start DataNode

Start the DataNode on all 3 servers: 

```Bash
cd /docker-iotdb
docker-compose  -f  datanode.yml  up -d #Background startup
```

![](/img/%E9%9B%86%E7%BE%A4%E7%89%88-dn%E5%90%AF%E5%8A%A8.png)

### 3.7  Verify Deployment

- Check the logs: If you see the following message, the DataNode has started successfully.

    ```Bash
    docker logs -f iotdb-datanode #View log command
    2024-07-20 16:50:48,937 [main] INFO  o.a.i.db.service.DataNode:231 - Congratulations, IoTDB DataNode is set up successfully. Now, enjoy yourself!
    ```

    ![](/img/dn%E5%90%AF%E5%8A%A8.png)

- Enter the container and check the service status:

    View the launched container

    ```Bash
    docker ps
    ```

    ![](/img/%E6%9F%A5%E7%9C%8B%E5%AE%B9%E5%99%A8.png)

   Enter any container, log in to the database via CLI, and use the `show cluster` command to check the service status:

```Bash
docker exec -it iotdb-datanode /bin/bash #Entering the container
./start-cli.sh -h iotdb-1                #Log in to the database
IoTDB> show cluster                      #View status
```

If all services are in the `running` state, the IoTDB deployment is successful.

    ![](/img/%E9%9B%86%E7%BE%A4-%E6%BF%80%E6%B4%BB.png)

### 3.8 Map the `/conf` Directory (Optional)

If you want to modify configuration files directly on the physical machine, you can map the `/conf` folder from the container. Follow these steps:

**Step 1**: Copy the `/conf` directory from the container to `/docker-iotdb/iotdb/conf` on all 3 servers:

```Bash
docker cp iotdb-confignode:/iotdb/conf /docker-iotdb/iotdb/conf
or
docker cp iotdb-datanode:/iotdb/conf   /docker-iotdb/iotdb/conf 
```

**Step 2**: Add the `/conf` directory mapping in both `confignode.yml` and `datanode.yml` on all 3 servers:

```Bash
#confignode.yml
    volumes:
      - ./iotdb/conf:/iotdb/conf  #Add mapping for this /conf folder
      - ./iotdb/activation:/iotdb/activation
      - ./iotdb/data:/iotdb/data
      - ./iotdb/logs:/iotdb/logs
      - /usr/sbin/dmidecode:/usr/sbin/dmidecode:ro
      - /dev/mem:/dev/mem:ro

#datanode.yml
    volumes:
      - ./iotdb/conf:/iotdb/conf   #Add mapping for this /conf folder 
      - ./iotdb/activation:/iotdb/activation
      - ./iotdb/data:/iotdb/data
      - ./iotdb/logs:/iotdb/logs
      - /usr/sbin/dmidecode:/usr/sbin/dmidecode:ro
      - /dev/mem:/dev/mem:ro
```

**Step 3**: Restart IoTDB on all 3 servers:

```Bash
cd /docker-iotdb
docker-compose  -f confignode.yml  up  -d
docker-compose  -f datanode.yml    up  -d
```