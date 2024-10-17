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

# Docker Install

Apache IoTDB' Docker image is released on [https://hub.docker.com/r/apache/iotdb](https://hub.docker.com/r/apache/iotdb)
Add environments of docker to update the configurations of Apache IoTDB.

## Have a try

```shell
# get IoTDB official image
docker pull apache/iotdb:1.2.0-standalone
# create docker bridge network
docker network create --driver=bridge --subnet=172.18.0.0/16 --gateway=172.18.0.1 iotdb
# create docker container
docker run -d --name iotdb-service \
              --hostname iotdb-service \
              --network iotdb \
              --ip 172.18.0.6 \
              -p 6667:6667 \
              -e cn_internal_address=iotdb-service \
              -e cn_target_config_node_list=iotdb-service:10710 \
              -e cn_internal_port=10710 \
              -e cn_consensus_port=10720 \
              -e dn_rpc_address=iotdb-service \
              -e dn_internal_address=iotdb-service \
              -e dn_target_config_node_list=iotdb-service:10710 \
              -e dn_mpp_data_exchange_port=10740 \
              -e dn_schema_region_consensus_port=10750 \
              -e dn_data_region_consensus_port=10760 \
              -e dn_rpc_port=6667 \
              apache/iotdb:1.2.0-standalone              
# execute SQL
docker exec -ti iotdb-service /iotdb/sbin/start-cli.sh -h iotdb-service
```

External access：

```shell
# <IP Address/hostname> is the real IP or domain address rather than the one in docker network, could be 127.0.0.1 within the computer.
$IOTDB_HOME/sbin/start-cli.sh -h <IP Address/hostname> -p 6667
```

Notice：The confignode service would fail when restarting this container if the IP Adress of the container has been changed.

```yaml
# docker-compose-standalone.yml
version: "3"
services:
  iotdb-service:
    image: apache/iotdb:1.2.0-standalone
    hostname: iotdb-service
    container_name: iotdb-service
    ports:
      - "6667:6667"
    environment:
      - cn_internal_address=iotdb-service
      - cn_internal_port=10710
      - cn_consensus_port=10720
      - cn_target_config_node_list=iotdb-service:10710
      - dn_rpc_address=iotdb-service
      - dn_internal_address=iotdb-service
      - dn_rpc_port=6667
      - dn_mpp_data_exchange_port=10740
      - dn_schema_region_consensus_port=10750
      - dn_data_region_consensus_port=10760
      - dn_target_config_node_list=iotdb-service:10710
    volumes:
        - ./data:/iotdb/data
        - ./logs:/iotdb/logs
    networks:
      iotdb:
        ipv4_address: 172.18.0.6

networks:
  iotdb:
    external: true
```

## deploy cluster

Until now, we support host and overlay networks but haven't supported bridge networks on multiple computers.
Overlay networks see [1C2D](https://github.com/apache/iotdb/tree/master/docker/src/main/DockerCompose/docker-compose-cluster-1c2d.yml) and here are the configurations and operation steps to start an IoTDB cluster with docker using host networks。

Suppose that there are three computers of iotdb-1, iotdb-2 and iotdb-3. We called them nodes.
Here is the docker-compose file of iotdb-2, as the sample:

```yaml
version: "3"
services:
  iotdb-confignode:
    image: apache/iotdb:1.2.0-confignode
    container_name: iotdb-confignode
    environment:
      - cn_internal_address=iotdb-2
      - cn_target_config_node_list=iotdb-1:10710
      - cn_internal_port=10710
      - cn_consensus_port=10720
      - schema_replication_factor=3
      - schema_region_consensus_protocol_class=org.apache.iotdb.consensus.ratis.RatisConsensus
      - config_node_consensus_protocol_class=org.apache.iotdb.consensus.ratis.RatisConsensus
      - data_replication_factor=3
      - data_region_consensus_protocol_class=org.apache.iotdb.consensus.iot.IoTConsensus
    volumes:
      - /etc/hosts:/etc/hosts:ro
      - ./data/confignode:/iotdb/data
      - ./logs/confignode:/iotdb/logs
    network_mode: "host"

  iotdb-datanode:
    image: apache/iotdb:1.2.0-datanode
    container_name: iotdb-datanode
    environment:
      - dn_rpc_address=iotdb-2
      - dn_internal_address=iotdb-2
      - dn_target_config_node_list=iotdb-1:10710
      - data_replication_factor=3
      - dn_rpc_port=6667
      - dn_mpp_data_exchange_port=10740
      - dn_schema_region_consensus_port=10750
      - dn_data_region_consensus_port=10760
      - data_region_consensus_protocol_class=org.apache.iotdb.consensus.iot.IoTConsensus
       - schema_replication_factor=3
      - schema_region_consensus_protocol_class=org.apache.iotdb.consensus.ratis.RatisConsensus
      - config_node_consensus_protocol_class=org.apache.iotdb.consensus.ratis.RatisConsensus
    volumes:
      - /etc/hosts:/etc/hosts:ro
      - ./data/datanode:/iotdb/data/
      - ./logs/datanode:/iotdb/logs/
    network_mode: "host"
```

Notice：

1. The `dn_target_config_node_list` of three nodes must the same and it is the first starting node of `iotdb-1` with the cn_internal_port of 10710。
2. In this docker-compose file，`iotdb-2` should be replace with the real IP or hostname of each node to generate docker compose files in the other nodes.
3. The services would talk with each other, so they need map the /etc/hosts file or add the `extra_hosts` to the docker compose file.
4. We must start the IoTDB services of `iotdb-1` first at the first time of starting.
5. Stop and remove all the IoTDB services and clean up the `data` and `logs` directories of the 3 nodes，then start the cluster again.


## Configuration
All configuration files are in the directory of `conf`. 
The elements of environment in docker-compose file is the configurations of IoTDB.
If you'd changed the configurations files in conf, please map the directory of `conf` in docker-compose file.


### log level
The conf directory contains log configuration files, namely logback-confignode.xml and logback-datanode.xml.

### memory set
The conf directory contains memory configuration files, namely confignode-env.sh and datanode-env.sh. JVM heap size uses MAX_HEAP_SIZE and HEAP_NEWSIZE, and JVM direct memroy uses MAX_DIRECT_MEMORY_SIZE. e.g. `MAX_HEAP_SIZE=8G, HEAP_NEWSIZE=8G, MAX_DIRECT_MEMORY_SIZE=2G`

## upgrade IoTDB
1. Downloads the newer IoTDB docker image from docker hub
2. Update the image of docker-compose file
3. Stop the IoTDB docker containers with the commands of docker stop and docker rm.
4. Start IoTDB with `docker-compose -f docker-compose-standalone.yml up -d`

## boot automatically
1. Add `restart: always` to every service of IoTDB in docker-compose file
2. Set docker service to boot automatically
e.g. in CentOS: `systemctl enable docker`