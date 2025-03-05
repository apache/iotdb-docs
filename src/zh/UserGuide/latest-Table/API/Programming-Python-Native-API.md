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

# Python 原生接口

## 1. 使用方式

安装依赖包:

```Java
pip3 install apache-iotdb
```

## 2. 读写操作

### 2.1 TableSession

#### 2.1.1 功能描述

TableSession是IoTDB的一个核心类，用于与IoTDB数据库进行交互。通过这个类，用户可以执行SQL语句、插入数据以及管理数据库会话。

#### 2.1.2 方法列表

| **方法名称**                | **描述**                           | **参数类型**                       | **返回类型**   |
| --------------------------- | ---------------------------------- | ---------------------------------- | -------------- |
| insert                      | 写入数据                           | tablet: Union[Tablet, NumpyTablet] | None           |
| execute_non_query_statement | 执行非查询 SQL 语句，如 DDL 和 DML | sql: str                           | None           |
| execute_query_statement     | 执行查询 SQL 语句并返回结果集      | sql: str                           | SessionDataSet |
| close                       | 关闭会话并释放资源                 | None                               | None           |

#### 2.1.3 接口展示

**TableSession:**


```Java
class TableSession(object):
def insert(self, tablet: Union[Tablet, NumpyTablet]):
    """
    Insert data into the database.

    Parameters:
        tablet (Tablet | NumpyTablet): The tablet containing the data to be inserted.
                                       Accepts either a `Tablet` or `NumpyTablet`.

    Raises:
        IoTDBConnectionException: If there is an issue with the database connection.
    """
    pass

def execute_non_query_statement(self, sql: str):
    """
    Execute a non-query SQL statement.

    Parameters:
        sql (str): The SQL statement to execute. Typically used for commands
                   such as INSERT, DELETE, or UPDATE.

    Raises:
        IoTDBConnectionException: If there is an issue with the database connection.
    """
    pass

def execute_query_statement(self, sql: str, timeout_in_ms: int = 0) -> "SessionDataSet":
    """
    Execute a query SQL statement and return the result set.

    Parameters:
        sql (str): The SQL query to execute.
        timeout_in_ms (int, optional): Timeout for the query in milliseconds. Defaults to 0,
                                       which means no timeout.

    Returns:
        SessionDataSet: The result set of the query.

    Raises:
        IoTDBConnectionException: If there is an issue with the database connection.
    """
    pass

def close(self):
    """
    Close the session and release resources.

    Raises:
        IoTDBConnectionException: If there is an issue closing the connection.
    """
    pass
```

### 2.2 TableSessionConfig

#### 2.2.1 功能描述

TableSessionConfig是一个配置类，用于设置和创建TableSession 实例。它定义了连接到IoTDB数据库所需的各种参数。

#### 2.2.2 配置选项

| **配置项**         | **描述**                  | **类型** | **默认值**              |
| ------------------ | ------------------------- | -------- | ----------------------- |
| node_urls          | 数据库连接的节点 URL 列表 | list     | ["localhost:6667"]      |
| username           | 数据库连接用户名          | str      | "root"                  |
| password           | 数据库连接密码            | str      | "root"                  |
| database           | 要连接的目标数据库        | str      | None                    |
| fetch_size         | 每次查询获取的行数        | int      | 5000                    |
| time_zone          | 会话的默认时区            | str      | Session.DEFAULT_ZONE_ID |
| enable_compression | 是否启用数据压缩          | bool     | False                   |

#### 2.2.3 接口展示

```Java
class TableSessionConfig(object):
    """
    Configuration class for a TableSession. 

    This class defines various parameters for connecting to and interacting 
    with the IoTDB tables.
    """

    def __init__(
        self,
        node_urls: list = None,
        username: str = Session.DEFAULT_USER,
        password: str = Session.DEFAULT_PASSWORD,
        database: str = None,
        fetch_size: int = 5000,
        time_zone: str = Session.DEFAULT_ZONE_ID,
        enable_compression: bool = False,
    ):
        """
        Initialize a TableSessionConfig object with the provided parameters.

        Parameters:
            node_urls (list, optional): A list of node URLs for the database connection.
                                        Defaults to ["localhost:6667"].
            username (str, optional): The username for the database connection. 
                                      Defaults to "root".
            password (str, optional): The password for the database connection. 
                                      Defaults to "root".
            database (str, optional): The target database to connect to. Defaults to None.
            fetch_size (int, optional): The number of rows to fetch per query. Defaults to 5000.
            time_zone (str, optional): The default time zone for the session. 
                                       Defaults to Session.DEFAULT_ZONE_ID.
            enable_compression (bool, optional): Whether to enable data compression. 
                                                 Defaults to False.
        """
```

**注意事项:**

在使用完 TableSession 后，务必调用 close 方法来释放资源。

## 3. 客户端连接池

### 3.1 TableSessionPool

#### 3.1.1 功能描述

TableSessionPool 是一个会话池管理类，用于管理 TableSession 实例的创建和销毁。它提供了从池中获取会话和关闭会话池的功能。

#### 3.1.2 方法列表

| **方法名称** | **描述**                                 | **返回类型** | **异常** |
| ------------ | ---------------------------------------- | ------------ | -------- |
| get_session  | 从会话池中检索一个新的 TableSession 实例 | TableSession | 无       |
| close        | 关闭会话池并释放所有资源                 | None         | 无       |

#### 3.1.3 接口展示

**TableSessionPool:**

```Java
def get_session(self) -> TableSession:
    """
    Retrieve a new TableSession instance.

    Returns:
        TableSession: A new session object configured with the session pool.

    Notes:
        The session is initialized with the underlying session pool for managing
        connections. Ensure proper usage of the session's lifecycle.
    """

def close(self):
    """
    Close the session pool and release all resources.

    This method closes the underlying session pool, ensuring that all
    resources associated with it are properly released.

    Notes:
        After calling this method, the session pool cannot be used to retrieve
        new sessions, and any attempt to do so may raise an exception.
    """
```

### 3.2 TableSessionPoolConfig

#### 3.2.1 功能描述

TableSessionPoolConfig是一个配置类，用于设置和创建 TableSessionPool 实例。它定义了初始化和管理 IoTDB 数据库会话池所需的参数。

#### 3.2.2 配置选项

| **配置项**         | **描述**                       | **类型** | **默认值**               |
| ------------------ | ------------------------------ | -------- | ------------------------ |
| node_urls          | 数据库连接的节点 URL 列表      | list     | None                     |
| max_pool_size      | 会话池中的最大会话数           | int      | 5                        |
| username           | 数据库连接用户名               | str      | Session.DEFAULT_USER     |
| password           | 数据库连接密码                 | str      | Session.DEFAULT_PASSWORD |
| database           | 要连接的目标数据库             | str      | None                     |
| fetch_size         | 每次查询获取的行数             | int      | 5000                     |
| time_zone          | 会话池的默认时区               | str      | Session.DEFAULT_ZONE_ID  |
| enable_redirection | 是否启用重定向                 | bool     | False                    |
| enable_compression | 是否启用数据压缩               | bool     | False                    |
| wait_timeout_in_ms | 等待会话可用的最大时间（毫秒） | int      | 10000                    |
| max_retry          | 操作的最大重试次数             | int      | 3                        |

#### 3.2.3 接口展示


```Java
class TableSessionPoolConfig(object):
    """
    Configuration class for a TableSessionPool.

    This class defines the parameters required to initialize and manage
    a session pool for interacting with the IoTDB database.
    """
    def __init__(
        self,
        node_urls: list = None,
        max_pool_size: int = 5,
        username: str = Session.DEFAULT_USER,
        password: str = Session.DEFAULT_PASSWORD,
        database: str = None,
        fetch_size: int = 5000,
        time_zone: str = Session.DEFAULT_ZONE_ID,
        enable_redirection: bool = False,
        enable_compression: bool = False,
        wait_timeout_in_ms: int = 10000,
        max_retry: int = 3,
    ):
    """
    Initialize a TableSessionPoolConfig object with the provided parameters.
    
    Parameters:
        node_urls (list, optional): A list of node URLs for the database connection.
                                    Defaults to None.
        max_pool_size (int, optional): The maximum number of sessions in the pool.
                                       Defaults to 5.
        username (str, optional): The username for the database connection.
                                  Defaults to Session.DEFAULT_USER.
        password (str, optional): The password for the database connection.
                                  Defaults to Session.DEFAULT_PASSWORD.
        database (str, optional): The target database to connect to. Defaults to None.
        fetch_size (int, optional): The number of rows to fetch per query. Defaults to 5000.
        time_zone (str, optional): The default time zone for the session pool.
                                   Defaults to Session.DEFAULT_ZONE_ID.
        enable_redirection (bool, optional): Whether to enable redirection.
                                             Defaults to False.
        enable_compression (bool, optional): Whether to enable data compression.
                                             Defaults to False.
        wait_timeout_in_ms (int, optional): The maximum time (in milliseconds) to wait for a session
                                            to become available. Defaults to 10000.
        max_retry (int, optional): The maximum number of retry attempts for operations. Defaults to 3.
    
    """
```

## 4. 示例代码

Session示例代码:[Session Example](https://github.com/apache/iotdb/blob/rc/2.0.1/iotdb-client/client-py/table_model_session_example.py)

SessionPool示例代码:[SessionPool Example](https://github.com/apache/iotdb/blob/rc/2.0.1/iotdb-client/client-py/table_model_session_pool_example.py)

```Java
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
import threading

import numpy as np

from iotdb.table_session_pool import TableSessionPool, TableSessionPoolConfig
from iotdb.utils.IoTDBConstants import TSDataType
from iotdb.utils.NumpyTablet import NumpyTablet
from iotdb.utils.Tablet import ColumnType, Tablet


def prepare_data():
    print("create database")
    # Get a session from the pool
    session = session_pool.get_session()
    session.execute_non_query_statement("CREATE DATABASE IF NOT EXISTS db1")
    session.execute_non_query_statement('USE "db1"')
    session.execute_non_query_statement(
        "CREATE TABLE table0 (id1 string id, attr1 string attribute, "
        + "m1 double "
        + "measurement)"
    )
    session.execute_non_query_statement(
        "CREATE TABLE table1 (id1 string id, attr1 string attribute, "
        + "m1 double "
        + "measurement)"
    )

    print("now the tables are:")
    # show result
    res = session.execute_query_statement("SHOW TABLES")
    while res.has_next():
        print(res.next())

    session.close()


def insert_data(num: int):
    print("insert data for table" + str(num))
    # Get a session from the pool
    session = session_pool.get_session()
    column_names = [
        "id1",
        "attr1",
        "m1",
    ]
    data_types = [
        TSDataType.STRING,
        TSDataType.STRING,
        TSDataType.DOUBLE,
    ]
    column_types = [ColumnType.ID, ColumnType.ATTRIBUTE, ColumnType.MEASUREMENT]
    timestamps = []
    values = []
    for row in range(15):
        timestamps.append(row)
        values.append(["id:" + str(row), "attr:" + str(row), row * 1.0])
    tablet = Tablet(
        "table" + str(num), column_names, data_types, values, timestamps, column_types
    )
    session.insert(tablet)
    session.execute_non_query_statement("FLush")

    np_timestamps = np.arange(15, 30, dtype=np.dtype(">i8"))
    np_values = [
        np.array(["id:{}".format(i) for i in range(15, 30)]),
        np.array(["attr:{}".format(i) for i in range(15, 30)]),
        np.linspace(15.0, 29.0, num=15, dtype=TSDataType.DOUBLE.np_dtype()),
    ]

    np_tablet = NumpyTablet(
        "table" + str(num),
        column_names,
        data_types,
        np_values,
        np_timestamps,
        column_types=column_types,
    )
    session.insert(np_tablet)
    session.close()


def query_data():
    # Get a session from the pool
    session = session_pool.get_session()

    print("get data from table0")
    res = session.execute_query_statement("select * from table0")
    while res.has_next():
        print(res.next())

    print("get data from table1")
    res = session.execute_query_statement("select * from table0")
    while res.has_next():
        print(res.next())

    session.close()


def delete_data():
    session = session_pool.get_session()
    session.execute_non_query_statement("drop database db1")
    print("data has been deleted. now the databases are:")
    res = session.execute_query_statement("show databases")
    while res.has_next():
        print(res.next())
    session.close()


# Create a session pool
username = "root"
password = "root"
node_urls = ["127.0.0.1:6667", "127.0.0.1:6668", "127.0.0.1:6669"]
fetch_size = 1024
database = "db1"
max_pool_size = 5
wait_timeout_in_ms = 3000
config = TableSessionPoolConfig(
    node_urls=node_urls,
    username=username,
    password=password,
    database=database,
    max_pool_size=max_pool_size,
    fetch_size=fetch_size,
    wait_timeout_in_ms=wait_timeout_in_ms,
)
session_pool = TableSessionPool(config)

prepare_data()

insert_thread1 = threading.Thread(target=insert_data, args=(0,))
insert_thread2 = threading.Thread(target=insert_data, args=(1,))

insert_thread1.start()
insert_thread2.start()

insert_thread1.join()
insert_thread2.join()

query_data()
delete_data()
session_pool.close()
print("example is finished!")
```

