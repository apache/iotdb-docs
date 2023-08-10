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
# IoTDB-Collector User's Manual

## Dependencies

* JDK >= 11

## Deployments

1. Download the IoTDB-Collector zip package and extract the zip package to get the IoTDB-Collector folder.
2. Modify the IoTDB configuration information in the db.properties file in the IoTDB-Collector/conf folder.

```properties
dbIp = 127.0.0.1
dbPort = 6667
dbUser = root
dbPasswd = root
```

3. In the IoTDB-Collector folder use . /bin/start.sh to start IoTDB-Collector.

## Usage Example
### Connect to OPC UA services and collect data

1. Modify the opcua-points.json file under IoTDB-Collector/conf/opcua to configure the addresses of the points to be collected

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

2. Modify the opcua-tasks.json file under IoTDB-Collector/conf/opcua to configure the name and collection frequency of the IoTDB inbound database corresponding to the point location.

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

3. Call the interface to start the acquisition program ( endpointUrl Configure the OPC UA connection address )

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

4. To see if IoTDB has data written to it

<img style="width:100%; max-width:500px; max-height:400px; margin-left:auto; margin-right:auto; display:block;" src="https://alioss.timecho.com/docs/img/Ecosystem-Integration/IoTDB-Collector/opcua_last_value.jpg">

5. Stop OPC UA data collection

```
curl --request DELETE 'http://127.0.0.1:8081/stop/opcua' \
--header 'Authorization: Basic dG9tOjMyMTEz' \
```