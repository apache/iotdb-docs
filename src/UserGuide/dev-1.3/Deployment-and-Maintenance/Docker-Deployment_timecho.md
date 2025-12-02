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

```Bash
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

```Bash
#Installation command
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s  /usr/local/bin/docker-compose  /usr/bin/docker-compose
#Verify if the installation was successful
docker-compose --version  #Displaying version information indicates successful installation
```

### Install The Dmidecode Plugin

By default, Linux servers should already be installed. If not, you can use the following command to install them.

```Bash
sudo apt-get install dmidecode 
```

After installing dmidecode, search for the installation path: `wherever dmidecode`. Assuming the result is `/usr/sbin/dmidecode`, remember this path as it will be used in the later docker compose yml file.

### Get Container Image Of IoTDB

You can contact business or technical support to obtain container images for IoTDB Enterprise Edition.

## Stand-Alone Deployment

This section demonstrates how to deploy a standalone Docker version of 1C1D.

### Load Image File

For example, the container image file name of IoTDB obtained here is: `iotdb-enterprise-1.3.2-3-standalone-docker.tar.gz`

Load image:

```Bash
docker load -i iotdb-enterprise-1.3.2.3-standalone-docker.tar.gz
```

View image:

```Bash
docker images
```

![](/img/%E5%8D%95%E6%9C%BA-%E6%9F%A5%E7%9C%8B%E9%95%9C%E5%83%8F.png)

### Create Docker Bridge Network

```Bash
docker network create --driver=bridge --subnet=172.18.0.0/16 --gateway=172.18.0.1  iotdb
```

### Write The Yml File For docker-compose

Here we take the example of consolidating the IoTDB installation directory and yml files in the/docker iotdb folder:

The file directory structure is:`/docker-iotdb/iotdb`, `/docker-iotdb/docker-compose-standalone.yml `

```Bash
docker-iotdb：
├── iotdb  #Iotdb installation directory
│── docker-compose-standalone.yml #YML file for standalone Docker Composer
```

The complete docker-compose-standalone.yml content is as follows:

```Bash
version: "3"
services:
  iotdb-service:
    image: iotdb-enterprise:1.3.2.3-standalone #The image used
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

### First Launch

Use the following command to start:

```Bash
cd　/docker-iotdb
docker-compose -f docker-compose-standalone.yml up
```

Due to lack of activation, it is normal to exit directly upon initial startup. The initial startup is to obtain the machine code file for the subsequent activation process.

![](/img/%E5%8D%95%E6%9C%BA-%E6%BF%80%E6%B4%BB.png)

### Apply For Activation

- After the first startup, a system_info file will be generated in the physical machine directory `/docker-iotdb/iotdb/activation`, and this file will be copied to the Timecho staff.

    ![](/img/%E5%8D%95%E6%9C%BA-%E7%94%B3%E8%AF%B7%E6%BF%80%E6%B4%BB1.png)

- Received the license file returned by the staff, copy the license file to the `/docker iotdb/iotdb/activation` folder.

    ![](/img/%E5%8D%95%E6%9C%BA-%E7%94%B3%E8%AF%B7%E6%BF%80%E6%B4%BB2.png)

### Restart IoTDB

```Bash
docker-compose  -f docker-compose-standalone.yml   up  -d
```

![](/img/%E5%90%AF%E5%8A%A8iotdb.png)

### Validate Deployment

- Viewing the log, the following words indicate successful startup

    ```Bash
    docker logs -f iotdb-datanode #View log command
    2024-07-19 12:02:32,608 [main] INFO  o.a.i.db.service.DataNode:231 - Congratulations, IoTDB DataNode is set up successfully. Now, enjoy yourself!
    ```

    ![](/img/%E5%8D%95%E6%9C%BA-%E9%AA%8C%E8%AF%81%E9%83%A8%E7%BD%B21.png)

- Enter the container to view the service running status and activation information

    View the launched container

    ```Bash
    docker ps
    ```

    ![](/img/%E5%8D%95%E6%9C%BA-%E9%AA%8C%E8%AF%81%E9%83%A8%E7%BD%B22.png)

    Enter the container, log in to the database through CLI, and use the `show cluster` command to view the service status and activation status

    ```Bash
    docker exec -it iotdb   /bin/bash        #Entering the container
    ./start-cli.sh -h iotdb                  #Log in to the database
    IoTDB> show cluster                      #View status
    ```

    You can see that all services are running and the activation status shows as activated.

    ![](/img/%E5%8D%95%E6%9C%BA-%E9%AA%8C%E8%AF%81%E9%83%A8%E7%BD%B23.png)

### Map/conf Directory (optional)

If you want to directly modify the configuration file in the physical machine in the future, you can map the/conf folder in the container in three steps:

Step 1: Copy the/conf directory from the container to/docker-iotdb/iotdb/conf

```Bash
docker cp iotdb:/iotdb/conf /docker-iotdb/iotdb/conf
```

Step 2: Add mappings in docker-compose-standalone.yml

```Bash
    volumes:
        - ./iotdb/conf:/iotdb/conf   #Add mapping for this/conf folder
        - ./iotdb/activation:/iotdb/activation
        - ./iotdb/data:/iotdb/data
        - ./iotdb/logs:/iotdb/logs
        - /usr/sbin/dmidecode:/usr/sbin/dmidecode:ro
        - /dev/mem:/dev/mem:ro
```

Step 3: Restart IoTDB

```Bash
docker-compose  -f docker-compose-standalone.yml  up  -d
```

## Cluster Deployment

This section describes how to manually deploy an instance that includes 3 Config Nodes and 3 Data Nodes, commonly known as a 3C3D cluster.

<div align="center">
    <img src="/img/20240705141552.png" alt="" style="width: 60%;"/>
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

### Load Image File

For example, the container image file name obtained for IoTDB is: `iotdb-enterprise-1.3.23-standalone-docker.tar.gz`

Execute the load image command on three servers separately:

```Bash
docker load -i iotdb-enterprise-1.3.2.3-standalone-docker.tar.gz
```

View image:

```Bash
docker images
```

![](/img/%E9%95%9C%E5%83%8F%E5%8A%A0%E8%BD%BD.png)

### Write The Yml File For Docker Compose

Here we take the example of consolidating the IoTDB installation directory and yml files in the /docker-iotdb folder:

The file directory structure is:/docker-iotdb/iotdb,  /docker-iotdb/confignode.yml，/docker-iotdb/datanode.yml

```Bash
docker-iotdb：
├── confignode.yml #Yml file of confignode
├── datanode.yml   #Yml file of datanode
└── iotdb          #IoTDB installation directory
```

On each server, two yml files need to be written, namely confignnode. yml and datanode. yml. The example of yml is as follows:

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
    # Note: Some environments set an extremely high container nofile limit (~2^30 = 1073741824).
    # This can make the startup step "Checking whether the ports are already occupied..." appear to hang (lsof slow).
    # If you see that line for a long time, lower the nofile limit by uncommenting below:
    # ulimits:
    #   nofile:
    #     soft: 1048576
    #     hard: 1048576
```

### Starting Confignode For The First Time

First, start configNodes on each of the three servers to obtain the machine code. Pay attention to the startup order, start the first iotdb-1 first, then start iotdb-2 and iotdb-3.

```Bash
cd　/docker-iotdb
docker-compose -f confignode.yml up  -d #Background startup
```

### Apply For Activation

- After starting three confignodes for the first time, a system_info file will be generated in each physical machine directory `/docker-iotdb/iotdb/activation`, and the system_info files of the three servers will be copied to the Timecho staff;

  ![](/img/%E5%8D%95%E6%9C%BA-%E7%94%B3%E8%AF%B7%E6%BF%80%E6%B4%BB1.png)

- Put the three license files into the `/docker iotdb/iotdb/activation` folder of the corresponding Configurable Node node;

  ![](/img/%E5%8D%95%E6%9C%BA-%E7%94%B3%E8%AF%B7%E6%BF%80%E6%B4%BB2.png)

- After the license is placed in the corresponding activation folder, confignode will be automatically activated without restarting confignode
  
### Start Datanode

Start datanodes on 3 servers separately

```Bash
cd /docker-iotdb
docker-compose  -f  datanode.yml  up -d #Background startup
```

![](/img/%E9%9B%86%E7%BE%A4%E7%89%88-dn%E5%90%AF%E5%8A%A8.png)

### Validate Deployment

- Viewing the logs, the following words indicate that the datanode has successfully started

    ```Bash
    docker logs -f iotdb-datanode #View log command
    2024-07-20 16:50:48,937 [main] INFO  o.a.i.db.service.DataNode:231 - Congratulations, IoTDB DataNode is set up successfully. Now, enjoy yourself!
    ```

    ![](/img/dn%E5%90%AF%E5%8A%A8.png)

- Enter any container to view the service running status and activation information

    View the launched container

    ```Bash
    docker ps
    ```

    ![](/img/%E6%9F%A5%E7%9C%8B%E5%AE%B9%E5%99%A8.png)

    Enter the container, log in to the database through CLI, and use the `show cluster` command to view the service status and activation status

    ```Bash
    docker exec -it iotdb-datanode /bin/bash #Entering the container
    ./start-cli.sh -h iotdb-1                #Log in to the database
    IoTDB> show cluster                      #View status
    ```

    You can see that all services are running and the activation status shows as activated.

    ![](/img/%E9%9B%86%E7%BE%A4-%E6%BF%80%E6%B4%BB.png)

### Map/conf Directory (optional)

If you want to directly modify the configuration file in the physical machine in the future, you can map the/conf folder in the container in three steps:

Step 1: Copy the `/conf` directory from the container to `/docker-iotdb/iotdb/conf` on each of the three servers

```Bash
docker cp iotdb-confignode:/iotdb/conf /docker-iotdb/iotdb/conf
or
docker cp iotdb-datanode:/iotdb/conf   /docker-iotdb/iotdb/conf 
```

Step 2: Add `/conf` directory mapping in `confignode.yml` and `datanode. yml` on 3 servers

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

Step 3: Restart IoTDB on 3 servers

```Bash
cd /docker-iotdb
docker-compose  -f confignode.yml  up  -d
docker-compose  -f datanode.yml    up  -d
```

