# C Native API

## **1. Overview**

The C Native API (SessionC) is a C language wrapper for the C++ Session SDK. It is used in the same way as the C++ driver. You only need to include the additional header file `SessionC.h`. Compilation, linking, and runtime deployment share the same `iotdb_session` shared library as the C++ driver.

Thrift and Boost are already packaged into `iotdb_session`. **Applications do not need to install** Thrift or Boost headers/libraries separately.

> Note: This feature is supported since V2.0.10.
> 

## **2. Installation**

### **2.1 Option 1: Use the precompiled SDK package (recommended)**

CI publishes zip packages by platform/toolchain. The file name is in the form `iotdb-session-cpp-<version>-<classifier>.zip`. After extraction, the directory structure is as follows:

```Plain Text
iotdb-session-cpp-<version>-<classifier>/
├── include/
│   ├── SessionC.h          # C Native API header file
│   ├── Session.h           # C++ API header file
│   └── ...
├── lib/
│   ├── libiotdb_session.so       # Linux
│   ├── libiotdb_session.dylib      # macOS
│   └── iotdb_session.dll + .lib    # Windows
├── cmake/iotdb-session-config.cmake
├── pkgconfig/iotdb-session.pc
└── examples/                       # Includes table_example.c
```

Select the classifier according to the target environment:

|Target environment|classifier suffix|
|---|---|
|Linux x86_64, glibc >= 2.28|`linux-x86_64-glibc2.28`|
|Linux aarch64, glibc >= 2.28|`linux-aarch64-glibc2.28`|
|macOS x86_64|`macos-x86_64`|
|macOS arm64|`macos-aarch64`|
|Windows + Visual Studio 2017|`windows-x86_64-msvc14.1`|
|Windows + Visual Studio 2019|`windows-x86_64-msvc14.2`|
|Windows + Visual Studio 2022|`windows-x86_64-msvc14.3`|
|Windows + Visual Studio 2026|`windows-x86_64-msvc14.4`|

**Note: Do not use a higher-version client to connect to a lower-version server.**

#### **2.1.1 C program compilation example**

Linux / macOS:

```Bash
gcc -std=c11 table_example.c \
  -I"$IOTDB_SESSION_HOME/include" \
  -L"$IOTDB_SESSION_HOME/lib" \
  -liotdb_session -pthread \
  -Wl,-rpath,"$IOTDB_SESSION_HOME/lib" \
  -o table_example
```

Windows + MSVC:

Compile in the **x64 Native Tools Command Prompt** (or run `vcvars64.bat` first to initialize the environment):

```Plain Text
set IOTDB_SESSION_HOME=C:\path\to\iotdb-session-cpp-<version>-<classifier>
cd /d %IOTDB_SESSION_HOME%\examples
cl /TC /std:c11 table_example.c /I "%IOTDB_SESSION_HOME%\include" ^
  /link /LIBPATH:"%IOTDB_SESSION_HOME%\lib" iotdb_session.lib
copy /Y "%IOTDB_SESSION_HOME%\lib\iotdb_session.dll" .
```

At runtime, place `libiotdb_session.so` / `.dylib` / `.dll` in the same directory as the executable, or configure the corresponding dynamic library search path for your platform.

#### **2.1.2 Compile examples in the SDK package**

Run the following commands in the **root directory of the extracted SDK package**. The `examples/` directory must be at the same level as `include/` and `lib/`.

```Bash
cd iotdb-session-cpp-<version>-<classifier>
cmake -S examples -B examples-build -DCMAKE_BUILD_TYPE=Release
cmake --build examples-build
```

Windows + Visual Studio:

```Plain Text
cd iotdb-session-cpp-<version>-<classifier>
cmake -S examples -B examples-build -G "Visual Studio 17 2022" -A x64
cmake --build examples-build --config Release
```

If the library is installed in another path, such as the source CMake installation directory `iotdb-client/client-cpp/target/install`, explicitly specify `IOTDB_SDK_ROOT`. This directory must contain `include/` and `lib/`.

```Bash
cmake -S iotdb-client/client-cpp/examples -B examples-build -DCMAKE_BUILD_TYPE=Release \
  -DIOTDB_SDK_ROOT=iotdb-client/client-cpp/target/install
cmake --build examples-build
```

Windows example:

```Plain Text
cmake -S iotdb-client\client-cpp\examples -B examples-build -G "Visual Studio 17 2022" -A x64 ^
  -DIOTDB_SDK_ROOT=D:\iotdb\iotdb-client\client-cpp\target\install
cmake --build examples-build --config Release --target table_example
```

### **2.2 Option 2: Build from source**

#### **2.2.1 Install build dependencies (required only for source builds)**

- **macOS**

```Shell
brew install bison boost openssl
```

- **Ubuntu 16.04+ or other Debian distributions**

```Shell
sudo apt-get update
sudo apt-get install gcc g++ bison flex libboost-all-dev libssl-dev cmake
```

- **CentOS 7.7+/Fedora/Rocky Linux or other Red Hat distributions**

```Shell
sudo yum update
sudo yum install gcc gcc-c++ boost-devel bison flex openssl-devel cmake
```

- **Windows**

1. Install MS Visual Studio (2019+ recommended), and select the C/C++ IDE and compiler components with CMake support.

2. Install [CMake](https://cmake.org/download/).

3. Install [Win_Flex_Bison](https://sourceforge.net/projects/winflexbison/), rename the executables to `flex.exe` and `bison.exe`, and add them to PATH.

4. Install Boost (optional, CMake can also fetch it automatically) and [OpenSSL](http://slproweb.com/products/Win32OpenSSL.html).

    The CMake build compiles Thrift 0.23 from source. SSL is enabled by default. If system OpenSSL cannot be found, the build falls back to building OpenSSL from source.

#### **2.2.2 Build**

Clone the source code from git:

```Shell
git clone https://github.com/apache/iotdb.git
cd iotdb
```

To use a specific release version, switch to the corresponding branch, such as 2.0.6:

```Shell
git checkout rc/2.0.6
```

Run the Maven build in the IoTDB root directory (recommended):

```Shell
# Linux / macOS: build and package the SDK
./mvnw -P with-cpp -pl iotdb-client/client-cpp -am -DskipTests package

# Windows (Visual Studio 2022 example)
.\mvnw.cmd -P with-cpp -pl iotdb-client/client-cpp -am -DskipTests package
```

If Boost is not added to PATH on Windows, append a parameter such as:

```Plain Text
-Dboost.include.dir="C:\boost_1_88_0"
```

You can also use CMake directly:

```Shell
cmake -S iotdb-client/client-cpp -B build
cmake --build build --target install
```

Linux release packages are built in the `manylinux_2_28` container. **The target machine requires glibc 2.28 or later**. The current build **no longer** uses old parameters such as `-Diotdb-tools-thrift.version=0.14.1.1-gcc4-SNAPSHOT`.

Full verification with integration tests:

```Shell
./mvnw clean verify -P with-cpp -pl iotdb-client/client-cpp -am
```

### **2.3 Build artifacts**

After a successful build, C API related files are located as follows:

- C API header file (source): `iotdb-client/client-cpp/src/include/SessionC.h`

- C API header file (installation/SDK package): `include/SessionC.h`

- Library files:

    - Source build: `iotdb-client/client-cpp/target/install/lib/`

    - Maven package: `iotdb-client/client-cpp/target/iotdb-session-cpp-<version>-<classifier>.zip`

    - Linux: `lib/libiotdb_session.so`

    - Windows: `lib/iotdb_session.dll` / `lib/iotdb_session.lib`

- Example source code:

    - Tree model: `iotdb-client/client-cpp/examples/table_example.c`

    - Table model: `iotdb-client/client-cpp/examples/table_example.c`

- Integration tests:

    - Tree model: `iotdb-client/client-cpp/test/cpp/sessionCIT.cpp`

    - Table model: `iotdb-client/client-cpp/test/cpp/sessionCRelationalIT.cpp`

## **3. Basic API description**

**Description: The C driver is used in the same way as the C++ driver. You only need to include the additional header file `SessionC.h`. Compilation, runtime behavior, and system dependencies are shared with the C++ driver.**

### **3.1 Common conventions**

#### **3.1.1** **Status codes and error messages**

- `TsStatus`: `TS_OK (0)` indicates success. Any non-zero value indicates failure.

- Predefined error codes:

    - `TS_ERR_CONNECTION (-1)`

    - `TS_ERR_EXECUTION (-2)`

    - `TS_ERR_INVALID_PARAM (-3)`

    - `TS_ERR_NULL_PTR (-4)`

    - `TS_ERR_UNKNOWN (-99)`

- The implementation may also return other negative values, which must be interpreted together with `ts_get_last_error()`.

- The Session C++ API reports many errors through exceptions and does not return a unified status code. The C API uniformly returns the integer type `TsStatus`, and fine-grained error information can be obtained through `ts_get_last_error()`.

```C
const char* ts_get_last_error(void);
```

Returns the error message of the last **failed** C API call in the current thread. The returned pointer is valid until the next C API call in the same thread.

#### **3.1.2 Memory and handle rules**

- All `char* buf + int bufLen` output parameters must be allocated by the caller.

- `CTableSession*`, `CTablet*`, `CSessionDataSet*`, and `CRowRecord*` are opaque pointers. After successful creation, the caller must release them according to the conventions of each API.

### **3.2 Enumerations and constants**

- **TSDataType_C (data type)**

|Enumeration value|Meaning|
|---|---|
|`TS_TYPE_BOOLEAN`|Boolean|
|`TS_TYPE_INT32`|32-bit integer|
|`TS_TYPE_INT64`|64-bit integer|
|`TS_TYPE_FLOAT`|Single-precision floating point|
|`TS_TYPE_DOUBLE`|Double-precision floating point|
|`TS_TYPE_TEXT`|Text|
|`TS_TYPE_TIMESTAMP`|Timestamp|
|`TS_TYPE_DATE`|Date|
|`TS_TYPE_BLOB`|Binary large object|
|`TS_TYPE_STRING`|String|
|`TS_TYPE_INVALID`|Invalid parameter/error path (not a server-side type)|

- **TSEncoding_C (encoding)**

`TS_ENCODING_PLAIN`, `TS_ENCODING_DICTIONARY`, `TS_ENCODING_RLE`, `TS_ENCODING_DIFF`, `TS_ENCODING_TS_2DIFF`, `TS_ENCODING_BITMAP`, `TS_ENCODING_GORILLA_V1`, `TS_ENCODING_REGULAR`, `TS_ENCODING_GORILLA`, `TS_ENCODING_ZIGZAG`, `TS_ENCODING_FREQ`

- **TSCompressionType_C (compression)**

`TS_COMPRESSION_UNCOMPRESSED`, `TS_COMPRESSION_SNAPPY`, `TS_COMPRESSION_GZIP`, `TS_COMPRESSION_LZO`, `TS_COMPRESSION_SDT`, `TS_COMPRESSION_PAA`, `TS_COMPRESSION_PLA`, `TS_COMPRESSION_LZ4`, `TS_COMPRESSION_ZSTD`, `TS_COMPRESSION_LZMA2`

- **TSColumnCategory_C (table model column category)**

|Enumeration value|Meaning|
|---|---|
|`TS_COL_TAG`|TAG column|
|`TS_COL_FIELD`|FIELD column|
|`TS_COL_ATTRIBUTE`|ATTRIBUTE column|

### **3.3 Handles, status codes, and constants**

|Name|C definition|Meaning|Lifecycle responsibility|
|---|---|---|---|
|`CTableSession*`|`typedef struct CTableSession_ CTableSession;`|Table model session|After `ts_table_session_new` / `ts_table_session_new_multi_node` succeeds, the caller calls `ts_table_session_close` if it has been opened, and then `ts_table_session_destroy`|
|`CTablet*`|`typedef struct CTablet_ CTablet;` (opaque)|Tablet batch writing, shared by tree and table models|After `ts_tablet_new` / `ts_tablet_new_with_category` succeeds, the caller calls `ts_tablet_destroy`|
|`CSessionDataSet*`|`typedef struct CSessionDataSet_ CSessionDataSet;` (opaque)|Query result set, shared by tree and table models|After a query API successfully returns `*dataSet`, the caller calls `ts_dataset_destroy`|
|`CRowRecord*`|`typedef struct CRowRecord_ CRowRecord;` (opaque)|Current row|When `ts_dataset_next` returns a non-null value, the caller calls `ts_row_record_destroy`|
|`TsStatus`|`typedef int64_t TsStatus;`|API execution result code|`TS_OK` is 0. Any non-zero value indicates failure|
|`ts_get_last_error`|`const char* ts_get_last_error(void);`|Error message of the last **failed** C API call in the current thread<br>|The returned pointer is valid until the next C API call in the same thread|

### **3.4 Common Tablet APIs**

#### **3.4.1 Creation and destruction**

|API signature|Function|Input parameters|Return value|Success condition|Failure condition|Resource responsibility|
|---|---|---|---|---|---|---|
|`CTablet* ts_tablet_new(const char* deviceId, int columnCount, const char* const* columnNames, const TSDataType_C* dataTypes, int maxRowNumber);`|Create a Tablet handle|deviceId: device or table name; columnNames / dataTypes: arrays of column names and types; maxRowNumber: maximum number of rows|`CTablet*`|Returns a non-null handle|Returns a null handle|Caller calls `ts_tablet_destroy`|
|`CTablet* ts_tablet_new_with_category(const char* deviceId, int columnCount, const char* const* columnNames, const TSDataType_C* dataTypes, const TSColumnCategory_C* columnCategories, int maxRowNumber);`|Create a Tablet with column categories (TAG/FIELD/ATTRIBUTE)|columnCategories: `TS_COL_TAG` / `TS_COL_FIELD` / `TS_COL_ATTRIBUTE`|`CTablet*`|Returns a non-null handle|Returns a null handle|Caller calls `ts_tablet_destroy`|
|`void ts_tablet_destroy(CTablet* tablet);`|Destroy a Tablet handle|tablet: handle to release|None|The handle must not be used after the call|-|Releases tablet|

#### **3.4.2 Data filling and state control**

|API signature|Function|Return value|Success condition|Remarks|
|---|---|---|---|---|
|`int ts_tablet_get_row_count(CTablet* tablet);`|Query the current valid row count of the Tablet|int|Row count >= 0|Read-only query|
|`TsStatus ts_tablet_set_row_count(CTablet* tablet, int rowCount);`|Set the valid row count of the Tablet|TsStatus|`TS_OK`|The valid row count must be set before writing|
|`TsStatus ts_tablet_add_timestamp(CTablet* tablet, int rowIndex, int64_t timestamp);`|Write a timestamp for the specified row|TsStatus|`TS_OK`||
|`TsStatus ts_tablet_add_value_bool(CTablet* tablet, int colIndex, int rowIndex, bool value);`|Write a Boolean value|TsStatus|`TS_OK`||
|`TsStatus ts_tablet_add_value_int32(CTablet* tablet, int colIndex, int rowIndex, int32_t value);`|Write an int32 value|TsStatus|`TS_OK`||
|`TsStatus ts_tablet_add_value_int64(CTablet* tablet, int colIndex, int rowIndex, int64_t value);`|Write an int64 value|TsStatus|`TS_OK`||
|`TsStatus ts_tablet_add_value_float(CTablet* tablet, int colIndex, int rowIndex, float value);`|Write a float value|TsStatus|`TS_OK`||
|`TsStatus ts_tablet_add_value_double(CTablet* tablet, int colIndex, int rowIndex, double value);`|Write a double value|TsStatus|`TS_OK`||
|`TsStatus ts_tablet_add_value_string(CTablet* tablet, int colIndex, int rowIndex, const char* value);`|Write a string|TsStatus|`TS_OK`|String memory is managed by the caller|
|`void ts_tablet_reset(CTablet* tablet);`|Reset the internal state of the Tablet for reuse|void|-|Does not release the object. Only clears the state|

> **Description**: The current SessionC implementation **does not provide** `ts_tablet_add_value_object`. Use the C++ Session API to write OBJECT values.
> 
> 

### **3.5 Common DataSet APIs**

#### **3.5.1 Iteration control and metadata**

|API signature|Function|Return value|Remarks|
|---|---|---|---|
|`void ts_dataset_set_fetch_size(CSessionDataSet* dataSet, int fetchSize);`|Set the fetch batch size of the result set|None||
|`bool ts_dataset_has_next(CSessionDataSet* dataSet);`|Determine whether there may be another row|bool|On failure, check `ts_get_last_error()`|
|`CRowRecord* ts_dataset_next(CSessionDataSet* dataSet);`|Get the next row record handle|Row handle pointer|Non-NULL indicates a valid row. NULL indicates end or failure|
|`int ts_dataset_get_column_count(CSessionDataSet* dataSet);`|Get the number of columns in the result set|int||
|`const char* ts_dataset_get_column_name(CSessionDataSet* dataSet, int index);`|Get a column name by index|String pointer|No buf/bufLen output|
|`const char* ts_dataset_get_column_type(CSessionDataSet* dataSet, int index);`|Get a column type name by index|Type name string pointer|No buf/bufLen output|
|`void ts_dataset_destroy(CSessionDataSet* dataSet);`|Release a query result set handle|None|After each non-null `CRowRecord*` returned by `ts_dataset_next`, call `ts_row_record_destroy` in time|

#### **3.5.2 Value access**

|API signature|Function|Return value|Remarks|
|---|---|---|---|
|`void ts_row_record_destroy(CRowRecord* record);`|Release a row record handle|None||
|`int64_t ts_row_record_get_timestamp(CRowRecord* record);`|Read the timestamp of the current row|int64_t|The timestamp is not read from DataSet|
|`int ts_row_record_get_field_count(CRowRecord* record);`|Read the number of fields in the current row|int||
|`bool ts_row_record_is_null(CRowRecord* record, int index);`|Determine whether the specified column is null|bool||
|`bool ts_row_record_get_bool(CRowRecord* record, int index);`|Read a Boolean value by column index|bool||
|`int32_t ts_row_record_get_int32(CRowRecord* record, int index);`|Read an int32 value by column index|int32_t||
|`int64_t ts_row_record_get_int64(CRowRecord* record, int index);`|Read an int64 value by column index|int64_t||
|`float ts_row_record_get_float(CRowRecord* record, int index);`|Read a float value by column index|float||
|`double ts_row_record_get_double(CRowRecord* record, int index);`|Read a double value by column index|double||
|`const char* ts_row_record_get_string(CRowRecord* record, int index);`|Read the byte view of a text/binary column|const char.|May contain `.`. Not a buf . bufLen pattern|
|`int32_t ts_row_record_get_date_int32(CRowRecord* record, int index);`|Read a DATE column and return an integer in YYYYMMDD format|int32_t|Returns 0 if the field is null, out of bounds, or not DATE|
|`size_t ts_row_record_get_string_byte_length(CRowRecord* record, int index);`|Read the byte length of a string/binary field|size_t|TEXT/BLOB/STRING, etc. Do not use strlen|
|`TSDataType_C ts_row_record_get_data_type(CRowRecord* record, int index);`|Read the data type enumeration by column index|Enumeration|Returns `TS_TYPE_INVALID` for invalid parameters or out-of-bounds indexes|

### **3.6 Table model CTableSession API matrix**

#### **3.6.1 Lifecycle**

|API signature|Function|Return value|Resource responsibility|
|---|---|---|---|
|`CTableSession* ts_table_session_new(const char* host, int rpcPort, const char* username, const char* password, const char* database);`|Create a table model session|`CTableSession*`|If opened, call `ts_table_session_close` first, and then `ts_table_session_destroy`|
|`CTableSession* ts_table_session_new_multi_node(const char* const* nodeUrls, int urlCount, const char* username, const char* password, const char* database);`|Create a table model session (multi-node URL)|`CTableSession*`|Same as above|
|`TsStatus ts_table_session_open(CTableSession* session);`|Open a table model RPC connection|TsStatus|On failure, check `ts_get_last_error()`|
|`TsStatus ts_table_session_close(CTableSession* session);`|Close a table model connection|TsStatus|`ts_table_session_destroy` is still required|
|`void ts_table_session_destroy(CTableSession* session);`|Destroy a table model session handle|None|Releases session|

> **Description**: The `database` parameter is the default database name. Pass the empty string `""` to leave it unset, and switch later through the `USE` SQL statement.
> 
> 

#### **3.6.2 Writing and querying**

|API signature|Function|Return value|Resource responsibility|
|---|---|---|---|
|`TsStatus ts_table_session_insert(CTableSession* session, CTablet* tablet);`|Write data by Tablet in the table model|TsStatus|Ownership of tablet is not transferred|
|`TsStatus ts_table_session_execute_query(CTableSession* session, const char* sql, CSessionDataSet** dataSet);`|Execute query SQL in the table model|TsStatus|Caller calls `ts_dataset_destroy` for `*dataSet`|
|`TsStatus ts_table_session_execute_query_with_timeout(CTableSession* session, const char* sql, int64_t timeoutInMs, CSessionDataSet** dataSet);`|Execute a query with timeout in the table model|TsStatus|Same as above|
|`TsStatus ts_table_session_execute_non_query(CTableSession* session, const char* sql);`|Execute non-query SQL in the table model|TsStatus|No new handle|

## **4. Sample code**

```C
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "SessionC.h"

#define HOST "127.0.0.1"
#define PORT 6667
#define USER "root"
#define PASS "root"

#define DB_NAME "cdemo_db"
#define TABLE_NAME "cdemo_t0"

static void fail(const char* ctx, CTableSession* s) {
  fprintf(stderr, "[table_example] %s failed: %s.", ctx, ts_get_last_error());
  if (s) {
    ts_table_session_close(s);
    ts_table_session_destroy(s);
  }
  exit(1);
}

int main(void) {
  /* The last parameter is the default database name. Pass "" to leave it unset and switch later through USE SQL. */
  CTableSession* session = ts_table_session_new(HOST, PORT, USER, PASS, "");
  if (!session) {
    fprintf(stderr, "[table_example] ts_table_session_new returned NULL: %s.",
            ts_get_last_error());
    return 1;
  }
  if (ts_table_session_open(session) != TS_OK) {
    fail("ts_table_session_open", session);
  }

  char sql[512];
  snprintf(sql, sizeof(sql), "DROP DATABASE IF EXISTS %s", DB_NAME);
  (void)ts_table_session_execute_non_query(session, sql);

  snprintf(sql, sizeof(sql), "CREATE DATABASE %s", DB_NAME);
  if (ts_table_session_execute_non_query(session, sql) != TS_OK) {
    fail("CREATE DATABASE", session);
  }

  snprintf(sql, sizeof(sql), "USE .%s.", DB_NAME);
  if (ts_table_session_execute_non_query(session, sql) != TS_OK) {
    fail("USE DATABASE", session);
  }

  const char* ddl = "CREATE TABLE " TABLE_NAME " ("
                    "tag1 string tag,"
                    "attr1 string attribute,"
                    "m1 double field)";
  if (ts_table_session_execute_non_query(session, ddl) != TS_OK) {
    fail("CREATE TABLE", session);
  }

  const char* columnNames[] = {"tag1", "attr1", "m1"};
  TSDataType_C dataTypes[] = {TS_TYPE_STRING, TS_TYPE_STRING, TS_TYPE_DOUBLE};
  TSColumnCategory_C colCategories[] = {TS_COL_TAG, TS_COL_ATTRIBUTE, TS_COL_FIELD};

  CTablet* tablet =
      ts_tablet_new_with_category(TABLE_NAME, 3, columnNames, dataTypes, colCategories, 100);
  if (!tablet) {
    fail("ts_tablet_new_with_category", session);
  }

  int i;
  for (i = 0; i < 5; i++) {
    if (ts_tablet_add_timestamp(tablet, i, (int64_t)i) != TS_OK) {
      ts_tablet_destroy(tablet);
      fail("ts_tablet_add_timestamp", session);
    }
    if (ts_tablet_add_value_string(tablet, 0, i, "device_A") != TS_OK) {
      ts_tablet_destroy(tablet);
      fail("ts_tablet_add_value_string tag", session);
    }
    if (ts_tablet_add_value_string(tablet, 1, i, "attr_val") != TS_OK) {
      ts_tablet_destroy(tablet);
      fail("ts_tablet_add_value_string attr", session);
    }
    if (ts_tablet_add_value_double(tablet, 2, i, (double)i * 1.5) != TS_OK) {
      ts_tablet_destroy(tablet);
      fail("ts_tablet_add_value_double", session);
    }
  }
  if (ts_tablet_set_row_count(tablet, 5) != TS_OK) {
    ts_tablet_destroy(tablet);
    fail("ts_tablet_set_row_count", session);
  }

  if (ts_table_session_insert(session, tablet) != TS_OK) {
    ts_tablet_destroy(tablet);
    fail("ts_table_session_insert", session);
  }
  ts_tablet_destroy(tablet);

  CSessionDataSet* dataSet = NULL;
  if (ts_table_session_execute_query(session, "SELECT * FROM " TABLE_NAME, &dataSet) != TS_OK) {
    fail("ts_table_session_execute_query", session);
  }
  if (!dataSet) {
    fprintf(stderr, "[table_example] dataSet is NULL.");
    ts_table_session_close(session);
    ts_table_session_destroy(session);
    return 1;
  }
  ts_dataset_set_fetch_size(dataSet, 1024);

  int count = 0;
  while (ts_dataset_has_next(dataSet)) {
    CRowRecord* record = ts_dataset_next(dataSet);
    if (!record) {
      break;
    }
    printf("[table_example] row %d: time=%lld.", count,
           (long long)ts_row_record_get_timestamp(record));
    ts_row_record_destroy(record);
    count++;
  }
  ts_dataset_destroy(dataSet);
  printf("[table_example] SELECT returned %d row(s)..", count);

  snprintf(sql, sizeof(sql), "DROP DATABASE IF EXISTS %s", DB_NAME);
  (void)ts_table_session_execute_non_query(session, sql);

  ts_table_session_close(session);
  ts_table_session_destroy(session);
  return 0;
}
```
