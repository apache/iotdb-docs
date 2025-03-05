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
# Python Native API

IoTDB provides a Python native client driver and a session pool management mechanism. These tools allow developers to interact with IoTDB in a programmatic and efficient manner. Using the Python API, developers can encapsulate time-series data into objects (e.g., `Tablet`, `NumpyTablet`) and insert them into the database directly, without the need to manually construct SQL statements. For multi-threaded operations, the `TableSessionPool` is recommended to optimize resource utilization and enhance performance.

## 1. Prerequisites

To use the IoTDB Python API, install the required package using pip:

```Java
pip3 install apache-iotdb
```

## 2. Read and Write Operations

### 2.1 TableSession

`TableSession` is a core class in IoTDB, enabling users to interact with the IoTDB database. It provides methods to execute SQL statements, insert data, and manage database sessions.

#### Method Overview

| **Method Name**             | **Descripton**                                        | **Parameter Type**                   | **Return Type**  |
| --------------------------- | ----------------------------------------------------- | ------------------------------------ | ---------------- |
| insert                      | Inserts data into the database.                       | tablet: `Union[Tablet, NumpyTablet]` | None             |
| execute_non_query_statement | Executes non-query SQL statements like DDL/DML.       | sql: `str`                           | None             |
| execute_query_statement     | Executes a query SQL statement and retrieves results. | sql: `str`                           | `SessionDataSet` |
| close                       | Closes the session and releases resources.            | None                                 | None             |

#### Sample Code

```Python
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

`TableSessionConfig` is a configuration class that sets parameters for creating a `TableSession` instance, defining essential settings for connecting to the IoTDB database.

#### Parameter Configuration

| **Parameter**      | **Description**                       | **Type** | **Default Value**         |
| ------------------ | ------------------------------------- | -------- | ------------------------- |
| node_urls          | List of database node URLs.           | `list`   | `["localhost:6667"]`      |
| username           | Username for the database connection. | `str`    | `"root"`                  |
| password           | Password for the database connection. | `str`    | `"root"`                  |
| database           | Target database to connect to.        | `str`    | `None`                    |
| fetch_size         | Number of rows to fetch per query.    | `int`    | `5000`                    |
| time_zone          | Default session time zone.            | `str`    | `Session.DEFAULT_ZONE_ID` |
| enable_compression | Enable data compression.              | `bool`   | `False`                   |

#### Sample Code

```Python
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

**Note:** After using a `TableSession`, make sure to call the `close` method to release resources.

## 3. Session Pool

### 3.1 TableSessionPool

`TableSessionPool` is a session pool management class designed for creating and managing `TableSession` instances. It provides functionality to retrieve sessions from the pool and close the pool when it is no longer needed.

#### Method Overview

| **Method Name** | **Description**                                        | **Return Type** | **Exceptions** |
| --------------- | ------------------------------------------------------ | --------------- | -------------- |
| get_session     | Retrieves a new `TableSession` instance from the pool. | `TableSession`  | None           |
| close           | Closes the session pool and releases all resources.    | None            | None           |

#### Sample Code

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

`TableSessionPoolConfig` is a configuration class used to define parameters for initializing and managing a `TableSessionPool` instance. It specifies the settings needed for efficient session pool management in IoTDB.

#### Parameter Configuration

| **Paramater**      | **Description**                                              | **Type** | **Default Value**          |
| ------------------ | ------------------------------------------------------------ | -------- | -------------------------- |
| node_urls          | List of IoTDB cluster node URLs.                             | `list`   | None                       |
| max_pool_size      | Maximum size of the session pool, i.e., the maximum number of sessions allowed in the pool. | `int`    | `5`                        |
| username           | Username for the connection.                                 | `str`    | `Session.DEFAULT_USER`     |
| password           | Password for the connection.                                 | `str`    | `Session.DEFAULT_PASSWORD` |
| database           | Target database to connect to.                               | `str`    | None                       |
| fetch_size         | Fetch size for query results                                 | `int`    | `5000`                     |
| time_zone          | Timezone-related `ZoneId`                                    | `str`    | `Session.DEFAULT_ZONE_ID`  |
| enable_redirection | Whether to enable redirection.                               | `bool`   | `False`                    |
| enable_compression | Whether to enable data compression.                          | `bool`   | `False`                    |
| wait_timeout_in_ms | Sets the connection timeout in milliseconds.                 | `int`    | `10000`                    |
| max_retry          | Maximum number of connection retry attempts.                 | `int`    | `3`                        |

#### Sample Code

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

**Notes:**

- Ensure that `TableSession` instances retrieved from the `TableSessionPool` are properly closed after use.
- After closing the `TableSessionPool`, it will no longer be possible to retrieve new sessions.

## 4. Sample Code

**Session** Example: You can find the full example code at [Session Example](https://github.com/apache/iotdb/blob/rc/2.0.1/iotdb-client/client-py/table_model_session_example.py).

**Session Pool** Example: You can find the full example code at [SessionPool Example](https://github.com/apache/iotdb/blob/rc/2.0.1/iotdb-client/client-py/table_model_session_pool_example.py).

Here is an excerpt of the sample code:

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

