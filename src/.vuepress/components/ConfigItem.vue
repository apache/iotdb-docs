<!-- 
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
-->

<script setup lang="ts">
import { ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElTooltip, ElIcon } from "element-plus/es";
import 'element-plus/theme-chalk/index.css';
import * as Icons from "@element-plus/icons-vue";

const props = defineProps<{
  index?: number;
}>();

const formData = defineModel('info', {
    default: () => ({
        measurementCount: null,
        dataType: null,
        frequency: null,
        frequencyUnit: null,
        averageStringLength: null,
    })  
});

const need4columns = (dataType: string | null) => {
    return dataType === 'TEXT' || dataType === 'STRING' || dataType === 'BLOB';
};

</script>

<template>
  <div class="outer-box">
    <div class="config-title">配置项 {{ index }}</div>
    <el-form :inline="true" class="config-row">
        <el-form-item label="测点数量：" label-width="85px">
            <el-input v-model="formData.measurementCount" placeholder="请输入测点数量" type="number" min="0" :style="{ width: need4columns(formData.dataType) ? '150px' : '205px'}"></el-input>
        </el-form-item>
        <el-form-item label-width="100px">
            <template #label>
                数据类型：
                <client-only>
                    <el-tooltip placement="top" effect="light">
                        <template #content>
                            字符串（TEXT）平均长度说明：
                            <ul>
                                <li>ASCII 字母和符号（如 A-Z, a-z, 0-9, l@# 等）：1 字节</li>
                                <li>常见汉字：3 字节（UTF-8）</li>
                                <li>Emoji 和特殊符号：通常 3-4 字节（UTF-8）</li>
                            </ul>
                        </template>
                        <el-icon><Icons.QuestionFilled /></el-icon>
                    </el-tooltip>
                </client-only>
            </template>
            <el-select v-model="formData.dataType" placeholder="请选择数据类型" :style="{ width: need4columns(formData.dataType) ? '155px' : '205px'}">
                <el-option label="BOOLEAN (9字节)" value="BOOLEAN"></el-option>
                <el-option label="INT32 (12字节)" value="INT32"></el-option>
                <el-option label="INT64 (16字节)" value="INT64"></el-option>
                <el-option label="FLOAT (12字节)" value="FLOAT"></el-option>
                <el-option label="DOUBLE (16字节)" value="DOUBLE"></el-option>
                <el-option label="TEXT (8+a字节)" value="TEXT"></el-option>
                <el-option label="STRING (8+a字节)" value="STRING"></el-option>
                <el-option label="BLOB (8+a字节)" value="BLOB"></el-option>
                <el-option label="TIMESTAMP (16字节)" value="TIMESTAMP"></el-option>
                <el-option label="DATE (12字节)" value="DATE"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="采样频率：" label-width="85px">
            <el-input v-model="formData.frequency" placeholder="请输入采样频率" type="number" min="0" :style="{ width: need4columns(formData.dataType) ? '135px' : '205px'}"></el-input>
            <el-select v-model="formData.frequencyUnit" placeholder="请选择频率单位" :style="{ width: need4columns(formData.dataType) ? '65px' : '130px'}">
                <el-option label="HZ" value="HZ"></el-option>
                <el-option label="秒" value="SECOND"></el-option>
                <el-option label="分钟" value="MINUTE"></el-option>
                <el-option label="小时" value="HOUR"></el-option>
                <el-option label="天" value="DAY"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="字符串平均长度(a)：" label-width="160px" v-if="need4columns(formData.dataType)">
            <el-input v-model="formData.averageStringLength" type="number" style="width: 140px;"></el-input>
        </el-form-item>
    </el-form>
  </div>
</template>

<style>
.outer-box {
    border: 2px solid rgb(239, 238, 238);
    border-radius: 15px;
    padding: 15px 50px 25px;
    margin-bottom: 20px;
}

.config-title {
    text-align: center;
}

.config-row {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
}

.config-row .el-form-item {
    margin-right: 0;
}

</style>
