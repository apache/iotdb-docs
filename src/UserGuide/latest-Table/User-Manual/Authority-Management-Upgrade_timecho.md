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

IoTDB provides permission management capabilities to deliver fine-grained access control for data and cluster systems, ensuring data and system security. This document introduces the basic concepts of the permission module under the IoTDB Table Model, user specifications, permission governance, authentication logic, and practical application examples.

## 1. Basic Concepts
### 1.1 User
A user is a legitimate database operator. Each user is identified by a unique username and authenticated with a password. To use the database, users must provide valid usernames and passwords stored in the system.

### 1.2 Privilege
The database supports a variety of operations, but not all users are authorized to perform every action. A user is considered to have the corresponding privilege if permitted to execute a specific operation.

### 1.3 Role
A role is a collection of privileges marked by a unique role identifier. Roles correspond to real-world job identities (e.g., traffic dispatchers), and one identity may cover multiple users. Users with identical job identities usually share the same set of permissions. Roles serve as an abstraction to realize unified permission management for such user groups.

### 1.4 Default Users and Roles
After initialization, IoTDB provides a default user `root` with the default password `TimechoDB@2021`. As the administrator account, root owns all privileges by default. Its permissions cannot be granted or revoked, and the account cannot be deleted. There is only one administrator user in the database.
Newly created users and roles have no permissions by default.

## 2. User Specifications
Users with the `SECURITY` privilege can create users and roles, and all creations must comply with the following constraints:

### 2.1 Username Rules
- Length: 4 to 32 characters. Supports uppercase and lowercase letters, digits, and special symbols (`!@#$%^&*()_+-=`). Usernames identical to the administrator account are not allowed.
- If a username consists entirely of digits or contains special characters, it must be enclosed in double quotation marks `""` during creation.

### 2.2 Password Rules
Length: 12 to 32 characters. A valid password must contain both uppercase and lowercase letters, at least one digit, and at least one special symbol (`!@#$%^&*()_+-=`). A password cannot be the same as the associated username.

### 2.3 Role Name Rules
Length: 4 to 32 characters. Supports uppercase and lowercase letters, digits, and special symbols (`!@#$%^&*()_+-=`). Role names identical to the administrator account are prohibited.

## 3. Permission Management
Under the IoTDB Table Model, permissions are divided into two major categories: global privileges and data privileges.

### 3.1 Global Privileges
Global privileges include three types: `SYSTEM`, `SECURITY`, and `AUDIT`:
- **SYSTEM**: Covers privileges for O&M operations and Data Definition Language (DDL) tasks.
- **SECURITY**: Covers management of users and roles, as well as privilege assignment for other accounts.
- **AUDIT**: Covers audit rule maintenance and audit log viewing.

Detailed descriptions of each global privilege are shown in the table below:

<table style="text-align: left;">
  <tbody>
     <tr>
            <th>Privilege Category</th>
            <th>Original Name</th>
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
            <td>Allows users to create, start, stop, drop and view PIPE tasks; create, drop and view PIPEPLUGINS.</td>
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
      <tr>
            <td>AUDIT</td>
            <td>N/A</td>
            <td>Allows users to maintain audit log rules and view audit logs.</td>
      </tr>
  </tbody>
</table>

### 3.2 Data Privileges
Data privileges consist of privilege types and effective scopes.

- **Privilege Types**: `CREATE`, `DROP`, `ALTER`, `SELECT`, `INSERT`, `DELETE`.
- **Scopes**: `ANY` (system-wide), `DATABASE` (database-level), `TABLE` (single table).
  - Privileges with the `ANY` scope apply to all databases and tables.
  - Database-level privileges apply to the specified database and all tables under it.
  - Table-level privileges only take effect on the target single table.
- **Scope Matching Logic**: When performing single-table operations, the system verifies permissions by scope priority. For example, when writing data to `DATABASE1.TABLE1`, the system checks write permissions in sequence for `ANY`, `DATABASE1` and `DATABASE1.TABLE1` until a matching privilege is found or the check fails.

The logical relationship between privilege types, scopes and capabilities is shown below:

<table style="text-align: left;">
  <tbody>
     <tr>
            <th>Privilege Type</th>
            <th>Permission Scope (Level)</th>        
            <th>Capability Description</th>
      </tr>
      <tr>
            <td rowspan="3">CREATE</td>   
            <td>ANY</td> 
            <td>Allows creating any databases and tables.</td> 
      </tr>
      <tr>
            <td>Database</td>   
            <td>Allows creating the specified database and creating tables under this database.</td> 
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
            <td>Allows modifying database definitions and the structure of all tables under the database.</td> 
      </tr>
      <tr>
            <td>Table</td>   
            <td>Allows modifying the table structure and definition.</td> 
      </tr>
      <tr>
            <td rowspan="3">SELECT</td>   
            <td>ANY</td> 
            <td>Allows querying data from any table across all databases.</td> 
      </tr>
      <tr>
            <td>Database</td>   
            <td>Allows querying data from all tables in the specified database.</td> 
      </tr>
      <tr>
            <td>Table</td>   
            <td>Allows querying data in the specified table. For multi-table queries, only accessible data with valid permissions will be displayed.</td> 
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
            <td>Allows deleting data within the specified database.</td> 
      </tr>
      <tr>
            <td>Table</td>   
            <td>Allows deleting data in the specified table.</td> 
      </tr>
  </tbody>
</table>

### 3.3 Privilege Granting and Revocation
IoTDB supports privilege assignment and revocation through three methods:
- Direct granting or revocation by the super administrator.
- Granting or revocation by users with the `GRANT OPTION` privilege.
- Granting or revocation via role configuration, operated by the super administrator or users with `SECURITY` privileges.

The following rules apply to permission management in the IoTDB Table Model:
- No scope needs to be specified when granting or revoking global privileges.
- Data privilege operations require explicit privilege types and scopes. Revocation only takes effect on the designated scope and is not affected by hierarchical inclusion relationships.
- Pre-authorization is supported for databases and tables that have not been created yet.
- Repeated granting or revocation of privileges is permitted.
- **WITH GRANT OPTION**: Authorizes users to manage permissions within their granted scope, including granting and revoking privileges for other users.

## 4. Syntax and Usage Examples
### 4.1 User and Role Management
1. **Create User** (Requires `SECURITY` privilege)
```SQL
CREATE USER <USERNAME> <PASSWORD>   
-- Example
CREATE USER user1 'Passwd@202604'
```

2. **Modify Password**
   Users can change their own passwords; modifying other users' passwords requires the `SECURITY` privilege.
```SQL
ALTER USER <USERNAME> SET PASSWORD <password>
-- Example
ALTER USER tempuser SET PASSWORD 'Newpwd@202604'
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

10. **List Users Under a Specified Role** (Requires `SECURITY` privilege)
```SQL
LIST USER OF ROLE <ROLENAME>
-- Example
LIST USER OF ROLE roleuser
```

11. **List Roles of a Specified User**
    Users can view their own roles; viewing roles of other users requires the `SECURITY` privilege.
```SQL
LIST ROLE OF USER <USERNAME>
-- Example
LIST ROLE OF USER tempuser
```

12. **List All Privileges of a User**
    Users can view their own privileges; viewing privileges of other users requires the `SECURITY` privilege.
```SQL
LIST PRIVILEGES OF USER <USERNAME>
-- Example
LIST PRIVILEGES OF USER tempuser
```

13. **List All Privileges of a Role**
    Users can view privileges of their bound roles; viewing privileges of other roles requires the `SECURITY` privilege.
```SQL
LIST PRIVILEGES OF ROLE <ROLENAME>
-- Example
LIST PRIVILEGES OF ROLE actor
```

### 4.2 Granting and Revoking Privileges
#### 4.2.1 Grant Privileges
1. Grant user management privileges to a user
```SQL
GRANT SECURITY TO USER <USERNAME>
-- Example
GRANT SECURITY TO USER TEST_USER
```

2. Grant database and table creation privileges with independent permission management rights
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

5. Grant global cross-database query privileges to a role
```SQL
GRANT SELECT ON ANY TO ROLE <ROLENAME>
-- Example
GRANT SELECT ON ANY TO ROLE TEST_ROLE
```

6. **ALL Syntax Sugar**: `ALL` represents all available privileges within the target scope
```SQL
-- Grant all global privileges and full data privileges under the ANY scope
GRANT ALL TO USER TESTUSER

-- Grant all data privileges covering the entire system scope
GRANT ALL ON ANY TO USER TESTUSER

-- Grant all data privileges for the specified database
GRANT ALL ON DATABASE TESTDB TO USER TESTUSER

-- Grant all data privileges for the specified single table
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

4. Revoke global cross-database query privileges
```SQL
REVOKE SELECT ON ANY FROM USER <USERNAME>
-- Example
REVOKE SELECT ON ANY FROM USER TEST_USER
```

5. **ALL Syntax Sugar** for privilege revocation
```SQL
-- Revoke all global privileges and ANY-scoped data privileges
REVOKE ALL FROM USER TESTUSER

-- Only revoke data privileges under the ANY scope
REVOKE ALL ON ANY FROM USER TESTUSER

-- Only revoke all data privileges of the specified database
REVOKE ALL ON DATABASE TESTDB FROM USER TESTUSER

-- Only revoke all data privileges of the specified table
REVOKE ALL ON TABLE TESTDB FROM USER TESTUSER
```

### 4.3 View User Privileges
Each user has an independent privilege list that records all authorized permissions.
Use `LIST PRIVILEGES OF USER <USERNAME>` to query detailed privileges of a user or role. The output format is as follows:

| ROLE  | SCOPE   | PRIVILEGE | WITH GRANT OPTION |
|-------|---------|-----------|------------------|
|       | DB1.TB1 | SELECT    | FALSE            |
|       |         | SECURITY  | TRUE             |
| ROLE1 | DB2.TB2 | UPDATE    | TRUE             |
| ROLE1 | DB3.*   | DELETE    | FALSE            |
| ROLE1 | *.*     | UPDATE    | TRUE             |

- **ROLE**: Blank for self-owned user privileges; displays the role name if the permission is inherited from a role.
- **SCOPE**: Table-level scope displayed as `DB.TABLE`, database-level as `DB.*`, and global ANY scope as `*.*`.
- **PRIVILEGE**: Lists specific authorized permission types.
- **WITH GRANT OPTION**: `TRUE` means the user can grant or revoke permissions within the corresponding scope.
- Users and roles can hold permissions for both the Tree Model and Table Model simultaneously. The system only displays permissions applicable to the currently connected model, while permissions for the other model will be hidden.

## 5. Practical Scenario Example
Based on the [Sample Data](../Reference/Sample-Data.md), data in different tables belongs to two independent data centers (bj and sh). To prevent unauthorized cross-center data access, permission isolation needs to be configured at the data center level.

### 5.1 Create Users
Use `CREATE USER` to create new users. For example, the root administrator creates two dedicated write users for the BJ and SH data centers: `bj_write_user` and `sh_write_user`, with a unified password `write_Pwd@2026`.

```SQL
CREATE USER bj_write_user 'write_Pwd@2026';
CREATE USER sh_write_user 'write_Pwd@2026';
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

Error prompt:
```
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: database is not specified
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 803: Access Denied: DATABASE database1
```

Grant table write privileges to `bj_write_user` via the root account:
```SQL
GRANT INSERT ON database1.table1 TO USER bj_write_user
```

Retry data insertion after switching to the target database:
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

After revocation, `bj_write_user` no longer has write access to table1:
```
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 803: Access Denied: No permissions for this operation, please add privilege INSERT ON database1.table1
```
 