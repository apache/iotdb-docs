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
# Time Series Large Models

## 1. Introduction

Time Series Large Models are foundational models specifically designed for time series data analysis. The IoTDB team has been developing the Timer, a self-researched foundational time series model, which is based on the Transformer architecture and pre-trained on massive multi-domain time series data, supporting downstream tasks such as time series forecasting, anomaly detection, and time series imputation. The AINode platform developed by the team also supports the integration of cutting-edge time series foundational models from the industry, providing users with diverse model options. Unlike traditional time series analysis techniques, these large models possess universal feature extraction capabilities and can serve a wide range of analytical tasks through zero-shot analysis, fine-tuning, and other services.

All technical achievements in the field of time series large models related to this paper (including both the team's self-researched models and industry-leading directions) have been published in top international machine learning conferences, with specific details in the appendix.

## 2. Application Scenarios

* **Time Series Forecasting**: Providing time series data forecasting services for industrial production, natural environments, and other fields to help users understand future trends in advance.
* **Data Imputation**: Performing context-based filling for missing segments in time series to enhance the continuity and integrity of the dataset.
* **Anomaly Detection**: Using autoregressive analysis technology to monitor time series data in real-time, promptly alerting potential anomalies.

![](/img/LargeModel10.png)

## 3. Timer-1 Model

The Timer model (non-built-in model) not only demonstrates excellent few-shot generalization and multi-task adaptability, but also acquires a rich knowledge base through pre-training, endowing it with universal capabilities to handle diverse downstream tasks, with the following characteristics:

* **Generalizability**: The model can achieve industry-leading deep model prediction results through fine-tuning with only a small number of samples.
* **Universality**: The model design is flexible, capable of adapting to various different task requirements, and supports variable input and output lengths, enabling it to function effectively in various application scenarios.
* **Scalability**: As the number of model parameters increases or the scale of pre-training data expands, the model's performance will continue to improve, ensuring that the model can continuously optimize its prediction effectiveness as time and data volume grow.

![](/img/model01.png)

## 4. Timer-XL Model

Timer-XL<sup><a href="#appendix2" id="ref2" style="text-decoration: none;">[2]</a></sup> further extends and upgrades the network structure based on Timer, achieving comprehensive breakthroughs in multiple dimensions:

* **Ultra-Long Context Support**: This model breaks through the limitations of traditional time series forecasting models, supporting the processing of inputs with thousands of Tokens (equivalent to tens of thousands of time points), effectively solving the context length bottleneck problem.
* **Coverage of Multi-Variable Forecasting Scenarios**: Supports various forecasting scenarios, including the prediction of non-stationary time series, multi-variable prediction tasks, and predictions involving covariates, meeting diversified business needs.
* **Large-Scale Industrial Time Series Dataset**: Pre-trained on a trillion-scale time series dataset from the industrial IoT field, the dataset possesses important characteristics such as massive scale, excellent quality, and rich domain coverage, covering multiple fields including energy, aerospace, steel, and transportation.

![](/img/model02.png)

## 5. Timer-Sundial Model

Timer-Sundial<sup><a href="#appendix3" id="ref3" style="text-decoration: none;">[3]</a></sup> is a series of generative foundational models focused on time series forecasting. The base version has 128 million parameters and has been pre-trained on 1 trillion time points, with the following core characteristics:

* **Strong Generalization Performance**: Possesses zero-shot forecasting capabilities and can support both point forecasting and probabilistic forecasting simultaneously.
* **Flexible Prediction Distribution Analysis**: Not only can it predict means or quantiles, but it can also evaluate any statistical properties of the prediction distribution through the raw samples generated by the model.
* **Innovative Generative Architecture**: Employs a "Transformer + TimeFlow" collaborative architecture - the Transformer learns the autoregressive representations of time segments, while the TimeFlow module transforms random noise into diverse prediction trajectories based on the flow-matching framework (Flow-Matching), achieving efficient generation of non-deterministic samples.

![](/img/model03.png)

## 6. Chronos-2 Model

Chronos-2<sup><a href="#appendix4" id="ref4" style="text-decoration: none;">[4]</a></sup> is a universal time series foundational model developed by the Amazon Web Services (AWS) research team, evolved from the Chronos discrete token modeling paradigm. This model is suitable for both zero-shot univariate forecasting and covariate forecasting. Its main characteristics include:

* **Probabilistic Forecasting Capability**: The model outputs multi-step prediction results in a generative manner, supporting quantile or distribution-level forecasting to characterize future uncertainty.
* **Zero-Shot General Forecasting**: Leveraging the contextual learning ability acquired through pre-training, it can directly execute forecasting on unseen datasets without retraining or parameter updates.
* **Unified Modeling of Multi-Variable and Covariates**: Supports joint modeling of multiple related time series and their covariates under the same architecture to improve prediction performance for complex tasks. However, it has strict input requirements:
    * The set of names of future covariates must be a subset of the set of names of historical covariates;
    * The length of each historical covariate must equal the length of the target variable;
    * The length of each future covariate must equal the prediction length;
* **Efficient Inference and Deployment**: The model adopts a compact encoder-only structure, maintaining strong generalization capabilities while ensuring inference efficiency.

![](/img/timeseries-large-model-chronos2.png)

## 7. Moirai2 Model

Moirai2<sup><a href="#appendix5" id="ref5" style="text-decoration: none;">[5]</a></sup> (Moirai 2.0) is a general-purpose time series foundation model developed by Salesforce AI Research (supported in V2.0.10 and later). AINode currently integrates the Moirai 2.0 R-small variant, which has approximately 11.4M parameters. Unlike Moirai 1.0, which uses a masked encoder architecture, Moirai 2.0 uses a causal decoder-only Patch Transformer. With a single patch size, multi-token prediction, and multi-quantile outputs, it provides efficient univariate forecasting with a compact model. Its core features include:

- **Lightweight Model Architecture**: Uses a decoder-only Patch Transformer with RMSNorm, rotary positional embeddings, and SiLU-GLU feed-forward networks to balance forecasting capability and inference efficiency at a small parameter scale.
- **Multi-Token Prediction**: Predicts multiple patches at each decoding step, reducing the number of autoregressive decoding steps required for long forecast horizons.
- **Probabilistic Forecasting**: Outputs nine quantiles from 0.1 to 0.9. AINode uses the p50 median as the point forecast.
- **Patch Decoding**: Groups the time series into fixed-size patches before the attention module to improve temporal feature extraction and decoding efficiency.
- **Instance Normalization**: Standardizes each time series before model input and applies denormalization after output to mitigate distribution shifts across series.
- **Input Scope**: Focuses on univariate forecasting and does not support multivariate targets or covariates.

![](/img/LargeModel-moirai2.png)

> Note: The Moirai 2.0 R-small model weights are licensed under CC BY-NC 4.0 and are restricted to research use.

## 8. Toto Model

Toto<sup><a href="#appendix6" id="ref6" style="text-decoration: none;">[6]</a></sup> (Toto 2.0) is a next-generation time series foundation model developed by Datadog (supported in V2.0.10 and later), primarily for forecasting in observability scenarios. AINode currently integrates the 2.5B-parameter variant. It is based on a decoder-only Patch Transformer architecture that alternates causal temporal attention and variable attention to jointly model the temporal and variable dimensions. Its core features include:

- **Univariate and Multivariate Forecasting**: Supports both individual target variables and joint forecasting of multiple related target variables, making it suitable for observability metrics such as CPU, memory, and network traffic.
- **Probabilistic Forecasting**: Outputs fixed quantiles from 0.1 to 0.9 to represent forecasting uncertainty. AINode uses the p50 median as the point forecast.
- **Efficient Block Decoding**: Uses cached block decoding to generate forecasts in blocks, reducing repeated computation for longer forecast horizons.
- **Large-Scale Model Capability**: Improves forecasting performance by scaling model parameters and pre-training data, providing strong zero-shot generalization.
- **Covariate Limitation**: The currently integrated version does not support historical covariates or known future covariates.

![](/img/LargeModel-toto.png)

## 9. Performance Showcase

Time Series Large Models can adapt to real time series data from various different domains and scenarios, demonstrating excellent processing capabilities across various tasks. The following shows the actual performance on different datasets:

**Time Series Forecasting:**

Leveraging the forecasting capabilities of Time Series Large Models, future trends of time series can be accurately predicted. The blue curve in the following figure represents the predicted trend, while the red curve represents the actual trend, with both curves highly consistent.

![](/img/LargeModel03.png)

**Data Imputation:**

Using Time Series Large Models to fill missing data segments through predictive imputation.

![](/img/timeseries-large-model-data-imputation.png)

**Anomaly Detection:**

Using Time Series Large Models to accurately identify outliers that deviate significantly from the normal trend.

![](/img/LargeModel05.png)

## 10. Deployment and Usage

1. Open the IoTDB CLI console and check that the ConfigNode, DataNode, and AINode nodes are all Running.

```Plain
IoTDB> show cluster
+------+----------+-------+---------------+------------+--------------+-----------+
|NodeID|  NodeType| Status|InternalAddress|InternalPort|       Version|  BuildInfo|
+------+----------+-------+---------------+------------+--------------+-----------+
|     0|ConfigNode|Running|      127.0.0.1|       10710|       2.0.5.1|    069354f|
|     1|  DataNode|Running|      127.0.0.1|       10730|       2.0.5.1|    069354f|
|     2|    AINode|Running|      127.0.0.1|       10810|       2.0.5.1|069354f-dev|
+------+----------+-------+---------------+------------+--------------+-----------+
Total line number = 3
It costs 0.140s
```

2. In an online environment, the first startup of the AINode node will automatically pull the Timer-XL, Sundial, and Chronos2 models.

   > Note:
   >
   > * The AINode installation package does not include model weight files.
   > * The automatic pull feature depends on the deployment environment having HuggingFace network access capability.
   > * AINode supports manual upload of model weight files. For specific operation methods, refer to [Importing Weight Files](../Deployment-and-Maintenance/AINode_Deployment_Upgrade_apache.md#_3-3-importing-built-in-weight-files).

3. Check if the models are available.

```Bash
IoTDB> show models
+---------------------+---------+--------+--------+
|              ModelId|ModelType|Category|   State|
+---------------------+---------+--------+--------+
|                arima|   sktime| builtin|  active|
|          holtwinters|   sktime| builtin|  active|
|exponential_smoothing|   sktime| builtin|  active|
|     naive_forecaster|   sktime| builtin|  active|
|       stl_forecaster|   sktime| builtin|  active|
|         gaussian_hmm|   sktime| builtin|  active|
|              gmm_hmm|   sktime| builtin|  active|
|                stray|   sktime| builtin|  active|
|             timer_xl|    timer| builtin|  active|
|              sundial|  sundial| builtin|  active|
|             chronos2|       t5| builtin|  active|
|              moirai2|   moirai| builtin|  active|
|                 toto|     toto| builtin|  active|
+---------------------+---------+--------+--------+
```

### Appendix

**[1]** Timer: Generative Pre-trained Transformers Are Large Time Series Models, Yong Liu, Haoran Zhang, Chenyu Li, Xiangdong Huang, Jianmin Wang, Mingsheng Long. [↩ Back]()

<a id="appendix2"></a>**[2]** TIMER-XL: LONG-CONTEXT TRANSFORMERS FOR UNIFIED TIME SERIES FORECASTING, Yong Liu, Guo Qin, Xiangdong Huang, Jianmin Wang, Mingsheng Long. [↩ Back](#ref2)

<a id="appendix3"></a>**[3]** Sundial: A Family of Highly Capable Time Series Foundation Models, Yong Liu, Guo Qin, Zhiyuan Shi, Zhi Chen, Caiyin Yang, Xiangdong Huang, Jianmin Wang, Mingsheng Long, **ICML 2025 spotlight**. [↩ Back](#ref3)

<a id="appendix4"></a>**[4]** Chronos-2: From Univariate to Universal Forecasting, Abdul Fatir Ansari, Oleksandr Shchur, Jaris Küken, Andreas Auer, Boran Han, Pedro Mercado, Syama Sundar Rangapuram, Huibin Shen, Lorenzo Stella, Xiyuan Zhang, Mononito Goswami, Shubham Kapoor, Danielle C. Maddix, Pablo Guerron, Tony Hu, Junming Yin, Nick Erickson, Prateek Mutalik Desai, Hao Wang, Huzefa Rangwala, George Karypis, Yuyang Wang, Michael Bohlke-Schneider, **arXiv:2510.15821**. [↩ Back](#ref4)

<a id="appendix5"></a>[5] Moirai 2.0: When Less Is More for Time Series Forecasting, Salesforce AI Research, arXiv:2511.11698. [↩ Back](#ref5)

<a id="appendix6"></a>[6] Toto 2.0: Time Series Forecasting Enters the Scaling Era, Datadog, arXiv:2605.20119. [↩ Back](#ref6)
