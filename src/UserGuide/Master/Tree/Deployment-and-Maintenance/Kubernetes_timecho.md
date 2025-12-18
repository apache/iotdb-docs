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

# Kubernetes

## 1. Environment Preparation

### 1.1 Prepare a Kubernetes Cluster

Ensure that you have an available Kubernetes cluster (minimum recommended version: Kubernetes 1.24) as the foundation for deploying the IoTDB cluster.

Kubernetes Version Requirement: The recommended version is Kubernetes 1.24 or above.

IoTDB Version Requirement: The version of TimechoDB must not be lower than v1.3.3.2.

## 2. Create Namespace

### 2.1 Create Namespace

> Note: Before executing the namespace creation operation, verify that the specified namespace name has not been used in the Kubernetes cluster. If the namespace already exists, the creation command will fail, which may lead to errors during the deployment process.

```Bash
kubectl create ns iotdb-ns
```

### 2.2 View Namespace

```Bash
kubectl get ns
```

## 3. Create PersistentVolume (PV)

### 3.1 Create PV Configuration File

PV is used for persistent storage of IoTDB's ConfigNode and DataNode data. You need to create one PV for each node.

> Note: One ConfigNode and one DataNode count as two nodes, requiring two PVs.

For example, with 3 ConfigNodes and 3 DataNodes:

1. Create a `pv.yaml`  file and make six copies, renaming them to `pv01.yaml` through `pv06.yaml`.

```Bash
# Create a directory to store YAML files
# Create pv.yaml file
touch pv.yaml
```

2. Modify the `name` and `path` in each file to ensure consistency.

**pv.yaml Example：**

```YAML
# pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: iotdb-pv-01
spec:
  capacity:
    storage: 10Gi # Storage capacity
  accessModes: # Access modes
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain # Reclaim policy
  # Storage class name, if using local static storage, do not configure; if using dynamic storage, this must be set
  storageClassName: local-storage 
  # Add the corresponding configuration based on your storage type
  hostPath: # If using a local path
    path: /data/k8s-data/iotdb-pv-01
    type: DirectoryOrCreate  # If this line is not configured, you need to manually create the directory
```

### 3.2 Apply PV Configuration

```Bash
kubectl apply -f pv01.yaml
kubectl apply -f pv02.yaml
...
```

### 3.3 View PV

```Bash
kubectl get pv
```
<img src="/img/Kubernetes01.png" alt="" style="width: 70%;"/>

### 3.4 Manually Create Directories

> Note: If the type in the hostPath of the YAML file is not configured, you need to manually create the corresponding directories.

Create the corresponding directories on all Kubernetes nodes:
```Bash
mkdir -p /data/k8s-data/iotdb-pv-01
mkdir -p /data/k8s-data/iotdb-pv-02
...
```

## 4. Install Helm

For installation steps, please refer to the[Helm Official Website.](https://helm.sh/zh/docs/intro/install/)

## 5. Configure IoTDB Helm Chart

### 5.1 Clone IoTDB Kubernetes Deployment Code

Please contact timechodb staff to obtain the IoTDB Helm Chart. If you encounter proxy issues, disable the proxy settings:

### 5.2 Modify YAML Files

> Ensure that the version used is supported (>=1.3.3.2):

**values.yaml Example：**

```YAML
nameOverride: "iotdb"
fullnameOverride: "iotdb"   # Name after installation

image:
  repository: nexus.infra.timecho.com:8143/timecho/iotdb-enterprise
  pullPolicy: IfNotPresent
  tag: 1.3.3.2-standalone    # Repository and version used

storage:
  # Storage class name, if using local static storage, do not configure; if using dynamic storage, this must be set
  className: local-storage

datanode:
  name: datanode
  nodeCount: 3        # Number of DataNode nodes
  enableRestService: true
  storageCapacity: 10Gi       # Available space for DataNode
  resources:
    requests:
      memory: 2Gi    # Initial memory size for DataNode
      cpu: 1000m     # Initial CPU size for DataNode
    limits:
      memory: 4Gi    # Maximum memory size for DataNode
      cpu: 1000m     # Maximum CPU size for DataNode

confignode:
  name: confignode
  nodeCount: 3      # Number of ConfigNode nodes
  storageCapacity: 10Gi      # Available space for ConfigNode
  resources:
    requests:
      memory: 512Mi    # Initial memory size for ConfigNode
      cpu: 1000m      # Initial CPU size for ConfigNode
    limits:
      memory: 1024Mi   # Maximum memory size for ConfigNode
      cpu: 2000m     # Maximum CPU size for ConfigNode
  configNodeConsensusProtocolClass: org.apache.iotdb.consensus.ratis.RatisConsensus
  schemaReplicationFactor: 3
  schemaRegionConsensusProtocolClass: org.apache.iotdb.consensus.ratis.RatisConsensus
  dataReplicationFactor: 2
  dataRegionConsensusProtocolClass: org.apache.iotdb.consensus.iot.IoTConsensus
```

## 6. Configure Private Repository Information or Pre-Pull Images

Configure private repository information on k8s as a prerequisite for the next helm install step.

Option one is to pull the available iotdb images during helm insta, while option two is to import the available iotdb images into containerd in advance.

### 6.1 [Option 1] Pull Image from Private Repository

#### 6.1.1 Create a Secret to Allow k8s to Access the IoTDB Helm Private Repository

Replace xxxxxx with the IoTDB private repository account, password, and email.



```Bash
# Note the single quotes
kubectl create secret docker-registry timecho-nexus \
  --docker-server='nexus.infra.timecho.com:8143' \
  --docker-username='xxxxxx' \
  --docker-password='xxxxxx' \
  --docker-email='xxxxxx' \
  -n iotdb-ns
  
# View the secret
kubectl get secret timecho-nexus -n iotdb-ns
# View and output as YAML
kubectl get secret timecho-nexus --output=yaml -n iotdb-ns
# View and decrypt
kubectl get secret timecho-nexus --output="jsonpath={.data.\.dockerconfigjson}" -n iotdb-ns | base64 --decode
```

#### 6.1.2 Load the Secret as a Patch to the Namespace iotdb-ns

```Bash
# Add a patch to include login information for nexus in this namespace
kubectl patch serviceaccount default -n iotdb-ns -p '{"imagePullSecrets": [{"name": "timecho-nexus"}]}'

# View the information in this namespace
kubectl get serviceaccounts -n iotdb-ns -o yaml
```

### 6.2 [Option 2] Import Image

This step is for scenarios where the customer cannot connect to the private repository and requires assistance from company implementation staff.

#### 6.2.1  Pull and Export the Image:

```Bash
ctr images pull --user xxxxxxxx nexus.infra.timecho.com:8143/timecho/iotdb-enterprise:1.3.3.2-standalone
```

#### 6.2.2 View and Export the Image:

```Bash
# View
ctr images ls 

# Export
ctr images export iotdb-enterprise:1.3.3.2-standalone.tar nexus.infra.timecho.com:8143/timecho/iotdb-enterprise:1.3.3.2-standalone
```

#### 6.2.3 Import into the k8s Namespace:

> Note that k8s.io is the namespace for ctr in the example environment; importing to other namespaces will not work.

```Bash
# Import into the k8s namespace
ctr -n k8s.io images import iotdb-enterprise:1.3.3.2-standalone.tar 
```

#### 6.2.4 View the Image:

```Bash
ctr --namespace k8s.io images list | grep 1.3.3.2
```

## 7. Install IoTDB

### 7.1  Install IoTDB

```Bash
# Enter the directory
cd iotdb-cluster-k8s/helm

# Install IoTDB
helm install iotdb ./ -n iotdb-ns
```

### 7.2 View Helm Installation List

```Bash
# helm list
helm list -n iotdb-ns
```

### 7.3 View Pods

```Bash
# View IoTDB pods
kubectl get pods -n iotdb-ns -o wide
```

After executing the command, if the output shows 6 Pods with confignode and datanode labels (3 each), it indicates a successful installation. Note that not all Pods may be in the Running state initially; inactive datanode Pods may keep restarting but will normalize after activation.

### 7.4 Troubleshooting

```Bash
# View k8s creation logs
kubectl get events -n iotdb-ns 
watch kubectl get events -n iotdb-ns

# Get detailed information
kubectl describe pod confignode-0 -n iotdb-ns
kubectl describe pod datanode-0 -n iotdb-ns

# View ConfigNode logs
kubectl logs -n iotdb-ns confignode-0 -f
```

## 8. Activate IoTDB

### 8.1 Option 1: Activate Directly in the Pod (Quickest)

```Bash
kubectl exec -it -n iotdb-ns confignode-0 -- /iotdb/sbin/start-activate.sh
kubectl exec -it -n iotdb-ns confignode-1 -- /iotdb/sbin/start-activate.sh
kubectl exec -it -n iotdb-ns confignode-2 -- /iotdb/sbin/start-activate.sh
# Obtain the machine code and proceed with activation
```

### 8.2 Option 2: Activate Inside the ConfigNode Container

```Bash
kubectl exec -it -n iotdb-ns confignode-0 -- /bin/bash
cd /iotdb/sbin
/bin/bash start-activate.sh
# Obtain the machine code and proceed with activation
# Exit the container
```

### Option 3: Manual Activation

1. View ConfigNode details to determine the node:

```Bash
kubectl describe pod confignode-0 -n iotdb-ns | grep -e "Node:" -e "Path:"

# Example output:
# Node:          a87/172.20.31.87
# Path:          /data/k8s-data/env/confignode/.env
```

2. View PVC and find the corresponding Volume for ConfigNode to determine the path:

```Bash
kubectl get pvc -n iotdb-ns | grep "confignode-0"
# Example output:
# map-confignode-confignode-0   Bound    iotdb-pv-04   10Gi       RWO            local-storage   <unset>                 8h

# To view multiple ConfigNodes, use the following:
for i in {0..2}; do echo confignode-$i; kubectl describe pod confignode-${i} -n iotdb-ns | grep -e "Node:" -e "Path:"
```

3. View the Detailed Information of the Corresponding Volume to Determine the Physical Directory Location:


```Bash
kubectl describe pv iotdb-pv-04 | grep "Path:"

# Example output:
# Path:          /data/k8s-data/iotdb-pv-04
```

4. Locate the system-info file in the corresponding directory on the corresponding node, use this system-info as the machine code to generate an activation code, and create a new file named license in the same directory, writing the activation code into this file.

## 9.  Verify IoTDB

### 9.1 Check the Status of Pods within the Namespace

View the IP, status, and other information of the pods in the iotdb-ns namespace to ensure they are all running normally.

```Bash
kubectl get pods -n iotdb-ns -o wide

# Example output:
# NAME           READY   STATUS    RESTARTS         AGE   IP             NODE   NOMINATED NODE   READINESS GATES
# confignode-0   1/1     Running   0                75m   10.20.187.14   a87    <none>           <none>
# confignode-1   1/1     Running   0                75m   10.20.191.75   a88    <none>           <none>
# confignode-2   1/1     Running   0                75m   10.20.187.16   a87    <none>           <none>
# datanode-0     1/1     Running   10 (5m54s ago)   75m   10.20.191.74   a88    <none>           <none>
# datanode-1     1/1     Running   10 (5m42s ago)   75m   10.20.187.15   a87    <none>           <none>
# datanode-2     1/1     Running   10 (5m55s ago)   75m   10.20.191.76   a88    <none>           <none>
```

### 9.2 Check the Port Mapping within the Namespace

```Bash
kubectl get svc -n iotdb-ns

# Example output:
# NAME             TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
# confignode-svc   NodePort       10.10.226.151   <none>        80:31026/TCP     7d8h
# datanode-svc     NodePort       10.10.194.225   <none>        6667:31563/TCP   7d8h
# jdbc-balancer    LoadBalancer   10.10.191.209   <pending>     6667:31895/TCP   7d8h
```

### 9.3 Start the CLI Script on Any Server to Verify the IoTDB Cluster Status

Use the port of jdbc-balancer and the IP of any k8s node.

```Bash
start-cli.sh -h 172.20.31.86 -p 31895
start-cli.sh -h 172.20.31.87 -p 31895
start-cli.sh -h 172.20.31.88 -p 31895
```

<img src="/img/Kubernetes02.png" alt="" style="width: 70%;"/>

## 10. Scaling

### 10.1  Add New PV

Add a new PV; scaling is only possible with available PVs.

<img src="/img/Kubernetes03.png" alt="" style="width: 70%;"/>

**Note: DataNode cannot join the cluster after restart**

**Reason**：The static storage hostPath mode is configured, and the script modifies the `iotdb-system.properties` file to set `dn_data_dirs` to `/iotdb6/iotdb_data,/iotdb7/iotdb_data`. However, the default storage path  `/iotdb/data` is not mounted, leading to data loss upon restart.
**Solution**：Mount the `/iotdb/data` directory as well, and ensure this setting is applied to both ConfigNode and DataNode to maintain data integrity and cluster stability.

### 10.2 Scale ConfigNode

Example: Scale from 3 ConfigNodes to 4 ConfigNodes

Modify the values.yaml file in iotdb-cluster-k8s/helm to change the number of ConfigNodes from 3 to 4.

```Shell
helm upgrade iotdb . -n iotdb-ns
```

<img src="/img/Kubernetes04.png" alt="" style="width: 70%;"/>


### 10.3 Scale DataNode

Example: Scale from 3 DataNodes to 4 DataNodes

Modify the values.yaml file in iotdb-cluster-k8s/helm to change the number of DataNodes from 3 to 4.

```Shell
helm upgrade iotdb . -n iotdb-ns
```

### 10.4 Verify IoTDB Status

```Shell
kubectl get pods -n iotdb-ns -o wide

# NAME           READY   STATUS    RESTARTS         AGE   IP             NODE   NOMINATED NODE   READINESS GATES
# confignode-0   1/1     Running   0                75m   10.20.187.14   a87    <none>           <none>
# confignode-1   1/1     Running   0                75m   10.20.191.75   a88    <none>           <none>
# confignode-2   1/1     Running   0                75m   10.20.187.16   a87    <none>           <none>
# datanode-0     1/1     Running   10 (5m54s ago)   75m   10.20.191.74   a88    <none>           <none>
# datanode-1     1/1     Running   10 (5m42s ago)   75m   10.20.187.15   a87    <none>           <none>
# datanode-2     1/1     Running   10 (5m55s ago)   75m   10.20.191.76   a88    <none>           <none>
# datanode-3     1/1     Running   10 (5m55s ago)   75m   10.20.191.76   a88    <none>           <none>
```
