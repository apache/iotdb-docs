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

```shell
pip3 install apache-iotdb>=2.0
```
注意：请勿使用高版本客户端连接低版本服务。

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

自 V2.0.8.2 版本起，SessionDataSet 提供分批获取 DataFrame 的方法，用于高效处理大数据量查询：

```python
# 分批获取 DataFrame
has_next = result.has_next_df()
if has_next:
    df = result.next_df()
    # 处理 DataFrame
```

**方法说明：**
- `has_next_df()`: 返回 `True`/`False`，表示是否还有数据可返回
- `next_df()`: 返回 `DataFrame` 或 `None`，每次返回 `fetchSize` 行（默认5000行，由 Session 的 `fetch_size` 参数控制）
    - 剩余数据 ≥ `fetchSize` 时，返回 `fetchSize` 行
    - 剩余数据 < `fetchSize` 时，返回剩余所有行
    - 数据遍历完毕时，返回 `None`
- 初始化 Session 时检查 `fetchSize`，若 ≤0 则重置为 5000 并打印警告日志

**注意：** 不要混合使用不同的遍历方式，如（todf函数与 next_df 混用），否则会出现预期外的错误。


自 V2.0.8.3 版本起，Python 客户端在 `Tablet`批量写入与 `Session` 值序列化中支持  `TSDataType.OBJECT` ，查询结果经 `Field` 读取，相关接口定义如下：

| 函数名                              | 功能                                                       | 参数                                                                            | 返回值                                                                                  |
| ------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| encode\_object\_cell                | 将一格 OBJECT 编成线格式字节                               | is\_eof: bool,offset: int,content: bytes                                        | bytes：\|[eof 1B]\|[offset 8B BE]\|[payload]\|                                          |
| decode\_object\_cell                | 把线格式一格解析回 eof、offset、payload                    | cell: bytes（长度 ≥ 9）                                                        | Tuple[bool, int, bytes]：(is\_eof, offset, payload)                                     |
| Tablet.add\_value\_object           | 在指定行列写入一格 OBJECT（内部调用 encode\_object\_cell） | row\_index: int，column\_index: int，is\_eof: bool，offset: int，content: bytes | None                                                                                    |
| Tablet.add\_value\_object\_by\_name | 同上，按列名定位列                                         | column\_name: str，row\_index: int，is\_eof: bool，offset: int，content: bytes  | None                                                                                    |
| NumpyTablet.add\_value\_object      | 与 Tablet.add\_value\_object 相同语义，列数据为 ndarray    | 同上（row\_index、column\_index、…）                                           | None                                                                                    |
| Field.get\_object\_value            | 按「目标类型」把 value 转成 Python 值                      | data\_type: TSDataType                                                          | 随类型：OBJECT 时为 self.value 整段 UTF-8 解码 得到的 str（见[Field.py](https://github.com/apache/iotdb/blob/master/iotdb-client/client-py/iotdb/utils/Field.py)） |
| Field.get\_string\_value            | 字符串化展示                                               | 无                                                                              | str；OBJECT 时为 self.value.decode("utf-8")                                             |
| Field.get\_binary\_value            | 取 TEXT/STRING/BLOB 的二进制                               | 无                                                                              | bytes 或 None；OBJECT 列会抛错，不应调用                                                |


#### 2.1.3 接口展示

**TableSession:**


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

#### 2.2.1 功能描述

TableSessionConfig是一个配置类，用于设置和创建TableSession 实例。它定义了连接到IoTDB数据库所需的各种参数。

#### 2.2.2 配置选项

| **配置项**         | **描述**                  | **类型** | **默认值**                                 |
| ------------------ | ------------------------- | -------- |-----------------------------------------|
| node_urls          | 数据库连接的节点 URL 列表 | list     | ["localhost:6667"]                      |
| username           | 数据库连接用户名          | str      | "root"                                  |
| password           | 数据库连接密码            | str      | "TimechoDB@2021" //V2.0.6.x 之前默认密码是root |
| database           | 要连接的目标数据库        | str      | None                                    |
| fetch_size         | 每次查询获取的行数        | int      | 5000                                    |
| time_zone          | 会话的默认时区            | str      | Session.DEFAULT_ZONE_ID                 |
| enable_compression | 是否启用数据压缩          | bool     | False                                   |

#### 2.2.3 接口展示

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
                                      Defaults to "TimechoDB@2021". //V2.0.6.x 之前默认密码是root 
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

```Python
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


```Python
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
### 3.3 SSL 连接

#### 3.3.1 服务器端配置证书

`conf/iotdb-system.properties` 配置文件中查找或添加以下配置项：

```
enable_thrift_ssl=true
key_store_path=/path/to/your/server_keystore.jks
key_store_pwd=your_keystore_password
```

#### 3.3.2 配置 python 客户端证书

- 设置 use_ssl 为 True 以启用 SSL。
- 指定客户端证书路径，使用 ca_certs 参数。

```
use_ssl = True
ca_certs = "/path/to/your/server.crt"  # 或 ca_certs = "/path/to/your//ca_cert.pem"
```
**示例代码：使用 SSL 连接 IoTDB**

```Python
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

from iotdb.SessionPool import PoolConfig, SessionPool
from iotdb.Session import Session

ip = "127.0.0.1"
port_ = "6667"
username_ = "root"
password_ = "TimechoDB@2021" //V2.0.6.x 之前默认密码是root 
# Configure SSL enabled
use_ssl = True
# Configure certificate path
ca_certs = "/path/server.crt"


def get_data():
    session = Session(
        ip, port_, username_, password_, use_ssl=use_ssl, ca_certs=ca_certs
    )
    session.open(False)
    with session.execute_query_statement("SHOW DATABASES") as session_data_set:
        print(session_data_set.get_column_names())
        while session_data_set.has_next():
            print(session_data_set.next())

    session.close()


def get_data2():
    pool_config = PoolConfig(
        host=ip,
        port=port_,
        user_name=username_,
        password=password_,
        fetch_size=1024,
        time_zone="UTC+8",
        max_retry=3,
        use_ssl=use_ssl,
        ca_certs=ca_certs,
    )
    max_pool_size = 5
    wait_timeout_in_ms = 3000
    session_pool = SessionPool(pool_config, max_pool_size, wait_timeout_in_ms)
    session = session_pool.get_session()
    with session.execute_query_statement("SHOW DATABASES") as session_data_set:
        print(session_data_set.get_column_names())
        while session_data_set.has_next():
            print(session_data_set.next())
    session_pool.put_back(session)
    session_pool.close()


if __name__ == "__main__":
    df = get_data()
```

## 4. 示例代码

Session示例代码:[Session Example](https://github.com/apache/iotdb/blob/master/iotdb-client/client-py/table_model_session_example.py)

SessionPool示例代码:[SessionPool Example](https://github.com/apache/iotdb/blob/master/iotdb-client/client-py/table_model_session_pool_example.py)

```Python
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
        "CREATE TABLE table0 (id1 string tag, attr1 string attribute, "
        + "m1 double "
        + "field)"
    )
    session.execute_non_query_statement(
        "CREATE TABLE table1 (id1 string tag, attr1 string attribute, "
        + "m1 double "
        + "field)"
    )

    print("now the tables are:")
    # show result
    with session.execute_query_statement("SHOW TABLES") as res:
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
    column_types = [ColumnType.TAG, ColumnType.ATTRIBUTE, ColumnType.FIELD]
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
    with session.execute_query_statement("select * from table0") as res:
        while res.has_next():
            print(res.next())

    print("get data from table1")
    with session.execute_query_statement("select * from table1") as res:
      while res.has_next():
          print(res.next())
        
    # 使用分批DataFrame方式查询表数据（推荐大数据量场景）
    print("get data from table0 using batch DataFrame")
    with session.execute_query_statement("select * from table0") as res:
      while res.has_next_df(): 
          print(res.next_df()) 

    session.close()


def delete_data():
    session = session_pool.get_session()
    session.execute_non_query_statement("drop database db1")
    print("data has been deleted. now the databases are:")
    with session.execute_query_statement("show databases") as res:
        while res.has_next():
            print(res.next())
    session.close()


# Create a session pool
username = "root"
password = "TimechoDB@2021" //V2.0.6.x 之前默认密码是root 
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

Object 类型使用示例：

```Python
import os

import numpy as np
import pytest

from iotdb.utils.IoTDBConstants import TSDataType
from iotdb.utils.NumpyTablet import NumpyTablet
from iotdb.utils.Tablet import Tablet, ColumnType
from iotdb.utils.object_column import decode_object_cell


def _require_thrift():
    pytest.importorskip("iotdb.thrift.common.ttypes")


def _session_endpoint():
    host = os.environ.get("IOTDB_HOST", "127.0.0.1")
    port = int(os.environ.get("IOTDB_PORT", "6667"))
    return host, port


@pytest.fixture(scope="module")
def table_session():
    _require_thrift()
    from iotdb.Session import Session
    from iotdb.table_session import TableSession, TableSessionConfig

    host, port = _session_endpoint()
    cfg = TableSessionConfig(
        node_urls=[f"{host}:{port}"],
        username=os.environ.get("IOTDB_USER", Session.DEFAULT_USER),
        password=os.environ.get("IOTDB_PASSWORD", Session.DEFAULT_PASSWORD),
    )
    ts = TableSession(cfg)
    yield ts
    ts.close()


def test_table_numpy_tablet_object_columns(table_session):
    """
    Table model: Tablet.add_value_object / add_value_object_by_name,
    NumpyTablet.add_value_object, insert + query Field + decode_object_cell；
    另含同一 time 上分两段写入 OBJECT（先 is_eof=False/offset=0，再 is_eof=True/offset=首段长度），
    并用 read_object(f1) 校验拼接后的完整字节。
    """
    db = "test_py_object_e2e"
    table = "obj_tbl"
    table_session.execute_non_query_statement(f"create database if not exists {db}")
    table_session.execute_non_query_statement(f"use {db}")
    table_session.execute_non_query_statement(f"drop table if exists {table}")
    table_session.execute_non_query_statement(
        f"create table {table}("
        "device STRING TAG, temp FLOAT FIELD, f1 OBJECT FIELD, f2 OBJECT FIELD)"
    )

    column_names = ["device", "temp", "f1", "f2"]
    data_types = [
        TSDataType.STRING,
        TSDataType.FLOAT,
        TSDataType.OBJECT,
        TSDataType.OBJECT,
    ]
    column_types = [
        ColumnType.TAG,
        ColumnType.FIELD,
        ColumnType.FIELD,
        ColumnType.FIELD,
    ]
    timestamps = [100, 200]
    values = [
        ["d1", 1.5, None, None],
        ["d1", 2.5, None, None],
    ]

    tablet = Tablet(
        table, column_names, data_types, values, timestamps, column_types
    )
    tablet.add_value_object(0, 2, True, 0, b"first-row-obj")
    # 整对象单段写入：is_eof=True 且 offset=0；分段续写需满足服务端 offset/长度校验
    tablet.add_value_object_by_name("f2", 0, True, 0, b"seg")
    tablet.add_value_object(1, 2, True, 0, b"second-f1")
    tablet.add_value_object(1, 3, True, 0, b"second-f2")
    table_session.insert(tablet)

    ts_arr = np.array([300, 400], dtype=TSDataType.INT64.np_dtype())
    np_vals = [
        np.array(["d1", "d1"]),
        np.array([1.0, 2.0], dtype=np.float32),
        np.array([None, None], dtype=object),
        np.array([None, None], dtype=object),
    ]
    np_tab = NumpyTablet(
        table, column_names, data_types, np_vals, ts_arr, column_types=column_types
    )
    np_tab.add_value_object(0, 2, True, 0, b"np-r0-f1")
    np_tab.add_value_object(0, 3, True, 0, b"np-r0-f2")
    np_tab.add_value_object(1, 2, True, 0, b"np-r1-f1")
    np_tab.add_value_object(1, 3, True, 0, b"np-r1-f2")
    table_session.insert(np_tab)

    # 分段 OBJECT：先 is_eof=False（续传），再 is_eof=True（末段）；offset 为已写入字节长度
    chunk0 = bytes((i % 256) for i in range(512))
    chunk1 = b"\xab" * 64
    expected_segmented = chunk0 + chunk1
    seg1 = Tablet(
        table,
        column_names,
        data_types,
        [["d1", 3.0, None, None]],
        [500],
        column_types,
    )
    seg1.add_value_object(0, 2, False, 0, chunk0)
    seg1.add_value_object(0, 3, True, 0, b"f2-seg")
    table_session.insert(seg1)
    seg2 = Tablet(
        table,
        column_names,
        data_types,
        [["d1", 3.0, None, None]],
        [500],
        column_types,
    )
    seg2.add_value_object(0, 2, True, 512, chunk1)
    seg2.add_value_object(0, 3, True, 0, b"f2-seg")
    table_session.insert(seg2)

    with table_session.execute_query_statement(
        f"select read_object(f1) from {table} where time = 500"
    ) as ds:
        assert ds.has_next()
        row = ds.next()
        blob = row.get_fields()[0].get_binary_value()
        assert blob == expected_segmented
        assert not ds.has_next()

    seen = 0
    with table_session.execute_query_statement(
        f"select device, temp, f1, f2 from {table} order by time"
    ) as ds:
        while ds.has_next():
            row = ds.next()
            fields = row.get_fields()
            assert fields[0].get_object_value(TSDataType.STRING) == "d1"
            assert fields[1].get_object_value(TSDataType.FLOAT) is not None
            for j in (2, 3):
                raw = fields[j].value
                assert isinstance(raw, (bytes, bytearray))
                eof, off, body = decode_object_cell(bytes(raw))
                assert isinstance(eof, bool) and isinstance(off, int)
                assert isinstance(body, bytes)
                fields[j].get_string_value()
                fields[j].get_object_value(TSDataType.OBJECT)
            seen += 1
    assert seen == 5


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-rs"])
```
