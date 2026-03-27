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

# Authority Management

IoTDB provides permission management operations, offering users the ability to manage permissions for data and cluster systems, ensuring data and system security. 

This article introduces the basic concepts of the permission module in IoTDB, including user definition, permission management, authentication logic, and use cases. In the JAVA programming environment, you can use the [JDBC API](https://chat.openai.com/API/Programming-JDBC.md) to execute permission management statements individually or in batches. 

## 1. Basic Concepts

### 1.1 User

A user is a legitimate user of the database. Each user corresponds to a unique username and has a password as a means of authentication. Before using the database, a person must provide a valid (i.e., stored in the database) username and password for a successful login.

### 1.2 Permission

The database provides various operations, but not all users can perform all operations. If a user can perform a certain operation, they are said to have permission to execute that operation. Permissions are typically limited in scope by a path, and [path patterns](https://chat.openai.com/Basic-Concept/Data-Model-and-Terminology.md) can be used to manage permissions flexibly.

### 1.3 Role

A role is a collection of multiple permissions and has a unique role name as an identifier. Roles often correspond to real-world identities (e.g., a traffic dispatcher), and a real-world identity may correspond to multiple users. Users with the same real-world identity often have the same permissions, and roles are abstractions for unified management of such permissions.

### 1.4 Default Users and Roles

After installation and initialization, IoTDB includes a default user: root, with the default password TimechoDB@2021 (Before V2.0.6.x it is root). This user is an administrator with fixed permissions, which cannot be granted or revoked and cannot be deleted. There is only one administrator user in the database.

A newly created user or role does not have any permissions initially.

## 2. User Definition

Users with MANAGE_USER and MANAGE_ROLE permissions or administrators can create users or roles. Creating a user must meet the following constraints.

### 2.1 Username Constraints

4 to 32 characters, supports the use of uppercase and lowercase English letters, numbers, and special characters (`!@#$%^&*()_+-=`).

Users cannot create users with the same name as the administrator.

### 2.2 Password Constraints

4 to 32 characters, can use uppercase and lowercase letters, numbers, and special characters (`!@#$%^&*()_+-=`). Passwords are encrypted by default using SHA-256.

### 2.3 Role Name Constraints

4 to 32 characters, supports the use of uppercase and lowercase English letters, numbers, and special characters (`!@#$%^&*()_+-=`).

Users cannot create roles with the same name as the administrator.



## 3. Permission Management

IoTDB primarily has two types of permissions: series permissions and global permissions.

### 3.1 Series Permissions

Series permissions constrain the scope and manner in which users access data. IOTDB support authorization for both absolute paths and prefix-matching paths, and can be effective at the timeseries granularity.

The table below describes the types and scope of these permissions:



| Permission Name | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|-----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| READ_DATA       | Allows reading time series data under the authorized path.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| WRITE_DATA      | Allows reading time series data under the authorized path.<br/>Allows inserting and deleting time series data under the authorized path.<br/>Allows importing and loading data under the authorized path. When importing data, you need the WRITE_DATA permission for the corresponding path. When automatically creating  databases or time series, you need MANAGE_DATABASE and WRITE_SCHEMA permissions.                                                                                                                                                                                                           |
| READ_SCHEMA     | Allows obtaining detailed information about the metadata tree under the authorized path, <br/>including databases, child paths, child nodes, devices, time series, templates, views, etc.                                                                                                                                                                                                                                                                                                                                                                                                                             |
| WRITE_SCHEMA    | Allows obtaining detailed information about the metadata tree under the authorized path.<br/>Allows creating, deleting, and modifying time series, templates, views, etc. under the authorized path. When creating or modifying views, it checks the WRITE_SCHEMA permission for the view path and READ_SCHEMA permission for the data source. When querying and inserting data into views, it checks the READ_DATA and WRITE_DATA permissions for the view path.<br/> Allows setting, unsetting, and viewing TTL under the authorized path. <br/> Allows attaching or detaching templates under the authorized path. |


### 3.2 Global Permissions

Global permissions constrain the database functions that users can use and restrict commands that change the system and task state. Once a user obtains global authorization, they can manage the database. 
The table below describes the types of system permissions: 


| Permission Name | Description                                                                                                                                                                                     |
|:---------------:|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| MANAGE_DATABASE | Allow users to create and delete databases.                                                                                                                                                     |
|   MANAGE_USER   | Allow users to create, delete, modify, and view users.                                                                                                                                          |
|   MANAGE_ROLE   | Allow users to create, delete, modify, and view roles. <br/>Allow users to grant/revoke roles to/from other users.                                                                              |
|   USE_TRIGGER   | Allow users to create, delete, and view triggers.<br/>Independent of data source permission checks for triggers.                                                                                |
|     USE_UDF     | Allow users to create, delete, and view user-defined functions. <br/> Independent of data source permission checks for user-defined functions.                                                  |
|     USE_CQ      | Allow users to create, delete, and view continuous queries. <br/> Independent of data source permission checks for continuous queries.                                                          |
|    USE_PIPE     | Allow users to create, start, stop, delete, and view pipelines. <br/>Allow users to create, delete, and view pipeline plugins. <br/>Independent of data source permission checks for pipelines. |
| EXTEND_TEMPLATE | Permission to automatically create templates.                                                                                                                                                   |
|    MAINTAIN     | Allow users to query and cancel queries. <br/>Allow users to view variables. <br/>Allow users to view cluster status.                                                                           |
|    USE_MODEL    | Allow users to create, delete and view deep learning model.                                                                                                                                     |
Regarding template permissions:

1. Only administrators are allowed to create, delete, modify, query, mount, and unmount templates.
2. To activate a template, you need to have WRITE_SCHEMA permission for the activation path.
3. If automatic creation is enabled, writing to a non-existent path that has a template mounted will automatically extend the template and insert data. Therefore, one needs EXTEND_TEMPLATE permission and WRITE_DATA permission for writing to the sequence.
4. To deactivate a template, WRITE_SCHEMA permission for the mounted template path is required.
5. To query paths that use a specific metadata template, you needs READ_SCHEMA permission for the paths; otherwise, it will return empty results.



### 3.3 Granting and Revoking Permissions

In IoTDB, users can obtain permissions through three methods:

1. Granted by administrator, who has control over the permissions of other users.
2. Granted by a user allowed to authorize permissions, and this user was assigned the grant option keyword when obtaining the permission.
3. Granted a certain role by administrator or a user with MANAGE_ROLE, thereby obtaining permissions.

Revoking a user's permissions can be done through the following methods:

1. Revoked by administrator.
2. Revoked by a user allowed to authorize permissions, and this user was assigned the grant option keyword when obtaining the permission.
3. Revoked from a user's role by administrator or a user with MANAGE_ROLE, thereby revoking the permissions.

- When granting permissions, a path must be specified. Global permissions need to be specified as root.**, while series-specific permissions must be absolute paths or prefix paths ending with a double wildcard.
- When granting user/role permissions, you can specify the "with grant option" keyword for that permission, which means that the user can grant permissions on their authorized paths and can also revoke permissions on other users' authorized paths. For example, if User A is granted read permission for `group1.company1.**` with the grant option keyword, then A can grant read permissions to others on any node or series below `group1.company1`, and can also revoke read permissions on any node below `group1.company1` for other users.
- When revoking permissions, the revocation statement will match against all of the user's permission paths and clear the matched permission paths. For example, if User A has read permission for `group1.company1.factory1`, when revoking read permission for `group1.company1.**`, it will remove A's read permission for `group1.company1.factory1`.



## 4. Authentication

User permissions mainly consist of three parts: permission scope (path), permission type, and the "with grant option" flag:

```
userTest1:
    root.t1.**    - read_schema, read_data 	- with grant option
    root.** 	 - write_schema, write_data - with grant option
```

Each user has such a permission access list, identifying all the permissions they have acquired. You can view their permissions by using the command `LIST PRIVILEGES OF USER <username>`.

When authorizing a path, the database will match the path with the permissions. For example, when checking the read_schema permission for `root.t1.t2`, it will first match with the permission access list `root.t1.**`. If it matches successfully, it will then check if that path contains the permission to be authorized. If not, it continues to the next path-permission match until a match is found or all matches are exhausted.

When performing authorization for multiple paths, such as executing a multi-path query task, the database will only present data for which the user has permissions. Data for which the user does not have permissions will not be included in the results, and information about these paths without permissions will be output to the alert messages.

Please note that the following operations require checking multiple permissions:

1. Enabling the automatic sequence creation feature requires not only write permission for the corresponding sequence when a user inserts data into a non-existent sequence but also metadata modification permission for the sequence.

2. When executing the "select into" statement, it is necessary to check the read permission for the source sequence and the write permission for the target sequence. It should be noted that the source sequence data may only be partially accessible due to insufficient permissions, and if the target sequence has insufficient write permissions, an error will occur, terminating the task.

3. View permissions and data source permissions are independent. Performing read and write operations on a view will only check the permissions of the view itself and will not perform permission validation on the source path.


## 5. Function Syntax and Examples

IoTDB provides composite permissions for user authorization:

| Permission Name | Permission Scope         |
|-----------------|--------------------------|
| ALL             | All permissions          |
| READ            | READ_SCHEMA, READ_DATA   |
| WRITE           | WRITE_SCHEMA, WRITE_DATA |

Composite permissions are not specific permissions themselves but a shorthand way to denote a combination of permissions, with no difference from directly specifying the corresponding permission names.

The following series of specific use cases will demonstrate the usage of permission statements. Non-administrator users executing the following statements require obtaining the necessary permissions, which are indicated after the operation description.

### 5.1 User and Role Related

- Create user (Requires MANAGE_USER permission)

```SQL
CREATE USER <userName> <password>
eg: CREATE USER user1 'passwd'
```

- Delete user (Requires MANAGE_USER permission)

```sql
DROP USER <userName>
eg: DROP USER user1
```

- Create role (Requires MANAGE_ROLE permission)

```sql
CREATE ROLE <roleName>
eg: CREATE ROLE role1
```

- Delete role (Requires MANAGE_ROLE permission)

```sql
DROP ROLE <roleName>
eg: DROP ROLE role1  
```

- Grant role to user (Requires MANAGE_ROLE permission)

```sql
GRANT ROLE <ROLENAME> TO <USERNAME>
eg: GRANT ROLE admin TO user1
```

- Revoke role from user(Requires MANAGE_ROLE permission)

```sql
REVOKE ROLE <ROLENAME> FROM <USER>
eg: REVOKE ROLE admin FROM user1
```

- List all user (Requires MANAGE_USER permission)

```sql
LIST USER
```

- List all role (Requires MANAGE_ROLE permission)

```sql
LIST ROLE
```

- List all users granted specific role.（Requires MANAGE_USER permission)

```sql
LIST USER OF ROLE <roleName>
eg: LIST USER OF ROLE roleuser
```

- List all role granted to specific user.

  Users can list their own roles, but listing roles of other users requires the MANAGE_ROLE permission.

```sql
LIST ROLE OF USER <username> 
eg: LIST ROLE OF USER tempuser
```

- List all privileges of user

Users can list their own privileges, but listing privileges of other users requires the MANAGE_USER permission.

```sql
LIST PRIVILEGES OF USER <username>;
eg: LIST PRIVILEGES OF USER tempuser;
```

- List all privileges of role

Users can list the permission information of roles they have, but listing permissions of other roles requires the MANAGE_ROLE permission.

```sql
LIST PRIVILEGES OF ROLE <roleName>;
eg: LIST PRIVILEGES OF ROLE actor;
```

- Modify password

Users can modify their own password, but modifying passwords of other users requires the MANAGE_USER permission.

```sql
ALTER USER <username> SET PASSWORD <password>;
eg: ALTER USER tempuser SET PASSWORD 'newpwd';
```

### 5.2 Authorization and Deauthorization

Users can use authorization statements to grant permissions to other users. The syntax is as follows:

```sql
GRANT <PRIVILEGES> ON <PATHS> TO ROLE/USER <NAME> [WITH GRANT OPTION];
eg: GRANT READ ON root.** TO ROLE role1;
eg: GRANT READ_DATA, WRITE_DATA ON root.t1.** TO USER user1;
eg: GRANT READ_DATA, WRITE_DATA ON root.t1.**,root.t2.** TO USER user1;
eg: GRANT MANAGE_ROLE ON root.** TO USER user1 WITH GRANT OPTION;
eg: GRANT ALL ON root.** TO USER user1 WITH GRANT OPTION;
```

Users can use deauthorization statements to revoke permissions from others. The syntax is as follows:

```sql
REVOKE <PRIVILEGES> ON <PATHS> FROM ROLE/USER <NAME>;
eg: REVOKE READ ON root.** FROM ROLE role1;
eg: REVOKE READ_DATA, WRITE_DATA ON root.t1.** FROM USER user1;
eg: REVOKE READ_DATA, WRITE_DATA ON root.t1.**, root.t2.** FROM USER user1;
eg: REVOKE MANAGE_ROLE ON root.** FROM USER user1;
eg: REVOKE ALL ON root.** FROM USER user1;
```

- **When non-administrator users execute authorization/deauthorization statements, they need to have \<PRIVILEGES\> permissions on \<PATHS\>, and these permissions must be marked with WITH GRANT OPTION.**

- When granting or revoking global permissions or when the statement contains global permissions (expanding ALL includes global permissions), you must specify the path as root**. For example, the following authorization/deauthorization statements are valid:

  ```sql
  GRANT MANAGE_USER ON root.** TO USER user1;
  GRANT MANAGE_ROLE ON root.** TO ROLE role1  WITH GRANT OPTION;
  GRANT ALL ON  root.** TO role role1  WITH GRANT OPTION;
  REVOKE MANAGE_USER ON root.** FROM USER user1;
  REVOKE MANAGE_ROLE ON root.** FROM ROLE role1;
  REVOKE ALL ON root.** FROM ROLE role1;
  ```

  The following statements are invalid:

  ```sql
  GRANT READ, MANAGE_ROLE ON root.t1.** TO USER user1;
  GRANT ALL ON root.t1.t2 TO USER user1 WITH GRANT OPTION;
  REVOKE ALL ON root.t1.t2 FROM USER user1;
  REVOKE READ, MANAGE_ROLE ON root.t1.t2 FROM ROLE ROLE1;
  ```

- \<PATH\> must be a full path or a matching path ending with a double wildcard. The following paths are valid:

  ```sql
  root.**
  root.t1.t2.**
  root.t1.t2.t3
  ```
  
  The following paths are invalid:
  
  ```sql
  root.t1.*
  root.t1.**.t2
  root.t1*.t2.t3
  ```
  
  
  
## 6. Examples

   Based on the described [sample data](https://github.com/thulab/iotdb/files/4438687/OtherMaterial-Sample.Data.txt), IoTDB's sample data may belong to different power generation groups such as ln, sgcc, and so on. Different power generation groups do not want other groups to access their database data, so we need to implement data isolation at the group level. 

#### Create Users 
Use `CREATE USER <userName> <password>` to create users. For example, we can create two users for the ln and sgcc groups with the root user, who has all permissions, and name them ln_write_user and sgcc_write_user. It is recommended to enclose the username in backticks. The SQL statements are as follows: 
```SQL 
CREATE USER `ln_write_user` 'write_pwd' 
CREATE USER `sgcc_write_user` 'write_pwd'
```

Now, using the SQL statement to display users:

```sql
LIST USER
```

We can see that these two users have been created, and the result is as follows:

```sql
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

#### Granting Permissions to Users

At this point, although two users have been created, they do not have any permissions, so they cannot operate on the database. For example, if we use the ln_write_user to write data to the database, the SQL statement is as follows:

```sql
INSERT INTO root.ln.wf01.wt01(timestamp,status) values(1509465600000,true)
```

At this point, the system does not allow this operation, and an error is displayed:

```sql
IoTDB> INSERT INTO root.ln.wf01.wt01(timestamp,status) values(1509465600000,true)
Msg: 803: No permissions for this operation, please add privilege WRITE_DATA on [root.ln.wf01.wt01.status]
```

Now, we will grant each user write permissions to the corresponding paths using the root user.

We use the `GRANT <PRIVILEGES> ON <PATHS> TO USER <username>` statement to grant permissions to users, for example:

```sql
GRANT WRITE_DATA ON root.ln.** TO USER `ln_write_user`
GRANT WRITE_DATA ON root.sgcc1.**, root.sgcc2.** TO USER `sgcc_write_user`
```

The execution status is as follows:

```sql
IoTDB> GRANT WRITE_DATA ON root.ln.** TO USER `ln_write_user`
Msg: The statement is executed successfully.
IoTDB> GRANT WRITE_DATA ON root.sgcc1.**, root.sgcc2.** TO USER `sgcc_write_user`
Msg: The statement is executed successfully.
```

Then, using ln_write_user, try to write data again:

```sql
IoTDB> INSERT INTO root.ln.wf01.wt01(timestamp, status) values(1509465600000, true)
Msg: The statement is executed successfully.
```

#### Revoking User Permissions

After granting user permissions, we can use the `REVOKE <PRIVILEGES> ON <PATHS> FROM USER <USERNAME>` to revoke the permissions granted to users. For example, using the root user to revoke the permissions of ln_write_user and sgcc_write_user:

```sql
REVOKE WRITE_DATA ON root.ln.** FROM USER `ln_write_user`
REVOKE WRITE_DATA ON root.sgcc1.**, root.sgcc2.** FROM USER `sgcc_write_user`
```


The execution status is as follows:

```sql
IoTDB> REVOKE WRITE_DATA ON root.ln.** FROM USER `ln_write_user`
Msg: The statement is executed successfully.
IoTDB> REVOKE WRITE_DATA ON root.sgcc1.**, root.sgcc2.** FROM USER `sgcc_write_user`
Msg: The statement is executed successfully.
```

After revoking the permissions, ln_write_user no longer has the permission to write data to root.ln.**:

```sql
IoTDB> INSERT INTO root.ln.wf01.wt01(timestamp, status) values(1509465600000, true)
Msg: 803: No permissions for this operation, please add privilege WRITE_DATA on [root.ln.wf01.wt01.status]
```

## 7. Other Explanations

Roles are collections of permissions, and both permissions and roles are attributes of users. In other words, a role can have multiple permissions, and a user can have multiple roles and permissions (referred to as the user's self-permissions).

Currently, in IoTDB, there are no conflicting permissions. Therefore, the actual permissions a user has are the union of their self-permissions and the permissions of all their roles. In other words, to determine if a user can perform a certain operation, it's necessary to check whether their self-permissions or the permissions of all their roles allow that operation. Self-permissions, role permissions, and the permissions of multiple roles a user has may contain the same permission, but this does not have any impact.

It's important to note that if a user has a certain permission (corresponding to operation A) on their own, and one of their roles has the same permission, revoking the permission from the user alone will not prevent the user from performing operation A. To prevent the user from performing operation A, you need to revoke the permission from both the user and the role, or remove the user from the role that has the permission. Similarly, if you only revoke the permission from the role, it won't prevent the user from performing operation A if they have the same permission on their own.

At the same time, changes to roles will be immediately reflected in all users who have that role. For example, adding a certain permission to a role will immediately grant that permission to all users who have that role, and removing a certain permission will cause those users to lose that permission (unless the user has it on their own).



## 8. Upgrading from a previous version

Before version 1.3, there were many different permission types. In 1.3 version's implementation, we have streamlined the permission types.

The permission paths in version 1.3 of the database must be either full paths or matching paths ending with a double wildcard. During system upgrades, any invalid permission paths and permission types will be automatically converted. The first invalid node on the path will be replaced with "**", and any unsupported permission types will be mapped to the permissions supported by the current system.

| Permission        | Path            | Mapped-Permission | Mapped-path   |
|-------------------|-----------------|-------------------|---------------|
| CREATE_DATBASE    | root.db.t1.*    | MANAGE_DATABASE   | root.**       |
| INSERT_TIMESERIES | root.db.t2.*.t3 | WRITE_DATA        | root.db.t2.** |
| CREATE_TIMESERIES | root.db.t2*c.t3 | WRITE_SCHEMA      | root.db.**    |
| LIST_ROLE         | root.**         | (ignore)          |               |



You can refer to the table below for a comparison of permission types between the old and new versions (where "--IGNORE" indicates that the new version ignores that permission):

| Permission Name           | Path-Related | New Permission Name | Path-Related |
|---------------------------|--------------|---------------------|--------------|
| CREATE_DATABASE           | YES          | MANAGE_DATABASE     | NO           |
| INSERT_TIMESERIES         | YES          | WRITE_DATA          | YES          |
| UPDATE_TIMESERIES         | YES          | WRITE_DATA          | YES          |
| READ_TIMESERIES           | YES          | READ_DATA           | YES          |
| CREATE_TIMESERIES         | YES          | WRITE_SCHEMA        | YES          |
| DELETE_TIMESERIES         | YES          | WRITE_SCHEMA        | YES          |
| CREATE_USER               | NO           | MANAGE_USER         | NO           |
| DELETE_USER               | NO           | MANAGE_USER         | NO           |
| MODIFY_PASSWORD           | NO           | -- IGNORE           |              |
| LIST_USER                 | NO           | -- IGNORE           |              |
| GRANT_USER_PRIVILEGE      | NO           | -- IGNORE           |              |
| REVOKE_USER_PRIVILEGE     | NO           | -- IGNORE           |              |
| GRANT_USER_ROLE           | NO           | MANAGE_ROLE         | NO           |
| REVOKE_USER_ROLE          | NO           | MANAGE_ROLE         | NO           |
| CREATE_ROLE               | NO           | MANAGE_ROLE         | NO           |
| DELETE_ROLE               | NO           | MANAGE_ROLE         | NO           |
| LIST_ROLE                 | NO           | -- IGNORE           |              |
| GRANT_ROLE_PRIVILEGE      | NO           | -- IGNORE           |              |
| REVOKE_ROLE_PRIVILEGE     | NO           | -- IGNORE           |              |
| CREATE_FUNCTION           | NO           | USE_UDF             | NO           |
| DROP_FUNCTION             | NO           | USE_UDF             | NO           |
| CREATE_TRIGGER            | YES          | USE_TRIGGER         | NO           |
| DROP_TRIGGER              | YES          | USE_TRIGGER         | NO           |
| START_TRIGGER             | YES          | USE_TRIGGER         | NO           |
| STOP_TRIGGER              | YES          | USE_TRIGGER         | NO           |
| CREATE_CONTINUOUS_QUERY   | NO           | USE_CQ              | NO           |
| DROP_CONTINUOUS_QUERY     | NO           | USE_CQ              | NO           |
| ALL                       | NO           | All privilegs       |              |
| DELETE_DATABASE           | YES          | MANAGE_DATABASE     | NO           |
| ALTER_TIMESERIES          | YES          | WRITE_SCHEMA        | YES          |
| UPDATE_TEMPLATE           | NO           | -- IGNORE           |              |
| READ_TEMPLATE             | NO           | -- IGNORE           |              |
| APPLY_TEMPLATE            | YES          | WRITE_SCHEMA        | YES          |
| READ_TEMPLATE_APPLICATION | NO           | -- IGNORE           |              |
| SHOW_CONTINUOUS_QUERIES   | NO           | -- IGNORE           |              |
| CREATE_PIPEPLUGIN         | NO           | USE_PIPE            | NO           |
| DROP_PIPEPLUGINS          | NO           | USE_PIPE            | NO           |
| SHOW_PIPEPLUGINS          | NO           | -- IGNORE           |              |
| CREATE_PIPE               | NO           | USE_PIPE            | NO           |
| START_PIPE                | NO           | USE_PIPE            | NO           |
| STOP_PIPE                 | NO           | USE_PIPE            | NO           |
| DROP_PIPE                 | NO           | USE_PIPE            | NO           |
| SHOW_PIPES                | NO           | -- IGNORE           |              |
| CREATE_VIEW               | YES          | WRITE_SCHEMA        | YES          |
| ALTER_VIEW                | YES          | WRITE_SCHEMA        | YES          |
| RENAME_VIEW               | YES          | WRITE_SCHEMA        | YES          |
| DELETE_VIEW               | YES          | WRITE_SCHEMA        | YES          |
