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

# Auto-start on Boot
## 1. Overview
TimechoDB supports registering ConfigNode, DataNode, and AINode as Linux system services via the three scripts `daemon-confignode.sh`, `daemon-datanode.sh`, and `daemon-ainode.sh`. Combined with the system-built `systemctl` command, it manages the TimechoDB cluster in daemon mode, enabling more convenient startup, shutdown, restart, and auto-start on boot operations, and improving service stability.

> Note: This feature is available starting from version 2.0.9.1.

## 2. Environment Requirements
| Item         | Specification                                                                 |
|--------------|-------------------------------------------------------------------------------|
| OS           | Linux (supports the `systemctl` command)                                      |
| User Privilege | root user                                                                     |
| Environment Variable | `JAVA_HOME` must be set before deploying ConfigNode and DataNode              |

## 3. Service Registration
Enter the TimechoDB installation directory and execute the corresponding daemon script:

```bash
# Register ConfigNode service
./tools/ops/daemon-confignode.sh

# Register DataNode service
./tools/ops/daemon-datanode.sh

# Register AINode service
./tools/ops/daemon-ainode.sh
```

During script execution, you will be prompted with two options:
1. Whether to start the corresponding TimechoDB service immediately (timechodb-confignode / timechodb-datanode / timechodb-ainode);
2. Whether to register the corresponding service for auto-start on boot.

After script execution, the corresponding service files will be generated in the `/etc/systemd/system/` directory:
- `timechodb-confignode.service`
- `timechodb-datanode.service`
- `timechodb-ainode.service`

## 4. Service Management
After service registration, you can use `systemctl` commands to start, stop, restart, check status, and configure auto-start on boot for each TimechoDB node service. All commands below must be executed as the root user.

### 4.1 Manual Service Startup
```bash
# Start ConfigNode service
systemctl start timechodb-confignode
# Start DataNode service
systemctl start timechodb-datanode
# Start AINode service
systemctl start timechodb-ainode
```

### 4.2 Manual Service Shutdown
```bash
# Stop ConfigNode service
systemctl stop timechodb-confignode
# Stop DataNode service
systemctl stop timechodb-datanode
# Stop AINode service
systemctl stop timechodb-ainode
```

After stopping the service, check the service status. If it shows `inactive (dead)`, the service has been shut down successfully. For other statuses, check TimechoDB logs to analyze exceptions.

### 4.3 Check Service Status
```bash
# Check ConfigNode service status
systemctl status timechodb-confignode
# Check DataNode service status
systemctl status timechodb-datanode
# Check AINode service status
systemctl status timechodb-ainode
```

Status Description:
- `active (running)`: Service is running. If this status persists for 10 minutes, the service has started successfully.
- `failed`: Service startup failed. Check TimechoDB logs for troubleshooting.

### 4.4 Restart Service
Restarting a service is equivalent to stopping and then starting it. Commands are as follows:
```bash
# Restart ConfigNode service
systemctl restart timechodb-confignode
# Restart DataNode service
systemctl restart timechodb-datanode
# Restart AINode service
systemctl restart timechodb-ainode
```

### 4.5 Enable Auto-start on Boot
```bash
# Enable ConfigNode auto-start on boot
systemctl enable timechodb-confignode
# Enable DataNode auto-start on boot
systemctl enable timechodb-datanode
# Enable AINode auto-start on boot
systemctl enable timechodb-ainode
```

### 4.6 Disable Auto-start on Boot
```bash
# Disable ConfigNode auto-start on boot
systemctl disable timechodb-confignode
# Disable DataNode auto-start on boot
systemctl disable timechodb-datanode
# Disable AINode auto-start on boot
systemctl disable timechodb-ainode
```

## 5. Custom Service Configuration
### 5.1 Customization Methods
#### 5.1.1 Method 1: Modify the Script
1. Modify the `[Unit]`, `[Service]`, and `[Install]` sections in the `daemon-xxx.sh` script. For details of configuration items, refer to the next section.
2. Execute the `daemon-xxx.sh` script.

#### 5.1.2 Method 2: Modify the Service File
1. Modify the `xx.service` file in `/etc/systemd/system`.
2. Execute `systemctl daemon-reload`.

### 5.2 `daemon-xxx.sh` Configuration Items
#### 5.2.1 `[Unit]` Section (Service Metadata)
| Item          | Description                                                                 |
|---------------|-----------------------------------------------------------------------------|
| Description   | Service description                                                         |
| Documentation | Link to the official TimechoDB documentation                               |
| After         | Ensures the service starts only after the network service has started       |

#### 5.2.2 `[Service]` Section (Service Runtime Configuration)
| Item                                      | Meaning                                                                                                   |
|-------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| StandardOutput, StandardError            | Specify storage paths for service standard output and error logs                                           |
| LimitNOFILE=65536                         | Set the maximum number of file descriptors, default value is 65536                                         |
| Type=simple                               | Service type is a simple foreground process; systemd tracks the main service process                       |
| User=root, Group=root                     | Run the service with root user and group permissions                                                       |
| ExecStart / ExecStop                      | Specify the paths of the service startup and shutdown scripts respectively                                |
| Restart=on-failure                        | Automatically restart the service only if it exits abnormally                                              |
| SuccessExitStatus=143                     | Treat exit code 143 (128+15, normal termination via SIGTERM) as a successful exit                         |
| RestartSec=5                              | Interval between service restarts, default 5 seconds                                                      |
| StartLimitInterval=600s, StartLimitBurst=3 | Maximum 3 restarts within 10 minutes (600 seconds) to prevent excessive resource consumption from frequent restarts |
| RestartPreventExitStatus=SIGKILL          | Do not auto-restart the service if killed by the SIGKILL signal, avoiding infinite restart of zombie processes |

#### 5.2.3 `[Install]` Section (Installation Configuration)
| Item                  | Meaning                                                              |
|-----------------------|----------------------------------------------------------------------|
| WantedBy=multi-user.target | Start the service automatically when the system enters multi-user mode |

### 5.3 Sample `.service` File Format
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

Note: The above is the standard format of the `timechodb-confignode.service` file. The formats of `timechodb-datanode.service` and `timechodb-ainode.service` are similar.

## 6. Notes
1. **Process Daemon Mechanism**
    - **Auto-restart**: The system will auto-restart the service if it fails to start or exits abnormally during runtime (e.g., OOM).
    - **No restart**: Normal exits (e.g., executing `kill`, `./sbin/stop-xxx.sh`, or `systemctl stop`) will not trigger auto-restart.

2. **Log Location**
    - All runtime logs are stored in the `logs` folder under the TimechoDB installation directory. Refer to this directory for troubleshooting.

3. **Cluster Status Check**
    - After service startup, execute `./sbin/start-cli.sh` and run the `show cluster` command to view the cluster status.

4. **Fault Recovery Procedure**
    - If the service status is `failed`, after fixing the issue, **you must first execute `systemctl daemon-reload`** before running `systemctl start`, otherwise startup will fail.

5. **Configuration Activation**
    - After modifying the `daemon-xxx.sh` script, execute `systemctl daemon-reload` to re-register the service for new configurations to take effect.

6. **Startup Mode Compatibility**
    - Services started via `systemctl start` can be stopped using `./sbin/stop` (no restart triggered).
    - Processes started via `./sbin/start` cannot be monitored via `systemctl`.