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
# Environment Requirements

## Operating System Requirements

IoTDB supports operating systems such as Linux, Windows, and MacOS, while the enterprise version supports domestic CPUs such as Loongson, Phytium, and Kunpeng. It also supports domestic server operating systems such as Neokylin, KylinOS, UOS, and Linx.



## System Environment Preparation

### Important Reminder

Whether in Linux or Windows, please ensure that the installation path of IoTDB does not contain spaces or Chinese characters to avoid software running abnormally.



### Environmental Preparation

To use IoTDB, the system environment needs to meet the following conditions (using the centos7 command as an example):

1. Install Java runtime environment, Java version>=1.8, please ensure that the jdk environment variable is set.  V1.3.2.2 and above versions are recommended to deploy JDK17 directly. In some scenarios, older versions of JDK may have performance issues, and the datanode may not stop.

```shell
 # Taking JDK-17 installation in Centos7 as an example:
 tar  -zxvf  jdk-17_linux-x64_bin.tar     # Unzip JDK file
 Vim  ~/.bashrc                           # Configure JDK environment
 {  export JAVA_HOME=/usr/lib/jvm/jdk-17.0.9
    export PATH=$JAVA_HOME/bin:$PATH     
 }  # Add JDK environment variables
 source  ~/.bashrc                        # Configuration environment takes effect
 java -version                            # Check JDK environment
```

2. Turn off system swap memory

```shell
echo "vm.swappiness = 0">> /etc/sysctl.conf
# Executing the swapoff - a and swapon - a commands together is to dump the data in swap back into memory and clear the data in swap.
# Do not omit the swap business setting and only execute swap off - a; Otherwise, after restarting, swap will automatically open again, causing the operation to fail.
swapoff -a && swapon -a
# Enable configuration to take effect without restarting.
sysctl -p
# Check memory allocation, expected swap to be 0
free -m
```

3. Set the maximum number of open files in the system to 65535 to avoid the error of "too many open files".

```shell
# View current restrictions
ulimit -n
# Temporary modifications
ulimit -n 65535
# Permanent modification
echo "* soft nofile 65535" >>  /etc/security/limits.conf
echo "* hard nofile 65535" >>  /etc/security/limits.conf
# After exiting the current terminal session, the expected display is 65535
ulimit -n
```

4. Turn off firewall

```shell
# View firewall
systemctl status firewalld
# Turn off firewall
systemctl stop firewalld
# Permanently disable firewall
systemctl disable firewalld
```

5. Ensure that the required ports are not occupied

  - Check for cluster occupied ports: In the default configuration of the cluster, ConfigNode will occupy ports 10710 and 10720, while DataNode will occupy ports 6667, 10730, 10740, 10750, 1076090919091903000. Please ensure that these ports are not occupied. The inspection method is as follows:

     ```Bash
     lsof -i:6667  or  netstat -tunp | grep 6667
     lsof -i:10710  or  netstat -tunp | grep 10710
     lsof -i:10720  or  netstat -tunp | grep 10720
     # If the command has output, it indicates that the port is already occupied.
     ```

- Check for port occupancy by cluster deployment tool: When installing and deploying a cluster using the cluster management tool opskit, it is necessary to open the SSH remote connection service configuration and open port 22.

     ```Bash
     yum install openssh-server            # Install SSH service
     systemctl start sshd                  # Enable Port 22           
     ```

