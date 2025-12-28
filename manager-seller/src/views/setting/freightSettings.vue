<template>
  <div class="bg-settings">
    <el-form
      :model="freightDataForm"
      ref="freightDataForm"
      :rules="freightDataFormRule"
      label-width="200px">
      <el-form-item label="取货地址：">
        <template v-if="showMap">
          <span>{{shopData.shop_add}}（电话：{{shopData.link_phone}}）</span>
          <span style="color: #409EFF;cursor: pointer;" @click="handleReviseAddress()">修改</span>
        </template>
        <template v-else>
          <span>无法获取地址信息</span>
          <span style="color: #409EFF;cursor: pointer;" @click="handleReviseAddress()">去设置</span>
        </template>
      </el-form-item>
      <el-form-item label="配送方式：" prop="shopDistribution">
        <el-checkbox v-model="freightDataForm.shopDistribution" label="商家自配送" disabled></el-checkbox>
      </el-form-item>
      <el-form-item label="配送模板：" prop="distributionTemplate">
        <el-radio v-model="freightDataForm.distributionTemplate" label="MAP_DIVIDE">地图划分版</el-radio>
      </el-form-item>
      <el-form-item label="收费标准：" prop="chargingStandard">
        <el-radio v-model="freightDataForm.chargingStandard" label="AREA">按区域收取配送费</el-radio>
        <p class="help-desc">配送区域内商品会不计算距离，按区域收取固定配送费</p>
      </el-form-item>
      <el-form-item label="费用配置：">
        <div class="container" v-if="showMap">
          <div class="info">
            <div class="region-list">
              <div class="region-item" :class="[ area.check ? 'active' : '' ]" v-for="(area, index) in areaModelList" :key="index" @click="onDistributionArea(index)">
                <div class="title" style="margin-bottom: 20px;">
                  <span class="tag" :style="{'border-color': area.color}"></span>
                  <el-input v-model="area.areaName" placeholder="请输入区域名称" style="width: 147px;"></el-input>
                  <i class="icon el-icon-circle-close" v-if="index > 0" @click.stop="delDistributionArea(index)"></i>
                </div>
                <div class="allocation">
                  <el-form-item label="起送价：">
                    <el-input v-model="area.startFee" @blur="handleBlur(area)">
                      <template slot="prepend">{{MixinUnitOfCurrency}}</template>
                    </el-input>
                  </el-form-item>
                  <el-form-item label="配送费：">
                    <el-input v-model="area.fixedFee" @blur="handleBlur(area)">
                      <template slot="prepend">{{MixinUnitOfCurrency}}</template>
                    </el-input>
                  </el-form-item>
                </div>
                  <div class="arrow"></div>
              </div>
              <div class="region-append">
                <el-tooltip class="item" effect="light" placement="left" popper-class="atooltip">
                  <div slot="content" style="line-height: 20px">
                    还可以添加 {{ 10 - areaModelList.length }}个
                  </div>
                  <el-button style="width: 100%;" @click="addDistributionArea()" :disabled="areaModelList.length >= 10">添加配送区域</el-button>
                </el-tooltip>
              </div>
            </div>
            <div class="switch-type allocation">
              <el-form-item label="划分方式：">
                <el-radio-group v-model="areaType">
                  <el-radio label="CIRCLE">半径</el-radio>
                  <el-radio label="POLYGON">自定义</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="配送区域：">
                <el-input v-if="areaType === 'CIRCLE'" v-model="distributionArea" @blur="blurDistributionArea" style="padding: 0 10px;"></el-input>
                <img v-else class="img" src="../../assets/public_files.png" alt="">
                <span style="margin-left: 10px;">公里内</span>
              </el-form-item>
            </div>
          </div>
          <div id="map" style="width:720px; height:520px;"></div>
        </div>
        <div v-else>
          <span>无法获取发货地址信息，不能设置配送区域哦</span>
          <span style="color: #409EFF;cursor: pointer;" @click="handleReviseAddress()">去设置</span>
        </div>
        <p class="help-desc">注：配送区域内的收货地址才能进行同城配送订单。</p>
      </el-form-item>
      <el-form-item label="续重收费：">
        <div class="input-error-model">
          <span>商品重量</span>
          <el-form-item prop="valuationWeightRules.goodsWeight">
            <el-input v-model="freightDataForm.valuationWeightRules.goodsWeight" @blur="handleBlur(freightDataForm.valuationWeightRules)"></el-input>
          </el-form-item>
          <span>kg内不额外收费，每超出</span>
          <el-form-item prop="valuationWeightRules.weightUnit">
            <el-input v-model="freightDataForm.valuationWeightRules.weightUnit" @blur="handleBlur(freightDataForm.valuationWeightRules)"></el-input>
          </el-form-item>
          <span>kg费用增加</span>
          <el-form-item prop="valuationWeightRules.perFee">
            <el-input v-model="freightDataForm.valuationWeightRules.perFee" @blur="handleBlur(freightDataForm.valuationWeightRules)"></el-input>
          </el-form-item>
        </div>
        <p class="help-desc" style="margin: 20px 0;">
          <span>说明：1. 最终费用 = 收费标准 + 续重收费（数值为0时表示不使用续重收费）</span>
          <el-tooltip class="item" effect="light" placement="top-end" popper-class="atooltip">
            <div slot="content" style="line-height: 20px">
              如配置商品重量为 3kg 内时不额外收费，<br/>
              超出时每 1kg 额外收取 {{MixinUnitOfCurrency}}1 。<br/>
              则商品为 3kg 按原收费标准；商品为<br/>
              3.4kg 时额外收取 {{MixinUnitOfCurrency}}1；商品为 5kg 时额外<br/>
              收取 {{MixinUnitOfCurrency}}2 同城配送费。
            </div>
            <span style="color: #155bd4;">查看示例</span>
          </el-tooltip>
          <br>
          <span style="margin-left: 37px;">2. 需要对续重收费的商品开启该功能，并设置商品重量。</span>
        </p>
      </el-form-item>
      <el-form-item label="定时达：" prop="isOpen" style="width: 45%;">
        <el-checkbox v-model="freightDataForm.isOpen">开启定时达功能</el-checkbox>
        <div class="regular-service-info" v-if="!freightDataForm.isOpen">
          <i class="el-icon-info" style="color: #1881D2;margin-right: 8px"></i>
          <span>开启后，买家下单选择同城送时，需要选择送达时间，商家按约定时间送达。</span>
        </div>
      </el-form-item>
      <div v-if="freightDataForm.isOpen">
        <el-form-item label="配送时段：" prop="timeRangeType" class="make">
          <el-radio-group v-model="freightDataForm.timeRangeType">
            <el-radio label="ALL_DAY">全天</el-radio>
            <el-radio label="CUSTOM">自定义</el-radio>
          </el-radio-group>
          <div style="margin-left: 24px">
            <el-radio-group v-if="freightDataForm.timeRangeType === 'CUSTOM'" v-model="freightDataForm.editionTimeRangeType">
              <el-radio label="EVERYDAY">每天重复</el-radio>
              <el-radio label="WEEKLY">每周重复</el-radio>
            </el-radio-group>
            <div class="time-range-list" v-if="freightDataForm.timeRangeType === 'CUSTOM' && freightDataForm.editionTimeRangeType === 'EVERYDAY'">
              <div class="time-range-item" v-for="(time, index) in timeBucketDayRepeat" :key="index">
                <el-time-picker
                  placeholder="开始时间"
                  v-model="time.startTime"
                  :editable="false"
                  :clearable="false"
                  value-format="HH:mm"
                  format="HH:mm"
                  :picker-options="{selectableRange: '00:00:00 - 23:59:59'}">
                </el-time-picker>
                <span style="margin: 0 10px;">至</span>
                <el-time-picker
                  placeholder="结束时间"
                  v-model="time.endTime"
                  :editable="false"
                  :clearable="false"
                  value-format="HH:mm"
                  format="HH:mm"
                  :picker-options="{selectableRange: '00:00:00 - 23:59:59'}">
                </el-time-picker>
                <span class="del-btn btn" @click="handleDelTime(2, index, '')">删除</span>
              </div>
              <span class="add-btn btn" v-if="timeBucketDayRepeat.length < 3" @click="handleAddTime(2)">添加时间</span>
            </div>
            <div class="day-list" v-if="freightDataForm.editionTimeRangeType === 'WEEKLY'">
              <div class="time-range-content" v-if="timeBucketWeekRepeat">
                <div class="time-range-list" v-for="(week, weekIndex) in timeBucketWeekRepeat" :key="weekIndex">
                  <div class="week-range-item">
                    <span class="add-btn">{{ week.week }}</span>
                    <span class="btn" @click="handleDelTime(3, '', weekIndex)">删除</span>
                  </div>
                  <div class="time-range-item" v-for="(time, timeIndex) in week.weekTime" :key="timeIndex">
                    <el-time-picker
                      placeholder="开始时间"
                      v-model="time.startTime"
                      :editable="false"
                      :clearable="false"
                      value-format="HH:mm"
                      format="HH:mm"
                      :picker-options="{selectableRange: '00:00:00 - 23:59:59'}">
                    </el-time-picker>
                    <span style="margin: 0 10px;">至</span>
                    <el-time-picker
                      placeholder="结束时间"
                      v-model="time.endTime"
                      :editable="false"
                      :clearable="false"
                      value-format="HH:mm"
                      format="HH:mm"
                      :picker-options="{selectableRange: '00:00:00 - 23:59:59'}">
                    </el-time-picker>
                    <span class="del-btn btn" @click="handleDelTime(3, timeIndex, weekIndex)">删除</span>
                  </div>
                  <span class="add-btn btn" v-if="week.weekTime.length < 3" @click="handleAddTime(3, weekIndex)">添加时间</span>
                </div>
              </div>
              <div class="day-picker">
                <span class="add-btn btn" @click="showWeek = true">添加星期</span>
                <div class="popover-content" v-if="showWeek">
                  <div class="day-picker-list">
                    <el-checkbox-group v-model="week" @change="(value) => { week = value}">
                      <el-checkbox style="display: block;" v-for="week in weekList" :label="week" :key="week">{{ week }}</el-checkbox>
                    </el-checkbox-group>
                    <div class="day-picker-action">
                      <el-button @click="handleConfirm">确定</el-button>
                      <el-button @click="showWeek = false">取消</el-button>
                    </div>
                  </div>
                  <i class="arrow"></i>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="时段细分：" prop="timeSpan">
          <el-radio-group v-model="freightDataForm.timeSpan">
            <el-radio label="DAY">天</el-radio>
            <el-radio label="MEAL">上午下午晚上(12:00和18:00为分界点)</el-radio>
            <el-radio label="HOUR">小时</el-radio>
            <el-radio label="HALF_HOUR">半小时</el-radio>
          </el-radio-group>
          <p class="help-desc">买家可选的送达时间会根据时段进行细分。</p>
        </el-form-item>
        <el-form-item label="预约下单：" prop="aheadMinType" class="make">
          <el-radio-group v-model="freightDataForm.aheadMinType">
            <el-radio label="NONE">无需提前</el-radio>
            <el-radio label="DAY">
              提前
              <el-select v-model="freightDataForm.aheadMinDay" :disabled="freightDataForm.aheadMinType !== 'DAY'">
                <el-option
                  v-for="item in aheadMinTypeDay"
                  :key="item.ahead_id"
                  :label="item.ahead_day"
                  :value="item.ahead_id">
                </el-option>
              </el-select>
              天
            </el-radio>
            <p class="help-desc">为自然天，如：提前1天，则不管是凌晨1点还是晚上23点，都只能下明天以后的订单</p>
            <el-radio label="HOUR">
              提前
              <el-select v-model="freightDataForm.aheadMinHour" :disabled="freightDataForm.aheadMinType !== 'HOUR'">
                <el-option
                  v-for="item in aheadMinTypeHour"
                  :key="item.ahead_id"
                  :label="item.ahead_hour"
                  :value="item.ahead_id">
                </el-option>
              </el-select>
              小时
            </el-radio>
            <el-radio label="MINUTE">
              提前
              <el-input v-model="freightDataForm.aheadMinMinute" :disabled="freightDataForm.aheadMinType !== 'MINUTE'"></el-input>
              分钟
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="最长预约：" prop="aheadMaxType" class="make">
          <el-radio-group v-model="freightDataForm.aheadMaxType">
            <el-radio label="NONE">只能当天下单</el-radio>
            <el-radio label="DAY">
              可预约
              <el-select v-model="freightDataForm.aheadMaxDay" :disabled="freightDataForm.aheadMaxType === 'NONE'">
                <el-option
                  v-for="item in aheadMaxTypeDay"
                  :key="item.ahead_id"
                  :label="item.ahead_day"
                  :value="item.ahead_id">
                </el-option>
              </el-select>
              天内订单
            </el-radio>
          </el-radio-group>
          <p class="help-desc">如，可预约7天内订单，那么就是今天＋未来6天内的送达时间可以让买家选择</p>
        </el-form-item>
      </div>
      <el-form-item>
        <el-button type="primary" @click="handleSaveShopData()">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import * as API_O2O from '@/api/o2o'
  import { Foundation, RegExp } from '~/ui-utils'
  export default {
    name: 'freightSetting',
    data() {
      const checkWeight = (rule, value, callback) => {
        if (!value && typeof value !== 'number') {
          callback(new Error('商品重量不能为空'))
        } else if (isNaN(value) || parseFloat(value) > 10000) {
          callback(new Error('请输入0-10000之间的数值'))
        } else {
          callback()
        }
      }
      const checkWeightUnit = (rule, value, callback) => {
        if (!value && typeof value !== 'number') {
          callback(new Error('超出重量不能为空'))
        } else if (isNaN(value) || parseFloat(value) > 1000) {
          callback(new Error('请输入0-999之间的数值'))
        } else {
          callback()
        }
      }
      const checkperFee = (rule, value, callback) => {
        if (!value && typeof value !== 'number') {
          callback(new Error('超重价格不能为空'))
        } else if (isNaN(value) || parseFloat(value) > 1000) {
          callback(new Error('请输入0-999之间的数值'))
        } else {
          callback()
        }
      }
      return {
        shopData: {},
        map: [],
        /** 默认半径1000 */
        radius: 1000,
        /** 店铺是否设置坐标 */
        showMap: true,
        /** 配送区域 */
        distributionArea: '',
        fillColor: ['#2465D6', '#D40000', '#AFD477', '#F18F48', '#FABA39', '#D42A8D', '#AC76DD', '#FAD51E', '#11A0AD', '#CFE7CB'],
        /** 预约下单 */
        aheadMinTypeDay: [
          { ahead_id: 1, ahead_day: '01' },
          { ahead_id: 2, ahead_day: '02' },
          { ahead_id: 3, ahead_day: '03' },
          { ahead_id: 4, ahead_day: '04' },
          { ahead_id: 5, ahead_day: '05' },
          { ahead_id: 6, ahead_day: '06' },
          { ahead_id: 7, ahead_day: '07' },
          { ahead_id: 8, ahead_day: '08' },
          { ahead_id: 9, ahead_day: '09' },
          { ahead_id: 10, ahead_day: '10' },
          { ahead_id: 11, ahead_day: '11' },
          { ahead_id: 12, ahead_day: '12' },
          { ahead_id: 13, ahead_day: '13' },
          { ahead_id: 14, ahead_day: '14' },
          { ahead_id: 15, ahead_day: '15' },
          { ahead_id: 16, ahead_day: '16' },
          { ahead_id: 17, ahead_day: '17' },
          { ahead_id: 18, ahead_day: '18' },
          { ahead_id: 19, ahead_day: '19' },
          { ahead_id: 20, ahead_day: '20' },
          { ahead_id: 21, ahead_day: '21' },
          { ahead_id: 22, ahead_day: '22' },
          { ahead_id: 23, ahead_day: '23' },
          { ahead_id: 24, ahead_day: '24' },
          { ahead_id: 25, ahead_day: '25' },
          { ahead_id: 26, ahead_day: '26' },
          { ahead_id: 27, ahead_day: '27' },
          { ahead_id: 28, ahead_day: '28' },
          { ahead_id: 29, ahead_day: '29' },
          { ahead_id: 30, ahead_day: '30' },
          { ahead_id: 31, ahead_day: '31' }
        ],
        aheadMinTypeHour: [
          { ahead_id: 1, ahead_hour: '01' },
          { ahead_id: 2, ahead_hour: '02' },
          { ahead_id: 3, ahead_hour: '03' },
          { ahead_id: 4, ahead_hour: '04' },
          { ahead_id: 5, ahead_hour: '05' },
          { ahead_id: 6, ahead_hour: '06' },
          { ahead_id: 7, ahead_hour: '07' },
          { ahead_id: 8, ahead_hour: '08' },
          { ahead_id: 9, ahead_hour: '09' },
          { ahead_id: 10, ahead_hour: '10' },
          { ahead_id: 11, ahead_hour: '11' },
          { ahead_id: 12, ahead_hour: '12' },
          { ahead_id: 13, ahead_hour: '13' },
          { ahead_id: 14, ahead_hour: '14' },
          { ahead_id: 15, ahead_hour: '15' },
          { ahead_id: 16, ahead_hour: '16' },
          { ahead_id: 17, ahead_hour: '17' },
          { ahead_id: 18, ahead_hour: '18' },
          { ahead_id: 19, ahead_hour: '19' },
          { ahead_id: 20, ahead_hour: '20' },
          { ahead_id: 21, ahead_hour: '21' },
          { ahead_id: 22, ahead_hour: '22' },
          { ahead_id: 23, ahead_hour: '23' },
          { ahead_id: 24, ahead_hour: '24' },
          { ahead_id: 25, ahead_hour: '25' },
          { ahead_id: 26, ahead_hour: '26' },
          { ahead_id: 27, ahead_hour: '27' },
          { ahead_id: 28, ahead_hour: '28' },
          { ahead_id: 29, ahead_hour: '29' },
          { ahead_id: 30, ahead_hour: '30' },
          { ahead_id: 31, ahead_hour: '31' },
          { ahead_id: 32, ahead_hour: '32' },
          { ahead_id: 33, ahead_hour: '33' },
          { ahead_id: 34, ahead_hour: '34' },
          { ahead_id: 35, ahead_hour: '35' },
          { ahead_id: 36, ahead_hour: '36' },
          { ahead_id: 37, ahead_hour: '37' },
          { ahead_id: 38, ahead_hour: '38' },
          { ahead_id: 39, ahead_hour: '39' },
          { ahead_id: 40, ahead_hour: '40' },
          { ahead_id: 41, ahead_hour: '41' },
          { ahead_id: 42, ahead_hour: '42' },
          { ahead_id: 43, ahead_hour: '43' },
          { ahead_id: 44, ahead_hour: '44' },
          { ahead_id: 45, ahead_hour: '45' },
          { ahead_id: 46, ahead_hour: '46' },
          { ahead_id: 47, ahead_hour: '47' },
          { ahead_id: 48, ahead_hour: '48' }
        ],
        /** 最长预约 */
        aheadMaxTypeDay: [
          { ahead_id: 1, ahead_day: '01' },
          { ahead_id: 2, ahead_day: '02' },
          { ahead_id: 3, ahead_day: '03' },
          { ahead_id: 4, ahead_day: '04' },
          { ahead_id: 5, ahead_day: '05' },
          { ahead_id: 6, ahead_day: '06' },
          { ahead_id: 7, ahead_day: '07' },
          { ahead_id: 8, ahead_day: '08' },
          { ahead_id: 9, ahead_day: '09' },
          { ahead_id: 10, ahead_day: '10' },
          { ahead_id: 11, ahead_day: '11' },
          { ahead_id: 12, ahead_day: '12' },
          { ahead_id: 13, ahead_day: '13' },
          { ahead_id: 14, ahead_day: '14' },
          { ahead_id: 15, ahead_day: '15' },
          { ahead_id: 16, ahead_day: '16' },
          { ahead_id: 17, ahead_day: '17' },
          { ahead_id: 18, ahead_day: '18' },
          { ahead_id: 19, ahead_day: '19' },
          { ahead_id: 20, ahead_day: '20' },
          { ahead_id: 21, ahead_day: '21' },
          { ahead_id: 22, ahead_day: '22' },
          { ahead_id: 23, ahead_day: '23' },
          { ahead_id: 24, ahead_day: '24' },
          { ahead_id: 25, ahead_day: '25' },
          { ahead_id: 26, ahead_day: '26' },
          { ahead_id: 27, ahead_day: '27' },
          { ahead_id: 28, ahead_day: '28' },
          { ahead_id: 29, ahead_day: '29' },
          { ahead_id: 30, ahead_day: '30' },
          { ahead_id: 60, ahead_day: '60' },
          { ahead_id: 90, ahead_day: '90' }
        ],
        /** 默认半径 半径:CIRCLE 自定义:POLYGON */
        areaType: 'CIRCLE',
        /** 配送区域 */
        areaModelList: [],
        week: [],
        weekList: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        showWeek: false,
        /** 全天 */
        timeBucketDay: {
          startTime: '00:00',
          endTime: '23:59'
        },
        /** 每天重复 */
        timeBucketDayRepeat: [],
        /** 每周重复 */
        timeBucketWeekRepeat: [],
        freightDataForm: {
          shopDistribution: 'SHOP_SELF',
          distributionTemplate: 'MAP_DIVIDE',
          chargingStandard: 'AREA',
          /** 续重收费 */
          valuationWeightRules: {
            goodsWeight: 0.000,
            weightUnit: 0,
            perFee: 0.00
          },
          /** 是否开启定时达 */
          isOpen: 'NO',
          /** 配送时段 */
          timeRangeType: 'ALL_DAY',
          editionTimeRangeType: 'EVERYDAY',
          timeBucket: [],
          /** 时段细分 */
          timeSpan: 'DAY',
          /** 预约下单 */
          aheadMinType: 'NONE',
          aheadMinDay: 1,
          aheadMinHour: 1,
          aheadMinMinute: 30,
          /** 最长预约 */
          aheadMaxType: 'NONE',
          aheadMaxDay: 7
        },
        freightDataFormRule: {
          'valuationWeightRules.goodsWeight': [
            { validator: checkWeight, trigger: 'blur' }
          ],
          'valuationWeightRules.weightUnit': [
            { validator: checkWeightUnit, trigger: 'blur' }
          ],
          'valuationWeightRules.perFee': [
            { validator: checkperFee, trigger: 'blur' }
          ]
        }
      }
    },
    mounted() {
      this.GET_ShopGradeData()
    },
    methods: {
      /** 初始化 */
      init() {
        let that = this
        let map = new AMap.Map('map', {
          center: [this.shopData.longitude, this.shopData.latitude],
          resizeEnable: true,
          zoom: 14
        })
        /** 工具条 */
        let toolBar = new AMap.ToolBar({
          visible: true
        })
        map.addControl(toolBar)
        toolBar.show()
        /** marker标记 */
        let marker = new AMap.Marker({
          icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_bs.png',
          position: [this.shopData.longitude, this.shopData.latitude],
          offset: new AMap.Pixel(-10, -28)
        })
        marker.setMap(map)
        that.map = map
        that.marker = marker
        /** 费用配置 */
        if (that.areaModelList && that.areaModelList.length) {
          that.areaModelList.forEach((key, index) => {
            key.check = false
            if (key.areaType === 'CIRCLE') {
              that.drawCircle(index, key.circleAreaModel.scope, key.color, true)
            } else {
              that.drawPolygon(index, key.polygonAreaModel, key.color, true)
            }
          })
          that.areaModelList[0].check = true
          that.distributionArea = (that.areaModelList[0].circleAreaModel.scope / 1000).toFixed(3)
          that.areaType = that.areaModelList[0].areaType
        } else {
          this.addDistributionArea()
        }
      },
      /** 绘制圆形 */
      drawCircle(id, radius, fillColor, falg) {
        let that = this
        let circle = new AMap.Circle({
          center: [this.shopData.longitude, this.shopData.latitude],
          radius: radius,
          borderWeight: 1,
          strokeColor: fillColor,
          strokeWeight: 3,
          strokeOpacity: 0.8,
          fillOpacity: 0.1,
          strokeDasharray: [10, 10],
          fillColor: fillColor,
          zIndex: 50
        })

        circle.setMap(that.map)
        /** 缩放地图到合适的视野级别 */
        that.map.setFitView([circle])
        that.areaModelList[id].circlePolygon = circle
        let circleEditor = new AMap.CircleEditor(that.map, circle)
        that.areaModelList[id].distributionAr = circleEditor
        if (falg) {
          that.areaModelList[0].distributionAr.open()
        } else {
          that.areaModelList.forEach(item => { item.distributionAr.close() })
          that.areaModelList.slice(-1)[0].distributionAr.open()
        }
        that.distributionArea = (radius / 1000).toFixed(3)

        circleEditor.on('move', function(event) {
          that.areaModelList[id].circleAreaModel.lat = event.lnglat.lat
          that.areaModelList[id].circleAreaModel.lng = event.lnglat.lng
        })

        circleEditor.on('adjust', function(event) {
          that.distributionArea = (event.radius / 1000).toFixed(3)
          that.areaModelList[id].circleAreaModel.scope = event.radius
        })
      },
      /** 绘制多边形 */
      drawPolygon(id, polygonPath, fillColor, falg) {
        let that = this
        const _polygonPath = []
        polygonPath.forEach(item => {
          _polygonPath.push([item.lng, item.lat])
        })
        let polygon = new AMap.Polygon({
          path: _polygonPath,
          strokeColor: fillColor,
          strokeWeight: 3,
          strokeOpacity: 0.8,
          fillOpacity: 0.1,
          fillColor: fillColor,
          zIndex: 50
        })
        that.map.add(polygon)
        /** 缩放地图到合适的视野级别 */
        that.map.setFitView([polygon])
        that.areaModelList[id].circlePolygon = polygon
        let polyEditor = new AMap.PolyEditor(that.map, polygon)
        that.areaModelList[id].distributionAr = polyEditor
        if (falg) {
          that.areaModelList[0].distributionAr.open()
        } else {
          that.areaModelList.forEach(item => { item.distributionAr.close() })
          that.areaModelList.slice(-1)[0].distributionAr.open()
        }
      },
      /** 编辑配送区域 */
      onDistributionArea(index) {
        this.areaModelList.forEach(key => {
          key.check = false
          this.areaModelList[index].check = true
        })
        this.areaType = this.areaModelList[index].areaType
        if (this.areaType === 'CIRCLE') {
          this.distributionArea = (this.areaModelList[index].circleAreaModel.scope / 1000).toFixed(3)
        }
        this.areaModelList.forEach(item => { item.distributionAr.close() })
        this.areaModelList[index].distributionAr.open()
      },
      /** 添加配送区域 */
      addDistributionArea() {
        this.areaModelList.length && this.areaModelList.forEach(key => { key.check = false })
        this.areaModelList.push({
          check: true,
          color: this.fillColor[this.areaModelList.length],
          areaType: this.areaType,
          areaName: '',
          startFee: '',
          fixedFee: '',
          circlePolygon: {},
          distributionAr: {}
        })
        let index = this.areaModelList.length - 1
        /** 半径 */
        if (this.areaType === 'CIRCLE') {
          this.areaModelList[index].circleAreaModel = {
            lat: this.shopData.latitude,
            lng: this.shopData.longitude,
            scope: this.radius
          }
          this.drawCircle(index, this.radius, this.areaModelList[index].color)
        } else {
          /** 自定义 */
          this.areaModelList[index].polygonAreaModel = []
          const polygonPath = []
          /** 设置默认多边形坐标 */
          const cenlatlng = this.map.getCenter()
          polygonPath.push({ lng: cenlatlng.lng + 0.01, lat: cenlatlng.lat + 0.01 })
          polygonPath.push({ lng: cenlatlng.lng + 0.01, lat: cenlatlng.lat - 0.01 })
          polygonPath.push({ lng: cenlatlng.lng - 0.01, lat: cenlatlng.lat - 0.01 })
          polygonPath.push({ lng: cenlatlng.lng - 0.01, lat: cenlatlng.lat + 0.01 })
          this.drawPolygon(index, polygonPath, this.areaModelList[index].color)
        }
      },
      /** 删除配送区域 */
      delDistributionArea(index) {
        this.areaModelList.forEach(item => { item.distributionAr.close() })
        this.map.remove(this.areaModelList[index].circlePolygon)
        this.areaModelList.splice(index, 1)
        this.areaModelList.forEach(key => { key.check = false })
        this.areaModelList.slice(-1)[0].check = true
        this.areaModelList.slice(-1)[0].distributionAr.open()
        if (this.areaModelList.slice(-1)[0].areaType === 'CIRCLE') {
          this.areaType = 'CIRCLE'
          this.distributionArea = (this.areaModelList.slice(-1)[0].circleAreaModel.scope / 1000).toFixed(3)
        } else {
          this.areaType = 'POLYGON'
        }
      },
      /** 修改地址 */
      handleReviseAddress() {
        this.$router.push({ name: 'shopSettings' })
      },
      /** 保存校验 */
      saveRules() {
        if (this.areaModelList && this.areaModelList.length) {
          if (!this.areaModelList.every(item => item.areaName)) {
            this.$message.error('区域名称必须是1-30个字')
            return false
          } else if (!this.areaModelList.every(item => item.startFee)) {
            this.$message.error('请输入起送价')
            return false
          } else if (!this.areaModelList.every(item => item.fixedFee)) {
            this.$message.error('请输入配送费')
            return false
          }
          return true
        }
        this.$message.error('请先设置地址信息')
        return false
      },
      /** 保存运费设置*/
      handleSaveShopData() {
        this.$refs['freightDataForm'].validate((valid) => {
          if (valid) {
            if (!this.saveRules()) return
            this.areaModelList.forEach(key => {
              if (key.areaType === 'POLYGON') {
                if (key.distributionAr.$t) {
                  key.polygonAreaModel = key.distributionAr.$t[0]
                  key.polygonAreaModel.forEach(item => {
                    delete item.Q
                    delete item.R
                  })
                }
              }
            })
            /** 配送时间段 */
            if (this.freightDataForm.timeRangeType === 'ALL_DAY') {
              this.freightDataForm.timeBucket = [{ ...this.timeBucketDay }]
            } else {
              if (this.freightDataForm.editionTimeRangeType === 'EVERYDAY') {
                this.freightDataForm.timeBucket = this.timeBucketDayRepeat
              } else {
                this.freightDataForm.timeBucket = this.timeBucketWeekRepeat
              }
            }
            const params = {
              ...this.freightDataForm,
              areaModelList: [...this.areaModelList]
            }
            params.isOpen = params.isOpen === true ? 'YES' : 'NO'
            params.shopDistribution = params.shopDistribution === true ? 'SHOP_SELF' : ''
            params.areaModelList.forEach(key => {
              key.color = key.color.substr(1)
              delete key.check
              delete key.circlePolygon
              delete key.distributionAr
            })
            const _params = {
              freight_config: JSON.stringify(params)
            }
            API_O2O.saveShopFreightSettings(_params).then(response => {
              this.$message.success('保存成功')
              this.GET_ShopGradeData()
            })
          } else {
            this.$message.error('表单填写有误，请检查')
          }
        })
      },
      /** 失去焦点时 */
      handleBlur(value) {
        if (value.startFee) {
          value.startFee = Number.parseFloat(value.startFee).toFixed(2)
        }
        if (value.fixedFee) {
          value.fixedFee = Number.parseFloat(value.fixedFee).toFixed(2)
        }
        if (value.goodsWeight) {
          value.goodsWeight = Number.parseFloat(value.goodsWeight).toFixed(3)
        }
        if (value.weightUnit) {
          value.weightUnit = Math.round(value.weightUnit)
        }
        if (value.perFee) {
          value.perFee = Number.parseFloat(value.perFee).toFixed(2)
        }
      },
      /** 添加时间段 */
      handleAddTime(timeRangeType, weekIndex) {
        const params = {
          startTime: '',
          endTime: ''
        }
        if (timeRangeType === 2) {
          this.timeBucketDayRepeat.push(params)
        } else {
          this.timeBucketWeekRepeat[weekIndex].weekTime.push(params)
        }
      },
      /** 删除时间段 */
      handleDelTime(timeRangeType, timeIndex, weekIndex) {
        if (timeRangeType === 2) {
          this.timeBucketDayRepeat.splice(timeIndex, 1)
        } else {
          if (timeIndex) {
            this.timeBucketWeekRepeat[weekIndex].weekTime.splice(timeIndex, 1)
          } else {
            this.timeBucketWeekRepeat.splice(weekIndex, 1)
          }
        }
      },
      /** 添加星期 */
      handleConfirm() {
        this.showWeek = false
        const week = this.week.join('、')
        const weekTime = {
          startTime: '',
          endTime: ''
        }
        const params = {
          week,
          weekTime: [{ ...weekTime }]
        }
        this.timeBucketWeekRepeat.push(params)
      },
      /** 获取店铺信息 */
      GET_ShopGradeData() {
        API_O2O.getShopData().then(response => {
          if (response.freight_config) {
            this.freightDataForm = JSON.parse(response.freight_config)
            /** 费用配置 */
            if (this.freightDataForm.areaModelList && this.freightDataForm.areaModelList.length) {
              this.freightDataForm.areaModelList.forEach(item => {
                item.color = '#' + item.color
              })
              this.areaModelList = this.freightDataForm.areaModelList
            }
            /** 配送时段 */
            if (this.freightDataForm.timeRangeType === 'CUSTOM') {
              if (this.freightDataForm.editionTimeRangeType === 'EVERYDAY') {
                this.timeBucketDayRepeat = this.freightDataForm.timeBucket
              } else {
                this.timeBucketWeekRepeat = this.freightDataForm.timeBucket
              }
            }
          }
          this.freightDataForm.shopDistribution = this.freightDataForm.shopDistribution === 'SHOP_SELF'
          this.freightDataForm.isOpen = this.freightDataForm.isOpen === 'YES'
          this.shopData = response
          if (!response.longitude && !response.latitude) {
            this.showMap = false
            return
          }
          this.init()
        })
      },
      /** 配送区域发生变化时 */
      blurDistributionArea() {
        if (this.distributionArea > 1000) {
          this.$message.error('请输入0-1000之间的数值')
          return false
        }
        this.distributionArea = ((this.distributionArea * 1000) / 1000).toFixed(3)
        const index = this.areaModelList.findIndex(item => item.check)
        this.areaModelList[index].circleAreaModel.scope = this.distributionArea * 1000
        this.areaModelList.forEach(item => { item.distributionAr.close() })
        this.map.remove(this.areaModelList[index].circlePolygon)
        this.drawCircle(index, this.distributionArea * 1000, this.areaModelList[index].color)
      }
    }
  }
</script>
<style type="text/scss" lang="scss">
  .bg-settings {
    background: #fff;
    border: 1px solid #FAFAFA;
    margin: 15px;
    padding: 10px;
    .help-desc {
      color: #969799;
      font-size: 12px;
      margin: 0;
      line-height: 30px;
    }
    .input-error-model {
      display: flex;
    }
    .el-input {
      width: 70px;
    }
    .regular-service-info {
      font-size: 14px;
      line-height: 20px;
      box-sizing: border-box;
      padding: 12px 16px;
      margin-top: 10px;
      border: 1px solid #94B4EB;
      background-color: #EDF4FF;
      border-radius: 2px;
      color: #323233;
    }
    .make .el-radio {
      display: block;
      margin-top: 10px;
    }
    .region-list {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 999;
      background-color: #fff;
      width: 220px;
      max-height: 96%;
      overflow-y: scroll;
      box-sizing: border-box;
      box-shadow: 0 0 5px #afafaf;
      .region-item.active {
        border-color: #155bd4;
        .arrow {
          position: absolute;
          right: 0;
          bottom: 0;
          border-color: transparent #155bd4 #155bd4 transparent;
          border-style: solid;
          border-width: 10px;
        }
        .arrow:before {
          width: 5px;
          left: -3px;
          bottom: -8px;
          transform: rotate(35deg);
        }
        .arrow:after {
          width: 12px;
          left: -1px;
          bottom: -5px;
          transform: rotate(130deg);
        }
        .arrow:before, .arrow:after {
          position: absolute;
          display: block;
          content: "";
          height: 2px;
          background: #fff;
        }
      }
      .region-item {
        position: relative;
        width: 100%;
        box-sizing: border-box;
        padding: 12px 12px 0 12px;
        border: 1px solid transparent;
        border-bottom-color: #ebedf0;
        .icon {
          position: absolute;
          right: 10px;
          color: #c9c8cc;
        }
        .allocation {
          .el-form-item__label, .el-input__inner {
            width: 68px !important;
          }
        }
        .tag {
          display: inline-block;
          width: 16px;
          height: 16px;
          margin-right: 8px;
          vertical-align: middle;
          border: 1px solid transparent;
          background: #fff;
          box-sizing: border-box;
        }
      }
      .region-append {
        margin: 10px;
        outline: none;
        cursor: pointer;
      }
    }
    .switch-type {
      position: absolute;
      top: 10px;
      left: 250px;
      z-index: 999;
      width: 450px;
      display: flex;
      justify-content: space-between;
      background-color: #fff;
      padding: 15px;
      background: hsla(0,0%,100%,.85);
      box-shadow: 0 0 5px #afafaf;
      .el-form-item {
        display: flex;
        margin-bottom: 0;
        .el-radio {
          margin-right: 10px;
        }
        .el-form-item__label {
          padding: 0;
        }
      }
    }
    .allocation {
      .el-form-item__label, .el-input__inner {
        width: 70px !important;
      }
      .el-form-item__content {
        margin-left: 0 !important;
      }
      .el-input-group__prepend {
        padding: 0 15px !important;
      }
      .img {
        width: 22px;
        height: 22px;
        vertical-align: middle;
      }
    }
  }
  .amap-toolbar {
    top: 80px!important;
    left: initial !important;
    right: 25px!important;
  }
  ::-webkit-scrollbar {
    display: none;
  }
  .el-date-editor.el-input {
    width: 120px;
  }
  .el-tooltip__popper[x-placement^=top-end] .popper__arrow,
  .el-tooltip__popper[x-placement^=top-end] .popper__arrow:after {
    border-top-color: #fff !important;
  }
  .el-tooltip__popper[x-placement^=left] .popper__arrow,
  .el-tooltip__popper[x-placement^=left] .popper__arrow:after {
    border-left-color: #fff !important;
  }
  .atooltip {
    border: none !important;
    box-shadow: 0 0 8px 5px #dcdee0;
  }
  .time-range-item {
    display: flex;
    align-items: center;
    margin: 10px 20px;
  }
  .btn {
    cursor: pointer;
    color: #409EFF;
    font-size: 12px;
  }
  .add-btn {
    margin-right: 20px;
  }
  .del-btn {
    margin-left: 20px;
  }
  .day-list {
    margin: 10px 20px;
    .day-picker {
      display: flex;
    }
    .popover-content {
      font-size: 14px;
      width: 150px;
      position: relative;
      line-height: 30px;
      padding: 4px 10px 10px 10px;
      background-color: #fff;
      border-radius: 2px;
      box-shadow: 0 2px 8px 0 rgba(200,201,204,.5);
      .arrow {
        background-color: #fff;
        position: absolute;
        top: 14px;
        left: 0px;
        z-index: 1;
        width: 6px;
        height: 6px;
        transform: translateX(-50%) rotate(45deg);
        overflow: hidden;
      }
    }
  }
</style>
