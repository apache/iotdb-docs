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

IoTDB provides permission management capabilities for users to control access to data and cluster systems, ensuring data and system security. This article introduces the core concepts of the permission module in IoTDB, user definitions, permission governance, authentication logic, and practical use cases.

## 1. Core Concepts
### 1.1 User
A user refers to a legitimate database operator. Each user corresponds to a unique username and is authenticated via a password. Before accessing the database, users must log in with valid usernames and passwords stored in the system.

### 1.2 Privilege
The database supports a wide range of operations, but not all users are authorized to perform every action. A user is considered privileged for an operation if they are permitted to execute it. Each privilege is bounded by a specific path, and path patterns ([Path Pattern](../Basic-Concept/Operate-Metadata_apache.md)) enable flexible permission management.

### 1.3 Role
A role is a collection of privileges identified by a unique role name. Roles correspond to actual job identities (e.g., traffic dispatchers), and multiple users may share the same identity and identical permission sets. Roles enable unified batch management of permissions for user groups with identical access requirements.

### 1.4 Default Users and Roles
After initialization, IoTDB contains one default user: `root` with the default password `root`. As the built-in administrator account, the root user owns all permissions permanently. Its permissions cannot be granted, revoked, or deleted, and it is the sole administrator account in the database.

Newly created users and roles have no permissions by default.

## 2. User Specifications
Users with the `SECURITY` privilege are allowed to create users and roles, subject to the following constraints:

### 2.1 Username Rules
Usernames must be 4 to 32 characters long, supporting uppercase and lowercase letters, digits, and special symbols (`!@#$%^&*()_+-=`). Creation of duplicate usernames matching the administrator account is prohibited.

### 2.2 Password Rules
Passwords must be 4 to 32 characters long, supporting uppercase and lowercase letters, digits, and special symbols (`!@#$%^&*()_+-=`). Passwords cannot be identical to the associated username.

### 2.3 Role Name Rules
Role names must be 4 to 32 characters long, supporting uppercase and lowercase letters, digits, and special symbols (`!@#$%^&*()_+-=`). Creation of duplicate role names matching the administrator account is prohibited.

## 3. Permission Governance
Based on its tree data model, IoTDB classifies permissions into two major categories: global privileges and series privileges.

### 3.1 Global Privileges
Global privileges include two types: `SYSTEM` and `SECURITY`:
- **SYSTEM**: Governs O&M operations and Data Definition Language (DDL) actions.
- **SECURITY**: Governs user/role management and privilege granting for other accounts.

Detailed descriptions of each global privilege are shown in the table below:

<table style="text-align: left;">
  <tbody>
     <tr>
            <th>Privilege Name</th>
            <th>Original Privilege Name</th>
            <th>Description</th>
      </tr>
      <tr>
            <td rowspan="8">SYSTEM</td>
            <td>MANAGE_DATABASE</td>
            <td>Allows creation and deletion of databases.</td>
      </tr>
      <tr>
            <td>USE_TRIGGER</td>
            <td>Allows creation, deletion and query of triggers.</td>
      </tr>
      <tr>
            <td>USE_UDF</td>
            <td>Allows creation, deletion and query of user-defined functions.</td>
      </tr>
      <tr>
            <td>USE_PIPE</td>
            <td>Allows creation, startup, stop, deletion and query of PIPE tasks; allows creation, deletion and query of PIPEPLUGINS.</td>
      </tr>
      <tr>
            <td>USE_CQ</td>
            <td>Allows registration, startup, stop, uninstallation and query of stream processing tasks; allows registration, uninstallation and query of stream processing plugins.</td>
      </tr>
      <tr>
            <td>EXTEND_TEMPLATE</td>
            <td>Allows automatic template extension.</td>
      </tr>
      <tr>
            <td>MAINTAIN</td>
            <td>Allows query execution and cancellation, system variable viewing, and cluster status inspection.</td>
      </tr>
      <tr>
            <td>USE_MODEL</td>
            <td>Allows creation, deletion and query of deep learning models.</td>
      </tr>
      <tr>
            <td rowspan="2">SECURITY</td>
            <td>MANAGE_USER</td>
            <td>Allows creation, deletion, modification and query of users.</td>
      </tr>
      <tr>
            <td>MANAGE_ROLE</td>
            <td>Allows creation, deletion and query of roles; grants and revokes roles for other users.</td>
      </tr>
  </tbody>
</table>

#### Template-Related Permission Rules
1. Template creation, deletion, modification, query, mounting and unmounting are restricted to the administrator only.
2. Template activation requires the `WRITE_SCHEMA` privilege for the target activation path.
3. When auto-creation is enabled, writing data to non-existent paths with mounted templates requires both the `EXTEND_TEMPLATE` privilege and the `WRITE_DATA` privilege for target time series.
4. Template unmounting requires the `WRITE_SCHEMA` privilege for the template mounting path.
5. Querying paths bound to metadata templates requires the `READ_SCHEMA` privilege for the target path; empty results will be returned without sufficient permissions.

### 3.2 Series Privileges
Series privileges control the scope and mode of user data access, supporting authorization for absolute paths and prefix-matched paths at the time series granularity.

Definitions of all series privileges are listed below:

| Privilege Name | Description |
| --------------- |-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| READ_DATA | Allows reading time series data under authorized paths. |
| WRITE_DATA | Permits reading time series data under authorized paths;<br>Allows insertion and deletion of time series data;<br>Supports data import and loading. Data import requires the `WRITE_DATA` privilege for target paths; automatic database and time series creation additionally requires `SYSTEM` and `WRITE_SCHEMA` privileges. |
| READ_SCHEMA | Allows viewing detailed metadata tree information under authorized paths, including databases, sub-paths, nodes, devices, time series, templates and views. |
| WRITE_SCHEMA | Permits viewing metadata tree information under authorized paths;<br>Enables creation, deletion and modification of time series, templates and views;<br>View creation and modification require `WRITE_SCHEMA` for the view path and `READ_SCHEMA` for data sources; view read/write operations require `READ_DATA` and `WRITE_DATA` for the view path;<br>Supports TTL configuration, cancellation and query;<br>Allows template mounting and unmounting. |

### 3.3 Privilege Granting and Revocation
Users can obtain permissions through three methods:
1. Grants issued by the super administrator (root).
2. Grants issued by common users with the `grant option` for specific privileges.
3. Role assignment by the super administrator or users with the `SECURITY` privilege.

Permissions can be revoked through three methods:
1. Revocation operations executed by the super administrator.
2. Revocation operations executed by common users with the `grant option` for specific privileges.
3. Role revocation performed by the super administrator or users with the `SECURITY` privilege.

- A valid path must be specified for all authorization operations. Global privileges require the path `root.**`, while series privileges require absolute paths or prefix paths ending with double wildcards.
- The `WITH GRANT OPTION` keyword can be appended during role authorization, enabling grantees to regrant or revoke the same privileges within the authorized path scope. For example, if User A is granted read access to `Group1.Company1.**` with the grant option, User A can authorize or revoke read permissions for all sub-nodes under `Group1.Company1`.
- Revocation statements perform full matching against existing user permission paths. For instance, revoking read access for `Group1.Company1.**` will clear all granular read permissions for sub-paths such as `Group1.Company1.Factory1`.

## 4. Syntax and Usage Examples
IoTDB provides combined privilege aliases to simplify authorization configuration:

| Combined Privilege | Coverage |
| ---------- | ---------------------------- |
| ALL | All system and series privileges |
| READ | READ_SCHEMA, READ_DATA |
| WRITE | WRITE_SCHEMA, WRITE_DATA |

Combined privileges are simplified aliases and function identically to declaring individual privileges separately.

The following examples demonstrate common permission management SQL statements. Non-administrator users require corresponding prerequisites for executing these operations, which are marked in each scenario.

### 4.1 User and Role Management
- **Create User** (Requires `SECURITY` privilege)
```SQL
CREATE USER <userName> <password>
-- Example
CREATE USER user1 'passwd'
```

- **Drop User** (Requires `SECURITY` privilege)
```SQL
DROP USER <userName>
-- Example
DROP USER user1
```

- **Create Role** (Requires `SECURITY` privilege)
```SQL
CREATE ROLE <roleName>
-- Example
CREATE ROLE role1
```

- **Drop Role** (Requires `SECURITY` privilege)
```SQL
DROP ROLE <roleName>
-- Example
DROP ROLE role1
```

- **Grant Role to User** (Requires `SECURITY` privilege)
```SQL
GRANT ROLE <ROLENAME> TO <USERNAME>
-- Example
GRANT ROLE admin TO user1
```

- **Revoke Role from User** (Requires `SECURITY` privilege)
```SQL
REVOKE ROLE <ROLENAME> FROM <USER>
-- Example
REVOKE ROLE admin FROM user1
```

- **List All Users** (Requires `SECURITY` privilege)
```SQL
LIST USER
```

- **List All Roles** (Requires `SECURITY` privilege)
```SQL
LIST ROLE
```

- **List Users Assigned to a Specified Role** (Requires `SECURITY` privilege)
```SQL
LIST USER OF ROLE <roleName>
-- Example
LIST USER OF ROLE roleuser
```

- **List Roles of a Specified User**
  Users can view their own roles; viewing other users' roles requires the `SECURITY` privilege.
```SQL
LIST ROLE OF USER <username> 
-- Example
LIST ROLE OF USER tempuser
```

- **List All Privileges of a Specified User**
  Users can view their own privileges; viewing other users' privileges requires the `SECURITY` privilege.
```SQL
LIST PRIVILEGES OF USER <username>;
-- Example
LIST PRIVILEGES OF USER tempuser;
```

- **List All Privileges of a Specified Role**
  Users can view privileges of their assigned roles; viewing other roles' privileges requires the `SECURITY` privilege.
```SQL
LIST PRIVILEGES OF ROLE <roleName>;
-- Example
LIST PRIVILEGES OF ROLE actor;
```

- **Modify Password**
  Users can update their own passwords; modifying other users' passwords requires the `SECURITY` privilege.
```SQL
ALTER USER <username> SET PASSWORD <password>;
-- Example
ALTER USER tempuser SET PASSWORD 'newpwd';
```

### 4.2 Privilege Granting and Revocation
#### Grant Syntax
```SQL
GRANT <PRIVILEGES> ON <PATHS> TO ROLE/USER <NAME> [WITH GRANT OPTION];
-- Examples
GRANT READ ON root.** TO ROLE role1;
GRANT READ_DATA, WRITE_DATA ON root.t1.** TO USER user1;
GRANT READ_DATA, WRITE_DATA ON root.t1.**,root.t2.** TO USER user1;
GRANT SECURITY ON root.** TO USER user1 WITH GRANT OPTION;
GRANT ALL ON root.** TO USER user1 WITH GRANT OPTION;
```

#### Revoke Syntax
```SQL
REVOKE <PRIVILEGES> ON <PATHS> FROM ROLE/USER <NAME>;
-- Examples
REVOKE READ ON root.** FROM ROLE role1;
REVOKE READ_DATA, WRITE_DATA ON root.t1.** FROM USER user1;
REVOKE READ_DATA, WRITE_DATA ON root.t1.**, root.t2.** FROM USER user1;
REVOKE SECURITY  ON root.** FROM USER user1;
REVOKE ALL ON root.** FROM USER user1;
```

- Non-administrator users must hold the target privileges with the `WITH GRANT OPTION` attribute for the specified paths to execute grant or revoke operations.
- For global privileges (or statements containing global privileges such as `ALL`), the path must be strictly set to `root.**`.

**Valid Authorization Examples**
```SQL
GRANT SECURITY  ON root.** TO USER user1;
GRANT SECURITY  ON root.** TO ROLE role1  WITH GRANT OPTION;
GRANT ALL ON  root.** TO role role1  WITH GRANT OPTION;
REVOKE SECURITY  ON root.** FROM USER user1;
REVOKE SECURITY  ON root.** FROM ROLE role1;
REVOKE ALL ON root.** FROM ROLE role1;
```

**Invalid Authorization Examples**
```SQL
GRANT READ, SECURITY  ON root.t1.** TO USER user1;
GRANT ALL ON root.t1.t2 TO USER user1 WITH GRANT OPTION;
REVOKE ALL ON root.t1.t2 FROM USER user1;
REVOKE READ, SECURITY  ON root.t1.t2 FROM ROLE ROLE1;
```

- Valid path formats include absolute full paths and paths ending with double wildcards:
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
Based on [sample data](https://github.com/thulab/iotdb/files/4438687/OtherMaterial-Sample.Data.txt), IoTDB sample data belongs to multiple power generation groups such as ln and sgcc. To ensure data isolation, cross-group data access needs to be restricted via permission control.

### 5.1 Create Users
Use the `CREATE USER` statement to create dedicated users. The root administrator creates two write users for the ln and sgcc groups with the unified password `write_pwd`:
```SQL
CREATE USER `ln_write_user` 'write_pwd';
CREATE USER `sgcc_write_user` 'write_pwd';
```

Execute the user listing statement to verify creation:
```SQL
LIST USER;
```

Execution result:
```
IoTDB> CREATE USER `ln_write_user` 'write_pwd';
Msg: The statement is executed successfully.
IoTDB> CREATE USER `sgcc_write_user` 'write_pwd';
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
Newly created users have no permissions by default. Attempting to write data directly will trigger a permission error:
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

Retry data writing with `ln_write_user`:
```SQL
IoTDB> INSERT INTO root.ln.wf01.wt01(timestamp, status) values(1509465600000, true);
Msg: The statement is executed successfully.
```

### 5.3 Revoke Permissions
Use the `REVOKE` statement to reclaim granted permissions:
```SQL
REVOKE WRITE_DATA ON root.ln.** FROM USER `ln_write_user`;
REVOKE WRITE_DATA ON root.sgcc1.**, root.sgcc2.** FROM USER `sgcc_write_user`;
```

Execution result:
```
IoTDB> REVOKE WRITE_DATA ON root.ln.** FROM USER `ln_write_user`
Msg: The statement is executed successfully.
IoTDB> REVOKE WRITE_DATA ON root.sgcc1.**, root.sgcc2.** FROM USER `sgcc_write_user`
Msg: The statement is executed successfully.
```

After permission revocation, the user loses write access again:
```SQL
IoTDB> INSERT INTO root.ln.wf01.wt01(timestamp, status) values(1509465600000, true)
Msg: 803: No permissions for this operation, please add privilege WRITE_DATA on [root.ln.wf01.wt01.status]
```

## 6. Authentication & Supplementary Instructions
### 6.1 Authentication Mechanism
Each user's permission set consists of three core elements: effective path range, privilege type, and the `with grant option` tag.

```Plain
userTest1 : 
    root.t1.**  -  read_schema, read_data     -    with grant option
    root.**     -  write_schema, write_data   -    with grant option
```

All user permissions can be queried via `LIST PRIVILEGES OF USER <username>`.

During authentication, IoTDB matches the target operation path against the user's authorized paths in sequence. The check passes if a matching path and corresponding privilege are found; otherwise, the operation is rejected.

- For multi-path query tasks, only data accessible to the current user will be returned.
- For multi-path write tasks, the operation requires valid write permissions for **all** target time series.

**Operations Requiring Combined Permissions**
1. With auto-creation enabled, inserting data into non-existent time series requires both `WRITE_DATA` and `WRITE_SCHEMA` privileges.
2. The `SELECT INTO` statement requires read permissions for source paths and write permissions for target paths. Insufficient source permissions result in partial data; insufficient target permissions terminate the task directly.
3. View access control is isolated from source data paths. Read and write operations on views only verify view-specific permissions without checking underlying data source permissions.

### 6.2 Supplementary Notes
A role is an independent permission container, while users possess both individual standalone permissions and inherited role permissions.

User effective permissions are the **union** of personal permissions and all permissions from assigned roles. No permission conflicts exist in IoTDB.

- Revoking a user's standalone permission cannot restrict the operation if the same permission is inherited from an assigned role. To fully disable an operation, administrators must revoke both user-specific permissions and relevant role permissions, or unbind the role from the user.
- Role permission modifications take effect in real time for all bound users. Adding permissions to a role immediately grants access to all associated users, and removing permissions restricts access unless users hold identical standalone permissions.