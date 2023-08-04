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

# IoTDB 数据订阅客户端

**IoTDB 的数据订阅客户端能够从特定的 IoTDB 集群内，按照一定的方式获取数据。**
我们提供了多语言的 api，能够实时获取 IoTDB 内的最新数据，且具有推送和拉取两种模式。下面将按照语言顺序列出这些 api。

## Java
提供 SubscriptionFactory 构造消费者，支持 PushConsumer 和  PullConsumer 两种消费风格：
```` java
public interface SubscriptionFactory {

    PushConsumer createPushConsumer(SubscriptionConfiguration subscriptionConfiguration)
            throws SubscriptionException;

    PullConsumer createPullConsumer(SubscriptionConfiguration subscriptionConfiguration)
            throws SubscriptionException;
}

public class PushConsumer implements Consumer {
    // 唤醒
    void resumeConsume();
    // 暂停
    void pauseConsume();
    // 是否暂停
    boolean isConsumePaused();
    
    // 订阅消息到达后的回调 Listener
    PushConsumer registerSubscriptionListener(SubscriptionListener listener) throws SubscriptionException;
    // 错误出现后的回调 Listener
    PushConsumer registerErrorListener(ReceiveErrorListener listener) throws SubscriptionException;
    
    void close();
}

public class PullConsumer implements Consumer {
    // 获取队列顶部消息，客户端自己循环调用。比如：consumer.poll(Duration.ofMillis(100))
    List<ConsumerDataSet> poll(Duration timeout) throws SubscriptionException;
    
    void close();
}
````
## C/C++
IoTDB 提供与 Java 类似的订阅接口：
```` C
push_consumer * iotdb_create_push_consumer(subscription_config *cnf);
pull_consumer * iotdb_create_pull_consumer(subscription_config *cnf);

int push_consumer_resume(push_consumer *pc);
int push_consumer_pause(push_consumer *pc);
int push_consumer_is_consume_paused(push_consumer *pc);
int push_consumer_register_subscription_listener(push_consumer *pc, SUBSCRIPTION_LISTENER listener);
int push_consumer_register_error_listener(push_consumer *pc, SERROR_LISTENER listener);
int push_consumer_close(push_consumer *pc);

consumer_dataset * pull_consumer_poll(pull_consumer *pc, int64_t timeout);
int pull_consumer_close(pull_consumer *pc);
````

## Python
Python 的订阅接口与 Java 的类似，订阅方式如下：
```python
from abc import ABC, abstractmethod
from typing import List
from datetime import timedelta

class SubscriptionFactory(ABC):
    @abstractmethod
    def createPushConsumer(self, subscriptionConfiguration):
        pass

    @abstractmethod
    def createPullConsumer(self, subscriptionConfiguration):
        pass


class PushConsumer:
    def resumeConsume(self):
        pass

    def pauseConsume(self):
        pass

    def isConsumePaused(self):
        pass

    def registerSubscriptionListener(self, listener):
        pass

    def registerErrorListener(self, listener):
        pass

    def close(self):
        pass


class PullConsumer:
    def poll(self, timeout: timedelta) -> List:
        pass

    def close(self):
        pass
```

## Go
Go 语言内的订阅方式如下：
```go
package main

import (
\t"time"
)

type SubscriptionFactory interface {
\tCreatePushConsumer(subscriptionConfiguration SubscriptionConfiguration) (PushConsumer, error)
\tCreatePullConsumer(subscriptionConfiguration SubscriptionConfiguration) (PullConsumer, error)
}

type PushConsumer interface {
\tResumeConsume()
\tPauseConsume()
\tIsConsumePaused() bool
\tRegisterSubscriptionListener(listener SubscriptionListener) error
\tRegisterErrorListener(listener ReceiveErrorListener) error
\tClose()
}

type PullConsumer interface {
\tPoll(timeout time.Duration) ([]ConsumerDataSet, error)
\tClose()
}

type ConsumerDataSet struct {
\t// define fields of ConsumerDataSet
}

type SubscriptionConfiguration struct {
\t// define fields of SubscriptionConfiguration
}

type SubscriptionListener interface {
\t// define methods of SubscriptionListener
}

type ReceiveErrorListener interface {
\t// define methods of ReceiveErrorListener
}
```
## Rust
Rust 语言内的订阅方式如下：
``` rust
use std::time::Duration;

pub trait SubscriptionFactory {
    fn create_push_consumer(&self, subscription_configuration: SubscriptionConfiguration)
        -> Result<PushConsumer, SubscriptionException>;

    fn create_pull_consumer(&self, subscription_configuration: SubscriptionConfiguration)
        -> Result<PullConsumer, SubscriptionException>;
}

pub struct PushConsumer {
    // 唤醒
    fn resume_consume(&self);

    // 暂停
    fn pause_consume(&self);

    // 是否暂停
    fn is_consume_paused(&self) -> bool;

    // 订阅消息到达后的回调 Listener
    fn register_subscription_listener(&self, listener: SubscriptionListener)
        -> Result<PushConsumer, SubscriptionException>;

    // 错误出现后的回调 Listener
    fn register_error_listener(&self, listener: ReceiveErrorListener)
        -> Result<PushConsumer, SubscriptionException>;

    fn close(&self);
}

pub struct PullConsumer {
    // 获取队列顶部消息，客户端自己循环调用。比如：consumer.poll(Duration::from_millis(100))
    fn poll(&self, timeout: Duration) -> Result<Vec<ConsumerDataSet>, SubscriptionException>;

    fn close(&self);
}
```
## Node.JS
```javascript
class PushConsumer {
  constructor() {
    this.paused = false;
    this.subscriptionListener = null;
    this.errorListener = null;
  }

  resumeConsume() {
    this.paused = false;
  }

  pauseConsume() {
    this.paused = true;
  }

  isConsumePaused() {
    return this.paused;
  }

  registerSubscriptionListener(listener) {
    this.subscriptionListener = listener;
    return this;
  }

  registerErrorListener(listener) {
    this.errorListener = listener;
    return this;
  }

  close() {
    // 关闭操作
  }
}

class PullConsumer {
  poll(timeout) {
    // 获取队列顶部消息的操作
    return [];
  }

  close() {
    // 关闭操作
  }
}

class SubscriptionFactory {
  createPushConsumer(subscriptionConfiguration) {
    return new PushConsumer();
  }

  createPullConsumer(subscriptionConfiguration) {
    return new PullConsumer();
  }
}

module.exports = {
  SubscriptionFactory,
  PushConsumer,
  PullConsumer
};
```

使用方式示例：

```javascript
const { SubscriptionFactory } = require('./subscription');

const factory = new SubscriptionFactory();
const subscriptionConfiguration = { /* 配置信息 */ };

const pushConsumer = factory.createPushConsumer(subscriptionConfiguration);
pushConsumer.registerSubscriptionListener((message) => {
  // 处理订阅消息到达后的逻辑
}).registerErrorListener((error) => {
  // 处理错误出现后的逻辑
});

const pullConsumer = factory.createPullConsumer(subscriptionConfiguration);

// 使用 pushConsumer 和 pullConsumer 进行操作
```

## C#
``` C#
public interface SubscriptionFactory
{
    PushConsumer CreatePushConsumer(SubscriptionConfiguration subscriptionConfiguration)
    {
        throw new SubscriptionException();
    }

    PullConsumer CreatePullConsumer(SubscriptionConfiguration subscriptionConfiguration)
    {
        throw new SubscriptionException();
    }
}

public class PushConsumer : Consumer
{
    public void ResumeConsume()
    {
        // 唤醒逻辑
    }

    public void PauseConsume()
    {
        // 暂停逻辑
    }

    public bool IsConsumePaused()
    {
        // 判断是否暂停逻辑
    }

    public PushConsumer RegisterSubscriptionListener(SubscriptionListener listener)
    {
        throw new SubscriptionException();
    }

    public PushConsumer RegisterErrorListener(ReceiveErrorListener listener)
    {
        throw new SubscriptionException();
    }

    public void Close()
    {
        // 关闭逻辑
    }
}

public class PullConsumer : Consumer
{
    public List<ConsumerDataSet> Poll(TimeSpan timeout)
    {
        throw new SubscriptionException();
    }

    public void Close()
    {
        // 关闭逻辑
    }
}
```

## WebSocket 方式订阅
同时，IoTDB 的订阅客户端还支持以 WebSocket 的方式订阅。 WebSocket 的默认客户端端口为 9090，也可以在客户端内配置。订阅消息为：
```json
 {
  "event": "subscribe",
  "pattern": "root",
  "unordered": "false",
  "timeRange": "...",
  "ValueRange": ">100"
}
```
该消息将订阅 IoTDB 的所有数据，不包括乱序数据，按照一定时间进行过滤，同时只需要大于100的数据。

此外，还需要自定义 socket.onmessage 函数，以处理获取到的数据。此外，还需要编写 socket.onclose 和 socket.onerror 等函数，以自定义客户端对这些事件的响应。

## MQTT 方式订阅
目前 IoTDB 的 MQTT 方式支持数据订阅功能，其数据格式与 WebSocket 相同。mqtt 的 host 和 port 需要在 iotdb 的 properties 文件内配置。


## 数据过滤
与数据同步软件相同，IoTDB 的订阅功能也可以提供数据过滤的功能。WebSocket 与 MQTT 方式已经给出了示例。
Api 方式下，以 Java 订阅接口为例子，用户可在 SubscriptionConfiguration 中配置过滤条件（Strategy）。目前支持指定的条件包括：
- 是否需要过滤乱序数据（disorderHandlingStrategy）
- 需要订阅的序列的共同前缀（topicsStrategy）
- 指定序列的时间范围（timeStrategy）
- 指定序列的值范围（valueStrategy）

```aidl
public class PushConsumerExample {
  
   public static void test(String[] args) throws Throwable {
       SubscriptionConfiguration config = new SubscriptionConfiguration.Builder()
                       .host("127.0.0.1")
                       .port(6667)
                       .user("root")
                       .password("root")
                       .group("my-test-group")
                       .build();
                       
       // 在此设置过滤条件
       config.disorderHandlingStrategy(new IntolerableStrategy())
             .topicsStrategy(new SingleTopicStrategy("root.sg.d1.n1"))
             .timeStrategy(new GlobalTimeStrategy)
             .valueStrategy(ValueStrategy.GreaterThanStrategy(
                 new SingleTopicStrategy("root.sg.d1.n1"), 100d));
             
       SubscriptionFactory factory = new SubscriptionFactory(config);
       SubscriptionFactory.createPushConsumer(config)
       final PullConsumer pullConsumer = factory.createPullConsumer(consumerConfig);
       pullConsumer.openSubscription();
       while (true) {
            List<ConsumerDataSet> result = pullConsumer.poll(Duration.ofMillis(300));
            for (ConsumerDataSet item : result) {
                    System.out.println("received message : " + item);
                }
        }
   }
}
```
