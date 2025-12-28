<template>
  <div class="content-goods-publish">
    <el-form
      :model="activityForm"
      status-icon
      label-position="right"
      ref="activityForm"
      label-width="120px"
      :disabled="true"
      class="demo-ruleForm">
      <el-form-item  label="活动名称：" prop="promotion_name">
        <el-input
          v-model="activityForm.promotion_name"
          @change="activityForm.promotion_name  = activityForm.promotion_name.trim()"
          placeholder="不超过20个字符"
          maxLength="20"
        ></el-input>
      </el-form-item>
      <el-form-item  label="活动标题：" prop="promotion_title">
        <el-input
          v-model="activityForm.promotion_title"
          @change="activityForm.promotion_title  = activityForm.promotion_title.trim()"
          placeholder="不超过5个字符"
          maxLength="5"
        ></el-input>
      </el-form-item>
      <el-form-item label="生效时间：" prop="take_effect_time">
        <el-date-picker
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
      <el-form-item label="参团人数：" prop="required_num">
        <el-input
          v-model="activityForm.required_num"
          @change="activityForm.required_num = activityForm.required_num.trim()"
          placeholder="不超过3个字符"
          maxLength="3"
        >
          <template slot="append">人</template>
        </el-input>
      </el-form-item>
      <el-form-item label="成团时限：" prop="limit_time">
        <el-input
          v-model="activityForm.limit_time"
          @change="activityForm.limit_time = activityForm.limit_time.trim()"
          placeholder="不超过3个字符"
          maxLength="3"
        >
          <template slot="append">小时</template>
        </el-input>
      </el-form-item>
      <el-form-item label="虚拟成团：">
        <el-switch
          v-model="activityForm.enable_mocker"
          active-color="#13ce66"
          inactive-color="#ff4949"
          active-text="开启"
          inactive-text="关闭"
        />
        <p class="tip">开启虚拟成团后，活动成团时限到期时人数未满的团，系统将会模拟匿名买家凑满人数，使该团成团，开启以提高成团率</p>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
  import * as API_activity from '@/api/activity'

  export default {
    name: 'AssemblePreview',
    props: {
      promotionId: {
        type: String
      }
    },
    data() {
      return {
        activityForm: {}
      }
    },

    watch: {
      promotionId: {
        handler(val) {
          if (val) {
            this.GET_AssembleActivity()
          }
        },
        immediate: true
      }
    },
    mounted() {
    },
    methods: {
      /** 查询单个活动信息 */
      GET_AssembleActivity() {
        API_activity.getAssembleActivity(this.promotionId).then(response => {
          this.activityForm = {
            ...response,
            take_effect_time: [parseInt(response.start_time) * 1000, parseInt(response.end_time) * 1000],
            enable_mocker: response.enable_mocker === 1
          }
        })
      }
    }
  }
</script>
<style scoped lang="scss">
.content-goods-publish {
  ::v-deep div.toolbar {
    height: 70px;
    padding: 20px 0;
  }
  ::v-deep .el-input {
    max-width: 400px;
  }
  ::v-deep .el-textarea__inner {
    max-width: 500px;
  }
}

.content-goods-publish {
  padding: 15px;
  margin: 0 auto;
  text-align: center;
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
  p.tip {
    font-size: 14px;
    color: #ccc;
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

</style>
