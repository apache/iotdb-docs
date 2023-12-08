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

# Scenario

## Application 1: Internet of Vehicles

### Background

> - Challenge: a large number of vehicles and time series

A car company has a huge business volume and needs to deal with a large number of vehicles and a large amount of data. It has hundreds of millions of data measurement points, over ten million new data points per second, millisecond-level collection frequency, posing high requirements on real-time writing, storage and processing of databases.

In the original architecture, the HBase cluster was used as the storage database. The query delay was high, and the system maintenance was difficult and costly. The HBase cluster cannot meet the demand. On the contrary, IoTDB supports high-frequency data writing with millions of measurement points and millisecond-level query response speed. The efficient data processing capability allows users to obtain the required data quickly and accurately. Therefore, IoTDB is chosen as the data storage layer, which has a lightweight architecture, reduces operation and maintenance costs, and supports elastic expansion and contraction and high availability to ensure system stability and availability.

### Architecture

The data management architecture of the car company using IoTDB as the time-series data storage engine is shown in the figure below.


![img](https://alioss.timecho.com/docs/img/1280X1280.PNG)

The vehicle data is encoded based on TCP and industrial protocols and sent to the edge gateway, and the gateway sends the data to the message queue Kafka cluster, decoupling the two ends of production and consumption. Kafka sends data to Flink for real-time processing, and the processed data is written into IoTDB. Both historical data and latest data are queried in IoTDB, and finally the data flows into the visualization platform through API for application.

## Application 2: Intelligent Operation and Maintenance

### Background

A steel factory aims to build a low-cost, large-scale access-capable remote intelligent operation and maintenance software and hardware platform, access hundreds of production lines, more than one million devices, and tens of millions of time series, to achieve remote coverage of intelligent operation and maintenance.

There are many challenges in this process:

> - Wide variety of devices, protocols, and data types
> - Time series data, especially high-frequency data, has a huge amount of data
> - The reading and writing speed of massive time series data cannot meet business needs
> - Existing time series data management components cannot meet various advanced application requirements

After selecting IoTDB as the storage database of the intelligent operation and maintenance platform, it can stably write multi-frequency and high-frequency acquisition data, covering the entire steel process, and use a composite compression algorithm to reduce the data size by more than 10 times, saving costs. IoTDB also effectively supports downsampling query of historical data of more than 10 years, helping enterprises to mine data trends and assist enterprises in long-term strategic analysis.

### Architecture

The figure below shows the architecture design of the intelligent operation and maintenance platform of the steel plant.           

![img](https://alioss.timecho.com/docs/img/1280X1280%20(1).PNG)

## Application 3: Smart Factory

### Background

> - Challenge：Cloud-edge collaboration

A cigarette factory hopes to upgrade from a "traditional factory" to a "high-end factory". It uses the Internet of Things and equipment monitoring technology to strengthen information management and services to realize the free flow of data within the enterprise and to help improve productivity and lower operating costs.

### Architecture

The figure below shows the factory's IoT system architecture. IoTDB runs through the three-level IoT platform of the company, factory, and workshop to realize unified joint debugging and joint control of equipment. The data at the workshop level is collected, processed and stored in real time through the IoTDB at the edge layer, and a series of analysis tasks are realized. The preprocessed data is sent to the IoTDB at the platform layer for data governance at the business level, such as device management, connection management, and service support. Eventually, the data will be integrated into the IoTDB at the group level for comprehensive analysis and decision-making across the organization.

![img](https://alioss.timecho.com/docs/img/1280X1280%20(2).PNG)


## Application 4: Condition monitoring

### Background

> - Challenge: Smart heating, cost reduction and efficiency increase

A power plant needs to monitor tens of thousands of measuring points of main and auxiliary equipment such as fan boiler equipment, generators, and substation equipment. In the previous heating process, there was a lack of prediction of the heat supply in the next stage, resulting in ineffective heating, overheating, and insufficient heating.

After using IoTDB as the storage and analysis engine, combined with meteorological data, building control data, household control data, heat exchange station data, official website data, heat source side data, etc., all data are time-aligned in IoTDB to provide reliable data basis to realize smart heating. At the same time, it also solves the problem of monitoring the working conditions of various important components in the relevant heating process, such as on-demand billing and pipe network, to reduce manpower input.

### Architecture

The figure below shows the data management architecture of the power plant in the heating scene.

![img](https://alioss.timecho.com/docs/img/7b7a22ae-6367-4084-a526-53c88190bc50.png)

