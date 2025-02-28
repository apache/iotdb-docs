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

## 1. Disk Array

### 1.1 Configuration Suggestions

IoTDB does not have strict operational requirements for disk array configurations. It is recommended to use multiple disk arrays to store IoTDB data to achieve concurrent writing across multiple disk arrays. The following configuration suggestions can be referenced:

1. Physical Environment
   - System Disk: It is recommended to use 2 disks for RAID1, considering only the space occupied by the operating system itself. No additional space needs to be reserved for IoTDB on the system disk.
   - Data Disk:
      - It is recommended to use RAID for data protection at the disk level.
      - It is recommended to provide multiple disks (around 1-6) or disk groups for IoTDB (avoiding creating a single disk array with all disks, as it may affect IoTDB's performance ceiling).
2. Virtual Environment
   - It is recommended to mount multiple hard drives (around 1-6).

### 1.2 Configuration Examples

- Example 1: 4 x 3.5-inch Hard Drives

  - Since the server has fewer installed hard drives, RAID5 can be directly configured without additional settings.

  - Recommended configuration:

     | Classification   | RAID Type | Number of Hard Drives | Redundancy             | Usable Drives |
      | :--------------- | :-------- | :-------------------- | :--------------------- | :------------ |
      | System/Data Disk | RAID5     | 4                     | 1 disk failure allowed | 3             |

- Example 2: 12 x 3.5-inch Hard Drives

  - The server is configured with 12 x 3.5-inch hard drives.

  - The first 2 disks are recommended for RAID1 as the system disk. The data disks can be divided into 2 groups of RAID5, with 5 disks in each group (4 usable).

  - Recommended configuration:

    | Classification | RAID Type | Number of Hard Drives | Redundancy             | Usable Drives |
      | :------------- | :-------- | :-------------------- | :--------------------- | :------------ |
      | System Disk    | RAID1     | 2                     | 1 disk failure allowed | 1             |
      | Data Disk      | RAID5     | 5                     | 1 disk failure allowed | 4             |
      | Data Disk      | RAID5     | 5                     | 1 disk failure allowed | 4             |

- Example 3: 24 x 2.5-inch Hard Drives

  - The server is configured with 24 x 2.5-inch hard drives.

  - The first 2 disks are recommended for RAID1 as the system disk. The remaining disks can be divided into 3 groups of RAID5, with 7 disks in each group (6 usable). The last disk can be left idle or used for storing write-ahead logs.

  - Recommended configuration:

     | Usage Classification | RAID Type | Number of Hard Drives | Redundancy             | Usable Drives |
      | :------------------- | :-------- | :-------------------- | :--------------------- | :------------ |
      | System Disk          | RAID1     | 2                     | 1 disk failure allowed | 1             |
      | Data Disk            | RAID5     | 7                     | 1 disk failure allowed | 6             |
      | Data Disk            | RAID5     | 7                     | 1 disk failure allowed | 6             |
      | Data Disk            | RAID5     | 7                     | 1 disk failure allowed | 6             |
      | Data Disk            | No RAID   | 1                     | Data loss if damaged   | 1             |

## 2. Operating System

### 2.1 Version Requirements

IoTDB supports operating systems such as Linux, Windows, and MacOS. TimechoDB also supports Chinese CPUs like Loongson, Phytium, and Kunpeng, as well as Chinese operating systems like Kylin, UOS, and NingSi.

### 2.2 Hard Disk Partitioning

- It is recommended to use the default standard partitioning method. LVM expansion and hard disk encryption are not recommended.
- The system disk only needs to meet the space requirements of the operating system. No additional space needs to be reserved for IoTDB.
- Each disk group should correspond to a single partition. Data disks (with multiple disk groups corresponding to RAID) do not need additional partitioning, and all space should be allocated to IoTDB.

Recommended disk partitioning is as follows:

<table>
<tbody>
<tr>
        <th>Hard Disk Classification</th>
        <th>Disk Group</th>        
        <th>Corresponding Drive Letter</th>
        <th>Size</th>
        <th>File System Type</th>
    </tr>
    <tr>
        <td rowspan="2">System Disk</td>
        <td rowspan="2">Disk Group 0</td> 
        <td>/boot</td>  
        <td>1GB</td> 
        <td>Default</td> 
    </tr>
    <tr>
        <td>/</td>  
        <td>Remaining space of disk group</td> 
        <td>Default</td> 
    </tr>
    <tr>
        <td rowspan="3">Data Disk</td>
        <td>Disk Group 1</td> 
        <td>/data1</td>  
        <td>Entire space of disk group 1</td> 
        <td>Default</td> 
    </tr>
    <tr>
        <td>Disk Group 2</td> 
        <td>/data2</td>  
        <td>Entire space of disk group 2</td> 
        <td>Default</td> 
    </tr>
    <tr>
        <td colspan="4">......</td>   
    </tr>
</tbody>
</table>

### 2.3 Network Configuration

1. **Disable Firewall**
      ```Bash
      # Check firewall status
      systemctl status firewalld
      # Stop firewall
      systemctl stop firewalld
      # Permanently disable firewall
      systemctl disable firewalld
      ```
2. **Ensure Required Ports Are Not Occupied**
   - Cluster Ports: By default, ConfigNode uses ports 10710 and 10720, while DataNode uses ports 6667, 10730, 10740, 10750, 10760, 9090, 9190, and 3000. Ensure these ports are not occupied. Check as follows:
        ```Bash
        lsof -i:6667   or  netstat -tunp | grep 6667
        lsof -i:10710   or  netstat -tunp | grep 10710
        lsof -i:10720   or  netstat -tunp | grep 10720
        # If the command outputs anything, the port is occupied.
        ```
   - Cluster Deployment Tool Ports: When using the cluster management tool `opskit` for installation and deployment, ensure the SSH remote connection service is configured and port 22 is open.
        ```Bash
        yum install openssh-server            # Install SSH service
        systemctl start sshd                  # Enable port 22
        ```
3. Ensure Network Connectivity Between Servers

### 2.4 Other Configurations

1. Disable System Swap Memory
      ```Bash
      echo "vm.swappiness = 0" >> /etc/sysctl.conf
      # Execute both swapoff -a and swapon -a to transfer data from swap back to memory and clear swap data.
      # Do not omit the swappiness setting and only execute swapoff -a; otherwise, swap will automatically reopen after reboot, rendering the operation ineffective.
      swapoff -a && swapon -a
      # Apply the configuration without rebooting.
      sysctl -p
      # Check memory allocation; swap should be 0.
      free -m
      ```
2. Set System Maximum Open Files to 65535 to avoid "too many open files" errors.
      ```Bash
      # Check current limit
      ulimit -n
      # Temporarily modify
      ulimit -n 65535
      # Permanently modify
      echo "* soft nofile 65535" >> /etc/security/limits.conf
      echo "* hard nofile 65535" >> /etc/security/limits.conf
      # After exiting the current terminal session, check; it should display 65535.
      ulimit -n
      ```



## 3. Software Dependencies

Install Java Runtime Environment, Java version >= 1.8. Ensure JDK environment variables are set. (For versions V1.3.2.2 and later, it is recommended to directly deploy JDK17. Older JDK versions may have performance issues in some scenarios, and DataNode may fail to stop.)

  ```Bash
   # Example of installing JDK-17 on CentOS7:
   tar -zxvf jdk-17_linux-x64_bin.tar     # Extract JDK files
   vim ~/.bashrc                          # Configure JDK environment
   {
     export JAVA_HOME=/usr/lib/jvm/jdk-17.0.9
     export PATH=$JAVA_HOME/bin:$PATH
   }  # Add JDK environment variables
   source ~/.bashrc                       # Apply environment configuration
   java -version                          # Check JDK environment
   ```