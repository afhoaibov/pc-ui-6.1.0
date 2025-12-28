<template>
  <div class="client">
    <en-table-layout :tableData="tableData.data" :loading="loading">
      <div slot="toolbar" class="inner-toolbar">
        <div class="toolbar-btns">
          <el-button size="mini" type="primary" icon="el-icon-circle-plus-outline" @click="handleAdd">添加</el-button>
        </div>
        <div class="toolbar-search">
          <en-table-search @search="searchEvent" placeholder="请输入三方平台名称" @advancedSearch="advancedSearchEvent"/>
        </div>
      </div>

      <template slot="table-columns">
        <el-table-column prop="name" label="三方平台名称" />
        <el-table-column prop="client_id" label="应用id" />
<!--        <el-table-column prop="status" label="状态" >-->
<!--          <template slot-scope="scope">-->
<!--            {{ scope.row.status === 0 ? '正常' : '禁用' }}-->
<!--          </template>-->
<!--        </el-table-column>-->
        <el-table-column label="创建时间">
          <template slot-scope="scope">{{ scope.row.create_time | unixToDate }}</template>
        </el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </template>

      <el-pagination v-if="tableData" slot="pagination" @size-change="handlePageSizeChange"
        @current-change="handlePageCurrentChange" :current-page="tableData.page_no" :page-sizes="[10, 20, 50, 100]"
        :page-size="tableData.page_size" layout="total, sizes, prev, pager, next, jumper" :total="tableData.data_total">
      </el-pagination>
    </en-table-layout>
    <el-dialog :title="editForm.id ? '编辑' : '添加'" :visible.sync="dialogVisible" width="800px"
      @open="handleDialogOpen" :modal-append-to-body="false" :close-on-click-modal="false" :close-on-press-escape="false">
      <el-form :model="editForm" :rules="formRules" ref="editForm" label-width="125px">
        <el-form-item label="三方平台名称" prop="name">
          <el-input v-model="editForm.name" :maxlength="20" placeholder="请输入三方平台名称"></el-input>
        </el-form-item>
        <el-form-item label="应用id" prop="client_id">
          <el-input v-model="editForm.client_id" placeholder="请输入应用id" :disabled="editForm.id">
            <template slot="append" v-if="!editForm.id">
              <el-button @click="randomClientId()">随机生成</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="应用密钥" prop="secret">
          <el-input v-model="editForm.secret" placeholder="请输入应用密钥">
            <template slot="append">
              <el-button @click="randomSecret()">随机生成</el-button>
            </template>
          </el-input>
        </el-form-item>
<!--        <el-form-item label="状态" prop="status">-->
<!--          <el-radio-group v-model="editForm.status">-->
<!--            <el-radio :label="0">正常</el-radio>-->
<!--            <el-radio :label="1">禁用</el-radio>-->
<!--          </el-radio-group>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="访问令牌时效(s)" prop="access_token_validity_seconds">-->
<!--          <el-input type="number" v-model="editForm.access_token_validity_seconds" placeholder="请输入访问令牌有效期（秒）"></el-input>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="刷新令牌时效(s)" prop="refresh_token_validity_seconds">-->
<!--          <el-input type="number" v-model="editForm.refresh_token_validity_seconds" placeholder="请输入刷新令牌有效期（秒）"></el-input>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="授权类型" prop="authorized_grant_types">-->
<!--          <el-select v-model="editForm.authorized_grant_types" placeholder="请选择授权类型" multiple style="width: 100%;">-->
<!--&lt;!&ndash;            <el-option label="密码模式" value="password"/>&ndash;&gt;-->
<!--&lt;!&ndash;            <el-option label="授权码模式" value="authorization_code"/>&ndash;&gt;-->
<!--&lt;!&ndash;            <el-option label="简化模式" value="implicit"/>&ndash;&gt;-->
<!--            <el-option label="客户端模式" value="client_credentials"/>-->
<!--&lt;!&ndash;            <el-option label="刷新模式" value="refresh_token"/>&ndash;&gt;-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="可重定向的uri" prop="redirect_uris" v-if="showRedirectUris()">-->
<!--          <el-input v-model="editForm.redirect_uris" placeholder="请输入可重定向的uri地址，多个地址逗号隔开"></el-input>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="授权范围" prop="scopes" v-if="showScopes()">-->
<!--          <el-input v-model="editForm.scopes" placeholder="请输入授权范围，多个授权逗号隔开"></el-input>-->
<!--        </el-form-item>-->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEditForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as API_oauth2 from '@/api/oauth2Client'
import GoodsGroupPicker from './GoodsGroupPicker.vue'
export default {
  name: 'oauth2Client',
  components: { GoodsGroupPicker },
  data() {
    return {
      // 列表loading状态
      loading: false,
      // 列表参数
      params: {
        page_no: 1,
        page_size: 10
      },
      // 列表数据
      tableData: '',
      // 添加/编辑表单
      editForm: {
        secret: '',
        brand_ids: [],
        category_ids: [],
        seller_ids: [],
        group_ids: [],
        oauth2_client: []
      },
      advancedForm: {

      },
      // 添加|编辑 表单规则
      formRules: {
        'name': [
          this.MixinRequired('三方平台名称必填！')
        ],
        'client_id': [
          this.MixinRequired('应用id必填！')
        ],
        'secret': [
          this.MixinRequired('应用密钥必填！')
        ],
        'status': [
          this.MixinRequired('状态必填！')
        ],
        'access_token_validity_seconds': [
          this.MixinRequired('访问令牌时效必填！')
        ],
        'refresh_token_validity_seconds': [
          this.MixinRequired('刷新令牌时效必填！')
        ],
        'authorized_grant_types': [
          this.MixinRequired('授权类型必填！')
        ],
        'redirect_uris': [
          this.MixinRequired('可重定向uri必填！')
        ]
      },
      // 是否显示 添加|编辑 表单
      dialogVisible: false,
      customProps: {
        multiple: true
      }
    }
  },
  mounted() {
    this.GET_List()
  },
  methods: {
    /** 高级搜索事件触发 */
    advancedSearchEvent() {
      this.params = {
        ...this.params,
        ...this.advancedForm
      }
      this.params.page_no = 1
      this.GET_List()
    },
    /** 分页大小发生改变 */
    handlePageSizeChange(size) {
      this.params.page_size = size
      this.GET_List()
    },

    /** 分页页数发生改变 */
    handlePageCurrentChange(page) {
      this.params.page_no = page
      this.GET_List()
    },

    /** 添加弹窗 */
    handleAdd() {
      this.editForm = {
        oauth2_client: {
          status: 0
        }
      }
      this.dialogVisible = true
    },

    /** 编辑弹窗 */
    handleEdit(row) {
      this.editForm = this.MixinClone(row)
      this.editForm.redirect_uris = this.editForm.redirect_uris ? this.editForm.redirect_uris.join(',') : ''
      this.editForm.scopes = this.editForm.scopes ? this.editForm.scopes.join(',') : ''
      this.dialogVisible = true
    },
    /** 删除 */
    handleDelete(id) {
      this.$confirm('确定要删除吗？', '提示', { type: 'warning' }).then(() => {
        API_oauth2.del(id).then(() => {
          this.$message.success('删除成功！')
          this.GET_List()
        })
      }).catch(() => { })
    },
    /** 分组管理 */
    handleShowGoodsGroup(row) {
      this.$router.push({ name: 'goodsGroup', query: { clientId: row.client_id }})
    },
    /** dialog打开后重置form表单校验结果 */
    handleDialogOpen() {
      setTimeout(() => { this.$refs['editForm'].clearValidate() })
    },

    /** 提交 添加|编辑 表单 */
    submitEditForm() {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          const { id } = this.editForm
          const data = this.MixinClone(this.editForm)
          if (data.redirect_uris) {
            data.redirect_uris = data.redirect_uris.split(',')
          }
          if (data.redirect_uris === '') {
            data.redirect_uris = []
          }
          if (data.scopes) {
            data.scopes = data.scopes.split(',')
          }
          if (data.scopes === '') {
            data.scopes = []
          }
          data.access_token_validity_seconds = 86400
          data.refresh_token_validity_seconds = data.access_token_validity_seconds
          data.authorized_grant_types = ['client_credentials']
          data.status = 0
          if (id) {
            API_oauth2.edit(id, data).then(response => {
              this.dialogVisible = false
              this.$message.success('修改成功！')
              this.GET_List()
            })
          } else {
            API_oauth2.add(data).then(() => {
              this.dialogVisible = false
              this.$message.success('添加成功！')
              this.GET_List()
            })
          }
        } else {
          return false
        }
      })
    },

    /** 搜索事件触发 */
    searchEvent(data) {
      this.params = {
        ...this.params,
        name: data
      }
      this.params.page_no = 1
      this.GET_List()
    },

    /** 查询分页列表 */
    GET_List() {
      this.loading = true
      API_oauth2.getList(this.params).then(response => {
        this.loading = false
        this.tableData = response
      }).catch(() => { this.loading = false })
    },

    /** 是否显示重定向地址 */
    showRedirectUris() {
      return this.editForm.authorized_grant_types &&
        this.editForm.authorized_grant_types.some((item) => item === 'authorization_code' || item === 'implicit')
    },

    /** 是否显示授权范围 */
    showScopes() {
      return this.editForm.authorized_grant_types &&
        this.editForm.authorized_grant_types.some((item) => item === 'password' || item === 'authorization_code' || item === 'implicit')
    },

    /** 随机生成应用id */
    randomClientId() {
      this.$set(this.editForm, 'client_id', this.generateRandom(10))
    },

    /** 随机生成密钥 */
    randomSecret() {
      this.$set(this.editForm, 'secret', this.generateRandom(30))
    },

    generateRandom(length) {
      const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
      let randomID = ''

      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length)
        randomID += characters.charAt(randomIndex)
      }

      return randomID
    },

    /** 品牌选择切换 */
    changeBrand(val) {
      this.editForm.brand_ids = val
    },
    changeShop(val) {
      this.editForm.seller_ids = val
    },
    /** 分类选择 */
    changeCategory(val) {
      this.editForm.category_ids = val.map(item => item[item.length - 1])
    },
    /** 分组选择 */
    changeGroup(val) {
      this.editForm.group_ids = val
    }

  }
}
</script>

<style type="text/scss" lang="scss" scoped>
.face-image {
  display: block;
  width: 50px;
  height: 50px;
  margin: 0 auto;
}

.birthday{
  width: 94%;
}

.client ::v-deep .el-dialog__body {
  padding: 10px 20px;
}
.type-choose-box {
  padding: 10px 20px;
  background: #f5f4f4;
  .choose-item {
    margin-bottom: 20px;
    .title {
      display: inline-block;
      width: 60px;
      color: #666;
    }
    ::v-deep .el-select, .el-input {
      width: 500px !important;
    }
  }
}
</style>
