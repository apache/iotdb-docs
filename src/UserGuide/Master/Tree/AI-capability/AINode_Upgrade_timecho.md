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

AINode is a native IoTDB node that supports the registration, management, and invocation of time series related models, with built-in industry-leading self-developed time series large models such as the Tsinghua University's Timer series. It can be invoked through standard SQL statements to achieve millisecond-level real-time inference on time series data, supporting applications such as time series trend prediction, missing value imputation, and anomaly detection.

The system architecture is shown in the following diagram:

![](/img/AINode-0-en.png)

The responsibilities of the three nodes are as follows:

* **ConfigNode**: Responsible for distributed node management and load balancing.
* **DataNode**: Responsible for receiving and parsing user SQL requests; responsible for storing time series data; responsible for data preprocessing calculations.
* **AINode**: Responsible for managing and using time series models.

## 1. Advantages

Compared to building machine learning services separately, it has the following advantages:

* **Simple and easy to use**: No need to use Python or Java programming, SQL statements can be used to complete the entire process of machine learning model management and inference. For example, creating a model can use the CREATE MODEL statement, and using a model for inference can use the CALL INFERENCE (...) statement, etc., which is simpler and more convenient to use.
* **Avoid data migration**: Using IoTDB native machine learning can directly apply time series data stored in IoTDB to machine learning model inference, without moving data to a separate machine learning service platform, thus accelerating data processing, improving security, and reducing costs.

![](/img/AInode1.png)

* **Built-in advanced algorithms**: Supports industry-leading machine learning analysis algorithms, covering typical time series analysis tasks, empowering time series databases with native data analysis capabilities. Such as:
    * **Time Series Forecasting**: Learn change patterns from past time series to output the most likely prediction of future sequences based on given past observations.
    * **Anomaly Detection for Time Series**: Detect and identify anomalies in given time series data to help discover abnormal behavior in time series.

## 2. Basic Concepts

* **Model**: Machine learning model, which takes time series data as input and outputs the results or decisions of the analysis task. The model is the basic management unit of AINode, supporting the addition (registration), deletion, query, modification (fine-tuning), and use (inference) of models.
* **Create**: Load external designed or trained model files or algorithms into AINode, managed and used by IoTDB.
* **Inference**: Use the created model to complete the time series analysis task applicable to the model on the specified time series data.
* **Built-in**: AINode comes with common time series analysis scenario (e.g., prediction and anomaly detection) machine learning algorithms or self-developed models.

![](/img/AInode2.png)

## 3. Installation and Deployment

AINode deployment can be referenced in the documentation [AINode Deployment](../Deployment-and-Maintenance/AINode_Deployment_Upgrade_timecho.md).

## 4. Usage Guide

TimechoDB-AINode supports three major functions: model inference, model fine-tuning, and model management (registration, viewing, deletion, loading, unloading, etc.). The following sections will explain them in detail.

### 4.1 Model Inference

SQL syntax as follows:

```SQL
call inference(<model_id>,inputSql,(<parameterName>=<parameterValue>)*)
```

After completing the model registration (built-in model inference does not require a registration process), the inference function of the model can be used by calling the inference function with the call keyword. The corresponding parameter descriptions are as follows:

* **model\_id**: Corresponds to an already registered model
* **sql**: SQL query statement, the result of the query is used as the input for model inference. The dimensions of the rows and columns in the query result need to match the size specified in the specific model config. (It is not recommended to use the `SELECT *` clause in this sql, because in IoTDB, `*` does not sort columns, so the column order is undefined. It is recommended to use `SELECT ot` to ensure that the column order matches the expected input of the model.)
* **parameterName/parameterValue**: currently supported:

  | Parameter Name | Parameter Type | Parameter Description | Default Value |
  | ---------------- | -------------- | ----------------------- | -------------- |
  | **generateTime** | boolean | Whether to include a timestamp column in the result | false |
  | **outputLength** | int | Specifies the output length of the result | 96 |

Notes:
1. The prerequisite for using built-in time series large models for inference is that the local machine has the corresponding model weights, located at `/TIMECHODB_AINODE_HOME/data/ainode/models/builtin/model_id/`. If the local machine does not have model weights, it will automatically pull from HuggingFace. Please ensure that the local machine can directly access HuggingFace.
2. In deep learning applications, it is common to use time-derived features (the time column in the data) as covariates and input them into the model together with the data to improve model performance. However, the time column is generally not included in the model's output results. To ensure universality, the model inference result only corresponds to the model's true output. If the model does not output a time column, the result will not contain it.

**Example**

Sample data [ETTh-tree](/img/ETTh-tree.csv)

Below is an example of using the sundial model for inference. The input is 96 rows, and the output is 48 rows. We use SQL to perform the inference.

```SQL
IoTDB> select OT from root.db.**
+-----------------------------+---------------+
|                         Time|root.db.etth.OT|
+-----------------------------+---------------+
|2016-07-01T00:00:00.000+08:00|         30.531|
|2016-07-01T01:00:00.000+08:00|         27.787|
|2016-07-01T02:00:00.000+08:00|         27.787|
|2016-07-01T03:00:00.000+08:00|         25.044|
|2016-07-01T04:00:00.000+08:00|         21.948|
|  ......                     |        ...... |
|2016-07-04T19:00:00.000+08:00|         29.546|
|2016-07-04T20:00:00.000+08:00|         29.475|
|2016-07-04T21:00:00.000+08:00|         29.264|
|2016-07-04T22:00:00.000+08:00|         30.953|
|2016-07-04T23:00:00.000+08:00|         31.726|
+-----------------------------+---------------+
Total line number = 96  

IoTDB> call inference(sundial,"select OT from root.db.**", generateTime=True, outputLength=48)
+-----------------------------+------------------+
|                         Time|            output|
+-----------------------------+------------------+
|2016-07-04T23:00:00.000+08:00|30.537494659423828|
|2016-07-04T23:59:22.500+08:00|29.619892120361328|
|2016-07-05T00:58:45.000+08:00|28.815832138061523|
|2016-07-05T01:58:07.500+08:00| 27.91131019592285|
|2016-07-05T02:57:30.000+08:00|26.893848419189453|
|  ......                     | ......           |
|2016-07-06T17:33:07.500+08:00| 24.40607261657715|
|2016-07-06T18:32:30.000+08:00| 25.00441551208496|
|2016-07-06T19:31:52.500+08:00|24.907312393188477|
|2016-07-06T20:31:15.000+08:00|25.156436920166016|
|2016-07-06T21:30:37.500+08:00|25.335433959960938|
+-----------------------------+------------------+
Total line number = 48
```

### 4.2 Model Fine-Tuning

AINode supports model fine-tuning through SQL.

**SQL Syntax**

```SQL
createModel
    | CREATE MODEL modelId=identifier (WITH HYPERPARAMETERS LR_BRACKET hparamPair (COMMA hparamPair)* RR_BRACKET)? FROM MODEL existingModelId=identifier ON DATASET LR_BRACKET trainingData RR_BRACKET
    ;
    
trainingData
    : dataElement(COMMA dataElement)*
    ;

dataElement
    : pathPatternElement (LR_BRACKET timeRange RR_BRACKET)?
    ;

pathPatternElement
    : PATH path=prefixPath
    ;
```

**Parameter Description**

| Name | Description                                                                                                                                                                                                                                       |
| ------ |---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| modelId | The unique identifier of the fine-tuned model                                                                                                                                                                                                     |
| hparamPair | Key-value pairs of hyperparameters used for fine-tuning, currently supported: <br> `train_epochs`: int type, number of fine-tuning epochs  <br>  `iter_per_epoch`: int type, number of iterations per epoch  <br> `learning_rate`: double type, learning rate |
| existingModelId | The base model used for fine-tuning                                                                                                                                                                                                               |
| trainingData | The dataset used for fine-tuning                                                                                                                                                                                                                  |

**Example**

1. Select the data of the measurement point root.db.etth.ot within a specified time range as the fine-tuning dataset, and create the model sundialv2 based on sundial.

```SQL
IoTDB> CREATE MODEL sundialv2 FROM MODEL sundial ON DATASET (PATH root.db.etth.OT([1467302400000, 1467644400000)))
Msg: The statement is executed successfully.
IoTDB> show models
+---------------------+---------+-----------+---------+
|              ModelId|ModelType|   Category|    State|
+---------------------+---------+-----------+---------+
|                arima|   sktime|    builtin|   active|
|          holtwinters|   sktime|    builtin|   active|
|exponential_smoothing|   sktime|    builtin|   active|
|     naive_forecaster|   sktime|    builtin|   active|
|       stl_forecaster|   sktime|    builtin|   active|
|         gaussian_hmm|   sktime|    builtin|   active|
|              gmm_hmm|   sktime|    builtin|   active|
|                stray|   sktime|    builtin|   active|
|             timer_xl|    timer|    builtin|   active|
|              sundial|  sundial|    builtin|   active|
|             chronos2|       t5|    builtin|   active| 
|            sundialv2|  sundial| fine_tuned| training| 
+---------------------+---------+-----------+---------+
```

2. Fine-tuning tasks are started asynchronously in the background, and logs can be seen in the AINode process; after fine-tuning is completed, query and use the new model.

```SQL
IoTDB> show models
+---------------------+---------+-----------+---------+
|              ModelId|ModelType|   Category|    State|
+---------------------+---------+-----------+---------+
|                arima|   sktime|    builtin|   active|
|          holtwinters|   sktime|    builtin|   active|
|exponential_smoothing|   sktime|    builtin|   active|
|     naive_forecaster|   sktime|    builtin|   active|
|       stl_forecaster|   sktime|    builtin|   active|
|         gaussian_hmm|   sktime|    builtin|   active|
|              gmm_hmm|   sktime|    builtin|   active|
|                stray|   sktime|    builtin|   active|
|             timer_xl|    timer|    builtin|   active|
|              sundial|  sundial|    builtin|   active|
|             chronos2|       t5|    builtin|   active|
|            sundialv2|  sundial| fine_tuned|   active| 
+---------------------+---------+-----------+---------+
```

### 4.3 Register Custom Models

**Transformers models that meet the following requirements can be registered to AINode:**

1. AINode currently uses transformers version v4.56.2, so when building the model, it is necessary to **avoid inheriting low-version (<4.50) interfaces**;
2. The model needs to inherit a type of AINode inference task pipeline (currently supports the forecasting pipeline):
    1. iotdb-core/ainode/iotdb/ainode/core/inference/pipeline/basic\_pipeline.py

   ```Python
   class BasicPipeline(ABC):
       def __init__(self, model_id, **model_kwargs):
           self.model_info = model_info
           self.device = model_kwargs.get("device", "cpu")
           self.model = load_model(model_info, device_map=self.device, **model_kwargs)
   
       @abstractmethod
       def preprocess(self, inputs, **infer_kwargs):
           """
           Preprocess the input data before the inference task starts, including shape verification and numerical conversion.
           """
           pass
   
       @abstractmethod
       def postprocess(self, output, **infer_kwargs):
           """
           Postprocess the output results after the inference task ends.
           """
           pass
   
   
   class ForecastPipeline(BasicPipeline):
       def __init__(self, model_info, **model_kwargs):
           super().__init__(model_info, model_kwargs=model_kwargs)
   
       def preprocess(self, inputs: list[dict[str, dict[str, torch.Tensor] | torch.Tensor]], **infer_kwargs):
           """
           Preprocess the input data before passing it to the model for inference, verifying the shape and type of input data.
   
           Args:
               inputs (list[dict]):
                   Input data, a list of dictionaries, each dictionary contains:
                       - 'targets': a tensor of shape (input_length,) or (target_count, input_length).
                       - 'past_covariates': optional, a dictionary of tensors, each tensor shape is (input_length,).
                       - 'future_covariates': optional, a dictionary of tensors, each tensor shape is (input_length,).
   
               infer_kwargs (dict, optional): Additional inference keyword parameters, such as:
                   - `output_length`(int): If 'future_covariates' is provided, used to validate its validity.
   
           Raises:
               ValueError: If the input format is incorrect (e.g., missing keys, invalid tensor shapes).
   
           Returns:
               Preprocessed and validated input data, ready for model inference.
           """
           pass
   
       def forecast(self, inputs, **infer_kwargs):
           """
           Perform prediction on the given input.
   
           Parameters:
               inputs: Input data for prediction. The type and structure depend on the specific implementation of the model.
               **infer_kwargs: Additional inference parameters, such as:
                   - `output_length`(int): The number of time points the model should generate.
   
           Returns:
               Prediction output, specific form depends on the specific implementation of the model.
           """
           pass
   
       def postprocess(self, outputs: list[torch.Tensor], **infer_kwargs) -> list[torch.Tensor]:
           """
           Postprocess the model output after inference, verifying the shape of output tensors and ensuring they meet the expected dimensions.
   
           Args:
               outputs:
                   Model output, a list of 2D tensors, each tensor shape is `[target_count, output_length]`.
   
           Raises:
               InferenceModelInternalException: If the output tensor shape is invalid (e.g., dimension error).
               ValueError: If the output format is incorrect.
   
           Returns:
               list[torch.Tensor]:
                   Postprocessed output, a list of 2D tensors.
           """
           pass
   ```
3. Modify the model configuration file config.json to ensure it contains the following fields:
   ```JSON
   {
       "auto_map": {
           "AutoConfig": "config.Chronos2CoreConfig",        // Specify the model Config class
           "AutoModelForCausalLM": "model.Chronos2Model"     // Specify the model class
       },
       "pipeline_cls": "pipeline_chronos2.Chronos2Pipeline", // Specify the model's inference pipeline
       "model_type": "custom_t5",                            // Specify the model type
   }
   ```

    1. Must specify the model Config class and model class through auto\_map;
    2. Must integrate and specify the inference pipeline class;
    3. For AINode-managed built-in (builtin) and custom (user\_defined) models, the model category (model\_type) also serves as a unique identifier. That is, the model category to be registered must not be duplicated with any existing model type. Models created through fine-tuning will inherit the model category of the original model.
4. Ensure that the model directory to be registered contains the following files, and the model configuration file name and weight file name are not customizable:
    1. Model configuration file: config.json;
    2. Model weight file: model.safetensors;
    3. Model code: other .py files.

**The SQL syntax for registering a custom model is as follows:**

```SQL
CREATE MODEL <model_id> USING URI <uri>
```

**Parameter Description:**

* **model\_id**: The unique identifier of the custom model; non-repetitive, with the following constraints:
    * Allowed characters: [0-9 a-z A-Z \_ ] (letters, numbers (not at the beginning), underscore (not at the beginning))
    * Length limit: 2-64 characters
    * Case-sensitive
* **uri**: The local URI address containing the model code and weights.

**Registration Example:**

Upload a custom Transformers model from a local path. AINode will copy the folder to the user\_defined directory.

```SQL
CREATE MODEL chronos2 USING URI 'file:///path/to/chronos2'
```

After executing the SQL, the registration process will be performed asynchronously. The registration status of the model can be viewed by checking the model display (see the model display section). After the model is registered, it can be called using normal query methods to perform model inference.

### 4.4 View Models

Registered models can be viewed using the view command.

```SQL
SHOW MODELS
```

In addition to directly displaying all model information, you can specify `model_id` to view the information of a specific model.

```SQL
SHOW MODELS <model_id> -- Only display specific model
```

The results of model display include the following:

| **ModelId** | **ModelType** | **Category** | **State** |
| ------------------- | --------------------- | -------------------- | ----------------- |
| Model ID            | Model Type            | Model Category      | Model State       |

Where, State model state machine flow diagram as follows:

![](/img/ainode-upgrade-state-timecho-en.png)

State machine flow explanation:

1. After starting AINode, executing `show models` command, only **system built-in (BUILTIN)** models can be viewed.
2. Users can import their own models, which are identified as **user-defined (USER_DEFINED)**; AINode will attempt to parse the model type (ModelType) from the model configuration file; if parsing fails, this field will display as empty.
3. Time series large models (built-in models) weight files are not packaged with AINode, AINode automatically downloads them when starting.
    1. During download, it is ACTIVATING, and after successful download, it becomes ACTIVE, failure becomes INACTIVE.
4. After users start a model fine-tuning task, the model state is TRAINING, and after successful training, it becomes ACTIVE, failure becomes FAILED.
5. If the fine-tuning task is successful, after fine-tuning, the model will automatically rename the best checkpoint (training file) based on the best metric and become the user-specified model\_id.

**View Example**

```SQL
IoTDB> show models
+---------------------+--------------+--------------+-------------+
|              ModelId|     ModelType|      Category|        State|
+---------------------+--------------+--------------+-------------+
|                arima|        sktime|       builtin|       active|
|          holtwinters|        sktime|       builtin|       active|
|exponential_smoothing|        sktime|       builtin|       active|
|     naive_forecaster|        sktime|       builtin|       active|
|       stl_forecaster|        sktime|       builtin|       active|
|         gaussian_hmm|        sktime|       builtin|       active|
|              gmm_hmm|        sktime|       builtin|       active|
|                stray|        sktime|       builtin|       active|
|               custom|              |  user_defined|       active|
|             timer_xl|         timer|       builtin|   activating|
|              sundial|       sundial|       builtin|       active|
|           sundialx_1|       sundial|    fine_tuned|       active|
|           sundialx_4|       sundial|    fine_tuned|     training|
|           sundialx_5|       sundial|    fine_tuned|       failed|
|             chronos2|            t5|       builtin|     inactive|
+---------------------+--------------+--------------+-------------+
```

Built-in traditional time series models are introduced as follows:

| Model Name | Core Concept | Applicable Scenario | Main Features |
|------------|--------------|---------------------|---------------|
| **ARIMA** (Autoregressive Integrated Moving Average) | Combines autoregression (AR), differencing (I), and moving average (MA), used for predicting stationary time series or data that can be made stationary through differencing. | Univariate time series prediction, such as stock prices, sales, economic indicators. | 1. Suitable for linear trends and weak seasonality data. 2. Need to select parameters (p,d,q). 3. Sensitive to missing values. |
| **Holt-Winters** (Three-parameter exponential smoothing) | Based on exponential smoothing, introduces three components: level, trend, and seasonality, suitable for data with trend and seasonality. | Time series with clear seasonality and trend, such as monthly sales, power demand. | 1. Can handle additive or multiplicative seasonality. 2. Gives higher weight to recent data. 3. Simple to implement. |
| **Exponential Smoothing** | Uses weighted average of historical data, with weights decreasing exponentially over time, emphasizing the importance of recent observations. | Time series without obvious seasonality but with trend, such as short-term demand prediction. | 1. Few parameters, simple calculation. 2. Suitable for stationary or slowly changing sequences. 3. Can be extended to double or triple exponential smoothing. |
| **Naive Forecaster** | Uses the observation value from the previous period as the prediction for the next period, the simplest baseline model. | As a comparison baseline for other models, or simple prediction when data has no obvious pattern. | 1. No training required. 2. Sensitive to sudden changes. 3. Seasonal naive variant can use the value from the same period of the previous season for prediction. |
| **STL Forecaster** (Seasonal-Trend Decomposition) | Based on STL decomposition of time series, predict trend, seasonal, and residual components separately and combine. | Time series with complex seasonality, trend, and non-linear patterns, such as climate data, traffic flow. | 1. Can handle non-fixed seasonality. 2. Robust to outliers. 3. After decomposition, other models can be combined to predict each component. |
| **Gaussian HMM** (Gaussian Hidden Markov Model) | Assumes that observed data is generated by hidden states, with each state's observed probability following a Gaussian distribution. | State sequence prediction or classification, such as speech recognition, financial state recognition. | 1. Suitable for modeling time series state. 2. Assumes observed values are independent given the state. 3. Need to specify the number of hidden states. |
| **GMM HMM** (Gaussian Mixture Hidden Markov Model) | An extension of Gaussian HMM, where the observed probability of each state is described by a Gaussian Mixture Model, capturing more complex observed distributions. | Scenarios requiring multi-modal observed distributions, such as complex action recognition, bio-signal analysis. | 1. More flexible than single Gaussian. 2. More parameters, higher computational complexity. 3. Need to train the number of GMM components. |
| **STRAY** (Singular Value-based Anomaly Detection) | Detects anomalies in high-dimensional data through Singular Value Decomposition (SVD), commonly used for time series anomaly detection. | High-dimensional time series anomaly detection, such as sensor networks, IT system monitoring. | 1. No distribution assumption required. 2. Can handle high-dimensional data. 3. Sensitive to global anomalies, may miss local anomalies. |

Built-in time series large models are introduced as follows:

| Model Name | Core Concept | Applicable Scenario | Main Features |
|------------|--------------|---------------------|---------------|
| **Timer-XL** | Time series large model supporting ultra-long context, enhanced generalization ability through large-scale industrial data pre-training. | Complex industrial prediction requiring extremely long historical data, such as energy, aerospace, transportation. | 1. Ultra-long context support, can handle tens of thousands of time points as input. 2. Multi-scenario coverage, supports non-stationary, multi-variable, and covariate prediction. 3. Pre-trained on trillions of high-quality industrial time series data. |
| **Timer-Sundial** | A generative foundational model using "Transformer + TimeFlow" architecture, focused on probabilistic prediction. | Zero-shot prediction scenarios requiring quantification of uncertainty, such as finance, supply chain, new energy power generation. | 1. Strong zero-shot generalization ability, supports point prediction and probabilistic prediction. 2. Flexible analysis of any statistical characteristics of the prediction distribution. 3. Innovative generative architecture, achieving efficient non-deterministic sample generation. |
| **Chronos-2** | A universal time series foundational model based on discrete tokenization paradigm, transforming prediction into language modeling tasks. | Fast zero-shot univariate prediction, and scenarios that can leverage covariates (e.g., promotions, weather) to improve results. | 1. Strong zero-shot probabilistic prediction ability. 2. Supports covariate unified modeling, but has strict input requirements: a. The set of names of future covariates must be a subset of the set of names of historical covariates; b. The length of each historical covariate must equal the length of the target variable; c. The length of each future covariate must equal the prediction length; 3. Uses an efficient encoder-based structure, balancing performance and inference speed. |

### 4.5 Delete Models

For registered models, users can delete them through SQL. AINode will delete the corresponding model folder in the user\_defined directory. The SQL syntax is as follows:

```SQL
DROP MODEL <model_id>
```

The model id that has been successfully registered must be specified to delete the corresponding model. Since model deletion involves model data cleanup, the operation will not be completed immediately, and the model status becomes DROPPING, and the model in this state cannot be used for model inference. Note that this feature does not support deleting built-in models.

### 4.6 Load/Unload Models

To adapt to different scenarios, AINode provides the following two model loading strategies:

* **On-demand loading**: Load the model temporarily when inference is performed, and release resources after completion. Suitable for testing or low-load scenarios.
* **Persistent loading**: Load the model persistently in memory (CPU) or GPU memory, to support high-concurrency inference. Users only need to specify the model to load or unload through SQL, and AINode will automatically manage the number of instances. The status of the persistent model can also be viewed at any time.

The following sections will detail the loading/unloading model content:

1. Configuration parameters

Support editing the following configuration items to set persistent loading related parameters.

```Properties
# The proportion of device memory/GPU memory available for AINode inference
# Datatype: Float
ain_inference_memory_usage_ratio=0.4

# The proportion of memory that each loaded model instance needs to occupy, i.e., model occupancy * this value
# Datatype: Float
ain_inference_extra_memory_ratio=1.2
```

2. Show available devices

Support viewing all available device IDs through the following SQL command.

```SQL
SHOW AI_DEVICES
```

Example

```SQL
IoTDB> show ai_devices
+-------------+
|     DeviceId|
+-------------+
|          cpu|
|            0|
|            1|
+-------------+
```

3. Load model

Support loading models through the following SQL command, and the system will **automatically balance** the number of model instances based on hardware resource usage.

```SQL
LOAD MODEL <existing_model_id> TO DEVICES <device_id>(, <device_id>)*
```

Parameter requirements

* **existing\_model\_id:** The model id to be specified, current version only supports timer\_xl and sundial.
* **device\_id:** The location where the model is loaded.
    * **cpu:** Load to the memory of the AINode server.
    * **gpu\_id:** Load to the corresponding GPU of the AINode server, e.g., "0, 1" means load to the two GPUs numbered 0 and 1.

Example

```SQL
LOAD MODEL sundial TO DEVICES 'cpu,0,1'
```

4. Unload model

Support unloading specified models through the following SQL command, and the system will **reallocate** the freed resources to other models.

```SQL
UNLOAD MODEL <existing_model_id> FROM DEVICES <device_id>(, <device_id>)*
```

Parameter requirements

* **existing\_model\_id:** The model id to be specified, current version only supports timer\_xl and sundial.
* **device\_id:** The location where the model is loaded.
    * **cpu:** Attempt to unload the specified model from the memory of the AINode server.
    * **gpu\_id:** Attempt to unload the specified model from the corresponding GPU of the AINode server, e.g., "0, 1" means attempt to unload from the two GPUs numbered 0 and 1.

Example

```SQL
UNLOAD MODEL sundial FROM DEVICES 'cpu,0,1'
```

5. Show loaded models

Support viewing the models that have been manually loaded through the following SQL command, and you can specify the device via `device_id`.

```SQL
SHOW LOADED MODELS
SHOW LOADED MODELS <device_id>(, <device_id>)* # View models in specified devices
```

Example: sundial model is loaded on memory, gpu_0, and gpu_1

```SQL
IoTDB> show loaded models
+-------------+--------------+------------------+
|     DeviceId|       ModelId|  Count(instances)|
+-------------+--------------+------------------+
|          cpu|       sundial|                 4|
|            0|       sundial|                 6|
|            1|       sundial|                 6|
+-------------+--------------+------------------+
```

Explanation:
* DeviceId: Device ID
* ModelId: Loaded model ID
* Count(instances): Number of model instances on each device (automatically assigned by the system)

### 4.7 Introduction to Time Series Large Models

AINode currently supports multiple time series large models. For related introductions and deployment usage, please refer to [Time Series Large Models](../AI-capability/TimeSeries-Large-Model_Upgrade_timecho.md)

## 5. Permission Management

When using AINode related features, you can use IoTDB's own authentication for permission management. Users can only use the model management related features if they have the USE_MODEL permission. When using the inference feature, users need to have permission to access the source sequence corresponding to the SQL for the input model.

| Permission Name | Permission Scope | Administrator User (Default ROOT) | Ordinary User | Path-related |
| --------------- | ----------------- | ------------------------------- | -------------- | ------------ |
| USE_MODEL | create model / show models / drop model | √ | √ | x |
| READ_DATA | call inference | √ | √ | √ |