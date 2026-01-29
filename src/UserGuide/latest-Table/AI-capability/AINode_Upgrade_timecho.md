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

AINode is a native IoTDB node that supports the registration, management, and invocation of time series related models. It includes industry-leading self-developed time series large models, such as the Timer series models developed by Tsinghua University. Models can be invoked using standard SQL statements, enabling millisecond-level real-time inference on time series data, and supporting application scenarios such as time series trend prediction, missing value filling, and anomaly value detection.

The system architecture is shown in the following figure:

![](/img/AINode-0-en.png)

The responsibilities of the three nodes are as follows:

* **ConfigNode**: Responsible for distributed node management and load balancing.
* **DataNode**: Responsible for receiving and parsing user SQL requests; responsible for storing time series data; responsible for data preprocessing calculations.
* **AINode**: Responsible for managing and using time series models.

## 1. Advantages and Features

Compared to building a machine learning service separately, it has the following advantages:

* **Simple and Easy to Use**: No need to use Python or Java programming, you can complete the entire process of machine learning model management and inference using SQL statements. For example, creating a model can be done using the CREATE MODEL statement, and using a model for inference can be done using the `SELECT * FROM FORECAST (...)` statement, making it more simple and convenient.
* **Avoid Data Migration**: Using IoTDB-native machine learning can directly apply data stored in IoTDB to machine learning model inference without moving data to a separate machine learning service platform, thus accelerating data processing, improving security, and reducing costs.

![](/img/h1.png)

* **Built-in Advanced Algorithms**: Supports industry-leading machine learning analysis algorithms, covering typical time series analysis tasks, and empowering time series databases with native data analysis capabilities. For example:
    * **Time Series Forecasting**: Learning change patterns from past time series data; outputting the most likely predictions for future sequences based on given past observations.
    * **Time Series Anomaly Detection**: Detecting and identifying abnormal values in given time series data to help discover abnormal behavior in time series.

## 2. Basic Concepts

* **Model (Model)**: A machine learning model that takes time series data as input and outputs the results or decisions of the analysis task. The model is the basic management unit of AINode, supporting the creation (registration), deletion, query, modification (fine-tuning), and use (inference) of models.
* **Create (Create)**: Load the external designed or trained model file or algorithm into AINode, managed and used uniformly by IoTDB.
* **Inference (Inference)**: Use the created model to complete the time series analysis task on the specified time series data.
* **Built-in (Built-in)**: AINode comes with common time series analysis scenario (e.g., prediction and anomaly detection) machine learning algorithms or self-developed models.

![](/img/AINode-en.png)

## 3. Installation and Deployment

AINode deployment can be referred to the documentation [AINode Deployment](../Deployment-and-Maintenance/AINode_Deployment_Upgrade_timecho.md).

## 4. Usage Guide

TimechoDB-AINode supports three major functions: model inference, model fine-tuning, and model management (registration, viewing, deletion, loading, unloading, etc.). The following sections will provide detailed explanations.

### 4.1 Model Inference

TimechoDB-AINode provides the following time series prediction capabilities:

* **Univariate Prediction**: Supports prediction of a single target variable.
* **Covariate Prediction**: Can simultaneously predict multiple target variables and supports introducing covariates in prediction to improve accuracy.

The following sections will detail the syntax definition, parameter descriptions, and usage examples of the prediction inference function.

1. **SQL Syntax**

```SQL
SELECT * FROM FORECAST(
   MODEL_ID,
   TARGETS, -- SQL to get target variables
   [HISTORY_COVS, -- String, SQL to get historical covariates
   FUTURE_COVS, -- String, SQL to get future covariates
   OUTPUT_START_TIME,
   OUTPUT_LENGTH, 
   OUTPUT_INTERVAL,
   TIMECOL, 
   PRESERVE_INPUT,
   MODEL_OPTIONS]?
)
```

* Built-in model inference does not require a registration process. By using the forecast function and specifying model_id, you can use the inference function of the model.
* Parameter description

| Parameter Name | Parameter Type | Parameter Attributes | Description | Required | Notes |
|----------------|----------------|----------------------|-------------|----------|-------|
| model_id | Scalar parameter | String type | Unique identifier of the prediction model | Yes | |
| targets | Table parameter | SET SEMANTIC | Input data for the target variables to be predicted. IoTDB will automatically sort the data in ascending order of time before passing it to AINode. | Yes | Use SQL to describe the input data with target variables. If the input SQL is invalid, corresponding query errors will be reported. |
| history_covs | Scalar parameter | String type (valid table model query SQL), default: none | Specifies historical data of covariates for this prediction task, which are used to assist in predicting target variables. AINode will not output prediction results for historical covariates. Before passing data to the model, AINode will automatically sort the data in ascending order of time. | No | 1. Query results can only contain FIELD columns; 2. Other: Different models may have specific requirements, and errors will be thrown if not met. |
| future_covs | Scalar parameter | String type (valid table model query SQL), default: none | Specifies future data of some covariates for this prediction task, which are used to assist in predicting target variables. Before passing data to the model, AINode will automatically sort the data in ascending order of time. | No | 1. Can only be specified when history_covs is set; 2. The covariate names involved must be a subset of history_covs; 3. Query results can only contain FIELD columns; 4. Other: Different models may have specific requirements, and errors will be thrown if not met. |
| output_start_time | Scalar parameter | Timestamp type. Default value: last timestamp of target variable + output_interval | Starting timestamp of output prediction points [i.e., forecast start time] | No | Must be greater than the maximum timestamp of target variable timestamps |
| output_length | Scalar parameter | INT32 type. Default value: 96 | Output window size | No | Must be greater than 0 |
| output_interval | Scalar parameter | Time interval type. Default value: (last timestamp - first timestamp of input data) / n - 1 | Time interval between output prediction points. Supported units: ns, us, ms, s, m, h, d, w | No | Must be greater than 0 |
| timecol | Scalar parameter | String type. Default value: time | Name of time column | No | Must be a TIMESTAMP column existing in targets |
| preserve_input | Scalar parameter | Boolean type. Default value: false | Whether to retain all original rows of target variable input in the output result set | No | |
| model_options | Scalar parameter | String type. Default value: empty string | Key-value pairs related to the model, such as whether to normalize the input. Different key-value pairs are separated by ';'. | No | |

Notes:
* **Default behavior**: Predict all columns of targets. Currently, only supports INT32, INT64, FLOAT, DOUBLE types.
* **Input data requirements**:
    * Must contain a time column.
    * Row count requirements: If insufficient, an error will be reported; if exceeding the maximum, the last data will be automatically truncated.
    * Column count requirements: Univariate models only support single columns, multi-column will report errors; covariate models usually have no restrictions unless the model itself has clear constraints.
* **Output results**:
    * Includes all target variable columns, with data types consistent with the original table.
    * If `preserve_input=true` is specified, an additional `is_input` column will be added to identify original data rows.
* **Timestamp generation**:
    * Uses `OUTPUT_START_TIME` (optional) as the starting time point for prediction and divides historical and future data.
    * Uses `OUTPUT_INTERVAL` (optional, default is the sampling interval of input data) as the output time interval. The timestamp of the Nth row is calculated as: `OUTPUT_START_TIME + (N - 1) * OUTPUT_INTERVAL`.

2. **Usage Examples**

**Example 1: Univariate Prediction**

Create database etth and table eg in advance

```SQL
create database etth;
create table eg (hufl FLOAT FIELD, hull FLOAT FIELD, mufl FLOAT FIELD, mull FLOAT FIELD, lufl FLOAT FIELD, lull FLOAT FIELD, ot FLOAT FIELD)
```

Prepare original data [ETTh1-tab](/img/ETTh1-tab.csv)

Use the first 96 rows of data from column ot in table eg to predict its future 96 rows of data.

```SQL
IoTDB:etth> select Time, HUFL,HULL,MUFL,MULL,LUFL,LULL,OT from eg LIMIT 96
+-----------------------------+------+-----+-----+-----+-----+-----+------+
|                         Time|  HUFL| HULL| MUFL| MULL| LUFL| LULL|    OT|
+-----------------------------+------+-----+-----+-----+-----+-----+------+
|2016-07-01T00:00:00.000+08:00| 5.827|2.009|1.599|0.462|4.203| 1.34|30.531|
|2016-07-01T01:00:00.000+08:00| 5.693|2.076|1.492|0.426|4.142|1.371|27.787|
|2016-07-01T02:00:00.000+08:00| 5.157|1.741|1.279|0.355|3.777|1.218|27.787|
|2016-07-01T03:00:00.000+08:00|  5.09|1.942|1.279|0.391|3.807|1.279|25.044|
......
Total line number = 96
It costs 0.119s

IoTDB:etth> select * from forecast( 
     model_id => 'sundial',
     targets => (select Time, ot from etth.eg where time >= 2016-08-07T18:00:00.000+08:00 limit 1440) order BY time,
     output_length => 96
)
+-----------------------------+---------+
|                         time|       ot|
+-----------------------------+---------+
|2016-10-06T18:00:00.000+08:00|20.781654|
|2016-10-06T19:00:00.000+08:00|20.252121|
|2016-10-06T20:00:00.000+08:00|19.960138|
|2016-10-06T21:00:00.000+08:00|19.662334|
......
Total line number = 96
It costs 1.615s
```

**Example 2: Covariate Prediction**

Create table tab_real (to store original real data) in advance

```SQL
create table tab_real (target1 DOUBLE FIELD, target2 DOUBLE FIELD, cov1 DOUBLE FIELD, cov2 DOUBLE FIELD, cov3 DOUBLE FIELD);
```

Prepare original data

```SQL
IoTDB:etth> SELECT * FROM tab_real
+-----------------------------+-------+-------+----+----+----+
|                         time|target1|target2|cov1|cov2|cov3|
+-----------------------------+-------+-------+----+----+----+
|1970-01-01T08:00:00.001+08:00|    1.0|    1.0| 1.0| 1.0| 1.0|
|1970-01-01T08:00:00.002+08:00|    2.0|    2.0| 2.0| 2.0| 2.0|
|1970-01-01T08:00:00.003+08:00|    3.0|    3.0| 3.0| 3.0| 3.0|
|1970-01-01T08:00:00.004+08:00|    4.0|    4.0| 4.0| 4.0| 4.0|
|1970-01-01T08:00:00.005+08:00|    5.0|    5.0| 5.0| 5.0| 5.0|
|1970-01-01T08:00:00.006+08:00|    6.0|    6.0| 6.0| 6.0| 6.0|
|1970-01-01T08:00:00.007+08:00|   null|   null|null|null| 7.0|
|1970-01-01T08:00:00.008+08:00|   null|   null|null|null| 8.0|
+-----------------------------+-------+-------+----+----+----+


-- Insert statement
IoTDB:etth> INSERT INTO tab_real (time, target1, target2, cov1, cov2, cov3) VALUES
(1, 1.0, 1.0, 1.0, 1.0, 1.0),
(2, 2.0, 2.0, 2.0, 2.0, 2.0),
(3, 3.0, 3.0, 3.0, 3.0, 3.0),
(4, 4.0, 4.0, 4.0, 4.0, 4.0),
(5, 5.0, 5.0, 5.0, 5.0, 5.0),
(6, 6.0, 6.0, 6.0, 6.0, 6.0),
(7, NULL, NULL, NULL, NULL, 7.0),
(8, NULL, NULL, NULL, NULL, 8.0);
```

* Prediction task 1: Use historical covariates cov1, cov2, and cov3 to assist in predicting target variables target1 and target2.

  ![](/img/ainode-upgrade-table-forecast-timecho-1-en.png)

    * Use the first 6 rows of historical data from cov1, cov2, cov3, target1, target2 in table tab_real to predict the next 2 rows of target variables target1 and target2.
      ```SQL
      IoTDB:etth> SELECT * FROM FORECAST (
          MODEL_ID => 'chronos2',
          TARGETS => (
              SELECT TIME, target1, target2
              FROM etth.tab_real
              WHERE TIME < 7
              ORDER BY TIME DESC
              LIMIT 6) ORDER BY TIME,
          HISTORY_COVS => '
              SELECT TIME, cov1, cov2, cov3
              FROM etth.tab_real
              WHERE TIME < 7
              ORDER BY TIME DESC
              LIMIT 6',
          OUTPUT_LENGTH => 2
      )
      +-----------------------------+-----------------+-----------------+
      |                         time|          target1|          target2|
      +-----------------------------+-----------------+-----------------+
      |1970-01-01T08:00:00.007+08:00|7.338330268859863|7.338330268859863|
      |1970-01-01T08:00:00.008+08:00| 8.02529525756836| 8.02529525756836|
      +-----------------------------+-----------------+-----------------+
      Total line number = 2
      It costs 0.315s
      ```
* Prediction task 2: Use historical covariates cov1, cov2 and known covariates cov3 in the same table to assist in predicting target variables target1 and target2.

  ![](/img/ainode-upgrade-table-forecast-timecho-2-en.png)

    * Use the first 6 rows of historical data from cov1, cov2, cov3, target1, target2 in table tab_real, and known covariate cov3 in the future 2 rows of the same table to predict the next 2 rows of target variables target1 and target2.
      ```SQL
      IoTDB:etth> SELECT * FROM FORECAST (
          MODEL_ID => 'chronos2',
          TARGETS => (
              SELECT TIME, target1, target2
              FROM etth.tab_real
              WHERE TIME < 7
              ORDER BY TIME DESC
              LIMIT 6) ORDER BY TIME,
          HISTORY_COVS => '
              SELECT TIME, cov1, cov2, cov3
              FROM etth.tab_real
              WHERE TIME < 7
              ORDER BY TIME DESC
              LIMIT 6',
          FUTURE_COVS => '
              SELECT TIME, cov3
              FROM etth.tab_real
              WHERE TIME >= 7
              LIMIT 2',
          OUTPUT_LENGTH => 2
      )
      +-----------------------------+-----------------+-----------------+
      |                         time|          target1|          target2|
      +-----------------------------+-----------------+-----------------+
      |1970-01-01T08:00:00.007+08:00|7.244050025939941|7.244050025939941|
      |1970-01-01T08:00:00.008+08:00|7.907227516174316|7.907227516174316|
      +-----------------------------+-----------------+-----------------+
      Total line number = 2
      It costs 0.291s
      ```
* Prediction task 3: Use historical covariates cov1, cov2 from different tables and known covariates cov3 to assist in predicting target variables target1 and target2.

  ![](/img/ainode-upgrade-table-forecast-timecho-3-en.png)

    * Create table tab_cov_forecast (to store known covariate cov3 prediction values) in advance, and prepare related data.
      ```SQL
      create table tab_cov_forecast (cov3 DOUBLE FIELD);
      
      -- Insert statement
      INSERT INTO tab_cov_forecast (time, cov3) VALUES (7, 7.0),(8, 8.0);
      
      IoTDB:etth> SELECT * FROM tab_cov_forecast
      +----+----+
      |time|cov3|
      +----+----+
      |   7| 7.0|
      |   8| 8.0|
      +----+----+
      ```
    * Use the first 6 rows of known data from cov1, cov2, cov3, target1, target2 in table tab_real, and known covariate cov3 in the future 2 rows from table tab_cov_forecast to predict the next 2 rows of target variables target1 and target2.
      ```SQL
      IoTDB:etth> SELECT * FROM FORECAST (
          MODEL_ID => 'chronos2',
          TARGETS => (
              SELECT TIME, target1, target2
              FROM etth.tab_real
              WHERE TIME < 7
              ORDER BY TIME DESC
              LIMIT 6) ORDER BY TIME,
          HISTORY_COVS => '
              SELECT TIME, cov1, cov2, cov3
              FROM etth.tab_real
              WHERE TIME < 7
              ORDER BY TIME DESC
              LIMIT 6',
          FUTURE_COVS => '
              SELECT TIME, cov3
              FROM etth.tab_cov_forecast
              WHERE TIME >= 7
              LIMIT 2',
          OUTPUT_LENGTH => 2
      )
      +-----------------------------+-----------------+-----------------+
      |                         time|          target1|          target2|
      +-----------------------------+-----------------+-----------------+
      |1970-01-01T08:00:00.007+08:00|7.244050025939941|7.244050025939941|
      |1970-01-01T08:00:00.008+08:00|7.907227516174316|7.907227516174316|
      +-----------------------------+-----------------+-----------------+
      Total line number = 2
      It costs 0.351s
      ```


### 4.2 Model Fine-Tuning

AINode supports model fine-tuning through SQL.

**SQL Syntax**

```SQL
createModelStatement
    | CREATE MODEL modelId=identifier (WITH HYPERPARAMETERS '(' hparamPair (',' hparamPair)* ')')? FROM MODEL existingModelId=identifier ON DATASET '(' targetData=string ')'
    ;
hparamPair
    : hparamKey=identifier '=' hyparamValue=primaryExpression
    ;
```

**Parameter Description**

| Name | Description                                                                                                                                                                                                                                                  |
|------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| modelId | Unique identifier of the fine-tuned model                                                                                                                                                                                                                    |
| hparamPair | Hyperparameter key-value pairs used for fine-tuning, currently supports the following: <br>  `train_epochs`: int type, number of fine-tuning epochs  <br> `iter_per_epoch`: int type, number of iterations per epoch <br>  `learning_rate`: double type, learning rate |
| existingModelId | Base model used for fine-tuning                                                                                                                                                                                                                              |
| targetData | SQL to get the dataset used for fine-tuning                                                                                                                                                                                                                  |

**Example**

1. Select data from the ot field in the specified time range as the fine-tuning dataset, and create the model sundialv3 based on sundial.

```SQL
IoTDB> set sql_dialect=table
Msg: The statement is executed successfully.
IoTDB> CREATE MODEL sundialv3 FROM MODEL sundial ON DATASET ('SELECT time, ot from etth.eg where 1467302400000 <= time and time < 1517468400001')
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
|            sundialv2|  sundial| fine_tuned|   active|
|            sundialv3|  sundial| fine_tuned| training| 
+---------------------+---------+-----------+---------+
```

2. Fine-tuning tasks are started asynchronously in the background, which can be seen in the AINode process log; after fine-tuning is completed, query and use the new model.

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
|            sundialv3|  sundial| fine_tuned|   active|
+---------------------+---------+-----------+---------+
```

### 4.3 Register Custom Models

**The following Transformers models can be registered to AINode:**

1. AINode currently uses transformers version 4.56.2, so when building the model, avoid inheriting interfaces from lower versions (<4.50);
2. The model must inherit a pipeline for inference tasks of AINode (currently supports prediction pipeline):
    1. iotdb-core/ainode/iotdb/ainode/core/inference/pipeline/basic_pipeline.py

   ```Python
   class BasicPipeline(ABC):
       def __init__(self, model_id, **model_kwargs):
           self.model_info = model_info
           self.device = model_kwargs.get("device", "cpu")
           self.model = load_model(model_info, device_map=self.device, **model_kwargs)
   
       @abstractmethod
       def preprocess(self, inputs, **infer_kwargs):
           """
           Preprocess input data before the inference task, including shape validation and numerical conversion.
           """
           pass
   
       @abstractmethod
       def postprocess(self, output, **infer_kwargs):
           """
           Postprocess output results after the inference task.
           """
           pass
   
   
   class ForecastPipeline(BasicPipeline):
       def __init__(self, model_info, **model_kwargs):
           super().__init__(model_info, model_kwargs=model_kwargs)
   
       def preprocess(self, inputs: list[dict[str, dict[str, torch.Tensor] | torch.Tensor]], **infer_kwargs):
           """
           Preprocess input data before passing it to the model for inference, validate input data shape and type.
   
           Args:
               inputs (list[dict]):
                   Input data, list of dictionaries, each dictionary contains:
                       - 'targets': tensor of shape (input_length,) or (target_count, input_length).
                       - 'past_covariates': optional, tensor dictionary, each tensor of shape (input_length,).
                       - 'future_covariates': optional, tensor dictionary, each tensor of shape (input_length,).
   
               infer_kwargs (dict, optional): Additional keyword parameters for inference, such as:
                   - `output_length`(int): If 'future_covariates' is provided, used to validate its validity.
   
           Raises:
               ValueError: If input format is incorrect (e.g., missing keys, invalid tensor shapes).
   
           Returns:
               Processed and validated input data, ready for model inference.
           """
           pass
   
       def forecast(self, inputs, **infer_kwargs):
           """
           Perform prediction on given input.
   
           Parameters:
               inputs: Input data for prediction. Type and structure depend on the model's specific implementation.
               **infer_kwargs: Additional inference parameters, e.g.:
                   - `output_length`(int): Number of time points the model should generate.
   
           Returns:
               Prediction output, specific form depends on the model's specific implementation.
           """
           pass
   
       def postprocess(self, outputs: list[torch.Tensor], **infer_kwargs) -> list[torch.Tensor]:
           """
           Postprocess model output after inference, validate output data shape and ensure it meets expected dimensions.
   
           Args:
               outputs:
                   Model output, list of 2D tensors, each tensor of shape `[target_count, output_length]`.
   
           Raises:
               InferenceModelInternalException: If output tensor shape is invalid (e.g., dimension error).
               ValueError: If output format is incorrect.
   
           Returns:
               list[torch.Tensor]:
                   Postprocessed output, a list of 2D tensors.
           """
           pass
   ```
3. Modify the model configuration file config.json to ensure it includes the following fields:
   ```JSON
   {
       "auto_map": {
           "AutoConfig": "config.Chronos2CoreConfig",        // Specify the Config class of the model
           "AutoModelForCausalLM": "model.Chronos2Model"     // Specify the model class
       },
       "pipeline_cls": "pipeline_chronos2.Chronos2Pipeline", // Specify the model's inference pipeline
       "model_type": "custom_t5",                            // Specify the model type
   }
   ```

    1. Must specify the Config class and model class through auto_map;
    2. Must integrate and specify the inference pipeline class;
    3. For built-in (builtin) and custom (user_defined) models managed by AINode, the model category (model_type) also serves as a unique identifier. That is, the model category to be registered must not duplicate any existing model types. Models created through fine-tuning will inherit the model category of the original model.
4. Ensure the model directory to be registered contains the following files, and the model configuration file name and weight file name are not customizable:
    1. Model configuration file: config.json;
    2. Model weight file: model.safetensors;
    3. Model code: other .py files.

**The SQL syntax for registering custom models is as follows:**

```SQL
CREATE MODEL <model_id> USING URI <uri>
```

**Parameter Description:**

* **model_id**: Unique identifier for the custom model; cannot be duplicated, with the following constraints:
    * Allowed characters: [0-9 a-z A-Z \_ ] (letters, numbers (not at the beginning), underscore (not at the beginning))
    * Length limit: 2-64 characters
    * Case-sensitive
* **uri**: Local URI address containing the model code and weights.

**Registration Example:**

Upload a custom Transformers model from a local path, AINode will copy the folder to the user_defined directory.

```SQL
CREATE MODEL chronos2 USING URI 'file:///path/to/chronos2'
```

After executing the SQL, the registration process will be asynchronous. The registration status of the model can be viewed by checking the model display (see the "Viewing Models" section). After the model is registered successfully, it can be called using normal query methods for model inference.

### 4.4 Viewing Models

Registered models can be queried using the view command.

```SQL
SHOW MODELS
```

In addition to displaying all model information directly, you can specify `model_id` to view the information of a specific model.

```SQL
SHOW MODELS <model_id> -- Only show specific model
```

The result of the model display contains the following:

| **ModelId** | **ModelType** | **Category** | **State** |
| ------------------- | --------------------- | -------------------- | ----------------- |
| Model ID | Model Type | Model Category | Model State |

Where, the State model status machine flowchart is as follows:

![](/img/ainode-upgrade-state-timecho-en.png)

State machine flow description:

1. After starting AINode, executing `show models` command, only **system built-in (BUILTIN)** models can be viewed.
2. Users can import their own models, which are identified as **user-defined (USER_DEFINED)**; AINode will try to parse the model type (ModelType) from the model configuration file; if parsing fails, this field will be displayed as empty.
3. Time series large models (built-in models) do not have weight files packaged with AINode, and AINode automatically downloads them when starting.
    1. During download, it is ACTIVATING, and after successful download, it becomes ACTIVE, and if failed, it becomes INACTIVE.
4. After users start a model fine-tuning task, the model state during training is TRAINING, and after successful training, it becomes ACTIVE, and if failed, it becomes FAILED.
5. If the fine-tuning task is successful, after fine-tuning, all ckpt (training files) will be statistically analyzed to find the best file and automatically renamed to the user-specified model_id.

**Viewing Example**

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

**Built-in Traditional Time Series Models:**

| Model Name                              | Core Concept                                                                 | Applicable Scenarios                                      | Key Features                                                                 |
|-----------------------------------------|------------------------------------------------------------------------------|-----------------------------------------------------------|------------------------------------------------------------------------------|
| **ARIMA** (Autoregressive Integrated Moving Average) | Combines AR, differencing (I), and MA for stationary or differenced series | Univariate forecasting (stock prices, sales, economics)  | 1. For linear trends with weak seasonality2. Requires (p,d,q) tuning3. Sensitive to missing values |
| **Holt-Winters** (Triple Exponential Smoothing) | Exponential smoothing with level, trend, and seasonal components           | Data with clear trend & seasonality (monthly sales, power demand) | 1. Handles additive/multiplicative seasonality2. Weights recent data higher3. Simple implementation |
| **Exponential Smoothing**               | Weighted average of history with exponentially decaying weights            | Trending but non-seasonal data (short-term demand)        | 1. Few parameters, simple computation2. Suitable for stable/slow-changing series3. Extensible to double/triple smoothing |
| **Naive Forecaster**                    | Uses last observation as next prediction (simplest baseline)               | Benchmarking or data with no clear pattern                | 1. No training needed2. Sensitive to sudden changes3. Seasonal variant uses prior season value |
| **STL Forecaster**                      | Decomposes series into trend, seasonal, residual; forecasts components     | Complex seasonality/trends (climate, traffic)             | 1. Handles non-fixed seasonality2. Robust to outliers3. Components can use other models |
| **Gaussian HMM**                        | Hidden states generate observations; each state follows Gaussian distribution | State sequence prediction/classification (speech, finance) | 1. Models temporal state transitions2. Observations independent per state3. Requires state count |
| **GMM HMM**                             | Extends Gaussian HMM; each state uses Gaussian Mixture Model               | Multi-modal observation scenarios (motion recognition, biosignals) | 1. More flexible than single Gaussian2. Higher complexity3. Requires GMM component count |
| **STRAY** (Search for Outliers using Random Projection and Adaptive Thresholding) | Uses SVD to detect anomalies in high-dimensional time series             | High-dimensional anomaly detection (sensor networks, IT monitoring) | 1. No distribution assumption2. Handles high dimensions3. Sensitive to global anomalies |

**Built-in Time Series Large Models:**

| Model Name      | Core Concept                                                                 | Applicable Scenarios                                      | Key Features                                                                 |
|-----------------|------------------------------------------------------------------------------|-----------------------------------------------------------|------------------------------------------------------------------------------|
| **Timer-XL**    | Long-context time series large model pretrained on massive industrial data  | Complex industrial forecasting requiring ultra-long history (energy, aerospace, transport) | 1. Supports input of tens of thousands of time points2. Covers non-stationary, multivariate, and covariate scenarios3. Pretrained on trillion-scale high-quality industrial IoT data |
| **Timer-Sundial** | Generative foundation model with "Transformer + TimeFlow" architecture     | Zero-shot forecasting requiring uncertainty quantification (finance, supply chain, renewable energy) | 1. Strong zero-shot generalization; supports point & probabilistic forecasting2. Flexible analysis of any prediction distribution statistic3. Innovative flow-matching architecture for efficient non-deterministic sample generation |
| **Chronos-2**   | Universal time series foundation model based on discrete tokenization       | Rapid zero-shot univariate forecasting; scenarios enhanced by covariates (promotions, weather) | 1. Powerful zero-shot probabilistic forecasting2. Unified multi-variable & covariate modeling (strict input requirements):&nbsp;&nbsp;a. Future covariate names ⊆ historical covariate names&nbsp;&nbsp;b. Each historical covariate length = target length&nbsp;&nbsp;c. Each future covariate length = prediction length3. Efficient encoder-only structure balancing performance and speed |

### 4.5 Model Deletion

Registered models can be deleted via SQL. AINode removes the corresponding model folder under `user_defined`. Syntax:
```SQL
DROP MODEL <model_id>
```
- Requires specifying an existing `model_id`.
- Deletion is asynchronous (status: `DROPPING`), during which the model cannot be used for inference.
- **Built-in models cannot be deleted.**

### 4.6 Loading/Unloading Models

AINode supports two loading strategies:
* **On-Demand Loading**: Load model temporarily during inference, then release resources. Suitable for testing or low-load scenarios.
* **Persistent Loading**: Keep model instances resident in CPU memory or GPU VRAM to support high-concurrency inference. Users specify load/unload targets via SQL; AINode auto-manages instance counts. Current loaded status is queryable.

Details below:

1. **Configuration Parameters**  
   Edit these settings to control persistent loading behavior:
   ```properties
   # Ratio of total device memory/VRAM usable by AINode for inference
   # Datatype: Float
   ain_inference_memory_usage_ratio=0.4
   
   # Memory overhead ratio per loaded model instance (model_size * this_value)
   # Datatype: Float
   ain_inference_extra_memory_ratio=1.2
   ```

2. **List Available Devices**
   ```SQL
   SHOW AI_DEVICES
   ```
   Example:
   ```SQL
   IoTDB> SHOW AI_DEVICES
   +-------------+
   |     DeviceId|
   +-------------+
   |          cpu|
   |            0|
   |            1|
   +-------------+
   ```

3. **Load Model**  
   Manually load model; system auto-balances instance count based on resources:
   ```SQL
   LOAD MODEL <existing_model_id> TO DEVICES <device_id>(, <device_id>)*
   ```
   Parameters:
    * `existing_model_id`: Model ID (current version supports `timer_xl` and `sundial` only)
    * `device_id`:
        * `cpu`: Load into server memory
        * `gpu_id`: Load into specified GPU(s), e.g., `'0,1'` for GPUs 0 and 1  
          Example:
   ```SQL
   LOAD MODEL sundial TO DEVICES 'cpu,0,1'
   ```

4. **Unload Model**  
   Unload all instances of a model; system reallocates freed resources:
   ```SQL
   UNLOAD MODEL <existing_model_id> FROM DEVICES <device_id>(, <device_id>)*
   ```
   Parameters same as `LOAD MODEL`.  
   Example:
   ```SQL
   UNLOAD MODEL sundial FROM DEVICES 'cpu,0,1'
   ```

5. **View Loaded Models**
   ```SQL
   SHOW LOADED MODELS
   SHOW LOADED MODELS <device_id>(, <device_id>)*  -- Filter by device
   ```
   Example (sundial loaded on CPU, GPU 0, GPU 1):
   ```SQL
   IoTDB> SHOW LOADED MODELS
   +-------------+--------------+------------------+
   |     DeviceId|       ModelId|  Count(instances)|
   +-------------+--------------+------------------+
   |          cpu|       sundial|                 4|
   |            0|       sundial|                 6|
   |            1|       sundial|                 6|
   +-------------+--------------+------------------+
   ```
    * `DeviceId`: Device identifier
    * `ModelId`: Loaded model ID
    * `Count(instances)`: Number of model instances per device (auto-assigned by system)

### 4.7 Large Time Series Models

AINode supports multiple large time series models. For deployment details, refer to [Time Series Large Model](../AI-capability/TimeSeries-Large-Model_Upgrade_timecho.md)

### 5. Permission Management

Use IoTDB's built-in authentication for AINode permissions. Users need `USE_MODEL` permission to manage models and access input data for inference.

| **Permission**      | **Scope**                      | **Administrator (default ROOT)** | **Normal User** |
|---------------------|--------------------------------|----------------------------------|-----------------|
| USE_MODEL           | create model / show models / drop model | √                               | √               |
| READ_SCHEMA&READ_DATA | forecast                        | √                               | √               |