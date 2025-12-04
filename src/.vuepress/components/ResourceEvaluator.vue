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
import { computed, ref } from "vue";
import { ElButton, ElIcon, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElTooltip } from "element-plus/es";
import * as Icons from "@element-plus/icons-vue";
import 'element-plus/theme-chalk/index.css';
import ConfigItem from "./ConfigItem.vue";

class Calculator {
  static add(...args: Array<string | number>): number {
    const [a, b, ...ns] = args;
    const m = this.fixParam(a!, 0);
    const n = this.fixParam(b!, 0);
    const len1 = this.getDecimalLen(m);
    const len2 = this.getDecimalLen(n);
    const len = Math.max(len1, len2);
    const intM = this.movePoint(m, 'right', len);
    const intN = this.movePoint(n, 'right', len);
    const intSum = intM + intN;
    const sum = this.movePoint(intSum, 'left', len);
    if (ns.length) {
      return this.add(sum, ...ns);
    }
    return sum;
  }

  static subtract(...args: Array<string | number>): number {
    const arr = args.slice(1).map((n) => -Number(n));
    return this.add(args[0]!, ...arr);
  }

  static multiply(...args: Array<string | number>): number {
    const [a, b, ...ns] = args;
    const m = this.fixParam(a!, 1);
    const n = this.fixParam(b!, 1);
    const len1 = this.getDecimalLen(m);
    const len2 = this.getDecimalLen(n);
    const len = len1 + len2;
    const intM = this.movePoint(m, 'right', len1);
    const intN = this.movePoint(n, 'right', len2);
    const intProduct = intM * intN;
    const product = this.movePoint(intProduct, 'left', len);
    if (ns.length) {
      return this.multiply(product, ...ns);
    }
    return product;
  }

  static divide(...args: Array<string | number>): number {
    const [a, b, ...ns] = args;
    const m = this.fixParam(a!, 1);
    const n = this.fixParam(b!, 1);
    const len1 = this.getDecimalLen(m);
    const len2 = this.getDecimalLen(n);
    const len = Math.max(len1, len2);
    const intM = this.movePoint(m, 'right', len);
    const intN = this.movePoint(n, 'right', len);
    const intQuotient = intM / intN;
    const quotient = intQuotient;
    if (ns.length) {
      return this.divide(quotient, ...ns);
    }
    return quotient;
  }

  /**
   * 获取小数部分
   */
  static getDecimal(num: number): string {
    return String(num).split('.')[1] || '0';
  }

  /**
   * 获取小数部分长度
   */
  static getDecimalLen(num: number): number {
    const decimal = this.getDecimal(num);
    if (decimal && decimal !== '0') {
      return decimal.length;
    }
    return 0;
  }

  static movePoint(num: string | number, direction: 'left' | 'right', digits: number) {
    let str = String(num);
    let prefix = str[0];
    if (prefix === '-') {
      str = str.replace('-', '');
    } else {
      prefix = '';
    }
    const n = direction === 'left' ? this.movePoint2Left(str, digits) : this.movePoint2Right(str, digits);
    return Number(`${prefix}${n}`);
  }

  static movePoint2Left(num: string | number, digits: number) {
    const arr = String(num).split('');
    let index = arr.indexOf('.');
    if (index === -1) {
      arr.push('.');
      arr.push('0');
      index = arr.indexOf('.');
    }
    for (let i = 0; i < digits; i += 1) {
      if (i >= index) {
        arr[0] = '0';
        arr.unshift('.');
      } else {
        const j = index - i;
        const m = arr[j]!;
        const n = arr[j - 1]!;
        arr[j] = n;
        arr[j - 1] = m;
      }
    }
    return Number(arr.join(''));
  }

  static movePoint2Right(num: string | number, digits: number) {
    const arr = String(num).split('');
    const index = arr.indexOf('.');
    if (index === -1) {
      for (let i = 0; i < digits; i += 1) {
        arr.push('0');
      }
    } else {
      for (let i = 0; i <= digits; i += 1) {
        const j = index + i;
        const m = arr[j];
        if (j === arr.length - 1 && m === '.') {
          arr.pop();
        } else if (m !== '.') {
          arr.push('0');
        } else {
          const n = arr[j + 1]!;
          arr[j] = n;
          arr[j + 1] = m;
        }
      }
    }
    return Number(arr.join(''));
  }

  static fixParam(a: number | string, val: number) {
    if (['', undefined, null]!.includes(a as string | null | undefined)) {
      return val;
    }
    if (typeof a === 'boolean') {
      return val;
    }
    if (Number.isNaN(Number(a))) {
      return val;
    }
    return Number(a);
  }

  static toFixed(n: number | string, end: number): number {
    const arrN = `${n}`.split('.');
    if (arrN.length === 1) {
      return Number(n);
    }
    arrN[1] = arrN[1]!.substring(0, end);
    return Number(arrN.join('.'));
  }
}

const totalSpaceInBytes = ref(0);
const singleSpaceStorage = computed(() => {
    let tmp = Calculator.toFixed(Calculator.divide(totalSpaceInBytes.value, 1024, 1024, 1024), 2);
    if (tmp >= 1024) {
        return Calculator.toFixed(Calculator.divide(totalSpaceInBytes.value, 1024, 1024, 1024, 1024), 2).toString() + ' TB';
    } else {
        return tmp.toString() + ' GB';
    }
});
const doubleSpaceStorage = computed(() => {
    let tmp = Calculator.toFixed(Calculator.divide(Calculator.multiply(totalSpaceInBytes.value, 2), 1024, 1024, 1024), 2);
    if (tmp >= 1024) {
        return Calculator.toFixed(Calculator.divide(Calculator.multiply(totalSpaceInBytes.value, 2), 1024, 1024, 1024, 1024), 2).toString() + ' TB';
    } else {
        return tmp.toString() + ' GB';
    }
});

const configItems = ref([{
    measurementCount: null,
    dataType: null,
    frequency: null,
    frequencyUnit: 'HZ',
    averageStringLength: null,
}]);

const storeInfo = ref({
    storePeriod: null,
    storePeriodUnit: 'DAY',
    compressionRatio: null,
});

const addConfigItem = () => {
    configItems.value.push({
        measurementCount: null,
        dataType: null,
        frequency: null,
        frequencyUnit: 'HZ',
        averageStringLength: null,
    });
};

const removeConfigItem = (index: number) => {
    if (configItems.value.length > 1) {
        configItems.value.splice(index, 1);
    } else {
        alert('至少保留一个配置项');
    }
};

const dataTypeBytes: Record<string, number> = {
    'BOOLEAN': 9,
    'INT32': 12,
    'INT64': 16,
    'FLOAT': 12,
    'DOUBLE': 16,
    'TEXT': 8,
    'STRING': 8, 
    'BLOB': 8,  
    'TIMESTAMP': 16,
    'DATATIME': 12,
};

const storeDurationInDays: Record<string, number> = {
    'DAY': 1,
    'MONTH': 30,
    'YEAR': 365,
};

const samplingPeriodInSec: Record<string, number> = {
    'HZ': 1,
    'SECOND': 1,
    'MINUTE': 60,
    'HOUR': 3600,
    'DAY': 86400,
}



const calculateSpacePrecise = () => {
    let totalSpace = 0;
    configItems.value.forEach((item, index) => {
        if (item.measurementCount && item.frequency && item.dataType && item.frequencyUnit) {
            if (storeInfo.value.storePeriod && storeInfo.value.compressionRatio) {
                let measurementCount = item.measurementCount;
            let dataTypeSize = dataTypeBytes[item.dataType];
            if (item.dataType === 'STRING' || item.dataType === 'TEXT' || item.dataType === 'BLOB') {
                if (item.averageStringLength === null) {
                    alert('请填写字符串平均长度');
                    return;
                }
                dataTypeSize = Calculator.add(dataTypeSize, Number(item.averageStringLength));
            }
            let samplingPeriod = Calculator.multiply(samplingPeriodInSec[item.frequencyUnit], item.frequency);
            let samplePerDay = item.frequencyUnit === 'HZ' ? Calculator.multiply(86400, item.frequency) : Calculator.divide(86400, samplingPeriod);
            let storePeriodInDay = Calculator.multiply(storeDurationInDays[storeInfo.value.storePeriodUnit], Number(storeInfo.value.storePeriod));
            totalSpace = Calculator.add(totalSpace, Calculator.divide(Calculator.multiply(measurementCount, dataTypeSize, samplePerDay, storePeriodInDay), storeInfo.value.compressionRatio));
            } else {
                alert('请完整填写存储周期和压缩比');
                return;
            }
        } else {
            alert(`请完整填写配置项 ${index + 1} 的数据`);
            return;
        }
    });
    totalSpaceInBytes.value = totalSpace;
}

</script>

<template>
  <div class="content-area">
    <div class="title">IoTDB 磁盘资源评估器</div>
    <div v-for="(item, index) in configItems" :key="index" class="relative-box">
      <el-button class="add-button" @click="addConfigItem">
        <el-icon><Icons.Plus /></el-icon>
      </el-button>
      <el-button class="remove-button" @click="removeConfigItem(index)" :disabled="configItems.length <= 1">
        <el-icon><Icons.Minus /></el-icon>
      </el-button>
      <ConfigItem :index="index + 1" v-model:info="configItems[index]" />
    </div>
    <div class="outer-box">
      <el-form :inline="true" class="store-row">
          <el-form-item label="存储周期：" label-width="90px">
              <el-input v-model="storeInfo.storePeriod" placeholder="请输入存储周期" type="number" min="0" style="width: 205px;"></el-input>
              <el-select v-model="storeInfo.storePeriodUnit" style="width: 80px;">
                  <el-option label="天" value="DAY"></el-option>
                  <el-option label="月" value="MONTH"></el-option>
                  <el-option label="年" value="YEAR"></el-option>
              </el-select>
          </el-form-item>
          <el-form-item label-width="130px" >
            <template #label>
              预估压缩比：
              <client-only>
                <el-tooltip placement="top" effect="light" content="原始数据与压缩后数据的体积比值（压缩比 = 原始大小 / 压缩后大小）">
                  <el-icon color=""><Icons.QuestionFilled /></el-icon>
                </el-tooltip>
              </client-only>
            </template>
              <el-input v-model="storeInfo.compressionRatio" type="number" min="0" placeholder="请输入预估压缩比" style="width: 180px;"></el-input>
          </el-form-item>
      </el-form>
    </div>
    <div class="button-row">
      <el-button class="calculate-button" color="#4c59c7" @click="calculateSpacePrecise()">计算结果</el-button>
    </div>
    <div class="result-row">
      <el-form :inline="true">
        <el-form-item label-width="200px">
          <template #label>
            每节点共需磁盘空间：
            <client-only>
              <el-tooltip placement="top" effect="light">
                <template #content>
                  <ul>
                    <li>双活为两节点单副本（每台机器按单副本规划资源）</li>
                    <li>三节点分布式集群推荐使用双副本（每台机器按双副本规划资源）</li>
                  </ul>
                </template>
                <el-icon><Icons.QuestionFilled /></el-icon>
              </el-tooltip>
            </client-only>
          </template>
        </el-form-item>
        
        <el-form-item label="单副本空间：" label-width="150px">
          <div class="result-text">{{ singleSpaceStorage }}</div>
        </el-form-item>
        <el-form-item label="双副本空间：" label-width="150px">
          <div class="result-text">{{ doubleSpaceStorage }}</div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style>
#main-content .theme-hope-content {
    padding: 0;
}

header .vp-hero-info {
    visibility: hidden;
}

#main-content .vp-hero-info-wrapper {
    visibility: hidden;
}

.content-area {
    width: 1230px;
    margin-left: -35px;
}

.title {
    text-align: center;
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 40px;
}

.relative-box {
    position: relative;
}

.add-button {
    background-color: transparent;
    border: none;
    position: absolute;
    right: 48px;
    top: 8px;
}

.remove-button {
    background-color: transparent;
    border: none;
    position: absolute;
    right: 8px;
    top: 8px;
}

.store-row {
    display: flex;
    margin-top: 20px;
    margin-bottom: 20px;
}

.button-row {
    display: flex;
    justify-content: center;
    margin-top: 50px;
    margin-bottom: 30px;
}

.calculate-button {
  padding: 20px 30px;
}

.result-row {
    display: flex;
    justify-content: space-evenly;
    background-color: #f2f5fc;
    border-radius: 15px;
    padding: 30px;
    margin-bottom: 50px;
}

.result-text {
    color: #4c59c7;
    font-weight: bold;
}
</style>