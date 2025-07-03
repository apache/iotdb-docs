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

# AINode

AINode is an IoTDB native node designed to support the registration, management, and invocation of large-scale time series models. It comes with industry-leading proprietary time series models such as Timer and Sundial. These models can be invoked through standard SQL statements, enabling real-time inference of time series data at the millisecond level, and supporting application scenarios such as trend forecasting, missing value imputation, and anomaly detection for time series data.


The system architecture is shown below:
::: center
<img src="/img/AInode.png" style="zoom:50 percent" />
::: 
The responsibilities of the three nodes are as follows:

- **ConfigNode**: responsible for storing and managing the meta-information of the model; responsible for distributed node management.
- **DataNode**: responsible for receiving and parsing SQL requests from users; responsible for storing time-series data; responsible for preprocessing computation of data.
- **AINode**: responsible for model file import creation and model inference.

## 1. Advantageous features

Compared with building a machine learning service alone, it has the following advantages:

- **Simple and easy to use**: no need to use Python or Java programming, the complete process of machine learning model management and inference can be completed using SQL statements.  Creating a model can be done using the CREATE MODEL statement, and using a model for inference can be done using the CALL INFERENCE (...) statement, making it simpler and more convenient to use.

- **Avoid Data Migration**: With IoTDB native machine learning, data stored in IoTDB can be directly applied to the inference of machine learning models without having to move the data to a separate machine learning service platform, which accelerates data processing, improves security, and reduces costs.

![](/img/AInode1.png)

- **Built-in Advanced Algorithms**: supports industry-leading machine learning analytics algorithms covering typical timing analysis tasks, empowering the timing database with native data analysis capabilities. Such as:
  - **Time Series Forecasting**: learns patterns of change from past time series; thus outputs the most likely prediction of future series based on observations at a given past time.
  - **Anomaly Detection for Time Series**: detects and identifies outliers in a given time series data, helping to discover anomalous behaviour in the time series.
  - **Annotation for Time Series (Time Series Annotation)**: Adds additional information or markers, such as event occurrence, outliers, trend changes, etc., to each data point or specific time period to better understand and analyse the data.



## 2. Basic Concepts

- **Model**: a machine learning model that takes time-series data as input and outputs the results or decisions of an analysis task. Model is the basic management unit of AINode, which supports adding (registration), deleting, checking, and using (inference) of models.
- **Create**: Load externally designed or trained model files or algorithms into MLNode for unified management and use by IoTDB.
- **Inference**: The process of using the created model to complete the timing analysis task applicable to the model on the specified timing data.
- **Built-in capabilities**: AINode comes with machine learning algorithms or home-grown models for common timing analysis scenarios (e.g., prediction and anomaly detection).

::: center
<img src="/img/AInode2.png" style="zoom:50%" />
::::

## 3. Installation and Deployment

The deployment of AINode can be found in the document [Deployment Guidelines](../Deployment-and-Maintenance/AINode_Deployment_timecho.md) .


## 4. Usage Guidelines

AINode provides model creation and deletion process for deep learning models related to timing data. Built-in models do not need to be created and deleted, they can be used directly, and the built-in model instances created after inference is completed will be destroyed automatically.

### 4.1 Registering Models

A trained deep learning model can be registered by specifying the vector dimensions of the model's inputs and outputs, which can be used for model inference. 

Models that meet the following criteria can be registered in AINode:
1. Models trained on PyTorch 2.1.0 and 2.2.0 versions supported by AINode should avoid using features from versions 2.2.0 and above.
2. AINode supports models stored using PyTorch JIT, and the model file needs to include the parameters and structure of the model.
3. The input sequence of the model can contain one or more columns, and if there are multiple columns, they need to correspond to the model capability and model configuration file.
4. The input and output dimensions of the model must be clearly defined in the `config.yaml` configuration file. When using the model, it is necessary to strictly follow the input-output dimensions defined in the `config.yaml` configuration file. If the number of input and output columns does not match the configuration file, it will result in errors.

The following is the SQL syntax definition for model registration.

```SQL
create model <model_name> using uri <uri>
```

The specific meanings of the parameters in the SQL are as follows:

- model_name: a globally unique identifier for the model, which cannot be repeated. The model name has the following constraints:

  - Identifiers [ 0-9 a-z A-Z _ ] (letters, numbers, underscores) are allowed.
  - Length is limited to 2-64 characters
  - Case sensitive

- uri: resource path to the model registration file, which should contain the **model weights model.pt file and the model's metadata description file config.yaml**.

  - Model weight file: the weight file obtained after the training of the deep learning model is completed, currently supporting pytorch training of the .pt file

  - yaml metadata description file: parameters related to the model structure that need to be provided when the model is registered, which must contain the input and output dimensions of the model for model inference:

    - | **Parameter name** | **Parameter description** | **Example** |
      | ------------ | ---------------------------- | -------- |
      | input_shape | Rows and columns of model inputs for model inference | [96,2] |
      | output_shape | rows and columns of model outputs, for model inference | [48,2] |

    - In addition to model inference, the data types of model input and output can be specified:

    - | **Parameter name** | **Parameter description** | **Example** |
      | ----------- | ------------------ | --------------------- |
      | input_type | model input data type | ['float32','float32'] |
      | output_type | data type of the model output | ['float32','float32'] |

    - In addition to this, additional notes can be specified for display during model management

    - | **Parameter name** | **Parameter description** | **Examples** |
      | ---------- | ---------------------------------------------- | ------------------------------------------- |
      | attributes | optional, user-defined model notes for model display | 'model_type': 'dlinear','kernel_size': '25' |


In addition to registration of local model files, registration can also be done by specifying remote resource paths via URIs, using open source model repositories (e.g. HuggingFace).


### 4.2 Viewing Models

Successfully registered models can be queried for model-specific information through the show models command. The SQL definition is as follows:

```SQL
show models

show models <model_name>
```

In addition to displaying information about all models directly, you can specify a model id to view information about a specific model. The results of the model show contain the following information:

| **ModelId** | **State** | **Configs** | **Attributes** |
| ------------ | ------------------------------------- | ---------------------------------------------- | -------------- |
| Model Unique Identifier | Model Registration Status (LOADING, ACTIVE, DROPPING) | InputShape, outputShapeInputTypes, outputTypes | Model Notes |

State is used to show the current state of model registration, which consists of the following three stages

- **LOADING**: The corresponding model meta information has been added to the configNode, and the model file is being transferred to the AINode node.
- **ACTIVE**: The model has been set up and the model is in the available state
- **DROPPING**: Model deletion is in progress, model related information is being deleted from configNode and AINode.
- **UNAVAILABLE**: Model creation failed, you can delete the failed model_name by drop model.


### 4.3 Delete Model

For a successfully registered model, the user can delete it via SQL. In addition to deleting the meta information on the configNode, this operation also deletes all the related model files under the AINode. The SQL is as follows:

```SQL
drop model <model_name>
```

You need to specify the model model_name that has been successfully registered to delete the corresponding model. Since model deletion involves the deletion of data on multiple nodes, the operation will not be completed immediately, and the state of the model at this time is DROPPING, and the model in this state cannot be used for model inference.

### 4.4 Using Built-in Model Reasoning

Coming Soon

## 5. Privilege Management

When using AINode related functions, the authentication of IoTDB itself can be used to do a permission management, users can only use the model management related functions when they have the USE_MODEL permission. When using the inference function, the user needs to have the permission to access the source sequence corresponding to the SQL of the input model.

| Privilege Name | Privilege Scope | Administrator User (default ROOT) | Normal User | Path Related |
| --------- | --------------------------------- | ---------------------- | -------- | -------- |
| USE_MODEL | create model/show models/drop model | √ | √  | x |
| READ_DATA| call inference | √ | √|√ |

## 6. Practical Examples

Coming Soon