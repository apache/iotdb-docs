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

# Data Partitioning & Load Balancing

IoTDB manages metadata and data based on data partitions (DataRegion), dividing the data from both the sequence and time dimensions.

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/upload/data-region.jpg">

## Partition Slots

A sequence partition slot combined with a time partition slot can generate a data partition (when the sequence slot has corresponding data under that time slot).

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/SeriesPartitionSlot.png?raw=true">

### Sequence Partition Slots

Each database holds a fixed number of sequence partition slots, with the default set to 1000. Every time series managed by the database is allocated to a unique sequence partition slot using a partitioning algorithm (usually some hash method).

### Time Partition Slots

Every time series will continuously produce data. If all the data from a time series is stored on one node continuously, the newly added DataNode in the cluster might not be effectively utilized.

Time partition slots slice the time-series data from the time dimension (typically, one time partition per day), making the time-series data storage in the cluster easy to manage.

## Metadata Partitioning

The metadata partition management of a single database, following a specific load balancing strategy, assigns all sequence slots to the corresponding SchemaRegionGroup, further horizontally scaling within the cluster.

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/SchemaRegion.png?raw=true">

## Data Partitioning

It follows a certain load balancing strategy, dividing time and sequence partition slots, and allocating them to the relevant DataRegionGroup, further allowing horizontal scaling in the cluster.

<img style="width:100%; max-width:800px; max-height:600px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/DataRegion.png?raw=true">

## Load Balancing

When the cluster's capacity remains unchanged, data will be evenly distributed across all nodes to utilize storage and computational resources effectively.

Also, during cluster expansion, the system automatically increases the number of regions to fully exploit the computational resources of all nodes without manual intervention. Such dynamic expansion enhances the cluster's performance and scalability, making the system more flexible and efficient.