<template>
	<el-tooltip 
		v-model="showTooltip"
		effect="light" 
		placement="top"
		:hide-after="2000"
		manual
		popper-class="tooltip-popper">
		<div 
			class="content-text"
			slot="content">{{ content }}</div>
		<span
			class="clipboard"
			v-clipboard:copy="text"
			v-clipboard:success="onSuccess"
			@mouseenter="handleMouseenter()"
			@mouseleave="handleMouseleave">
			<span v-if="!buttonCopy">{{text}}</span>
			<i 
			v-if="!copySuccess" class="el-icon-s-order"></i>
			<i v-else class="el-icon-check"></i>
		</span>
	</el-tooltip>
</template>

<script>

export default {
  name: 'Clipboard',
  props: {
    text: {
      type: String
    },
		buttonCopy: {
      type: Boolean
    },
  },
  data() {
    return {
      copySuccess: false,
			content: '点击复制',
			showTooltip: false
    }
  },
	beforeDestroy() {
		this.handleMouseleave()
	},
  methods: {
		handleMouseenter() {
			this.showTooltip = true
			this.content = '点击复制'
    },
    handleMouseleave() {
      this.showTooltip = false
			this.copySuccess = false
    },
    onSuccess() {
      this.copySuccess = true
			this.content = '已复制'
    }

  }
}
</script>

<style lang="scss">
.tooltip-popper {
	background: white !important;  
	font-size: 12px !important;
	color: #333 !important;
	background: white !important;  
	box-shadow: 1px 1px 10px 3px #D3D3D6;
	border: none !important;
}
.tooltip-popper[x-placement^="top"] .popper__arrow {   
	border-top-color: white!important;
}
// 箭头
.tooltip-popper[x-placement^="top"] .popper__arrow:after {  
	border-top-color: white !important;
}

</style>

<style lang="scss" scoped>

.clipboard {
  cursor: pointer;
  color: #666;
  font-size: 13px;
  &:hover {
		.el-icon-s-order {
			color: #409EFF !important;
		}
    color: #409EFF !important;
  }
	.el-icon-s-order {
		color: #888;
	}
	.el-icon-s-order, .el-icon-check {
		font-size: 15px;
	}
}
</style>
