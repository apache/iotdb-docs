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

# Quick Start

This short guide will walk you through the basic process of using IoTDB. For a more comprehensive guide, please visit our website's [User Guide](../IoTDB-Introduction/What-is-IoTDB.md).

## Prerequisites

To use IoTDB, you need to have:

1. Java >= 1.8 (Please make sure the environments PATH variable has been set to include the Java bin directory)
2. Set the max number of open files to at least 65535 in order to avoid "too many open files" problem. <!-- TODO: We should note how to actually do this -->

## Installation

IoTDB can be installed using one of the following three installation methods:

* Installation from source code. If you need to modify the code yourself, you can use this method.
* Installation from binary files. Download the binary distribution from the official website. This is the recommended method, in which you will get a binary released package which you can use out-of-the-box. <!-- TODO: From the Apache point of view the binary distributions are "convenience" ... actually the reccommended way would be to compile, as the ASF only formally distributes sources -->
* Using Docker：The path to the dockerfile is [github](https://github.com/apache/iotdb/blob/master/docker/src/main)

## Download

You can download the binary distribution from:
[Download Page](https://iotdb.apache.org/Download/)

## Configurations

Configuration files are located in the `conf` folder

  * environment config module (`datanode-env.bat`, `datanode-env.sh`), 
  * system config module (`iotdb-datanode.properties`)
  * log config module (`logback.xml`). 

For more information, please go to [Config](../Reference/DataNode-Config-Manual.md).

## Start

You can go through the following step to test the installation. 
If there is no error after execution, the installation is completed. 

### Starting IoTDB

IoTDB is designed as distributed database. You can however start it in a single node `standalone mode`. 
In order to test your configuration, you can first start everything in `standalone mode` (i.e. 1 ConfigNode and 1 DataNode) to check everything works as expected.

Users can start IoTDB in standalone mode by using the `start-standalone` script under the `sbin` folder.

```
# Unix/OS X
> bash sbin/start-standalone.sh
```
```
# Windows
> sbin\start-standalone.bat
```

Note: In order to run IoTDB in standalone mode, you need to ensure that all addresses are set to 127.0.0.1.
If you need to access the IoTDB from a different machine, please change the configuration item `dn_rpc_address` to the public IP of the machine where IoTDB is running and be sure to set `replication factors` to 1, which is currently the default setting.

### Using the Command Line Interfave (CLI)

IoTDB offers several ways to interact with server, here we introduce basic steps of using the `CLI tool` to insert and query data.

After installing IoTDB, there is a pre-configured default user named `root`, its default password is also set to `root`. 
Users can use this default credentials to login to IoTDB from the `CLI`. 
Please use the `start-cli` scriopt in the `sbin` folder in order to start the `CLI`. 

When executing the script, user should assign: `HOST/IP`, `PORT`, `USER_NAME` and `PASSWORD`. 

The default parameters are `-h 127.0.0.1 -p 6667 -u root -pw root`.

Here are the commands for starting the CLI:

```
# Unix/OS X
> bash sbin/start-cli.sh -h 127.0.0.1 -p 6667 -u root -pw root

# Windows
> sbin\start-cli.bat -h 127.0.0.1 -p 6667 -u root -pw root
```

The command line interface is interactive. 
If everything is set up correctly, you should see the IoTDB logo and welcome statement:

```
 _____       _________  ______   ______
|_   _|     |  _   _  ||_   _ `.|_   _ \
  | |   .--.|_/ | | \_|  | | `. \ | |_) |
  | | / .'`\ \  | |      | |  | | |  __'.
 _| |_| \__. | _| |_    _| |_.' /_| |__) |
|_____|'.__.' |_____|  |______.'|_______/  version x.x.x


Successfully login at 127.0.0.1:6667
IoTDB>
```

### Basic commands for IoTDB

Next, let us go a bit more into detail to how to create a timeseries, insert data into it and how to query data from it. 

Data in IoTDB is organized as a set of timeseries, in each timeseries there are some timestamp-data pairs.
Every timeseries belongs to a database. 

All commands are executed in an SQL-like syntax we call `IoTDB SQL`.

Before defining a timeseries, we should define the database it should belong to using `CREATE DATABASE`.
Here's is an example on how to do that: 

``` 
IoTDB> CREATE DATABASE root.ln
```

We can also use `SHOW DATABASES` to list all databases present:

```
IoTDB> SHOW DATABASES
+-----------------------------------+
|                           Database|
+-----------------------------------+
|                            root.ln|
+-----------------------------------+
Database number = 1
```

After the database is created, we can use `CREATE TIMESERIES` to create new timeseries. 
When we create a timeseries, we should define its structure as well as the data types used for each field along with their encoding scheme. 

We can create two timeseries the following way:

```
IoTDB> CREATE TIMESERIES root.ln.wf01.wt01.status WITH DATATYPE=BOOLEAN, ENCODING=PLAIN
IoTDB> CREATE TIMESERIES root.ln.wf01.wt01.temperature WITH DATATYPE=FLOAT, ENCODING=RLE
```

To query a specific timeseries, use the `SHOW TIMESERIES \<Path\>` command. `\<Path\>` represents the path of the timeseries. 
Its default value is null, which means that we're querying all timeseries in the system (the same as using `SHOW TIMESERIES root`). 

Here are some examples:

1. Query all timeseries in the system:

```
IoTDB> SHOW TIMESERIES
+-------------------------------+---------------+--------+--------+
|                     Timeseries|       Database|DataType|Encoding|
+-------------------------------+---------------+--------+--------+
|       root.ln.wf01.wt01.status|        root.ln| BOOLEAN|   PLAIN|
|  root.ln.wf01.wt01.temperature|        root.ln|   FLOAT|     RLE|
+-------------------------------+---------------+--------+--------+
Total timeseries number = 2
```

2. Query a specific timeseries (root.ln.wf01.wt01.status):

```
IoTDB> SHOW TIMESERIES root.ln.wf01.wt01.status
+------------------------------+--------------+--------+--------+
|                    Timeseries|      Database|DataType|Encoding|
+------------------------------+--------------+--------+--------+
|      root.ln.wf01.wt01.status|       root.ln| BOOLEAN|   PLAIN|
+------------------------------+--------------+--------+--------+
Total timeseries number = 1
```

Insertion of timeseries data is the probably most basic operation of IoTDB.
You can use the `INSERT` command to do this. 

Here come some examples on how to do that. 
In the `INTO` part we tell IoTDB which timeseries we want to store the data in as well as which fields we'll be filling.
Please note, that the timestamp field is mandatory for this step and that we don't necessarily have to fill all fields defined of the timeseries we're inserting into:

```
IoTDB> INSERT INTO root.ln.wf01.wt01(timestamp,status) values(100,true);
IoTDB> INSERT INTO root.ln.wf01.wt01(timestamp,status,temperature) values(200,false,20.71)
```

The data we’ve just inserted will then look like this if we query it:

```
IoTDB> SELECT status FROM root.ln.wf01.wt01
+-----------------------+------------------------+
|                   Time|root.ln.wf01.wt01.status|
+-----------------------+------------------------+
|1970-01-01T08:00:00.100|                    true|
|1970-01-01T08:00:00.200|                   false|
+-----------------------+------------------------+
Total line number = 2
```

We can also query several timeseries fields at once like this:

```
IoTDB> SELECT * FROM root.ln.wf01.wt01
+-----------------------+--------------------------+-----------------------------+
|                   Time|  root.ln.wf01.wt01.status|root.ln.wf01.wt01.temperature|
+-----------------------+--------------------------+-----------------------------+
|1970-01-01T08:00:00.100|                      true|                         null|
|1970-01-01T08:00:00.200|                     false|                        20.71|
+-----------------------+--------------------------+-----------------------------+
Total line number = 2
```

The commands to exit the CLI are:  

```
IoTDB> quit
or
IoTDB> exit
```

For more information on which commands are supported by `IoTDB SQL`, please see [SQL Reference](../SQL-Manual/SQL-Manual.md).

### Stopping IoTDB

The server can be stopped using `ctrl-C` or by running the following script:

```
# Unix/OS X
> bash sbin/stop-standalone.sh

# Windows
> sbin\stop-standalone.bat
```
Note: In Linux, please add the `sudo` as far as possible, or else the stopping process may fail. <!-- TODO: Actually running things as `root` is considered a bad practice from security perspective. Is there a reson for requiring root? I don't think we're using any privileged ports or resources. -->

More explanations on running IoTDB in a clustered environment are available at [Cluster-Setup](../Deployment-and-Maintenance/Deployment-Guide_timecho.md).

### Administration

When installing IoTDB, there is a default user which is automatically pre-configured. 
Its username is `root`, and the default password for it is also `root`. 
This user is a user with administrative privileges, who cannot be deleted and has all privileges assigned to it. 
Neither can new privileges be granted to the root user nor can privileges owned by it be revoked.

We strongly recommend you change the default password.
You do this using the following command：
```
ALTER USER <username> SET PASSWORD <password>;
Example: IoTDB > ALTER USER root SET PASSWORD 'newpwd';
```

More about administration options：[Administration Management](../User-Manual/Security-Management_timecho.md)

## Basic configuration

The configuration files are located in the `conf` directory.

The most important ones being:

* environment variable configuration (`datanode-env.bat`, `datanode-env.sh`),
* system configuration (`iotdb-datanode.properties`)
* log configuration (`logback.xml`).
