<template>
  <div v-loading="loading" class="shop-edit">
    <el-form
      class="shop-info-form"
      :model="shopForm"
      :rules="shopRules"
      ref="shopForm"
      :disabled="isDisabled"
      label-width="180px">
      <el-tabs type="border-card" v-model="tableName" ref="tabs">

        <el-tab-pane label="基本信息" name="base" :class="{'base-form': !open_i18n}">
          <el-form-item label="公司名称" prop="company_name">
            <el-input v-model="shopForm.company_name" :maxlength="200"></el-input>
          </el-form-item>
          <el-form-item label="公司地址" prop="company_address">
            <el-input v-model="shopForm.company_address" :maxlength="200"></el-input>
          </el-form-item>
          <el-form-item label="公司电话" prop="company_phone">
            <el-input v-model="shopForm.company_phone" :maxlength="20"></el-input>
          </el-form-item>
          <el-form-item label="员工总数" prop="employee_num" class="employee_num">
            <el-input-number v-if="!isDisabled" v-model="shopForm.employee_num" :min="1" :max="99999999" />
            <el-input v-else v-model="shopForm.employee_num"></el-input>
          </el-form-item>
          <el-form-item label="注册资金" prop="reg_money">
            <el-input
              v-if="!isDisabled"
              v-model="shopForm.reg_money"
              class="reg-money-input"
              :maxlength="10">
              <template slot="append">万</template>
            </el-input>
            <span v-else class="common-text">{{shopForm.reg_money}}万</span>
          </el-form-item>
          <el-form-item label="联系姓名" prop="link_name">
            <el-input v-model="shopForm.link_name" :maxlength="50"></el-input>
          </el-form-item>
          <el-form-item required v-if="isDisabled" label="联系电话" prop="link_phone">
            <span class="common-text">
              {{shopForm.link_phone | formatMobile}}
            </span>
          </el-form-item>
          <en-area-select
            v-else
            :showType="1"
            labelText="联系电话"
            ref="AreaSelect"
            :class="open_i18n ? 'area-input' : 'area-form'"
            v-model="shopForm.link_phone" />
          <el-form-item label="电子邮箱" prop="company_email">
            <el-input v-model="shopForm.company_email" :maxlength="50"></el-input>
          </el-form-item>
          <el-form-item label="自营店铺" prop="self_operated" v-if="!MixinIsSupplier()">
            <el-radio-group disabled v-model="shopForm.self_operated">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="店铺简介：" prop="shop_desc">
            <div v-if="isDisabled" v-html="shopForm.shop_desc"></div>
            <en-rich-text-editor
              v-else
              class="shop-desc"
              :disabled="isDisabled"
              v-model="shopForm.shop_desc"
              :upload-api="MixinUploadApi"
              :upload-headers="MixinAccessToken"
              maxlength="9999" />
          </el-form-item>
          <!--店铺logo-->
          <el-form-item label="店铺logo：" prop="shop_logo">
            <el-upload
              class="upload-demo"
              key="shop_logo"
              :action="`${MixinUploadApi}?scene=shop`"
              :headers="MixinAccessToken"
              :on-success="uploadSuccessLogo"
              :on-remove="delGiftImg"
              :before-upload="handleImagesUrlBefore"
              :file-list="fileList_logo"
              ref="fileList_logo"
              list-type="picture">
              <el-button size="small" type="primary">
                上传<i class="el-icon-upload el-icon--right"></i>
              </el-button>
              <div slot="tip" class="el-upload__tip">
                此处为您的店铺logo，将显示在店铺Logo栏里。 （限制上传正方形的图片，推荐尺寸120 * 120）
              </div>
            </el-upload>
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="营业执照信息" name="legal">
          <div style="display: flex;">
            <div style="margin-right: 20px; width: 700px">
              <el-form-item label="法人姓名" prop="legal_name">
                <el-input v-model="shopForm.legal_name" :maxlength="200"></el-input>
              </el-form-item>
              <el-form-item label="法人身份证号" prop="legal_id">
                <el-input v-model="shopForm.legal_id" :maxlength="50"></el-input>
              </el-form-item>
              <el-form-item label="统一社会信用代码" prop="license_num">
                <el-input v-model="shopForm.license_num" :maxlength="50"></el-input>
              </el-form-item>
              <el-form-item label="营业执照详细地址 " prop="license_add">
                <el-input v-model="shopForm.license_add" :maxlength="200"></el-input>
              </el-form-item>
              <el-form-item label="成立日期" prop="establish_date">
                <span v-if="isDisabled" class="common-text">
                  {{(shopForm.establish_date / 1000) | unixToDate('yyyy-MM-dd')}}
                </span>
                <el-date-picker
                  v-else
                  class="license-date"
                  v-model="shopForm.establish_date"
                  type="date"
                  align="center"
                  :editable="false"
                  value-format="timestamp"
                  :picker-options="{ disabledDate(time) { return time.getTime() > (shopForm.licence_end - 86400000) } }">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="营业执照有效期" prop="licence_start">
                <span class="common-text" v-if="isDisabled">
                  {{(shopForm.licence_start / 1000) | unixToDate('yyyy-MM-dd')}}
									<span v-if="Number(shopForm.licence_end)"> - {{(shopForm.licence_end / 1000) | unixToDate('yyyy-MM-dd')}}</span>
          				<span v-else> - 永久</span>
                </span>
                <template v-else>
                  <el-date-picker class="license-date" v-model="shopForm.licence_start" type="date" align="center"
                    :editable="false" value-format="timestamp"
                    :picker-options="{ disabledDate(time) { return time.getTime() > (shopForm.licence_end - 86400000) } }">
                  </el-date-picker>
                  <span>-</span>
                  <el-date-picker class="license-date" v-model="shopForm.licence_end" type="date" align="center"
                    :editable="false" value-format="timestamp"
                    :picker-options="{ disabledDate(time) { return time.getTime() < (shopForm.licence_start + 86400000) } }">
                  </el-date-picker>
                </template>
              </el-form-item>
              <el-form-item
                v-if="isDisabled"
                label="营业执照所在地"
                prop="license_region"
                key="license_region_one">
                <span class="common-text" v-if="shopForm.license_province">
                  {{(shopForm.license_country_name || '') + shopForm.license_province + shopForm.license_city }}
									<template v-if="shopForm.license_country_code === 'CN' || !shopForm.license_country_code">
										{{shopForm.license_county + (shopForm.license_town || '')}}
									</template>
                </span>
              </el-form-item>
              <el-form-item v-show="!isDisabled" label="营业执照所在地" prop="license_region">
                <en-region-picker
                  :api="MixinRegionApi"
                  :default="defaultRegionLicense"
                  @changed="handleRegionChanged('license', $event)"
                />
              </el-form-item>
            </div>
            <div>
              <br>
              <div class="scope-box">
                <el-form-item label="法定经营范围" prop="scope">
                  <el-input v-model="shopForm.scope" type="textarea" rows="5"></el-input>
                </el-form-item>
              </div>
              <br>
              <el-form-item label="法人身份证" prop="legal_img">
                <el-upload class="avatar-uploader" :action="MixinUploadApi" :headers="MixinAccessToken"
                  :show-file-list="false" :on-success="(res) => uploadSuccess(res, 'legal_img')">
                  <img v-if="shopForm.legal_img" :src="shopForm.legal_img" class="avatar">
                  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
                <a v-if="shopForm.legal_img" :href="shopForm.legal_img" target="_blank" class="see-original">查看原图</a>
              </el-form-item>
              <br>
              <el-form-item label="营业执照" prop="licence_img">
                <el-upload class="avatar-uploader" :action="MixinUploadApi" :headers="MixinAccessToken"
                  :show-file-list="false" :on-success="(res) => uploadSuccess(res, 'licence_img')">
                  <img v-if="shopForm.licence_img" :src="shopForm.licence_img" class="avatar">
                  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
                <a v-if="shopForm.licence_img" :href="shopForm.licence_img" target="_blank" class="see-original">查看原图</a>
              </el-form-item>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="开户行银行许可证" name="bank">
          <el-form-item label="银行开户名" prop="bank_account_name">
            <el-input v-model="shopForm.bank_account_name" :maxlength="200"></el-input>
          </el-form-item>
          <el-form-item label="公司银行账号" prop="bank_number">
            <el-input v-model="shopForm.bank_number" :maxlength="50"></el-input>
          </el-form-item>
          <el-form-item label="开户银行支行名称" prop="bank_name">
            <el-input v-model="shopForm.bank_name" :maxlength="200"></el-input>
          </el-form-item>
          <el-form-item
            v-if="isDisabled"
            label="开户行所在地"
            prop="bank_region">
            <span class="common-text" v-if="shopForm.bank_province">
              {{(shopForm.bank_country_name || '') + shopForm.bank_province + shopForm.bank_city}}
							<template v-if="shopForm.bank_country_code === 'CN' || !shopForm.bank_country_code">
								{{shopForm.bank_county + (shopForm.bank_town || '')}}
							</template>
            </span>
          </el-form-item>
          <el-form-item v-show="!isDisabled" label="开户行所在地" prop="bank_region">
            <en-region-picker
              :api="MixinRegionApi"
              :default="defaultRegionBank"
              @changed="handleRegionChanged('bank', $event)"
            />
          </el-form-item>
          <br>
          <el-form-item label="开户行许可证" prop="bank_img">
            <el-upload class="avatar-uploader" :action="MixinUploadApi" :headers="MixinAccessToken"
              :show-file-list="false" :on-success="(res) => uploadSuccess(res, 'bank_img')">
              <img v-if="shopForm.bank_img" :src="shopForm.bank_img" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
            <a v-if="shopForm.bank_img" :href="shopForm.bank_img" target="_blank" class="see-original">查看原图</a>
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="店铺信息" name="shop">
          <el-form-item label="店铺名称" prop="shop_name">
            <el-input v-model="shopForm.shop_name" :maxlength="200"></el-input>
          </el-form-item>
          <el-form-item label="佣金比例" prop="shop_commission" >
            <span>{{shopForm.shop_commission}}%</span>
          </el-form-item>

          <el-form-item v-if="isDisabled" label="店铺所在地" prop="shop_region">
            <span class="common-text" v-if="shopForm.shop_province">
              {{(shopForm.shop_country_name || '') + shopForm.shop_province + shopForm.shop_city + (shopForm.shop_county || '') + (shopForm.shop_town || '')}}
            </span>
          </el-form-item>
          <template>
            <el-form-item label="店铺所在地" v-show="!isDisabled" prop="shop_region">
              <en-region-picker :api="MixinRegionApi" :default="defaultRegionShop"
                                @changed="handleRegionChanged('shop', $event)"/>
            </el-form-item>
          </template>
          <el-form-item label="店铺详细地址" prop="shop_add">
            <el-input v-model="shopForm.shop_add" :maxlength="200"></el-input>
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="经营类目" name="category">
          <el-form-item label="经营类目" prop="goods_management_category" class="form-item-cat">
            <el-checkbox
              :indeterminate="isIndeterminateCat"
              v-model="checkAllCat"
              @change="handleCheckAllCatChange">全选</el-checkbox>
            <div style="margin: 15px 0;"></div>
            <el-checkbox-group
              v-model="shopForm.goods_management_category"
              @change="handleCheckedCatsChange">
              <el-checkbox v-for="cat in categorys" :label="cat.id" :key="cat.id">{{ cat.name }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="财务信息" name="financial">
          <el-form-item label="结算日" label-width="120px">
            <span>已添加{{settlementDate.length}}个结算日，最多可添加5个结算日</span>
          </el-form-item>
          <el-form-item label="每月：" label-width="120px" prop="settlement_day">
            <el-tag
              class="tag-item"
              :key="tag"
              v-for="(tag, index) in settlementDate"
              :disable-transitions="false"
              @close="handleCloseTag(index)">
              {{tag}}
            </el-tag>
          </el-form-item>
          <div class="sample-box">
            <p>注：店铺1号申请开店，设置结算日为15日、25日</p>
            <img style="width: 550px;" src="@/assets/jiesuan.png" />
            <p>生成的结算单依次为：1号-14号，15号至24号，25号至2月14号，往后结算单以此类推，每月生成2次，统计的订单日期到设置结算日前一天。</p>
          </div>
          <el-form-item label="订单结算状态" label-width="120px" prop="settlement_status">
            <el-checkbox-group
              disabled
              v-model="checkList"
              @change="changeSettlementStatus">
              <el-checkbox
                v-for="child in settlementStatus"
                :key="child.value"
                :label="child.value"
                >{{child.label}}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
      <div class="save-btn-box">
        <el-button :disabled="false" v-if="isDisabled" type="primary" @click="isDisabled = false">编辑</el-button>
        <template v-else>
          <el-button type="primary" @click="handleSaveEdit">保存</el-button>
          <el-button @click="isDisabled = true">取消</el-button>
        </template>
      </div>
    </el-form>
  </div>
</template>

<script>
import * as API_Shop from '@/api/shop'
import { RegExp, Foundation } from '~/ui-utils'
import { api } from '~/ui-domain'

const settlementStatus = [
  { label: '已付款', value: 'PAID_OFF' },
  { label: '已完成', value: 'COMPLETE' },
  { label: '售后失效', value: 'EXPIRED' }
]
export default {
  name: 'shopEdit',
  data() {
    return {
      settlementStatus,
      open_i18n: process.env.I18N,
      api: `${api.base}/base/countries`,
      license_countriesList: [],
      license_regionsList: [],
      license_regionsItem: {},
      bank_countriesList: [],
      bank_regionsList: [],
      bank_regionsItem: {},
      shop_countriesList: [],
      shop_regionsList: [],
      shop_regionsItem: {},
      tableName: 'base',
      loading: false,
      shopForm: {
        shop_commission: 5,
        goods_management_category: []
      },
      // 已选结算日期
      settlementDate: [],
      // 结算订单状态选择
      checkList: [],
      shopRules: {
        company_name: [this.MixinRequired('公司名称不能为空！')],
        company_address: [this.MixinRequired('公司地址不能为空！')],
        company_phone: [
          this.MixinRequired('公司电话不能为空！')
        ],
        employee_num: [this.MixinRequired('公司员工数不能为空！')],
        reg_money: [
          this.MixinRequired('注册资金不能为空！'),
          {
            validator: (rule, value, callback) => {
              if (value && !RegExp.money.test(value)) {
                callback(new Error('注册资金格式有误！'))
              } else if (value.length > 10) {
                callback(new Error('注册资金超过最大限额！'))
              } else {
                callback()
              }
            }
          }
        ],
        link_name: [this.MixinRequired('联系姓名不能为空！')],
        link_phone: [
          {
            validator: (rule, value, callback) => {
              const { mobile_regex, formatValid } = this.$refs.AreaSelect
              if (!value) {
                callback(new Error('联系电话不能为空！'))
              } else if (mobile_regex && !Foundation.eval2(mobile_regex).test(formatValid(value))) {
                callback(new Error('联系电话格式不正确！'))
              } else {
                callback()
              }
            }
          }
        ],
        company_email: [this.MixinRequired('公司电子邮箱不能为空！')],
        legal_name: [this.MixinRequired('法人姓名不能为空！')],
        legal_id: [
          this.MixinRequired('法人身份证不能为空！'),
          {
            validator: (rule, value, callback) => {
              if (value && !RegExp.IDCard.test(value)) {
                callback(new Error('身份证格式不正确！'))
              } else {
                callback()
              }
            }
          }
        ],
        license_num: [this.MixinRequired('营业执照不能为空！')],
        scope: [this.MixinRequired('法定经营范围不能为空！')],
        license_region: [this.MixinRequired('请选择营业执照所在地！')],
        license_add: [this.MixinRequired('营业执照详细地址不能为空！')],
        establish_date: [this.MixinRequired('请选择公司成立日期！')],
        licence_start: [this.MixinRequired('请选择营业执照有效期开始时间！')],
        // licence_end: [this.MixinRequired('请选择营业执照有效期结束时间！')],
        legal_img: [this.MixinRequired('请上传法人身份证！')],
        licence_img: [this.MixinRequired('请上传营业执照！')],
        license_img: [this.MixinRequired('请上传营业执照！')],
        bank_account_name: [this.MixinRequired('银行开户名不能为空！')],
        bank_number: [this.MixinRequired('公司银行账号不能为空！')],
        bank_name: [this.MixinRequired('开户银行支行名称不能为空！')],
        bank_region: [this.MixinRequired('请选择开户行所在地！')],
        bank_img: [this.MixinRequired('请上传开户行许可证！')],
        shop_name: [this.MixinRequired('店铺名称不能为空！')],
        shop_region: [this.MixinRequired('请选择店铺所在地！')],

        shop_add: [this.MixinRequired('店铺详细地址不能为空！')],
        shop_commission: [
          this.MixinRequired('店铺佣金比例不能为空！'),
          {
            validator: (rule, value, callback) => {
              if (!RegExp.money.test(value)) {
                callback(new Error('店铺佣金比例格式不正确！'))
              } else if (value > 100) {
                callback(new Error('店铺佣金比例不能超过100%！'))
              } else {
                callback()
              }
            }
          }
        ],
        goods_management_category: [this.MixinRequired('请选择店铺经营类目！')]
      },
      isIndeterminateCat: true,
      checkAllCat: false,
      categorys: [],
      defaultRegionLicense: null,
      defaultRegionBank: null,
      defaultRegionShop: null,
      supplier: process.env.SUPPLIER,
      /** 店铺logo图片存*/
      fileList_logo: [],
      isDisabled: true
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(newVal) {
        if (newVal.name !== 'shopSettings') return
        this.shopForm = {
          shop_commission: 5,
          goods_management_category: []
        }
        this.initMemberInfo()
      }
    },
    settlementDate: {
      handler(val) {
        if (val) {
          this.shopForm.settlement_day = val.join(',')
        }
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 是否是供应商
     * @returns {any}
     * @constructor
     */
    MixinIsSupplier() {
      return this.$store.getters.isSupplier || false
    },
    /** 图片上传之前的校验 */
    handleImagesUrlBefore(file) {
      const isImage = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png'
      if (!isImage) {
        this.$message.error('上传头像图片只能是 JPG、JPEG或PNG格式!')
        return isImage
      }
      return new Promise((resolve, reject) => {
        let reader = new FileReader()
        reader.onload = (event) => {
          let image = new Image()
          image.onload = () => {
            let width = image.width
            let height = image.height
            if (width !== height) {
              this.$message.error('图片必须是正方形！')
              reject()
            }
            resolve()
          }
          image.src = event.target.result
        }
        reader.readAsDataURL(file)
      })
    },
    /** 上传logo成功以后*/
    uploadSuccessLogo(response) {
      this.fileList_logo.shift()
      this.fileList_logo.push(response)
      this.shopForm.shop_logo = response.url
    },
    /** 图片移除之后 */
    delGiftImg() {
      this.fileList = []
      this.shopForm.shop_logo = ''
    },
    /** 财务结算状态选择 */
    changeSettlementStatus() {
      if (this.checkList.length > 1) {
        this.checkList.splice(0, 1)
      }
      this.shopForm.settlement_status = this.checkList[0]
    },

    /** 删除结算日日期 */
    handleCloseTag(index) {
      this.settlementDate.splice(index, 1)
    },

    uploadSuccess(res, type) {
      this.$set(this.shopForm, type, res.url)
    },
    /** 经营类目全选 */
    handleCheckAllCatChange(val) {
      this.shopForm.goods_management_category = val ? this.categorys.map(item => item.id) : []
      this.isIndeterminateCat = false
    },

    /** 经营类目选择 */
    handleCheckedCatsChange(value) {
      let checkedCount = value.length
      this.checkAllCat = checkedCount === this.categorys.length
      this.isIndeterminateCat = checkedCount > 0 && checkedCount < this.categorys.length
    },
    handleRegionChanged(type, object) {
      const key = `${type}_region`
      this.$set(this.shopForm, key, JSON.stringify(object))
      this.$refs.shopForm.validateField(key)
    },
    /** 保存修改 */
    handleSaveEdit() {
      if (!this.checkRegionParams()) return
      this.$refs['shopForm'].validate((valid, error) => {
        if (valid) {
          const params = this._getParams()
          API_Shop.editAuthShop(params).then(response => {
            this.$message.success('保存成功！')
            this.$store.dispatch('getShopInfoAction')
            this.isDisabled = true
            this.initMemberInfo()
          })
        } else {
          this.$message.error('表单填写有误，请核对！')
          // 找到出错的第一个tab
          // 再将tab切换过去
          const firstError = Object.keys(error)[0]
          let tabChildren = this.$refs['tabs'].$children
          for (let i = 0; i < tabChildren.length; i++) {
            const item = tabChildren[i]
            let finded = false
            for (let j = 0; j < item.$children.length; j++) {
              if (item.$children[j].prop === firstError) {
                this.tableName = item.name
                finded = true
                break
              }
            }
            if (finded) break
          }
          return false
        }
      })
    },
    /** 检查地区参数 */
    checkRegionParams() {
      let license_region = this.shopForm[`license_region`] && JSON.parse(this.shopForm[`license_region`])
      let bank_region = this.shopForm[`bank_region`] && JSON.parse(this.shopForm[`bank_region`])
      let shop_region = this.shopForm[`shop_region`] && JSON.parse(this.shopForm[`shop_region`])

      if (license_region && license_region.country_code === 'CN' && (!license_region || !license_region.internal_region_id)) {
        this.$message.error('请选择营业执照所在地！')
        return false
      }
      if (bank_region && bank_region.country_code === 'CN' && (!bank_region || !bank_region.internal_region_id)) {
        this.$message.error('请选择开户行所在地！')
        return false
      }
      if (shop_region && shop_region.country_code === 'CN' && (!shop_region || !shop_region.internal_region_id)) {
        this.$message.error('请选择店铺所在地！')
        return false
      }
      return true
    },
    /** 获取提交参数 */
    _getParams() {
      const params = this.MixinClone(this.shopForm)
      params.licence_start /= 1000
      params.licence_end /= 1000
      params.establish_date /= 1000
      params.link_phone = this.$refs.AreaSelect.mobileValue
      return params
    },

    /** 初始化会员信息 */
    initMemberInfo() {
      Promise.all([
        API_Shop.getShopDetail(),
        API_Shop.getCategoryChildren()
      ]).then(responses => {
        const shopInfo = responses[0]
        const categorys = responses[1]
        if (shopInfo.shop_disable !== 'WAIN_IMPROVED') {
          // 设置店铺信息
          this.shopForm = this.MixinClone(shopInfo)
          const { shop_commission } = this.shopForm
          if (!shop_commission && shop_commission !== 0) {
            this.shopForm.shop_commission = 5
          }
          this.shopForm.licence_start *= 1000
          this.shopForm.licence_end = +this.shopForm.licence_end === 0 ? null : this.shopForm.licence_end *= 1000
          this.shopForm.establish_date *= 1000

          this.defaultRegionLicense = this.MixinGetRegionDefaultData(shopInfo, 'license_')
          this.defaultRegionBank = this.MixinGetRegionDefaultData(shopInfo, 'bank_')
          this.defaultRegionShop = this.MixinGetRegionDefaultData(shopInfo, 'shop_')

          console.log('defaultRegionLicense=', this.defaultRegionLicense)
          console.log('defaultRegionBank=', this.defaultRegionBank)
          console.log('defaultRegionShop=', this.defaultRegionShop)

          this.shopForm.goods_management_category = []
          if (shopInfo.goods_management_category) {
            const _categorys = shopInfo.goods_management_category.split(',')
            this.shopForm.goods_management_category = _categorys
            if (_categorys.length !== 0) {
              if (_categorys.length < categorys.length) {
                this.isIndeterminateCat = true
              } else if (_categorys.length === categorys.length) {
                this.checkAllCat = true
              }
            }
          }
          if (shopInfo.settlement_day) {
            this.settlementDate = shopInfo.settlement_day.split(',')
          }
          if (shopInfo.settlement_status) {
            this.checkList = [shopInfo.settlement_status]
          }
          shopInfo.shop_logo && (this.fileList_logo = [{ url: shopInfo.shop_logo }])
        } else {
          this.shopForm.shop_disable = shopInfo.shop_disable
          this.shopForm.shop_name = shopInfo.shop_name
        }

        // 设置经营类目
        this.categorys = categorys.map(item => ({
          id: String(item.category_id),
          name: item.name
        }))
        // 避免快速点击造成的地区未选择问题
        setTimeout(() => {
          this.loading = false
        }, 500)
      })
    }
  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.shop-edit ::v-deep .shop-info-form {
	.mobile-item {
		max-width: 100% !important;
	}
  .common-text {
    color: #333;
    font-size: 13px;
  }
  .el-input.is-disabled .el-input__inner {
    background-color: #fff;
    color: #333;
    border: none
  }
  .upload-demo {
    width: 600px;
  }

  .region-picker {
    .app-address-body {
      left: 0 !important;
    }
  }
  .el-input__inner {
    width: 400px;
  }
  .area-form {
    .el-form-item__label {
      width: 180px !important;
    }
    .el-form-item__content {
      margin-left: 180px !important;
    }
  }

  .area-input {
    .el-input__inner {
      width: calc(400px - 80px);
    }
    .el-select .el-input__inner {
      width: 80px !important;
    }
  }
  .reg-money-input, .shop-commission-input {
    .el-input__inner {
      width: calc(400px - 54px);
    }
  }
  .el-input-number--small {
    width: 180px;
  }
  .employee_num .el-input__inner {
    width: 180px;
  }
  .el-form-item__content {
    width: 400px;
  }
  .shop-desc {
    width: 800px;
  }
  .el-date-editor {
    .el-input__inner {
      width: 180px;
    }
  }
  .base-form {
    .el-form-item__label {
      width: 100px;
    }
  }
  .form-item {
    .el-form-item__label {
      width: 190px;
    }
    .el-form-item__content {
      width: 100%;
    }
    .el-input--small {
      width: 400px;
    }
  }
  .el-form-item {
    margin-bottom: 26px;
  }
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;

    &:hover {
      border-color: #409eff
    }
  }
  .avatar-uploader {
    width: 180px;
    height: 180px;

    img {
      width: 100%;
      height: 100%
    }
  }
  .avatar-uploader .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .form-item-cat .el-form-item__content {
    width: auto
  }
  .el-tabs__content {
    overflow: inherit;
  }

}
.tag-item {
  margin-right: 10px;
}
.sample-box {
  padding-left: 60px;
  font-size: 14px;
  color: #333;
}
.tips {
  padding-left: 100px;
  margin-bottom: 10px;
  font-size: 13px;
  color: #999;
}
.security-deposit {
  font-size: 16px;
  color: #666;
  margin-right: 20px;
  font-weight: 600;
}




.save-btn-box {
  text-align: center;
  background-color: #fff;
  padding: 10px 0;
  border: 1px solid #dcdfe6;
  border-top: 0;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, .12), 0 0 6px 0 rgba(0, 0, 0, .04);
}



.see-original {
  font-size: 12px;
  color: #006db7;

  &:hover {
    color: #F00
  }
}

.license-date {
  width: 180px;
}

.areal-item {
  display: flex;
  align-items: center;

  .flag {
    width: 20px;
    margin-right: 10px;
  }
}
</style>
