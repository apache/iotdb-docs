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
# 环境配置

## 1. 磁盘阵列

### 1.1 配置建议

IoTDB对磁盘阵列配置没有严格运行要求，推荐使用多个磁盘阵列存储IoTDB的数据，以达到多个磁盘阵列并发写入的目标，配置可参考以下建议：

1. 物理环境
   系统盘：建议使用2块磁盘做Raid1，仅考虑操作系统自身所占空间即可，可以不为IoTDB预留系统盘空间
   数据盘
      建议做Raid，在磁盘维度进行数据保护
      建议为IoTDB提供多块磁盘（1-6块左右）或磁盘组（不建议将所有磁盘做成一个磁盘阵列，会影响 IoTDB的性能上限）
2. 虚拟环境
   建议挂载多块硬盘（1-6块左右）
3. 在部署 IoTDB 时，建议避免使用 NAS 等网络存储设备。

### 1.2 配置示例

- 示例1，4块3.5英寸硬盘

因服务器安装的硬盘较少，直接做Raid5即可，无需其他配置。

推荐配置如下：

| **使用分类** | **Raid类型** | **硬盘数量** | **冗余**  | **可用容量** |
| ----------- | -------- | -------- | --------- | -------- |
| 系统/数据盘 | RAID5    | 4        | 允许坏1块 | 3        |

- 示例2，12块3.5英寸硬盘

服务器配置12块3.5英寸盘。

前2块盘推荐Raid1作系统盘，2组数据盘可分为2组Raid5，每组5块盘实际可用4块。

推荐配置如下：

| **使用分类** | **Raid类型** | **硬盘数量** | **冗余**  | **可用容量** |
| -------- | -------- | -------- | --------- | -------- |
| 系统盘   | RAID1    | 2        | 允许坏1块 | 1        |
| 数据盘   | RAID5    | 5        | 允许坏1块 | 4        |
| 数据盘   | RAID5    | 5        | 允许坏1块 | 4        |

- 示例3，24块2.5英寸盘

服务器配置24块2.5英寸盘。

前2块盘推荐Raid1作系统盘，后面可分为3组Raid5，每组7块盘实际可用6块。剩余一块可闲置或存储写前日志使用。

推荐配置如下：

| **使用分类** | **Raid类型** | **硬盘数量** | **冗余**  | **可用容量** |
| -------- | -------- | -------- | --------- | -------- |
| 系统盘   | RAID1    | 2        | 允许坏1块 | 1        |
| 数据盘   | RAID5    | 7        | 允许坏1块 | 6        |
| 数据盘   | RAID5    | 7        | 允许坏1块 | 6        |
| 数据盘   | RAID5    | 7        | 允许坏1块 | 6        |
| 数据盘   | NoRaid   | 1        | 损坏丢失  | 1        |

## 2. 操作系统

### 2.1 版本要求

IoTDB支持Linux、Windows、MacOS等操作系统，同时企业版支持龙芯、飞腾、鲲鹏等国产 CPU，支持中标麒麟、银河麒麟、统信、凝思等国产服务器操作系统。

### 2.2 硬盘分区

- 建议使用默认的标准分区方式，不推荐LVM扩展和硬盘加密。
- 系统盘只需满足操作系统的使用空间即可，不需要为IoTDB预留空间。
- 每个硬盘组只对应一个分区即可，数据盘（里面有多个磁盘组，对应raid）不用再额外分区，所有空间给IoTDB使用。

建议的磁盘分区方式如下表所示。
<table>
<tbody>
<tr>
        <th>硬盘分类</th>
        <th>磁盘组</th>        
        <th>对应盘符</th>
        <th>大小</th>
        <th>文件系统类型</th>
    </tr>
    <tr>
        <td rowspan="2">系统盘</td>
        <td rowspan="2">磁盘组0</td> 
        <td>/boot</td>  
        <td>1GB</td> 
        <td>默认</td> 
    </tr>
    <tr>
        <td>/</td>  
        <td>磁盘组剩余全部空间</td> 
        <td>默认</td> 
    </tr>
    <tr>
        <td rowspan="3">数据盘</td>
        <td>磁盘组1</td> 
        <td>/data1</td>  
        <td>磁盘组1全部空间</td> 
        <td>默认</td> 
    </tr>
    <tr>
        <td>磁盘组2</td> 
        <td>/data2</td>  
        <td>磁盘组2全部空间</td> 
        <td>默认</td> 
    </tr>
    <tr>
        <td colspan="4">......</td>   
    </tr>
</tbody>
</table>

### 2.3 网络配置 

1. 关闭防火墙

```Bash
# 查看防火墙
systemctl status firewalld
# 关闭防火墙
systemctl stop firewalld
# 永久关闭防火墙
systemctl disable firewalld
```

2. 保证所需端口不被占用

（1）集群占用端口的检查：在集群默认配置中，ConfigNode 会占用端口 10710 和 10720，DataNode 会占用端口 6667、10730、10740、10750 、10760、9090、9190、3000请确保这些端口未被占用。检查方式如下：

```Bash
lsof -i:6667  或  netstat -tunp | grep 6667
lsof -i:10710  或  netstat -tunp | grep 10710
lsof -i:10720  或  netstat -tunp | grep 10720
#如果命令有输出，则表示该端口已被占用。
```
若执行命令后提示 lsof 相关错误（如命令缺失、版本不兼容等），可参考[lsof 异常处理方式](../FAQ/Frequently-asked-questions.md#_1-11-部署-IoTDB-时提示-lsof-相关错误-如命令缺失-版本不兼容等-如何正确安装-验证或卸载-lsof)

（2）集群部署工具占用端口的检查：使用集群管理工具opskit安装部署集群时，需打开SSH远程连接服务配置，并开放22号端口。

```Bash
yum install openssh-server            #安装ssh服务
systemctl start sshd                  #启用22号端口           
```

3. 保证服务器之间的网络相互连通

### 2.4 其他配置

1. 将系统 swap 优先级降至最低

```Bash
echo "vm.swappiness = 0">> /etc/sysctl.conf
# 一起执行 swapoff -a 和 swapon -a 命令是为了将 swap 里的数据转储回内存，并清空 swap 里的数据。
# 不可省略 swappiness 设置而只执行 swapoff -a；否则，重启后 swap 会再次自动打开，使得操作失效。
swapoff -a && swapon -a
# 在不重启的情况下使配置生效。
sysctl -p
# swap的已使用内存变为0
free -m
```

2. 设置系统最大打开文件数为 65535，以避免出现 "太多的打开文件 "的错误。

```Bash
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

## 3. 软件依赖

安装 Java 运行环境 ，Java 版本 >= 1.8，请确保已设置 jdk 环境变量。（V1.3.2.2 及之上版本推荐直接部署JDK17，老版本JDK部分场景下性能有问题，且datanode会出现stop不掉的问题）

```Bash
 #下面以在centos7，使用JDK-17安装为例：
 tar  -zxvf  jdk-17_linux-x64_bin.tar     #解压JDK文件
 Vim  ~/.bashrc                           #配置JDK环境
 {  export JAVA_HOME=/usr/lib/jvm/jdk-17.0.9
    export PATH=$JAVA_HOME/bin:$PATH     
 }  #添加JDK环境变量
 source  ~/.bashrc                        #配置环境生效
 java -version                            #检查JDK环境
```