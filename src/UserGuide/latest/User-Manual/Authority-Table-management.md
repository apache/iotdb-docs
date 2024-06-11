# Table Model Permissions

## Relationship Between Table Model and Tree Model Permissions

There is no difference in categories between the table model and the tree model, but the semantics of different permissions vary across systems. They adopt nearly identical storage and authorization strategies, but the two are isolated from each other.

### Why Not Maintain a Single Permission System Across Both Models
The users of the table model and tree model are generally different; a single permission command affecting both models would increase the management and learning costs for users.
There is functional conflict between the table model and the tree model; the permissions of the tree model cannot be directly applied to the table without modification.

In the table model, we retain most of the permission concepts from the tree model.

## Permission Categories of the Tree Model

### Sequence Permissions

| Permission Name | Description |
|-----------------|----------------------------------------------------|
| READ_DATA       | Allows reading sequence data under the authorized path. |
| WRITE_DATA      | Allows insertion, deletion of sequence data under the authorized path. Allows importing, loading data under the authorized path. When importing data, write data permission on the corresponding path is required, and Manage_Database and write_schema permissions are needed when automatically creating sequences or databases. |
| READ_SCHEMA     | Allows accessing detailed information of the metadata tree under the authorized path: including databases, sub-paths, child nodes, devices, sequences, templates, views, etc. |
| WRITE_SCHEMA    | Allows creating, deleting, and modifying operations on sequences, templates, views, etc., under the authorized path. When creating or modifying a view, WRITE_SCHEMA permission on the view path and READ_SCHEMA permission on the data source are checked. When querying or inserting into a view, READ_DATA and WRITE_DATA permissions on the view path are checked. Allows setting, cancelling, and viewing TTL under the authorized path. The creation of templates is global, but they can only be mounted or unmounted on specified paths, and only templates mounted on one's own path or unmounted templates can be viewed or deleted. |

### Global Permissions

| Permission Name  | Description |
|------------------|---------------------------------------------------------------------|
| MANAGE_DATABASE  | Allows the user to create and delete databases.                      |
| MANAGE_USER      | Allows the user to create, delete, modify, and view users.           |
| MANAGE_ROLE      | Allows the user to create, delete, modify, and view roles.           |
| USE_TRIGGER      | Allows the user to create, delete, and view triggers. Independent of the data source's permission checks for triggers. |
| USE_UDF          | Allows the user to create, delete, and view user-defined functions. Independent of the data source's permission checks for user-defined functions. |
| USE_CQ           | Allows the user to create, delete, and view continuous queries. Independent of the data source's permission checks for continuous queries. |
| USE_PIPE         | Allows the user to create, start, stop, delete, and view pipelines. Allows the user to create, delete, and view pipeline plugins. Independent of the data source's permission checks for pipelines. |
| EXTEND_TEMPLATE  | Automatically creates template permissions. Allows using the alter add syntax to modify templates. |
| MAINTAIN         | Allows the user to cancel queries. Allows the user to view variables. |

## Permission Categories of the Table Model

To lower the user threshold, we use the same type of permissions as described above to manage access control of the table model. Since global permissions are unrelated to tables and trees, we retain these permission categories and meanings.

### Global Permissions

| Permission Name  | Description |
|------------------|---------------------------------------------------------------------|
| MANAGE_DATABASE  | Allows the user to create and delete databases. Allows the user to modify database properties. |
| MANAGE_USER      | Allows the user to create, delete, modify, and view users. |
| MANAGE_ROLE      | Allows the user to create, delete, modify, and view roles. |
| USE_TRIGGER      | Allows the user to create, delete, and view triggers. Independent of the data source's permission checks for triggers. |
| USE_UDF          | Allows the user to create, delete, and view user-defined functions. Independent of the data source's permission checks for user-defined functions. |
| USE_CQ           | Allows the user to create, delete, and view continuous queries. Independent of the data source's permission checks for continuous queries. |
| USE_PIPE         | Allows the user to create, start, stop, delete, and view pipelines. Allows the user to create, delete, and view pipeline plugins. Independent of the data source's permission checks for pipelines. |
| EXTEND_TEMPLATE  | Automatically creates template permissions. Allows using the alter add syntax to modify templates. |
| MAINTAIN         | Allows the user to cancel queries. Allows the user to view variables. |

### Object Permissions

| Permission Type | Permission Object | Permission Effect |
|-----------------|-------------------|------------------------------------------|
| WRITE_DATA      | Database          | Allows the user to insert data into the database and query data within the database. |
|                 | Table             | Allows the user to insert data into the table and query data within the table. |
| WRITE_SCHEMA    | Database          | Allows the user to create tables under the database, delete tables under the database, and change the properties of tables under the database. Allows deletion of the database. |
|                 | Table             | Allows the user to modify the table, change the column names, add or delete columns. Allows deletion of the table. |
| READ_DATA       | Database          | Allows the user to query data in tables within the database. |
|                 | Table             | Allows the user to query data in the table. |
| READ_SCHEMA     | Database          | Allows the user to list tables in the database, list the metadata definitions of the database. |
|                 | Table             | Allows the user to list the definitions of the table. |

### Operations Corresponding to Permissions in the Table Model

| Scope   | Category | Operation   | Required Permission | Permission Category | Remarks |
|---------|----------|-------------|---------------------|---------------------|---------|
| Database| DDL      | Create Database | MANAGE_DATABASE   | Global Permission   | Creation is special, requiring global permission. Creation rights for all objects are attached to their upper layer permission, with the topmost layer being the Database corresponding to MANAGE_DATABASE. |
|         | DDL      | Delete Database | MANAGE_DATABASE/WRITE_SCHEMA | Global/Object Permission | Global managers/creators can delete the database. The manager of the database granted WRITE_SCHEMA can delete it. |
|         | DDL      | Modify Database Properties | MANAGE_DATABASE/WRITE_SCHEMA | Global/Object Permission | Global managers/creators can modify the properties of the database. The manager of the database can modify its properties. |
|         | DQL      | View Database  | MANAGE_DATABASE/READ_SCHEMA/WRITE_SCHEMA | Global/Object Permission | Database managers are allowed to view the database. Users with READ_SCHEMA or WRITE_SCHEMA permissions on the database can list it. |
|         | DQL      | Use Database   | No specific permission required | Users must have at least one permission on the database/table. |
| Table   | DDL      | Create Table   | WRITE_SCHEMA on the specified database | Object Permission | Users with permission on the database can create, delete tables. |
|         | DDL      | Delete Table   | WRITE_SCHEMA on the specified database or on the specified table | Object Permission | |
|         | DDL      | Add/Delete Attribute Columns, Physical Quantity Columns | WRITE_SCHEMA on the specified database or on the specified table | |
|         | DDL      | Auto Register/Extend Schema | WRITE_SCHEMA on the specified table/database and have EXTEND_TEMPLATE permission | Object + Global Permission | |
|         | DDL      | Create Index   | WRITE_SCHEMA on the database or on the specified table | Object Permission | |
|         | DDL      | Delete Index   | WRITE_SCHEMA on the database or on the specified table | Object Permission | |
|         | DDL      | Modify TTL on the Table | WRITE_SCHEMA on the database or on the specified table | Object Permission | |
|         | DQL      | List Tables    | WRITE_SCHEMA or READ_SCHEMA on the specified database, or have a certain permission on the table | Object Permission | |
|         | DQL      | View Table Structure | WRITE_SCHEMA or READ_SCHEMA on the specified database or READ_DATA, READ_SCHEMA, WRITE_DATA, WRITE_SCHEMA on the corresponding table | Object Permission | READ_DATA can also list table structure, because these data are actually obtained during querying. |
|         | DQL      | View Indexes   | READ/WRITE_SCHEMA on the database or on the specified table | Object Permission | |
|         | DQL      | View TTL       | READ/WRITE_SCHEMA on the specified table or database | Object Permission | |
|         | DML      | Data Insertion | WRITE_DATA on the specified database or on the specified table | Object Permission | |
|         | DML      | Data Update    | WRITE_DATA on the specified database or on the specified table | Object Permission | |
|         | DQL      | Data Query     | READ/WRITE_DATA on the specified database or on the specified table | Object Permission | |

### Basic Syntax of Permissions
#### Basic Authorization Syntax:

```SQL
GRANT privilege [on Object] TO role_spec [with grant option]
privilege:
       READ_DATA|WRITE_DATA|READ_SCHEMA|WRITE_SCHEMA|other system privileges | ALL
Object:
        ObjectType ObjectName 
ObjectType:
        Database | Table
role_spec:
        roletype rolename
roletype:
        role | user
```

```SQL
GRANT READ_DATA ON DATABASE DB1 TO USER USER1;  
GRANT READ_DATA ON TABLE TABLE1 TO USER USER1;    -- 对USE DATABASE 下的表进行授权。
GRANT WRITE_DATA ON TABLE TABLE2 TO ROLE ROLE1;
GRANT WRITE_SCHEMA ON TABLE TABLE3 TO USER USER1 WITH GRANT OPTION;
GRANT MANAGE_DATABASE TO USER USER1;
GRANT MANAGE_USER TO USER USER1;
```

```SQL
revoke privilege_object [on Object] from role_spec;
privilege_object:
        GRANT OPTION FOR privilege | privilege
privilege:
        READ_SCHEMA| READ_DATA|WRITE_SCHEMA|WRITE_DATA|other system privileges
        
Object:
        ObjectType ObjectName
ObjectType:
        Database | Table
        
role_spec:
        roletype rolename
roletype:
        role | user
```

例如

```SQL
REVOKE READ_DATA ON DATABASE DB1 FROM USER USER1;
REVOKE READ_SCHEMA ON DATABASE DB2 FROM USER USER1;
REVOKE READ_DATA ON TABLE TB1 FROM USER USER1;
REVOKE MANAGE_DATABASE FROM ROLE ROLE1;
REVOKE MANAGE_USER FROM ROLE ROLE2;
REVOKE GRANT OPTION FOR MANAGE_USER FROM USER USER2;
REVOKE GRANT OPTION FOR READ_DATA ON DATABASE DB1 FROM USER USER3;
```
# An Example

Below is a specific example demonstrating the use of table model permissions.

After the database initialization, only the super administrator has all the permissions, so all user permissions originate from the super administrator.

The super administrator can create a database themselves or grant the MANAGE_DATABASE permission to the database administrator DB_MANAGER, allowing him to grant or revoke this permission to others:

```SQL
GRANT MANAGE_DATABASE TO USER DB_MANAGER WITH GRANT OPTION;
```
DB_MANAGER now has the authority to create, delete, and modify databases. He can create or delete a database:

```SQL
CREATE DATABASE DB1;
```

DB_MANAGER can grant the DDL limit to the manager of the database DB1_MR, or grant reading permissions to the user DB1_USER;

Granting only READ_DATA permission would result in DB1_USER being unable to fetch table names under DB, so READ_SCHEMA permission can also be granted to DB1_USER:
```SQL
GRANT WRITE_SCHEMA ON DATABASE DB1 TO USER DB1_MR WITH GRANT OPTION;
GRANT READ_DATA ON DATABASE DB1 TO USER DB1_USER;
GRANT READ_SCHEMA ON DATABASE DB1 TO USER DB1_USER;

```

A user with WRITE_SCHEMA permission on DATABASE can perform table creation operations, for example, DB1_MR can create a table:

```SQL
create table TABLE1
(
region TEXT ID,
factory number TEXT ID,
device number TEXT ID,
model TEXT ATTRIBUTE,
temperature FLOAT MEASUREMENT,
displacement DOUBLE MEASUREMENT,
)
with
TTL=3600000
```
The database user DB1_USER has query permissions for all tables in the database; he can query this table and also view its metadata definition. However, he is not allowed to modify the table or the data within it.

After creating the table, DB1_MR can grant read and write permissions to a certain user, for example:

```SQL
GRANT READ_DATA ON TABLE TABLE1 TO USER USER_TABLE_READER; -- Grant read permission to USER_TABLE_READER, allowing the user to perform queries in the table
GRANT WRITE_SCHEMA ON TABLE TABLE1 TO USER USER_TABLE_MANAGER WITH GRANT OPTION; -- Grant metadata modification rights to USER_TABLE_MANAGER, allowing the user to make DDL modifications, including changing table names, adding or deleting columns, creating or deleting indexes, modifying TTL, etc.
GRANT WRITE_DATA ON TABLE TABLE1 TO ROLE USER_TABLE_WRITER;
```
To revoke USER_TABLE_READER's permissions, you can perform the following operation:

```SQL
REVOKE READ_DATA ON TABLE TABLE1 FROM USER_TABLE_READER;
```
To only cancel the control of USER_TABLE_MANAGER over the WRITE_SCHEMA permission, you can perform the following operation:

```SQL
REVOKE GRANT OPTION ON WRITE_SCHEMA FROM USER USER_TABLE_MANAGER;
```

This translation includes all parts of the document you provided, with the SQL statements left as originally written.










