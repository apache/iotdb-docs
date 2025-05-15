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

# TimeSeries Large Model

## Introduction

A time series large model is a foundational model specifically designed for time series analysis. The IoTDB team has independently developed time series large models, which are pre-trained on massive time series data using technologies such as transformer structures. These models can understand and generate time series data across various domains and are applicable to applications like time series forecasting, anomaly detection, and time series imputation. Unlike traditional time series analysis techniques, time series large models possess the capability to extract universal features and provide technical services based on zero-shot analysis and fine-tuning for a wide range of analytical tasks.

The team's related technologies of time series large models have been published in top international machine learning conferences.

## Application Scenarios

- **Time Series Forecasting**: Provides forecasting services for time series data in industrial production, natural environments, and other areas, helping users to understand future trends in advance.
- **Data Imputation**: For missing segments in time series, perform context imputation to enhance the continuity and completeness of the dataset.
- **Anomaly Detection**: Utilizing regression analysis technology, monitor time series data in real-time and provide timely warnings for potential anomalies.

![](/img/LargeModel10.png)

## Timer Model

The Timer model not only demonstrates excellent few-shot generalization and multi-task adaptation capabilities but also gains a rich knowledge base through pre-training, endowing it with the universal capability to handle a variety of downstream tasks, featuring the following:

- **Generalization**: The model can be fine-tuned using a small number of samples to achieve leading predictive performance in the industry.
- **Versatility**: The model is designed flexibly to adapt to various task requirements and supports variable input and output lengths, enabling it to play a role in various application scenarios.
- **Scalability**: As the number of model parameters increases or the scale of pre-training data expands, the model's performance continues to improve, ensuring the model can optimize its predictive effects with the growth of time and data volume.

![](/img/LargeModel02.png)

## Timer-XL Model

Timer-XL is an upgraded version of Timer that further extends the network structure and achieves comprehensive breakthroughs in multiple dimensions:

- **Long Context Support**: This model breaks through the limitations of traditional time series forecasting models, supporting the processing of thousands of tokens (equivalent to tens of thousands of time points) of input, effectively addressing the bottleneck of context length.
- **Multi-variable Forecasting Scenario Coverage**: Supports a variety of forecasting scenarios, including non-stationary time series forecasting, multi-variable prediction tasks, and predictions involving covariates, meeting diverse business needs.
- **Large-scale Industrial Time Series Dataset**: Pre-trained using a massive industrial IoT time series dataset that has a large volume, excellent quality, and rich domain characteristics, covering energy, aerospace, steel, transportation, and more.


## Effect Demonstration

Time series large models can adapt to real time series data from various fields and scenarios, showing excellent processing effects in various tasks. Here are the real performances on different data:

**Time Series Forecasting:**

Utilizing the predictive capabilities of the time series large model, it can accurately predict the future trend of time series. As shown in the figure, the blue curve represents the predicted trend, and the red curve represents the actual trend, with the two curves highly matching.

![](/img/LargeModel03.png)

**Data Imputation:**：

Using the time series large model to perform predictive imputation for missing data segments.

![](/img/timeseries-large-model-data-imputation.png)


**Anomaly Detection:**：

Utilizing the time series large model to accurately identify anomalies that deviate significantly from the normal trend.

![](/img/LargeModel05.png)

## Deployment Usage

1. Open the IoTDB CLI console and verify that the ConfigNode, DataNode, and AINode statuses are all ​Running.

Check command:

```sql
show cluster
```

![](/img/ainode-timer-1.png)

2. Model file storage path: It is recommended to place the model files in the same directory as the AINode installation package.
   You may create a new folder to store model files.

3. Register the model

Use the following SQL statement:

```sql
create model <model_name> using uri <uri>
```

Example (for the Timer model):

```sql
create model Timer using uri <uri>
```

4. Verify model registration success

Check command:

```sql
show models
```

![](/img/LargeModel06.png)
