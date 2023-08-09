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

# IoTDB-Collector 用户手册

## 依赖

* JDK >= 11

## 部署

1. 下载 IoTDB-Collector 的 zip 包,并解压 zip 包得到 IoTDB-Collector 文件夹
2. 修改 IoTDB-Collector/conf 文件夹下的 db.properties 文件中的 IoTDB 的配置信息

```properties
dbIp = 127.0.0.1
dbPort = 6667
dbUser = root
dbPasswd = root
```

3. 在 IoTDB-Collector 文件夹下使用 ./bin/start.sh 即可启动 IoTDB-Collector

## 使用示例
### 连接 OPC UA 服务并采集数据

1. 修改 IoTDB-Collector/conf/opcua 下的 opcua-points.json 文件，配置要采集的点位地址

```json
{
  "protocol": "opcua",
  "point_refs": [
    {
      "name":"DEC21TT104_PV",
      "address":"ns=1;s=t|TT21104/PV.PV_Out#Value",
      "data_type":"float"
    },
    {
      "name":"DEC21TT104_PV_UN",
      "address":"ns=1;s=t|TT21104/PV.PV_Unit",
      "data_type":"int"
    },
    {
      "name": "DEC21HV415_Mon",
      "address": "ns=1;s=t|HV21415/V.Monitor",
      "data_type": "boolean"
    }
  ]
}
```

2. 修改 IoTDB-Collector/conf/opcua 下的 opcua-tasks.json 文件，配置点位对应IoTDB入库的名称及采集频率

```json
{
  "protocol":"opcua",
  "tasks":[
    {
      "group_id":"opcua1",
      "interval_us":1000000,
      "points":[
        {
          "name_ref":"DEC21TT104_PV",
          "db_name":"DEC21TT104_PV",
          "db_data_type":"FLOAT"
        },
        {
          "name_ref":"DEC21TT104_PV_UN",
          "db_name":"DEC21TT104_PV_UN",
          "db_data_type":"INT32"
        },
        {
          "name_ref":"DEC21HV415_Mon",
          "db_name":"DEC21HV415_Mon",
          "db_data_type":"BOOLEAN"
        }
      ]
    }
  ]
}
```

3. 调用接口，启动采集程序( endpointUrl 配置 OPC UA 连接地址)

```
curl --request PUT 'http://127.0.0.1:8081/start/opcua' \
--header 'Authorization: Basic dG9tOjMyMTEz' \
--header 'Content-Type: application/json' \
--data '{
	"deviceId": "opcua",
	"deviceOwner": "opcua",
	"protocolName": "opcua",
	"deviceProperties": {
		"endpointUrl": "opc.tcp://192.168.0.1:4862",
		"authWay": "0",
		"username": "",
		"password": ""
	}
}'
```

4.查看 IoTDB 是否有数据写入

<img style="width:100%; max-width:500px; max-height:400px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/Ecosystem-Integration/IoTDB-Collector/opcua_last_value.jpg">

5. 停止 OPC UA 数据采集

```
curl --request DELETE 'http://127.0.0.1:8081/stop/opcua' \
--header 'Authorization: Basic dG9tOjMyMTEz' \
```