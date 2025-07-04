| **名称**                       | **描述**                                                     | **类型** | **默认值**         |
| ------------------------------ | ------------------------------------------------------------ | -------- | ------------------ |
| cluster_name                   | AINode 要加入集群的标识                                      | string   | defaultCluster     |
| ain_seed_config_node           | AINode 启动时注册的 ConfigNode 地址                          | String   | 127.0.0.1:10710    |
| ain_cluster_ingress_address    | AINode 拉取数据的 DataNode 的 rpc 地址                       | String   | 127.0.0.1          |
| ain_cluster_ingress_port       | AINode 拉取数据的 DataNode 的 rpc 端口                       | Integer  | 6667               |
| ain_cluster_ingress_username   | AINode 拉取数据的 DataNode 的客户端用户名                    | String   | root               |
| ain_cluster_ingress_password   | AINode 拉取数据的 DataNode 的客户端密码                      | String   | root               |
| ain_cluster_ingress_time_zone  | AINode 拉取数据的 DataNode 的客户端时区                      | String   | UTC+8              |
| ain_inference_rpc_address      | AINode 提供服务与通信的地址 ，内部服务通讯接口               | String   | 127.0.0.1          |
| ain_inference_rpc_port         | AINode 提供服务与通信的端口                                  | String   | 10810              |
| ain_system_dir                 | AINode 元数据存储路径，相对路径的起始目录与操作系统相关，建议使用绝对路径 | String   | data/AINode/system |
| ain_models_dir                 | AINode 存储模型文件的路径，相对路径的起始目录与操作系统相关，建议使用绝对路径 | String   | data/AINode/models |
| ain_thrift_compression_enabled | AINode 是否启用 thrift 的压缩机制，0-不启动、1-启动          | Boolean  | 0                  |