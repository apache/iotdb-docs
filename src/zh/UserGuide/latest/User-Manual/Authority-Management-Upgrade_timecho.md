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

IoTDB 为用户提供了权限管理操作，为用户提供对数据与集群系统的权限管理功能，保障数据与系统安全。本篇介绍IoTDB 中权限模块的基本概念、用户定义、权限管理、鉴权逻辑与功能用例。

## 1. 基本概念

### 1.1 用户

用户即数据库的合法使用者。一个用户与一个唯一的用户名相对应，并且拥有密码作为身份验证的手段。一个人在使用数据库之前，必须先提供合法的（即存于数据库中的）用户名与密码，作为用户成功登录。

### 1.2 权限

数据库提供多种操作，但并非所有的用户都能执行所有操作。如果一个用户可以执行某项操作，则称该用户有执行该操作的权限。权限通常需要一个路径来限定其生效范围，可以使用[路径模式](../Basic-Concept/Operate-Metadata_timecho.md)灵活管理权限。

### 1.3 角色

角色是若干权限的集合，并且有一个唯一的角色名作为标识符。角色通常和一个现实身份相对应（例如交通调度员），而一个现实身份可能对应着多个用户。这些具有相同现实身份的用户往往具有相同的一些权限，角色就是为了能对这样的权限进行统一的管理的抽象。

### 1.4 默认用户与角色

安装初始化后的 IoTDB 中有一个默认用户：root，默认密码为`TimechoDB@2021`。该用户为管理员用户，固定拥有所有权限，无法被赋予、撤销权限，也无法被删除，数据库内仅有一个管理员用户。

一个新创建的用户或角色不具备任何权限。

## 2. 用户定义

拥有 SECURITY 的用户可以创建用户或者角色，需要满足以下约束：

### 2.1 用户名限制

4~32个字符，支持使用英文大小写字母、数字、特殊字符（`!@#$%^&*()_+-=`）。用户无法创建和管理员用户同名的用户。

### 2.2 密码限制

12~32个字符，必须包含大写小写字母、至少一个数字、至少一个特殊字符（`!@#$%^&*()_+-=`）且不能与用户名相同。

### 2.3 角色名限制

4~32个字符，支持使用英文大小写字母、数字、特殊字符（`!@#$%^&*()_+-=`）。用户无法创建和管理员用户同名的角色。

## 3. 权限管理

IoTDB 树模型主要有两类权限：全局权限、序列权限。

### 3.1 全局权限

全局权限包含 SYSTEM、SECURITY、AUDIT 三种类型：

* SYSTEM：只具备运维操作、DDL（Data Definition Language）相关的权限。
* SECURITY：只具备管理角色（Role）或用户（User）以及为其他账号授予权限的权限。
* AUDIT ：只具备维护审计规则、查看审计日志的权限。

各权限详细描述见下表：

<table style="text-align: left;">
  <tbody>
     <tr>
            <th>权限名称</th>
            <th>原权限名称</th>
            <th>描述</th>
      </tr>
      <tr>
            <td rowspan="7">SYSTEM</td>
            <td>MANAGE_DATABASE</td>
            <td>允许用户创建、删除数据库.</td>
      </tr>
      <tr>
            <td>USE_TRIGGER</td>
            <td>允许用户创建、删除、查看触发器。</td>
      </tr>
      <tr>
            <td>USE_UDF</td>
            <td>允许用户创建、删除、查看用户自定义函数。</td>
      </tr>
      <tr>
            <td>USE_PIPE</td>
            <td>允许用户创建、开始、停止、删除、查看 PIPE。允许用户创建、删除、查看 PIPEPLUGINS。</td>
      </tr>
      <tr>
            <td>USE_CQ</td>
            <td>允许用户注册、开始、停止、卸载、查询流处理任务。允许用户注册、卸载、查询注册流处理任务插件。</td>
      </tr>
      <tr>
            <td>MAINTAIN</td>
            <td>允许用户查询、取消查询。允许用户查看变量。允许用户查看集群状态。</td>
      </tr>
      <tr>
            <td>USE_MODEL</td>
            <td>允许用户创建、删除、查询深度学习模型</td>
      </tr>
      <tr>
            <td rowspan="2">SECURITY</td>
            <td>MANAGE_USER</td>
            <td>允许用户创建、删除、修改、查看用户。</td>
      </tr>
      <tr>
            <td>MANAGE_ROLE</td>
            <td>允许用户创建、删除、查看角色。允许用户将角色授予给其他用户,或取消其他用户的角色。</td>
      </tr>
      <tr>
            <td>AUDIT</td>
            <td>无</td>
            <td>允许用户维护审计日志的规则 允许用户查看审计日志</td>
      </tr>
</tbody>
</table>

### 3.2 序列权限

序列权限约束了用户访问数据的范围与方式，支持对绝对路径与前缀匹配路径授权，可对timeseries 粒度生效。

下表描述了这类权限的种类与范围：

| 权限名称      | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| READ\_DATA    | 允许读取授权路径下的序列数据。                                                                                                                                                                                                                                                                                                                                                                                                        |
| WRITE\_DATA   | 允许读取授权路径下的序列数据。<br>允许插入、删除授权路径下的的序列数据。<br>允许在授权路径下导入、加载数据，在导入数据时，需要拥有对应路径的 WRITE\_DATA 权限，在自动创建数据库与序列时，需要有SYSTEM与 WRITE\_SCHEMA 权限。                                                                                                                                                                                                                  |
| READ\_SCHEMA  | 允许获取授权路径下元数据树的详细信息，包括：路径下的数据库、子路径、子节点、设备、序列、模版、视图等。                                                                                                                                                                                                                                                                                                                                |
| WRITE\_SCHEMA | 允许获取授权路径下元数据树的详细信息。<br>允许在授权路径下对序列、模版、视图等进行创建、删除、修改操作。<br>在创建或修改 view 的时候，会检查 view 路径的 WRITE\_SCHEMA 权限、数据源的 READ\_SCHEMA 权限。<br>在对 view 进行查询、插入时，会检查 view 路径的 READ\_DATA 权限、WRITE\_DATA 权限。<br>允许在授权路径下设置、取消、查看TTL。<br> 允许在授权路径下挂载或者接触挂载模板。<br>允许在授权路径下对序列进行全路径名称的修改操作。//V2.0.8.2 起支持该功能 |

### 3.3 权限授予与取消

在 IoTDB 中，用户可以由三种途径获得权限：

1. 由超级管理员授予，超级管理员可以控制其他用户的权限。
2. 由允许权限授权的用户授予，该用户获得权限时被指定了 grant option 关键字。
3. 由超级管理员或者有 SECURITY 的用户授予某个角色进而获取权限。

取消用户的权限，可以由以下几种途径：

1. 由超级管理员取消用户的权限。
2. 由允许权限授权的用户取消权限，该用户获得权限时被指定了 grant option 关键字。
3. 由超级管理员或者 SECURITY  的用户取消用户的某个角色进而取消权限。

* 在授权时，必须指定路径。全局权限需要指定为 root.\*\*, 而序列相关权限必须为绝对路径或者以双通配符结尾的前缀路径。
* 当授予角色权限时，可以为该权限指定 with grant option 关键字，意味着用户可以转授其授权路径上的权限，也可以取消其他用户的授权路径上的权限。例如用户 A 在被授予`集团1.公司1.**`的读权限时制定了 grant option 关键字，那么 A 可以将`集团1.公司1`以下的任意节点、序列的读权限转授给他人， 同样也可以取消其他用户 `集团1.公司1` 下任意节点的读权限。
* 在取消授权时，取消授权语句会与用户所有的权限路径进行匹配，将匹配到的权限路径进行清理，例如用户A 具有 `集团1.公司1.工厂1 `的读权限， 在取消 `集团1.公司1.** `的读权限时，会清除用户A 的 `集团1.公司1.工厂1` 的读权限。

## 4. 功能语法与示例

IoTDB 提供了组合权限，方便用户授权：

| 权限名称 | 权限范围                   |
| ---------- | ---------------------------- |
| ALL      | 所有权限                   |
| READ     | READ\_SCHEMA、READ\_DATA   |
| WRITE    | WRITE\_SCHEMA、WRITE\_DATA |

组合权限并不是一种具体的权限，而是一种简写方式，与直接书写对应的权限名称没有差异。

下面将通过一系列具体的用例展示权限语句的用法，非管理员执行下列语句需要提前获取权限，所需的权限标记在操作描述后。

### 4.1 用户与角色相关

* 创建用户（需 SECURITY  权限)

```SQL
CREATE USER <userName> <password>
eg: CREATE USER user1 'Passwd@202604'
```

* 删除用户 (需 SECURITY  权限)

```SQL
DROP USER <userName>
eg: DROP USER user1
```

* 创建角色 (需 SECURITY  权限)

```SQL
CREATE ROLE <roleName>
eg: CREATE ROLE role1
```

* 删除角色 (需 SECURITY  权限)

```SQL
DROP ROLE <roleName>
eg: DROP ROLE role1
```

* 赋予用户角色 (需 SECURITY  权限)

```SQL
GRANT ROLE <ROLENAME> TO <USERNAME>
eg: GRANT ROLE admin TO user1
```

* 移除用户角色 (需 SECURITY  权限)

```SQL
REVOKE ROLE <ROLENAME> FROM <USER>
eg: REVOKE ROLE admin FROM user1
```

* 列出所有用户  (需 SECURITY  权限)

```SQL
LIST USER
```

* 列出所有角色 (需 SECURITY  权限)

```SQL
LIST ROLE
```

* 列出指定角色下所有用户 (需 SECURITY  权限)

```SQL
LIST USER OF ROLE <roleName>
eg: LIST USER OF ROLE roleuser
```

* 列出指定用户下所有角色

用户可以列出自己的角色，但列出其他用户的角色需要拥有 SECURITY  权限。

```SQL
LIST ROLE OF USER <username> 
eg: LIST ROLE OF USER tempuser
```

* 列出用户所有权限

用户可以列出自己的权限信息，但列出其他用户的权限需要拥有 SECURITY  权限。

```SQL
LIST PRIVILEGES OF USER <username>;
eg: LIST PRIVILEGES OF USER tempuser;
```

* 列出角色所有权限

用户可以列出自己具有的角色的权限信息，列出其他角色的权限需要有 SECURITY  权限。

```SQL
LIST PRIVILEGES OF ROLE <roleName>;
eg: LIST PRIVILEGES OF ROLE actor;
```

* 修改密码

用户可以修改自己的密码，但修改其他用户密码需要具备 SECURITY  权限。

```SQL
ALTER USER <username> SET PASSWORD <password>;
eg: ALTER USER tempuser SET PASSWORD 'Newpwd@202604';
```

### 4.2 授权与取消授权

用户使用授权语句对赋予其他用户权限，语法如下：

```SQL
GRANT <PRIVILEGES> ON <PATHS> TO ROLE/USER <NAME> [WITH GRANT OPTION]；
eg: GRANT READ ON root.** TO ROLE role1;
eg: GRANT READ_DATA, WRITE_DATA ON root.t1.** TO USER user1;
eg: GRANT READ_DATA, WRITE_DATA ON root.t1.**,root.t2.** TO USER user1;
eg: GRANT SECURITY ON root.** TO USER user1 WITH GRANT OPTION;
eg: GRANT ALL ON root.** TO USER user1 WITH GRANT OPTION;
```

用户使用取消授权语句可以将其他的权限取消，语法如下：

```SQL
REVOKE <PRIVILEGES> ON <PATHS> FROM ROLE/USER <NAME>;
eg: REVOKE READ ON root.** FROM ROLE role1;
eg: REVOKE READ_DATA, WRITE_DATA ON root.t1.** FROM USER user1;
eg: REVOKE READ_DATA, WRITE_DATA ON root.t1.**, root.t2.** FROM USER user1;
eg: REVOKE SECURITY  ON root.** FROM USER user1;
eg: REVOKE ALL ON root.** FROM USER user1;
```

* **非管理员用户执行授权/取消授权语句时，需要对<PATHS> 有<PRIVILEGES> 权限，并且该权限是被标记带有 WITH GRANT OPTION 的。**
* 在授予取消全局权限时，或者语句中包含全局权限时(ALL 展开会包含全局权限），须指定 path 为 root.\*\*。 例如，以下授权/取消授权语句是合法的：

  ```SQL
  GRANT SECURITY  ON root.** TO USER user1;
  GRANT SECURITY  ON root.** TO ROLE role1  WITH GRANT OPTION;
  GRANT ALL ON  root.** TO role role1  WITH GRANT OPTION;
  REVOKE SECURITY  ON root.** FROM USER user1;
  REVOKE SECURITY  ON root.** FROM ROLE role1;
  REVOKE ALL ON root.** FROM ROLE role1;
  ```

  ```
  下面的语句是非法的：
  ```

  ```SQL
  GRANT READ, SECURITY  ON root.t1.** TO USER user1;
  GRANT ALL ON root.t1.t2 TO USER user1 WITH GRANT OPTION;
  REVOKE ALL ON root.t1.t2 FROM USER user1;
  REVOKE READ, SECURITY  ON root.t1.t2 FROM ROLE ROLE1;
  ```
* <PATH> 必须为全路径或者以双通配符结尾的匹配路径，以下路径是合法的:

  ```SQL
  root.**
  root.t1.t2.**
  root.t1.t2.t3
  ```

  ```
  以下的路径是非法的：
  ```

  ```SQL
  root.t1.*
  root.t1.**.t2
  root.t1*.t2.t3
  ```

## 5. 场景示例

根据本文中描述的 [样例数据](https://github.com/thulab/iotdb/files/4438687/OtherMaterial-Sample.Data.txt) 内容，IoTDB 的样例数据可能同时属于 ln, sgcc 等不同发电集团，不同的发电集团不希望其他发电集团获取自己的数据库数据，因此我们需要将不同的数据在集团层进行权限隔离。

### 5.1 创建用户

使用 `CREATE USER <userName> <password>` 创建用户。例如，我们可以使用具有所有权限的root用户为 ln 和 sgcc 集团创建两个用户角色，名为 ln\_write\_user, sgcc\_write\_user，密码均为 write_Pwd@2026。建议使用反引号(\`)包裹用户名。SQL 语句为：

```SQL
CREATE USER `ln_write_user` 'write_Pwd@2026';
CREATE USER `sgcc_write_user` 'write_Pwd@2026';
```

此时使用展示用户的 SQL 语句：

```SQL
LIST USER;
```

我们可以看到这两个已经被创建的用户，结果如下：

```SQL
IoTDB> CREATE USER `ln_write_user` 'write_Pwd@2026';
Msg: The statement is executed successfully.
IoTDB> CREATE USER `sgcc_write_user` 'write_Pwd@2026';
Msg: The statement is executed successfully.
IoTDB> LIST USER;
+------+---------------+-----------------+-----------------+
|UserId|           User|MaxSessionPerUser|MinSessionPerUser|
+------+---------------+-----------------+-----------------+
|     0|           root|               -1|                1|
| 10000|  ln_write_user|               -1|               -1|
| 10001|sgcc_write_user|               -1|               -1|
+------+---------------+-----------------+-----------------+
Total line number = 3
It costs 0.005s
```

### 5.2 赋予用户权限

此时，虽然两个用户已经创建，但是他们不具有任何权限，因此他们并不能对数据库进行操作，例如我们使用 ln\_write\_user 用户对数据库中的数据进行写入，SQL 语句为：

```SQL
INSERT INTO root.ln.wf01.wt01(timestamp,status) values(1509465600000,true);
```

此时，系统不允许用户进行此操作，会提示错误：

```SQL
IoTDB> INSERT INTO root.ln.wf01.wt01(timestamp,status) values(1509465600000,true);
Msg: 803: No permissions for this operation, please add privilege WRITE_DATA on [root.ln.wf01.wt01.status]
```

现在，我们用 root 用户分别赋予他们向对应路径的写入权限.

我们使用 `GRANT <PRIVILEGES> ON <PATHS> TO USER <username>` 语句赋予用户权限,例如：

```SQL
GRANT WRITE_DATA ON root.ln.** TO USER `ln_write_user`;
GRANT WRITE_DATA ON root.sgcc1.**, root.sgcc2.** TO USER `sgcc_write_user`;
```

执行状态如下所示：

```SQL
IoTDB> GRANT WRITE_DATA ON root.ln.** TO USER `ln_write_user`;
Msg: The statement is executed successfully.
IoTDB> GRANT WRITE_DATA ON root.sgcc1.**, root.sgcc2.** TO USER `sgcc_write_user`;
Msg: The statement is executed successfully.
```

接着使用ln\_write\_user再尝试写入数据

```SQL
IoTDB> INSERT INTO root.ln.wf01.wt01(timestamp, status) values(1509465600000, true);
Msg: The statement is executed successfully.
```

### 5.3 撤销用户权限

授予用户权限后，我们可以使用 `REVOKE <PRIVILEGES> ON <PATHS> FROM USER <USERNAME>`来撤销已经授予用户的权限。例如，用root用户撤销ln\_write\_user和sgcc\_write\_user的权限：

```SQL
REVOKE WRITE_DATA ON root.ln.** FROM USER `ln_write_user`
REVOKE WRITE_DATA ON root.sgcc1.**, root.sgcc2.** FROM USER `sgcc_write_user`
```

执行状态如下所示：

```SQL
IoTDB> REVOKE WRITE_DATA ON root.ln.** FROM USER `ln_write_user`
Msg: The statement is executed successfully.
IoTDB> REVOKE WRITE_DATA ON root.sgcc1.**, root.sgcc2.** FROM USER `sgcc_write_user`
Msg: The statement is executed successfully.
```

撤销权限后，ln\_write\_user就没有向root.ln.\*\*写入数据的权限了。

```SQL
IoTDB> INSERT INTO root.ln.wf01.wt01(timestamp, status) values(1509465600000, true)
Msg: 803: No permissions for this operation, please add privilege WRITE_DATA on [root.ln.wf01.wt01.status]
```

## 6. 鉴权及其他

### 6.1 鉴权

用户权限主要由三部分组成：权限生效范围（路径）， 权限类型， with grant option 标记：

```Plain
userTest1 : 
    root.t1.**  -  read_schema, read_data     -    with grant option
    root.**     -  write_schema, write_data   -    with grant option
```

每个用户都有一个这样的权限访问列表，标识他们获得的所有权限，可以通过 `LIST PRIVILEGES OF USER <username>` 查看他们的权限。

在对一个路径进行鉴权时，数据库会进行路径与权限的匹配。例如检查 `root.t1.t2` 的 read\_schema 权限时，首先会与权限访问列表的 `root.t1.**`进行匹配，匹配成功，则检查该路径是否包含待鉴权的权限，否则继续下一条路径-权限的匹配，直到匹配成功或者匹配结束。

在进行多路径鉴权时，对于多路径查询任务，数据库只会将有权限的数据呈现出来，无权限的数据不会包含在结果中；对于多路径写入任务，数据库要求必须所有的目标序列都获得了对应的权限，才能进行写入。

请注意，下面的操作需要检查多重权限

1. 开启了自动创建序列功能，在用户将数据插入到不存在的序列中时，不仅需要对应序列的写入权限，还需要序列的元数据修改权限。
2. 执行 select into 语句时，需要检查源序列的读权限与目标序列的写权限。需要注意的是源序列数据可能因为权限不足而仅能获取部分数据，目标序列写入权限不足时会报错终止任务。
3. View 权限与数据源的权限是独立的，向 view 执行读写操作仅会检查 view 的权限，而不再对源路径进行权限校验。

### 6.2 其他说明

角色是权限的集合，而权限和角色都是用户的一种属性。即一个角色可以拥有若干权限。一个用户可以拥有若干角色与权限（称为用户自身权限）。

目前在 IoTDB 中并不存在相互冲突的权限，因此一个用户真正具有的权限是用户自身权限与其所有的角色的权限的并集。即要判定用户是否能执行某一项操作，就要看用户自身权限或用户的角色的所有权限中是否有一条允许了该操作。用户自身权限与其角色权限，他的多个角色的权限之间可能存在相同的权限，但这并不会产生影响。

需要注意的是：如果一个用户自身有某种权限（对应操作 A），而他的某个角色有相同的权限。那么如果仅从该用户撤销该权限无法达到禁止该用户执行操作 A 的目的，还需要从这个角色中也撤销对应的权限，或者从这个用户将该角色撤销。同样，如果仅从上述角色将权限撤销，也不能禁止该用户执行操作 A。

同时，对角色的修改会立即反映到所有拥有该角色的用户上，例如对角色增加某种权限将立即使所有拥有该角色的用户都拥有对应权限，删除某种权限也将使对应用户失去该权限（除非用户本身有该权限）。
