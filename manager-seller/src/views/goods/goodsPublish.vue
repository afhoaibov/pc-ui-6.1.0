<template>
  <div v-loading="loading" class="goods-publish-wrap">
    <el-steps :active="activestep"
              finish-status="success"
              process-status="process"
              simple
              style="margin-top: 20px">
      <el-step class="step-item" v-if="!isO2O" title="1.选择商品品类" @click.native="changeStep(0)"></el-step>
      <el-step class="step-item" :title="isO2O ? '1.编辑基本信息' : '2.编辑基本信息'" @click.native="changeStep(1)"></el-step>
      <el-step class="step-item" :title="isO2O ? '2.编辑商品详情' : '3.编辑商品详情'" @click.native="changeStep(2)"></el-step>
    </el-steps>
    <!--步骤1-->
    <div class="content-goods-publish"
         v-show="activestep === 0">
      <div class="goods-category">
        <ul v-if="categoryListLevel1 && categoryListLevel1.length > 0">
          <li v-for="(item,index) in categoryListLevel1"
              :key="index"
              :class="{'activeClass':index == activeCategoryIndex1}"
              @click="handleSelectCategory(item, index, 1)">
            <span>{{ item.name }}</span> <span>》</span>
          </li>
        </ul>
        <ul v-if="categoryListLevel2 && categoryListLevel2.length > 0">
          <li v-for="(item,index) in categoryListLevel2"
              :key="index"
              :class="{'activeClass':index == activeCategoryIndex2}"
              @click="handleSelectCategory(item,index, 2)">
            <span>{{ item.name }}</span> <span>》</span>
          </li>
        </ul>
        <ul v-if="categoryListLevel3 && categoryListLevel3.length > 0">
          <li v-for="(item,index) in categoryListLevel3"
              :key="index"
              :class="{'activeClass':index == activeCategoryIndex3}"
              @click="handleSelectCategory(item,index, 3)">
            <span>{{ item.name }}</span> <span>》</span>
          </li>
        </ul>
      </div>
      <p class="current-goods-category">
        您当前选择的商品类别是：
        <span>{{ activeCategoryName1 }}</span>
        <span v-show="activeCategoryName2"> > {{ activeCategoryName2 }}</span>
        <span v-show="activeCategoryName3"> > {{ activeCategoryName3 }}</span>
      </p>
    </div>
    <!--步骤2-->
    <div class="content-goods-publish"
         v-show="activestep === 1">
      <!--商品详情-->
      <el-form :model="baseInfoForm"
               status-icon
               :rules="baseInfoFormRule"
               label-position="right"
               ref="baseInfoForm"
               label-width="120px"
               class="demo-ruleForm">
        <!--商品详情-->
        <!--基本信息-->
        <div class="base-info-item">
          <h4>基本信息</h4>
          <div>
            <el-form-item class="auth-info"
                          label="拒绝原因："
                          v-if="baseInfoForm.is_auth === 2">
              {{ baseInfoForm.auth_message }}
            </el-form-item>
            <el-form-item
              v-if="baseInfoForm.source_type !== 'SUPPLIER' && !MixinIsSupplier()"
              label="商品类型："
              prop="goods_type">
              <div class="type-choose-box">
                <div
                class="goods-type-item"
                :class="{'goods-type-item-sel': baseInfoForm.goods_type == 'NORMAL'}"
                @click="baseInfoForm.goods_type = 'NORMAL'"
                >普通商品</div>
                <div
                  class="goods-type-item"
                  :class="{'goods-type-item-sel': baseInfoForm.goods_type == 'VIRTUAL'}"
                  @click="baseInfoForm.goods_type = 'VIRTUAL'">虚拟商品</div>
              </div>
              <el-form-item v-if="baseInfoForm.goods_type == 'VIRTUAL'"
                            label="虚拟商品失效天数："
                            prop="expired_date"
                            label-width="150px"
                            class="goods-name-width">
                <el-input v-model="baseInfoForm.expired_date"
                          oninput="value = value.replace(/[^\d]/g, '')"
                          placeholder="请输入虚拟商品失效天数"></el-input>
              </el-form-item>
            </el-form-item>
            <el-form-item label="商品分类："
                          style="width: 100%; text-align: left;">
              <span>{{ activeCategoryName1 }}</span>
              <span v-show="activeCategoryName2"> > {{ activeCategoryName2 }}</span>
              <span v-show="activeCategoryName3"> > {{ activeCategoryName3 }}</span>
              <span v-if="!activeCategoryName1"
                    v-html="baseInfoForm.category_name"></span>
            </el-form-item>
            <template v-if="!MixinIsSupplier()">
              <el-form-item label="店铺商品分组：" prop="shop_cat_id">
                <!--商品分组 获取分类列表 传入默认值-->
                <en-category-picker @changed="changeGoodsCateGory"
                                    :clearable='true'
                                    :defaultVal='baseInfoForm.shop_cat_id' />
              </el-form-item>
              <p class="goods-group-manager">
                商品可以从属于店铺的某个分组之下，店铺分组可以由 "商家中心 -> 商品管理 -> 分组管理" 中自定义
              </p>
            </template>
            <el-form-item label="商品品牌：" v-show="!isO2O" prop="brand_id">
              <el-select v-model="baseInfoForm.brand_id"
                         filterable
                         @change="changeGoodsBrand"
                         clearable
                         placeholder="请选择">
                <el-option v-for="item in brandList"
                           :key="item.brand_id"
                           :label="item.name"
                           :value="item.brand_id">
                </el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>
        <!--商品信息-->
        <div class="base-info-item">
          <h4>商品信息</h4>
          <div>
            <el-form-item label="商品名称："
                          prop="goods_name"
                          class="goods-name-width">
              <el-input v-model="baseInfoForm.goods_name"
                        @change="() => { baseInfoForm.goods_name = baseInfoForm.goods_name.trim() }"
                        :maxlength="30"
                        :minlength="3"
                        placeholder="3-30个字符"></el-input>
            </el-form-item>
            <el-form-item label="商品编号："
                          prop="sn">
              <el-input v-model="baseInfoForm.sn"
                        :maxlength="20"></el-input>
            </el-form-item>
            <el-form-item
              v-if="MixinIsSupplier()"
              label="供应价格："
              prop="price"
              :maxlength="10">
              <el-input
               placeholder="请输入供应价格"
                v-model="baseInfoForm.price">
                <template slot="prepend">{{MixinUnitOfCurrency}}</template>
              </el-input>
            </el-form-item>
            <template v-if="!MixinIsSupplier()">
              <el-form-item
                v-if="baseInfoForm.source_type === 'SUPPLIER'"
                label="供应价格："
                prop="supplier_price">
                <el-input
                  disabled
                  v-model="baseInfoForm.supplier_price">
                  <template slot="prepend">{{MixinUnitOfCurrency}}</template>
                </el-input>
              </el-form-item>
              <el-form-item label="市场价格："
                          prop="mktprice"
                          :maxlength="10">
              <el-input placeholder="请输入市场价格"
                        v-model="baseInfoForm.mktprice">
                <template slot="prepend">{{MixinUnitOfCurrency}}</template>
              </el-input>
              </el-form-item>

              <el-form-item label="商品价格："
                            prop="price"
                            :maxlength="10">
                <el-input placeholder="请输入商品价格"
                          v-model="baseInfoForm.price">
                  <template slot="prepend">{{ MixinUnitOfCurrency }}</template>
                </el-input>
              </el-form-item>
              <p class="goods-group-manager" v-if="open_i18n"
                   slot="content">请根据默认货币设置商品最低销售价格
                <a href="https://docs.stripe.com/currencies#minimum-and-maximum-charge-amounts" target="_blank"> 查看详细信息</a>
              </p>
            </template>
            <el-form-item
              label="成本价格："
              v-if="baseInfoForm.source_type !== 'SUPPLIER'"
              prop="cost"
              :maxlength="10">
              <el-input placeholder="请输入成本价格"
                        v-model="baseInfoForm.cost">
                <template slot="prepend">{{MixinUnitOfCurrency}}</template>
              </el-input>
            </el-form-item>

            <el-form-item label="商品重量："
                          prop="weight"
                          :maxlength="10">
              <el-input
                placeholder="请输入商品重量"
                v-model="baseInfoForm.weight"
                :disabled="baseInfoForm.source_type === 'SUPPLIER'">
                <template slot="prepend">kg</template>
              </el-input>
            </el-form-item>
            <el-form-item label="积分兑换：" v-if="!MixinIsSupplier()">
              <el-switch v-model="isShowExchangeConfig"
                         active-color="#13ce66"
                         inactive-color="#ff4949"
                         active-text="开启"
                         inactive-text="关闭"
                         @change="handleSwitchexchange">
              </el-switch>

            </el-form-item>
            <el-form-item label="兑换积分："
                          v-if="isShowExchangeConfig"
                          prop="exchange_point"
                          :maxlength="10">
              <el-input placeholder="请输入兑换商品所需的积分"
                        v-model="baseInfoForm.exchange_point">
                <template slot="prepend">P</template>
              </el-input>
            </el-form-item>
            <el-form-item label="商品图片："
                          ref="goods_gallery"
                          prop="goods_gallery"
                          style="width: 90%;text-align: left;">
              <upload-sortable class="avatar-uploader goods-images"
                                :goodsGalleryList='goodsGalleryList'
                                @click.native="handleUploadPicture"
                                @change="handlePictureChange" />
              <el-dialog :visible.sync="dialogImage">
                <img width="100%"
                     :src="dialogImageUrl"
                     alt="">
              </el-dialog>
            </el-form-item>
            <el-form-item label="商品视频："
                          style="width: 90%;text-align: left;"
                          v-if="!isO2O">
              <div class="avatar"
                   v-if="baseInfoForm.goods_video">
                <video :src="baseInfoForm.goods_video"
                       class="video-avatar"
                       autoplay="autoplay"
                       controls="controls">
                  您的浏览器不支持视频播放
                </video>
                <i class="el-icon-close close"
                   @click.stop="handleRemoveGoodsVideo"></i>
              </div>
              <el-upload
                :action="MixinUploadApi"
                v-if="!baseInfoForm.goods_video"
                list-type="picture-card"
                @click.native="handleUploadVideo"
              >
                <i class="el-icon-plus"></i>
                <div
                  slot="tip"
                  class="el-upload__tip">最多可以上传1个视频，建议大小50MB，推荐格式：mp4、mov、mkv，视频时长不超过180s</div>
              </el-upload>
            </el-form-item>
          </div>
        </div>
        <!--物流/其他-->
        <div
          class="base-info-item"
          v-if="baseInfoForm.goods_type !== 'VIRTUAL' && baseInfoForm.source_type !== 'SUPPLIER'">
          <h4>物流/其他</h4>
          <div>
            <el-form-item label="运费设置："
                          style="width: 100%;"
                          required
                          prop="template_id">
              <div style="display: flex; align-items: center;">
                <el-select v-model="templateVal"
                         placeholder="请选择运费模板"
                         @change="changeTpl">
                  <el-option v-for="item in tplList"
                            :key="item.id"
                            :label="item.name"
                            :value="JSON.stringify(item)">
                  </el-option>
                </el-select>
                <div class="template-btn">
                  <span @click="addTemplate">新建</span><span v-if="templateVal && selectTemplate.items" @click="showTemplate = !showTemplate"> | {{showTemplate ? '收起' : '展示'}}模板</span>
                </div>
              </div>
            </el-form-item>
            <!-- 运费模板详情 -->
            <el-table
              border
              v-if="selectTemplate.items && selectTemplate.items.length && showTemplate"
              :header-cell-style="rowClass"
              :data="selectTemplate.items"
              style="width: 80%; margin-left: 120px;">
              <!--计费区域-->
              <el-table-column label="计费区域" align="left">
                <template slot-scope="scope">
                  <div>
                    <span v-for="(item, index) in scope.row.regions" :key="index">
                      <span style="color: #333;"> {{ item.name }}
                        <span v-if="++index !== scope.row.regions.length">、</span>
                      </span>
                      <span v-if="item.children" style="color: #777;">
                        <span style="color: #aaa;">(</span>
                        <span v-for="(child, _index) in item.children" style="color: #aaa;" :key="_index">
                          {{ child.name }}<span v-if="++_index !== item.children.length">,</span>
                        </span>
                        <span style="color: #aaa;">)</span>
                      </span>
                    </span>
                  </div>
                </template>
              </el-table-column>
              <!--首重（kg）-->
              <el-table-column prop="first_company" :label="selectTemplate.type === 1 ? '首重（kg）': '首件（个）'" />
              <el-table-column label="运费">
                <template slot-scope="scope">
                  <span>{{ scope.row.first_price | unitPrice }}</span>
                </template>
              </el-table-column>
              <!--续重（kg）-->
              <el-table-column prop="continued_company" :label="selectTemplate.type === 1 ? '续重（kg）': '续件（个）'"/>
              <el-table-column label="续费">
                <template slot-scope="scope">
                  <span>{{ scope.row.continued_price | unitPrice }}</span>
                </template>
              </el-table-column>
            </el-table>

            <el-form-item label="独立包装："
                          style="width: 100%;"
                          prop="need_packing"
                          v-if="isO2O">
              <el-radio-group v-model="baseInfoForm.need_packing">
                <el-radio label="YES">是</el-radio>
                <el-radio label="NO">否</el-radio>
              </el-radio-group>
              <el-form-item label="包装费："
                            prop="packing_price"
                            :maxlength="10"
                            v-show="baseInfoForm.need_packing === 'YES'"
                            class="goods-packing">
                <el-input placeholder="请输入包装费"
                          v-model="baseInfoForm.packing_price">
                  <template slot="prepend">{{MixinUnitOfCurrency}}</template>
                </el-input>
              </el-form-item>
            </el-form-item>
          </div>
        </div>
        <!--商品参数-->
        <el-collapse :value="collapseVal">
          <el-collapse-item v-for="paramsgroup in  goodsParams"
                            v-if="paramsgroup"
                            :title="paramsgroup.group_name"
                            :key="paramsgroup.group_id"
                            :name="paramsgroup.group_id">
            <el-form-item
                label-width="100"
                v-for="(goods_params_list, index) in baseInfoForm.goods_params_list"
                v-if="goods_params_list && goods_params_list.group_id && paramsgroup.group_id === goods_params_list.group_id"
                :key="index"
                :label="`${goods_params_list.param_name}：`"
                :prop="'goods_params_list.' + index + '.param_value'"
                :rules="goods_params_list.required === 1 ? {required: true, message: `${goods_params_list.param_name}不能为空`, trigger: 'change' } : {}">
              <el-input placeholder="长度为最多100个字符"
                        maxlength="100"
                        v-if="goods_params_list.param_type === 1"
                        v-model="goods_params_list.param_value">
              </el-input>
              <el-select v-if="goods_params_list.param_type === 2"
                         v-model="goods_params_list.param_value"
                         placeholder="请选择">
                <el-option v-for="(option) in goods_params_list.option_list"
                           :key="option"
                           :label="option"
                           :value="option">
                </el-option>
              </el-select>
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </el-form>
    </div>
    <!--步骤3-->
    <div v-if="activestep === 2" class="content-goods-publish">
      <el-form
        :model="baseInfoForm"
        label-position="right"
        ref="baseInfoFormIntro"
        label-width="120px"
        class="demo-ruleForm"
      >
        <el-form-item label="商品描述：" class="goods-intro">
          <en-rich-text-editor
            v-model="baseInfoForm.intro"
            :upload-api="MixinUploadApi"
            :upload-headers="MixinAccessToken"
            maxlength="9999"
          />
        </el-form-item>
        <el-form-item label="移动端描述：" class="goods-intro">
          <EditArea :mobileDescriptionList="baseInfoForm.intro_list" @change="handleDescriptionChange"/>
        </el-form-item>
      </el-form>
    </div>
    <!--底部-->
    <div class="footer">
      <el-button-group>
        <el-button type="primary"
                   @click="pre"
                   v-if="isO2O ? (activestep === 2) : (activestep === 1 || activestep === 2)">上一步</el-button>
        <el-button type="primary"
                   @click="next"
                   v-if="activestep === 0 || activestep === 1">下一步</el-button>
        <el-button type="primary"
                   @click="aboveGoods"
                   v-if="activestep === 1 || activestep === 2">上架</el-button>
        <el-button type="primary"
                   @click="handleUnderGoods"
                   v-if="currentStatus === 1 && ( activestep === 1 || activestep === 2) && baseInfoForm.market_enable === 1">下架</el-button>
        <el-button type="primary"
                   @click="saveDraft"
                   v-if="(currentStatus != 1 && activestep != 0)">保存草稿</el-button>
      </el-button-group>
    </div>

    <!-- 资源选择器 -->
    <en-resource-picker
      :show.sync="showResourcePicker"
      :type="resourcePickerType"
      :upload-api="MixinUploadApi"
      :upload-headers="MixinAccessToken"
      :request="MixinRequest"
      :limit="resourcePickerType === 'video' ? 1 : -1"
      @confirm="handleResourcePickerConfirm"
    />
  </div>
</template>

<script>
  import * as API_goods from '@/api/goods'
  import * as API_O2O from '@/api/o2o'
  import * as API_goodsCategory from '@/api/goodsCategory'
  import { CategoryPicker, UploadSortable } from '@/components'
  import EditArea from '@/components/EditArea'
  import { RegExp } from '~/ui-utils'
  import { cloneObj } from '@/utils/index'

  const baseInfoForm = {
    /** 品牌id */
    brand_id: '',

    /** 商城分类id */
    category_id: '0',

    /** 商城分类 名称 */
    category_name: '',

    /** 商品名称 */
    goods_name: '',

    /** 商品编号 sn*/
    sn: '',

    /** 商品价格 */
    price: '',

    /** 市场价格 */
    mktprice: '',

    /** 成本价格 */
    cost: '',

    /** 商品重量 */
    weight: '',

    /** 商品相册列表 */
    goods_gallery_list: [],

    /** 用来校验的商品相册 */
    goods_gallery: '',

    /** 商品视频 */
    goods_video: '',

    /** 卖家承担运费1 买家承担运费0 */
    free_freight: 1,

    /** 独立包装 开启YES  关闭NO */
    need_packing: 'NO',

    /** 包装费 */
    packing_price: '',

    /** 是否上架，1上架 0下架 */
    market_enable: 1,

    /** 模板运费id */
    template_id: '',

    /** 店铺分组id*/
    shop_cat_id: 0,

    /** seo描述 */
    meta_description: '',

    /** seo关键字 */
    meta_keywords: '',

    /** seo标题 */
    page_title: '',

    /** 商品参数列表 */
    goods_params_list: [],

    /** 商品描述 详情 */
    intro: '',

    /** 移动端描述 */
    /** 商品类型 */
    goods_type: 'NORMAL',
    /** 商品有效期天数 */
    expired_date: '',
    /** 是否为积分商品 */
    point_disable: 0,
    /** 兑换商品所需积分 */
    exchange_point: 0
  }

  export default {
    name: 'goodsPublish',
    components: {
      [CategoryPicker.name]: CategoryPicker,
      [UploadSortable.name]: UploadSortable,
      EditArea
    },
    data() {
      const checkHtml = (rule, value, callback) => {
        if (value.match(/<[^>]+>/g)) {
          callback(new Error('商品名称不合法！'))
        } else {
          callback()
        }
      }

      const checkSn = (rule, value, callback) => {
        if (!value) {
          callback(new Error('商品编号不能为空'))
        } else if (!/^[a-zA-Z0-9_\\-]+$/g.test(value)) {
          callback(new Error('请输入数字、字母、下划线或者中划线'))
        } else {
          callback()
        }
      }

      const checkMarket = (rule, value, callback) => {
        if (value && !RegExp.money.test(value)) {
          callback(new Error('请输入正整数或者两位小数'))
        } else if (parseFloat(value) > 99999999) {
          callback(new Error('市场价格设置超过上限值'))
        } else {
          callback()
        }
      }

      const checkPrice = (rule, value, callback) => {
        if (!value && value !== 0) {
          return callback(new Error('商品价格不能为空'))
        } else if (!RegExp.money.test(value)) {
          callback(new Error('请输入正整数或者两位小数'))
        } else if (parseFloat(value) > 99999999) {
          callback(new Error('商品价格设置超过上限值'))
        } else {
          callback()
        }
      }

      const checkCost = (rule, value, callback) => {
        if (!value && value !== 0) {
          return callback(new Error('成本价格不能为空'))
        } else if (!RegExp.money.test(value)) {
          callback(new Error('请输入正整数或者两位小数'))
        } else if (parseFloat(value) > 99999999) {
          callback(new Error('成本价格设置超过上限值'))
        } else {
          callback()
        }
      }

      const checkPoint = (rule, value, callback) => {
        if (!value && value !== 0) {
          return callback(new Error('兑换商品所需积分不能为空'))
        } else if (!RegExp.integer.test(value)) {
          callback(new Error('请输入大于0的正整数'))
        } else if (parseInt(value) > 99999999) {
          callback(new Error('积分数值设置超过上限值'))
        } else {
          callback()
        }
      }

      const checkWeight = (rule, value, callback) => {
        const regTest = /^\d+(\.\d{1,4})?$/
        if (!value && typeof value !== 'number') {
          callback(new Error('重量不能为空'))
        } else if (!regTest.test(value)) {
          callback(new Error('请输入正整数或者四位小数'))
        } else if (parseFloat(value) > 99999999) {
          callback(new Error('商品重量设置超过上限值'))
        } else {
          callback()
        }
      }

      const checkTplId = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请选择一种模板'))
        } else {
          callback()
        }
      }

      const checkPacking = (rule, value, callback) => {
        if (this.baseInfoForm.need_packing === 'YES') {
          if (!value && typeof value !== 'number') {
            callback(new Error('包装费不能为空'))
          } else if (!RegExp.money.test(value)) {
            callback(new Error('请输入正整数或者两位小数'))
          } else if (parseFloat(value) > 99999999) {
            callback(new Error('包装费设置超过上限值'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      }
      return {
        open_i18n: process.env.I18N,
        /** 店铺信息 */
        shopInfo: this.$store.getters.shopInfo,

        /** 加载中。。。 */
        loading: false,

        /** 当前状态/模式 默认发布商品0 编辑商品1 编辑草稿箱商品2 */
        currentStatus: 0,

        /** 当前激活步骤*/
        activestep: process.env.O2O ? 1 : 0,

        /** 上一步操作计数器 默认0次*/
        toPreCount: 0,

        /** 当前点击的1级分类索引*/
        activeCategoryIndex1: -1,

        /** 当前点击的2级分类索引*/
        activeCategoryIndex2: -1,

        /** 当前点击的3级分类索引*/
        activeCategoryIndex3: -1,

        /** 当前商品分类名称1*/
        activeCategoryName1: '',

        /** 当前商品分类名称2*/
        activeCategoryName2: '',

        /** 当前商品分类名称3*/
        activeCategoryName3: '',

        /** 当前商品id*/
        activeGoodsId: '',

        /** 1级分类列表*/
        categoryListLevel1: [],

        /** 2级分类列表*/
        categoryListLevel2: [],

        /** 3级分类列表*/
        categoryListLevel3: [],

        /** 商品详情信息提交表单 */
        baseInfoForm: this.MixinClone(baseInfoForm),

        /** 临时存储商品相册信息 */
        goodsGalleryList: [],

        /** 请求的商品参数组列表 */
        goodsParams: [
          {
            group_id: '',
            group_name: '',
            params: [
              {
                param_id: 0,
                param_name: '',
                param_type: 1,
                param_value: '',
                required: 0,
                option_list: [
                  { value: 1, label: '' },
                  { value: 2, label: '' }
                ]
              }
            ]
          }
        ],

        /** */
        collapseVal: [],

        /** 品牌列表 */
        brandList: [],

        /** 运费模板列表 */
        tplList: [],

        /** 商品图片放大地址 */
        dialogImageUrl: '',

        /** 是否显示放大图片弹框 */
        dialogImage: false,

        /** 是否显示积分配置*/
        isShowExchangeConfig: false,

        /** 商品详情的校验规则 */
        baseInfoFormRule: {
          goods_name: [
            { required: true, message: '请输入商品名称', trigger: 'blur' },
            {
              whitespace: true,
              message: '商品名称不可为纯空格',
              trigger: 'blur'
            },
            {
              min: 3,
              max: 200,
              message: '长度在 3 到 200 个字符',
              trigger: 'blur'
            },
            { validator: checkHtml }
          ],
          sn: [
            { required: true, message: '请输入商品编号', trigger: 'blur' },
            { validator: checkSn, trigger: 'blur' }
          ],
          supplier_price: { validator: checkPrice, trigger: 'blur' },
          mktprice: [
            { validator: checkMarket, trigger: 'blur' }
          ],
          price: [
            { required: true, message: '请输入商品价格', trigger: 'blur' },
            { validator: checkPrice, trigger: 'blur' }
          ],
          cost: [
            { required: true, message: '请输入成本价格', trigger: 'blur' },
            { validator: checkCost, trigger: 'blur' }
          ],
          exchange_point: [
            { required: true, message: '请输入兑换商品所需的积分', trigger: 'blur' },
            { validator: checkPoint, trigger: 'blur' }
          ],
          weight: [
            { required: true, message: '请输入商品重量', trigger: 'blur' },
            { validator: checkWeight, trigger: 'blur' }
          ],
          goods_gallery: [
            {
              required: true,
              validator: (rule, value, callback) => {
                if (!this.baseInfoForm.goods_gallery) {
                  return callback(new Error('请上传商品图片'))
                } else {
                  callback()
                }
              },
              trigger: 'change'
            }
          ],
          template_id: [{ validator: checkTplId, trigger: 'blur' }],
          packing_price: [{ validator: checkPacking, trigger: 'blur' }],
          expired_date: [{ required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (value === '' || !Number(value)) {
              callback(new Error('失效天数不能为空或为0'))
            } else if (Number(value) > 365) {
              callback(new Error('失效天数不得大于365天'))
            } else {
              callback()
            }
          }
          }]
        },
        /** 是否显示商品视频 */
        videoFlag: false,

        /** 视频进度条进度 */
        videoUploadPercent: '',

        /** 视频上传失败提示 */
        videoErrorTip: false,
        templateVal: '',
        // 已选运费模板详情展示
        showTemplate: false,
        // 当前选择运费模板详情
        selectTemplate: {
          type: 0
        },
        // 资源选择弹窗显隐
        showResourcePicker: false,
        // 资源选择类型
        resourcePickerType: 'image'
      }
    },
    watch: {
      $route: {
        immediate: true,
        handler(newVal) {
          if (newVal.name !== 'goodPublish') return
          this.init()
        }
      }
    },
    methods: {

      /** 初始化 */
      init() {
        const { goodsid, isdraft } = this.$route.params
        if (goodsid) {
          this.currentStatus = parseInt(isdraft) || 0
          this.activeGoodsId = goodsid
          this.activestep = isdraft ? 1 : 0
          if (this.currentStatus === 1) {
            this.GET_GoodData()
          } else if (this.currentStatus === 2) {
            this.GET_GoodDraftData()
          }
        } else {
          this.activeGoodsId = ''
          this.baseInfoForm = this.MixinClone(baseInfoForm)
          this.$nextTick(() => {
            this.$refs['baseInfoForm'].resetFields()
          })
          if (this.isO2O) {
            this.GET_Category()
            /** 运费模板列表 */
            this.getTplList()
          } else {
            this.GET_NextLevelCategory()
          }
        }
        this.$forceUpdate()
      },
      /** 步骤条切换 */
      changeStep(step) {
        if (!this.activestep && !this.activeCategoryName1) {
          this.$message.error('请选择商品分类')
          this.loading = false
          return
        } else {
          /** 查询品牌列表 */
          this.getGoodsBrandList()
          /** 运费模板列表 */
          this.getTplList()
        }
        this.activestep = step
        if (!step && !this.categoryListLevel1.length) {
          this.GET_NextLevelCategory(null, 0, true)
          this.baseInfoForm.brand_id = ''
          this.toPreCount++
        }
      },
      /** 上一步*/
      pre() {
        this.loading = true
        if (this.activestep === 1) {
          !this.isO2O && (this.toPreCount > 0 ? this.GET_NextLevelCategory() : this.GET_NextLevelCategory(null, 0, true))
          this.toPreCount > 0 ? this.GET_NextLevelCategory() : this.GET_NextLevelCategory(null, 0, true)
          if (this.activestep-- < 0) this.activestep = 0
          this.toPreCount++
          this.loading = false
          this.baseInfoForm.brand_id = ''
        } else {
          this.activestep--
          this.loading = false
        }
      },

      /** 下一步*/
      next() {
        /** 1级校验 */
        this.loading = true
        if (!this.isO2O) {
          if (this.activestep === 0 && !this.activeCategoryName1) {
            this.$message.error('请选择商品分类')
            this.loading = false
            return
          } else if (this.activestep === 0 && this.activeCategoryName1 && this.currentStatus === 0) {
            /** 查询品牌列表 */
            this.getGoodsBrandList()
            /** 运费模板列表 */
            this.getTplList()
          }
        }
        /** 2级校验 */
        if (this.activestep === 1) {
          this.$refs['baseInfoForm'].validate(valid => {
            if (valid) {
              this.loading = false
              if (this.activestep++ > 2) return
            } else {
              this.loading = false
              this.$message.error('表单中存在未填写或者填写有误的地方,已有错误标示，请检查并正确填写')
            }
          })
          return
        }
        /** 下一步 */
        this.loading = false
        !this.isO2O && this.getGoodsBrandList()
        if (this.activestep++ > 2) return
      },

      /** 显示资源选择器*/
      handleUploadPicture(event) {
        if (event.target.tagName !== 'INPUT') return
        event.cancelBubble = true
        event.stopPropagation()
        event.preventDefault()
        this.resourcePickerType = 'image'
        this.showResourcePicker = true
      },

      /** 显示上传我的视频弹框*/
      handleUploadVideo(event) {
        if (event.target.tagName !== 'INPUT') return
        event.cancelBubble = true
        event.stopPropagation()
        event.preventDefault()
        this.resourcePickerType = 'video'
        this.showResourcePicker = true
      },

      /** 保存草稿 */
      saveDraft() {
        const _params = this.generateFormData(this.baseInfoForm)
        if (this.activeGoodsId) {
          this.activeGoodsId = this.activeGoodsId || 1
          /** 修改草稿箱商品 */
          API_goods.editDraftGoods(this.activeGoodsId, _params).then(() => {
            this.$message.success('修改草稿箱商品成功')
            this.$store.dispatch('delCurrentViews', {
              view: this.$route,
              $router: this.$router
            })
            this.MixinRouterPush('draftList')
            this.$route.params.callback()
          })
        } else {
          /** 保存草稿操作 */
          API_goods.saveDraft(_params).then(() => {
            this.$message.success('保存草稿成功')
            this.$route.params.callback()
            this.$store.dispatch('delCurrentViews', {
              view: this.$route,
              $router: this.$router
            })
            this.MixinRouterPush('draftList')
          })
        }
      },

      /** 上架  */
      async aboveGoods() {
        if (this.baseInfoForm.activeGoodsId === 0) {
          this.$message.error('严重错误，商城分类Id不可为0')
          return
        }
        let _params = this.generateFormData(this.baseInfoForm)
        /** 上架 market_enable 1上架0下架*/
        _params.market_enable = 1
        this.$refs['baseInfoForm'].validate(valid => {
          if (valid) {
            if (this.currentStatus !== 2) {
              if (this.activeGoodsId) {
                /** 修改正常商品 */
                Promise.all([
                  this.isO2O ? API_O2O.editGoods(this.activeGoodsId, _params) : API_goods.editGoods(this.activeGoodsId, _params)
                ]).then(response => {
                  this.updateGoodsSuccess('修改商品成功')
                })
              } else {
                for (let i = 0; i < this.baseInfoForm.goods_gallery_list.length; i++) {
                  this.baseInfoForm.goods_gallery_list[i].sort = i
                }
                /** 正常商品上架 */
                Promise.all([
                  this.isO2O ? API_O2O.aboveGoods(_params) : API_goods.aboveGoods(_params)
                ]).then(() => {
                  this.updateGoodsSuccess('上架商品成功')
                })
              }
            } else {
              API_goods.aboveDraftGoods(this.activeGoodsId, _params).then(() => {
                this.updateGoodsSuccess('上架草稿箱商品成功')
              })
            }
          } else {
            this.$message.error('表单中存在未填写或者填写有误的地方,已有错误标示，请检查并正确填写')
          }
        })
      },
      /** 修改商品成功后跳转 */
      updateGoodsSuccess(msg) {
        this.$message.success(msg)
        this.$store.dispatch('delCurrentViews', {
          view: this.$route,
          $router: this.$router
        })
        this.MixinRouterPush('goodsList')
      },

      /** 下架*/
      handleUnderGoods() {
        API_goods.goodsBatchUnder(this.activeGoodsId).then(() => {
          this.$message.success('下架成功')
          this.$store.dispatch('delCurrentViews', {
            view: this.$route,
            $router: this.$router
          })
          this.MixinRouterPush('goodsList')
        })
      },

      /** 商城商品分类 */
      GET_Category() {
        API_goodsCategory.getGoodsCategoryLevelList(0, {}).then(response => {
          this.baseInfoForm.category_id = response[0].category_id
          this.baseInfoForm.category_name = response[0].name
          this.GET_GoodsParams(1)
        })
      },

      /** 选择商城商品分类 */
      handleSelectCategory(row, index, level) {
        if (level === 1) {
          this.activeCategoryName1 = row.name
          this.activeCategoryName2 = this.activeCategoryName3 = ''
          this.activeCategoryIndex1 = index
          this.activeCategoryIndex2 = -1
          this.activeCategoryIndex3 = -1
        } else if (level === 2) {
          this.activeCategoryName2 = row.name
          this.activeCategoryName3 = ''
          this.activeCategoryIndex2 = index
          this.activeCategoryIndex3 = -1
        } else {
          this.activeCategoryName3 = row.name
          this.activeCategoryIndex3 = index
        }
        if (this.baseInfoForm.category_id !== row.category_id) {
          this.baseInfoForm.category_id = row.category_id
          // 获取该商城分类下 商品参数信息
          // 传参数1 表示查询添加模式（发布商品模式0）下的商品参数信息；  如果不传 表示查询编辑（包括草稿箱编辑）模式下的商品参数信息
          this.GET_GoodsParams(1)
          // 设置当前商城分类ID
          this.GET_NextLevelCategory(row, level)
        }
      },

      /** 查询下一级 商城商品分类*/
      GET_NextLevelCategory(row, level, not_click = false) {
        this.loading = true
        const _id = row && row.category_id !== 0 ? row.category_id : 0
        API_goodsCategory.getGoodsCategoryLevelList(_id, {}).then(response => {
          this.loading = false
          if (level === 1) {
            this.categoryListLevel2 = response
            this.categoryListLevel3 = []
            if (this.baseInfoForm.category_ids && this.baseInfoForm.category_ids[1] && not_click) {
              const _res = response.map(key => key.category_id)
              const row = response.filter(key => key.category_id === this.baseInfoForm.category_ids[1])[0]
              this.activeCategoryName2 = row.name
              this.activeCategoryIndex2 = _res.indexOf(this.baseInfoForm.category_ids[1])
              this.GET_NextLevelCategory(row, 2, true)
            }
          } else if (level === 2) {
            this.categoryListLevel3 = response
            if (this.baseInfoForm.category_ids && this.baseInfoForm.category_ids[2] && not_click) {
              const _res = response.map(key => key.category_id)
              const row = response.filter(key => key.category_id === this.baseInfoForm.category_ids[2])[0]
              this.activeCategoryName3 = row.name
              this.activeCategoryIndex3 = _res.indexOf(this.baseInfoForm.category_ids[2])
            }
          } else if (!level) {
            this.categoryListLevel1 = response
            if (this.baseInfoForm.category_ids && this.baseInfoForm.category_ids[0] && not_click) {
              const _res = response.map(key => key.category_id)
              const row = response.filter(key => key.category_id === this.baseInfoForm.category_ids[0])[0]
              this.activeCategoryName1 = row.name
              this.activeCategoryIndex1 = _res.indexOf(this.baseInfoForm.category_ids[0])
              this.GET_NextLevelCategory(row, 1, true)
            }
          }
        })
      },

      /** 查询单个商品信息*/
      GET_GoodData() {
        if (this.isO2O) {
          API_O2O.getGoodData(this.activeGoodsId).then(goodsDataCallback).catch()
        } else {
          API_goods.getGoodData(this.activeGoodsId).then(goodsDataCallback).catch()
        }
        const _this = this
        async function goodsDataCallback(response) {
          /** 此处完成商品信息赋值 进行判断如果有值的话 */
          _this.baseInfoForm = {
            ...response
          }
          _this.baseInfoForm.goods_gallery_list = response.goods_gallery_list.filter(v => {
            return v.gallery_type !== 'SKU' && v.gallery_type !== 'SPEC'
          })
          /** 商品相册校验属性 */
          _this.baseInfoForm.goods_gallery_list.forEach(key => {
            _this.$set(key, 'url', key.original)
          })
          _this.baseInfoForm.goods_gallery = _this.baseInfoForm.goods_gallery_list.toString()
          _this.goodsGalleryList = JSON.parse(
            JSON.stringify(_this.baseInfoForm.goods_gallery_list)
          )
          /** 商品规格校验属性  */
          if (!_this.baseInfoForm.sku_list || !Array.isArray(_this.baseInfoForm.sku_list)) {
            _this.baseInfoForm.sku_list = []
          }
          if (_this.baseInfoForm.point_disable) {
            console.log('当前商品是积分商品')
            _this.isShowExchangeConfig = true
          } else {
            _this.isShowExchangeConfig = false
          }
          /** 查询品牌列表 */
          _this.getGoodsBrandList()
          /** 运费模板列表 */
          _this.getTplList()
          /** 查询商品参数 */
          _this.GET_GoodsParams()
        }
      },

      /** 查询商品参数 */
      GET_GoodsParams(next = null) {
        if (this.activeGoodsId && !next) {
          API_goods.getEditGoodsParams(this.baseInfoForm.category_id, this.activeGoodsId).then((response) => {
            this.loading = false
            this.goodsParams = response
            this.collapseVal = this.goodsParams.map(key => {
              if (key.group_id) {
                return key.group_id
              }
            })
            if (!response || response.length <= 0) {
              return
            }
            this.baseInfoForm.goods_params_list = []
            this.goodsParams.forEach(key => {
              if (key && key.params) {
                key.params.forEach(elem => {
                  this.baseInfoForm.goods_params_list.push(elem)
                })
              }
            })
          })
        } else {
          API_goods.getGoodsParams(this.baseInfoForm.category_id).then((response) => {
            this.loading = false
            this.goodsParams = response
            this.collapseVal = this.goodsParams.map(key => {
              if (key.group_id) {
                return key.group_id
              }
            })
            if (!response || response.length <= 0) {
              return
            }
            this.baseInfoForm.goods_params_list = []
            this.goodsParams.forEach(key => {
              if (key && key.params) {
                key.params.forEach(elem => {
                  this.baseInfoForm.goods_params_list.push(elem)
                })
              }
            })
          })
        }
      },

      /** 查询单个草稿箱商品信息 */
      GET_GoodDraftData() {
        API_goods.getGoodDraftData(this.activeGoodsId, {}).then(response => {
          /** 此处完成商品信息赋值 进行判断如果有值的话 */
          this.baseInfoForm = { ...response }
          if (this.baseInfoForm.point_disable) {
            this.isShowExchangeConfig = true
          } else {
            this.isShowExchangeConfig = false
          }
          /** 商品相册校验属性 */
          if (Array.isArray(response.gallery_list) && response.gallery_list.length) {
            this.baseInfoForm.goods_gallery_list = response.gallery_list.map(key => {
              return {
                img_id: -1,
                url: key,
                original: key,
                sort: 0
              }
            })
            this.baseInfoForm.goods_gallery = this.baseInfoForm.goods_gallery_list.toString()
          }
          if (!this.baseInfoForm.goods_gallery_list) this.baseInfoForm.goods_gallery_list = []
          this.goodsGalleryList = JSON.parse(JSON.stringify(this.baseInfoForm.goods_gallery_list))
          /** 商品规格校验属性  */
          if (!this.baseInfoForm.sku_list) {
            this.baseInfoForm.sku_list = []
          }
          /** 查询品牌列表 */
          this.getGoodsBrandList()

          /** 运费模板列表 */
          this.getTplList()

          /** 查询草稿箱商品参数信息 */
          this.GET_GoodsDtagtParams()
        })
      },

      /** 查询草稿箱商品参数信息 */
      GET_GoodsDtagtParams() {
        // 处理数据 方便校验
        const goods_id = this.activeGoodsId || 1
        API_goods.getGoodsDraftParams(goods_id).then(response => {
          this.loading = false
          if (!response || response.length <= 0) {
            return
          }
          this.goodsParams = response
          this.collapseVal = this.goodsParams.map(key => {
            if (key.group_id) {
              return key.group_id
            }
          })
          this.baseInfoForm.goods_params_list = []
          this.goodsParams.forEach(key => {
            if (key && key.params) {
              key.params.forEach(elem => {
                this.baseInfoForm.goods_params_list.push(elem)
              })
            }
          })
        })
      },

      /** 商品分组组件 改变时触发 */
      changeGoodsCateGory(val) {
        this.baseInfoForm.shop_cat_id = val[val.length - 1]
      },

      /** 查询商品品牌列表 */
      getGoodsBrandList() {
        API_goods.getGoodsBrandList(this.baseInfoForm.category_id).then(
          response => {
            this.brandList = response
          }
        )
      },

      /** 商品品牌 改变时触发 */
      changeGoodsBrand(val) {
        this.baseInfoForm.brand_id = ''
        this.baseInfoForm.brand_id = val
      },

      /** 运费模板列表 */
      getTplList() {
        API_goods.getTplList(this.activeGoodsId).then(response => {
          const tplList = response
          tplList.unshift({
            name: '包邮',
            id: '0',
            is_default: 1
          })
          tplList.map(item => {
            if (item.id === this.baseInfoForm.template_id || (!this.baseInfoForm.template_id && item.is_default)) {
              this.templateVal = JSON.stringify(item)
              this.selectTemplate = cloneObj(item)
              if (!this.baseInfoForm.template_id) {
                this.baseInfoForm.template_id = item.id
              }
            }
          })
          this.tplList = tplList
        })
      },

      /** 新建运费模板 */
      addTemplate() {
        this.MixinRouterPush('logisticsManage', { activeName: 'add' })
      },

      rowClass({ rowIndex }) {
        if (rowIndex === 0) {
          return { background: '#ededed' }
        }
      },

      /** 运费模板改变时触发 */
      changeTpl(val) {
        val = JSON.parse(val)
        this.selectTemplate = cloneObj(val)
        this.baseInfoForm.template_id = val.id
        this.baseInfoForm.free_freight = Number(val.id) ? 0 : 1 // 是否包邮
      },

      /** 积分兑换开关值改变时触发 */
      handleSwitchexchange(val) {
        this.isShowExchangeConfig = val
        if (!val) {
          this.baseInfoForm.exchange_point = ''
          this.baseInfoForm.point_disable = 0
        } else {
          this.baseInfoForm.point_disable = 1
        }
      },

      /** 素材选择器确认选择 */
      handleResourcePickerConfirm(items) {
        const resources = items.map(item => ({
          name: item.resource_name,
          url: item.resource_url,
          original: item.resource_url,
          img_id: -1
        }))
        if (this.resourcePickerType === 'image') {
          this.handlePictureChange(this.goodsGalleryList.concat(resources))
        } else {
          this.baseInfoForm.goods_video = resources[0].url
        }
      },

      /** 商品图片发生改变 */
      handlePictureChange(fileList) {
        this.goodsGalleryList = fileList
        this.baseInfoForm.goods_gallery = fileList
        this.baseInfoForm.goods_gallery_list = fileList
        this.$refs['baseInfoForm'].validateField('goods_gallery')
      },

      /** 移动端描述发生改变 */
      handleDescriptionChange(fileList) {
        this.baseInfoForm.intro_list = fileList
      },

      /** 构造表单数据 */
      generateFormData(data) {
        let _params = {
          ...data
        }
        // 删除不必要的表单数据
        delete _params.original
        delete _params.gallery_list
        delete _params.goods_gallery
        if (_params.goods_gallery_list) {
          _params.goods_gallery_list.forEach(key => {
            delete key.name
            delete key.big
            delete key.goods_id
            delete key.isdefault
            delete key.small
            delete key.status
            delete key.thumbnail
            delete key.tiny
            delete key.uid
            delete key.url
          })
        }
        /** 运费模板 */
        _params.template_id = _params.template_id || 0
        /** 积分商品数据 */
        if (!this.isShowExchangeConfig) {
          _params.exchange_point = ''
        }
        /** 处理带有标签的seo */
        if (_params.page_title) {
          _params.page_title = _params.page_title.replace(/<[^>]*>/g, '')
        }
        if (_params.meta_keywords) {
          _params.meta_keywords = _params.meta_keywords.replace(/<[^>]*>/g, '')
        }
        if (_params.meta_description) {
          _params.meta_description = _params.meta_description.replace(/<[^>]*>/g, '')
        }
        return _params
      },

      /** 视频上传效验 */
      // beforeUploadVideo(file) {
      //   const fileSize = file.size / 1024 / 1024 < 20
      //   if (['video/mp4', 'video/ogg', 'video/flv', 'video/avi', 'video/wmv', 'video/rmvb', 'video/mov'].indexOf(file.type) === -1) {
      //     this.$message.error('请上传正确的视频格式')
      //     return false
      //   }
      //   if (!fileSize) {
      //     this.$message.error('视频大小不能超过20MB')
      //     return false
      //   }
      // },

      /** 视频上传时进度条 */
      // uploadVideoProcess(event, file, fileList) {
      //   this.videoErrorTip = false
      //   this.videoFlag = true
      //   this.videoUploadPercent = file.percentage.toFixed(0) * 1
      // },

      /** 视频上传成功 */
      handleVideoSuccess(res, file) {
        this.videoFlag = false
        this.videoUploadPercent = 0
        this.baseInfoForm.goods_video = res.url
      },

      // /** 视频上传失败 */
      // handleVideoError() {
      //   this.videoErrorTip = true
      //   this.videoFlag = false
      //   this.videoUploadPercent = 0
      //   this.$message.error('上传失败!')
      // },

      /** 移除上传的商品视频 */
      handleRemoveGoodsVideo() {
        this.videoFlag = false
        this.baseInfoForm.goods_video = ''
      }
    }
  }

</script>

<style type="text/scss" lang="scss" scoped>
  .step-item {
    cursor: pointer;
  }
  .sell-form-item {
    ::v-deep .el-form-item {
      width: 1100px !important;
    }
    ::v-deep .sell-tip-btn {
      color: #9E9E9E;
      font-size: 16px;
    }
    ::v-deep .sell-tip-warning {
      color: #FFA70E;
    }
    ::v-deep .sell-tip-text {
      color: #666666;
      line-height: normal;
    }
    ::v-deep .table-view {
      display: flex;
    }
    ::v-deep .table-sell-setting {
      margin-right: 30px;

      .el-table__header {
        tr, th {
          background-color: #D9EEF8;
        }
      }
    }
    ::v-deep .table-sell-preview {
      // width: 300px !important;
      .el-table__header {
        tr, th {
          background-color: #FFF5EC;
        }
        th .cell {
          font-weight: bold;
          color: #7C470C;
        }
      }
      .cell {
        line-height: inherit;
        font-size: 14px;
      }
      em {
        font-style: normal;
        font-weight: bold;
        color: #333333;
      }
      .price-span {
        color: #FFA505;
      }
    }
    ::v-deep .sell-tb-cell {
      display: flex;
      align-items: center;
      span {
        flex-shrink: 0;
        margin-right: 10px;
      }
      .el-input__inner {
        text-align: center;
      }
      .el-input-group__append {
        padding: 0 10px;
      }
    }
    ::v-deep .batch-model-tip {
      padding-left: 120px;
      text-align: left;
      .batch-table-tip {
        margin: 0;
        padding: 0;
        font-size: 12px;
        text-align: left;
        span {
          color: red;
        }
      }
      .add-price-range {
        margin-top: 15px;
      }
      .batch-rule-tip {
        margin-top: 15px;
        color: #6B6B6B;
        font-size: 14px;
        p {
          line-height: normal;
          margin: 0;
          padding: 0;
        }
        em {
          color: #666666;
          font-style: normal;
          font-weight: bold;
        }
      }
    }
  }
  /*选择商品品类*/
  .content-goods-publish {
    padding: 15px;
    margin: 0 auto;
    text-align: center;
    border: 1px solid #ddd;
    background: none repeat 0 0 #fff;
    margin-bottom: 50px;

    /*商品品类*/
    .goods-category {
      text-align: left;
      padding: 10px;
      background: #fafafa;
      border: 1px solid #e6e6e6;
      ul {
        padding: 8px 4px 8px 8px;
        list-style: none;
        width: 300px;
        background: none repeat 0 0 #fff;
        border: 1px solid #e6e6e6;
        display: inline-block;
        letter-spacing: normal;
        margin-right: 15px;
        vertical-align: top;
        word-spacing: normal;
        li {
          line-height: 20px;
          padding: 5px;
          cursor: pointer;
          color: #333;
          font-size: 12px;
          display: flex;
          flex-wrap: nowrap;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }
      }
    }

    /** 当前品类被选中的样式 */
    .activeClass {
      background-color: #d9edf7;
      border: 1px solid #bce8f1;
      color: #3a87ad;
    }

    /*!*当前选择的商品品类文字*!*/
    .current-goods-category {
      text-align: left;
      padding: 10px;
      width: 100%;
      border: 1px solid #fbeed5;
      color: #c09853;
      background-color: #fcf8e3;
      margin: 10px auto;
      padding: 8px 35px 8px 14px;
      text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
      font-size: 12px;
      font-weight: bold;
    }
  }

  /*编辑基本信息*/
  .el-form {
    padding-bottom: 80px;
    .el-form-item {
      width: 100%;
      text-align: left;
    }
  }

  /*平铺*/
  div.base-info-item > div {
    margin-left: 5%;
  }
  div.base-info-item {
    .template-btn {
      color: #409EFF;
      margin-left: 20px;
      font-weight: 500;
      cursor: pointer;
    }
    .type-choose-box {
      display: flex;
      margin-bottom: 20px;
      // position: relative;
      .goods-type-item {
        width: 120px;
        height: 50px;
        line-height: 50px;
        border: 1px solid #DCDFE6;
        margin-right: 20px;
        font-size: 14px;
        color: #333;
        cursor: pointer;
        text-align: center;
      }
      .goods-type-item-sel {
        border-color: #409EFF !important;
        position: relative;
        &:before {
          content: '';
          position: absolute;
          right: 0;
          bottom: 0;
          border: 14px solid #409EFF;
          border-top-color: transparent;
          border-left-color: transparent;
        }
        &:after {
          content: '';
          width: 5px;
          height: 12px;
          position: absolute;
          right: 6px;
          bottom: 6px;
          border: 2px solid #fff;
          border-top-color: transparent;
          border-left-color: transparent;
          transform: rotate(45deg);
        }
      }
    }
    h4 {
      margin-bottom: 10px;
      padding: 0 10px;
      border: 1px solid #ddd;
      background-color: #f8f8f8;
      font-weight: bold;
      color: #333;
      font-size: 14px;
      line-height: 40px;
      text-align: left;
    }

    /** 审核信息-拒绝原因 */
    .auth-info {
      color: red;
    }

    .el-form-item {
      width: 30%;
      min-width: 300px;
    }
    .goods-name-width {
      width: 50%;
      min-width: 300px;
    }
    .el-form-item__content {
      margin-left: 120px;
      text-align: left;
    }
    p.goods-group-manager {
      // padding-left: 7.5%;
      text-align: left;
      color: #999;
      font-size: 13px;
    }

    /*teatarea*/
    .goods-publish-wrap ::v-deep .el-textarea {
      width: 150%;
    }
    .seo-text {
      width: 150%;
    }
  }

  /*折叠面板*/
  .el-collapse-item {
    ::v-deep .el-collapse-item__header {
      text-align: left;
      background-color: #f8f8f8;
      padding: 0 10px;
      font-weight: bold;
      color: #333;
      font-size: 14px;
    }
    .el-form-item {
      margin-left: 5%;
      width: 25%;
    }
    ::v-deep .el-form-item__content {
      margin-left: 130px;
      text-align: left;
    }
    p.goods-group-manager {
      padding-left: 12%;
      text-align: left;
      color: #999;
    }
    ::v-deep .el-collapse-item__content {
      padding: 10px 0;
      text-align: left;
    }
  }
  .goods-group-manager a {
    color: #7e7ef8;
    text-decoration: none;
    transition: color 0.3s, text-decoration 0.3s;
  }

  .goods-group-manager a:hover {
    color: red;
    text-decoration: underline;
  }
  /** 底部步骤 */
  .footer {
    width: 100%;
    padding: 10px;
    background-color: #ffc;
    position: fixed;
    bottom: 0;
    text-align: center;
    z-index: 2;
  }

  /*图片上传组件第一张图设置封面*/
  .goods-images {
    ::v-deep li.el-upload-list__item:first-child {
      position: relative;
    }
    ::v-deep li.el-upload-list__item:first-child:after {
      content: "封";
      color: #fff;
      font-weight: bold;
      font-size: 12px;
      position: absolute;
      left: -15px;
      top: -6px;
      width: 40px;
      height: 24px;
      padding-top: 6px;
      background: #13ce66;
      text-align: center;
      -webkit-transform: rotate(-45deg);
      transform: rotate(-45deg);
      -webkit-box-shadow: 0 0 1pc 1px rgba(0, 0, 0, 0.2);
      box-shadow: 0 0 1pc 1px rgba(0, 0, 0, 0.2);
    }
  }

  .avatar-uploader-icon {
    border: 1px dashed #d9d9d9;
    background-color: #fbfdff;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    font-size: 28px;
    color: #8c939d;
    width: 148px;
    height: 148px;
    line-height: 148px;
    text-align: center;
  }
  .avatar-uploader-icon:hover {
    border-color: #409eff;
  }
  .avatar {
    position: relative;
    width: 450px;
    height: 450px;
    .video-avatar {
      width: 450px;
      height: 450px;
      background: #000;
    }
    .close {
      position: absolute;
      right: 8px;
      top: 10px;
      font-size: 20px;
      color: #fff;
    }
  }
  .batch-point-tip {
    color: red;
    font-size: 12px;
    margin: 12px 0;
    line-height: normal;
  }
</style>
<style type="text/scss" lang="scss">
  .el-form-item__label {
    word-break: break-all;
  }
</style>
