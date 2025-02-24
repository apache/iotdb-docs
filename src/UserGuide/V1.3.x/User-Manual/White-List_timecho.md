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

# White List 

**function description**

Allow which client addresses can connect to IoTDB

**configuration file**

conf/iotdb-system.properties

conf/white.list

**configuration item**

iotdb-system.properties:

Decide whether to enable white list

```YAML

# Whether to enable white list
enable_white_list=true
```

white.list:

Decide which IP addresses can connect to IoTDB

```YAML
# Support for annotation
# Supports precise matching, one IP per line
10.2.3.4

# Support for * wildcards, one ip per line
10.*.1.3
10.100.0.*
```

**note**

1. If the white list itself is cancelled via the session client, the current connection is not immediately disconnected. It is rejected the next time the connection is created.
2. If white.list is modified directly, it takes effect within one minute. If modified via the session client, it takes effect immediately, updating the values in memory and the white.list disk file.
3. Enable the whitelist function, there is no white.list file, start the DB service successfully, however, all connections are rejected.
4. while DB service is running, the white.list file is deleted, and all connections are denied after up to one minute.
5. whether to enable the configuration of the white list function, can be hot loaded.
6. Use the Java native interface to modify the whitelist, must be the root user to modify, reject non-root user to modify; modify the content must be legal, otherwise it will throw a StatementExecutionException.

![](/img/%E7%99%BD%E5%90%8D%E5%8D%95.png)

