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

# 表模型权限

表模型与树模型两者类别并无区别，但是不同的权限在不同系统中语义是不同的。他们采取近乎一致的存储策略与鉴权策略，但两者是相互隔离的。

为什么不在两个模型中维护一个权限系统，主要有如下原因：

1. 表模型与树模型的使用者一般是不同的，一条权限命令影响两个模型，会导致用户的管理与学习成本上升。
2. 表模型与树模型之间存在功能上的冲突，树模型权限不做修改无法直接应用于表。

在表模型下，我们保留了绝大多数树模型下的权限概念。

以下是树模型的权限类别：

| 序列权限     |                                                              |
| ------------ | ------------------------------------------------------------ |
| 权限名称     | 描述                                                         |
| READ_DATA    | 允许读取授权路径下的序列数据。                               |
| WRITE_DATA   | 允许读取授权路径下的序列数据。允许插入、删除授权路径下的的序列数据。允许在授权路径下导入、加载数据，在导入数据时，需要拥有对应路径的写数据权限，在自动创建序列或数据库时，需要有 Manage_Database 与 write_schema 权限。 |
| READ_SCHEMA  | 允许获取授权路径下元数据树的详细信息：包括：路径下的数据库、子路径、子节点、设备、序列、模版、视图等。 |
| WRITE_SCHEMA | 允许获取授权路径下元数据树的详细信息。允许在授权路径下对序列、模版、视图等进行创建、删除、修改操作。在创建或修改 view 的时候，会检查 view 路径的 WRITE_SCHEMA 权限、数据源的 READ_SCHEM A 权限。在对 view 进行查询、插入时，会检查 view 路径的 READ_DATA 权限、WRITE_DATA 权限。允许在授权路径下设置、取消、查看TTL。模板的创建是全局的，但只能对指定路径挂载或解除挂载模板，只能查看或删除挂载在自己路径下的模板或没有挂载的模板。 |

| 全局权限        |                                                              |
| :-------------- | ------------------------------------------------------------ |
| 权限名称        | 描述                                                         |
| MANAGE_DATABASE | 允许用户创建、删除数据库。                                   |
| MANAGE_USER     | 允许用户创建、删除、修改、查看用户。                         |
| MANAGE_ROLE     | 允许用户创建、删除、修改、查看角色。                         |
| USE_TRIGGER     | 允许用户创建、删除、查看触发器。与触发器的数据源权限检查相独立。 |
| USE_UDF         | 允许用户创建、删除、查看用户自定义函数。与自定义函数的数据源权限检查相独立。 |
| USE_CQ          | 允许用户创建、删除、查看连续查询。与连续查询的数据源权限检查相独立。 |
| USE_PIPE        | 允许用户创建、开始、停止、删除、查看管道。允许用户创建、删除、查看管道插件。与管道的数据源权限检查相独立。 |
| EXTEND_TEMPLATE | 自动创建模板权限。 允许使用alter add语法修改模板。           |
| MAINTAIN        | 允许用户取消查询。允许用户查看变量。                         |

# 表模型权限类别

为了降低用户的使用门槛，我们使用与上述类型一致的权限来管理表模型的访问控制。由于全局权限与表和树无关，我们保留了这些权限类别与含义。

全局权限，这些权限绑定于用户，是用户的自有属性，与序列无关。

| 全局权限        |                                                              |
| :-------------- | ------------------------------------------------------------ |
| 权限名称        | 描述                                                         |
| MANAGE_DATABASE | 允许用户创建、删除数据库。允许用户修改数据库属性。           |
| MANAGE_USER     | 允许用户创建、删除、修改、查看用户。                         |
| MANAGE_ROLE     | 允许用户创建、删除、修改、查看角色。                         |
| USE_TRIGGER     | 允许用户创建、删除、查看触发器。与触发器的数据源权限检查相独立。 |
| USE_UDF         | 允许用户创建、删除、查看用户自定义函数。与自定义函数的数据源权限检查相独立。 |
| USE_CQ          | 允许用户创建、删除、查看连续查询。与连续查询的数据源权限检查相独立。 |
| USE_PIPE        | 允许用户创建、开始、停止、删除、查看管道。允许用户创建、删除、查看管道插件。与管道的数据源权限检查相独立。 |
| EXTEND_TEMPLATE | 自动创建模板权限。 允许使用alter add语法修改模板。           |
| MAINTAIN        | 允许用户取消查询。允许用户查看变量。                         |

| 对象权限     |                                                              |                                                              |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 权限类型     | 权限对象                                                     | 权限效果                                                     |
| WRITE_DATA   | 数据库                                                       | 允许用户向该数据库内插入数据 允许用户查询该数据库内数据      |
| 表           | 允许用户向该表中插入数据 允许用户查询该表中数据              |                                                              |
| WRITE_SCHEMA | 数据库                                                       | 允许用户在该数据库下创建表 允许用户删除该数据库下的表 允许用户更改该数据库下的表的属性允许删除该数据库 |
| 表           | 允许用户修改该表 允许用户修改表的列名，增加删除列允许删除该表 |                                                              |
| READ_DATA    | 数据库                                                       | 允许用户查询数据库内表的数据                                 |
| 表           | 允许用户查询该表的数据                                       |                                                              |
| READ_SCHEMA  | 数据库                                                       | 允许用户列出数据库中的表 允许列出数据库的元数据定义          |
| 表           | 允许用户列出表的定义                                         |                                                              |

# 各类操作对应的权限

在表模型下，各类操作对应需求的权限：

| 操作范围             | 操作类别                                                     | 操作                                                         | 所求权限                                                     | 权限类别                                                     | 备注                                                         |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 数据库               | DDL                                                          | 创建数据库                                                   | MANAGE_DATABASE                                              | 全局权限                                                     | 创建操作是特殊的，需要全局权限来控制。所有对象的权限的创建权限依附于其上一层权限。最上一层是Database，对应的就是MANAGE_DATABASE。 |
| DDL                  | 删除数据库                                                   | MANAGE_DATABASE/WRITE_SCHEMA                                 | 全局权限/对象权限                                            | 全局管理者/创建者可以删除数据库 授予WRITE_SCHEMA 的用户即该数据库的管理者可以删除该数据库 |                                                              |
| 修改数据库属性       | MANAGE_DATABASE/WRITE_SCHEMA                                 | 全局权限/对象权限                                            | 全局管理者/创建者可以修改数据库 该数据库的管理者可以修改数据库属性 |                                                              |                                                              |
| DQL                  | 查看数据库                                                   | MANAGE_DATABASE/READ_SCHEMA/WRITE_SCHEMA                     | 全局权限/对象权限                                            | 数据库管理者允许查看数据库拥有数据库对象的READ/WRITE_SCHEMA 权限的用户可以列出数据库 |                                                              |
|                      | 使用数据库                                                   | 不要求具体权限                                               |                                                              | 用户至少拥有该数据库/表的至少一个权限。                      |                                                              |
| 表                   | DDL                                                          | 创建表                                                       | 在指定数据库上拥有 WRITE_SCHEMA 权限                         | 对象权限                                                     | 在数据库上拥有权限的，可以创建、删除表                       |
| 删除表               | 在指定数据库上有WRITE_SCHEMA 权限。在指定表上有WRITE_SCHEMA 权限。 | 对象权限                                                     |                                                              |                                                              |                                                              |
| 增删属性列、物理量列 | 在指定数据库上有WRITE_SCHEMA 权限。 在指定的表上有WRITE_SCHEMA 权限。 |                                                              |                                                              |                                                              |                                                              |
| 自动注册/扩展Schema  | 在指定的表上/数据库下有WRITE_SCHEMA 权限并且拥有EXTEND_TEMPLATE 权限 | 对象权限+ 全局权限                                           |                                                              |                                                              |                                                              |
| 创建索引             | 在数据库上有WRITE_SHCEMA权限 在指定的表上有WRITE_SCHEMA 权限。 | 对象权限                                                     |                                                              |                                                              |                                                              |
| 删除索引             | 在数据库上有WRITE_SCHEMA 权限。 在指定的表上有WRITE_SCHEMA 权限。 | 对象权限                                                     |                                                              |                                                              |                                                              |
| 修改表的TTL          | 在数据库上有WRITE_SHCEMA 权限。 在指定的表上有WRITE_SCHEMA 权限。 | 对象权限                                                     |                                                              |                                                              |                                                              |
| DQL                  | 列出表                                                       | 在指定的数据库上拥有 WRITE_SCHEMA 权限或者READ_SCEHMA 权限， 或者拥有表的某个权限 | 对象权限                                                     |                                                              |                                                              |
| 查看表结构           | 在指定的数据库上有WRITE_SCHEMA或者READ_SCHEMA 权限 或者在对应的表上有READ_DATA、READ_SCHEMA、或者WRITE_DATA、WRITE_SCHEMA 权限 | 对象权限                                                     | READ_DATA 同样可以列出表结构，因为查询时这些数据其实已经拿到了 |                                                              |                                                              |
| 查看索引             | 在数据库上有READ/WRITE_SCHEMA 权限。在指定的表上有READ/WRITE_SCHEMA 权限。 | 对象权限                                                     |                                                              |                                                              |                                                              |
| 查看TTL              | 在指定的表上有READ/WRITE_SCHEMA 权限。在指定的数据库上有READ/WRITE_SCHEMA 权限。 | 对象权限                                                     |                                                              |                                                              |                                                              |
| DML                  | 数据写入                                                     | 在指定的数据库上拥有WRITE_DATA权限或在指定的数据表上拥有WRITE_DATA权限 | 对象权限                                                     |                                                              |                                                              |
| 数据更新             | 在指定的数据库上拥有WRITE_DATA权限或在指定的数据表上拥有WRITE_DATA权限 | 对象权限                                                     |                                                              |                                                              |                                                              |
| DQL                  | 数据查询                                                     | 在指定的数据库上拥有READ/WRITE_DATA 权限在指定的数据表上有READ/WRITE_DATA 权限 | 对象权限                                                     |                                                              |                                                              |

# 权限的基本语法：

基本授权语法：

```SQL
GRANT privilege [on Object] TO role_spec [with grant option]
privilege:
       READ_DATA|WRITE_DATA|READ_SCHEMA|WRITE_SCHEMA|other system privileges | ALL
Object:
        ObjectType ObjectName 
ObjectType:
        Database | Table
role_spec:
        roletype rolename
roletype:
        role | user
```

例如

```SQL
GRANT READ_DATA ON DATABASE DB1 TO USER USER1;  
GRANT READ_DATA ON TABLE TABLE1 TO USER USER1;    -- 对USE DATABASE 下的表进行授权。
GRANT WRITE_DATA ON TABLE TABLE2 TO ROLE ROLE1;
GRANT WRITE_SCHEMA ON TABLE TABLE3 TO USER USER1 WITH GRANT OPTION;
GRANT MANAGE_DATABASE TO USER USER1;
GRANT MANAGE_USER TO USER USER1;
```

基本取消授权语法：

```SQL
revoke privilege_object [on Object] from role_spec;
privilege_object:
        GRANT OPTION FOR privilege | privilege
privilege:
        READ_SCHEMA| READ_DATA|WRITE_SCHEMA|WRITE_DATA|other system privileges
        
Object:
        ObjectType ObjectName
ObjectType:
        Database | Table
        
role_spec:
        roletype rolename
roletype:
        role | user
```

例如

```SQL
REVOKE READ_DATA ON DATABASE DB1 FROM USER USER1;
REVOKE READ_SCHEMA ON DATABASE DB2 FROM USER USER1;
REVOKE READ_DATA ON TABLE TB1 FROM USER USER1;
REVOKE MANAGE_DATABASE FROM ROLE ROLE1;
REVOKE MANAGE_USER FROM ROLE ROLE2;
REVOKE GRANT OPTION FOR MANAGE_USER FROM USER USER2;
REVOKE GRANT OPTION FOR READ_DATA ON DATABASE DB1 FROM USER USER3;
```

# 一个例子

下面将通过一个具体的例子，展示表模型权限的使用过程。

在数据库初始化之后，只有超级管理员拥有所有的权限，因此所有用户的权限根源自超级管理员。

超级管理员可以自行创建数据库，或者将 MANAGE_DATABASE 权限授予给数据库管理员DB_MANAGER， 并允许他将该权限进行授予或者取消他人的权限:

```SQL
GRANT MANAGE_DATABASE TO USER DB_MANAGER WITH GRANT OPTION;
```

DB_MANAGER 拥有了创建、删除、修改数据库的权力，他可以创建或者删除数据库：

```SQL
CREATE DATABASE DB1;
```

DB_MANAGER 可以将该数据库的DDL限授予给该数据库的管理者 DB1_MR，或者将读取权限授予数据库的使用者 DB1_USER;

仅授予READ_DATA 权限会导致DB1_USER 无法获取DB下的表名，因此还可以将READ_SCHEMA 权限授予给DB1_USER;

```SQL
GRANT WRITE_SCHEMA ON DATABASE DB1 TO USER DB1_MR WITH GRANT OPTION；
GRANT READ_DATA ON DATABASE DB1 TO USER DB1_USER;
GRANT READ_SCHEMA ON DATABASE DB1 TO USER DB1_USER;
```

在DATABASE 上拥有WRITE_SCHEMA 权限的用户可以执行创建表的操作， 例如DB1_MR 可以创建表：

```SQL
create table TABLE1
(
    地区 TEXT ID,
    厂号 TEXT ID,
    设备号 TEXT ID,
    型号 TEXT ATTRIBUTE,
    温度 FLOAT MEASUREMENT,
    排量 DOUBLE MEASUREMENT,
)
with 
TTL=3600000
```

数据库的使用者DB1_USER 拥有全数据库的表的查询权限，他可以查询该表，也可以查阅该表的元数据定义。但是不允许修改该表、也不允许修改表的数据。

DB1_MR 在创建了表之后，可以将该表的读写权限授予给某个用户例如：

```SQL
GRANT READ_DATA ON TABLE TABLE1 TO USER USER_TABLE_READER; -- 将读权限授予给USER_TABLE_READER, 该用户可以执行表中的查询
GRANT WRITE_SCHEMA ON TABLE TABLE1 TO USER USER_TABLE_MANAGER WITH GRANT OPTION; -- 将元数据修改权限授予给USER_TABLE_MANAGER, 该用户可以对表进行DDL 修改，包括修改表名、增加、删除列，创建、删除索引、修改TTL等
GRANT WRITE_DATA ON TABLE TABLE1 TO ROLE USER_TABLE_WRITER;
```

如果要取消USER_TABLE_READER 的权限，可以执行如下操作：

```SQL
REVOKE READ_DATA ON TABLE TABLE1 FROM USER_TABLE_READER;
```

如果只要取消 USER_TABLE_MANAGER 在 WRITE_SCHEMA 权限的控制，可以执行如下操作：

```SQL
REVOKE GRANT OPTION ON WRITE_SCHEMA FROM USER USER_TABLE_MANAGER;
```