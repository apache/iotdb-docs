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

# Authority  Management

This document is the SQL manual for authority management starting from version V2.0.7. For detailed function usage, see [Authority Management](../User-Manual/Authority-Management-Upgrade_timecho.md). For an introduction to authority management functions before version V2.0.7, refer to [Authority Management](../User-Manual/Authority-Management_timecho.md)

## 1. Privilege List

<table>
  <tbody>
    <tr>
      <th>Privilege Type</th>
      <th>Privilege Name</th>
      <th>Scope of Effect</th>
      <th>Description</th>
    </tr>
    <!-- Global Privileges - SYSTEM -->
    <tr>
      <td rowspan="17">Global Privileges</td>
      <td rowspan="6">SYSTEM</td>
      <td rowspan="6">Global</td>
      <td>Allows users to create, modify, and delete databases.</td>
    </tr>
    <tr>
      <td>Allows users to create, modify, and delete tables and table views.</td>
    </tr>
    <tr>
      <td>Allows users to create, delete, and view user-defined functions.</td>
    </tr>
    <tr>
      <td>Allows users to create, start, stop, delete, and view PIPEs. Allows users to create, delete, and view PIPEPLUGINS.</td>
    </tr>
    <tr>
      <td>Allows users to query and cancel queries. Allows users to view variables. Allows users to view cluster status.</td>
    </tr>
    <tr>
      <td>Allows users to create, delete, and view deep learning models.</td>
    </tr>
    <!-- Global Privileges - SECURITY -->
    <tr>
      <td rowspan="10">SECURITY</td>
      <td rowspan="10">Global</td>
      <td>Allows users to create users.</td>
    </tr>
    <tr>
      <td>Allows users to delete users.</td>
    </tr>
    <tr>
      <td>Allows users to modify user passwords.</td>
    </tr>
    <tr>
      <td>Allows users to view user privilege information.</td>
    </tr>
    <tr>
      <td>Allows users to list all users.</td>
    </tr>
    <tr>
      <td>Allows users to create roles.</td>
    </tr>
    <tr>
      <td>Allows users to delete roles.</td>
    </tr>
    <tr>
      <td>Allows users to view role privilege information.</td>
    </tr>
    <tr>
      <td>Allows users to grant a role to a user or revoke it.</td>
    </tr>
    <tr>
      <td>Allows users to list all roles.</td>
    </tr>
    <!-- Global Privileges - AUDIT (New) -->
    <tr>
      <td>AUDIT</td>
      <td>Global</td>
      <td>Allows users to maintain audit log rules and view audit logs.</td>
    </tr>
    <!-- Data Privileges - CREATE -->
    <tr>
      <td rowspan="15">Data Privileges</td>
      <td rowspan="3">CREATE</td>
      <td>ANY</td>
      <td>Allows creating any table and any database.</td>
    </tr>
    <tr>
      <td>Database</td>
      <td>Allows users to create tables under this database; allows users to create a database with this name.</td>
    </tr>
    <tr>
      <td>Table</td>
      <td>Allows users to create a table with this name.</td>
    </tr>
    <!-- Data Privileges - ALTER -->
    <tr>
      <td rowspan="3">ALTER</td>
      <td>ANY</td>
      <td>Allows modifying the definition of any table and any database.</td>
    </tr>
    <tr>
      <td>Database</td>
      <td>Allows users to modify the definition of a database and the definitions of tables under that database.</td>
    </tr>
    <tr>
      <td>Table</td>
      <td>Allows users to modify the definition of a table.</td>
    </tr>
    <!-- Data Privileges - SELECT -->
    <tr>
      <td rowspan="3">SELECT</td>
      <td>ANY</td>
      <td>Allows querying data from any table in any database in the system.</td>
    </tr>
    <tr>
      <td>Database</td>
      <td>Allows users to query data from any table in this database.</td>
    </tr>
    <tr>
      <td>Table</td>
      <td>Allows users to query data in this table. When executing multi-table queries, the database only displays data that the user has permission to access.</td>
    </tr>
    <!-- Data Privileges - INSERT -->
    <tr>
      <td rowspan="3">INSERT</td>
      <td>ANY</td>
      <td>Allows inserting/updating data into any table in any database.</td>
    </tr>
    <tr>
      <td>Database</td>
      <td>Allows users to insert/update data into any table within the scope of this database.</td>
    </tr>
    <tr>
      <td>Table</td>
      <td>Allows users to insert/update data into this table.</td>
    </tr>
    <!-- Data Privileges - DELETE -->
    <tr>
      <td rowspan="3">DELETE</td>
      <td>ANY</td>
      <td>Allows deleting data from any table.</td>
    </tr>
    <tr>
      <td>Database</td>
      <td>Allows users to delete data within the scope of this database.</td>
    </tr>
    <tr>
      <td>Table</td>
      <td>Allows users to delete data from this table.</td>
    </tr>
  </tbody>
</table>

## 2. SQL Statements

### 2.1 User and Role Management

1. Create User (Requires SECURITY privilege)

```SQL
CREATE USER <USERNAME> <PASSWORD>   
eg: CREATE USER user1 'Passwd@202604';
```

2. Change Password

Users can change their own passwords, but changing other users' passwords requires the SECURITY privilege.

```SQL
ALTER USER <USERNAME> SET PASSWORD <password>
eg: ALTER USER tempuser SET PASSWORD 'Newpwd@202604';
```

3. Drop User (Requires SECURITY privilege)

```SQL
DROP USER <USERNAME>
eg: DROP USER user1;
```

4. Create Role (Requires SECURITY privilege)

```SQL
CREATE ROLE <ROLENAME>
eg: CREATE ROLE role1;
```

5. Drop Role (Requires SECURITY privilege)

```SQL
DROP ROLE <ROLENAME>
eg: DROP ROLE role1;
```

6. Grant Role to User (Requires SECURITY privilege)

```SQL
GRANT ROLE <ROLENAME> TO <USERNAME>
eg: GRANT ROLE admin TO user1;
```

7. Revoke Role from User (Requires SECURITY privilege)

```SQL
REVOKE ROLE <ROLENAME> FROM <USERNAME>
eg: REVOKE ROLE admin FROM user1;
```

8. List All Users (Requires SECURITY privilege)

```SQL
LIST USER;
```

9. List All Roles (Requires SECURITY privilege)

```SQL
LIST ROLE;
```

10. List All Users Under a Specified Role (Requires SECURITY privilege)

```SQL
LIST USER OF ROLE <ROLENAME>
eg: LIST USER OF ROLE roleuser;
```

11. List All Roles of a Specified User

Users can list their own roles, but listing other users' roles requires the SECURITY privilege.

```SQL
LIST ROLE OF USER <USERNAME>
eg: LIST ROLE OF USER tempuser;
```

12. List All Privileges of a User

Users can list their own privilege information, but listing other users' privileges requires the SECURITY privilege.

```SQL
LIST PRIVILEGES OF USER <USERNAME>
eg: LIST PRIVILEGES OF USER tempuser;
```

13. List All Privileges of a Role

Users can list the privilege information of roles they possess, but listing other roles' privileges requires the SECURITY privilege.

```SQL
LIST PRIVILEGES OF ROLE <ROLENAME>
eg: LIST PRIVILEGES OF ROLE actor;
```

### 2.2 Privilege Management

#### 2.2.1 Grant Privileges

1. Grant user management privileges to a user

```SQL
GRANT SECURITY TO USER <USERNAME>
eg: GRANT SECURITY TO USER TEST_USER;
```

2. Grant a user the privilege to create databases and create tables within the database scope, and allow the user to manage privileges within that scope

```SQL
GRANT CREATE ON DATABASE <DATABASE> TO USER <USERNAME> WITH GRANT OPTION
eg: GRANT CREATE ON DATABASE TESTDB TO USER TEST_USER WITH GRANT OPTION;
```

3. Grant a role the privilege to query a database

```SQL
GRANT SELECT ON DATABASE <DATABASE> TO ROLE <ROLENAME>
eg: GRANT SELECT ON DATABASE TESTDB TO ROLE TEST_ROLE;
```

4. Grant a user the privilege to query a table

```SQL
GRANT SELECT ON <DATABASE>.<TABLENAME> TO USER <USERNAME>
eg: GRANT SELECT ON TESTDB.TESTTABLE TO USER TEST_USER;
```

5. Grant a role the privilege to query all databases and tables

```SQL
GRANT SELECT ON ANY TO ROLE <ROLENAME>
eg: GRANT SELECT ON ANY TO ROLE TEST_ROLE;
```

6. ALL Syntax Sugar: ALL represents all privileges within the object scope. You can use the ALL field to flexibly grant privileges.

```SQL
GRANT ALL TO USER TESTUSER;
-- Grants all privileges available to the user, including global privileges and all data privileges in the ANY scope

GRANT ALL ON ANY TO USER TESTUSER;
-- Grants all data privileges available in the ANY scope to the user. After executing this statement, the user will have all data privileges on all databases

GRANT ALL ON DATABASE TESTDB TO USER TESTUSER;
-- Grants all data privileges available in the DB scope to the user. After executing this statement, the user will have all data privileges on this database

GRANT ALL ON TABLE TESTTABLE TO USER TESTUSER;
-- Grants all data privileges available in the TABLE scope to the user. After executing this statement, the user will have all data privileges on this table
```

#### 2.2.2 Revoke Privileges

1. Revoke user management privileges from a user

```SQL
REVOKE SECURITY FROM USER <USERNAME>
eg: REVOKE SECURITY FROM USER TEST_USER;
```

2. Revoke a user's privilege to create databases and create tables within the database scope

```SQL
REVOKE CREATE ON DATABASE <DATABASE> FROM USER <USERNAME>
eg: REVOKE CREATE ON DATABASE TEST_DB FROM USER TEST_USER;
```

3. Revoke a user's privilege to query a table

```SQL
REVOKE SELECT ON <DATABASE>.<TABLENAME> FROM USER <USERNAME>
eg: REVOKE SELECT ON TESTDB.TESTTABLE FROM USER TEST_USER;
```

4. Revoke a user's privilege to query all databases and tables

```SQL
REVOKE SELECT ON ANY FROM USER <USERNAME>
eg: REVOKE SELECT ON ANY FROM USER TEST_USER;
```

5. ALL Syntax Sugar: ALL represents all privileges within the object scope. You can use the ALL field to flexibly revoke privileges.

```SQL
REVOKE ALL FROM USER TESTUSER;
-- Revokes all global privileges and all data privileges in the ANY scope from the user

REVOKE ALL ON ANY FROM USER TESTUSER;
-- Revokes all data privileges in the ANY scope from the user, and does not affect DB-scope and TABLE-scope privileges

REVOKE ALL ON DATABASE TESTDB FROM USER TESTUSER;
-- Revokes all data privileges on the DB from the user, and does not affect TABLE privileges

REVOKE ALL ON TABLE TESTDB FROM USER TESTUSER;
-- Revokes all data privileges on the TABLE from the user
```

#### 2.2.3 View User Privileges

```SQL
LIST PRIVILEGES OF USER <USERNAME>
eg: LIST PRIVILEGES OF USER tempuser
```