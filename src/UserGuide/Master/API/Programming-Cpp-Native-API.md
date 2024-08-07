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

# C++ Native API

## Dependencies
- Java 8+
- Maven 3.5+
- Flex
- Bison 2.7+
- Boost 1.56+
- OpenSSL 1.0+
- GCC 5.5.0+


## Installation From Source Code

### Install CPP Dependencies

- **MAC**

    1. Install Bison ：Bison 2.3 is preinstalled on OSX, but this version is too low.

       When building Thrift with Bison 2.3, the following error would pop out:
       ```invalid directive: '%code'```

       For such case, please update `Bison`:
       ```shell
       brew install bison
       brew link bison --force
       ```
       
       Then, you need to tell the OS where the new bison is.
    
          For Bash users:
          ```shell
          echo 'export PATH="/usr/local/opt/bison/bin:$PATH"' >> ~/.bash_profile
          ```

          For zsh users:
          ```shell
          echo 'export PATH="/usr/local/opt/bison/bin:$PATH"' >> ~/.zshrc
          ```

    2. Install Boost ：Please make sure a relative new version of Boost is ready on your machine.
       If no Boost available, install the latest version of Boost:
          ```shell
          brew install boost
          brew link boost
          ```

    3. OpenSSL ：Make sure the Openssl libraries has been install on your Mac. The default Openssl include file search path is "/usr/local/opt/openssl/include".

       If Openssl header files can not be found when building Thrift, please add option`-Dopenssl.include.dir=""`.


- **Ubuntu 20**

  To install all dependencies, run:

    ```shell
    sudo apt-get install gcc-10 g++-10 libstdc++-10-dev bison flex libboost-all-dev libssl-dev zlib1g-dev
    ```


- **CentOS 7.x**

  Some packages can be installed using Yum:

    ```shell
    sudo yum install bison flex openssl-devel
    ```

  The version of gcc and boost installed by yum is too low, therefore you should compile or download these binary packages by yourself.


- **Windows**

    1. Building environment
        * Install `MS Visual Studio`(recommend 2019 version): remember to install Visual Studio C/C++ IDE and compiler(supporting CMake, Clang, MinGW).
        * Download and install [CMake](https://cmake.org/download/) .

    2. Download and install `Flex` & `Bison`
        * Download [Win_Flex_Bison](https://sourceforge.net/projects/winflexbison/) .
        * After downloaded, please rename the executables to `flex.exe` and `bison.exe` and add them to "PATH" environment variables.

    3. Install `Boost`
        * Download [Boost](https://www.boost.org/users/download/) .
        * Then build `Boost` by executing bootstrap.bat and b2.exe.

    4. Install `OpenSSL`
        * Download and install [OpenSSL](http://slproweb.com/products/Win32OpenSSL.html) .


### Compile

You can download the source code from:
```shell
git clone https://github.com/apache/iotdb.git
```

The default dev branch is the master branch, If you want to use a released version (eg. `rel/0.13`):
```shell
git checkout rel/0.13
```

Under the root path of iotdb:

- Mac & Linux
    ```shell
    mvn package -P compile-cpp -pl example/client-cpp-example -am -DskipTest
    ```

- Windows
    ```shell
    mvn package -P compile-cpp -pl iotdb-client/client-cpp,iotdb-core/datanode,example/client-cpp-example -am -Dcmake.generator="your cmake generator" -Dboost.include.dir=${your boost header folder} -Dboost.library.dir=${your boost lib (stage) folder} -DskipTests
    ```
    - When building client-cpp project, use `-Dcmake.generator=""` option to specify a Cmake generator. E.g. `-Dcmake.generator="Visual Studio 16 2019"` (`cmake --help` shows a long list of supported Cmake generators.)
    - To help CMake find your Boost libraries on windows, you should set `-DboostIncludeDir="C:\Program Files (x86)\boost_1_78_0" -DboostLibraryDir="C:\Program Files (x86)\boost_1_78_0\stage\lib"` to your mvn build command.
    ``

If the compilation finishes successfully, the packaged zip file will be placed under `client-cpp/target/client-cpp-1.3.0-SNAPSHOT-cpp-${os}.zip`

### Compile Q&A

Q: What are the requirements for the environment on Linux?

A：
- Recommend `glibc-2.33` or above version. In some scenarios, it is known that `glibc-2.31` cannot be compiled successfully. Please refer to [document]（ https://www.gnu.org/software/gnulib/manual/html_node/_005f_005flibc_005fsingle_005fthreaded.html ）.
- Recommend `gcc 10` or above.
- You can also modify the`<iotdb-tools-thrift.version>`in the `pom.xml` file to `0.14.1.1-old-glibc-SNAPSHOT`, which is a thrift compiled using the old version `glibc`.

Q：How to deal with compile error`undefined reference to '_libc_sinle_thread'`?

A：
- Delete the test-related compilation and running operations in the pom.xml of C++client. The modified pom is as follows:

```
      
<?xml version="1.0" encoding="UTF-8"?>
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
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.apache.iotdb</groupId>
        <artifactId>iotdb-client</artifactId>
        <version>1.3.1-SNAPSHOT</version>
    </parent>
    <artifactId>client-cpp</artifactId>
    <packaging>pom</packaging>
    <name>IoTDB: Client: Client for CPP</name>
    <description>C++ client</description>
    <!-- TODO: The tests don't run, if distribution has not been built locally and fails without reasoning -->
    <properties>
        <catch2.url>https://alioss.timecho.com/upload/catch.hpp</catch2.url>
        <cmake.build.type>Release</cmake.build.type>
        <!-- Default value of cmake root -->
        <cmake.root.dir>${project.build.directory}/dependency/cmake/</cmake.root.dir>
        <thrift.exec.absolute.path>${project.build.directory}/thrift/bin/${thrift.executable}</thrift.exec.absolute.path>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.apache.iotdb</groupId>
            <artifactId>iotdb-thrift-commons</artifactId>
            <version>1.3.1-SNAPSHOT</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <!-- Build and do session integration test -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-dependency-plugin</artifactId>
                <executions>
                    <execution>
                        <id>get-thrift</id>
                        <goals>
                            <goal>unpack</goal>
                        </goals>
                        <phase>generate-sources</phase>
                        <configuration>
                            <artifactItems>
                                <artifactItem>
                                    <groupId>org.apache.iotdb.tools</groupId>
                                    <artifactId>iotdb-tools-thrift</artifactId>
                                    <version>${iotdb-tools-thrift.version}</version>
                                    <classifier>${os.classifier}</classifier>
                                    <type>zip</type>
                                    <overWrite>true</overWrite>
                                    <outputDirectory>${project.build.directory}/thrift</outputDirectory>
                                </artifactItem>
                            </artifactItems>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
            <plugin>
                <groupId>com.googlecode.maven-download-plugin</groupId>
                <artifactId>download-maven-plugin</artifactId>
                <executions>
                    <execution>
                        <id>get-catch2</id>
                        <goals>
                            <goal>wget</goal>
                        </goals>
                        <phase>generate-resources</phase>
                        <configuration>
                            <url>${catch2.url}</url>
                            <unpack>false</unpack>
                            <outputDirectory>${project.build.directory}/build/test/catch2</outputDirectory>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
            <plugin>
                <groupId>com.coderplus.maven.plugins</groupId>
                <artifactId>copy-rename-maven-plugin</artifactId>
                <executions>
                    <!-- TODO: Do this differently using the artifact downloader -->
                    <execution>
                        <id>copy-protocol-thrift-source</id>
                        <goals>
                            <goal>copy</goal>
                        </goals>
                        <configuration>
                            <fileSets>
                                <fileSet>
                                    <sourceFile>../../iotdb-protocol/thrift-datanode/src/main/thrift/client.thrift</sourceFile>
                                    <destinationFile>${project.build.directory}/protocols/client.thrift</destinationFile>
                                </fileSet>
                                <fileSet>
                                    <sourceFile>../../iotdb-protocol/thrift-commons/src/main/thrift/common.thrift</sourceFile>
                                    <destinationFile>${project.build.directory}/protocols/common.thrift</destinationFile>
                                </fileSet>
                            </fileSets>
                        </configuration>
                    </execution>
                    <!-- TODO: Do this differently using the maven-resources-plugin -->
                    <execution>
                        <!-- Copy source file and CmakeLists.txt into target directory -->
                        <id>copy-cmakelist-file</id>
                        <goals>
                            <goal>copy</goal>
                        </goals>
                        <phase>compile</phase>
                        <configuration>
                            <fileSets>
                                <fileSet>
                                    <sourceFile>${project.basedir}/src/main/CMakeLists.txt</sourceFile>
                                    <destinationFile>${project.build.directory}/build/main/CMakeLists.txt</destinationFile>
                                </fileSet>
                                <fileSet>
                                    <sourceFile>${project.basedir}/src/main/Session.h</sourceFile>
                                    <destinationFile>${project.build.directory}/build/main/generated-sources-cpp/Session.h</destinationFile>
                                </fileSet>
                                <fileSet>
                                    <sourceFile>${project.basedir}/src/main/Session.cpp</sourceFile>
                                    <destinationFile>${project.build.directory}/build/main/generated-sources-cpp/Session.cpp</destinationFile>
                                </fileSet>
                            </fileSets>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
            <plugin>
                <groupId>org.apache.thrift.tools</groupId>
                <artifactId>maven-thrift-plugin</artifactId>
                <executions>
                    <execution>
                        <id>generate-thrift-sources-cpp</id>
                        <goals>
                            <goal>compile</goal>
                        </goals>
                        <!-- Move from generate-sources to generate-resources to avoid double executions -->
                        <phase>generate-resources</phase>
                        <configuration>
                            <generator>cpp:no_skeleton</generator>
                            <thriftExecutable>${thrift.exec.absolute.path}</thriftExecutable>
                            <thriftSourceRoot>${project.build.directory}/protocols</thriftSourceRoot>
                            <outputDirectory>${project.build.directory}/build/main/generated-sources-cpp</outputDirectory>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
            <plugin>
                <groupId>com.googlecode.cmake-maven-project</groupId>
                <artifactId>cmake-maven-plugin</artifactId>
                <executions>
                    <!-- Uses a CMake generator to generate the build using the build tool of choice -->
                    <execution>
                        <id>cmake-generate</id>
                        <goals>
                            <goal>generate</goal>
                        </goals>
                        <phase>compile</phase>
                        <configuration>
                            <generator>${cmake.generator}</generator>
                            <sourcePath>${project.build.directory}/build/main</sourcePath>
                            <targetPath>${project.build.directory}/build/main</targetPath>
                            <options>
                                <option>-DBOOST_INCLUDEDIR=${boost.include.dir}</option>
                            </options>
                        </configuration>
                    </execution>
                    <!-- Generate Cmake build directory to compile testing program -->
                    <!-- Actually executes the build -->
                    <execution>
                        <id>cmake-compile</id>
                        <goals>
                            <goal>compile</goal>
                        </goals>
                        <phase>compile</phase>
                        <configuration>
                            <config>${cmake.build.type}</config>
                            <!-- The directory where the "generate" step generated the build configuration -->
                            <projectDirectory>${project.build.directory}/build/main</projectDirectory>
                        </configuration>
                    </execution>
                    <!-- Actually executes the testing compilation -->
                </executions>
            </plugin>
            <!--Package all C++ header files and client library-->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-assembly-plugin</artifactId>
                <executions>
                    <execution>
                        <id>package-client-cpp</id>
                        <goals>
                            <goal>single</goal>
                        </goals>
                        <phase>package</phase>
                        <configuration>
                            <finalName>${project.artifactId}-${project.version}</finalName>
                            <descriptors>
                                <descriptor>src/assembly/client-cpp.xml</descriptor>
                            </descriptors>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
    <profiles>
        <profile>
            <id>.os-unix</id>
            <activation>
                <os>
                    <name>Linux</name>
                    <family>unix</family>
                    <arch>!aarch64</arch>
                </os>
            </activation>
            <properties>
                <iotdb.start.script>start-standalone.sh</iotdb.start.script>
                <iotdb.stop.script>stop-standalone.sh</iotdb.stop.script>
                <os.suffix>linux</os.suffix>
            </properties>
        </profile>
        <profile>
            <id>.os-unix-arm</id>
            <activation>
                <os>
                    <name>Linux</name>
                    <family>unix</family>
                    <arch>aarch64</arch>
                </os>
            </activation>
            <properties>
                <iotdb.start.script>start-standalone.sh</iotdb.start.script>
                <iotdb.stop.script>stop-standalone.sh</iotdb.stop.script>
                <os.suffix>linux</os.suffix>
            </properties>
        </profile>
        <profile>
            <id>.os-mac</id>
            <activation>
                <os>
                    <family>mac</family>
                    <arch>!aarch64</arch>
                </os>
            </activation>
            <properties>
                <iotdb.start.script>start-standalone.sh</iotdb.start.script>
                <iotdb.stop.script>stop-standalone.sh</iotdb.stop.script>
                <os.suffix>mac</os.suffix>
            </properties>
        </profile>
        <profile>
            <id>.os-mac-arm</id>
            <activation>
                <os>
                    <family>mac</family>
                    <arch>aarch64</arch>
                </os>
            </activation>
            <properties>
                <iotdb.start.script>start-standalone.sh</iotdb.start.script>
                <iotdb.stop.script>stop-standalone.sh</iotdb.stop.script>
                <os.suffix>mac</os.suffix>
            </properties>
        </profile>
        <profile>
            <id>.os-windows</id>
            <activation>
                <os>
                    <family>windows</family>
                </os>
            </activation>
            <properties>
                <iotdb.start.script>start-standalone.bat</iotdb.start.script>
                <iotdb.stop.script>stop-standalone.bat</iotdb.stop.script>
                <os.suffix>win</os.suffix>
            </properties>
        </profile>
    </profiles>
</project>
```
- Execute  `mvn clean package -P with-cpp -pl iotdb-client/client-cpp -am -DskipTests`，successfully build.



## Native APIs

Here we show the commonly used interfaces and their parameters in the Native API:

### Initialization

- Open a Session
```cpp
void open(); 
```

- Open a session, with a parameter to specify whether to enable RPC compression
```cpp
void open(bool enableRPCCompression); 
```
Notice: this RPC compression status of client must comply with that of IoTDB server

- Close a Session
```cpp
void close(); 
```

### Data Definition Interface (DDL)

#### Database Management

- CREATE DATABASE
```cpp
void setStorageGroup(const std::string &storageGroupId);
```

- Delete one or several databases
```cpp
void deleteStorageGroup(const std::string &storageGroup);
void deleteStorageGroups(const std::vector<std::string> &storageGroups);
```

#### Timeseries Management

- Create one or multiple timeseries
```cpp
void createTimeseries(const std::string &path, TSDataType::TSDataType dataType, TSEncoding::TSEncoding encoding,
                          CompressionType::CompressionType compressor);
                          
void createMultiTimeseries(const std::vector<std::string> &paths,
                           const std::vector<TSDataType::TSDataType> &dataTypes,
                           const std::vector<TSEncoding::TSEncoding> &encodings,
                           const std::vector<CompressionType::CompressionType> &compressors,
                           std::vector<std::map<std::string, std::string>> *propsList,
                           std::vector<std::map<std::string, std::string>> *tagsList,
                           std::vector<std::map<std::string, std::string>> *attributesList,
                           std::vector<std::string> *measurementAliasList);
```

- Create aligned timeseries
```cpp
void createAlignedTimeseries(const std::string &deviceId,
                             const std::vector<std::string> &measurements,
                             const std::vector<TSDataType::TSDataType> &dataTypes,
                             const std::vector<TSEncoding::TSEncoding> &encodings,
                             const std::vector<CompressionType::CompressionType> &compressors);
```

- Delete one or several timeseries
```cpp
void deleteTimeseries(const std::string &path);
void deleteTimeseries(const std::vector<std::string> &paths);
```

- Check whether the specific timeseries exists.
```cpp
bool checkTimeseriesExists(const std::string &path);
```

#### Schema Template

- Create a schema template
```cpp
void createSchemaTemplate(const Template &templ);
```

- Set the schema template named `templateName` at path `prefixPath`.
```cpp
void setSchemaTemplate(const std::string &template_name, const std::string &prefix_path);
```

- Unset the schema template
```cpp
void unsetSchemaTemplate(const std::string &prefix_path, const std::string &template_name);
```

- After measurement template created, you can edit the template with belowed APIs.
```cpp
// Add aligned measurements to a template
void addAlignedMeasurementsInTemplate(const std::string &template_name,
                                      const std::vector<std::string> &measurements,
                                      const std::vector<TSDataType::TSDataType> &dataTypes,
                                      const std::vector<TSEncoding::TSEncoding> &encodings,
                                      const std::vector<CompressionType::CompressionType> &compressors);

// Add one aligned measurement to a template
void addAlignedMeasurementsInTemplate(const std::string &template_name,
                                      const std::string &measurement,
                                      TSDataType::TSDataType dataType,
                                      TSEncoding::TSEncoding encoding,
                                      CompressionType::CompressionType compressor);

// Add unaligned measurements to a template
void addUnalignedMeasurementsInTemplate(const std::string &template_name,
                                        const std::vector<std::string> &measurements,
                                        const std::vector<TSDataType::TSDataType> &dataTypes,
                                        const std::vector<TSEncoding::TSEncoding> &encodings,
                                        const std::vector<CompressionType::CompressionType> &compressors);

// Add one unaligned measurement to a template
void addUnalignedMeasurementsInTemplate(const std::string &template_name,
                                        const std::string &measurement,
                                        TSDataType::TSDataType dataType,
                                        TSEncoding::TSEncoding encoding,
                                        CompressionType::CompressionType compressor);

// Delete a node in template and its children
void deleteNodeInTemplate(const std::string &template_name, const std::string &path);
```

- You can query measurement templates with these APIS:
```cpp
// Return the amount of measurements inside a template
int countMeasurementsInTemplate(const std::string &template_name);

// Return true if path points to a measurement, otherwise returne false
bool isMeasurementInTemplate(const std::string &template_name, const std::string &path);

// Return true if path exists in template, otherwise return false
bool isPathExistInTemplate(const std::string &template_name, const std::string &path);

// Return all measurements paths inside template
std::vector<std::string> showMeasurementsInTemplate(const std::string &template_name);

// Return all measurements paths under the designated patter inside template
std::vector<std::string> showMeasurementsInTemplate(const std::string &template_name, const std::string &pattern);
```


### Data Manipulation Interface (DML)

#### Insert

> It is recommended to use insertTablet to help improve write efficiency.

- Insert a Tablet，which is multiple rows of a device, each row has the same measurements
    - Better Write Performance
    - Support null values: fill the null value with any value, and then mark the null value via BitMap
```cpp
void insertTablet(Tablet &tablet);
```

- Insert multiple Tablets
```cpp
void insertTablets(std::unordered_map<std::string, Tablet *> &tablets);
```

- Insert a Record, which contains multiple measurement value of a device at a timestamp
```cpp
void insertRecord(const std::string &deviceId, int64_t time, const std::vector<std::string> &measurements,
                  const std::vector<TSDataType::TSDataType> &types, const std::vector<char *> &values);
```

- Insert multiple Records
```cpp
void insertRecords(const std::vector<std::string> &deviceIds,
                   const std::vector<int64_t> &times,
                   const std::vector<std::vector<std::string>> &measurementsList,
                   const std::vector<std::vector<TSDataType::TSDataType>> &typesList,
                   const std::vector<std::vector<char *>> &valuesList);
```

- Insert multiple Records that belong to the same device. With type info the server has no need to do type inference, which leads a better performance
```cpp
void insertRecordsOfOneDevice(const std::string &deviceId,
                              std::vector<int64_t> &times,
                              std::vector<std::vector<std::string>> &measurementsList,
                              std::vector<std::vector<TSDataType::TSDataType>> &typesList,
                              std::vector<std::vector<char *>> &valuesList);
```

#### Insert with type inference

Without type information, server has to do type inference, which may cost some time.

```cpp
void insertRecord(const std::string &deviceId, int64_t time, const std::vector<std::string> &measurements,
                  const std::vector<std::string> &values);


void insertRecords(const std::vector<std::string> &deviceIds,
                   const std::vector<int64_t> &times,
                   const std::vector<std::vector<std::string>> &measurementsList,
                   const std::vector<std::vector<std::string>> &valuesList);


void insertRecordsOfOneDevice(const std::string &deviceId,
                              std::vector<int64_t> &times,
                              std::vector<std::vector<std::string>> &measurementsList,
                              const std::vector<std::vector<std::string>> &valuesList);
```

#### Insert data into Aligned Timeseries

The Insert of aligned timeseries uses interfaces like `insertAlignedXXX`, and others are similar to the above interfaces:

- insertAlignedRecord
- insertAlignedRecords
- insertAlignedRecordsOfOneDevice
- insertAlignedTablet
- insertAlignedTablets

#### Delete

- Delete data before or equal to a timestamp of one or several timeseries
```cpp
void deleteData(const std::string &path, int64_t time);
void deleteData(const std::vector<std::string> &deviceId, int64_t time);
```

### IoTDB-SQL Interface

- Execute query statement
```cpp
void executeNonQueryStatement(const std::string &sql);
```

- Execute non query statement
```cpp
void executeNonQueryStatement(const std::string &sql);
```


## Examples

The sample code of using these interfaces is in:

- `example/client-cpp-example/src/SessionExample.cpp`
- `example/client-cpp-example/src/AlignedTimeseriesSessionExample.cpp` (Aligned Timeseries)

If the compilation finishes successfully, the example project will be placed under `example/client-cpp-example/target`

## FAQ

### on Mac

If errors occur when compiling thrift source code, try to downgrade your xcode-commandline from 12 to 11.5

see https://stackoverflow.com/questions/63592445/ld-unsupported-tapi-file-type-tapi-tbd-in-yaml-file/65518087#65518087


### on Windows

When Building Thrift and downloading packages via "wget", a possible annoying issue may occur with
error message looks like:
```shell
Failed to delete cached file C:\Users\Administrator\.m2\repository\.cache\download-maven-plugin\index.ser
```
Possible fixes:
- Try to delete the ".m2\repository\\.cache\" directory and try again.
- Add "\<skipCache>true\</skipCache>" configuration to the download-maven-plugin maven phase that complains this error.

