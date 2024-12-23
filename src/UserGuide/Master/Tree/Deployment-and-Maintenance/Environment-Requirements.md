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
# System Requirements

## Disk Array

### Configuration Suggestions

IoTDB has no strict operation requirements on disk array configuration. It is recommended to use multiple disk arrays to store IoTDB data to achieve the goal of concurrent writing to multiple disk arrays. For configuration, refer to the following suggestions:

1. Physical environment
    System disk: You are advised to use two disks as Raid1, considering only the space occupied by the operating system itself, and do not reserve system disk space for the IoTDB
    Data disk：
    Raid is recommended to protect data on disks
    It is recommended to provide multiple disks (1-6 disks) or disk groups for the IoTDB. (It is not recommended to create a disk array for all disks, as this will affect the maximum performance of the IoTDB.)
2. Virtual environment
    You are advised to mount multiple hard disks (1-6 disks).
3. When deploying IoTDB, it is recommended to avoid using network storage devices such as NAS.

### Configuration Example

- Example 1: Four 3.5-inch hard disks

Only a few hard disks are installed on the server. Configure Raid5 directly.
The recommended configurations are as follows:
| **Use classification** | **Raid type**  | **Disk number** | **Redundancy** | **Available capacity** |
| ----------- | -------- | -------- | --------- | -------- |
| system/data disk | RAID5 | 4 | 1 | 3 | is allowed to fail|

- Example 2: Twelve 3.5-inch hard disks

The server is configured with twelve 3.5-inch disks.
Two disks are recommended as Raid1 system disks. The two data disks can be divided into two Raid5 groups. Each group of five disks can be used as four disks.
The recommended configurations are as follows:
| **Use classification** | **Raid type**  | **Disk number** | **Redundancy** | **Available capacity** |
| -------- | -------- | -------- | --------- | -------- |
| system disk   | RAID1    | 2        | 1 | 1        |
| data disk   | RAID5    | 5        | 1 | 4        |
| data disk   | RAID5    | 5        | 1 | 4        |
- Example 3:24 2.5-inch disks

The server is configured with 24 2.5-inch disks.
Two disks are recommended as Raid1 system disks. The last two disks can be divided into three Raid5 groups. Each group of seven disks can be used as six disks. The remaining block can be idle or used to store pre-write logs.
The recommended configurations are as follows:
| **Use classification** | **Raid type**  | **Disk number** | **Redundancy** | **Available capacity** |
| -------- | -------- | -------- | --------- | -------- |
| system disk   | RAID1    | 2        | 1 | 1        |
| data disk   | RAID5    | 7        | 1 | 6        |
| data disk   | RAID5    | 7        | 1 | 6        |
| data disk   | RAID5    | 7        | 1 | 6        |
| data disk   | NoRaid   | 1        | 0 | 1        |

## Operating System

### Version Requirements

IoTDB supports operating systems such as Linux, Windows, and MacOS, while the enterprise version supports domestic CPUs such as Loongson, Phytium, and Kunpeng. It also supports domestic server operating systems such as Neokylin, KylinOS, UOS, and Linx.

### Disk Partition

- The default standard partition mode is recommended. LVM extension and hard disk encryption are not recommended.
- The system disk needs only the space used by the operating system, and does not need to reserve space for the IoTDB.
- Each disk group corresponds to only one partition. Data disks (with multiple disk groups, corresponding to raid) do not need additional partitions. All space is used by the IoTDB.
The following table lists the recommended disk partitioning methods.
<table>
<tbody>
<tr>
            <th>Disk classification</th>
            <th>Disk set</th>        
            <th>Drive</th>
            <th>Capacity</th>
            <th>File system type</th>
      </tr>
    <tr>
            <td rowspan="2">System disk</td>
            <td rowspan="2">Disk group0</td> 
            <td>/boot</td>  
            <td>1GB</td> 
            <td>Acquiesce</td> 
      </tr>
      <tr>
            <td>/</td>  
            <td>Remaining space of the disk group</td> 
            <td>Acquiesce</td> 
      </tr>
      <tr>
            <td rowspan="3">Data disk</td>
            <td>Disk set1</td> 
            <td>/data1</td>  
            <td>Full space of disk group1</td> 
            <td>Acquiesce</td> 
      </tr>
      <tr>
            <td>Disk set2</td> 
            <td>/data2</td>  
            <td>Full space of disk group2</td> 
            <td>Acquiesce</td> 
      </tr>
      <tr>
            <td colspan="4">......</td>   
      </tr>
</tbody>
</table>
### Network Configuration

1. Disable the firewall

```Bash
# View firewall
systemctl status firewalld
# Disable firewall
systemctl stop firewalld
# Disable firewall permanently
systemctl disable firewalld
```
2. Ensure that the required port is not occupied

(1) Check the ports occupied by the cluster: In the default cluster configuration, ConfigNode occupies ports 10710 and 10720, and DataNode occupies ports 6667, 10730, 10740, 10750, 10760, 9090, 9190, and 3000. Ensure that these ports are not occupied. Check methods are as follows:

```Bash
lsof -i:6667 or netstat -tunp | grep 6667
lsof -i:10710 or netstat -tunp | grep 10710
lsof -i:10720 or netstat -tunp | grep 10720
# If the command outputs, the port is occupied.
```

(2) Checking the port occupied by the cluster deployment tool: When using the cluster management tool opskit to install and deploy the cluster, enable the SSH remote connection service configuration and open port 22.

```Bash
yum install openssh-server # Install the ssh service
systemctl start sshd # Enable port 22
```

3. Ensure that servers are connected to each other

### Other Configuration

1. Reduce the system swap priority to the lowest level

```Bash
echo "vm.swappiness = 0">> /etc/sysctl.conf
# The swapoff -a and swapon -a commands are executed together to dump the data in swap back to memory and to empty the data in swap.
# Do not omit the swappiness setting and just execute swapoff -a; Otherwise, swap automatically opens again after the restart, making the operation invalid.
swapoff -a && swapon -a
# Make the configuration take effect without restarting.
sysctl -p
# Swap's used memory has become 0
free -m
```

2. Set the maximum number of open files to 65535 to avoid the error of "too many open files".

```Bash
# View current restrictions
ulimit -n
# Temporary changes
ulimit -n 65535
# Permanent modification
echo "* soft nofile 65535" >>  /etc/security/limits.conf
echo "* hard nofile 65535" >>  /etc/security/limits.conf
# View after exiting the current terminal session, expect to display 65535
ulimit -n
```
## Software Dependence

Install the Java runtime environment (Java version >= 1.8). Ensure that jdk environment variables are set. (It is recommended to deploy JDK17 for V1.3.2.2 or later. In some scenarios, the performance of JDK of earlier versions is compromised, and Datanodes cannot be stopped.)

```Bash
# The following is an example of installing in centos7 using JDK-17:
tar -zxvf JDk-17_linux-x64_bin.tar # Decompress the JDK file
Vim ~/.bashrc # Configure the JDK environment
{   export JAVA_HOME=/usr/lib/jvm/jdk-17.0.9
    export PATH=$JAVA_HOME/bin:$PATH
} # Add JDK environment variables
source ~/.bashrc # The configuration takes effect
java -version # Check the JDK environment
```