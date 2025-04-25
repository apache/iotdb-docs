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
# Status Codes

IoTDB introduces the concept of status codes. For example, since IoTDB needs to register a time series before writing data, one possible solution is:

```Plain
try {
    writeData();
} catch (SQLException e) {
  // the most case is that the time series does not exist
  if (e.getMessage().contains("exist")) {
      //However, using the content of the error message is not so efficient
      registerTimeSeries();
      //write data once again
      writeData();
  }
}
```

By utilizing status codes, we can avoid writing code such as `if (e.getErrorMessage().contains("exist"))` . Instead, we only need to use `e.getStatusType().getCode() == TSStatusCode.TIME_SERIES_NOT_EXIST_ERROR.getStatusCode()`.

Here is a list of status codes and their corresponding messages:

| **Status Code** | Status Type                            | Status Information                                           |
| :-------------- | :------------------------------------- | :----------------------------------------------------------- |
| 200             | SUCCESS_STATUS                         | Operation successful.                                        |
| 201             | INCOMPATIBLE_VERSION                   | Incompatible version.                                        |
| 202             | CONFIGURATION_ERROR                    | Configuration file contains errors.                          |
| 203             | START_UP_ERROR                         | Error occurred during startup.                               |
| 204             | SHUT_DOWN_ERROR                        | Error occurred during shutdown.                              |
| 300             | UNSUPPORTED_OPERATION                  | Unsupported operation.                                       |
| 301             | EXECUTE_STATEMENT_ERROR                | Error occurred while executing the statement.                |
| 302             | MULTIPLE_ERROR                         | Error occurred while executing multi-line statements.        |
| 303             | ILLEGAL_PARAMETER                      | Invalid or missing parameters provided.                      |
| 304             | OVERLAP_WITH_EXISTING_TASK             | Conflict with another ongoing operation.                     |
| 305             | INTERNAL_SERVER_ERROR                  | Internal server error encountered.                           |
| 306             | DISPATCH_ERROR                         | Error during distribution process.                           |
| 400             | REDIRECTION_RECOMMEND                  | Recommended client redirection.                              |
| 500             | DATABASE_NOT_EXIST                     | Specified database does not exist.                           |
| 501             | DATABASE_ALREADY_EXISTS                | Database already exists.                                     |
| 502             | SERIES_OVERFLOW                        | Exceeded maximum series count threshold.                     |
| 503             | TIMESERIES_ALREADY_EXIST               | Time series already exists.                                  |
| 504             | TIMESERIES_IN_BLACK_LIST               | Time series is currently being deleted.                      |
| 505             | ALIAS_ALREADY_EXIST                    | Path alias already exists.                                   |
| 506             | PATH_ALREADY_EXIST                     | Path already exists.                                         |
| 507             | METADATA_ERROR                         | Error occured while processing metadata.                     |
| 508             | PATH_NOT_EXIST                         | Specified path does not exist.                               |
| 509             | ILLEGAL_PATH                           | Path is invalid.                                             |
| 510             | CREATE_TEMPLATE_ERROR                  | Failed to create schema template.                            |
| 511             | DUPLICATED_TEMPLATE                    | Schema template already exists.                              |
| 512             | UNDEFINED_TEMPLATE                     | Schema template is undefined.                                |
| 513             | TEMPLATE_NOT_SET                       | Schema template not set.                                     |
| 514             | DIFFERENT_TEMPLATE                     | Inconsistent Schema template detected.                       |
| 515             | TEMPLATE_IS_IN_USE                     | Schema template is currently in use.                         |
| 516             | TEMPLATE_INCOMPATIBLE                  | Schema template is incompatible.                             |
| 517             | SEGMENT_NOT_FOUND                      | Specified segment not found.                                 |
| 518             | PAGE_OUT_OF_SPACE                      | Insufficient space in PBTreeFile page.                       |
| 519             | RECORD_DUPLICATED                      | Duplicate record detected.                                   |
| 520             | SEGMENT_OUT_OF_SPACE                   | Insufficient space in PBTreeFile segment.                    |
| 521             | PBTREE_FILE_NOT_EXISTS                 | PBTreeFile does not exist.                                   |
| 522             | OVERSIZE_RECORD                        | Record size exceeds schema file page size.                   |
| 523             | PBTREE_FILE_REDO_LOG_BROKEN            | Redo log in PBTreeFile is corrupted.                         |
| 524             | TEMPLATE_NOT_ACTIVATED                 | Schema template is inactive.                                 |
| 526             | SCHEMA_QUOTA_EXCEEDED                  | Cluster schema exceeds quota limits.                         |
| 527             | MEASUREMENT_ALREADY_EXISTS_IN_TEMPLATE | Measurement already exists in schema template.               |
| 600             | SYSTEM_READ_ONLY                       | IoTDB system is in read-only mode.                           |
| 601             | STORAGE_ENGINE_ERROR                   | Error related to the storage engine.                         |
| 602             | STORAGE_ENGINE_NOT_READY               | Storage engine is recovering; read/write operations are not accepted. |
| 603             | DATAREGION_PROCESS_ERROR               | Error related to DataRegion.                                 |
| 604             | TSFILE_PROCESSOR_ERROR                 | Error related to TsFile processor.                           |
| 605             | WRITE_PROCESS_ERROR                    | General write-related error.                                 |
| 606             | WRITE_PROCESS_REJECT                   | Write operation rejected.                                    |
| 607             | OUT_OF_TTL                             | Inserted timestamp is earlier than TTL boundary              |
| 608             | COMPACTION_ERROR                       | Error during compaction.                                     |
| 609             | ALIGNED_TIMESERIES_ERROR               | Error in aligned time series.                                |
| 610             | WAL_ERROR                              | Write-Ahead Log (WAL) exception.                             |
| 611             | DISK_SPACE_INSUFFICIENT                | Insufficient disk space.                                     |
| 700             | SQL_PARSE_ERROR                        | Error during parsing SQL statement.                          |
| 701             | SEMANTIC_ERROR                         | Semantic error in SQL statement.                             |
| 702             | GENERATE_TIME_ZONE_ERROR               | Error during generating timezone.                            |
| 703             | SET_TIME_ZONE_ERROR                    | Error during setting timezone.                               |
| 704             | QUERY_NOT_ALLOWED                      | Query operation is not allowed.                              |
| 705             | LOGICAL_OPERATOR_ERROR                 | Error related to logical operators.                          |
| 706             | LOGICAL_OPTIMIZE_ERROR                 | Error during logical optimization.                           |
| 707             | UNSUPPORTED_FILL_TYPE                  | Unsupported fill type specified.                             |
| 708             | QUERY_PROCESS_ERROR                    | Error during processing the query.                           |
| 709             | MPP_MEMORY_NOT_ENOUGH                  | Insufficient memory for MPP framework task execution.        |
| 710             | CLOSE_OPERATION_ERROR                  | Error during shutdown operation.                             |
| 711             | TSBLOCK_SERIALIZE_ERROR                | Error during serializing TsBlock.                            |
| 712             | INTERNAL_REQUEST_TIME_OUT              | MPP operation timed out.                                     |
| 713             | INTERNAL_REQUEST_RETRY_ERROR           | Internal operation retry failed.                             |
| 714             | NO_SUCH_QUERY                          | Specified query does not exist.                              |
| 715             | QUERY_WAS_KILLED                       | Query execution was terminated.                              |
| 800             | UNINITIALIZED_AUTH_ERROR               | Authorization module not initialized.                        |
| 801             | WRONG_LOGIN_PASSWORD                   | Username or password is incorrect.                           |
| 802             | NOT_LOGIN                              | User not logged in.                                          |
| 803             | NO_PERMISSION                          | User lacks necessary permissions.                            |
| 804             | USER_NOT_EXIST                         | Specified user does not exist.                               |
| 805             | USER_ALREADY_EXIST                     | User already exists.                                         |
| 806             | USER_ALREADY_HAS_ROLE                  | User possesses the specified role.                           |
| 807             | USER_NOT_HAS_ROLE                      | User does not possess the specified role.                    |
| 808             | ROLE_NOT_EXIST                         | Specified role does not exist.                               |
| 809             | ROLE_ALREADY_EXIST                     | Role already exists.                                         |
| 810             | ALREADY_HAS_PRIVILEGE                  | User has the required privilege.                             |
| 811             | NOT_HAS_PRIVILEGE                      | User lacks the required privilege.                           |
| 812             | CLEAR_PERMISSION_CACHE_ERROR           | Failed to clear permission cache.                            |
| 813             | UNKNOWN_AUTH_PRIVILEGE                 | Unknown permission specified.                                |
| 814             | UNSUPPORTED_AUTH_OPERATION             | Unsupported permission operation attempted.                  |
| 815             | AUTH_IO_EXCEPTION                      | I/O exception in authorization module.                       |
| 900             | MIGRATE_REGION_ERROR                   | Failed to migrate region.                                    |
| 901             | CREATE_REGION_ERROR                    | Failed to create region.                                     |
| 902             | DELETE_REGION_ERROR                    | Failed to delete region.                                     |
| 903             | PARTITION_CACHE_UPDATE_ERROR           | Failed to update partition cache.                            |
| 904             | CONSENSUS_NOT_INITIALIZED              | Consensus layer not initialized; service unavailable.        |
| 905             | REGION_LEADER_CHANGE_ERROR             | Failed to migrate region leader.                             |
| 906             | NO_AVAILABLE_REGION_GROUP              | No available region group found.                             |
| 907             | LACK_DATA_PARTITION_ALLOCATION         | Missing information in create data partition method return result. |
| 1000            | DATANODE_ALREADY_REGISTERED            | DataNode is already registered in the cluster.               |
| 1001            | NO_ENOUGH_DATANODE                     | Insufficient DataNodes; unable to remove nodes or create regiongroups. |
| 1002            | ADD_CONFIGNODE_ERROR                   | Failed to add ConfigNode.                                    |
| 1003            | REMOVE_CONFIGNODE_ERROR                | Failed to remove ConfigNode.                                 |
| 1004            | DATANODE_NOT_EXIST                     | Specified DataNode does not exist.                           |
| 1005            | DATANODE_STOP_ERROR                    | Failed to shut down DataNode.                                |
| 1006            | REMOVE_DATANODE_ERROR                  | Failed to remove DataNode.                                   |
| 1007            | REGISTER_DATANODE_WITH_WRONG_ID        | Incorrect registration ID in registered DataNodes.           |
| 1008            | CAN_NOT_CONNECT_DATANODE               | Failed to connect to DataNode.                               |
| 1100            | LOAD_FILE_ERROR                        | Error loading file.                                          |
| 1101            | LOAD_PIECE_OF_TSFILE_ERROR             | Exception loading TsFile fragment.                           |
| 1102            | DESERIALIZE_PIECE_OF_TSFILE_ERROR      | Exception deserializing TsFile fragment.                     |
| 1103            | SYNC_CONNECTION_ERROR                  | Error during sync connection.                                |
| 1104            | SYNC_FILE_REDIRECTION_ERROR            | Redirect exception while syncing files.                      |
| 1105            | SYNC_FILE_ERROR                        | General exception during file synchronization.               |
| 1106            | CREATE_PIPE_SINK_ERROR                 | Failed to create PIPE Sink.                                  |
| 1107            | PIPE_ERROR                             | General PIPE exception.                                      |
| 1108            | PIPESERVER_ERROR                       | Exception occurring on the PIPE server.                      |
| 1109            | VERIFY_METADATA_ERROR                  | Failed to validate metadata.                                 |
| 1200            | UDF_LOAD_CLASS_ERROR                   | Exception loading UDF class.                                 |
| 1201            | UDF_DOWNLOAD_ERROR                     | Failed to download UDF from ConfigNode.                      |
| 1202            | CREATE_UDF_ON_DATANODE_ERROR           | Failed to create UDF on DataNode.                            |
| 1203            | DROP_UDF_ON_DATANODE_ERROR             | Failed to unload UDF from DataNode.                          |
| 1300            | CREATE_TRIGGER_ERROR                   | Failed to create trigger via ConfigNode.                     |
| 1301            | DROP_TRIGGER_ERROR                     | Failed to delete trigger via ConfigNode.                     |
| 1302            | TRIGGER_FIRE_ERROR                     | Error executing trigger.                                     |
| 1303            | TRIGGER_LOAD_CLASS_ERROR               | Exception loading trigger class.                             |
| 1304            | TRIGGER_DOWNLOAD_ERROR                 | Failed to download trigger from ConfigNode.                  |
| 1305            | CREATE_TRIGGER_INSTANCE_ERROR          | Exception creating trigger instance.                         |
| 1306            | ACTIVE_TRIGGER_INSTANCE_ERROR          | Exception activating trigger instance.                       |
| 1307            | DROP_TRIGGER_INSTANCE_ERROR            | Exception deleting trigger instance.                         |
| 1308            | UPDATE_TRIGGER_LOCATION_ERROR          | Update Stateful Trigger's DataNode Exception                 |
| 1400            | NO_SUCH_CQ                             | Continuous Query (CQ) task does not exist.                   |
| 1401            | CQ_ALREADY_ACTIVE                      | CQ task is already activated.                                |
| 1402            | CQ_AlREADY_EXIST                       | CQ task already exist.                                       |
| 1403            | CQ_UPDATE_LAST_EXEC_TIME_ERROR         | Failed to update last execution time for CQ task.            |

> In the latest version, we have refactored the exception classes in IoTDB. By consolidating error messages into the exception classes and assigning unique error codes to each exception, when an exception is caught and a higher-level exception is thrown, the error code is preserved and propagated. This allows users to understand the detailed cause of the error.
>
> Additionally, we have introduced a base exception class named `ProcessException`, which serves as the parent class for all other exceptions.