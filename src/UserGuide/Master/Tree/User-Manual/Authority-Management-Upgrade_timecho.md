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

IoTDB provides comprehensive permission management features to control access to data and cluster resources, ensuring data and system security. This document introduces the core concepts of the IoTDB permission module, user specifications, permission governance, authentication logic, and practical application examples.

## 1. Core Concepts
### 1.1 User
A user refers to a legitimate database operator. Each user is identified by a unique username and authenticated by a password. To access the database, users must log in with valid usernames and passwords stored in the system.

### 1.2 Privilege
The database supports a wide range of operations, but not all users are authorized to perform every action. A user is granted a corresponding privilege if permitted to execute a specific operation. Each privilege is bounded by a designated path. Flexible permission management can be implemented via [Path Pattern](../Basic-Concept/Operate-Metadata_timecho.md).

### 1.3 Role
A role is a collection of privileges identified by a unique role name. Roles correspond to actual job identities (e.g., traffic dispatchers), and multiple users may share the same identity with identical permission sets. Roles enable unified and centralized management of permissions for user groups with consistent access requirements.

### 1.4 Default Users and Roles
After initialization, IoTDB provides one default user: `root`, with the default password `TimechoDB@2021`. As the built-in super administrator, the root user permanently owns all privileges. Its permissions cannot be granted, revoked, or deleted, and it is the sole administrator account in the database.

Newly created users and roles have no permissions by default.

## 2. User Specifications
Users with the `SECURITY` privilege are authorized to create users and roles, subject to the following constraints:

### 2.1 Username Rules
Usernames must be 4 to 32 characters long, including uppercase and lowercase letters, digits, and special symbols (`!@#$%^&*()_+-=`). Creation of usernames identical to the administrator account is prohibited.

### 2.2 Password Rules
Passwords must be 12 to 32 characters long, containing both uppercase and lowercase letters, at least one digit, and at least one special symbol (`!@#$%^&*()_+-=`). Passwords cannot be the same as the associated username.

### 2.3 Role Name Rules
Role names must be 4 to 32 characters long, including uppercase and lowercase letters, digits, and special symbols (`!@#$%^&*()_+-=`). Creation of role names identical to the administrator account is prohibited.

## 3. Permission Management
Based on its tree data model, IoTDB classifies permissions into two major categories: global privileges and time series privileges.

### 3.1 Global Privileges
Global privileges include three types: `SYSTEM`, `SECURITY`, and `AUDIT`:
- **SYSTEM**: Governs O&M operations and Data Definition Language (DDL) operations.
- **SECURITY**: Governs user and role management, as well as privilege granting for other accounts.
- **AUDIT**: Governs audit rule maintenance and audit log viewing.

Detailed descriptions of each global privilege are shown in the table below:

<table style="text-align: left;">
  <tbody>
     <tr>
            <th>Privilege Name</th>
            <th>Original Privilege Name</th>
            <th>Description</th>
      </tr>
      <tr>
            <td rowspan="7">SYSTEM</td>
            <td>MANAGE_DATABASE</td>
            <td>Allows users to create and drop databases.</td>
      </tr>
      <tr>
            <td>USE_TRIGGER</td>
            <td>Allows users to create, drop and query triggers.</td>
      </tr>
      <tr>
            <td>USE_UDF</td>
            <td>Allows users to create, drop and query user-defined functions.</td>
      </tr>
      <tr>
            <td>USE_PIPE</td>
            <td>Allows users to create, start, stop, drop and query PIPE tasks; allows users to create, drop and query PIPEPLUGINS.</td>
      </tr>
      <tr>
            <td>USE_CQ</td>
            <td>Allows users to register, start, stop, uninstall and query stream processing tasks; allows users to register, uninstall and query stream processing plugins.</td>
      </tr>
      <tr>
            <td>MAINTAIN</td>
            <td>Allows users to execute and cancel queries, view system variables, and check cluster status.</td>
      </tr>
      <tr>
            <td>USE_MODEL</td>
            <td>Allows users to create, drop and query deep learning models.</td>
      </tr>
      <tr>
            <td rowspan="2">SECURITY</td>
            <td>MANAGE_USER</td>
            <td>Allows users to create, drop, modify and query users.</td>
      </tr>
      <tr>
            <td>MANAGE_ROLE</td>
            <td>Allows users to create, drop and query roles; grant roles to other users or revoke roles from other users.</td>
      </tr>
      <tr>
            <td>AUDIT</td>
            <td>N/A</td>
            <td>Allows users to maintain audit log rules and view audit logs.</td>
      </tr>
  </tbody>
</table>

### 3.2 Time Series Privileges
Time series privileges control the scope and mode of user data access. They support authorization for absolute paths and prefix matching paths, and take effect at the time series granularity.

Definitions of all time series privileges are listed in the table below:

| Privilege Name | Description |
| --------------- |---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| READ_DATA | Allows reading time series data under authorized paths. |
| WRITE_DATA | Allows reading time series data under authorized paths.<br>Allows inserting and deleting time series data under authorized paths.<br>Supports data import and loading within authorized paths. Data import requires the `WRITE_DATA` privilege for target paths; automatic creation of databases and time series additionally requires `SYSTEM` and `WRITE_SCHEMA` privileges. |
| READ_SCHEMA | Allows viewing detailed metadata tree information under authorized paths, including databases, sub-paths, child nodes, devices, time series, templates, views and other metadata. |
| WRITE_SCHEMA | Allows viewing metadata tree information under authorized paths.<br>Allows creating, dropping and modifying time series, templates and views under authorized paths.<br>When creating or modifying a view, the system checks the `WRITE_SCHEMA` privilege for the view path and the `READ_SCHEMA` privilege for data sources.<br>Querying and inserting data into a view requires the `READ_DATA` and `WRITE_DATA` privileges for the view path.<br>Allows configuring, canceling and querying TTL settings under authorized paths.<br>Allows mounting and unmounting templates under authorized paths.<br>Supports renaming the full path of time series (supported since V2.0.8.2). |

### 3.3 Privilege Granting and Revocation
In IoTDB, users can obtain permissions through three methods:
1. Granted by the super administrator, who has full control over all user permissions.
2. Granted by common users with authorization permission, who have been assigned the `GRANT OPTION` keyword for specific privileges.
3. Assigned via roles granted by the super administrator or users with the `SECURITY` privilege.

Permissions can be revoked through the following methods:
1. Revoked by the super administrator.
2. Revoked by common users with authorization permission, who have been assigned the `GRANT OPTION` keyword for specific privileges.
3. Revoked by the super administrator or users with the `SECURITY` privilege by removing specific roles from target users.

- A valid path must be specified for all authorization operations. Global privileges require the path `root.**`, while time series privileges must use absolute paths or prefix paths ending with double wildcards.
- The `WITH GRANT OPTION` keyword can be specified when granting privileges to roles, enabling grantees to regrant or revoke corresponding privileges within the authorized path scope. For example, if User A is granted read access to `Group1.Company1.**` with the `GRANT OPTION`, User A can authorize or revoke read permissions for all sub-nodes and time series under `Group1.Company1`.
- During revocation, the system matches the revocation statement with all existing permission paths of the target user and clears all matched permissions. For instance, if User A owns the read privilege for `Group1.Company1.Factory1`, revoking the read privilege for `Group1.Company1.**` will clear the permission for the sub-path as well.

## 4. Syntax and Usage Examples
IoTDB provides combined privilege aliases to simplify authorization configuration:

| Privilege Name | Scope of Authority |
| ---------- | ---------------------------- |
| ALL | All privileges |
| READ | READ_SCHEMA, READ_DATA |
| WRITE | WRITE_SCHEMA, WRITE_DATA |

Combined privileges are simplified aliases rather than independent privilege types, and function identically to declaring individual privileges separately.

The following examples demonstrate common permission management SQL statements. Non-administrator users need corresponding prerequisites to execute these operations, which are noted in each scenario.

### 4.1 User and Role Management
- **Create User** (Requires `SECURITY` privilege)
```SQL
CREATE USER <userName> <password>
eg: CREATE USER user1 'Passwd@202604'
```

- **Drop User** (Requires `SECURITY` privilege)
```SQL
DROP USER <userName>
eg: DROP USER user1
```

- **Create Role** (Requires `SECURITY` privilege)
```SQL
CREATE ROLE <roleName>
eg: CREATE ROLE role1
```

- **Drop Role** (Requires `SECURITY` privilege)
```SQL
DROP ROLE <roleName>
eg: DROP ROLE role1
```

- **Grant Role to User** (Requires `SECURITY` privilege)
```SQL
GRANT ROLE <ROLENAME> TO <USERNAME>
eg: GRANT ROLE admin TO user1
```

- **Revoke Role from User** (Requires `SECURITY` privilege)
```SQL
REVOKE ROLE <ROLENAME> FROM <USER>
eg: REVOKE ROLE admin FROM user1
```

- **List All Users** (Requires `SECURITY` privilege)
```SQL
LIST USER
```

- **List All Roles** (Requires `SECURITY` privilege)
```SQL
LIST ROLE
```

- **List All Users Under a Specified Role** (Requires `SECURITY` privilege)
```SQL
LIST USER OF ROLE <roleName>
eg: LIST USER OF ROLE roleuser
```

- **List Roles of a Specified User**
  Users can view their own roles; viewing other users' roles requires the `SECURITY` privilege.
```SQL
LIST ROLE OF USER <username> 
eg: LIST ROLE OF USER tempuser
```

- **List All Privileges of a Specified User**
  Users can view their own privileges; viewing other users' privileges requires the `SECURITY` privilege.
```SQL
LIST PRIVILEGES OF USER <username>;
eg: LIST PRIVILEGES OF USER tempuser;
```

- **List All Privileges of a Specified Role**
  Users can view privileges of their assigned roles; viewing other roles' privileges requires the `SECURITY` privilege.
```SQL
LIST PRIVILEGES OF ROLE <roleName>;
eg: LIST PRIVILEGES OF ROLE actor;
```

- **Modify Password**
  Users can update their own passwords; modifying other users' passwords requires the `SECURITY` privilege.
```SQL
ALTER USER <username> SET PASSWORD <password>;
eg: ALTER USER tempuser SET PASSWORD 'Newpwd@202604';
```

### 4.2 Privilege Granting and Revocation
#### Grant Syntax
```SQL
GRANT <PRIVILEGES> ON <PATHS> TO ROLE/USER <NAME> [WITH GRANT OPTION];
eg: GRANT READ ON root.** TO ROLE role1;
eg: GRANT READ_DATA, WRITE_DATA ON root.t1.** TO USER user1;
eg: GRANT READ_DATA, WRITE_DATA ON root.t1.**,root.t2.** TO USER user1;
eg: GRANT SECURITY ON root.** TO USER user1 WITH GRANT OPTION;
eg: GRANT ALL ON root.** TO USER user1 WITH GRANT OPTION;
```

#### Revoke Syntax
```SQL
REVOKE <PRIVILEGES> ON <PATHS> FROM ROLE/USER <NAME>;
eg: REVOKE READ ON root.** FROM ROLE role1;
eg: REVOKE READ_DATA, WRITE_DATA ON root.t1.** FROM USER user1;
eg: REVOKE READ_DATA, WRITE_DATA ON root.t1.**, root.t2.** FROM USER user1;
eg: REVOKE SECURITY  ON root.** FROM USER user1;
eg: REVOKE ALL ON root.** FROM USER user1;
```

- Non-administrator users must hold the target privileges with the `WITH GRANT OPTION` attribute for the specified paths to execute grant or revoke operations.
- When granting or revoking global privileges (or statements containing global privileges, as `ALL` includes global privileges), the path must be set to `root.**`.

**Valid Examples of Grant & Revoke**
```SQL
GRANT SECURITY  ON root.** TO USER user1;
GRANT SECURITY  ON root.** TO ROLE role1  WITH GRANT OPTION;
GRANT ALL ON  root.** TO role role1  WITH GRANT OPTION;
REVOKE SECURITY  ON root.** FROM USER user1;
REVOKE SECURITY  ON root.** FROM ROLE role1;
REVOKE ALL ON root.** FROM ROLE role1;
```

**Invalid Statements**
```SQL
GRANT READ, SECURITY  ON root.t1.** TO USER user1;
GRANT ALL ON root.t1.t2 TO USER user1 WITH GRANT OPTION;
REVOKE ALL ON root.t1.t2 FROM USER user1;
REVOKE READ, SECURITY  ON root.t1.t2 FROM ROLE ROLE1;
```

- Valid path formats include complete absolute paths and paths ending with double wildcards:
```SQL
-- Valid Paths
root.**
root.t1.t2.**
root.t1.t2.t3
```

```SQL
-- Invalid Paths
root.t1.*
root.t1.**.t2
root.t1*.t2.t3
```

## 5. Practical Scenario Example
Based on the [sample data](https://github.com/thulab/iotdb/files/4438687/OtherMaterial-Sample.Data.txt), IoTDB sample data belongs to multiple power generation groups such as ln and sgcc. To prevent cross-group data access, strict permission isolation at the group level is required.

### 5.1 Create Users
Use the `CREATE USER` statement to create new users. For example, the root administrator creates two write users for the ln and sgcc groups with the unified password `write_Pwd@2026`. It is recommended to wrap usernames with backticks (`).

```SQL
CREATE USER `ln_write_user` 'write_Pwd@2026';
CREATE USER `sgcc_write_user` 'write_Pwd@2026';
```

Execute the following statement to query all users:
```SQL
LIST USER;
```

Query result:
```
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

### 5.2 Grant Permissions
Newly created users have no permissions by default and cannot perform any database operations. For example, an insertion executed by `ln_write_user` will fail:
```SQL
INSERT INTO root.ln.wf01.wt01(timestamp,status) values(1509465600000,true);
```

Error message:
```
IoTDB> INSERT INTO root.ln.wf01.wt01(timestamp,status) values(1509465600000,true);
Msg: 803: No permissions for this operation, please add privilege WRITE_DATA on [root.ln.wf01.wt01.status]
```

Grant targeted write permissions to each user via the root account:
```SQL
GRANT WRITE_DATA ON root.ln.** TO USER `ln_write_user`;
GRANT WRITE_DATA ON root.sgcc1.**, root.sgcc2.** TO USER `sgcc_write_user`;
```

Execution result:
```
IoTDB> GRANT WRITE_DATA ON root.ln.** TO USER `ln_write_user`;
Msg: The statement is executed successfully.
IoTDB> GRANT WRITE_DATA ON root.sgcc1.**, root.sgcc2.** TO USER `sgcc_write_user`;
Msg: The statement is executed successfully.
```

Retry data insertion with `ln_write_user`:
```SQL
IoTDB> INSERT INTO root.ln.wf01.wt01(timestamp, status) values(1509465600000, true);
Msg: The statement is executed successfully.
```

### 5.3 Revoke Permissions
Use the `REVOKE` statement to reclaim granted permissions:
```SQL
REVOKE WRITE_DATA ON root.ln.** FROM USER `ln_write_user`
REVOKE WRITE_DATA ON root.sgcc1.**, root.sgcc2.** FROM USER `sgcc_write_user`
```

Execution result:
```
IoTDB> REVOKE WRITE_DATA ON root.ln.** FROM USER `ln_write_user`
Msg: The statement is executed successfully.
IoTDB> REVOKE WRITE_DATA ON root.sgcc1.**, root.sgcc2.** FROM USER `sgcc_write_user`
Msg: The statement is executed successfully.
```

After permission revocation, `ln_write_user` loses write access to the `root.ln.**` path:
```SQL
IoTDB> INSERT INTO root.ln.wf01.wt01(timestamp, status) values(1509465600000, true)
Msg: 803: No permissions for this operation, please add privilege WRITE_DATA on [root.ln.wf01.wt01.status]
```

## 6. Authentication & Supplementary Instructions
### 6.1 Authentication Mechanism
User permissions consist of three core elements: effective path scope, privilege type, and the `WITH GRANT OPTION` tag.
```Plain
userTest1 : 
    root.t1.**  -  read_schema, read_data     -    with grant option
    root.**     -  write_schema, write_data   -    with grant option
```

Each user has an independent permission list recording all authorized privileges, which can be queried via `LIST PRIVILEGES OF USER <username>`.

During authentication, the system matches the target operation path with authorized paths in sequence. When verifying the `read_schema` privilege for `root.t1.t2`, the system first matches the path rule `root.t1.**`. If matched, it checks whether the required privilege is included; otherwise, it continues matching until a valid rule is found or all rules are traversed.

- For multi-path query tasks, the system only returns data accessible to the current user and filters out unauthorized content.
- For multi-path write tasks, the operation requires valid write permissions for **all** target time series.

**Operations Requiring Combined Privileges**
1. With automatic time series creation enabled, inserting data into non-existent time series requires both `WRITE_DATA` and metadata modification privileges.
2. The `SELECT INTO` statement requires read privileges for source paths and write privileges for target paths. Insufficient source permissions lead to incomplete data; insufficient target permissions will terminate the task and throw an error.
3. View permissions are independent of underlying data sources. Read and write operations on views only verify view-specific permissions without checking privileges of the original data paths.

### 6.2 Supplementary Notes
A role is a collection of privileges, while users have two types of attributes: independent individual privileges and inherited role privileges. A single role can contain multiple privileges, and a single user can be assigned multiple roles and independent permissions.

No conflicting permissions exist in IoTDB. A user’s final effective permissions are the **union** of personal privileges and all privileges from assigned roles. An operation is permitted if either the user’s individual privileges or inherited role privileges contain the required authorization. Duplicate permissions between personal and role settings do not affect normal usage.

Key notes:
If a user holds an independent privilege for Operation A and obtains the same privilege via a role, revoking only the user’s individual privilege cannot restrict the operation. Administrators must revoke the privilege from the corresponding role or remove the role from the user to disable the operation completely. Similarly, revoking privileges only from roles cannot restrict users with independent permissions.

Modifications to role permissions take effect in real time for all bound users. Adding privileges to a role immediately grants access to all associated users, and removing privileges will revoke corresponding access unless users hold independent overriding permissions.