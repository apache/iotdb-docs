# 可视化控制台
## 第1章 产品介绍
IoTDB可视化控制台是在Apache IoTDB企业版时序数据库基础上针对工业场景的实时数据收集、存储与分析一体化的数据管理场景开发的扩展组件，旨在为用户提供高效、可靠的实时数据存储和查询解决方案。它具有体量轻、性能高、易使用的特点，完美对接 Hadoop 与 Spark 生态，适用于工业物联网应用中海量时间序列数据高速写入和复杂分析查询的需求。
## 第2章 IoTDB兼容性说明
| Workbench版本号 | 兼容IoTDB版本            |
| --------------- | ------------------------ |
| V1.2            | V1.2.0<br>V1.2.1<br>V1.2.2<br>V1.3.0 |


## 第3章 使用说明
3.1 登录
Workbench程序启动后，您可以通过输入部署服务器的 IP 和工作端口进行访问。
系统默认的用户名：root，密码：root，缺省密码请及时修改。输入正确的用户名和密码，点击登录按钮，成功登录系统。
 
![](https://alioss.timecho.com/docs/img/c1.png)

3.2 实例管理
1)	能够满足对连接实例进行统一管理，支持创建、编辑和删除，实现您对于多实例管理的需求
 
![](https://alioss.timecho.com/docs/img/c2.png)
2)	能够对实例层级关系进行直观展示，支持对已保存实例进行关联关系管理、信息编辑和连接切换。
 
![](https://alioss.timecho.com/docs/img/c3.png)
3.3 首页
您可以从首页直观查看集群基本信息及状态，可查看数据库实例中各节点的服务运行状态（如是否激活、是否运行、IP信息等）
 
![](https://alioss.timecho.com/docs/img/c4.png)
支持查看集群、ConfigNode、DataNode运行监控状态， 对数据库运行健康度进行监控，判断实例是否有潜在运行问题
 
![](https://alioss.timecho.com/docs/img/c5.png)
3.4 测点列表
您可以通过界面直观查看、管理测点信息，支持直接查看实例中的所有测点，并查看测点的重要信息
 
![](https://alioss.timecho.com/upload/workbench%E2%80%94%E6%B5%8B%E7%82%B9%E7%AE%A1%E7%90%86.jpeg)
3.5 查询
3.5.1 数据查询
将对常用数据查询场景提供界面式查询，支持进行时间过滤、测点过滤的查询，支持进行降采样查询，支持对查询数据进行批量导出。
 
![](https://alioss.timecho.com/docs/img/c7.png)
3.5.2 统计查询
将对常用数据统计场景提供界面式查询，支持进行时间过滤、测点过滤，一键完成最大值、最小值、平均值、总和的结果输出。
 
![](https://alioss.timecho.com/docs/img/c8.png)
3.5.3 SQL操作
将提供您数据库SQL的界面式交互，支持添加多标签页、通过快捷操作快速查找测点及相应函数
 
![](https://alioss.timecho.com/docs/img/c9.png)
3.6 趋势
趋势将为您提供一键可视化查看数据历史&实时数据整体趋势
 
![](https://alioss.timecho.com/docs/img/c10.png)
3.7 数据同步
您可以在数据同步界面完成对同步任务的创建以及管理，支持直接查看任务运行状态、同步数据和目标地址
 
![](https://alioss.timecho.com/docs/img/c11.png)
3.8 权限管理
您可在此模块中配置可以访问数据库的用户，以及该用户可以访问的数据范围，方便对数据库系统的访问进行范围划分。
 
![](https://alioss.timecho.com/upload/workbench%E2%80%94%E6%9D%83%E9%99%90%E7%AE%A1%E7%90%86.jpeg)
