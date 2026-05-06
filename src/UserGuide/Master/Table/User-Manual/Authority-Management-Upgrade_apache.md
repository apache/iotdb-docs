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

IoTDB provides permission management capabilities to implement fine-grained access control for data and cluster systems, ensuring data and system security. This article introduces the core concepts of the permission module under the IoTDB Table Model, user specifications, permission governance, authentication logic, and practical use cases.

## 1. Core Concepts
### 1.1 User
A user refers to a legitimate database operator. Each user corresponds to a unique username and is authenticated by a password. To use the database, users must provide valid usernames and passwords stored in the system.

### 1.2 Privilege
The database supports a wide range of operations, but not all users are authorized to perform every action. A user is considered to have the corresponding privilege if permitted to execute a specific operation.

### 1.3 Role
A role is a collection of privileges identified by a unique role name. Roles correspond to actual job identities (e.g., traffic dispatchers), and multiple users may share the same identity. Users with identical job roles usually require consistent permissions. Roles serve as an abstraction for unified permission management among user groups.

### 1.4 Default Users and Roles
After initialization, IoTDB provides one default user named `root` with the default password `root`. As the administrator account, root owns all privileges permanently. Its permissions cannot be granted, revoked, or deleted, and it is the sole administrator user in the database.
Newly created users and roles have no permissions by default.

## 2. User Specifications
Users with the `SECURITY` privilege can create users and roles, subject to the following constraints:

### 2.1 Username Rules
- Usernames must be 4 to 32 characters long, including uppercase and lowercase letters, digits, and special symbols (`!@#$%^&*()_+-=`). Creation of usernames identical to the administrator account is prohibited.
- If a username consists entirely of digits or contains special characters, it must be enclosed in double quotation marks `""` during creation.

### 2.2 Password Rules
Passwords must be 4 to 32 characters long, including uppercase and lowercase letters, digits, and special symbols (`!@#$%^&*()_+-=`). A password cannot be the same as the associated username.

### 2.3 Role Name Rules
Role names must be 4 to 32 characters long, including uppercase and lowercase letters, digits, and special symbols (`!@#$%^&*()_+-=`). Creation of role names identical to the administrator account is prohibited.

## 3. Permission Management
Under the IoTDB Table Model, permissions are divided into two major categories: global privileges and data privileges.

### 3.1 Global Privileges
Global privileges include two types: `SYSTEM` and `SECURITY`:
- **SYSTEM**: Governs O&M operations and Data Definition Language (DDL) related privileges.
- **SECURITY**: Governs the management of users and roles, as well as privilege granting for other accounts.

Detailed descriptions of each global privilege are shown in the table below:

<table style="text-align: left;">
  <tbody>
     <tr>
            <th>Privilege Category</th>
            <th>Original Privilege Name</th>
            <th>Description</th>
      </tr>
      <tr>
            <td rowspan="6">SYSTEM</td>
            <td>N/A</td>
            <td>Allows users to create, alter and drop databases.</td>
      </tr>
      <tr>
            <td>N/A</td>
            <td>Allows users to create, alter and drop tables and table views.</td>
      </tr>
      <tr>
            <td>N/A</td>
            <td>Allows users to create, drop and query user-defined functions.</td>
      </tr>
      <tr>
            <td>N/A</td>
            <td>Allows users to create, start, stop, drop and query PIPE tasks; allows users to create, drop and query PIPEPLUGINS.</td>
      </tr>
      <tr>
            <td>N/A</td>
            <td>Allows users to execute and cancel queries, view system variables, and check cluster status.</td>
      </tr>
      <tr>
            <td>N/A</td>
            <td>Allows users to create, drop and query deep learning models.</td>
      </tr>
      <tr>
            <td rowspan="2">SECURITY</td>
            <td>MANAGE_USER</td>
            <td>Allows users to create and drop users, modify user passwords, view user privilege information, and list all users.</td>
      </tr>
      <tr>
            <td>MANAGE_ROLE</td>
            <td>Allows users to create and drop roles, view role privilege information, grant roles to users, revoke roles from users, and list all roles.</td>
      </tr>
  </tbody>
</table>

### 3.2 Data Privileges
Data privileges consist of privilege types and effective scopes.

- **Privilege Types**: `CREATE`, `DROP`, `ALTER`, `SELECT`, `INSERT`, `DELETE`.
- **Scopes**: `ANY` (system-wide), `DATABASE` (database-level), `TABLE` (single table).
  - Privileges with the `ANY` scope apply to all databases and tables.
  - Database-level privileges apply to the specified database and all tables within it.
  - Table-level privileges only take effect on the designated single table.
- **Scope Matching Rules**: When executing single-table operations, the system matches user privileges by scope level. For example, when writing data to `DATABASE1.TABLE1`, the system checks write permissions in sequence for `ANY`, `DATABASE1`, and `DATABASE1.TABLE1` until a matching privilege is found or the check fails.

The logical relationship between privilege types, scopes and capabilities is shown below:

<table style="text-align: left;">
  <tbody>
     <tr>
            <th>Privilege Type</th>
            <th>Scope Level</th>        
            <th>Capability Description</th>
      </tr>
      <tr>
            <td rowspan="3">CREATE</td>   
            <td>ANY</td> 
            <td>Allows creating any databases and tables.</td> 
      </tr>
      <tr>
            <td>Database</td>   
            <td>Allows creating databases with the specified name and creating tables under the target database.</td> 
      </tr>
      <tr>
            <td>Table</td>   
            <td>Allows creating the specified table.</td> 
      </tr>
      <tr>
            <td rowspan="3">DROP</td>   
            <td>ANY</td> 
            <td>Allows dropping any databases and tables.</td> 
      </tr>
      <tr>
            <td>Database</td>   
            <td>Allows dropping the specified database and all tables under it.</td> 
      </tr>
      <tr>
            <td>Table</td>   
            <td>Allows dropping the specified table.</td> 
      </tr>
      <tr>
            <td rowspan="3">ALTER</td>   
            <td>ANY</td> 
            <td>Allows modifying the definitions of any databases and tables.</td> 
      </tr>
      <tr>
            <td>Database</td>   
            <td>Allows modifying database definitions and the definitions of all tables under the target database.</td> 
      </tr>
      <tr>
            <td>Table</td>   
            <td>Allows modifying the structure and definition of the specified table.</td> 
      </tr>
      <tr>
            <td rowspan="3">SELECT</td>   
            <td>ANY</td> 
            <td>Allows querying data from all tables across all databases in the system.</td> 
      </tr>
      <tr>
            <td>Database</td>   
            <td>Allows querying data from all tables under the specified database.</td> 
      </tr>
      <tr>
            <td>Table</td>   
            <td>Allows querying data of the specified table. For multi-table queries, only accessible data with valid permissions will be displayed.</td> 
      </tr>
      <tr>
            <td rowspan="3">INSERT</td>   
            <td>ANY</td> 
            <td>Allows inserting and updating data in any tables of all databases.</td> 
      </tr>
      <tr>
            <td>Database</td>   
            <td>Allows inserting and updating data in all tables under the specified database.</td> 
      </tr>
      <tr>
            <td>Table</td>   
            <td>Allows inserting and updating data in the specified table.</td> 
      </tr>
      <tr>
            <td rowspan="3">DELETE</td>   
            <td>ANY</td> 
            <td>Allows deleting data from any tables.</td> 
      </tr>
      <tr>
            <td>Database</td>   
            <td>Allows deleting data within the specified database scope.</td> 
      </tr>
      <tr>
            <td>Table</td>   
            <td>Allows deleting data from the specified table.</td> 
      </tr>
  </tbody>
</table>

### 3.3 Privilege Granting and Revocation
In IoTDB, user privileges can be granted or revoked through three methods:
1. Direct granting or revocation by the super administrator.
2. Granting or revocation by common users with the `GRANT OPTION` privilege.
3. Granting or revocation via role assignment, operated by the super administrator or users with `SECURITY` privileges.

The following rules apply to privilege management under the IoTDB Table Model:
- No scope needs to be specified when granting or revoking global privileges.
- Data privilege operations require explicit privilege types and scopes. Revocation only takes effect on the specified scope and is not affected by hierarchical inclusion relationships.
- Pre-authorization is supported for databases and tables that have not yet been created.
- Repeated granting or revocation of privileges is allowed.
- **WITH GRANT OPTION**: Grants users the permission to manage privileges within their authorized scope, including granting and revoking corresponding permissions for other users.

## 4. Syntax and Usage Examples
### 4.1 User and Role Management
1. **Create User** (Requires `SECURITY` privilege)
```SQL
CREATE USER <USERNAME> <PASSWORD>   
-- Example
CREATE USER user1 'passwd'
```

2. **Modify Password**
   Users can update their own passwords; modifying other users' passwords requires the `SECURITY` privilege.
```SQL
ALTER USER <USERNAME> SET PASSWORD <password>
-- Example
ALTER USER tempuser SET PASSWORD 'newpwd'
```

3. **Drop User** (Requires `SECURITY` privilege)
```SQL
DROP USER <USERNAME>
-- Example
DROP USER user1
```

4. **Create Role** (Requires `SECURITY` privilege)
```SQL
CREATE ROLE <ROLENAME>
-- Example
CREATE ROLE role1
```

5. **Drop Role** (Requires `SECURITY` privilege)
```SQL
DROP ROLE <ROLENAME>
-- Example
DROP ROLE role1
```

6. **Grant Role to User** (Requires `SECURITY` privilege)
```SQL
GRANT ROLE <ROLENAME> TO <USERNAME>
-- Example
GRANT ROLE admin TO user1
```

7. **Revoke Role from User** (Requires `SECURITY` privilege)
```SQL
REVOKE ROLE <ROLENAME> FROM <USERNAME>
-- Example
REVOKE ROLE admin FROM user1
```

8. **List All Users** (Requires `SECURITY` privilege)
```SQL
LIST USER
```

9. **List All Roles** (Requires `SECURITY` privilege)
```SQL
LIST ROLE
```

10. **List Users Assigned to a Specified Role** (Requires `SECURITY` privilege)
```SQL
LIST USER OF ROLE <ROLENAME>
-- Example
LIST USER OF ROLE roleuser
```

11. **List Roles of a Specified User**
    Users can view their own roles; viewing other users' roles requires the `SECURITY` privilege.
```SQL
LIST ROLE OF USER <USERNAME>
-- Example
LIST ROLE OF USER tempuser
```

12. **List All Privileges of a User**
    Users can view their own privileges; viewing other users' privileges requires the `SECURITY` privilege.
```SQL
LIST PRIVILEGES OF USER <USERNAME>
-- Example
LIST PRIVILEGES OF USER tempuser
```

13. **List All Privileges of a Role**
    Users can view privileges of their assigned roles; viewing other roles' privileges requires the `SECURITY` privilege.
```SQL
LIST PRIVILEGES OF ROLE <ROLENAME>
-- Example
LIST PRIVILEGES OF ROLE actor
```

### 4.2 Privilege Granting and Revocation
#### 4.2.1 Grant Privileges
1. Grant user management privileges to a user
```SQL
GRANT SECURITY TO USER <USERNAME>
-- Example
GRANT SECURITY TO USER TEST_USER
```

2. Grant database and table creation privileges with permission management rights
```SQL
GRANT CREATE ON DATABASE <DATABASE> TO USER <USERNAME> WITH GRANT OPTION
-- Example
GRANT CREATE ON DATABASE TESTDB TO USER TEST_USER WITH GRANT OPTION
```

3. Grant database query privileges to a role
```SQL
GRANT SELECT ON DATABASE <DATABASE> TO ROLE <ROLENAME>
-- Example
GRANT SELECT ON DATABASE TESTDB TO ROLE TEST_ROLE
```

4. Grant table query privileges to a user
```SQL
GRANT SELECT ON <DATABASE>.<TABLENAME> TO USER <USERNAME>
-- Example
GRANT SELECT ON TESTDB.TESTTABLE TO USER TEST_USER
```

5. Grant global query privileges to a role
```SQL
GRANT SELECT ON ANY TO ROLE <ROLENAME>
-- Example
GRANT SELECT ON ANY TO ROLE TEST_ROLE
```

6. **ALL Syntax Sugar**: `ALL` represents all privileges within the target scope
```SQL
-- Grant all global privileges and full data privileges under ANY scope
GRANT ALL TO USER TESTUSER

-- Grant all data privileges under ANY scope
GRANT ALL ON ANY TO USER TESTUSER

-- Grant all data privileges under the specified database
GRANT ALL ON DATABASE TESTDB TO USER TESTUSER

-- Grant all data privileges under the specified table
GRANT ALL ON TABLE TESTTABLE TO USER TESTUSER
```

#### 4.2.2 Revoke Privileges
1. Revoke user management privileges
```SQL
REVOKE SECURITY FROM USER <USERNAME>
-- Example
REVOKE SECURITY FROM USER TEST_USER
```

2. Revoke database and table creation privileges
```SQL
REVOKE CREATE ON DATABASE <DATABASE> FROM USER <USERNAME>
-- Example
REVOKE CREATE ON DATABASE TEST_DB FROM USER TEST_USER
```

3. Revoke table query privileges
```SQL
REVOKE SELECT ON <DATABASE>.<TABLENAME> FROM USER <USERNAME>
-- Example
REVOKE SELECT ON TESTDB.TESTTABLE FROM USER TEST_USER
```

4. Revoke global query privileges
```SQL
REVOKE SELECT ON ANY FROM USER <USERNAME>
-- Example
REVOKE SELECT ON ANY FROM USER TEST_USER
```

5. **ALL Syntax Sugar** for revocation
```SQL
-- Revoke all global privileges and ANY-scoped data privileges
REVOKE ALL FROM USER TESTUSER

-- Only revoke ANY-scoped data privileges
REVOKE ALL ON ANY FROM USER TESTUSER

-- Only revoke all data privileges of the specified database
REVOKE ALL ON DATABASE TESTDB FROM USER TESTUSER

-- Only revoke all data privileges of the specified table
REVOKE ALL ON TABLE TESTDB FROM USER TESTUSER
```

### 4.3 View User Privileges
Each user has an independent privilege list recording all authorized permissions. Use the following statement to query privilege details:
```SQL
LIST PRIVILEGES OF USER <USERNAME>
```

Output format:

| ROLE  | SCOPE   | PRIVILEGE | WITH GRANT OPTION |
| ------- |---------|------------| ------------------- |
|       | DB1.TB1 | SELECT     | FALSE             |
|       |         | SECURITY   | TRUE              |
| ROLE1 | DB2.TB2 | INSERT     | TRUE              |
| ROLE1 | DB3.*   | DELETE     | FALSE             |
| ROLE1 | *.*     | UPDATE     | TRUE              |

- **ROLE Column**: Blank for self-owned user privileges; displays the role name if the privilege is inherited from a role.
- **SCOPE Column**: Table-level scope displayed as `DB.TABLE`, database-level scope as `DB.*`, and global ANY scope as `*.*`.
- **PRIVILEGE Column**: Lists specific authorized privilege types.
- **WITH GRANT OPTION Column**: `TRUE` means the user can regrant or revoke privileges within the corresponding scope.

> Note: Users and roles can hold permissions for both the Tree Model and Table Model simultaneously. The system only displays permissions applicable to the currently connected model, while permissions for the other model are hidden.

## 5. Practical Scenario Example
Based on the [Sample Data](../Reference/Sample-Data.md), data in different tables belongs to two independent data centers (bj and sh). To ensure data isolation, cross-center data access needs to be restricted through permission control.

### 5.1 Create Users
Use the `CREATE USER` statement to create new users. For example, the root administrator creates two dedicated write users for the BJ and SH data centers: `bj_write_user` and `sh_write_user`, with a unified password `write_pwd`.

```SQL
CREATE USER bj_write_user 'write_pwd';
CREATE USER sh_write_user 'write_pwd';
```

Execute the user query statement:
```SQL
LIST USER
```

Query result:
```
+------+-------------+-----------------+-----------------+
|UserId|         User|MaxSessionPerUser|MinSessionPerUser|
+------+-------------+-----------------+-----------------+
|     0|         root|               -1|                1|
| 10000|bj_write_user|               -1|               -1|
| 10001|sh_write_user|               -1|               -1|
+------+-------------+-----------------+-----------------+
```

### 5.2 Grant Privileges
Newly created users have no permissions by default and cannot perform database operations. For example, an insertion executed by `bj_write_user` will fail:
```SQL
INSERT INTO table1(region, plant_id, device_id, model_id, maintenance, time, temperature, humidity, status, arrival_time) VALUES ('Beijing', '1001', '100', 'A', '180', '2025-03-26 13:37:00', 190.0, 30.1, false, '2025-03-26 13:37:34')
```

Error message after switching to the target database:
```
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 803: Access Denied: DATABASE database1
```

Grant table write privileges to `bj_write_user` via the root account:
```SQL
GRANT INSERT ON database1.table1 TO USER bj_write_user
```

Retry data insertion after switching databases:
```SQL
IoTDB> use database1
Msg: The statement is executed successfully.
IoTDB:database1> INSERT INTO table1(region, plant_id, device_id, model_id, maintenance, time, temperature, humidity, status, arrival_time) VALUES ('Beijing', '1001', '100', 'A', '180', '2025-03-26 13:37:00', 190.0, 30.1, false, '2025-03-26 13:37:34')
Msg: The statement is executed successfully.
```

### 5.3 Revoke Privileges
Use the `REVOKE` statement to reclaim granted permissions:
```SQL
REVOKE INSERT ON database1.table1 FROM USER bj_write_user
REVOKE INSERT ON database1.table2 FROM USER sh_write_user
```

After revocation, the user loses corresponding write permissions and will receive a permission denied error when attempting to write data again:
```
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 803: Access Denied: No permissions for this operation, please add privilege INSERT ON database1.table1
```
