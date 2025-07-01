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

IoTDB 提供了权限管理功能，用于对数据和集群系统执行精细的访问控制，保障数据与系统安全。本篇介绍了 IoTDB 表模型中权限模块的基本概念、用户定义、权限管理、鉴权逻辑与功能用例。

## 1. 基本概念

### 1.1 用户

用户即数据库的合法使用者。一个用户与一个唯一的用户名相对应，并且拥有密码作为身份验证的手段。一个人在使用数据库之前，必须先提供合法的（即存于数据库中的）用户名与密码。

### 1.2 权限

数据库提供多种操作，但并非所有的用户都能执行所有操作。如果一个用户可以执行某项操作，则称该用户有执行该操作的权限。

### 1.3 角色

角色是若干权限的集合，并且有一个唯一的角色名作为标识符。角色通常和一个现实身份相对应（例如交通调度员），而一个现实身份可能对应着多个用户。这些具有相同现实身份的用户往往具有相同的一些权限，角色就是为了能对这样的权限进行统一的管理的抽象。

### 1.4 默认用户与角色

安装初始化后的 IoTDB 中有一个默认用户 root，默认密码为 root。该用户为管理员用户，拥有所有权限，无法被赋予、撤销权限，也无法被删除，数据库内仅有一个管理员用户。一个新创建的用户或角色不具备任何权限。


## 2. 权限列表

IoTDB 表模型主要有两类权限：全局权限、数据权限。

### 2.1 全局权限

全局权限包含用户管理和角色管理。

下表描述了全局权限的种类：

| 权限名称 | 描述                                                                                     |
| ----------------- |----------------------------------------------------------------------------------------|
| MANAGE\_USER    | - 允许用户创建用户 <br>- 允许用户删除用户 <br>- 允许用户修改用户密码 <br>- 允许用户查看用户的权限信息 <br>- 允许用户列出所有用户        |
| MANAGE\_ROLE    | - 允许用户创建角色 <br>- 允许用户删除角色 <br>- 允许用户查看角色的权限信息 <br>- 允许用户将角色授予某个用户或撤销 <br>- 允许用户列出所有角色  |


### 2.2 数据权限

数据权限由权限类型和范围组成。

* 权限类型包括：CREATE（创建权限），DROP（删除权限），ALTER（修改权限），SELECT（查询数据权限），INSERT（插入/更新数据权限），DELETE（删除数据权限）。

* 范围包括：ANY（系统范围内），DATABASE（数据库范围内），TABLE（单个表）。
  - 作用于 ANY 的权限会影响所有数据库和表。
  - 作用于数据库的权限会影响该数据库及其所有表。
  - 作用于表的权限仅影响该表。
  
* 范围生效说明：执行单表操作时，数据库会匹配用户权限与数据权限范围。例如，用户尝试向 DATABASE1.TABLE1 写入数据时，系统会依次检查用户是否有对 ANY、DATABASE1或 DATABASE1.TABLE1 的写入权限，直到匹配成功或者匹配失败。
  
* 权限类型、范围及效果逻辑关系如下表所示：

<table style="text-align: left;">
  <tbody>
     <tr>   <th>权限类型</th>
            <th>权限范围（层级）</th>        
            <th>权限效果</th>
      </tr>
      <tr>
            <td rowspan="3">CREATE</td>   
            <td>ANY</td> 
            <td>允许创建任意表、创建任意数据库</td> 
      </tr>
      <tr>
            <td>数据库</td>   
            <td>允许用户在该数据库下创建表;允许用户创建该名称的数据库</td> 
      </tr>
      <tr>
            <td>表</td>   
            <td>允许用户创建该名称的表</td> 
      </tr>
      <tr>
            <td rowspan="3">DROP</td>   
            <td>ANY</td> 
            <td>允许删除任意表、删除任意数据库</td> 
      </tr>
      <tr>
            <td>数据库</td>   
            <td>允许用户删除该数据库;允许用户删除该数据库下的表</td> 
      </tr>
      <tr>
            <td>表</td>   
            <td>D允许用户删除该表</td> 
      </tr>
      <tr>
            <td rowspan="3">ALTER</td>   
            <td>ANY</td> 
            <td>允许修改任意表的定义、任意数据库的定义</td> 
      </tr>
      <tr>
            <td>数据库</td>   
            <td>允许用户修改数据库的定义，允许用户修改数据库下表的定义</td> 
      </tr>
      <tr>
            <td>表</td>   
            <td>允许用户修改表的定义</td> 
      </tr>
      <tr>
            <td rowspan="3">SELECT</td>   
            <td>ANY</td> 
            <td>允许查询系统内任意数据库中任意表的数据</td> 
      </tr>
      <tr>
            <td>数据库</td>   
            <td>允许用户查询该数据库中任意表的数据</td> 
      </tr>
      <tr>
            <td>表</td>   
            <td>允许用户查询该表中的数据。执行多表查询时，数据库仅展示用户有权限访问的数据。</td> 
      </tr>
      <tr>
            <td rowspan="3">INSERT</td>   
            <td>ANY</td> 
            <td>允许任意数据库的任意表插入/更新数据</td> 
      </tr>
      <tr>
            <td>数据库</td>   
            <td>允许用户向该数据库范围内任意表插入/更新数据</td> 
      </tr>
      <tr>
            <td>表</td>   
            <td>允许用户向该表中插入/更新数据</td> 
      </tr>
      <tr>
            <td rowspan="3">DELETE</td>   
            <td>ANY</td> 
            <td>允许删除任意表的数据</td> 
      </tr>
      <tr>
            <td>数据库</td>   
            <td>允许用户删除该数据库范围内的数据</td> 
      </tr>
      <tr>
            <td>表</td>   
            <td>允许用户删除该表中的数据</td> 
      </tr>
</tbody>
</table>

## 3. 用户、角色管理
1. 创建用户（需 MANAGE_USER 权限)

```SQL
CREATE USER <USERNAME> <PASSWORD>   
eg: CREATE USER user1 'passwd'
```

- 用户名约束：4~32个字符，支持使用英文大小写字母、数字、特殊字符`（!@#$%^&*()_+-=）`，用户无法创建和管理员用户同名的用户。
- 密码约束：4~32个字符，可使用大写小写字母、数字、特殊字符`（!@#$%^&*()_+-=）`，密码默认采用 SHA-256 进行加密。

2. 更新密码

用户可以修改自己的密码，但修改其他用户密码需要具备 MANAGE_USER 权限。

```SQL
ALTER USER <USERNAME> SET PASSWORD <password>
eg: ALTER USER tempuser SET PASSWORD 'newpwd'
```

3. 删除用户（需 MANAGE_USER 权限)

```SQL
DROP USER <USERNAME>
eg: DROP USER user1
```

4. 创建角色 (需 MANAGE_ROLE 权限)

```SQL
CREATE ROLE <ROLENAME>
eg: CREATE ROLE role1
```

角色名约束：4~32个字符，支持使用英文大小写字母、数字、特殊字符`（!@#$%^&*()_+-=）`，用户无法创建和管理员用户同名的角色。

5. 删除角色 (需 MANAGE_ROLE 权限)

```SQL
DROP ROLE <ROLENAME>
eg: DROP ROLE role1
```

6. 赋予用户角色 (需 MANAGE_ROLE 权限)

```SQL
GRANT ROLE <ROLENAME> TO <USERNAME>
eg: GRANT ROLE admin TO user1
```

7. 移除用户角色  (需 MANAGE_ROLE 权限)

```SQL
REVOKE ROLE <ROLENAME> FROM <USERNAME>
eg: REVOKE ROLE admin FROM user1
```

8. 列出所有用户（需 MANAGE_USER 权限)

```SQL
LIST USER
```

9. 列出所有的角色 (需 MANAGE_ROLE 权限)

```SQL
LIST ROLE
```

10. 列出指定角色下所有用户（需 MANAGE_USER 权限)

```SQL
LIST USER OF ROLE <ROLENAME>
eg: LIST USER OF ROLE roleuser
```

11. 列出指定用户下的所有角色

用户可以列出自己的角色，但列出其他用户的角色需要拥有 MANAGE_ROLE 权限。

```SQL
LIST ROLE OF USER <USERNAME>
eg: LIST ROLE OF USER tempuser
```

12. 列出用户所有权限

用户可以列出自己的权限信息，但列出其他用户的权限需要拥有 MANAGE_USER 权限。

```SQL
LIST PRIVILEGES OF USER <USERNAME>
eg: LIST PRIVILEGES OF USER tempuser
```

13. 列出角色所有权限

用户可以列出自己具有的角色的权限信息，列出其他角色的权限需要有 MANAGE_ROLE 权限。

```SQL
LIST PRIVILEGES OF ROLE <ROLENAME>
eg: LIST PRIVILEGES OF ROLE actor
```

## 4. 权限管理

IoTDB支持通过如下三种途径进行用户授权和撤销权限：

- 超级管理员直接授予或撤销

- 拥有GRANT OPTION权限的用户授予或撤销

- 通过角色授予或撤销（由超级管理员或具备MANAGE_ROLE权限的用户操作角色）

在IoTDB 表模型中，授权或撤销权限时需遵循以下原则：

- 授权/撤销全局权限时，无需指定权限的范围。

- 授予/撤销数据权限时，需要指定权限类型和权限范围。在撤销权限时只会撤销指定的权限范围，不会受权限范围包含关系的影响。

- 允许对尚未创建的数据库或表提前进行权限规划和授权。

- 允许重复授权/撤销权限。

- WITH GRANT OPTION: 允许用户在授权范围内管理权限。用户可以授予或撤销其他用户在该范围内的权限。

### 4.1 授予权限

1. 给用户授予管理用户的权限

```SQL
GRANT MANAGE_USER TO USER <USERNAME>
eg: GRANT MANAGE_USER TO USER TEST_USER
```

2. 给用户授予创建数据库及在数据库范围内创建表的权限，且允许用户在该范围内管理权限

```SQL
GRANT CREATE ON DATABASE <DATABASE> TO USER <USERNAME> WITH GRANT OPTION
eg: GRANT CREATE ON DATABASE TESTDB TO USER TEST_USER WITH GRANT OPTION
```

3. 给角色授予查询数据库的权限

```SQL
GRANT SELECT ON DATABASE <DATABASE>TO ROLE <ROLENAME>
eg: GRANT SELECT ON DATABASE TESTDB TO ROLE TEST_ROLE
```

4. 给用户授予查询表的权限

```SQL
GRANT SELECT ON <DATABASE>.<TABLENAME> TO USER <USERNAME>
eg: GRANT SELECT ON TESTDB.TESTTABLE TO USER TEST_USER
```

5. 给角色授予查询所有数据库及表的权限

```SQL
GRANT SELECT ON ANY TO ROLE <ROLENAME>
eg: GRANT SELECT ON ANY TO ROLE TEST_ROLE
```

6. ALL 语法糖：ALL 表示对象范围内所有权限，可以使用 ALL 字段灵活地授予权限。

```sql
GRANT ALL TO USER TESTUSER
-- 将用户可以获取的所有权限授予给用户,包括全局权限和 ANY 范围的所有数据权限

GRANT ALL ON ANY TO USER TESTUSER
-- 将 ANY 范围内可以获取的所有权限授予给用户，执行该语句后，用户将拥有在所有数据库上的所有数据权限

GRANT ALL ON DATABASE TESTDB TO USER TESTUSER
-- 将 DB 范围内可以获取的所有权限授予给用户，执行该语句后，用户将拥有在该数据库上的所有数据权限

GRANT ALL ON TABLE TESTTABLE TO USER TESTUSER
-- 将 TABLE 范围内可以获取的所有权限授予给用户，执行该语句后，用户将拥有在该表上的所有数据权限
```

### 4.2 撤销权限

1. 取消用户管理用户的权限

```SQL
REVOKE MANAGE_USER FROM USER <USERNAME>
eg: REVOKE MANAGE_USER FROM USER TEST_USER
```

2. 取消用户创建数据库及在数据库范围内创建表的权限

```SQL
REVOKE CREATE ON DATABASE <DATABASE> FROM USER <USERNAME>
eg: REVOKE CREATE ON DATABASE TEST_DB FROM USER TEST_USER
```

3. 取消用户查询表的权限

```SQL
REVOKE SELECT ON <DATABASE>.<TABLENAME> FROM USER <USERNAME>
eg: REVOKE SELECT ON TESTDB.TESTTABLEFROM USER TEST_USER
```

4. 取消用户查询所有数据库及表的权限

```SQL
REVOKE SELECT ON ANY FROM USER <USERNAME>
eg: REVOKE SELECT ON ANY FROM USER TEST_USER
```

5. ALL 语法糖：ALL 表示对象范围内所有权限，可以使用 ALL 字段灵活地撤销权限。

```sql
REVOKE ALL FROM USER TESTUSER
-- 取消用户所有的全局权限以及 ANY 范围的所有数据权限

REVOKE ALL ON ANY FROM USER TESTUSER
-- 取消用户 ANY 范围的所有数据权限，不会影响 DB 范围和 TABLE 范围的权限

REVOKE ALL ON DATABASE TESTDB FROM USER TESTUSER
-- 取消用户在 DB 上的所有数据权限,不会影响 TABLE 权限

REVOKE ALL ON TABLE TESTDB FROM USER TESTUSER
-- 取消用户在 TABLE 上的所有数据权限
```

### 4.3 查看用户权限

每个用户都有一个权限访问列表，标识其获得的所有权限。可使用 `LIST PRIVILEGES OF USER <USERNAME>` 语句查看某个用户或角色的权限信息，输出格式如下：

| ROLE         | SCOPE   | PRIVIVLEGE   | WITH GRANT OPTION |
|--------------|---------| -------------- |-------------------|
|              | DB1.TB1 | SELECT       | FALSE             |
|              |         | MANAGE\_ROLE | TRUE              |
| ROLE1        | DB2.TB2 | UPDATE       | TRUE              |
| ROLE1        | DB3.\*  | DELETE       | FALSE             |
| ROLE1        | \*.\*   | UPDATE       | TRUE              |

其中：
- `ROLE` 列：如果为空，则表示为该用户的自身权限。如果不为空，则表示该权限来源于被授予的角色。
- `SCOPE` 列：表示该用户/角色的权限范围，表范围的权限表示为`DB.TABLE`，数据库范围的权限表示为`DB.*`, ANY 范围的权限表示为`*.*`。
- `PRIVIVLEGE`  列：列出具体的权限类型。
- `WITH GRANT OPTION` 列：如果为 TRUE，表示用户可以将自己的权限授予他人。
- 用户或者角色可以同时具有树模型和表模型的权限，但系统会根据当前连接的模型来显示相应的权限，另一种模型下的权限则不会显示。

## 5. 示例

以 [示例数据](../Reference/Sample-Data.md) 内容为例，两个表的数据可能分别属于 bj、sh 两个数据中心，彼此间不希望对方获取自己的数据库数据，因此我们需要将不同的数据在数据中心层进行权限隔离。

### 5.1 创建用户

使用 `CREATE USER <USERNAME> <PASSWORD>` 创建用户。例如，可以使用具有所有权限的root用户为 ln 和 sgcc 集团创建两个用户角色，名为 `bj_write_user`, `sh_write_user`，密码均为 `write_pwd`。SQL 语句为：

```SQL
CREATE USER bj_write_user 'write_pwd'
CREATE USER sh_write_user 'write_pwd'
```

使用展示用户的 SQL 语句：

```Plain
LIST USER
```

可以看到这两个已经被创建的用户，结果如下：

```sql
+-------------+
|         User|
+-------------+
|bj_write_user|
|         root|
|sh_write_user|
+-------------+
```

### 5.2 赋予用户权限

虽然两个用户已经创建，但是不具有任何权限，因此并不能对数据库进行操作，例如使用 `bj_write_user` 用户对 table1 中的数据进行写入，SQL 语句为：

```sql
IoTDB> INSERT INTO table1(region, plant_id, device_id, model_id, maintenance, time, temperature, humidity, status, arrival_time) VALUES   ('北京', '1001', '100', 'A', '180', '2025-03-26 13:37:00', 190.0, 30.1, false, '2025-03-26 13:37:34')
```

系统不允许用户进行此操作，会提示错误：

```sql
IoTDB> INSERT INTO table1(region, plant_id, device_id, model_id, maintenance, time, temperature, humidity, status, arrival_time) VALUES   ('北京', '1001', '100', 'A', '180', '2025-03-26 13:37:00', 190.0, 30.1, false, '2025-03-26 13:37:34') 
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: database is not specified
IoTDB> use database1
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 803: Access Denied: DATABASE database1
```

root 用户使用 `GRANT <PRIVILEGES> ON <DATABASE.TABLE> TO USER <USERNAME>` 语句赋予用户`bj_write_user`对 table1 的写入权限，例如：

```sql
GRANT INSERT ON database1.table1 TO USER bj_write_user
```

使用`bj_write_user`再尝试写入数据

```SQL
IoTDB> use database1
Msg: The statement is executed successfully.
IoTDB:database1> INSERT INTO table1(region, plant_id, device_id, model_id, maintenance, time, temperature, humidity, status, arrival_time) VALUES   ('北京', '1001', '100', 'A', '180', '2025-03-26 13:37:00', 190.0, 30.1, false, '2025-03-26 13:37:34')
Msg: The statement is executed successfully.
```

### 5.3 撤销用户权限

授予用户权限后，可以使用 `REVOKE <PRIVILEGES> ON <DATABASE.TABLE> FROM USER <USERNAME>`来撤销已经授予用户的权限。例如，用root用户撤销`bj_write_user`和`sh_write_user`的权限：

```sql
REVOKE INSERT ON database1.table1 FROM USER bj_write_user
REVOKE INSERT ON database1.table2 FROM USER sh_write_user
```

撤销权限后，`bj_write_user`就没有向table1写入数据的权限了。

```sql
IoTDB:database1> INSERT INTO table1(region, plant_id, device_id, model_id, maintenance, time, temperature, humidity, status, arrival_time) VALUES   ('北京', '1001', '100', 'A', '180', '2025-03-26 13:37:00', 190.0, 30.1, false, '2025-03-26 13:37:34')
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 803: Access Denied: No permissions for this operation, please add privilege INSERT ON database1.table1
```
