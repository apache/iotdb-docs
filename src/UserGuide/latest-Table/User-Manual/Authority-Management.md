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

IoTDB provides permission management functionality to implement fine-grained access control for data and cluster systems, ensuring data and system security. This document introduces the basic concepts, user definitions, permission management, authentication logic, and functional use cases of the permission module in IoTDB's table model.

## 1. Basic Concepts

### 1.1 User

A **user** is a legitimate database user. Each user is associated with a unique username and authenticated via a password. Before accessing the database, a user must provide valid credentials (a username and password that exist in the database).

### 1.2 Permission

A database supports multiple operations, but not all users can perform every operation. If a user is authorized to execute a specific operation, they are said to have the **permission** for that operation.

### 1.3 Role

A **role** is a collection of permissions, identified by a unique role name. Roles typically correspond to real-world identities (e.g., "traffic dispatcher"), where a single identity may encompass multiple users. Users sharing the same real-world identity often require the same set of permissions, and roles abstract this grouping for unified management.

### 1.4 Default User and Role

Upon initialization, IoTDB includes a default user:

* ​**Username**​: `root`
* ​**Default password**​: `root`

The `root` user is the ​**administrator**​, inherently possessing all permissions. This user cannot be granted or revoked permissions and cannot be deleted. The database maintains only one administrator user. Newly created users or roles start with **no permissions** by default.

## 2. Permission List

In IoTDB's table model, there are two main types of permissions: Global Permissions and Data Permissions .

### 2.1 Global Permissions

Global permissions include user management and role management.

The following table describes the types of global permissions:

| Permission Name | Description                                                                                                                      |
| ----------------- |----------------------------------------------------------------------------------------------------------------------------------|
| MANAGE\_USER    | - Create users <br>- Delete users <br>- Modify user passwords <br>- View user permission details <br>- List all users            |
| MANAGE\_ROLE    | - Create roles <br>- Delete roles <br>- View role permission details <br>- Grant/revoke roles to/from users <br>- List all roles |

### 2.2 Data Permissions

Data permissions consist of permission types and permission scopes.

* Permission Types:
  * CREATE: Permission to create resources
  * DROP: Permission to delete resources
  * ALTER: Permission to modify definitions
  * SELECT: Permission to query data
  * INSERT: Permission to insert/update data
  * DELETE: Permission to delete data
* Permission Scopes:
  * ANY: System-wide (affects all databases and tables)
  * DATABASE: Database-wide (affects the specified database and its tables)
  * TABLE: Table-specific (affects only the specified table)
* Scope Enforcement Logic:

When performing table-level operations, the system matches user permissions with data permission scopes hierarchically.  Example: If a user attempts to write data to `DATABASE1.TABLE1`, the system checks for write permissions in this order:  1. `ANY` scope → 2. `DATABASE1` scope → 3. `DATABASE1.TABLE1` scope. The check stops at the first successful match or fails if no permissions are found.

* Permission Type-Scope-Effect Matrix

<table style="text-align: left;">
  <tbody>
     <tr>   <th>Permission Type</th>
            <th>Scope(Hierarchy)</th>        
            <th>Effect</th>
      </tr>
      <tr>
            <td rowspan="3">CREATE</td>   
            <td>ANY</td> 
            <td>Create any table/database</td> 
      </tr>
      <tr>
            <td>DATABASE</td>   
            <td>Create tables in the specified database; create a database with the specified name</td> 
      </tr>
      <tr>
            <td>TABLE</td>   
            <td>Create a table with the specified name </td> 
      </tr>
      <tr>
            <td rowspan="3">DROP</td>   
            <td>ANY</td> 
            <td>Delete any table/database</td> 
      </tr>
      <tr>
            <td>DATABASE</td>   
            <td>Delete the specified database or its tables</td> 
      </tr>
      <tr>
            <td>TABLE</td>   
            <td>Delete the specified table</td> 
      </tr>
      <tr>
            <td rowspan="3">ALTER</td>   
            <td>ANY</td> 
            <td>Modify definitions of any table/database</td> 
      </tr>
      <tr>
            <td>DATABASE</td>   
            <td>Modify definitions of the specified database or its tables </td> 
      </tr>
      <tr>
            <td>TABLE</td>   
            <td>Modify the definition of the specified table</td> 
      </tr>
      <tr>
            <td rowspan="3">SELECT</td>   
            <td>ANY</td> 
            <td>Query data from any table in any database</td> 
      </tr>
      <tr>
            <td>DATABASE</td>   
            <td>Query data from any table in the specified database</td> 
      </tr>
      <tr>
            <td>TABLE</td>   
            <td>Query data from the specified table</td> 
      </tr>
      <tr>
            <td rowspan="3">INSERT</td>   
            <td>ANY</td> 
            <td>Insert/update data in any table</td> 
      </tr>
      <tr>
            <td>DATABASE</td>   
            <td>Insert/update data in any table within the specified database</td> 
      </tr>
      <tr>
            <td>TABLE</td>   
            <td>Insert/update data in the specified table</td> 
      </tr>
      <tr>
            <td rowspan="3">DELETE</td>   
            <td>ANY</td> 
            <td>Delete data from any table</td> 
      </tr>
      <tr>
            <td>DATABASE</td>   
            <td>Delete data from tables within the specified database</td> 
      </tr>
      <tr>
            <td>TABLE</td>   
            <td>Delete data from the specified table</td> 
      </tr>
</tbody>
</table>

## 3. User and Role Management

1. Create User (Requires `MANAGE_USER` Permission)

```SQL
CREATE USER <USERNAME> <PASSWORD>   
eg: CREATE USER user1 'passwd'
```

Constraints:

* Username: 4-32 characters (letters, numbers, special chars: `!@#$%^&*()_+-=`). Cannot duplicate the admin (`root`) username.
* Password: 4-32 characters (letters, numbers, special chars). Stored as MD5 hash by default.

2.  Update Password

Users can update their own passwords. Updating others' passwords requires `MANAGE_USER`.

```SQL
ALTER USER <USERNAME> SET PASSWORD <password>
eg: ALTER USER tempuser SET PASSWORD 'newpwd'
```

3. Delete User (Requires `MANAGE_USER`)

```SQL
DROP USER <USERNAME>
eg: DROP USER user1
```

4. Create Role (Requires `MANAGE_ROLE`)

```SQL
CREATE ROLE <ROLENAME>
eg: CREATE ROLE role1
```

Constraints:

* Role Name: 4-32 characters (letters, numbers, special chars). Cannot duplicate the admin role name.

5. Delete Role (Requires `MANAGE_ROLE`)

```SQL
DROP ROLE <ROLENAME>
eg: DROP ROLE role1
```

6. Assign Role to User (Requires `MANAGE_ROLE`)

```SQL
GRANT ROLE <ROLENAME> TO <USERNAME>
eg: GRANT ROLE admin TO user1
```

7. Revoke Role from User (Requires `MANAGE_ROLE`)

```SQL
REVOKE ROLE <ROLENAME> FROM <USERNAME>
eg: REVOKE ROLE admin FROM user1
```

8. List All Users (Requires `MANAGE_USER`)

```SQL
LIST USER
```

9. List All Roles (Requires `MANAGE_ROLE`)

```SQL
LIST ROLE
```

10. List Users in a Role (Requires `MANAGE_USER`)

```SQL
LIST USER OF ROLE <ROLENAME>
eg: LIST USER OF ROLE roleuser
```

11. List Roles of a User

* Users can list their own permissions.
* Listing others' permissions requires `MANAGE_USER`.

```SQL
LIST ROLE OF USER <USERNAME>
eg: LIST ROLE OF USER tempuser
```

12. List User Permissions

* Users can list their own permissions.
* Listing others' permissions requires `MANAGE_USER`.

```SQL
LIST PRIVILEGES OF USER <USERNAME>
eg: LIST PRIVILEGES OF USER tempuser
```

13. List Role Permissions

* Users can list permissions of roles they have.
* Listing other roles' permissions requires `MANAGE_ROLE`.

```SQL
LIST PRIVILEGES OF ROLE <ROLENAME>
eg: LIST PRIVILEGES OF ROLE actor
```

## 4. Permission Management

IoTDB supports granting and revoking permissions through the following three methods:

* Direct assignment/revocation by a super administrator
* Assignment/revocation by users with the `GRANT OPTION` privilege
* Assignment/revocation via roles (managed by super administrators or users with `MANAGE_ROLE` permissions)

In the IoTDB Table Model, the following principles apply when granting or revoking permissions:

* **Global permissions** can be granted/revoked without specifying a scope.
* **Data permissions** require specifying both the permission type and permission scope. When revoking, only the explicitly defined scope is affected, regardless of hierarchical inclusion relationships.
* Preemptive permission planning is allowed—permissions can be granted for databases or tables that do not yet exist.
* Repeated granting/revoking of permissions is permitted.
* `WITH GRANT OPTION`: Allows users to manage permissions within the granted scope. Users with this option can grant or revoke permissions for other users in the same scope.

### 4.1 Granting Permissions

1. Grant a user the permission to manage users

```SQL
GRANT MANAGE_USER TO USER <USERNAME>
eg: GRANT MANAGE_USER TO USER TEST_USER
```

2. Grant a user the permission to create databases and tables within the database, and allow them to manage permissions in that scope

```SQL
GRANT CREATE ON DATABASE <DATABASE> TO USER <USERNAME> WITH GRANT OPTION
eg: GRANT CREATE ON DATABASE TESTDB TO USER TEST_USER WITH GRANT OPTION
```

3. Grant a role the permission to query a database

```SQL
GRANT SELECT ON DATABASE <DATABASE>TO ROLE <ROLENAME>
eg: GRANT SELECT ON DATABASE TESTDB TO ROLE TEST_ROLE
```

4. Grant a user the permission to query a table

```SQL
GRANT SELECT ON <DATABASE>.<TABLENAME> TO USER <USERNAME>
eg: GRANT SELECT ON TESTDB.TESTTABLE TO USER TEST_USER
```

5. Grant a role the permission to query all databases and tables

```SQL
GRANT SELECT ON ANY TO ROLE <ROLENAME>
eg: GRANT SELECT ON ANY TO ROLE TEST_ROLE
```

6. ALL Syntax Sugar: ALL represents all permissions within a given scope, allowing flexible permission granting.

```sql
GRANT ALL TO USER TESTUSER
-- Grants all possible permissions to the user, including global permissions and all data permissions under ANY scope.

GRANT ALL ON ANY TO USER TESTUSER
-- Grants all data permissions under the ANY scope. After execution, the user will have all data permissions across all databases.

GRANT ALL ON DATABASE TESTDB TO USER TESTUSER
-- Grants all data permissions within the specified database. After execution, the user will have all data permissions on that database.

GRANT ALL ON TABLE TESTTABLE TO USER TESTUSER
-- Grants all data permissions on the specified table. After execution, the user will have all data permissions on that table.
```

### 4.2 Revoking Permissions

1. Revoke a user's permission to manage users

```SQL
REVOKE MANAGE_USER FROM USER <USERNAME>
eg: REVOKE MANAGE_USER FROM USER TEST_USER
```

2. Revoke a user's permission to create databases and tables within the database

```SQL
REVOKE CREATE ON DATABASE <DATABASE> FROM USER <USERNAME>
eg: REVOKE CREATE ON DATABASE TEST_DB FROM USER TEST_USER
```

3. Revoke a user's permission to query a table

```SQL
REVOKE SELECT ON <DATABASE>.<TABLENAME> FROM USER <USERNAME>
eg: REVOKE SELECT ON TESTDB.TESTTABLEFROM USER TEST_USER
```

4. Revoke a user's permission to query all databases and tables

```SQL
REVOKE SELECT ON ANY FROM USER <USERNAME>
eg: REVOKE SELECT ON ANY FROM USER TEST_USER
```

5. ALL Syntax Sugar: ALL represents all permissions within a given scope, allowing flexible permission revocation.

```sql
REVOKE ALL FROM USER TESTUSER
-- Revokes all global permissions and all data permissions under ANY scope.

REVOKE ALL ON ANY FROM USER TESTUSER
-- Revokes all data permissions under the ANY scope, without affecting DB or TABLE-level permissions.

REVOKE ALL ON DATABASE TESTDB FROM USER TESTUSER
-- Revokes all data permissions on the specified database, without affecting TABLE-level permissions.

REVOKE ALL ON TABLE TESTDB FROM USER TESTUSER
-- Revokes all data permissions on the specified table.
```

### 4.3 Viewing User Permissions

Each user has an access control list that identifies all the permissions they have been granted. You can use the `LIST PRIVILEGES OF USER <USERNAME>` statement to view the permission information of a specific user or role. The output format is as follows:

| ROLE         | SCOPE   | PRIVIVLEGE   | WITH GRANT OPTION |
|--------------|---------| -------------- |-------------------|
|              | DB1.TB1 | SELECT       | FALSE             |
|              |         | MANAGE\_ROLE | TRUE              |
| ROLE1        | DB2.TB2 | UPDATE       | TRUE              |
| ROLE1        | DB3.\*  | DELETE       | FALSE             |
| ROLE1        | \*.\*   | UPDATE       | TRUE              |

* ​**ROLE column**​: If empty, it indicates the user's own permissions. If not empty, it means the permission is derived from a granted role.
* ​**SCOPE column**​: Represents the permission scope of the user/role. Table-level permissions are denoted as `DB.TABLE`, database-level permissions as `DB.*`, and ANY-level permissions as `*.*`.
* ​**PRIVILEGE column**​: Lists the specific permission types.
* ​**WITH GRANT OPTION column**​: If `TRUE`, it means the user can grant their own permissions to others.
* A user or role can have permissions in both the tree model and the table model, but the system will only display the permissions relevant to the currently connected model. Permissions under the other model will not be shown.

## 5. Example

Using the content from the [Sample Data](../Reference/Sample-Data.md)  as an example, the data in the two tables may belong to the **bj** and **sh** data centers, respectively. To prevent each center from accessing the other's database data, we need to implement permission isolation at the data center level.

### 5.1 Creating Users

Use `CREATE USER <USERNAME> <PASSWORD>` to create users. For example, the **root** user with all permissions can create two user roles for the **ln** and **sgcc** groups, named **bj\_write\_user** and ​**sh\_write\_user**​, both with the password ​**write\_pwd**​. The SQL statements are:

```SQL
CREATE USER bj_write_user 'write_pwd'
CREATE USER sh_write_user 'write_pwd'
```

To display the users, use the following SQL statement:

```Plain
LIST USER
```

The result will show the two newly created users, as follows:

```sql
+-------------+
|         User|
+-------------+
|bj_write_user|
|         root|
|sh_write_user|
+-------------+
```

### 5.2 Granting User Permissions

Although the two users have been created, they do not yet have any permissions and thus cannot perform database operations. For example, if the **bj\_write\_user** attempts to write data to ​**table1**​, the SQL statement would be:

```sql
IoTDB> INSERT INTO table1(region, plant_id, device_id, model_id, maintenance, time, temperature, humidity, status, arrival_time) VALUES   ('北京', '1001', '100', 'A', '180', '2025-03-26 13:37:00', 190.0, 30.1, false, '2025-03-26 13:37:34')
```

The system will deny the operation and display an error:

```sql
IoTDB> INSERT INTO table1(region, plant_id, device_id, model_id, maintenance, time, temperature, humidity, status, arrival_time) VALUES   ('北京', '1001', '100', 'A', '180', '2025-03-26 13:37:00', 190.0, 30.1, false, '2025-03-26 13:37:34') 
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 701: database is not specified
IoTDB> use database1
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 803: Access Denied: DATABASE database1
```

The **root** user can grant **bj\_write\_user** write permissions for **table1** using the `GRANT <PRIVILEGES> ON <DATABASE.TABLE> TO USER <USERNAME>` statement, for example:

```sql
GRANT INSERT ON database1.table1 TO USER bj_write_user
```

After granting permissions, **bj\_write\_user** can successfully write data:

```SQL
IoTDB> use database1
Msg: The statement is executed successfully.
IoTDB:database1> INSERT INTO table1(region, plant_id, device_id, model_id, maintenance, time, temperature, humidity, status, arrival_time) VALUES   ('北京', '1001', '100', 'A', '180', '2025-03-26 13:37:00', 190.0, 30.1, false, '2025-03-26 13:37:34')
Msg: The statement is executed successfully.
```

### 5.3 Revoking User Permissions

After granting permissions, the **root** user can revoke them using the `REVOKE <PRIVILEGES> ON <DATABASE.TABLE> FROM USER <USERNAME>` statement. For example:

```sql
REVOKE INSERT ON database1.table1 FROM USER bj_write_user
REVOKE INSERT ON database1.table2 FROM USER sh_write_user
```

Once permissions are revoked, **bj\_write\_user** will no longer have write access to ​**table1**​:

```sql
IoTDB:database1> INSERT INTO table1(region, plant_id, device_id, model_id, maintenance, time, temperature, humidity, status, arrival_time) VALUES   ('北京', '1001', '100', 'A', '180', '2025-03-26 13:37:00', 190.0, 30.1, false, '2025-03-26 13:37:34')
Msg: org.apache.iotdb.jdbc.IoTDBSQLException: 803: Access Denied: No permissions for this operation, please add privilege INSERT ON database1.table1
```
