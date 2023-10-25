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

IoTDB 为用户提供了权限管理操作，为用户提供对数据与集群系统的权限管理功能，保障数据与系统安全。
本篇介绍IoTDB 中权限模块的基本概念、用户定义、权限管理、鉴权逻辑与功能用例。在 JAVA 编程环境中，您可以使用 [JDBC API](../API/Programming-JDBC.md) 单条或批量执行权限管理类语句。

## 基本概念

### 用户

用户即数据库的合法使用者。一个用户与一个唯一的用户名相对应，并且拥有密码作为身份验证的手段。一个人在使用数据库之前，必须先提供合法的（即存于数据库中的）用户名与密码，作为用户成功登录。

### 权限

数据库提供多种操作，但并非所有的用户都能执行所有操作。如果一个用户可以执行某项操作，则称该用户有执行该操作的权限。权限通常需要一个路径来限定其生效范围，可以使用[路径模式](../Basic-Concept/Data-Model-and-Terminology.md)灵活管理权限。

### 角色

角色是若干权限的集合，并且有一个唯一的角色名作为标识符。角色通常和一个现实身份相对应（例如交通调度员），而一个现实身份可能对应着多个用户。这些具有相同现实身份的用户往往具有相同的一些权限，角色就是为了能对这样的权限进行统一的管理的抽象。

### 默认用户与角色

安装初始化后的 IoTDB 中有一个默认用户：root，默认密码为 root。该用户为管理员用户，固定拥有所有权限，无法被赋予、撤销权限，也无法被删除，数据库内仅有一个管理员用户。

一个新创建的用户或角色不具备任何权限。

## 用户定义

拥有 MANAGE_USER、MANAGE_ROLE 的用户或者管理员可以创建用户或者角色，需要满足以下约束：

### 用户名限制

4~32个字符，支持使用英文大小写字母、数字、特殊字符（`!@#$%^&*()_+-=`）

用户无法创建和管理员用户同名的用户。

### 密码限制

4~32个字符，可使用大写小写字母、数字、特殊字符（`!@#$%^&*()_+-=`），密码默认采用 MD5 进行加密。

### 角色名限制

4~32个字符，支持使用英文大小写字母、数字、特殊字符（`!@#$%^&*()_+-=`）

用户无法创建和管理员用户同名的角色。

## 权限管理

IoTDB 主要有两类权限：序列权限、全局权限。

### 序列权限

序列权限约束了用户访问数据的范围与方式，支持对绝对路径与前缀匹配路径授权，可对timeseries 粒度生效。

下表描述了这类权限的种类与范围：

| 权限名称         | 描述                                                                                                                                                                                                                                            |
|--------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| READ_DATA    | 允许读取授权路径下的序列数据。                                                                                                                                                                                                                               |
| WRITE_DATA   | 允许读取授权路径下的序列数据。<br/>允许插入、删除授权路径下的的序列数据。<br/>允许在授权路径下导入、加载数据，在导入数据时，需要拥有对应路径的 WRITE_DATA 权限，在自动创建数据库与序列时，需要有 MANAGE_DATABASE 与 WRITE_SCHEMA 权限。                                                                                                |
| READ_SCHEMA  | 允许获取授权路径下元数据树的详细信息：<br/>包括：路径下的数据库、子路径、子节点、设备、序列、模版、视图等。                                                                                                                                                                                      |
| WRITE_SCHEMA | 允许获取授权路径下元数据树的详细信息。<br/>允许在授权路径下对序列、模版、视图等进行创建、删除、修改操作。<br/>在创建或修改 view 的时候，会检查 view 路径的 WRITE_SCHEMA 权限、数据源的 READ_SCHEMA 权限。<br/>在对 view 进行查询、插入时，会检查 view 路径的 READ_DATA 权限、WRITE_DATA 权限。<br/>允许在授权路径下设置、取消、查看TTL。<br/> 允许在授权路径下挂载或者接触挂载模板。 |

### 全局权限

全局权限约束了用户使用的数据库功能、限制了用户执行改变系统状态与任务状态的命令，用户获得全局授权后，可对数据库进行管理。

下表描述了系统权限的种类：

|      权限名称       | 描述                                                                |
|:---------------:|:------------------------------------------------------------------|
| MANAGE_DATABASE | - 允许用户创建、删除数据库.                                                   |
|   MANAGE_USER   | - 允许用户创建、删除、修改、查看用户。                                              |
|   MANAGE_ROLE   | - 允许用户创建、删除、修改、查看角色。 <br/> 允许用户将角色授予给其他用户,或取消其他用户的角色。             |
|   USE_TRIGGER   | - 允许用户创建、删除、查看触发器。<br/>与触发器的数据源权限检查相独立。                           |
|     USE_UDF     | -  允许用户创建、删除、查看用户自定义函数。<br/>与自定义函数的数据源权限检查相独立。                    |
|     USE_CQ      | - 允许用户创建、开始、停止、删除、查看管道。<br/>允许用户创建、删除、查看管道插件。<br/>与管道的数据源权限检查相独立。 |
| EXTEND_TEMPLATE | -  自动创建模板权限。                                                      |
|    MAINTAIN     | -  允许用户查询、取消查询。 <br/> 允许用户查看变量。 <br/> 允许用户查看集群状态。                 |
|    USE_MODEL    | -  允许用户创建、删除、查询深度学习模型                                             |

关于模板权限：

1. 模板的创建、删除、修改、查询、挂载、卸载仅允许管理员操作。
2. 激活模板需要拥有激活路径的 WRITE_SCHEMA 权限
3. 若开启了自动创建，在向挂载了模板的不存在路径写入时，数据库会自动扩展模板并写入数据，因此需要有 EXTEND_TEMPLATE 权限与写入序列的 WRITE_DATA 权限。
4. 解除模板，需要拥有挂载模板路径的 WRITE_SCHEMA 权限。
5. 查询使用了某个元数据模板的路径，需要有路径的 READ_SCHEMA 权限，否则将返回为空。

### 权限授予与取消

在 IoTDB 中，用户可以由三种途径获得权限：

1. 由超级管理员授予，超级管理员可以控制其他用户的权限。
2. 由允许权限授权的用户授予，该用户获得权限时被指定了 grant option 关键字。
3. 由超级管理员或者有 MANAGE_ROLE 的用户授予某个角色进而获取权限。

取消用户的权限，可以由以下几种途径：

1. 由超级管理员取消用户的权限。
2. 由允许权限授权的用户取消权限，该用户获得权限时被指定了 grant option 关键字。
3. 由超级管理员或者MANAGE_ROLE 的用户取消用户的某个角色进而取消权限。

- 在授权时，必须指定路径。全局权限需要指定为 root.**, 而序列相关权限必须为绝对路径或者以双通配符结尾的前缀路径。
- 当授予角色权限时，可以为该权限指定 with grant option 关键字，意味着用户可以转授其授权路径上的权限，也可以取消其他用户的授权路径上的权限。例如用户 A 在被授予`集团1.公司1.**`的读权限时制定了 grant option 关键字，那么 A 可以将`集团1.公司1`以下的任意节点、序列的读权限转授给他人， 同样也可以取消其他用户 `集团1.公司1` 下任意节点的读权限。
- 在取消授权时，取消授权语句会与用户所有的权限路径进行匹配，将匹配到的权限路径进行清理，例如用户A 具有 `集团1.公司1.工厂1 `的读权限， 在取消 `集团1.公司1.** `的读权限时，会清除用户A 的 `集团1.公司1.工厂1` 的读权限。



## 鉴权

用户权限主要由三部分组成：权限生效范围（路径）， 权限类型， with grant option 标记：

```
userTest1 : 
    root.t1.**  -  read_schema, read_data     -    with grant option
    root.**     -  write_schema, write_data   -    with grant option 
```

每个用户都有一个这样的权限访问列表，标识他们获得的所有权限，可以通过 `LIST PRIVILEGES OF USER <username>` 查看他们的权限。

在对一个路径进行鉴权时，数据库会进行路径与权限的匹配。例如检查 `root.t1.t2` 的 read_schema 权限时，首先会与权限访问列表的 `root.t1.**`进行匹配，匹配成功，则检查该路径是否包含待鉴权的权限，否则继续下一条路径-权限的匹配，直到匹配成功或者匹配结束。

在进行多路径鉴权时，例如执行一个多路径查询的任务，数据库只会将有权限的数据呈现出来，无权限的数据不会包含在结果中，这些无权限的路径信息最后会输出到报警信息中。


## 功能语法与示例

IoTDB 提供了组合权限，方便用户授权：

| 权限名称  | 权限范围                    |
|-------|-------------------------|
| ALL   | 所有权限                    |
| READ  | READ_SCHEMA、READ_DATA   |
| WRITE | WRITE_SCHEMA、WRITE_DATA |

组合权限并不是一种具体的权限，而是一种简写方式，与直接书写对应的权限名称没有差异。

下面将通过一系列具体的用例展示权限语句的用法，非管理员执行下列语句需要提前获取权限，所需的权限标记在操作描述后。

### 用户与角色相关

- 创建用户（需 MANAGE_USER 权限)


```SQL
CREATE USER <userName> <password>
eg: CREATE USER user1 'passwd'
```

- 删除用户 (需 MANEGE_USER 权限)


```SQL
DROP USER <userName>
eg: DROP USER user1
```

- 创建角色 (需 MANAGE_ROLE 权限)

```SQL
CREATE ROLE <roleName>
eg: CREATE ROLE role1
```

- 删除角色 (需 MANAGE_ROLE 权限)


```SQL
DROP ROLE <roleName>
eg: DROP ROLE role1   
```

- 赋予用户角色 (需 MANAGE_ROLE 权限)


```SQL
GRANT ROLE <ROLENAME> TO <USERNAME>
eg: GRANT ROLE admin TO user1
```

- 移除用户角色 (需 MANAGE_ROLE 权限)


```SQL
REVOKE ROLE <ROLENAME> FROM <USER>
eg: REVOKE ROLE admin FROM user1
```

- 列出所有用户  (需 MANEGE_USER 权限)

```SQL
LIST USER
```

- 列出所有角色 (需 MANAGE_ROLE 权限)

```SQL
LIST ROLE
```

- 列出指定角色下所有用户 (需 MANEGE_USER 权限)

```SQL
LIST USER OF ROLE <roleName>
eg: LIST USER OF ROLE roleuser
```

- 列出指定用户下所有角色

用户可以列出自己的角色，但列出其他用户的角色需要拥有 MANAGE_ROLE 权限。

```SQL
LIST ROLE OF USER <username> 
eg: LIST ROLE OF USER tempuser
```

- 列出用户所有权限

用户可以列出自己的权限信息，但列出其他用户的权限需要拥有 MANAGE_USER 权限。

```SQL
LIST PRIVILEGES OF USER <username>;
eg: LIST PRIVILEGES OF USER tempuser;
    
```

- 列出角色所有权限

用户可以列出自己具有的角色的权限信息，列出其他角色的权限需要有 MANAGE_ROLE 权限。

```SQL
LIST PRIVILEGES OF ROLE <roleName>;
eg: LIST PRIVILEGES OF ROLE actor;
```

- 更新密码

用户可以更新自己的密码，但更新其他用户密码需要具备MANAGE_USER  权限。

```SQL
ALTER USER <username> SET PASSWORD <password>;
eg: ALTER USER tempuser SET PASSWORD 'newpwd';
```

### 授权与取消授权

用户使用授权语句对赋予其他用户权限，语法如下：

```SQL
GRANT <PRIVILEGES> ON <PATHS> TO ROLE/USER <NAME> [WITH GRANT OPTION]；
eg: GRANT READ ON root.** TO ROLE role1;
eg: GRANT READ_DATA, WRITE_DATA ON root.t1.** TO USER user1;
eg: GRANT READ_DATA, WRITE_DATA ON root.t1.**,root.t2.** TO USER user1;
eg: GRANT MANAGE_ROLE ON root.** TO USER user1 WITH GRANT OPTION;
eg: GRANT ALL ON root.** TO USER user1 WITH GRANT OPTION;
```

用户使用取消授权语句可以将其他的权限取消，语法如下：

```SQL
REVOKE <PRIVILEGES> ON <PATHS> FROM ROLE/USER <NAME>;
eg: REVOKE READ ON root.** FROM ROLE role1;
eg: REVOKE READ_DATA, WRITE_DATA ON root.t1.** FROM USER user1;
eg: REVOKE READ_DATA, WRITE_DATA ON root.t1.**, root.t2.** FROM USER user1;
eg: REVOKE MANAGE_ROLE ON root.** FROM USER user1;
eg: REVOKE ALL ON ROOT.** FROM USER user1;
```

- **非管理员用户执行授权/取消授权语句时，需要对\<PATHS\> 有\<PRIVILEGES\> 权限，并且该权限是被标记带有 WITH GRANT OPTION 的。**

- 在授予取消全局权限时，或者语句中包含全局权限时(ALL 展开会包含全局权限），须指定 path 为 root.**。 例如，以下授权/取消授权语句是合法的：

    ```SQL
    GRANT MANAGE_USER ON root.** TO USER user1;
    GRANT MANAGE_ROLE ON root.** TO ROLE role1  WITH GRANT OPTION;
    GRANT ALL ON  root.** TO role role1  WITH GRANT OPTION;
    REVOKE MANAGE_USER ON root.** FROM USER user1;
    REVOKE MANAGE_ROLE ON root.** FROM ROLE role1;
    REVOKE ALL ON root.** FROM ROLE role1;
    ```
    下面的语句是非法的：
    
    ```SQL
    GRANT READ, MANAGE_ROLE ON root.t1.** TO USER user1;
    GRANT ALL ON root.t1.t2 TO USER user1 WITH GRANT OPTION;
    REVOKE ALL ON root.t1.t2 FROM USER user1;
    REVOKE READ, MANAGE_ROLE ON root.t1.t2 FROM ROLE ROLE1;
    ```

- \<PATH\> 必须为全路径或者以双通配符结尾的匹配路径，以下路径是合法的:
  
    ```SQL
    root.**
    root.t1.t2.**
    root.t1.t2.t3 
    ```
    
    以下的路径是非法的：
    
    ```SQL
    root.t1.*
    root.t1.**.t2
    root.t1*.t2.t3
    ```

## 示例

根据本文中描述的 [样例数据](https://github.com/thulab/iotdb/files/4438687/OtherMaterial-Sample.Data.txt) 内容，IoTDB 的样例数据可能同时属于 ln, sgcc 等不同发电集团，不同的发电集团不希望其他发电集团获取自己的数据库数据，因此我们需要将不同的数据在集团层进行权限隔离。

### 创建用户

使用 `CREATE USER <userName> <password>` 创建用户。例如，我们可以使用具有所有权限的root用户为 ln 和 sgcc 集团创建两个用户角色，名为 ln_write_user, sgcc_write_user，密码均为 write_pwd。建议使用反引号(`)包裹用户名。SQL 语句为：

```SQL
CREATE USER `ln_write_user` 'write_pwd'
CREATE USER `sgcc_write_user` 'write_pwd'
```
此时使用展示用户的 SQL 语句：

```SQL
LIST USER
```

我们可以看到这两个已经被创建的用户，结果如下：

```SQL
IoTDB> CREATE USER `ln_write_user` 'write_pwd'
Msg: The statement is executed successfully.
IoTDB> CREATE USER `sgcc_write_user` 'write_pwd'
Msg: The statement is executed successfully.
IoTDB> LIST USER;
+---------------+
|           user|
+---------------+
|  ln_write_user|
|           root|
|sgcc_write_user|
+---------------+
Total line number = 3
It costs 0.012s
```

### 赋予用户权限

此时，虽然两个用户已经创建，但是他们不具有任何权限，因此他们并不能对数据库进行操作，例如我们使用 ln_write_user 用户对数据库中的数据进行写入，SQL 语句为：

```SQL
INSERT INTO root.ln.wf01.wt01(timestamp,status) values(1509465600000,true)
```

此时，系统不允许用户进行此操作，会提示错误：

```SQL
IoTDB> INSERT INTO root.ln.wf01.wt01(timestamp,status) values(1509465600000,true)
Msg: 803: No permissions for this operation, please add privilege WRITE_DATA on [root.ln.wf01.wt01.status]
```

现在，我们用 root 用户分别赋予他们向对应路径的写入权限.

我们使用 `GRANT <PRIVILEGES> ON <PATHS> TO USER <username>` 语句赋予用户权限,例如：
```SQL
GRANT WRITE_DATA ON root.ln.** TO USER `ln_write_user`
GRANT WRITE_DATA ON root.sgcc1.**, root.sgcc2.** TO USER `sgcc_write_user`
```

执行状态如下所示：

```SQL
IoTDB> GRANT WRITE_DATA ON root.ln.** TO USER `ln_write_user`
Msg: The statement is executed successfully.
IoTDB> GRANT WRITE_DATA ON root.sgcc1.**, root.sgcc2.** TO USER `sgcc_write_user`
Msg: The statement is executed successfully.
```

接着使用ln_write_user再尝试写入数据

```SQL
IoTDB> INSERT INTO root.ln.wf01.wt01(timestamp, status) values(1509465600000, true)
Msg: The statement is executed successfully.
```

### 撤销用户权限
授予用户权限后，我们可以使用 `REVOKE <PRIVILEGES> ON <PATHS> FROM USER <USERNAME>`来撤销已经授予用户的权限。例如，用root用户撤销ln_write_user和sgcc_write_user的权限：

``` SQL
REVOKE WRITE_DATA ON root.ln.** FROM USER `ln_write_user`
REVOKE WRITE_DATA ON root.sgcc1.**, root.sgcc2.** FROM USER `sgcc_write_user`
```

执行状态如下所示：
``` SQL
IoTDB> REVOKE WRITE_DATA ON root.ln.** FROM USER `ln_write_user`
Msg: The statement is executed successfully.
IoTDB> REVOKE WRITE_DATA ON root.sgcc1.**, root.sgcc2.** FROM USER `sgcc_write_user`
Msg: The statement is executed successfully.
```

撤销权限后，ln_write_user就没有向root.ln.**写入数据的权限了。

``` SQL
IoTDB> INSERT INTO root.ln.wf01.wt01(timestamp, status) values(1509465600000, true)
Msg: 803: No permissions for this operation, please add privilege WRITE_DATA on [root.ln.wf01.wt01.status]
```

## 其他说明

角色是权限的集合，而权限和角色都是用户的一种属性。即一个角色可以拥有若干权限。一个用户可以拥有若干角色与权限（称为用户自身权限）。

目前在 IoTDB 中并不存在相互冲突的权限，因此一个用户真正具有的权限是用户自身权限与其所有的角色的权限的并集。即要判定用户是否能执行某一项操作，就要看用户自身权限或用户的角色的所有权限中是否有一条允许了该操作。用户自身权限与其角色权限，他的多个角色的权限之间可能存在相同的权限，但这并不会产生影响。

需要注意的是：如果一个用户自身有某种权限（对应操作 A），而他的某个角色有相同的权限。那么如果仅从该用户撤销该权限无法达到禁止该用户执行操作 A 的目的，还需要从这个角色中也撤销对应的权限，或者从这个用户将该角色撤销。同样，如果仅从上述角色将权限撤销，也不能禁止该用户执行操作 A。

同时，对角色的修改会立即反映到所有拥有该角色的用户上，例如对角色增加某种权限将立即使所有拥有该角色的用户都拥有对应权限，删除某种权限也将使对应用户失去该权限（除非用户本身有该权限）。

## 升级说明

在 1.3 版本前，权限类型较多，在这一版实现中，权限类型做了一定的精简。

新旧版本的权限类型对照可以参照下面的表格（--IGNORE 表示新版本忽略该权限）：

| 权限名称                      | 是否路径相关 | 新权限名称           | 是否路径相关 |
|---------------------------|--------|-----------------|--------|
| CREATE_DATABASE           | 是      | MANAGE_DATABASE | 否      |
| INSERT_TIMESERIES         | 是      | WRITE_DATA      | 是      |
| UPDATE_TIMESERIES         | 是      | WRITE_DATA      | 是      |
| READ_TIMESERIES           | 是      | READ_DATA       | 是      |
| CREATE_TIMESERIES         | 是      | WRITE_SCHEMA    | 是      |
| DELETE_TIMESERIES         | 是      | WRITE_SCHEMA    | 是      |
| CREATE_USER               | 否      | MANAGE_USER     | 否      |
| DELETE_USER               | 否      | MANAGE_USER     | 否      |
| MODIFY_PASSWORD           | 否      | -- IGNORE       |        |
| LIST_USER                 | 否      | -- IGNORE       |        |
| GRANT_USER_PRIVILEGE      | 否      | -- IGNORE       |        |
| REVOKE_USER_PRIVILEGE     | 否      | -- IGNORE       |        |
| GRANT_USER_ROLE           | 否      | MANAGE_ROLE     | 否      |
| REVOKE_USER_ROLE          | 否      | MANAGE_ROLE     | 否      |
| CREATE_ROLE               | 否      | MANAGE_ROLE     | 否      |
| DELETE_ROLE               | 否      | MANAGE_ROLE     | 否      |
| LIST_ROLE                 | 否      | -- IGNORE       |        |
| GRANT_ROLE_PRIVILEGE      | 否      | -- IGNORE       |        |
| REVOKE_ROLE_PRIVILEGE     | 否      | -- IGNORE       |        |
| CREATE_FUNCTION           | 否      | USE_UDF         | 否      |
| DROP_FUNCTION             | 否      | USE_UDF         | 否      |
| CREATE_TRIGGER            | 是      | USE_TRIGGER     | 否      |
| DROP_TRIGGER              | 是      | USE_TRIGGER     | 否      |
| START_TRIGGER             | 是      | USE_TRIGGER     | 否      |
| STOP_TRIGGER              | 是      | USE_TRIGGER     | 否      |
| CREATE_CONTINUOUS_QUERY   | 否      | USE_CQ          | 否      |
| DROP_CONTINUOUS_QUERY     | 否      | USE_CQ          | 否      |
| ALL                       | 否      | All privilegs   |        |
| DELETE_DATABASE           | 是      | MANAGE_DATABASE | 否      |
| ALTER_TIMESERIES          | 是      | WRITE_SCHEMA    | 是      |
| UPDATE_TEMPLATE           | 否      | -- IGNORE       |        |
| READ_TEMPLATE             | 否      | -- IGNORE       |        |
| APPLY_TEMPLATE            | 是      | WRITE_SCHEMA    | 是      |
| READ_TEMPLATE_APPLICATION | 否      | -- IGNORE       |        |
| SHOW_CONTINUOUS_QUERIES   | 否      | -- IGNORE       |        |
| CREATE_PIPEPLUGIN         | 否      | USE_PIPE        | 否      |
| DROP_PIPEPLUGINS          | 否      | USE_PIPE        | 否      |
| SHOW_PIPEPLUGINS          | 否      | -- IGNORE       |        |
| CREATE_PIPE               | 否      | USE_PIPE        | 否      |
| START_PIPE                | 否      | USE_PIPE        | 否      |
| STOP_PIPE                 | 否      | USE_PIPE        | 否      |
| DROP_PIPE                 | 否      | USE_PIPE        | 否      |
| SHOW_PIPES                | 否      | -- IGNORE       |        |
| CREATE_VIEW               | 是      | WRITE_SCHEMA    | 是      |
| ALTER_VIEW                | 是      | WRITE_SCHEMA    | 是      |
| RENAME_VIEW               | 是      | WRITE_SCHEMA    | 是      |
| DELETE_VIEW               | 是      | WRITE_SCHEMA    | 是      |
