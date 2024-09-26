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

# Environmental Requirement

To use IoTDB, you need to have:

* Java >= 1.8 (1.8, 11 to 17 have been verified. Please make sure the environment path has been set.)
* Maven >= 3.6 (if you want to install IoTDB by compiling the source code)
* Set the max open files num as 65535 to avoid "too many open files" problem.
* (Optional) Set the somaxconn as 65535 to avoid "connection reset" error when the system is under high load.


> **# Linux** <br>`sudo sysctl -w net.core.somaxconn=65535` <br>**# FreeBSD 或 Darwin** <br>`sudo sysctl -w kern.ipc.somaxconn=65535`

