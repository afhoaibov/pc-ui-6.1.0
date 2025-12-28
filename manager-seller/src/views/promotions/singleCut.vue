<template>
  <div class="single-cut">
    <el-tabs v-model="activeName" @tab-click="handleToggleClick">
      <el-tab-pane label="单品立减列表" name="singleCutList">
        <en-table-layout
          toolbar
          pagination
          :tableData="tableData"
          :loading="loading">
          <div slot="toolbar" class="inner-toolbar">
            <div class="toolbar-btns">
              <el-button type="primary" @click="handleAddSingleCut">新增</el-button>
            </div>
            <div class="toolbar-search">
              <en-table-search
                @search="searchEvent"
                @advancedSearch="advancedSearchEvent"
                advanced
                advancedWidth="465"
                placeholder="请输入活动名称">
                <template slot="advanced-content">
                  <el-form ref="advancedForm" :model="advancedForm" label-width="100px">
                    <el-form-item label="活动名称">
                      <el-input v-model="advancedForm.title" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="活动状态">
                      <el-select v-model="advancedForm.status" placeholder="请选择" clearable>
                        <el-option label="未开始" value="WAIT"/>
                        <el-option label="进行中" value="UNDERWAY"/>
                        <el-option label="已失效" value="END"/>
                      </el-select>
                    </el-form-item>
                    <el-form-item label="商品参与方式">
                      <el-select v-model="advancedForm.range_type" placeholder="请选择" clearable>
                        <el-option label="全部商品参与" value="1"/>
                        <el-option label="部分商品参与" value="2"/>
                      </el-select>
                    </el-form-item>
                    <el-form-item label="活动时间">
                      <el-date-picker
                        style="width: 100%"
                        v-model="advancedForm.act_time_range"
                        type="datetimerange"
                        :picker-options="{ shortcuts: MixinPickerShortcuts }"
                        range-separator="-"
                        align="right"
                        :editable="false"
                        unlink-panels
                        value-format="timestamp"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期">
                      </el-date-picker>
                    </el-form-item>
                  </el-form>
                </template>
              </en-table-search>
            </div>
          </div>
          <template slot="table-columns">
            <!--活动名称-->
            <el-table-column prop="title" label="活动名称">
              <template slot-scope="scope">
                <span class="drawer-text" @click="handleEditMould(scope.row, true)">{{scope.row.title}}</span>
              </template>
            </el-table-column>
            <!--开始时间-->
            <el-table-column label="开始时间">
              <template slot-scope="scope">
                <span>{{ scope.row.start_time | unixToDate }}</span>
              </template>
            </el-table-column>
            <!--结束时间-->
            <el-table-column label="结束时间">
              <template slot-scope="scope">
                <span>{{ scope.row.end_time | unixToDate }}</span>
              </template>
            </el-table-column>
            <!--商品参与活动方式-->
            <el-table-column prop="range_type" label="商品参与方式" :formatter="rangeType"/>
            <!--活动状态-->
            <el-table-column label="活动状态" prop="status_text"/>
            <!--操作-->
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  v-html="(scope.row.status === 'END' || scope.row.status === 'UNDERWAY') ? '查看' : '编辑'"
                  type="success"
                  @click="handleEditMould(scope.row)">
                </el-button>
                <el-button
                  v-if="scope.row.status === 'UNDERWAY'"
                  type="danger"
                  @click="handleCloseFullCut(scope.row)">关闭
                </el-button>
                <el-button
                  v-if="scope.row.status !== 'UNDERWAY'"
                  type="danger"
                  @click="handleDeleteFullCut(scope.row)">删除
                </el-button>
              </template>
            </el-table-column>
          </template>
          <el-pagination
            slot="pagination"
            v-if="pageData"
            @size-change="handlePageSizeChange"
            @current-change="handlePageCurrentChange"
            :current-page="pageData.page_no"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageData.page_size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pageData.data_total">
          </el-pagination>
        </en-table-layout>
      </el-tab-pane>
      <el-tab-pane :label="singleCutName" name="add" :disabled="!editEnabled">
        <div class="content-goods-publish">
          <el-form
            :model="activityForm"
            status-icon
            :rules="rules"
            label-position="right"
            ref="activityForm"
            label-width="120px"
            class="demo-ruleForm">
            <!--活动信息-->
            <div class="base-info-item">
              <h4>活动信息</h4>
              <div>
                <el-form-item  label="活动名称：" prop="title">
                  <el-input
                    v-model="activityForm.title"
                    style="width: 300px"
                    @change="activityForm.title  = activityForm.title.trim()"
                    placeholder="不超过50个字符"
                    maxLength="50"
                    :disabled="!editEnabled" />
                </el-form-item>
                <el-form-item label="生效时间：" prop="take_effect_time">
                  <el-date-picker
                   :disabled="!editEnabled"
                    v-model="activityForm.take_effect_time"
                    type="datetimerange"
                    value-format="timestamp"
                    range-separator="-"
                    placement="bottom-start"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    :default-time="[MixinDefaultTime, MixinDefaultTime]"
                    :picker-options="{disabledDate(time) { return time.getTime()  <  (Date.now() - 8.64E7)   ||  time.getTime() > endTime }}">
                  </el-date-picker>
                </el-form-item>
              </div>
            </div>
            <!--优惠方式-->
            <div class="base-info-item">
              <h4>优惠方式</h4>
              <div>
                <el-form-item label="优惠方式：" prop="single_reduction_value">
                  单品立减 <el-input :disabled="!editEnabled" v-model="activityForm.single_reduction_value" style="width: 150px;"></el-input>
                </el-form-item>
              </div>
            </div>
            <!--活动商品-->
            <div class="base-info-item">
              <h4>活动商品</h4>
              <div>
                <el-form-item label="活动商品：" prop="range_type">
                  <el-radio-group :disabled="!editEnabled" v-model="activityForm.range_type" @change="changeJoinGoods">
                    <el-radio :label="1">全部商品参与</el-radio>
                    <el-radio :label="2">部分商品参与</el-radio>
                  </el-radio-group>
                  <!--商品表格-->
                  <div v-show="!goodsShow" class="goods-table">
                    <en-table-layout
                      toolbar
                      :tableData="activityForm.goods_list"
                      :loading="loading"
                      :selectionChange="selectionChange">
                      <div slot="toolbar" class="inner-toolbar" v-if="editEnabled">
                        <div class="toolbar-btns">
                          <el-button type="primary" @click="showGoodsSelector">选择商品</el-button>
                          <el-button type="danger" @click="cancelall">批量取消</el-button>
                        </div>
                      </div>
                      <template slot="table-columns">
                        <el-table-column type="selection" v-if="editEnabled" />
                        <!--商品信息-->
                        <el-table-column  label="商品信息">
                          <template slot-scope="scope">
                            <div class="goods-info">
                              <a :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}?sku_id=${scope.row.sku_id}`" :target="isO2O ? '' : '_blank'">
                                <img :src="scope.row.thumbnail" alt="" class="goods-image">
                              </a>
                              <div>
                                <a
                                  :href="isO2O ? 'javascript:void(0)' : `${MixinBuyerDomain}/goods/${scope.row.goods_id}?sku_id=${scope.row.sku_id}`"
                                  :target="isO2O ? '' : '_blank'"
                                  style="color: #00a2d4;">{{ scope.row.goods_name }}</a>
                                <span>{{ scope.row.price | unitPrice }}</span>
                              </div>
                            </div>
                          </template>
                        </el-table-column>
                        <!-- 商品规格 -->
                        <el-table-column label="规格SKU">
                          <template slot-scope="scope">
                            <div class="sku-list">
                              <span v-if="scope.row.specs">{{ scope.row.specs }}</span>
                              <span v-else>{{ scope.row.properties_name }}</span>
                            </div>
                          </template>
                        </el-table-column>
                        <!--库存-->
                        <el-table-column prop="enable_quantity" label="库存" />
                        <!--操作-->
                        <el-table-column label="操作" width="150">
                          <template slot-scope="scope">
                            <el-button
                              type="danger"
                              :disabled="!editEnabled"
                              @click="handleCancleJoin(scope.$index, scope.row)">取消参加
                            </el-button>
                          </template>
                        </el-table-column>
                      </template>
                    </en-table-layout>
                  </div>
                </el-form-item>
              </div>
            </div>
            <!--提交按钮-->
            <div class="btn-submit">
              <el-form-item>
                <el-button v-show="editEnabled" type="primary" @click="saveActivity('activityForm')">保存设置</el-button>
              </el-form-item>
            </div>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
    <!--商品选择器-->
    <en-goods-picker
      type="seller"
      sku
      :show="showDialog"
      :defaultData="skuIds"
      @confirm="refreshFunc"
      @close="showDialog = false"/>
  </div>
</template>

<script>
  import * as API_activity from '@/api/activity'
  import { CategoryPicker } from '@/components'
  import { RegExp } from '~/ui-utils'
  import { cloneObj } from '@/utils/index'

  export default {
    name: 'singleCut',
    components: {
      [CategoryPicker.name]: CategoryPicker
    },
    data() {
      const checkRange = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请选择商品参与方式'))
        } else {
          callback()
        }
      }
      const checkPrice = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请输入要优惠的现金金额'))
        }
        setTimeout(() => {
          if (!RegExp.money.test(value)) {
            callback(new Error('请输入正确的金额'))
          } else {
            callback()
          }
        }, 1000)
      }
      const checkTakeEffectTime = (rule, value, callback) => {
        const now = new Date().getTime()
        if (!value) {
          return callback(new Error('请选择生效时间'))
        } else if (value[0] <= now) {
          callback(new Error('活动开始时间不得小于当前时间'))
        } else {
          callback()
        }
      }
      return {
        /** 当前面板的名字*/
        activeName: 'singleCutList',

        /** 单品立即名称 */
        singleCutName: '新增单品立减',

        /** 列表loading状态 */
        loading: false,

        /** 列表参数 */
        params: {
          page_no: 1,
          page_size: 10
        },
        /** 高级搜索数据 */
        advancedForm: {},

        /** 列表数据*/
        tableData: [],

        /** 列表分页数据 */
        pageData: null,

        /** 商品skuids */
        skuIds: [],

        /** 新增满减表单信息*/
        activityForm: {
          /** 活动ID*/
          minus_id: '',

          /** 活动名称*/
          title: '',

          /** 生效时间*/
          take_effect_time: [],

          /** 活动描述*/
          description: '',

          /** 优惠方式 减价金额*/
          single_reduction_value: '',

          /** 是否全部商品参与*/
          range_type: 1,

          /** 活动商品*/
          goods_list: []
        },

        /** 表单校验规则*/
        rules: {
          title: [
            { required: true, message: '请输入活动名称', trigger: 'blur' },
            { min: 0, max: 60, message: '长度在60个字符之内', trigger: 'blur' }
          ],
          take_effect_time: [
            { type: 'array', required: true, message: '请选择生效时间', trigger: 'blur' },
            { validator: checkTakeEffectTime, trigger: 'blur' }
          ],
          single_reduction_value: [
            { required: true, validator: checkPrice, trigger: 'blur', message: '请输入要优惠的现金金额' }
          ],

          /** 商品参与方式 */
          range_type: [
            { required: true, validator: checkRange, trigger: 'change' }
          ]
        },

        // 是否不可编辑 即是否是进行中 或者已失效状态 默认可以
        editEnabled: true,

        /** 是否显示商品表格*/
        goodsShow: true,

        /** 选择的goods_id*/
        selectionids: [],

        /** 显示/隐藏商品选择器 */
        showDialog: false,

        /** 结束时间 */
        endTime: ''
      }
    },
    mounted() {
      this.GET_SingleCutActivityList()
    },
    methods: {
      /** 商品参与活动方式 */
      rangeType(row) {
        if (row.range_type === 1) {
          return '全部商品参与'
        }
        return '部分商品参与'
      },
      /** 高级搜索事件触发 */
      advancedSearchEvent() {
        const advancedForm = cloneObj(this.advancedForm)
        this.params = {
          ...this.params,
          page_no: 1,
          ...advancedForm
        }
        delete this.params.start_time
        delete this.params.end_time
        const { act_time_range } = advancedForm
        if (act_time_range) {
          this.params.start_time = parseInt(act_time_range[0] /= 1000)
          this.params.end_time = parseInt(act_time_range[1] /= 1000)
        }
        delete this.params.act_time_range
        delete this.params.keyword
        this.GET_SingleCutActivityList()
      },

      /** 搜索事件触发 */
      searchEvent(data) {
        this.params = {
          page_no: 1,
          page_size: 10,
          keyword: data
        }
        this.GET_SingleCutActivityList()
      },

      /** 分页大小发生改变 */
      handlePageSizeChange(size) {
        this.params.page_size = size
        this.GET_SingleCutActivityList()
      },

      /** 分页页数发生改变 */
      handlePageCurrentChange(page) {
        this.params.page_no = page
        this.GET_SingleCutActivityList()
      },

      /** 切换面板*/
      handleToggleClick(tab, event) {
        this.activeName = tab.name
        if (this.activeName === 'singleCutList') {
          this.editEnabled = true
          this.singleCutName = '新增单品立减'
          this.GET_SingleCutActivityList()
        } else if (this.activeName === 'add') {
          if (this.singleCutName === '编辑单品立减') {
            return
          } else {
            this.singleCutName = '新增单品立减'
            this.editEnabled = true
            this.activityForm = {
              minus_id: '',
              title: '',
              take_effect_time: [],
              description: '',
              full_money: '',
              single_reduction_value: '',
              goods_list: [],
              range_type: 1
            }
            this.endTime = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 * 30 - 1).getTime()
          }
        }
      },

      /** 是否全选商品*/
      changeJoinGoods(val) {
        this.goodsShow = val === 1
      },

      /** 保存商品选择器选择的商品 */
      refreshFunc(val) {
        if (val) {
          this.activityForm.goods_list = val
        }
      },

      /** 显示商品选择器*/
      showGoodsSelector() {
        this.showDialog = true
        this.skuIds = this.activityForm.goods_list.map(key => {
          return key.sku_id
        })
      },

      /** 取消参加*/
      handleCancleJoin(index, row) {
        this.activityForm.goods_list.forEach((elem, _index) => {
          if (index === _index) {
            this.activityForm.goods_list.splice(_index, 1)
          }
        })
        this.skuIds = this.activityForm.goods_list.map(key => {
          return key.sku_id
        })
      },

      selectionChange(val) {
        this.selectionids = val.map(item => item.goods_id)
      },

      /** 批量取消 */
      cancelall() {
        this.selectionids.forEach(key => {
          this.activityForm.goods_list.forEach((elem, index) => {
            if (elem.goods_id === key) {
              this.activityForm.goods_list.splice(index, 1)
            }
          })
          this.$message.success('批量取消成功！')
        })
        this.skuIds = this.activityForm.goods_list.map(key => {
          return key.sku_id
        })
      },

      /** 获取活动信息*/
      GET_SingleCutActivityList() {
        this.loading = true
        API_activity.getSingleCutActivityList(this.params).then(response => {
          this.loading = false
          this.tableData = response.data
          this.pageData = {
            page_no: response.page_no,
            page_size: response.page_size,
            data_total: response.data_total
          }
        })
      },

      /** 编辑活动 */
      handleEditMould(row, only_view = false) {
        this.activeName = 'add'
        if (only_view) {
          this.editEnabled = false
        } else {
          this.editEnabled = !(row.status === 'END' || row.status === 'UNDERWAY')
        }
        this.singleCutName = '编辑单品立减'
        if (!this.editEnabled) {
          this.singleCutName = '查看单品立减'
        }
        setTimeout(() => { this.$refs['activityForm'].resetFields() })
        this.activityForm.minus_id = row.minus_id
        this.GET_SingleCutActivityDetails(row.minus_id)
        this.endTime = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 * 30 - 1).getTime()
      },

      /** 查询一个单品立减活动信息 */
      GET_SingleCutActivityDetails(id) {
        if (id) {
          API_activity.getSingleCutActivityDetails(id, {}).then(response => {
            this.$nextTick(() => {
              this.activityForm = {
                ...response,
                take_effect_time: [parseInt(response.start_time) * 1000, parseInt(response.end_time) * 1000]
              }
              this.activityForm.minus_id = response.minus_id || id
              /** 处理商品列表数据 */
              this.goodsShow = this.activityForm.range_type === 1
              this.activityForm.goods_list = response.goods_list
            })
          })
        }
      },

      /** 删除活动 */
      handleDeleteFullCut(row) {
        this.$confirm('确认删除当前项？', '确认信息', { type: 'warning' })
          .then(() => this.toDelActivity(row))
          .catch(() => {})
      },

      /** 执行删除*/
      toDelActivity(row) {
        API_activity.deleteSingleCutActivity(row.minus_id).then(response => {
          this.$message.success('删除成功！')
          this.GET_SingleCutActivityList()
        })
      },

      /** 关闭活动 */
      handleCloseFullCut(row) {
        this.$confirm('关闭后不能再次开启，确认要关闭当前活动吗？', '确认信息', { type: 'warning' })
          .then(() => this.toCloseActivity(row))
          .catch(() => {})
      },

      /** 执行关闭 */
      toCloseActivity(row) {
        API_activity.closeSingleCutActivity(row.minus_id).then(response => {
          this.$message.success('关闭成功！')
          this.GET_SingleCutActivityList()
        })
      },

      /** 新增 */
      handleAddSingleCut() {
        this.activeName = 'add'
        this.singleCutName = '新增单品立减'
        this.editEnabled = true
        this.activityForm = {
          /** 活动ID*/
          minus_id: '',

          /** 活动名称*/
          title: '',

          /** 生效时间*/
          take_effect_time: [],

          /** 活动描述*/
          description: '',

          /** 优惠方式 减价金额*/
          single_reduction_value: '',

          /** 是否全部商品参与*/
          range_type: 1,

          /** 活动商品*/
          goods_list: []
        }
        // 获取某天23:59:59秒的时间戳
        this.endTime = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 * 30 - 1).getTime()
      },

      /** 保存表单设置 为此活动保存表单 提交商品goods_id 字符串 用逗号分隔*/
      saveActivity(formName) {
        this.$refs[formName].validate((valid, list) => {
          if (valid) {
            const _params = this.generateFormData(this.activityForm)
            delete _params.take_effect_time
            if (this.activityForm.minus_id) {
              API_activity.saveSingleCutActivity(this.activityForm.minus_id, _params).then(response => {
                this.$message.success('修改成功！')
                this.activeName = 'singleCutList'
                this.singleCutName = '新增单品立减'
                this.GET_SingleCutActivityList()
              }).catch((res) => {
                if (res.response.data.code === '401' && res.response.data.data) {
                  const goods_name = JSON.parse(res.response.data.data).map(key => { return key.name }).toString()
                  this.$message.error(`${goods_name}已经参加其它活动，于当前活动存在冲突`)
                } else {
                  this.$message.error(res.response.data.message)
                }
              })
            } else {
              API_activity.addSingleCutActivity(_params).then(response => {
                this.$message.success('添加成功！')
                this.activeName = 'singleCutList'
                this.singleCutName = '新增单品立减'
                this.GET_SingleCutActivityList()
              }).catch((res) => {})
            }
          }
        })
      },

      /** 构造表单数据 */
      generateFormData(data) {
        let _goodslist = []
        if (data.goods_list && Array.isArray(data.goods_list) && this.activityForm.range_type === 2) {
          _goodslist = data.goods_list.map(key => {
            return {
              goods_id: key.goods_id,
              sku_id: key.sku_id,
              name: key.goods_name,
              goods_name: key.goods_name,
              thumbnail: key.thumbnail,
              seller_id: key.seller_id
            }
          })
        }
        const _params = {
          /** 活动名称/标题 */
          title: data.title,

          /** 活动开始时间 */
          start_time: data.take_effect_time[0] / 1000,

          /** 活动结束时间 */
          end_time: data.take_effect_time[1] / 1000,

          /** 单品立减金额 */
          single_reduction_value: parseFloat(data.single_reduction_value),

          /** 商品参与方式 */
          range_type: data.range_type,

          /** 活动描述 */
          description: data.description
        }
        /** 活动描述 */
        if (_goodslist.length > 0 && this.activityForm.range_type === 2) {
          /** 参与商品列表 */
          _params.goods_list = _goodslist
        } else {
          delete _params.goods_list
        }
        return _params
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  .single-cut ::v-deep div.toolbar {
    height: 70px;
    padding: 20px 0;
  }
  .drawer-text {
    color: #006BB4;
    cursor: pointer;
    &:hover {
      text-decoration:underline;
    }
  }

  .goods-image {
    width: 50px;
    height: 50px;
  }
  /*新增表单面板*/
  .single-cut ::v-deep .el-form-item__content {
    width: 80%;
    .el-input .el-input--medium {
      max-width: 80%;
    }
  }

  .content-goods-publish {
    padding: 15px;
    margin: 0 auto;
    text-align: center;
    border: 1px solid #ddd;
    background: none repeat scroll 0 0 #fff;
  }

  /*表单信息*/
  .el-form {
    padding-bottom: 80px;
    .el-form-item {
      width: 100%;
      text-align: left;

      /*送积分*/
      .integral-show {
        .el-input {
          width: 50px;
        }
      }
      /** 下拉列表 */
      ::v-deep .el-select .el-select--medium {
        width: 160px;
      }
    }
    .discount-model {
      div {
        margin: 5px 0;
      }
    }

    /*提交按钮*/
    ::v-deep .btn-submit {
      width: 100%;
      .el-form-item__content {
        text-align: center;
      }
    }
  }

  /** 表格信息 */
  .goods-info {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    div {
      a {
        color: #409EFF;
      }
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      justify-content: space-between;
      align-items: flex-start;
      margin-left: 20px;
    }
  }

  /*平铺*/
  div.base-info-item {
    h4 {
      padding:0 10px;
      border: 1px solid #ddd;
      background-color: #f8f8f8;
      font-weight: bold;
      color: #333;
      font-size: 14px;
      line-height: 40px;
      text-align: left;
    }
    h4 + div {
      margin-top: 15px;
    }
    .el-form-item {
      margin-left: 5%;
      min-width: 300px;
    }
    .el-form-item__content {
      margin-left: 120px;
      text-align: left;
    }
    p.goods-group-manager {
      padding-left: 12.3%;
      text-align: left;
      color: #999;
      font-size: 13px;
    }
  }

  /*商品表格信息*/
  .goods-table {
    ::v-deep thead>tr {
      th:nth-child(2) {
        text-align: left !important;
      }
    }
  }

  /*遮罩层*/
  .cus-mask {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    // z-index: 10000;
  }
  .single-cut ::v-deep .el-tabs__item.is-disabled {
    color: #409EFF;
  }
</style>


