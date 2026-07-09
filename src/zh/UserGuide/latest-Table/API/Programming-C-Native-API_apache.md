# C 原生接口

## **1. 概述**

C 原生接口（SessionC）是对 C++ Session SDK 的 C 语言封装。使用方式与 C++ 驱动一致，仅需额外包含头文件 `SessionC.h`；编译、链接、运行时部署与 C++ 驱动共用同一套 `iotdb_session` 共享库。

Thrift 与 Boost 已封装进 `iotdb_session`，**应用侧接入时无需单独安装** Thrift 或 Boost 头文件/库。

> 注意：该功能自 V2.0.10 版本起支持
> 

## **2. 安装**

### **2.1 方式一：使用预编译 SDK 包（推荐）**

CI 会按平台/工具链发布 zip，文件名形如 `iotdb-session-cpp-<version>-<classifier>.zip`。解压后目录结构如下：

```Plain Text
iotdb-session-cpp-<version>-<classifier>/
├── include/
│   ├── SessionC.h          # C 原生接口头文件
│   ├── Session.h           # C++ 接口头文件
│   └── ...
├── lib/
│   ├── libiotdb_session.so       # Linux
│   ├── libiotdb_session.dylib      # macOS
│   └── iotdb_session.dll + .lib    # Windows
├── cmake/iotdb-session-config.cmake
├── pkgconfig/iotdb-session.pc
└── examples/                       # 含 table_example.c
```

按目标环境选择 classifier：

|目标环境|classifier 后缀|
|---|---|
|Linux x86_64，glibc >= 2.28|`linux-x86_64-glibc2.28`|
|Linux aarch64，glibc >= 2.28|`linux-aarch64-glibc2.28`|
|macOS x86_64|`macos-x86_64`|
|macOS arm64|`macos-aarch64`|
|Windows + Visual Studio 2017|`windows-x86_64-msvc14.1`|
|Windows + Visual Studio 2019|`windows-x86_64-msvc14.2`|
|Windows + Visual Studio 2022|`windows-x86_64-msvc14.3`|
|Windows + Visual Studio 2026|`windows-x86_64-msvc14.4`|

**注意：请勿使用高版本客户端连接低版本服务。**

#### **2.1.1 C 程序编译示例**

Linux / macOS：

```Bash
gcc -std=c11 table_example.c \
  -I"$IOTDB_SESSION_HOME/include" \
  -L"$IOTDB_SESSION_HOME/lib" \
  -liotdb_session -pthread \
  -Wl,-rpath,"$IOTDB_SESSION_HOME/lib" \
  -o table_example
```

Windows + MSVC：

在 **x64 本机工具命令提示**（或先执行 `vcvars64.bat` 初始化环境）中编译：

```Plain Text
set IOTDB_SESSION_HOME=C:\path\to\iotdb-session-cpp-<version>-<classifier>
cd /d %IOTDB_SESSION_HOME%\examples
cl /TC /std:c11 table_example.c /I "%IOTDB_SESSION_HOME%\include" ^
  /link /LIBPATH:"%IOTDB_SESSION_HOME%\lib" iotdb_session.lib
copy /Y "%IOTDB_SESSION_HOME%\lib\iotdb_session.dll" .
```

运行时请将 `libiotdb_session.so` / `.dylib` / `.dll` 与可执行文件放在同一目录，或配置平台对应的动态库搜索路径。

#### **2.1.2 编译 SDK 包内 examples**

在**解压后的 SDK 包根目录**执行（要求 `examples/` 与 `include/`、`lib/` 同级）：

```Bash
cd iotdb-session-cpp-<version>-<classifier>
cmake -S examples -B examples-build -DCMAKE_BUILD_TYPE=Release
cmake --build examples-build
```

Windows + Visual Studio：

```Plain Text
cd iotdb-session-cpp-<version>-<classifier>
cmake -S examples -B examples-build -G "Visual Studio 17 2022" -A x64
cmake --build examples-build --config Release
```

若库安装在其他路径（例如源码 CMake 安装目录 `iotdb-client/client-cpp/target/install`），请显式指定 `IOTDB_SDK_ROOT`（该目录下须包含 `include/` 与 `lib/`）：

```Bash
cmake -S iotdb-client/client-cpp/examples -B examples-build -DCMAKE_BUILD_TYPE=Release \
  -DIOTDB_SDK_ROOT=iotdb-client/client-cpp/target/install
cmake --build examples-build
```

Windows 示例：

```Plain Text
cmake -S iotdb-client\client-cpp\examples -B examples-build -G "Visual Studio 17 2022" -A x64 ^
  -DIOTDB_SDK_ROOT=D:\iotdb\iotdb-client\client-cpp\target\install
cmake --build examples-build --config Release --target table_example
```

### **2.2 方式二：从源码构建**

#### **2.2.1 安装构建依赖（仅源码构建需要）**

- **macOS**

```Shell
brew install bison boost openssl
```

- **Ubuntu 16.04+ 或其他 Debian 系列**

```Shell
sudo apt-get update
sudo apt-get install gcc g++ bison flex libboost-all-dev libssl-dev cmake
```

- **CentOS 7.7+/Fedora/Rocky Linux 或其他 Red-hat 系列**

```Shell
sudo yum update
sudo yum install gcc gcc-c++ boost-devel bison flex openssl-devel cmake
```

- **Windows**

1. 安装 MS Visual Studio（推荐 2019+），勾选 C/C++ IDE 与编译器（支持 CMake）。

2. 安装 [CMake](https://cmake.org/download/)。

3. 安装 [Win_Flex_Bison](https://sourceforge.net/projects/winflexbison/)，将可执行文件重命名为 `flex.exe` 和 `bison.exe` 并加入 PATH。

4. 安装 Boost（可选，CMake 也可自动获取）与 [OpenSSL](http://slproweb.com/products/Win32OpenSSL.html)。

    CMake 构建会从源码编译 Thrift 0.23；SSL 默认开启，找不到系统 OpenSSL 时会回退到从源码构建。

#### **2.2.2 执行编译**

从 git 克隆源代码：

```Shell
git clone https://github.com/apache/iotdb.git
cd iotdb
```

如需使用某个发布版本，请切换分支（如 2.0.6）：

```Shell
git checkout rc/2.0.6
```

在 IoTDB 根目录执行 Maven 编译（推荐）：

```Shell
# Linux / macOS：构建 SDK 并打包
./mvnw -P with-cpp -pl iotdb-client/client-cpp -am -DskipTests package

# Windows（Visual Studio 2022 示例）
.\mvnw.cmd -P with-cpp -pl iotdb-client/client-cpp -am -DskipTests package
```

若 Windows 上 Boost 未加入 PATH，可追加参数，例如：

```Plain Text
-Dboost.include.dir="C:\boost_1_88_0"
```

也可直接使用 CMake：

```Shell
cmake -S iotdb-client/client-cpp -B build
cmake --build build --target install
```

Linux 发版包在 `manylinux_2_28` 容器中构建，**目标机器需要 glibc 2.28 或更新版本**。当前构建**不再**使用 `-Diotdb-tools-thrift.version=0.14.1.1-gcc4-SNAPSHOT` 等旧参数。

带集成测试的完整验证：

```Shell
./mvnw clean verify -P with-cpp -pl iotdb-client/client-cpp -am
```

### **2.3 编译产物**

编译成功后，C 接口相关文件位置：

- C 接口头文件（源码）：`iotdb-client/client-cpp/src/include/SessionC.h`

- C 接口头文件（安装/SDK 包）：`include/SessionC.h`

- 库文件：

    - 源码构建：`iotdb-client/client-cpp/target/install/lib/`

    - Maven 打包：`iotdb-client/client-cpp/target/iotdb-session-cpp-<version>-<classifier>.zip`

    - Linux：`lib/libiotdb_session.so`

    - Windows：`lib/iotdb_session.dll` / `lib/iotdb_session.lib`

- 示例源码：

    - 树模型：`iotdb-client/client-cpp/examples/table_example.c`

    - 表模型：`iotdb-client/client-cpp/examples/table_example.c`

- 集成测试：

    - 树模型：`iotdb-client/client-cpp/test/cpp/sessionCIT.cpp`

    - 表模型：`iotdb-client/client-cpp/test/cpp/sessionCRelationalIT.cpp`

## **3. 基本接口说明**

**说明：C 驱动使用方式与 C++ 驱动完全一致，仅需额外包含头文件 `SessionC.h`，编译、运行、系统依赖与 C++ 驱动通用。**

### **3.1 统一约定**

#### **3.1.1** **状态码与错误信息**

- `TsStatus`：`TS_OK（0）` 表示成功；失败为非 0。

- 预定义错误码：

    - `TS_ERR_CONNECTION（-1）`

    - `TS_ERR_EXECUTION（-2）`

    - `TS_ERR_INVALID_PARAM（-3）`

    - `TS_ERR_NULL_PTR（-4）`

    - `TS_ERR_UNKNOWN（-99）`

- 实现也可能返回其他负值，须结合 `ts_get_last_error()` 判断。

- Session C++ 大量用异常报错，不返回统一状态码；C API 统一返回整型 `TsStatus`，细粒度错误信息通过 `ts_get_last_error()` 获取。

```C
const char* ts_get_last_error(void);
```

返回当前线程上一次**失败**的 C API 调用的错误信息；返回指针在同线程下一次任意 C API 调用之前有效。

#### **3.1.2 内存与句柄规则**

- 所有 `char* buf + int bufLen` 输出参数，均由调用方分配内存。

- `CTableSession*`、`CTablet*`、`CSessionDataSet*`、`CRowRecord*` 均为不透明指针，创建成功后由调用方按各接口约定释放。

### **3.2 枚举与常量**

- **TSDataType_C（数据类型）**

|枚举值|含义|
|---|---|
|`TS_TYPE_BOOLEAN`|布尔|
|`TS_TYPE_INT32`|32 位整数|
|`TS_TYPE_INT64`|64 位整数|
|`TS_TYPE_FLOAT`|单精度浮点|
|`TS_TYPE_DOUBLE`|双精度浮点|
|`TS_TYPE_TEXT`|文本|
|`TS_TYPE_TIMESTAMP`|时间戳|
|`TS_TYPE_DATE`|日期|
|`TS_TYPE_BLOB`|二进制大对象|
|`TS_TYPE_STRING`|字符串|
|`TS_TYPE_INVALID`|非法参数/错误路径（非服务端类型）|

- **TSEncoding_C（编码）**

`TS_ENCODING_PLAIN`、`TS_ENCODING_DICTIONARY`、`TS_ENCODING_RLE`、`TS_ENCODING_DIFF`、`TS_ENCODING_TS_2DIFF`、`TS_ENCODING_BITMAP`、`TS_ENCODING_GORILLA_V1`、`TS_ENCODING_REGULAR`、`TS_ENCODING_GORILLA`、`TS_ENCODING_ZIGZAG`、`TS_ENCODING_FREQ`

- **TSCompressionType_C（压缩）**

`TS_COMPRESSION_UNCOMPRESSED`、`TS_COMPRESSION_SNAPPY`、`TS_COMPRESSION_GZIP`、`TS_COMPRESSION_LZO`、`TS_COMPRESSION_SDT`、`TS_COMPRESSION_PAA`、`TS_COMPRESSION_PLA`、`TS_COMPRESSION_LZ4`、`TS_COMPRESSION_ZSTD`、`TS_COMPRESSION_LZMA2`

- **TSColumnCategory_C（表模型列类别）**

|枚举值|含义|
|---|---|
|`TS_COL_TAG`|TAG 列|
|`TS_COL_FIELD`|FIELD 列|
|`TS_COL_ATTRIBUTE`|ATTRIBUTE 列|

### **3.3 句柄、状态码与常量**

|名称|C 定义|含义|生命周期责任|
|---|---|---|---|
|`CTableSession*`|`typedef struct CTableSession_ CTableSession;`|表模型会话|`ts_table_session_new` / `ts_table_session_new_multi_node` 成功后由调用方 `ts_table_session_close`（若已 open）再 `ts_table_session_destroy`|
|`CTablet*`|`typedef struct CTablet_ CTablet;`（不透明）|Tablet 批量写入（树/表共用）|`ts_tablet_new` / `ts_tablet_new_with_category` 成功后由调用方 `ts_tablet_destroy`|
|`CSessionDataSet*`|`typedef struct CSessionDataSet_ CSessionDataSet;`（不透明）|查询结果集（树/表共用）|查询接口成功得到 `*dataSet` 后由调用方 `ts_dataset_destroy`|
|`CRowRecord*`|`typedef struct CRowRecord_ CRowRecord;`（不透明）|当前行|`ts_dataset_next` 返回非空时由调用方 `ts_row_record_destroy`|
|`TsStatus`|`typedef int64_t TsStatus;`|接口执行结果码|`TS_OK` 为 0；失败为非 0|
|`ts_get_last_error`|`const char* ts_get_last_error(void);`|当前线程最后一次**失败**的 C API 的错误信息<br>|返回指针有效至同线程下一次 C API 调用前|

### **3.4 公共 Tablet 接口**

#### **3.4.1 创建与销毁**

|接口签名|函数功能|入参定义|返回定义|成功判定|失败判定|资源责任|
|---|---|---|---|---|---|---|
|`CTablet* ts_tablet_new(const char* deviceId, int columnCount, const char* const* columnNames, const TSDataType_C* dataTypes, int maxRowNumber);`|创建 Tablet 句柄|deviceId：设备或表名；columnNames / dataTypes：列名与类型数组；maxRowNumber：最大行数|`CTablet*`|返回非空句柄|返回空句柄|调用方 `ts_tablet_destroy`|
|`CTablet* ts_tablet_new_with_category(const char* deviceId, int columnCount, const char* const* columnNames, const TSDataType_C* dataTypes, const TSColumnCategory_C* columnCategories, int maxRowNumber);`|创建带列类别（TAG/FIELD/ATTRIBUTE）的 Tablet|columnCategories：`TS_COL_TAG` / `TS_COL_FIELD` / `TS_COL_ATTRIBUTE`|`CTablet*`|返回非空句柄|返回空句柄|调用方 `ts_tablet_destroy`|
|`void ts_tablet_destroy(CTablet* tablet);`|销毁 Tablet 句柄|tablet：待释放句柄|无|调用后句柄不可再用|—|释放 tablet|

#### **3.4.2 数据填充与状态控制**

|接口签名|函数功能|返回|成功判定|备注|
|---|---|---|---|---|
|`int ts_tablet_get_row_count(CTablet* tablet);`|查询 Tablet 当前有效行数|int|行数 ≥ 0|只读查询|
|`TsStatus ts_tablet_set_row_count(CTablet* tablet, int rowCount);`|设置 Tablet 有效行数|TsStatus|`TS_OK`|写入前需设置有效行数|
|`TsStatus ts_tablet_add_timestamp(CTablet* tablet, int rowIndex, int64_t timestamp);`|为指定行写入时间戳|TsStatus|`TS_OK`||
|`TsStatus ts_tablet_add_value_bool(CTablet* tablet, int colIndex, int rowIndex, bool value);`|写入布尔值|TsStatus|`TS_OK`||
|`TsStatus ts_tablet_add_value_int32(CTablet* tablet, int colIndex, int rowIndex, int32_t value);`|写入 int32|TsStatus|`TS_OK`||
|`TsStatus ts_tablet_add_value_int64(CTablet* tablet, int colIndex, int rowIndex, int64_t value);`|写入 int64|TsStatus|`TS_OK`||
|`TsStatus ts_tablet_add_value_float(CTablet* tablet, int colIndex, int rowIndex, float value);`|写入 float|TsStatus|`TS_OK`||
|`TsStatus ts_tablet_add_value_double(CTablet* tablet, int colIndex, int rowIndex, double value);`|写入 double|TsStatus|`TS_OK`||
|`TsStatus ts_tablet_add_value_string(CTablet* tablet, int colIndex, int rowIndex, const char* value);`|写入字符串|TsStatus|`TS_OK`|字符串内存归调用方管理|
|`void ts_tablet_reset(CTablet* tablet);`|重置 Tablet 内部状态以便复用|void|—|不释放对象，仅清状态|

> **说明**：当前 SessionC 实现**不提供** `ts_tablet_add_value_object`；OBJECT 类型写入请使用 C++ Session API。
> 
> 

### **3.5 公共 DataSet 接口**

#### **3.5.1 迭代控制与元信息**

|接口签名|函数功能|返回|备注|
|---|---|---|---|
|`void ts_dataset_set_fetch_size(CSessionDataSet* dataSet, int fetchSize);`|设置结果集拉取批大小|无||
|`bool ts_dataset_has_next(CSessionDataSet* dataSet);`|判断是否可能还有下一行|bool|失败可查 `ts_get_last_error()`|
|`CRowRecord* ts_dataset_next(CSessionDataSet* dataSet);`|获取下一行行记录句柄|行句柄指针|非 NULL 为有效行；NULL 表示结束或失败|
|`int ts_dataset_get_column_count(CSessionDataSet* dataSet);`|获取结果集列数|int||
|`const char* ts_dataset_get_column_name(CSessionDataSet* dataSet, int index);`|按索引获取列名|字符串指针|无 buf/bufLen 输出|
|`const char* ts_dataset_get_column_type(CSessionDataSet* dataSet, int index);`|按索引获取列类型名|类型名字符串指针|无 buf/bufLen 输出|
|`void ts_dataset_destroy(CSessionDataSet* dataSet);`|释放查询结果集句柄|无|每次 `ts_dataset_next` 返回非空 `CRowRecord*` 后须及时 `ts_row_record_destroy`|

#### **3.5.2 取值**

|接口签名|函数功能|返回|备注|
|---|---|---|---|
|`void ts_row_record_destroy(CRowRecord* record);`|释放行记录句柄|无||
|`int64_t ts_row_record_get_timestamp(CRowRecord* record);`|读取当前行时间戳|int64_t|时间戳不在 DataSet 上取|
|`int ts_row_record_get_field_count(CRowRecord* record);`|读取当前行字段数|int||
|`bool ts_row_record_is_null(CRowRecord* record, int index);`|判断指定列是否空值|bool||
|`bool ts_row_record_get_bool(CRowRecord* record, int index);`|按列索引读取布尔值|bool||
|`int32_t ts_row_record_get_int32(CRowRecord* record, int index);`|按列索引读取 int32|int32_t||
|`int64_t ts_row_record_get_int64(CRowRecord* record, int index);`|按列索引读取 int64|int64_t||
|`float ts_row_record_get_float(CRowRecord* record, int index);`|按列索引读取 float|float||
|`double ts_row_record_get_double(CRowRecord* record, int index);`|按列索引读取 double|double||
|`const char* ts_row_record_get_string(CRowRecord* record, int index);`|读取文本/二进制列字节视图|const char\*|可能含 `\0`；非 buf + bufLen 模式|
|`int32_t ts_row_record_get_date_int32(CRowRecord* record, int index);`|读取 DATE 列，返回 YYYYMMDD 整数|int32_t|字段为 null、越界或非 DATE 时返回 0|
|`size_t ts_row_record_get_string_byte_length(CRowRecord* record, int index);`|读取字符串/二进制字段字节长度|size_t|TEXT/BLOB/STRING 等；勿用 strlen|
|`TSDataType_C ts_row_record_get_data_type(CRowRecord* record, int index);`|按列索引读取数据类型枚举|枚举|非法参数/越界返回 `TS_TYPE_INVALID`|

### **3.6 表模型 CTableSession 接口矩阵**

#### **3.6.1 生命周期**

|接口签名|函数功能|返回|资源责任|
|---|---|---|---|
|`CTableSession* ts_table_session_new(const char* host, int rpcPort, const char* username, const char* password, const char* database);`|创建表模型会话|`CTableSession*`|若已 open，先 `ts_table_session_close`，再 `ts_table_session_destroy`|
|`CTableSession* ts_table_session_new_multi_node(const char* const* nodeUrls, int urlCount, const char* username, const char* password, const char* database);`|创建表模型会话（多节点 URL）|`CTableSession*`|同上|
|`TsStatus ts_table_session_open(CTableSession* session);`|打开表模型 RPC 连接|TsStatus|失败查 `ts_get_last_error()`|
|`TsStatus ts_table_session_close(CTableSession* session);`|关闭表模型连接|TsStatus|仍需 `ts_table_session_destroy`|
|`void ts_table_session_destroy(CTableSession* session);`|销毁表模型会话句柄|无|释放 session|

> **说明**：`database` 参数为默认数据库名；传空字符串 `""` 表示不预设，后续通过 `USE` SQL 切换。
> 
> 

#### **3.6.2 写入与查询**

|接口签名|函数功能|返回|资源责任|
|---|---|---|---|
|`TsStatus ts_table_session_insert(CTableSession* session, CTablet* tablet);`|表模型下按 Tablet 写入数据|TsStatus|tablet 不转移所有权|
|`TsStatus ts_table_session_execute_query(CTableSession* session, const char* sql, CSessionDataSet** dataSet);`|表模型下执行查询 SQL|TsStatus|`*dataSet` 调用方 `ts_dataset_destroy`|
|`TsStatus ts_table_session_execute_query_with_timeout(CTableSession* session, const char* sql, int64_t timeoutInMs, CSessionDataSet** dataSet);`|表模型下带超时查询|TsStatus|同上|
|`TsStatus ts_table_session_execute_non_query(CTableSession* session, const char* sql);`|表模型下执行非查询 SQL|TsStatus|无新增句柄|

## **4. 示例代码**

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
  fprintf(stderr, "[table_example] %s failed: %s\n", ctx, ts_get_last_error());
  if (s) {
    ts_table_session_close(s);
    ts_table_session_destroy(s);
  }
  exit(1);
}

int main(void) {
  /* 最后一个参数为默认数据库名；传 "" 表示不预设，后续通过 USE SQL 切换。 */
  CTableSession* session = ts_table_session_new(HOST, PORT, USER, PASS, "");
  if (!session) {
    fprintf(stderr, "[table_example] ts_table_session_new returned NULL: %s\n",
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

  snprintf(sql, sizeof(sql), "USE \"%s\"", DB_NAME);
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
    fprintf(stderr, "[table_example] dataSet is NULL\n");
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
    printf("[table_example] row %d: time=%lld\n", count,
           (long long)ts_row_record_get_timestamp(record));
    ts_row_record_destroy(record);
    count++;
  }
  ts_dataset_destroy(dataSet);
  printf("[table_example] SELECT returned %d row(s).\n", count);

  snprintf(sql, sizeof(sql), "DROP DATABASE IF EXISTS %s", DB_NAME);
  (void)ts_table_session_execute_non_query(session, sql);

  ts_table_session_close(session);
  ts_table_session_destroy(session);
  return 0;
}
```
