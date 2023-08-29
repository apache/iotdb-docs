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

# Overlap validation and repair 工具

Overlap Validation And Repair 工具用于验证顺序空间内 tsfile 的 resource 文件的重叠情况并进行修复。.

验证功能可以在任意场景下运行，在找出所有存在重叠的文件后，需要输入 'y' 以确认是否进行修复。

**修复功能必须在相关的 DataNode 停止之后执行，且对应的数据目录中不存在未完成的合并任务。**
为了确保没有尚未完成的合并任务，你可以修改配置文件中开启合并相关的配置项为 false，然后重启 DataNode 并等待合并恢复任务的完成，停止 DataNode，再运行这个工具。
## Usage
```shell
#MacOs or Linux
./check-overlap-sequence-files-and-repair.sh [sequence_data_dir1] [sequence_data_dir2]...
# Windows
.\check-overlap-sequence-files-and-repair.bat [sequence_data_dir1] [sequence_data_dir2]...
```
## Example
```shell
./check-overlap-sequence-files-and-repair.sh  /data1/sequence/ /data2/sequence
```
这个示例指定了配置的两个数据目录进行扫描: /data1/sequence/, /data2/sequence。