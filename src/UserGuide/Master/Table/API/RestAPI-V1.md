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

IoTDB's RESTful service can be used for querying, writing, and management operations. It uses the OpenAPI standard to define interfaces and generate frameworks.

### Enabling RESTful Service

The RESTful service is disabled by default. To enable it, locate the `conf/iotdb-system.properties` file in the IoTDB installation directory, set `enable_rest_service` to `true`, and then restart the datanode process.

```Properties
enable_rest_service=true
```

### Authentication

Except for the health check endpoint `/ping`, the RESTful service uses basic authentication. Each URL request must include the header `'Authorization':'Basic' + base64.encode(username + ':' + password)`.

In the example, the username is `root` and the password is `root`. The corresponding Basic authentication header format is:

```Properties
Authorization : Basic cm9vdDpyb290
```

- If the username or password authentication fails, the following information is returned:

    - HTTP status code: 801

    - Response body:

      ```JSON
      {"code":801,"message":"WRONG_LOGIN_PASSWORD"}
      ```

- If the `Authorization` header is not set, the following information is returned:

    - HTTP status code: 800

    - Response body:

      ```JSON
      {"code":800,"message":"INIT_AUTH_ERROR"}
      ```

### Interface Definitions

#### Ping

The `/ping` endpoint can be used for online service health checks.

- Request Method: GET

- Request Path: `http://ip:port/ping`

- Example Request:

  ```Shell
    curl http://127.0.0.1:18080/ping
    ```

- HTTP Status Codes:

    - `200`: The service is working normally and can accept external requests.

    - `503`: The service is experiencing issues and cannot accept external requests.

  | Parameter Name | Type    | Description      |
          | :------------- | :------ | :--------------- |
      | code           | integer | Status Code      |
      | message        | string  | Code Information |

- Response Example:

    - When the HTTP status code is `200`:

      ```JSON
      {  "code": 200,  "message": "SUCCESS_STATUS"}
      ```

    - When the HTTP status code is `503`:

      ```JSON
      {  "code": 500,  "message": "thrift service is unavailable"}
      ```

**Note**: The `/ping` endpoint does not require authentication.

#### Query Interface

- Request Path: `/rest/table/v1/query`

- Request Method: POST

- Request Format:

    - Header: `application/json`

    - Request Parameters:

      | Parameter Name | Type   | Required | Description                                                  |
                | :------------- | :----- | :------- | :----------------------------------------------------------- |
          | `database`     | string | Yes      | Database name                                                |
          | `sql`          | string | Yes      | SQL query                                                    |
          | `row_limit`    | int    | No       | Maximum number of rows to return in a single query. If not set, the default value from the configuration file (`rest_query_default_row_size_limit`) is used. If the result set exceeds this limit, status code `411` is returned. |

- Response Format:

  | Parameter Name | Type  | Description                                                  |
          | :------------- | :---- | :----------------------------------------------------------- |
      | `column_names` | array | Column names                                                 |
      | `data_types`   | array | Data types of each column                                    |
      | `values`       | array | A 2D array where the first dimension represents rows, and the second dimension represents columns. Each element corresponds to a column, with the same length as `column_names`. |

- Example Request:

  ```JSON
    curl -H "Content-Type:application/json" -H "Authorization:Basic cm9vdDpyb290" -X POST --data '{"database":"test","sql":"select s1,s2,s3 from test_table"}' http://127.0.0.1:18080/rest/table/v1/query
    ```

- Example Response:

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

#### Non-Query Interface

- Request Path: `/rest/table/v1/nonQuery`

- Request Method: POST

- Request Format:

    - Header: `application/json`

    - Request Parameters:

      | Parameter Name | Type   | Required | Description   |
                | :------------- | :----- | :------- | :------------ |
          | `sql`          | string | Yes      | SQL statement |
          | `database`     | string | No       | Database name |

- Response Format:

  | Parameter Name | Type    | Description |
          | :------------- | :------ | :---------- |
      | `code`         | integer | Status code |
      | `message`      | string  | Message     |

- Example Requests:

    - Create a database:

      ```Bash
      curl -H "Content-Type:application/json" -H "Authorization:Basic cm9vdDpyb290" -X POST --data '{"sql":"create database test","database":""}' http://127.0.0.1:18080/rest/table/v1/nonQuery
      ```

    - Create a table `test_table` in the `test` database:

      ```Bash
      curl -H "Content-Type:application/json" -H "Authorization:Basic cm9vdDpyb290" -X POST --data '{"sql":"CREATE TABLE table1 (time TIMESTAMP TIME,region STRING TAG,plant_id STRING TAG,device_id STRING TAG,model_id STRING ATTRIBUTE,maintenance STRING ATTRIBUTE,temperature FLOAT FIELD,humidity FLOAT FIELD,status Boolean FIELD,arrival_time TIMESTAMP FIELD) WITH (TTL=31536000000)","database":"test"}' http://127.0.0.1:18080/rest/table/v1/nonQuery
      ```

- Example Response:

  ```JSON
    {
      "code": 200,
      "message": "SUCCESS_STATUS"
    }
    ```

#### Batch Write Interface

- Request Path: `/rest/table/v1/insertTablet`

- Request Method: POST

- Request Format:

    - Header: `application/json`

    - Request Parameters:

      | Parameter Name      | Type   | Required | Description                                                  |
                | :------------------ | :----- | :------- | :----------------------------------------------------------- |
          | `database`          | string | Yes      | Database name                                                |
          | `table`             | string | Yes      | Table name                                                   |
          | `column_names`      | array  | Yes      | Column names                                                 |
          | `column_catogories` | array  | Yes      | Column categories (`TAG`, `FIELD`, `ATTRIBUTE`)              |
          | `data_types`        | array  | Yes      | Data types                                                   |
          | `timestamps`        | array  | Yes      | Timestamp column                                             |
          | `values`            | array  | Yes      | Value columns. Each column's values can be `null`. A 2D array where the first dimension corresponds to timestamps, and the second dimension corresponds to columns. |

- Response Format:

  | Parameter Name | Type    | Description |
          | :------------- | :------ | :---------- |
      | `code`         | integer | Status code |
      | `message`      | string  | Message     |

- Example Request:

  ```JSON
    curl -H "Content-Type:application/json" -H "Authorization:Basic cm9vdDpyb290" -X POST --data '{"database":"test","column_catogories":["TAG","FIELD","FIELD"],"timestamps":[1739702535000,1739789055000],"column_names":["s1","s2","s3"],"data_types":["STRING","BOOLEAN","INT32"],"values":[["a11",true,2024],["a11",false,2025]],"table":"test_table"}' http://127.0.0.1:18080/rest/table/v1/insertTablet
    ```

- Example Response:

  ```JSON
    {
      "code": 200,
      "message": "SUCCESS_STATUS"
    }
    ```

### Configuration

The configuration file is located in `iotdb-system.properties`.

- Set `enable_rest_service` to `true` to enable the module, or `false` to disable it. The default value is `false`.

  ```Plain
    enable_rest_service=true
    ```

- Only effective when `enable_rest_service=true`. Set `rest_service_port` to a number (1025~65535) to customize the REST service socket port. The default value is `18080`.

  ```Plain
    rest_service_port=18080
    ```

- Set `enable_swagger` to `true` to enable Swagger for displaying REST interface information, or `false` to disable it. The default value is `false`.

  ```Plain
    enable_swagger=false
    ```

- The maximum number of rows that can be returned in a single query. If the result set exceeds this limit, only the rows within the limit will be returned, and status code `411` will be returned.

  ```Plain
    rest_query_default_row_size_limit=10000
    ```

- Expiration time for caching client login information (used to speed up user authentication, in seconds, default is 8 hours).

  ```Plain
    cache_expire_in_seconds=28800
    ```

- Maximum number of users stored in the cache (default is 100).

  ```Plain
    cache_max_num=100
    ```

- Initial cache capacity (default is 10).

  ```Plain
    cache_init_num=10
    ```

- Whether to enable SSL configuration for the REST service. Set `enable_https` to `true` to enable it, or `false` to disable it. The default value is `false`.

  ```Plain
    enable_https=false
    ```

- Path to the `keyStore` (optional).

  ```Plain
    key_store_path=
    ```

- Password for the `keyStore` (optional).

  ```Plain
    key_store_pwd=
    ```

- Path to the `trustStore` (optional).

  ```Plain
    trust_store_path=""
    ```

- Password for the `trustStore` (optional).

  ```Plain
    trust_store_pwd=""
    ```

- SSL timeout time, in seconds.

  ```Plain
    idle_timeout_in_seconds=5000
    ```