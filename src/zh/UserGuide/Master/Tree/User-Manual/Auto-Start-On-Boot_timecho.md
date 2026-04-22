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

# 开机自启

## 1.概述

TimechoDB 支持通过 `daemon-confignode.sh`、`daemon-datanode.sh`、`daemon-ainode.sh` 三个脚本，将ConfigNode、DataNode、AINode 注册为 Linux 系统服务，结合系统自带的 `systemctl `命令，以守护进程方式管理 TimechoDB 集群，实现更便捷的启动、停止、重启及开机自启等操作，提升服务稳定性。

> 注意：该功能从 V 2.0.9 版本开始提供。

## 2. 环境要求

| 操作系统 |          Linux（支持`systemctl`命令）           |
| ---------- |:-----------------------------------------------------:|
| 用户权限 |                      root 用户                      |
| 环境变量 | 部署 ConfigNode 和 DataNode 前需设置`JAVA_HOME` |

## 3. 服务注册

进入 TimechoDB 安装目录，执行对应的守护进程脚本：

```Bash
# 注册 ConfigNode 服务
./tools/ops/daemon-confignode.sh

# 注册 DataNode 服务  
./tools/ops/daemon-datanode.sh

# 注册 AINode 服务
./tools/ops/daemon-ainode.sh
```

执行脚本时将提示以下两个选择项：

1. 是否本次直接启动对应 TimechoDB 服务（timechodb-confignode/timechodb-datanode/timechodb-ainode）；
2. 是否将对应服务注册为开机自启服务。

脚本执行完成后，将在 `/etc/systemd/system/` 目录生成对应的服务文件：

* `timechodb-confignode.service`
* `timechodb-datanode.service`
* `timechodb-ainode.service`

## 4. 服务管理

服务注册完成后，可通过 systemctl 命令对 TimechoDB 各节点服务进行启动、停止、重启、查看状态及配置开机自启等操作，以下命令均需使用 root 用户执行。

### 4.1 手动启动服务

```bash
# 启动 ConfigNode 服务
systemctl start timechodb-confignode
# 启动 DataNode 服务
systemctl start timechodb-datanode
# 启动 AINode 服务
systemctl start timechodb-ainode
```

### 4.2 手动停止服务

```bash
# 停止 ConfigNode 服务
systemctl stop timechodb-confignode
# 停止 DataNode 服务
systemctl stop timechodb-datanode
# 停止 AINode 服务
systemctl stop timechodb-ainode
```

停止服务后，通过查看服务状态，若显示为 inactive(dead)，则说明服务关闭成功；若为其他状态，需查看 TimechoDB 日志，分析异常原因。

### 4.3 查看服务状态

```bash
# 查看 ConfigNode 服务状态
systemctl status timechodb-confignode
# 查看 DataNode 服务状态
systemctl status timechodb-datanode
# 查看 AINode 服务状态
systemctl status timechodb-ainode
```

状态说明：

* active（running）：服务正在运行，若该状态持续 10 分钟，说明服务启动成功；
* failed：服务启动失败，需查看 TimechoDB 日志排查问题。

### 4.4 重启服务

重启服务相当于先执行停止操作，再执行启动操作，命令如下：

```bash
# 重启 ConfigNode 服务
systemctl restart timechodb-confignode
# 重启 DataNode 服务
systemctl restart timechodb-datanode
# 重启 AINode 服务
systemctl restart timechodb-ainode
```

### 4.5 配置开机自启

```bash
# 配置 ConfigNode 开机自启
systemctl enable timechodb-confignode
# 配置 DataNode 开机自启
systemctl enable timechodb-datanode
# 配置 AINode 开机自启
systemctl enable timechodb-ainode
```

### 4.6 取消开机自启

```bash
# 取消 ConfigNode 开机自启
systemctl disable timechodb-confignode
# 取消 DataNode 开机自启
systemctl disable timechodb-datanode
# 取消 AINode 开机自启
systemctl disable timechodb-ainode
```

## 5. 自定义服务配置

### 5.1 自定义方式

#### 5.1.1 方案一：修改脚本

1. 修改 `daemon-xxx.sh` 中的[Unit]、[Service]、[Install]区域配置项，具体配置项的含义参考下一小节
2. 执行 `daemon-xxx.sh` 脚本

#### 5.1.2 方案二：修改服务文件

1. 修改 `/etc/systemd/system` 中的 `xx.service` 文件
2. 执行 `systemctl deamon-reload`

### 5.2 `daemon-xxx.sh` 配置项

#### 5.2.1 [Unit] 部分（服务元信息）

| 配置项        | 说明                             |
| --------------- | ---------------------------------- |
| Description   | 服务描述                         |
| Documentation | 指向 TimechoDB 官方文档          |
| After         | 确保在网络服务启动后才启动该服务 |

#### 5.2.2 [Service] 部分（服务运行配置）

| 配置项                                     | 含义                                                                 |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| StandardOutput、StandardError              | 指定服务标准输出和错误日志的存储路径                                 |
| LimitNOFILE=65536                          | 设置文件描述符上限，默认值为 65536                                   |
| Type=simple                                | 服务类型为简单前台进程，systemd 会跟踪服务主进程                     |
| User=root、Group=root                      | 指定服务以 root 用户和 root 组的权限运行                             |
| ExecStart/ExecStop                         | 分别指定服务的启动脚本和停止脚本的路径                               |
| Restart=on-failure                         | 仅在服务异常退出时，自动重启服务                                     |
| SuccessExitStatus=143                      | 将退出码 143（128+15，即 SIGTERM 正常终止）视为成功退出              |
| RestartSec=5                               | 服务重启的间隔时间，默认为 5 秒                                      |
| StartLimitInterval=600s、StartLimitBurst=3 | 10 分钟（600 秒）内，服务最多重启 3 次，防止频繁重启导致系统资源浪费 |
| RestartPreventExitStatus=SIGKILL           | 服务被 SIGKILL 信号杀死后，不自动重启，避免无限重启僵尸进程          |

#### 5.2.3 [Install] 部分（安装配置）

| 配置项                     | 含义                                       |
| ---------------------------- | -------------------------------------------- |
| WantedBy=multi-user.target | 指定服务在系统进入多用户模式时，自动启动。 |

### 5.3 .service 文件格式示例

```bash
[Unit]
Description=timechodb-confignode
Documentation=https://www.timecho.com/
After=network.target

[Service]
StandardOutput=null
StandardError=null
LimitNOFILE=65536
Type=simple
User=root
Group=root
Environment=JAVA_HOME=$JAVA_HOME
ExecStart=$TimechoDB_SBIN_HOME/start-confignode.sh
Restart=on-failure
SuccessExitStatus=143
RestartSec=5
StartLimitInterval=600s
StartLimitBurst=3
RestartPreventExitStatus=SIGKILL

[Install]
WantedBy=multi-user.target
```

注：上述为 timechodb-confignode.service 文件的标准格式，timechodb-datanode.service、timechodb-ainode.service 文件格式类似。

## 6. 注意事项

1. **进程守护机制**

* **自动重启**：服务启动失败或运行中异常退出（如 OOM）时，系统将自动重启。
* **不重启**：正常退出（如执行 `kill`、`./sbin/stop-xxx.sh` 或 `systemctl stop`）不会触发自动重启。

2. **日志位置**

* 所有运行日志均存储在 TimechoDB 安装目录下的 `logs` 文件夹中，排查问题时请查阅该目录。

3. **集群状态查看**

* 服务启动后，执行 `./sbin/start-cli.sh` 并输入 `show cluster` 命令，即可查看集群状态。

4. **故障恢复流程**

* 若服务状态为 `failed`，修复问题后**必须**先执行 `systemctl daemon-reload`，然后再执行 `systemctl start`，否则启动将失败。

5. **配置生效**

* 修改 `daemon-xxx.sh` 脚本内容后，需执行 `systemctl daemon-reload` 重新注册服务，新配置方可生效。

6. **启动方式兼容**

* `systemctl start`启动的服务，可用`./sbin/stop` 停止（不重启）。
* `./sbin/start` 启动的进程，无法通过 `systemctl` 监控状态。
