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
# 权限管理

本文档为 V2.0.7 版本起权限管理的 SQL 手册，详细功能使用可见[权限管理](../User-Manual/Authority-Management-Upgrade_timecho.md)，如需查阅 V2.0.7 版本之前权限管理的功能介绍可参考[权限管理](../User-Manual/Authority-Management_timecho.md)

## 1.  权限列表

<table>
  <tbody>
    <tr>
      <th>权限类型</th>
      <th>权限名称</th>
      <th>生效范围</th>
      <th>描述</th>
    </tr>
    <!-- 全局权限 - SYSTEM -->
    <tr>
      <td rowspan="17">全局权限</td>
      <td rowspan="6">SYSTEM</td>
      <td rowspan="6">全局</td>
      <td>允许用户创建、修改、删除数据库。</td>
    </tr>
    <tr>
      <td>允许用户创建、修改、删除表及表视图。</td>
    </tr>
    <tr>
      <td>允许用户创建、删除、查看用户自定义函数。</td>
    </tr>
    <tr>
      <td>允许用户创建、开始、停止、删除、查看PIPE。允许用户创建、删除、查看PIPEPLUGINS。</td>
    </tr>
    <tr>
      <td>允许用户查询、取消查询。允许用户查看变量。允许用户查看集群状态。</td>
    </tr>
    <tr>
      <td>允许用户创建、删除、查看深度学习模型。</td>
    </tr>
    <!-- 全局权限 - SECURITY -->
    <tr>
      <td rowspan="10">SECURITY</td>
      <td rowspan="10">全局</td>
      <td>允许用户创建用户。</td>
    </tr>
    <tr>
      <td>允许用户删除用户。</td>
    </tr>
    <tr>
      <td>允许用户修改用户密码。</td>
    </tr>
    <tr>
      <td>允许用户查看用户的权限信息。</td>
    </tr>
    <tr>
      <td>允许用户列出所有用户。</td>
    </tr>
    <tr>
      <td>允许用户创建角色。</td>
    </tr>
    <tr>
      <td>允许用户删除角色。</td>
    </tr>
    <tr>
      <td>允许用户查看角色的权限信息。</td>
    </tr>
    <tr>
      <td>允许用户将角色授予某个用户或撤销。</td>
    </tr>
    <tr>
      <td>允许用户列出所有角色。</td>
    </tr>
    <!-- 全局权限 - AUDIT（新增） -->
    <tr>
      <td>AUDIT</td>
      <td>全局</td>
      <td>允许用户维护审计日志的规则 允许用户查看审计日志。</td>
    </tr>
    <!-- 数据权限 - CREATE -->
    <tr>
      <td rowspan="15">数据权限</td>
      <td rowspan="3">CREATE</td>
      <td>ANY</td>
      <td>允许创建任意表、创建任意数据库。</td>
    </tr>
    <tr>
      <td>数据库</td>
      <td>允许用户在该数据库下创建表；允许用户创建该名称的数据库。</td>
    </tr>
    <tr>
      <td>表</td>
      <td>允许用户创建该名称的表。</td>
    </tr>
    <!-- 数据权限 - ALTER -->
    <tr>
      <td rowspan="3">ALTER</td>
      <td>ANY</td>
      <td>允许修改任意表的定义、任意数据库的定义。</td>
    </tr>
    <tr>
      <td>数据库</td>
      <td>允许用户修改数据库的定义，允许用户修改数据库下表的定义。</td>
    </tr>
    <tr>
      <td>表</td>
      <td>允许用户修改表的定义。</td>
    </tr>
    <!-- 数据权限 - SELECT -->
    <tr>
      <td rowspan="3">SELECT</td>
      <td>ANY</td>
      <td>允许查询系统内任意数据库中任意表的数据。</td>
    </tr>
    <tr>
      <td>数据库</td>
      <td>允许用户查询该数据库中任意表的数据。</td>
    </tr>
    <tr>
      <td>表</td>
      <td>允许用户查询该表中的数据。执行多表查询时，数据库仅展示用户有权限访问的数据。</td>
    </tr>
    <!-- 数据权限 - INSERT -->
    <tr>
      <td rowspan="3">INSERT</td>
      <td>ANY</td>
      <td>允许任意数据库的任意表插入/更新数据。</td>
    </tr>
    <tr>
      <td>数据库</td>
      <td>允许用户向该数据库范围内任意表插入/更新数据。</td>
    </tr>
    <tr>
      <td>表</td>
      <td>允许用户向该表中插入/更新数据。</td>
    </tr>
    <!-- 数据权限 - DELETE -->
    <tr>
      <td rowspan="3">DELETE</td>
      <td>ANY</td>
      <td>允许删除任意表的数据。</td>
    </tr>
    <tr>
      <td>数据库</td>
      <td>允许用户删除该数据库范围内的数据。</td>
    </tr>
    <tr>
      <td>表</td>
      <td>允许用户删除该表中的数据。</td>
    </tr>
  </tbody>
</table>

## 2.  SQL 语句

### 2.1  用户与角色管理

1. 创建用户（需 SECURITY 权限)

```SQL
CREATE USER <USERNAME> <PASSWORD>   
eg: CREATE USER user1 'Passwd@202604';
```

2. 修改密码

用户可以修改自己的密码，但修改其他用户密码需要具备 SECURITY 权限。

```SQL
ALTER USER <USERNAME> SET PASSWORD <password>
eg: ALTER USER tempuser SET PASSWORD 'Newpwd@202604';
```

3. 删除用户（需 SECURITY 权限)

```SQL
DROP USER <USERNAME>
eg: DROP USER user1;
```

4. 创建角色 (需 SECURITY 权限)

```SQL
CREATE ROLE <ROLENAME>
eg: CREATE ROLE role1;
```

5. 删除角色 (需 SECURITY  权限)

```SQL
DROP ROLE <ROLENAME>
eg: DROP ROLE role1;
```

6. 赋予用户角色 (需 SECURITY  权限)

```SQL
GRANT ROLE <ROLENAME> TO <USERNAME>
eg: GRANT ROLE admin TO user1;
```

7. 移除用户角色  (需 SECURITY 权限)

```SQL
REVOKE ROLE <ROLENAME> FROM <USERNAME>
eg: REVOKE ROLE admin FROM user1;
```

8. 列出所有用户（需 SECURITY 权限)

```SQL
LIST USER;
```

9. 列出所有的角色 (需 SECURITY 权限)

```SQL
LIST ROLE;
```

10. 列出指定角色下所有用户（需 SECURITY 权限)

```SQL
LIST USER OF ROLE <ROLENAME>
eg: LIST USER OF ROLE roleuser;
```

11. 列出指定用户下的所有角色

用户可以列出自己的角色，但列出其他用户的角色需要拥有 SECURITY 权限。

```SQL
LIST ROLE OF USER <USERNAME>
eg: LIST ROLE OF USER tempuser;
```

12. 列出用户所有权限

用户可以列出自己的权限信息，但列出其他用户的权限需要拥有 SECURITY 权限。

```SQL
LIST PRIVILEGES OF USER <USERNAME>
eg: LIST PRIVILEGES OF USER tempuser;
```

13. 列出角色所有权限

用户可以列出自己具有的角色的权限信息，列出其他角色的权限需要有 SECURITY 权限。

```SQL
LIST PRIVILEGES OF ROLE <ROLENAME>
eg: LIST PRIVILEGES OF ROLE actor;
```

### 2.2  权限管理

#### 2.2.1 授予权限

1. 给用户授予管理用户的权限

```SQL
GRANT SECURITY TO USER <USERNAME>
eg: GRANT SECURITY TO USER TEST_USER;
```

2. 给用户授予创建数据库及在数据库范围内创建表的权限，且允许用户在该范围内管理权限

```SQL
GRANT CREATE ON DATABASE <DATABASE> TO USER <USERNAME> WITH GRANT OPTION
eg: GRANT CREATE ON DATABASE TESTDB TO USER TEST_USER WITH GRANT OPTION;
```

3. 给角色授予查询数据库的权限

```SQL
GRANT SELECT ON DATABASE <DATABASE>TO ROLE <ROLENAME>
eg: GRANT SELECT ON DATABASE TESTDB TO ROLE TEST_ROLE;
```

4. 给用户授予查询表的权限

```SQL
GRANT SELECT ON <DATABASE>.<TABLENAME> TO USER <USERNAME>
eg: GRANT SELECT ON TESTDB.TESTTABLE TO USER TEST_USER;
```

5. 给角色授予查询所有数据库及表的权限

```SQL
GRANT SELECT ON ANY TO ROLE <ROLENAME>
eg: GRANT SELECT ON ANY TO ROLE TEST_ROLE;
```

6. ALL 语法糖：ALL 表示对象范围内所有权限，可以使用 ALL 字段灵活地授予权限。

```SQL
GRANT ALL TO USER TESTUSER;
-- 将用户可以获取的所有权限授予给用户,包括全局权限和 ANY 范围的所有数据权限

GRANT ALL ON ANY TO USER TESTUSER;
-- 将 ANY 范围内可以获取的所有权限授予给用户，执行该语句后，用户将拥有在所有数据库上的所有数据权限

GRANT ALL ON DATABASE TESTDB TO USER TESTUSER;
-- 将 DB 范围内可以获取的所有权限授予给用户，执行该语句后，用户将拥有在该数据库上的所有数据权限

GRANT ALL ON TABLE TESTTABLE TO USER TESTUSER;
-- 将 TABLE 范围内可以获取的所有权限授予给用户，执行该语句后，用户将拥有在该表上的所有数据权限
```

#### 2.2.2 撤销权限

1. 取消用户管理用户的权限

```SQL
REVOKE SECURITY FROM USER <USERNAME>
eg: REVOKE SECURITY FROM USER TEST_USER;
```

2. 取消用户创建数据库及在数据库范围内创建表的权限

```SQL
REVOKE CREATE ON DATABASE <DATABASE> FROM USER <USERNAME>
eg: REVOKE CREATE ON DATABASE TEST_DB FROM USER TEST_USER;
```

3. 取消用户查询表的权限

```SQL
REVOKE SELECT ON <DATABASE>.<TABLENAME> FROM USER <USERNAME>
eg: REVOKE SELECT ON TESTDB.TESTTABLE FROM USER TEST_USER;
```

4. 取消用户查询所有数据库及表的权限

```SQL
REVOKE SELECT ON ANY FROM USER <USERNAME>
eg: REVOKE SELECT ON ANY FROM USER TEST_USER;
```

5. ALL 语法糖：ALL 表示对象范围内所有权限，可以使用 ALL 字段灵活地撤销权限。

```SQL
REVOKE ALL FROM USER TESTUSER;
-- 取消用户所有的全局权限以及 ANY 范围的所有数据权限

REVOKE ALL ON ANY FROM USER TESTUSER;
-- 取消用户 ANY 范围的所有数据权限，不会影响 DB 范围和 TABLE 范围的权限

REVOKE ALL ON DATABASE TESTDB FROM USER TESTUSER;
-- 取消用户在 DB 上的所有数据权限,不会影响 TABLE 权限

REVOKE ALL ON TABLE TESTDB FROM USER TESTUSER;
-- 取消用户在 TABLE 上的所有数据权限
```

#### 2.2.3 查看用户权限

```SQL
LIST PRIVILEGES OF USER <USERNAME>
eg: LIST PRIVILEGES OF USER tempuser
```
