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

# Overlap validation and repair tool

The Overlap Validation And Repair tool is used to validate the resource files in sequence space, and repair overlaps.

The validation function can be run in any scenario. Confirmation is required after overlapping files are found. Typing 'y' will perform the repair.

**The repair function must be run when corresponding DataNode is stopped and there are no unfinished compaction task in all data dirs.**
To make sure there are no unfinished compaction tasks, you can modify the config files to set enable compaction items to false, and restart DataNode waiting compaction recover task to finish.
Then stop the DataNode and run this tool.
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
This example validate two data dirs: /data1/sequence/, /data2/sequence.