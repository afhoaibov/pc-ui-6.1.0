<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    append-to-body
    width="805px"
    class="image-picker-dialog"
  >
    <div slot="title" class="image-picker-title">图片上传</div>
    <div class="image-picker-body">
      <div v-show="curEdit" class="upload-box edit">
        <div class="el-upload-dragger">
          <div class="opt-body">
            <div class="inner-opt">
              <div v-for="(opt, index) in curEdit.operation" class="item-opt">
                <div v-if="opt.type === 'select'" class="input-with-select el-input el-input--small el-input-group el-input-group--prepend">
                  <div class="el-input-group__prepend">{{ opt.label }}</div>
                  <el-select v-model="opt.value" size="small" slot="append" placeholder="请选择">
                    <el-option v-for="op in opt.options" :label="op.text" :value="op.value" :key="op.text"></el-option>
                  </el-select>
                </div>
                <el-input v-else placeholder="请输入内容" v-model="opt.value" size="small" class="input-with-select">
                  <template slot="prepend">{{ opt.label }}</template>
                </el-input>
              </div>
              <div slot="tips" class="el-upload__tip" v-if="showTips">注：移动端跳转链接仅支持一级目录，例：/assemble</div>
			        <div slot="tips" class="el-upload__tip" v-if="showGoodTips">注：请输入商品id，例：127</div>
			        <div slot="tips" class="el-upload__tip" v-if="showShopTips">注：请输入店铺id，例：1</div>
			        <div slot="tips" class="el-upload__tip" v-if="showCatTips">注：请输入分类id，例：494</div>
            </div>
          </div>
          <div class="opt-footer">
            <el-button type="primary" size="small" @click="handleSaveEdit">保存</el-button>
            <el-button size="small" @click="curEdit = ''">取消</el-button>
          </div>
        </div>
      </div>
      <el-upload
        ref="elUpload"
        class="upload-box"
        :class="[type === 'seller' ? 'upload-box-seller' : '']"
        drag
        :limit="limit"
        :multiple="multiple"
        :show-file-list="true"
        list-type="picture-card"
        :on-success="onSuccess"
        :on-remove="onRemove"
        :on-preview="handleEditItem"
        :action="MixinUploadApi"
        :headers="MixinAccessToken"
        :on-exceed="() => { $message.error('文件数量超过限制！') }"
        :file-list="fileList"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
    </div>
    <div slot="footer" class="image-picker-footer">
      <div class="upload-status-num">
        最多可上传个数：<span>{{ limit }}</span>
        已上传个数：<span>{{ nums.successUpload }}</span>
        还可上传个数：<span>{{ nums.canUpload }}</span>
      </div>
      <span>
        <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
      </span>
    </div>
  </el-dialog>
</template>

<script>
  // Andste_TODO 2018/6/16: 图片选择组件需要重构
  const bigInt = require('big-integer')
  export default {
    name: 'EnImagePicker',
    props: {
      /** 显示dialog */
      show: {
        type: Boolean,
        default: false
      },
      /** 类型 */
      type: {
        type: String,
        default: 'admin'
      },
      /** 最大可上传个数 */
      limit: {
        type: Number,
        default: 10
      },
      /** 是否可多选 */
      multiple: {
        type: Boolean,
        default: false
      },
      /** 默认数据 */
      defaultData: {
        default: function () {
          return []
        }
      },
      /** 自定义参数 */
      operation: {
        type: Array,
        default: function () {
          return [{
            label: '操作类型',
            name: 'opt_type',
            type: 'select',
            options: [
              { text: '无操作', value: 'NONE' },
              { text: '链接地址', value: 'URL' },
              { text: '关键字', value: 'KEYWORD' },
              { text: '商品序号', value: 'GOODS' },
              { text: '店铺编号', value: 'SHOP' },
              { text: '商品分类', value: 'CATEGORY' }
            ],
            value: 'NONE'
          }, {
            label: '链接值',
            name: 'opt_value'
          }]
        }
      }
    },
    computed: {
      showTips: function () {
        if (!this.curEdit || typeof this.curEdit === 'string') {
          return false
        }
        return this.curEdit.operation.filter(function (item) {
          return item.type === 'select'
        }).every(function (opt) {
          return opt.value === 'URL'
        })
      },
      showGoodTips: function () {
        if (!this.curEdit || typeof this.curEdit === 'string') {
          return false
        }
        return this.curEdit.operation.filter(function (item) {
          return item.type === 'select'
        }).every(function (opt) {
          return opt.value === 'GOODS'
        })
      },
      showShopTips: function () {
        if (!this.curEdit || typeof this.curEdit === 'string') {
          return false
        }
        return this.curEdit.operation.filter(function (item) {
          return item.type === 'select'
        }).every(function (opt) {
          return opt.value === 'SHOP'
        })
      },
      showCatTips: function () {
        if (!this.curEdit || typeof this.curEdit === 'string') {
          return false
        }
        return this.curEdit.operation.filter(function (item) {
          return item.type === 'select'
        }).every(function (opt) {
          return opt.value === 'CATEGORY'
        })
      }
    },
    data: function () {
      return {
        dialogVisible: this.show,
        fileList: [],
        dataMap: new Map(),
        curEdit: '',
        nums: {
          successUpload: 0,
          canUpload: 0
        }
      }
    },
    watch: {
      show: function (newVal) {
        this.dialogVisible = newVal
        if (newVal === false) {
          this.curEdit = ''
          this.fileList = []
          this.dataMap = new Map()
          this.countNums()
        }
      },
      dialogVisible: function (newVal) {
        newVal === false && this.$emit('close')
      },
      defaultData: function (newVal) {
        if (!newVal) return
        this.fileList = JSON.parse(JSON.stringify(newVal))
        let _this = this
        setTimeout(function () {
          _this.fileList.forEach(function (item) {
            _this.onSuccess({ url: item.url }, {
              uid: item.uid,
              url: item.url
            })
          })
        })
      }
    },
    methods: {
      /** 编辑自定义参数 */
      handleEditItem: function (file) {
        let uid = file.uid
        let curData = JSON.parse(JSON.stringify(this.dataMap.get(uid)))
        let deTarget = this.fileList.filter(function (item) {
          return item.uid === uid
        })[0]
        if (deTarget && deTarget.opt) {
          curData.operation.forEach(function (opt) {
            opt.value = deTarget.opt[opt.name]
          })
        }
        this.curEdit = curData
      },
      /** 图片上传成功 */
      onSuccess: function (response, file, fileList) {
        let obj = {
          response: response,
          uid: file.uid,
          blob: file.url,
          operation: JSON.parse(JSON.stringify(this.operation))
        }
        this.dataMap.set(file.uid, obj)
        this.countNums()
      },
      /** 移除时触发 */
      onRemove: function (file, fileList) {
        if (this.curEdit) {
          this.curEdit.operation[0].value = 'NONE'
          this.curEdit.operation[1].value = ''
        }
        this.dataMap.delete(file.uid)
        this.curEdit = ''
        this.countNums()
      },
      /** 保存自定义参数 */
      handleSaveEdit: function () {
        let val = '9223372036854775807' //long最大值
        if (this.curEdit.operation[0].value === 'URL') {
          if (!/^\/[^\/\\].+/g.exec(this.curEdit.operation[1].value)) {
            return this.$message.error('链接值只能以 / 开头！')
          }
        } else if (this.curEdit.operation[0].value === 'GOODS' || this.curEdit.operation[0].value === 'SHOP' || this.curEdit.operation[0].value === 'CATEGORY') {
          if (!/^[1-9]\d*$/.exec(this.curEdit.operation[1].value)) {
            return this.$message.error('请输入正整数')
          } else if (bigInt(this.curEdit.operation[1].value).greater(val)) {
            return this.$message.error('id值超过上限')
          }
        }
        this.dataMap.set(this.curEdit.uid, this.curEdit)
        this.curEdit = ''
      },
      /** 确认 */
      handleConfirm: function () {
        let list = []
        this.dataMap.forEach(function(value, key) {
          let opt = {}
          value.operation.forEach(function (item) {
            opt[item.name] = item.value
          })
          list.push({
            uid: key,
            blob: value.blob,
            response: value.response,
            operation: opt
          })
        })
        this.$emit('confirm', list)
        this.$emit('close')
        this.$refs['elUpload'].clearFiles()
        this.dataMap = new Map()
      },
      countNums: function () {
        this.nums = {
          successUpload: this.dataMap.size,
          canUpload: this.limit - this.dataMap.size
        }
      }
    }
  }
</script>

<style type="text/scss" lang="scss" scoped>
  $border-style: 1px solid #ccc;
  .image-picker-title {
    text-align: center;
    padding-bottom: 20px;
    border-bottom: $border-style;
  }
  .image-picker-body {
    display: flex;
    position: relative;
    flex-direction: column;
    margin-bottom: 10px;
  }
  .image-picker-dialog {
    ::v-deep .el-dialog__body {
      padding: 0 20px;
    }
    ::v-deep .upload-box {
      display: flex;
      flex-direction: column-reverse;
      align-self: center;
      &:hover .inner-opt { border-color: #409EFF }
      &.edit .el-upload-dragger {
        position: absolute;
        top: 0;
        left: 50%;
        z-index: 99;
        margin-left: -300px;
        cursor: auto;
        text-align: left;
      }
      .el-icon-zoom-in:before { content: '\E764' }
    }
    ::v-deep .upload-box-seller {
      .el-icon-zoom-in:before { content: '\E616' }
    }
    ::v-deep .el-upload-list{
      display: block;
      max-height: 200px;
      min-width: 765px;
      min-height: 180px;
      overflow-y: scroll;
      border: 1px solid #d9d9d9;
      padding: 10px 0 10px 10px;
      &:hover { border-color: #409EFF }
    }
    ::v-deep .el-upload {
      width: auto;
      height: auto;
      line-height: normal;
      border: none;
      align-self: center;
      margin-bottom: 10px;
    }
    ::v-deep .el-upload-dragger {
      width: 600px;
    }
    ::v-deep .el-upload-list__item {
      width: 142px;
      height: 142px;
    }
    ::v-deep .opt-body {
      height: 130px;
      margin: 10px 10px 0 10px;
    }
    ::v-deep .inner-opt {
      width: 100%;
      height: 100%;
      border-bottom: 1px dashed #d9d9d9;
      overflow-y: auto;
    }
    ::v-deep .item-opt {
      display: inline-block;
      position: relative;
      width: 284px;
      font-size: 12px;
      margin-bottom: 10px;
      &:nth-child(2n) { margin-left: 10px }
      .el-input-group--prepend .el-select .el-input.is-focus .el-input__inner {
        border-color: #409EFF
      }
    }
    ::v-deep .opt-footer {
      height: 40px;
      text-align: center;
      .el-button {
        width: 78px;
        height: 28px;
        line-height: 28px;
        padding: 0;
        margin-top: 5px;
      }
    }
  }
  .image-picker-body {
    min-height: 350px;
  }
  .upload-status-num {
    font-size: 14px;
    span {
      color: red;
      margin-right: 10px;
    }
  }
  .image-picker-footer {
    display: flex;
    justify-content: space-between;
    padding-top: 15px;
    border-top: $border-style;
  }
</style>
