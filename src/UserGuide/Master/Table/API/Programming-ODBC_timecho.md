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

# ODBC

## 1. Feature Introduction
The IoTDB ODBC driver provides the ability to interact with the database via the standard ODBC interface, supporting data management in time-series databases through ODBC connections. It currently supports database connection, data query, data insertion, data modification, and data deletion operations, and is compatible with various applications and toolchains that support the ODBC protocol.

> Note: This feature is supported starting from V2.0.8.2.

## 2. Usage Method
It is recommended to install using the pre-compiled binary package. There is no need to compile it yourself; simply use the script to complete the driver installation and system registration. Currently, only Windows systems are supported.

### 2.1 Environment Requirements
Only the ODBC Driver Manager dependency at the operating system level is required; no compilation environment configuration is needed:

| **Operating System** | **Requirements and Installation Method**                                                                                                                                                                                                                      |
| :--- |:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Windows | 1. **Windows 10/11, Server 2016/2019/2022**: Comes with ODBC Driver Manager version 17/18 built-in; no extra installation needed.<br>2. **Windows 8.1/Server 2012 R2**: Requires manual installation of the corresponding version of the ODBC Driver Manager. |

### 2.2 Installation Steps
1. Contact the Tianmou team to obtain the pre-compiled binary package.
   Binary package directory structure:
   ```Plain
   ├── bin/
   │   ├── apache_iotdb_odbc.dll
   │   └── install_driver.exe
   ├── install.bat
   └── registry.bat
   ```
2. Open a command line tool (CMD/PowerShell) with **Administrator privileges** and run the following command: (You can replace the path with any absolute path)
   ```Bash
   install.bat "C:\Program Files\Apache IoTDB ODBC Driver"
   ```
   The script automatically completes the following operations:
    * Creates the installation directory (if it does not exist).
    * Copies `bin\apache_iotdb_odbc.dll` to the specified installation directory.
    * Calls `install_driver.exe` to register the driver to the system via the ODBC standard API (`SQLInstallDriverEx`).
3. Verify installation: Open "ODBC Data Source Administrator". If you can see `Apache IoTDB ODBC Driver` in the "Drivers" tab, the registration was successful.
   ![](/img/odbc-1-en.png)

### 2.3 Uninstallation Steps
1. Open Command Prompt as Administrator and `cd` into the project root directory.
2. Run the uninstallation script:
   ```Bash
   uninstall.bat
   ```
   The script will call `install_driver.exe` to unregister the driver from the system via the ODBC standard API (`SQLRemoveDriver`). The DLL files in the installation directory will not be automatically deleted; please delete them manually if cleanup is required.

### 2.4 Connection Configuration
After installing the driver, you need to configure a Data Source Name (DSN) to allow applications to connect to the database using the DSN name. The IoTDB ODBC driver supports two methods for configuring connection parameters: via Data Source and via Connection String.

#### 2.4.1 Configuring Data Source
**Configure via ODBC Data Source Administrator**
1. Open "ODBC Data Source Administrator", switch to the "User DSN" tab, and click the "Add" button.
   ![](/img/odbc-2-en.png)
2. Select "Apache IoTDB ODBC Driver" from the pop-up driver list and click "Finish".
   ![](/img/odbc-3-en.png)
3. The data source configuration dialog will appear. Fill in the connection parameters and click OK:
   ![](/img/odbc-4-en.png)
   The meaning of each field in the dialog box is as follows:

   | **Area** | **Field** | **Description** |
   | :--- | :--- | :--- |
   | Data Source | DSN Name | Data Source Name; applications refer to this data source by this name. |
   | Data Source | Description | Data Source description (optional). |
   | Connection | Server | IoTDB server IP address, default 127.0.0.1. |
   | Connection | Port | IoTDB Session API port, default 6667. |
   | Connection | User | Username, default root. |
   | Connection | Password | Password, default root. |
   | Options | Table Model | Check to use Table Model; uncheck to use Tree Model. |
   | Options | Database | Database name. Only available in Table Model mode; grayed out in Tree Model. |
   | Options | Log Level | Log level (0-4): 0=OFF, 1=ERROR, 2=WARN, 3=INFO, 4=TRACE. |
   | Options | Session Timeout | Session timeout time (milliseconds); 0 means no timeout. Note: The server-side `queryTimeoutThreshold` defaults to 60000ms; exceeding this value requires modifying server configuration. |
   | Options | Batch Size | Number of rows fetched per batch, default 1000. Setting to 0 resets to the default value. |

4. After filling in the details, you can click the "Test Connection" button to test the connection. Testing will attempt to connect to the IoTDB server using the current parameters and execute a `SHOW VERSION` query. If successful, the server version information will be displayed; if failed, the specific error reason will be shown.
5. Once parameters are confirmed correct, click "OK" to save. The data source will appear in the "User DSN" list, as shown in the example below with the name "123".
   ![](/img/odbc-5-en.png)
   To modify the configuration of an existing data source, select it in the list and click the "Configure" button to edit again.

#### 2.4.2 Connection String
The connection string format is **semicolon-separated key-value pairs**, for example:
```Bash
Driver={IoTDB ODBC Driver};server=127.0.0.1;port=6667;uid=root;pwd=root;database=testdb;isTableModel=true;loglevel=2
```
Specific field attributes are introduced in the table below:

| **Field Name** | **Description** | **Optional Values**                                                                                                                                                                                                                                         | **Default Value** |
| :--- | :--- |:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| :--- |
| DSN | Data Source Name | Custom data source name                                                                                                                                                                                                                                     | - |
| uid | Database username | Any string                                                                                                                                                                                                                                                  | root |
| pwd | Database password | Any string                                                                                                                                                                                                                                                  | root |
| server | IoTDB server address | IP address                                                                                                                                                                                                                                                  | 127.0.0.1 |
| port | IoTDB server port | Port number                                                                                                                                                                                                                                                 | 6667 |
| database | Database name (only effective in Table Model mode) | Any string                                                                                                                                                                                                                                                  | Empty string |
| loglevel | Log level | Integer value (0-4)                                                                                                                                                                                                                                         | 4 (LOG_LEVEL_TRACE) |
| isTableModel / tablemodel | Whether to enable Table Model mode | Boolean type, supports multiple representations:<br>1. 0, false, no, off: set to false;<br>2. 1, true, yes, on: set to true;<br>3. Other values default to true.                                                                                                    | true |
| sessiontimeoutms | Session timeout time (milliseconds) | 64-bit integer, defaults to `LLONG_MAX`; setting to `0` will be replaced with `LLONG_MAX`. Note: The server has a timeout setting: `private long queryTimeoutThreshold = 60000;` this item needs to be modified to get a timeout time exceeding 60 seconds. | LLONG_MAX |
| batchsize | Batch size for fetching data each time | 64-bit integer, defaults to `1000`; setting to `0` will be replaced with `1000`                                                                                                                                                                             | 1000 |

Notes:
* Field names are case-insensitive (automatically converted to lowercase for comparison).
* Connection string format is semicolon-separated key-value pairs, e.g., `Driver={IoTDB ODBC Driver};server=127.0.0.1;port=6667;uid=root;pwd=root;database=testdb;isTableModel=true;loglevel=2`.
* For boolean fields (`isTableModel`), multiple representation methods are supported.
* All fields are optional; if not specified, default values are used.
* Unsupported fields will be ignored and a warning logged, but will not affect the connection.
* The default server interface port 6667 is the default port used by IoTDB's C++ Session interface. This ODBC driver uses the C++ Session interface to transfer data with IoTDB. If the C++ Session interface on the IoTDB server uses a non-default port, corresponding changes must be made in the ODBC connection string.

#### 2.4.3 Relationship between Data Source Configuration and Connection String
Configurations saved in the ODBC Data Source Administrator are written into the system's ODBC data source configuration as key-value pairs (corresponding to the registry `HKEY_CURRENT_USER\SOFTWARE\ODBC\ODBC.INI` under Windows). When an application uses `SQLConnect` or specifies `DSN=DataSourceName` in the connection string, the driver reads these parameters from the system configuration.

**The priority of the connection string is higher than the configuration saved in the DSN.** Specific rules are as follows:
1. If the connection string contains `DSN=xxx` and does not contain `DRIVER=...`, the driver first loads all parameters of that DSN from the system configuration as base values.
2. Then, parameters explicitly specified in the connection string will override parameters with the same name in the DSN.
3. If the connection string contains `DRIVER=...`, no DSN parameters will be read from the system configuration; it will rely entirely on the connection string.

For example: If the DSN is configured with `Server=192.168.1.100` and `Port=6667`, but the connection string is `DSN=MyDSN;Server=127.0.0.1`, then the actual connection will use `Server=127.0.0.1` (overridden by connection string) and `Port=6667` (from DSN).

### 2.5 Logging
Log output during driver runtime is divided into "Driver Self-Logs" and "ODBC Manager Tracing Logs". Note the impact of log levels on performance.

#### 2.5.1 Driver Self-Logs
* Output location: `apache_iotdb_odbc.log` in the user's home directory.
* Log level: Configured via the `loglevel` parameter in the connection string (0-4; higher levels produce more detailed output).
* Performance impact: High log levels will significantly reduce driver performance; recommended for debugging only.

#### 2.5.2 ODBC Manager Tracing Logs
* How to enable: Open "ODBC Data Source Administrator" → "Tracing" → "Start Tracing Now".
* Precautions: Enabling this will greatly reduce driver performance; use only for troubleshooting.

## 3. Interface Support

### 3.1 Method List
The driver's support status for standard ODBC APIs is as follows:

| ODBC/Setup API    | Function Function                            | Parameter List                                                                                                                                                                                                               | Parameter Description |
|:------------------|:---------------------------------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| :--- |
| SQLAllocHandle    | Allocate ODBC Handle                         | (SQLSMALLINT HandleType, SQLHANDLE InputHandle, SQLHANDLE *OutputHandle)                                                                                                                                                     | HandleType: Type of handle to allocate (ENV/DBC/STMT/DESC);<br>InputHandle: Parent context handle;<br>OutputHandle: Pointer to the returned new handle. |
| SQLBindCol        | Bind column to result buffer                 | (SQLHSTMT StatementHandle, SQLUSMALLINT ColumnNumber, SQLSMALLINT TargetType, SQLPOINTER TargetValue, SQLLEN BufferLength, SQLLEN *StrLen_or_Ind)                                                                            | StatementHandle: Statement handle;<br>ColumnNumber: Column number;<br>TargetType: C data type;<br>TargetValue: Data buffer;BufferLength: Buffer length;<br>StrLen_or_Ind: Returns data length or NULL indicator. |
| SQLColAttribute   | Get column attribute information             | (SQLHSTMT StatementHandle, SQLUSMALLINT ColumnNumber, SQLUSMALLINT FieldIdentifier, SQLPOINTER CharacterAttribute, SQLSMALLINT BufferLength, SQLSMALLINT *StringLength, SQLLEN *NumericAttribute)                            | StatementHandle: Statement handle;<br>ColumnNumber: Column number;<br>FieldIdentifier: Attribute ID;<br>CharacterAttribute: Character attribute output;<br>BufferLength: Buffer length;<br>StringLength: Returned length;<br>NumericAttribute: Numeric attribute output. |
| SQLColumns        | Query table column information               | (SQLHSTMT StatementHandle, SQLCHAR *CatalogName, SQLSMALLINT NameLength1, SQLCHAR *SchemaName, SQLSMALLINT NameLength2, SQLCHAR *TableName, SQLSMALLINT NameLength3, SQLCHAR *ColumnName, SQLSMALLINT NameLength4)           | StatementHandle: Statement handle;<br>Catalog/Schema/Table/ColumnName: Query object names;<br><br>NameLength*: Corresponding name lengths. |
| SQLConnect        | Establish database connection                | (SQLHDBC ConnectionHandle, SQLCHAR *ServerName, SQLSMALLINT NameLength1, SQLCHAR *UserName, SQLSMALLINT NameLength2, SQLCHAR *Authentication, SQLSMALLINT NameLength3)                                                       | ConnectionHandle: Connection handle;<br>ServerName: Data source name;<br>UserName: Username;<br>Authentication: Password; <br>NameLength*: String lengths. |
| SQLDescribeCol    | Describe columns in result set               | (SQLHSTMT StatementHandle, SQLUSMALLINT ColumnNumber, SQLCHAR *ColumnName, SQLSMALLINT BufferLength, SQLSMALLINT *NameLength, SQLSMALLINT *DataType, SQLULEN *ColumnSize, SQLSMALLINT *DecimalDigits, SQLSMALLINT *Nullable) | StatementHandle: Statement handle;<br>ColumnNumber: Column number;<br>ColumnName: Column name output;<br>BufferLength: Buffer length;<br>NameLength: Returned column name length;<br>DataType: SQL type;<br>ColumnSize: Column size;<br>DecimalDigits: Decimal digits;<br>Nullable: Whether nullable. |
| SQLDisconnect     | Disconnect database connection               | (SQLHDBC ConnectionHandle)                                                                                                                                                                                                   | ConnectionHandle: Connection handle. |
| SQLDriverConnect  | Establish connection using connection string | (SQLHDBC ConnectionHandle, SQLHWND WindowHandle, SQLCHAR *InConnectionString, SQLSMALLINT StringLength1, SQLCHAR *OutConnectionString, SQLSMALLINT BufferLength, SQLSMALLINT *StringLength2, SQLUSMALLINT DriverCompletion)  | ConnectionHandle: Connection handle;<br>WindowHandle: Window handle;InConnectionString: Input connection string;<br>StringLength1: Input length;<br>OutConnectionString: Output connection string;<br>BufferLength: Output buffer;<br>StringLength2: Returned length;<br>DriverCompletion: Connection prompt method. |
| SQLEndTran        | Commit or rollback transaction               | (SQLSMALLINT HandleType, SQLHANDLE Handle, SQLSMALLINT CompletionType)                                                                                                                                                       | HandleType: Handle type;<br>Handle: Connection or environment handle;<br>CompletionType: Commit or rollback transaction. |
| SQLExecDirect     | Execute SQL statement directly               | (SQLHSTMT StatementHandle, SQLCHAR *StatementText, SQLINTEGER TextLength)                                                                                                                                                    | StatementHandle: Statement handle;<br>StatementText: SQL text;TextLength: SQL length. |
| SQLFetch          | Fetch next row in result set                 | (SQLHSTMT StatementHandle)                                                                                                                                                                                                   | StatementHandle: Statement handle. |
| SQLFreeHandle     | Free ODBC handle                             | (SQLSMALLINT HandleType, SQLHANDLE Handle)                                                                                                                                                                                   | HandleType: Handle type;<br>Handle: Handle to free. |
| SQLFreeStmt       | Free statement-related resources             | (SQLHSTMT StatementHandle, SQLUSMALLINT Option)                                                                                                                                                                              | StatementHandle: Statement handle;<br>Option: Free option (close cursor/reset parameters, etc.). |
| SQLGetConnectAttr | Get connection attribute                     | (SQLHDBC ConnectionHandle, SQLINTEGER Attribute, SQLPOINTER Value, SQLINTEGER BufferLength, SQLINTEGER *StringLength)                                                                                                        | ConnectionHandle: Connection handle;<br>Attribute: Attribute ID;<br>Value: Returned attribute value;<br>BufferLength: Buffer length;<br>StringLength: Returned length. |
| SQLGetData        | Get result data                              | (SQLHSTMT StatementHandle, SQLUSMALLINT Col_or_Param_Num, SQLSMALLINT TargetType, SQLPOINTER TargetValue, SQLLEN BufferLength, SQLLEN *StrLen_or_Ind)                                                                        | StatementHandle: Statement handle;<br>Col_or_Param_Num: Column number;<br>TargetType: C type;<br>TargetValue: Data buffer;<br>BufferLength: Buffer size;<br>StrLen_or_Ind: Returned length or NULL flag. |
| SQLGetDiagField   | Get diagnostic field                         | (SQLSMALLINT HandleType, SQLHANDLE Handle, SQLSMALLINT RecNumber, SQLSMALLINT DiagIdentifier, SQLPOINTER DiagInfo, SQLSMALLINT BufferLength, SQLSMALLINT *StringLength)                                                      | HandleType: Handle type;<br>Handle: Handle;<br>RecNumber: Record number;<br>DiagIdentifier: Diagnostic field ID;<br>DiagInfo: Output info;<br>BufferLength: Buffer;<br>StringLength: Returned length. |
| SQLGetDiagRec     | Get diagnostic record                        | (SQLSMALLINT HandleType, SQLHANDLE Handle, SQLSMALLINT RecNumber, SQLCHAR *Sqlstate, SQLINTEGER *NativeError, SQLCHAR *MessageText, SQLSMALLINT BufferLength, SQLSMALLINT *TextLength)                                       | HandleType: Handle type;<br>Handle: Handle;<br>RecNumber: Record number;<br>Sqlstate: SQL state code;<br>NativeError: Native error code;<br>MessageText: Error message;<br>BufferLength: Buffer;<br>TextLength: Returned length. |
| SQLGetInfo        | Get database information                     | (SQLHDBC ConnectionHandle, SQLUSMALLINT InfoType, SQLPOINTER InfoValue, SQLSMALLINT BufferLength, SQLSMALLINT *StringLength)                                                                                                 | ConnectionHandle: Connection handle;<br>InfoType: Information type;<br>InfoValue: Return value;<br>BufferLength: Buffer length;<br>StringLength: Returned length. |
| SQLGetStmtAttr    | Get statement attribute                      | (SQLHSTMT StatementHandle, SQLINTEGER Attribute, SQLPOINTER Value, SQLINTEGER BufferLength, SQLINTEGER *StringLength)                                                                                                        | StatementHandle: Statement handle;<br>Attribute: Attribute ID;<br>Value: Return value;<br>BufferLength: Buffer;<br>StringLength: Returned length. |
| SQLGetTypeInfo    | Get data type information                    | (SQLHSTMT StatementHandle, SQLSMALLINT DataType)                                                                                                                                                                             | StatementHandle: Statement handle;<br>DataType: SQL data type. |
| SQLMoreResults    | Get more result sets                         | (SQLHSTMT StatementHandle)                                                                                                                                                                                                   | StatementHandle: Statement handle. |
| SQLNumResultCols  | Get number of columns in result set          | (SQLHSTMT StatementHandle, SQLSMALLINT *ColumnCount)                                                                                                                                                                         | StatementHandle: Statement handle;<br>ColumnCount: Returned column count. |
| SQLRowCount       | Get number of affected rows                  | (SQLHSTMT StatementHandle, SQLLEN *RowCount)                                                                                                                                                                                 | StatementHandle: Statement handle;<br>RowCount: Returned number of affected rows. |
| SQLSetConnectAttr | Set connection attribute                     | (SQLHDBC ConnectionHandle, SQLINTEGER Attribute, SQLPOINTER Value, SQLINTEGER StringLength)                                                                                                                                  | ConnectionHandle: Connection handle;<br>Attribute: Attribute ID;<br>Value: Attribute value;<br>StringLength: Attribute value length. |
| SQLSetEnvAttr     | Set environment attribute                    | (SQLHENV EnvironmentHandle, SQLINTEGER Attribute, SQLPOINTER Value, SQLINTEGER StringLength)                                                                                                                                 | EnvironmentHandle: Environment handle;<br>Attribute: Attribute ID;<br>Value: Attribute value;<br>StringLength: Length. |
| SQLSetStmtAttr    | Set statement attribute                      | (SQLHSTMT StatementHandle, SQLINTEGER Attribute, SQLPOINTER Value, SQLINTEGER StringLength)                                                                                                                                  | StatementHandle: Statement handle;<br>Attribute: Attribute ID;<br>Value: Attribute value;<br>StringLength: Length. |
| SQLTables         | Query table information                      | (SQLHSTMT StatementHandle, SQLCHAR *CatalogName, SQLSMALLINT NameLength1, SQLCHAR *SchemaName, SQLSMALLINT NameLength2, SQLCHAR *TableName, SQLSMALLINT NameLength3, SQLCHAR *TableType, SQLSMALLINT NameLength4)            | StatementHandle: Statement handle;<br>Catalog/Schema/TableName: Table names;<br>TableType: Table type;<br>NameLength*: Corresponding lengths. |

### 3.2 Data Type Conversion
The mapping relationship between IoTDB data types and standard ODBC data types is as follows:

| **IoTDB Data Type** | **ODBC Data Type** |
| :--- | :--- |
| BOOLEAN | SQL_BIT |
| INT32 | SQL_INTEGER |
| INT64 | SQL_BIGINT |
| FLOAT | SQL_REAL |
| DOUBLE | SQL_DOUBLE |
| TEXT | SQL_VARCHAR |
| STRING | SQL_VARCHAR |
| BLOB | SQL_LONGVARBINARY |
| TIMESTAMP | SQL_BIGINT |
| DATE | SQL_DATE |

## 4. Operation Examples
This chapter mainly introduces full-type operation examples for **C#**, **Python**, **C++**, **PowerBI**, and **Excel**, covering core operations such as data query, insertion, and deletion.

### 4.1 C# Example

```C#
Here is the C# code with all comments and string literals translated into English:

```csharp
/*******
Note: When the output contains Chinese characters, it may cause garbled text.
This is because the table.Write() function cannot output strings in UTF-8 encoding
and can only output using GB2312 (or another system default encoding). This issue
may not occur in software like Power BI; it also does not occur when using the Console.WriteLine function. 
This is an issue with the ConsoleTable package.
*****/

using System.Data.Common;
using System.Data.Odbc;
using System.Reflection.PortableExecutable;
using ConsoleTables;
using System;

/// <summary>Executes a SELECT query and outputs the results of fulltable in table format</summary>
void Query(OdbcConnection dbConnection)
{
    try
    {
        using (OdbcCommand dbCommand = dbConnection.CreateCommand())
        {
            dbCommand.CommandText = "select * from fulltable";
            using (OdbcDataReader dbReader = dbCommand.ExecuteReader())
            {
                var fCount = dbReader.FieldCount;
                Console.WriteLine($"fCount = {fCount}");
                
                // Output header row
                var columns = new string[fCount];
                for (var i = 0; i < fCount; i++)
                {
                    var fName = dbReader.GetName(i);
                    if (fName.Contains('.'))
                    {
                        fName = fName.Substring(fName.LastIndexOf('.') + 1);
                    }
                    columns[i] = fName;
                }
                
                // Output content rows
                var table = new ConsoleTable(columns);
                while (dbReader.Read())
                {
                    var row = new object[fCount];
                    for (var i = 0; i < fCount; i++)
                    {
                        if (dbReader.IsDBNull(i))
                        {
                            row[i] = null;
                            continue;
                        }
                        row[i] = dbReader.GetValue(i);
                    }
                    table.AddRow(row);
                }
                table.Write();
                Console.WriteLine();
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine(ex.ToString());
    }
}

/// <summary>Executes non-query SQL statements (such as CREATE DATABASE, CREATE TABLE, INSERT, etc.)</summary>
void Execute(OdbcConnection dbConnection, string command)
{
    try
    {
        using (OdbcCommand dbCommand = dbConnection.CreateCommand())
        {
            try
            {
                dbCommand.CommandText = command;
                Console.WriteLine($"Execute command: {command}");
                dbCommand.ExecuteNonQuery();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"CommandText error: {ex.Message}");
            }
        }
    }
    catch (OdbcException ex)
    {
        Console.WriteLine($"Database error: {ex.Message}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Unknown error occurred: {ex.Message}");
    }
}

var dsn = "Apache IoTDB DSN";
var user = "root";
var password = "root";
var server = "127.0.0.1";
var database = "test";
var connectionString = $"DSN={dsn};Server={server};UID={user};PWD={password};Database={database};loglevel=4";

using (OdbcConnection dbConnection = new OdbcConnection(connectionString))
{
    Console.WriteLine($"Start");
    try
    {
        dbConnection.Open();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Login failed: {ex.Message}");
        Console.WriteLine($"Stack Trace: {ex.StackTrace}");
        dbConnection.Dispose();
        return;
    }
    Console.WriteLine($"Successfully opened connection. database name = {dbConnection.Driver}");
    
    Execute(dbConnection, "CREATE DATABASE IF NOT EXISTS test");
    Execute(dbConnection, "use test");
    Console.WriteLine("use test Execute complete. Begin to setup fulltable.");

    Execute(dbConnection, "CREATE TABLE IF NOT EXISTS fullTable (time TIMESTAMP TIME, bool_col BOOLEAN FIELD, int32_col INT32 FIELD, int64_col INT64 FIELD, float_col FLOAT FIELD, double_col DOUBLE FIELD, text_col TEXT FIELD, string_col STRING FIELD, blob_col BLOB FIELD, timestamp_col TIMESTAMP FIELD, date_col DATE FIELD) WITH (TTL=315360000000)");
    
    string[] insertStatements = new string[]
    {
        "INSERT INTO fulltable VALUES (1735689600000, true, 100, 10000000000, 36.5, 128.689, 'Device operating normally', 'DeviceA-Room1', '0x506C616E7444617461', 1735689600000, '2026-01-04')",
        "INSERT INTO fulltable VALUES (1735689660000, false, 101, 10000000001, 36.6, 128.789, 'Device operating normally', 'DeviceA-Room1', '0x506C616E7444617461', 1735689660000, '2026-01-04')",
        "INSERT INTO fulltable VALUES (1735689720000, true, 102, 10000000002, 36.7, 128.889, 'Device operating normally', 'DeviceA-Room1', '0x506C616E7444617461', 1735689720000, '2026-01-04')",
        "INSERT INTO fulltable VALUES (1735689780000, false, 103, 10000000003, 36.8, 128.989, 'Device temperature high alarm', 'DeviceA-Room1', '0x506C616E7444617462', 1735689780000, '2026-01-04')",
        "INSERT INTO fulltable VALUES (1735689840000, true, 104, 10000000004, 36.9, 129.089, 'Device status returned to normal', 'DeviceA-Room1', '0x506C616E7444617461', 1735689840000, '2026-01-04')",
        "INSERT INTO fulltable VALUES (1735689900000, false, 105, 10000000005, 37.0, 129.189, 'Device operating normally', 'DeviceB-Room2', '0x506C616E7444617463', 1735689900000, '2026-01-04')",
        "INSERT INTO fulltable VALUES (1735689960000, true, 106, 10000000006, 37.1, 129.289, 'Device operating normally', 'DeviceB-Room2', '0x506C616E7444617463', 1735689960000, '2026-01-04')",
        "INSERT INTO fulltable VALUES (1735690020000, false, 107, 10000000007, 37.2, 129.389, 'Device humidity low alarm', 'DeviceB-Room2', '0x506C616E7444617464', 1735690020000, '2026-01-04')",
        "INSERT INTO fulltable VALUES (1735690080000, true, 108, 10000000008, 37.3, 129.489, 'Device status returned to normal', 'DeviceB-Room2', '0x506C616E7444617463', 1735690080000, '2026-01-04')",
        "INSERT INTO fulltable VALUES (1735690140000, false, 109, 10000000009, 37.4, 129.589, 'Device operating normally', 'DeviceC-Room3', '0x506C616E7444617465', 1735690140000, '2026-01-04')",
        "INSERT INTO fulltable VALUES (1735690200000, true, 110, 10000000010, 37.5, 129.689, 'Device operating normally', 'DeviceC-Room3', '0x506C616E7444617465', 1735690200000, '2026-01-04')",
        "INSERT INTO fulltable VALUES (1735690260000, false, 111, 10000000011, 37.6, 129.789, 'Device voltage unstable alarm', 'DeviceC-Room3', '0x506C616E7444617466', 1735690260000, '2026-01-04')",
        "INSERT INTO fulltable VALUES (1735690320000, true, 112, 10000000012, 37.7, 129.889, 'Device status returned to normal', 'DeviceC-Room3', '0x506C616E7444617465', 1735690320000, '2026-01-04')",
        "INSERT INTO fulltable VALUES (1735690380000, false, 113, 10000000013, 37.8, 129.989, 'Device operating normally', 'DeviceD-Room4', '0x506C616E7444617467', 1735690380000, '2026-01-04')",
        "INSERT INTO fulltable VALUES (1735690440000, true, 114, 10000000014, 37.9, 130.089, 'Device operating normally', 'DeviceD-Room4', '0x506C616E7444617467', 1735690440000, '2026-01-04')",
        "INSERT INTO fulltable VALUES (1735690500000, false, 115, 10000000015, 38.0, 130.189, 'Device operating normally', 'DeviceD-Room4', '0x506C616E7444617467', 1735690500000, '2026-01-04')",
        "INSERT INTO fulltable VALUES (1735690560000, true, 116, 10000000016, 38.1, 130.289, 'Device signal interrupted alarm', 'DeviceD-Room4', '0x506C616E7444617468', 1735690560000, '2026-01-04')",
        "INSERT INTO fulltable VALUES (1735690620000, false, 117, 10000000017, 38.2, 130.389, 'Device operating normally', 'DeviceE-Room5', '0x506C616E7444617469', 1735690620000, '2026-01-04')",
        "INSERT INTO fulltable VALUES (1735690680000, true, 118, 10000000018, 38.3, 130.489, 'Device operating normally', 'DeviceE-Room5', '0x506C616E7444617469', 1735690680000, '2026-01-04')",
        "INSERT INTO fulltable VALUES (1735690740000, false, 119, 10000000019, 38.4, 130.589, 'Device operating normally', 'DeviceE-Room5', '0x506C616E7444617469', 1735690740000, '2026-01-04')",
        "INSERT INTO fulltable VALUES (1735690790000, false, 119, 10000000019, 38.4, 130.589, 'Device operating normally', 'DeviceE-Room5', '0x506C616E7444617469', 1735690740000, '2026-01-04')"
    };
    
    foreach (var insert in insertStatements)
    {
        Execute(dbConnection, insert);
    }
    Console.WriteLine("fulltable setup complete. Begin to query.");
    
    Query(dbConnection); // Execute query and output results
}
```

### 4.2 Python Example
1. To access ODBC via Python, install the `pyodbc` package:
   ```Plain
   pip install pyodbc
   ```
2. Full Code:


```Python
Here is the complete Python code with all comments and string literals translated into English:

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Apache IoTDB ODBC Python example
Use pyodbc to connect to the IoTDB ODBC driver and perform operations such as query and insert.
For reference, see examples/cpp-example/test.cpp and examples/BasicTest/BasicTest/Program.cs
"""

import pyodbc

def execute(conn: pyodbc.Connection, command: str) -> None:
    """Executes non-query SQL statements (such as USE, CREATE, INSERT, DELETE, etc.)"""
    try:
        with conn.cursor() as cursor:
            cursor.execute(command)
            # INSERT/UPDATE/DELETE require commit; session commands such as USE do not.
            cmd_upper = command.strip().upper()
            if cmd_upper.startswith(("INSERT", "UPDATE", "DELETE")):
                conn.commit()
            print(f"Execute command: {command}")
    except pyodbc.Error as ex:
        print(f"CommandText error: {ex}")

def query(conn: pyodbc.Connection, sql: str) -> None:
    """Executes a SELECT query and outputs the results in table format"""
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql)
            col_count = len(cursor.description)
            print(f"fCount = {col_count}")

            if col_count <= 0:
                return

            # Get column names (if the name contains '.', take the last segment, consistent with C++/C# samples).
            columns = []
            for i in range(col_count):
                col_name = cursor.description[i][0] or f"Column{i}"
                if "." in str(col_name):
                    col_name = str(col_name).split(".")[-1]
                columns.append(str(col_name))

            # Fetch data rows
            rows = cursor.fetchall()

            # Simple table output
            col_widths = [max(len(str(col)), 4) for col in columns]
            for i, row in enumerate(rows):
                for j, val in enumerate(row):
                    if j < len(col_widths):
                        col_widths[j] = max(col_widths[j], len(str(val) if val is not None else "NULL"))

            # Print header
            header = " | ".join(str(c).ljust(col_widths[i]) for i, c in enumerate(columns))
            print(header)
            print("-" * len(header))

            # Print data rows
            for row in rows:
                values = []
                for i, val in enumerate(row):
                    if val is None:
                        cell = "NULL"
                    else:
                        cell = str(val)
                    values.append(cell.ljust(col_widths[i]) if i < len(col_widths) else cell)
                print(" | ".join(values))

            print()

    except pyodbc.Error as ex:
        print(f"Query error: {ex}")

def main() -> None:
    dsn = "Apache IoTDB DSN"
    user = "root"
    password = "root"
    server = "127.0.0.1"
    database = "test"
    connection_string = (
        f"DSN={dsn};Server={server};UID={user};PWD={password};"
        f"Database={database};loglevel=4"
    )

    print("Start")

    try:
        conn = pyodbc.connect(connection_string)
    except pyodbc.Error as ex:
        print(f"Login failed: {ex}")
        return

    try:
        driver_name = conn.getinfo(6)  # SQL_DRIVER_NAME
        print(f"Successfully opened connection. driver = {driver_name}")
    except Exception:
        print("Successfully opened connection.")

    try:
        execute(conn, "CREATE DATABASE IF NOT EXISTS test")
        execute(conn, "use test")
        print("use test Execute complete. Begin to setup fulltable.")

        # Create the fulltable table and insert test data
        execute(
            conn,
            "CREATE TABLE IF NOT EXISTS fullTable (time TIMESTAMP TIME, bool_col BOOLEAN FIELD, "
            "int32_col INT32 FIELD, int64_col INT64 FIELD, float_col FLOAT FIELD, "
            "double_col DOUBLE FIELD, text_col TEXT FIELD, string_col STRING FIELD, "
            "blob_col BLOB FIELD, timestamp_col TIMESTAMP FIELD, date_col DATE FIELD) "
            "WITH (TTL=315360000000)",
        )
        insert_statements = [
            "INSERT INTO fulltable VALUES (1735689600000, true, 100, 10000000000, 36.5, 128.689, 'Device operating normally', 'DeviceA-Room1', '0x506C616E7444617461', 1735689600000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735689660000, false, 101, 10000000001, 36.6, 128.789, 'Device operating normally', 'DeviceA-Room1', '0x506C616E7444617461', 1735689660000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735689720000, true, 102, 10000000002, 36.7, 128.889, 'Device operating normally', 'DeviceA-Room1', '0x506C616E7444617461', 1735689720000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735689780000, false, 103, 10000000003, 36.8, 128.989, 'Device temperature high alarm', 'DeviceA-Room1', '0x506C616E7444617462', 1735689780000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735689840000, true, 104, 10000000004, 36.9, 129.089, 'Device status returned to normal', 'DeviceA-Room1', '0x506C616E7444617461', 1735689840000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735689900000, false, 105, 10000000005, 37.0, 129.189, 'Device operating normally', 'DeviceB-Room2', '0x506C616E7444617463', 1735689900000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735689960000, true, 106, 10000000006, 37.1, 129.289, 'Device operating normally', 'DeviceB-Room2', '0x506C616E7444617463', 1735689960000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690020000, false, 107, 10000000007, 37.2, 129.389, 'Device humidity low alarm', 'DeviceB-Room2', '0x506C616E7444617464', 1735690020000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690080000, true, 108, 10000000008, 37.3, 129.489, 'Device status returned to normal', 'DeviceB-Room2', '0x506C616E7444617463', 1735690080000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690140000, false, 109, 10000000009, 37.4, 129.589, 'Device operating normally', 'DeviceC-Room3', '0x506C616E7444617465', 1735690140000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690200000, true, 110, 10000000010, 37.5, 129.689, 'Device operating normally', 'DeviceC-Room3', '0x506C616E7444617465', 1735690200000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690260000, false, 111, 10000000011, 37.6, 129.789, 'Device voltage unstable alarm', 'DeviceC-Room3', '0x506C616E7444617466', 1735690260000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690320000, true, 112, 10000000012, 37.7, 129.889, 'Device status returned to normal', 'DeviceC-Room3', '0x506C616E7444617465', 1735690320000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690380000, false, 113, 10000000013, 37.8, 129.989, 'Device operating normally', 'DeviceD-Room4', '0x506C616E7444617467', 1735690380000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690440000, true, 114, 10000000014, 37.9, 130.089, 'Device operating normally', 'DeviceD-Room4', '0x506C616E7444617467', 1735690440000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690500000, false, 115, 10000000015, 38.0, 130.189, 'Device operating normally', 'DeviceD-Room4', '0x506C616E7444617467', 1735690500000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690560000, true, 116, 10000000016, 38.1, 130.289, 'Device signal interrupted alarm', 'DeviceD-Room4', '0x506C616E7444617468', 1735690560000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690620000, false, 117, 10000000017, 38.2, 130.389, 'Device operating normally', 'DeviceE-Room5', '0x506C616E7444617469', 1735690620000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690680000, true, 118, 10000000018, 38.3, 130.489, 'Device operating normally', 'DeviceE-Room5', '0x506C616E7444617469', 1735690680000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690740000, false, 119, 10000000019, 38.4, 130.589, 'Device operating normally', 'DeviceE-Room5', '0x506C616E7444617469', 1735690740000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690790000, false, 119, 10000000019, 38.4, 130.589, 'Device operating normally', 'DeviceE-Room5', '0x506C616E7444617469', 1735690740000, '2026-01-04')",
        ]
        for insert_sql in insert_statements:
            execute(conn, insert_sql)
        print("fulltable setup complete. Begin to query.")
        query(conn, "select * from fulltable")
        print("Query ok")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
```


### 4.3 C++ Example


```C++
Here is the complete C++ code with all comments and string literals translated into English:

```cpp
#define WIN32_LEAN_AND_MEAN
#include <windows.h>

#include <sql.h>
#include <sqlext.h>
#include <iostream>
#include <string>
#include <vector>
#include <chrono>
#include <ctime>

#ifndef SQL_DIAG_COLUMN_SIZE
#define SQL_DIAG_COLUMN_SIZE  33L
#endif

// Error handling function (core functionality preserved)
void CheckOdbcError(SQLRETURN retCode, SQLSMALLINT handleType, SQLHANDLE handle, const char* functionName) {
    if (retCode == SQL_SUCCESS || retCode == SQL_SUCCESS_WITH_INFO) {
        return;
    }

    SQLCHAR sqlState[6];
    SQLCHAR message[SQL_MAX_MESSAGE_LENGTH];
    SQLINTEGER nativeError;
    SQLSMALLINT textLength;
    SQLRETURN errRet;
    errRet = SQLGetDiagRec(handleType, handle, 1, sqlState, &nativeError, message, sizeof(message), &textLength);

    std::cerr << "ODBC Error in " << functionName << ":\n";
    std::cerr << "  SQL State: " << sqlState << "\n";
    std::cerr << "  Native Error: " << nativeError << "\n";
    std::cerr << "  Message: " << message << "\n";
    std::cerr << "  SQLGetDiagRec Return: " << errRet << "\n";

    if (retCode == SQL_ERROR || retCode == SQL_INVALID_HANDLE) {
        exit(1);
    }
}

// Simplified table output - displays basic data only
void PrintSimpleTable(const std::vector<std::string>& headers, 
                     const std::vector<std::vector<std::string>>& rows) {
    // Print header row
    for (size_t i = 0; i < headers.size(); i++) {
        std::cout << headers[i];
        if (i < headers.size() - 1) std::cout << "\t";
    }
    std::cout << std::endl;
    
    // Print separator line
    for (size_t i = 0; i < headers.size(); i++) {
        std::cout << "----------------";
        if (i < headers.size() - 1) std::cout << "\t";
    }
    std::cout << std::endl;
    
    // Print data rows
    for (const auto& row : rows) {
        for (size_t i = 0; i < row.size(); i++) {
            std::cout << row[i];
            if (i < row.size() - 1) std::cout << "\t";
        }
        std::cout << std::endl;
    }
    std::cout << std::endl;
}

/// Executes a SELECT query and outputs the results of fulltable in table format
void Query(SQLHDBC hDbc) {
    SQLHSTMT hStmt = SQL_NULL_HSTMT;
    SQLRETURN ret = SQL_SUCCESS;
    
    try {
        // Allocate statement handle
        ret = SQLAllocHandle(SQL_HANDLE_STMT, hDbc, &hStmt);
        if (!SQL_SUCCEEDED(ret)) {
            CheckOdbcError(ret, SQL_HANDLE_DBC, hDbc, "SQLAllocHandle(SQL_HANDLE_STMT)");
            return;
        }
        
        // Execute query
        const std::string sqlQuery = "select * from fulltable";
        std::cout << "Execute query: " << sqlQuery << std::endl;

        ret = SQLExecDirect(hStmt, reinterpret_cast<SQLCHAR*>(const_cast<char*>(sqlQuery.c_str())), SQL_NTS);
        if (!SQL_SUCCEEDED(ret)) {
            if (ret != SQL_NO_DATA) {
                CheckOdbcError(ret, SQL_HANDLE_STMT, hStmt, "SQLExecDirect(SELECT)");
            }
            SQLFreeHandle(SQL_HANDLE_STMT, hStmt);
            return;
        }
        
        // Get column count
        SQLSMALLINT colCount = 0;
        ret = SQLNumResultCols(hStmt, &colCount);
        if (!SQL_SUCCEEDED(ret)) {
            CheckOdbcError(ret, SQL_HANDLE_STMT, hStmt, "SQLNumResultCols");
            SQLFreeHandle(SQL_HANDLE_STMT, hStmt);
            return;
        }
        
        std::cout << "Column count = " << colCount << std::endl;
        
        // If no columns, return directly
        if (colCount <= 0) {
            SQLFreeHandle(SQL_HANDLE_STMT, hStmt);
            return;
        }
        
        // Get column names and type information
        std::vector<std::string> columnNames;
        std::vector<SQLSMALLINT> columnTypes(colCount);
        std::vector<SQLULEN> columnSizes(colCount);
        std::vector<SQLSMALLINT> decimalDigits(colCount);
        std::vector<SQLSMALLINT> nullable(colCount);
        
        // Get basic column information
        for (SQLSMALLINT i = 1; i <= colCount; i++) {
            SQLSMALLINT nameLength = 0;
            ret = SQLDescribeCol(hStmt, i, NULL, 0, &nameLength, NULL, NULL, NULL, NULL);
            if (!SQL_SUCCEEDED(ret)) {
                CheckOdbcError(ret, SQL_HANDLE_STMT, hStmt, "SQLDescribeCol (get length)");
                SQLFreeHandle(SQL_HANDLE_STMT, hStmt);
                return;
            }
            
            std::vector<SQLCHAR> colNameBuffer(nameLength + 1);
            SQLSMALLINT actualNameLength = 0;
            
            ret = SQLDescribeCol(hStmt, i, colNameBuffer.data(), nameLength + 1, 
                                &actualNameLength, NULL, NULL, NULL, NULL);
            if (!SQL_SUCCEEDED(ret)) {
                CheckOdbcError(ret, SQL_HANDLE_STMT, hStmt, "SQLDescribeCol (get name)");
                SQLFreeHandle(SQL_HANDLE_STMT, hStmt);
                return;
            }
            
            std::string fullName(reinterpret_cast<char*>(colNameBuffer.data()));
            
            size_t pos = fullName.find_last_of('.');
            if (pos != std::string::npos) {
                columnNames.push_back(fullName.substr(pos + 1));
            } else {
                columnNames.push_back(fullName);
            }
            
            ret = SQLDescribeCol(hStmt, i, NULL, 0, NULL, &columnTypes[i-1], 
                                &columnSizes[i-1], &decimalDigits[i-1], &nullable[i-1]);
            if (!SQL_SUCCEEDED(ret)) {
                CheckOdbcError(ret, SQL_HANDLE_STMT, hStmt, "SQLDescribeCol (get type info)");
                SQLFreeHandle(SQL_HANDLE_STMT, hStmt);
                return;
            }
        }
        
        std::vector<std::vector<std::string>> tableRows;
        
        int rowCount = 0;
        // Fetch data for every row
        while (true) {
            ret = SQLFetch(hStmt);
            if (ret == SQL_NO_DATA) {
                break;  
            }

            if (!SQL_SUCCEEDED(ret)) {
                CheckOdbcError(ret, SQL_HANDLE_STMT, hStmt, "SQLFetch");
                break;
            }
            
            std::vector<std::string> row;
            
            for (SQLSMALLINT i = 1; i <= colCount; i++) {
                SQLLEN indicator = 0;
                std::string valueStr;
                
                SQLSMALLINT cType;
                size_t bufferSize;
                bool isCharacterType = false;
                const int maxBufferSize = 32768;
                
                switch (columnTypes[i-1]) {
                    case SQL_CHAR:
                    case SQL_VARCHAR:
                    case SQL_LONGVARCHAR:
                    case SQL_WCHAR:
                    case SQL_WVARCHAR:
                    case SQL_WLONGVARCHAR:
                        cType = SQL_C_CHAR;
                        if (columnSizes[i - 1] > 0) {
                            bufferSize = min(maxBufferSize, static_cast<size_t>(columnSizes[i-1]) * 4 + 1);
                        } else {
                            bufferSize = maxBufferSize;
                        }
                        isCharacterType = true;
                        break;
                        
                    case SQL_DECIMAL:
                    case SQL_NUMERIC:
                        cType = SQL_C_CHAR;
                        if (columnSizes[i - 1] > 0) {
                            bufferSize = min(maxBufferSize, static_cast<size_t>(columnSizes[i-1]) * 4 + 1);
                        } else {
                            bufferSize = maxBufferSize;
                        }
                        isCharacterType = true;
                        break;
                        
                    case SQL_INTEGER:
                    case SQL_SMALLINT:
                    case SQL_TINYINT:
                    case SQL_BIGINT:
                        cType = SQL_C_SBIGINT;  
                        bufferSize = sizeof(SQLBIGINT);
                        break;
                        
                    case SQL_REAL:
                    case SQL_FLOAT:
                    case SQL_DOUBLE:
                        cType = SQL_C_DOUBLE;
                        bufferSize = sizeof(double);
                        break;
                        
                    case SQL_BIT:
                        cType = SQL_C_BIT;
                        bufferSize = sizeof(SQLCHAR);
                        break;
                        
                    case SQL_DATE:
                    case SQL_TYPE_DATE:
                        cType = SQL_C_DATE;
                        bufferSize = sizeof(SQL_DATE_STRUCT);
                        break;
                        
                    case SQL_TIME:
                    case SQL_TYPE_TIME:
                        cType = SQL_C_TIME;
                        bufferSize = sizeof(SQL_TIME_STRUCT);
                        break;
                        
                    case SQL_TIMESTAMP:
                    case SQL_TYPE_TIMESTAMP:
                        cType = SQL_C_TIMESTAMP;
                        bufferSize = sizeof(SQL_TIMESTAMP_STRUCT);
                        break;
                        
                    default:
                        cType = SQL_C_CHAR;
                        bufferSize = 256; 
                        isCharacterType = true;
                        break;
                }
                
                std::vector<BYTE> buffer(bufferSize);

                ret = SQLGetData(hStmt, i, cType, buffer.data(), bufferSize, &indicator);

                if (indicator == SQL_NULL_DATA) {
                    valueStr = "NULL";
                } 
                else if (ret != SQL_SUCCESS) {
                    valueStr = "ERR_CONV";
                }
                else {
                    if (cType == SQL_C_CHAR) {
                        valueStr = reinterpret_cast<char*>(buffer.data());
                    }
                    else if (cType == SQL_C_SBIGINT) {
                        SQLBIGINT intVal = *reinterpret_cast<SQLBIGINT*>(buffer.data());
                        valueStr = std::to_string(intVal);
                    }
                    else if (cType == SQL_C_DOUBLE) {
                        double doubleVal = *reinterpret_cast<double*>(buffer.data());
                        valueStr = std::to_string(doubleVal);
                    }
                    else if (cType == SQL_C_BIT) {
                        valueStr = (*buffer.data() != 0) ? "TRUE" : "FALSE";
                    }
                    else if (cType == SQL_C_DATE) {
                        SQL_DATE_STRUCT* date = reinterpret_cast<SQL_DATE_STRUCT*>(buffer.data());
                        char dateStr[20];
                        snprintf(dateStr, sizeof(dateStr), "%04d-%02d-%02d", 
                                date->year, date->month, date->day);
                        valueStr = dateStr;
                    }
                    else if (cType == SQL_C_TIME) {
                        SQL_TIME_STRUCT* time = reinterpret_cast<SQL_TIME_STRUCT*>(buffer.data());
                        char timeStr[15];
                        snprintf(timeStr, sizeof(timeStr), "%02d:%02d:%02d", 
                                time->hour, time->minute, time->second);
                        valueStr = timeStr;
                    }
                    else if (cType == SQL_C_TIMESTAMP) {
                        SQL_TIMESTAMP_STRUCT* ts = reinterpret_cast<SQL_TIMESTAMP_STRUCT*>(buffer.data());
                        char tsStr[30];
                        snprintf(tsStr, sizeof(tsStr), "%04d-%02d-%02d %02d:%02d:%02d.%06d", 
                                ts->year, ts->month, ts->day,
                                ts->hour, ts->minute, ts->second,
                                ts->fraction / 1000); 
                        valueStr = tsStr;
                    }
                    else {
                        valueStr = "UNKNOWN_TYPE";
                    }
                    
                    if (isCharacterType && ret == SQL_SUCCESS_WITH_INFO) {
                        SQLLEN actualSize = 0;
                        SQLGetDiagField(SQL_HANDLE_STMT, hStmt, 0, SQL_DIAG_COLUMN_SIZE, 
                                       &actualSize, SQL_IS_INTEGER, NULL);
                        
                        if (indicator > 0 && static_cast<size_t>(indicator) > bufferSize - 1) {
                            valueStr += "...";  
                        }
                    }
                    
                }
                
                row.push_back(valueStr);
            }
            
            tableRows.push_back(row);
        }
        
        if (!tableRows.empty()) {
            PrintSimpleTable(columnNames, tableRows);
        }
        
        SQLFreeHandle(SQL_HANDLE_STMT, hStmt);
    }
    catch (const std::exception& ex) {
        std::cerr << "Exception: " << ex.what() << std::endl;
        if (hStmt != SQL_NULL_HSTMT) {
            SQLFreeHandle(SQL_HANDLE_STMT, hStmt);
        }
        throw;
    }
    catch (...) {
        std::cerr << "Unknown exception occurred" << std::endl;
        if (hStmt != SQL_NULL_HSTMT) {
            SQLFreeHandle(SQL_HANDLE_STMT, hStmt);
        }
        throw;
    }
}

/// Executes non-query SQL statements (such as CREATE DATABASE, CREATE TABLE, INSERT, etc.)
void Execute(SQLHDBC hDbc, const std::string& command) {
    SQLHSTMT hStmt = SQL_NULL_HSTMT;
    SQLRETURN ret;
    
    try {
        // Allocate statement handle
        ret = SQLAllocHandle(SQL_HANDLE_STMT, hDbc, &hStmt);
        CheckOdbcError(ret, SQL_HANDLE_DBC, hDbc, "SQLAllocHandle(SQL_HANDLE_STMT)");
        
        // Execute command
        ret = SQLExecDirect(hStmt, (SQLCHAR*)command.c_str(), SQL_NTS);
        if (ret != SQL_SUCCESS && ret != SQL_SUCCESS_WITH_INFO) {
            CheckOdbcError(ret, SQL_HANDLE_STMT, hStmt, "SQLExecDirect");
        }
        
        // Free statement handle
        SQLFreeHandle(SQL_HANDLE_STMT, hStmt);
    }
    catch (...) {
        if (hStmt != SQL_NULL_HSTMT) {
            SQLFreeHandle(SQL_HANDLE_STMT, hStmt);
        }
        throw;
    }
}

int main() {
    SQLHENV hEnv = SQL_NULL_HENV;
    SQLHDBC hDbc = SQL_NULL_HDBC;
    SQLRETURN ret;
    
    try {
        std::cout << "Start" << std::endl;
        
        // 1. Initialize ODBC environment
        ret = SQLAllocHandle(SQL_HANDLE_ENV, SQL_NULL_HANDLE, &hEnv);
        CheckOdbcError(ret, SQL_HANDLE_ENV, hEnv, "SQLAllocHandle(SQL_HANDLE_ENV)");
        
        ret = SQLSetEnvAttr(hEnv, SQL_ATTR_ODBC_VERSION, (SQLPOINTER)SQL_OV_ODBC3, 0);
        CheckOdbcError(ret, SQL_HANDLE_ENV, hEnv, "SQLSetEnvAttr");
        
        // 2. Establish connection
        ret = SQLAllocHandle(SQL_HANDLE_DBC, hEnv, &hDbc);
        CheckOdbcError(ret, SQL_HANDLE_ENV, hEnv, "SQLAllocHandle(SQL_HANDLE_DBC)");
        
        // Connection string
        std::string dsn = "Apache IoTDB DSN";
        std::string user = "root";
        std::string password = "root";
        std::string server = "127.0.0.1";
        std::string database = "test";
        
        std::string connectionString = "DSN=" + dsn + ";Server=" + server + 
                                     ";UID=" + user + ";PWD=" + password + 
                                     ";Database=" + database + ";loglevel=4";
        std::cout << "Using connection string: " << connectionString << std::endl;
        
        SQLCHAR outConnStr[1024];
        SQLSMALLINT outConnStrLen;
        
        ret = SQLDriverConnect(hDbc, NULL, 
                              (SQLCHAR*)connectionString.c_str(), SQL_NTS,
                              outConnStr, sizeof(outConnStr),
                              &outConnStrLen, SQL_DRIVER_COMPLETE);
        
        if (ret != SQL_SUCCESS && ret != SQL_SUCCESS_WITH_INFO) {
            std::cerr << "Login failed" << std::endl;
            CheckOdbcError(ret, SQL_HANDLE_DBC, hDbc, "SQLDriverConnect");
            return 1;
        }
        
        // Get driver name
        SQLCHAR driverName[256];
        SQLSMALLINT nameLength;
        ret = SQLGetInfo(hDbc, SQL_DRIVER_NAME, driverName, sizeof(driverName), &nameLength);
        CheckOdbcError(ret, SQL_HANDLE_DBC, hDbc, "SQLGetInfo");
        
        std::cout << "Successfully opened connection. database name = " << driverName << std::endl;
        
        // 3. Execute operations
        Execute(hDbc, "CREATE DATABASE IF NOT EXISTS test");
        Execute(hDbc, "use test");
        std::cout << "use test Execute complete. Begin to setup fulltable." << std::endl;

        // Create fulltable table and insert test data
        Execute(hDbc, "CREATE TABLE IF NOT EXISTS fullTable (time TIMESTAMP TIME, bool_col BOOLEAN FIELD, int32_col INT32 FIELD, int64_col INT64 FIELD, float_col FLOAT FIELD, double_col DOUBLE FIELD, text_col TEXT FIELD, string_col STRING FIELD, blob_col BLOB FIELD, timestamp_col TIMESTAMP FIELD, date_col DATE FIELD) WITH (TTL=315360000000)");
        const char* insertStatements[] = {
            "INSERT INTO fulltable VALUES (1735689600000, true, 100, 10000000000, 36.5, 128.689, 'Device operating normally', 'DeviceA-Room1', '0x506C616E7444617461', 1735689600000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735689660000, false, 101, 10000000001, 36.6, 128.789, 'Device operating normally', 'DeviceA-Room1', '0x506C616E7444617461', 1735689660000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735689720000, true, 102, 10000000002, 36.7, 128.889, 'Device operating normally', 'DeviceA-Room1', '0x506C616E7444617461', 1735689720000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735689780000, false, 103, 10000000003, 36.8, 128.989, 'Device temperature high alarm', 'DeviceA-Room1', '0x506C616E7444617462', 1735689780000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735689840000, true, 104, 10000000004, 36.9, 129.089, 'Device status returned to normal', 'DeviceA-Room1', '0x506C616E7444617461', 1735689840000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735689900000, false, 105, 10000000005, 37.0, 129.189, 'Device operating normally', 'DeviceB-Room2', '0x506C616E7444617463', 1735689900000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735689960000, true, 106, 10000000006, 37.1, 129.289, 'Device operating normally', 'DeviceB-Room2', '0x506C616E7444617463', 1735689960000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690020000, false, 107, 10000000007, 37.2, 129.389, 'Device humidity low alarm', 'DeviceB-Room2', '0x506C616E7444617464', 1735690020000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690080000, true, 108, 10000000008, 37.3, 129.489, 'Device status returned to normal', 'DeviceB-Room2', '0x506C616E7444617463', 1735690080000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690140000, false, 109, 10000000009, 37.4, 129.589, 'Device operating normally', 'DeviceC-Room3', '0x506C616E7444617465', 1735690140000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690200000, true, 110, 10000000010, 37.5, 129.689, 'Device operating normally', 'DeviceC-Room3', '0x506C616E7444617465', 1735690200000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690260000, false, 111, 10000000011, 37.6, 129.789, 'Device voltage unstable alarm', 'DeviceC-Room3', '0x506C616E7444617466', 1735690260000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690320000, true, 112, 10000000012, 37.7, 129.889, 'Device status returned to normal', 'DeviceC-Room3', '0x506C616E7444617465', 1735690320000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690380000, false, 113, 10000000013, 37.8, 129.989, 'Device operating normally', 'DeviceD-Room4', '0x506C616E7444617467', 1735690380000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690440000, true, 114, 10000000014, 37.9, 130.089, 'Device operating normally', 'DeviceD-Room4', '0x506C616E7444617467', 1735690440000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690500000, false, 115, 10000000015, 38.0, 130.189, 'Device operating normally', 'DeviceD-Room4', '0x506C616E7444617467', 1735690500000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690560000, true, 116, 10000000016, 38.1, 130.289, 'Device signal interrupted alarm', 'DeviceD-Room4', '0x506C616E7444617468', 1735690560000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690620000, false, 117, 10000000017, 38.2, 130.389, 'Device operating normally', 'DeviceE-Room5', '0x506C616E7444617469', 1735690620000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690680000, true, 118, 10000000018, 38.3, 130.489, 'Device operating normally', 'DeviceE-Room5', '0x506C616E7444617469', 1735690680000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690740000, false, 119, 10000000019, 38.4, 130.589, 'Device operating normally', 'DeviceE-Room5', '0x506C616E7444617469', 1735690740000, '2026-01-04')",
            "INSERT INTO fulltable VALUES (1735690790000, false, 119, 10000000019, 38.4, 130.589, 'Device operating normally', 'DeviceE-Room5', '0x506C616E7444617469', 1735690740000, '2026-01-04')"
        };
        for (const char* sql : insertStatements) {
            Execute(hDbc, sql);
        }
        std::cout << "fulltable setup complete. Begin to query." << std::endl;
        Query(hDbc);
        std::cout << "Query ok" << std::endl;

        // 4. Clean up resources
        SQLDisconnect(hDbc);
        SQLFreeHandle(SQL_HANDLE_DBC, hDbc);
        SQLFreeHandle(SQL_HANDLE_ENV, hEnv);
        
        return 0;
    }
    catch (...) {
        // Exception cleanup
        if (hDbc != SQL_NULL_HDBC) {
            SQLDisconnect(hDbc);
            SQLFreeHandle(SQL_HANDLE_DBC, hDbc);
        }
        if (hEnv != SQL_NULL_HENV) {
            SQLFreeHandle(SQL_HANDLE_ENV, hEnv);
        }
        
        std::cerr << "Unexpected error!" << std::endl;
        return 1;
    }
}
```

### 4.4 PowerBI Example
1. Open PowerBI Desktop and create a new project.
2. Click "Home" → "Get Data" → "More..." → "ODBC" → Click the "Connect" button.
3. Data Source Selection: In the pop-up window, select "Data Source Name (DSN)" and choose `Apache IoTDB DSN` from the dropdown.
4. Advanced Configuration:
    * Click "Advanced options" and fill in the configuration in the "Connection string" input box (example):
      ```Plain
      server=127.0.0.1;port=6667;database=test;isTableModel=true;loglevel=4
      ```
    * Notes:
        * The `dsn` item is optional; filling it in or not does not affect the connection.
        * `loglevel` ranges from 0-4: Level 0 (ERROR) has the least logs, Level 4 (TRACE) has the most detailed logs; set as needed.
        * `server`/`database`/`dsn`/`loglevel` are case-insensitive (e.g., can be written as `Server/DATABASE`).
        * If relevant information is configured in the DSN, you do not need to fill in any configuration information; the Driver Manager will automatically use the configuration filled in the DSN.
5. Authentication: Enter the username (default `root`) and password (default `root`), then click "Connect".
6. Data Loading: Select the table to be called in the interface (e.g., fulltable/table1) , and then click "Load" to view the data.

### 4.5 Excel Example
1. Open Excel and create a blank workbook.
2. Click the "Data" tab → "From Other Sources" → "From Data Connection Wizard".
3. Data Source Selection: Select "ODBC DSN" → Next → Select `Apache IoTDB DSN` → Next.
4. Connection Configuration:
   * The input process for connection string, username, and password is exactly the same as in PowerBI. Reference format for connection string:
      ```Plain
      server=127.0.0.1;port=6667;database=test;isTableModel=true;loglevel=4 
      ```
   * If relevant information is configured in the DSN, you do not need to fill in any configuration information; the Driver Manager will automatically use the configuration filled in the DSN.
5. Table Selection: Choose the database and table you wish to access (e.g., fulltable), then click Next.
6. Save Connection: Customize settings for the data connection file name, connection description, etc., then click "Finish".
7. Import Data: Select the location to import the data into the worksheet (e.g., cell A1 of "Existing Worksheet"), click "OK" to complete data loading.