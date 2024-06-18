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
# 环境要求

# 操作系统要求

IoTDB 支持 Linux、Windows、MacOS 等操作系统，同时企业版支持龙芯、飞腾、鲲鹏等国产 CPU，支持中标麒麟、银河麒麟、统信、凝思等国产服务器操作系统。



# 系统环境准备

## 重要提示

无论是在 linux 还是 windows 中，请确保 IoTDB 的安装路径中不含空格和中文，避免软件运行异常。



## 环境准备

要使用 IoTDB，需要系统环境具备以下条件（以 centos7 命令为例）：

1. 安装 Java 运行环境 ，Java 版本 >= 1.8，请确保已设置 jdk 环境变量。

```shell
 #下面以在centos7，使用JDK-17安装为例：
 tar  -zxvf  jdk-17_linux-x64_bin.tar     #解压JDK文件
 Vim  ~/.bashrc                           #配置JDK环境
 {  export JAVA_HOME=/usr/lib/jvm/jdk-17.0.9
    export PATH=$JAVA_HOME/bin:$PATH     
 }  #添加JDK环境变量
 source  ~/.bashrc                        #配置环境生效
 java -version                            #检查JDK环境
```

2. 关闭系统 swap 内存

```shell
echo "vm.swappiness = 0">> /etc/sysctl.conf
# 一起执行 swapoff -a 和 swapon -a 命令是为了将 swap 里的数据转储回内存，并清空 swap 里的数据。
# 不可省略 swappiness 设置而只执行 swapoff -a；否则，重启后 swap 会再次自动打开，使得操作失效。
swapoff -a && swapon -a
# 在不重启的情况下使配置生效。
sysctl -p
# 检查内存分配，预期 swap 为 0
free -m
```

3. 设置系统最大打开文件数为 65535，以避免出现 "太多的打开文件 "的错误。
```shell
#查看当前限制
ulimit -n
# 临时修改
ulimit -n 65535
# 永久修改
echo "* soft nofile 65535" >>  /etc/security/limits.conf
echo "* hard nofile 65535" >>  /etc/security/limits.conf
#退出当前终端会话后查看，预期显示65535
ulimit -n
```

4. 关闭防火墙

```shell
# 查看防火墙
systemctl status firewalld
# 关闭防火墙
systemctl stop firewalld
# 永久关闭防火墙
systemctl disable firewalld
```

5. 保证所需端口不被占用

- 集群占用端口的检查：在集群默认配置中，ConfigNode 会占用端口 10710 和 10720，DataNode 会占用端口 6667、10730、10740、10750 、10760，9090， 9190， 3000 请确保这些端口未被占用。检查方式如下：

     ```Bash
     lsof -i:6667  或  netstat -tunp | grep 6667
     lsof -i:10710  或  netstat -tunp | grep 10710
     lsof -i:10720  或  netstat -tunp | grep 10720
     #如果命令有输出，则表示该端口已被占用。
     ```

- 集群部署工具占用端口的检查：使用集群管理工具 opskit 安装部署集群时，需打开 SSH 远程连接服务配置，并开放 22 号端口。

     ```Bash
     yum install openssh-server            #安装ssh服务
     systemctl start sshd                  #启用22号端口           
     ```

