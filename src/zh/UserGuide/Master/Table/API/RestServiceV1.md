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

# RestAPI V1

IoTDB 的 RESTful 服务可用于查询、写入和管理操作，它使用 OpenAPI 标准来定义接口并生成框架。

## 1. 开启 RESTful 服务

Restful 服务默认情况是关闭的，开启 restful 功能需要找到 IoTDB 安装目录下的`conf/iotdb-system.properties`文件，将 `enable_rest_service` 设置为 `true` ，然后重启 datanode 进程。

```Plain
 enable_rest_service=true
```

## 2. 鉴权

除了检活接口 `/ping`，restful服务使用了基础（basic）鉴权，每次 URL 请求都需要在 header 中携带 `'Authorization':'Basic' + base64.encode(username + ':' + password)`。

示例中使用的用户名为：`root`，密码为：`root`，对应的 Basic 鉴权 Header 格式为

```Plain
Authorization : Basic cm9vdDpyb290
```

- 若用户名密码认证失败，则返回如下信息：
- HTTP 状态码：801
- 返回结构体如下

```JSON
{"code":801,"message":"WRONG_LOGIN_PASSWORD"}
```

- 若未设置 `Authorization`，则返回如下信息：
- HTTP 状态码：800
- 返回结构体如下

```Plain
{"code":800,"message":"INIT_AUTH_ERROR"}
```

## 3. 接口定义

### 3.1 ping

ping 接口可以用于线上服务检活。

请求方式：`GET`

请求路径：http://ip:port/ping

请求示例：

```Plain
curl http://127.0.0.1:18080/ping
```

返回的 HTTP 状态码：

- `200`：当前服务工作正常，可以接收外部请求。
- `503`：当前服务出现异常，不能接收外部请求。

响应参数：

| 参数名称 | 参数类型 | 参数描述 |
| -------- | -------- | -------- |
| code     | integer  | 状态码   |
| message  | string   | 信息提示 |

响应示例：

- HTTP 状态码为 `200` 时：

```JSON
{  "code": 200,  "message": "SUCCESS_STATUS"}
```

- HTTP 状态码为 `503` 时：

```JSON
{  "code": 500,  "message": "thrift service is unavailable"}
```

注意：`ping` 接口访问不需要鉴权。

### 3.2 查询接口

- 请求地址：`/rest/table/v1/query`

- 请求方式：post

- Request 格式

请求头:`application/json`

请求参数说明

| 参数名称  | 参数类型 | 是否必填 | 参数描述                                                     |
| --------- | -------- | -------- | ------------------------------------------------------------ |
| database  | string   | 是       | 数据库名称                                                   |
| sql       | string   | 是       |                                                              |
| row_limit | int      | 否       | 一次查询能返回的结果集的最大行数。 如果不设置该参数，将使用配置文件的 `rest_query_default_row_size_limit` 作为默认值。 当返回结果集的行数超出限制时，将返回状态码 `411`。 |

- Response 格式

| 参数名称     | 参数类型 | 参数描述                                                     |
| ------------ | -------- | ------------------------------------------------------------ |
| column_names | array    | 列名                                                         |
| data_types   | array    | 每一列的类型                                                 |
| values       | array    | 二维数组，第一维与结果集所有行，第二维数组代表结果集的每一行，每一个元素为一列，长度与column_names的长度相同。 |

- 请求示例

```JSON
curl -H "Content-Type:application/json" -H "Authorization:Basic cm9vdDpyb290" -X POST --data '{"database":"test","sql":"select s1,s2,s3 from test_table"}' http://127.0.0.1:18080/rest/table/v1/query
```

- 响应示例：

```JSON
{
    "column_names": [
        "s1",
        "s2",
        "s3"
    ],
    "data_types": [
        "STRING",
        "BOOLEAN",
        "INT32"
    ],
    "values": [
        [
            "a11",
            true,
            2024
        ],
        [
            "a11",
            false,
            2025
        ]
    ]
}
```

### 3.3 非查询接口

- 请求地址：`/rest/table/v1/nonQuery`

- 请求方式：post

- Request 格式

  -  请求头:`application/json`

  -  请求参数说明

| 参数名称 | 参数类型 | 是否必填 | 参数描述 |
| -------- | -------- | -------- | -------- |
| sql      | string   | 是       |          |
| database | string   | 否       | 数据库名 |

- Response 格式

| 参数名称 | 参数类型 | 参数描述 |
| -------- | -------- | -------- |
| code     | integer  | 状态码   |
| message  | string   | 信息提示 |

- 请求示例

```JSON
#创建数据库
curl -H "Content-Type:application/json" -H "Authorization:Basic cm9vdDpyb290" -X POST --data '{"sql":"create database test","database":""}' http://127.0.0.1:18080/rest/table/v1/nonQuery
#在test库中创建表test_table
curl -H "Content-Type:application/json" -H "Authorization:Basic cm9vdDpyb290" -X POST --data '{"sql":"CREATE TABLE table1 (time TIMESTAMP TIME,region STRING TAG,plant_id STRING TAG,device_id STRING TAG,model_id STRING ATTRIBUTE,maintenance STRING ATTRIBUTE,temperature FLOAT FIELD,humidity FLOAT FIELD,status Boolean FIELD,arrival_time TIMESTAMP FIELD) WITH (TTL=31536000000)","database":"test"}' http://127.0.0.1:18080/rest/table/v1/nonQuery
```

- 响应示例：

```JSON
{
  "code": 200,
  "message": "SUCCESS_STATUS"
}
```

### 3.4 批量写入接口

- 请求地址：`/rest/table/v1/insertTablet`

- 请求方式：post

- Request 格式

请求头:`application/json`

请求参数说明

| 参数名称          | 参数类型 | 是否必填 | 参数描述                                                     |
| ----------------- | -------- | -------- | ------------------------------------------------------------ |
| database          | string   | 是       | 数据库名称                                                   |
| table             | string   | 是       | 表名                                                         |
| column_names      | array    | 是       | 列名                                                         |
| column_catogories | array    | 是       | 列类别(TAG,FIELD,*ATTRIBUTE*)                                |
| data_types        | array    | 是       | 数据类型                                                     |
| timestamps        | array    | 是       | 时间列                                                       |
| values            | array    | 是       | 值列，每一列中的值可以为 `null`二维数组第一层长度跟timestamps长度相同。第二层长度跟column_names长度相同 |

- Response 格式

响应参数:

| 参数名称 | 参数类型 | 参数描述 |
| -------- | -------- | -------- |
| code     | integer  | 状态码   |
| message  | string   | 信息提示 |

- 请求示例

```JSON
curl -H "Content-Type:application/json" -H "Authorization:Basic cm9vdDpyb290" -X POST --data '{"database":"test","column_catogories":["TAG","FIELD","FIELD"],"timestamps":[1739702535000,1739789055000],"column_names":["s1","s2","s3"],"data_types":["STRING","BOOLEAN","INT32"],"values":[["a11",true,2024],["a11",false,2025]],"table":"test_table"}' http://127.0.0.1:18080/rest/table/v1/insertTablet
```

- 响应示例

```JSON
{
  "code": 200,
  "message": "SUCCESS_STATUS"
}
```


## 4. 配置

配置文件位于 `iotdb-system.properties` 中。

- 将 `enable_rest_service` 设置为 `true` 表示启用该模块，而将 `false` 表示禁用该模块。默认情况下，该值为 `false`。

```Plain
enable_rest_service=true
```

- 仅在 `enable_rest_service=true` 时生效。将 `rest_service_port `设置为数字（1025~65535），以自定义REST服务套接字端口，默认情况下，值为 `18080`。

```Plain
rest_service_port=18080
```

- 将 'enable_swagger' 设置 'true' 启用swagger来展示rest接口信息, 而设置为 'false' 关闭该功能. 默认情况下，该值为 `false`。

```Plain
enable_swagger=false
```

- 一次查询能返回的结果集最大行数。当返回结果集的行数超出参数限制时，您只会得到在行数范围内的结果集，且将得到状态码`411`。

```Plain
rest_query_default_row_size_limit=10000
```

- 缓存客户登录信息的过期时间（用于加速用户鉴权的速度，单位为秒，默认是8个小时）

```Plain
cache_expire_in_seconds=28800
```

- 缓存中存储的最大用户数量（默认是100）

```Plain
cache_max_num=100
```

- 缓存初始容量（默认是10）

```Plain
cache_init_num=10
```

- REST Service 是否开启 SSL 配置，将 `enable_https` 设置为 `true` 以启用该模块，而将 `false` 设置为禁用该模块。默认情况下，该值为 `false`。

```Plain
enable_https=false
```

- keyStore 所在路径（非必填）

```Plain
key_store_path=
```

- keyStore 密码（非必填）

```Plain
key_store_pwd=
```

- trustStore 所在路径（非必填）

```Plain
trust_store_path=""
```

- trustStore 密码（非必填）

```Plain
trust_store_pwd=""
```

- SSL 超时时间，单位为秒

```Plain
idle_timeout_in_seconds=5000
```