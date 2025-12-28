# manager-decor
> 拖拽式装修管理

### 主要目录结构
- components/accessory: 附加组件
> 在预览区域右上角，可以放一些附加的按钮。以便做更多的配置。
- components/normal: 普通组件
> 一般是选择器之类的
- components/setting: 设置模块组件
> 这里放是是配置项的组件，例如：Input(输入框)、ColorPicker(颜色选择器)等等
- components/decor: 主要是放置装修组件
- components/decor/mobile: 移动端楼层组件
> 移动端装修请使用750px设计稿，在预览区域会自动转换成px单位，在移动端上UniApp也会自动适配。并且需要注意以下几点：
> > ```
> > 像素单位使用rpx
> > 内联样式有需要加上rpx单位的，不可用缩写形式。
> > 不可使用：:style="{margin: `0 ${$$FormData.margin_right}rpx 0 ${$$FormData.margin_left}rpx`}"
> > 推荐：:style="{marginLeft: $$FormData.margin_left + 'rpx', marginRight: $$FormData.margin_right + 'rpx'}"
> > ```
- components/decor/pc: PC端楼层组件
> ```[组件名]Preview.vue```: 预览组件<br/>
> ```[组件名]Setting.vue```: 在配置方式不能满足时，在这里完成更复杂的逻辑。<br/>
> ```index.js```: 装修组件的配置在这里完成，包括组件的标题、图标、配置项等等。具体可参考```src/components/decor/TitleText/index.js```。
> * name[String]: 组件名称，必须使用小写，多个单词用中划线连接
> * label[Object]: 组件左侧展示项配置
> >```
> >label.title[String]: 组件标题
> >label.icon[String|require(File)]: 组件图标文件
> >label.limit[Number]: 组件最大个数
> >```
> * decor_type[String]: 装修类型，不指定则默认支持seller和admin。
> * sort[Int]: 组件排序，必须设置。
> * data[Object]: 组件内的数据项，根据需要配置。
> * settings[Object]: 组件内的设置项，可以快速生成简单的表单。
> > ```
> > settings.type[SettingTypes]: 设置项类型
> > settings.label[String]: 设置项标题
> > settings.show[Function]: 是否显示设置项，接收一个函数，需要返回True或False，函数有data参数传入。
> > settings.options[Array[Option]]: 设置项选项
> > settings.component_name[String]: 如果设置项类型为custom，这里需要指定设置项组件名称
> > settings.props[Object]: 设置项组件props
> > settings.column[Boolean]: 配置项是否竖向排列
> > settings.space_line[Boolean]: 显示设置项底部分割线
> > ```
- utils 
>放置一些工具函数
- views
> 页面目录

### 一些约束
#### 装修组件
* 组件需要放置在```src/components/decor```目录下，且组件目录需要以大写开头驼峰式命名。
* 组件内必须要有```index.js```和```[组件名]Preview.vue```
* 如果有的配置复杂度比较高，使用配置方式无法完成，再创建```[组件名]Setting.vue```

### 装修模块使用

#### 移动端
由于移动端不支持webpack的自动引入功能，需要手动引入模块文件。按照以下步骤即可：

1. 将写好的模块[模块名]Preview.vue组件复制一份。
1. 粘贴到```UniApp/components/decor-modules/decor/[模块名]```目录下。
1. 在Preview组件中引入decor-mixin并注入到组件中。
1. 在```UniApp/components/decor-modules/decor-modules.vue```文件中引入新添加的模块组件，并使用。

#### PC端
在PC端，组件可以由webpack自动引入，所以只需复制模块文件到指定目录即可。具体步骤如下：

1. 复制[模块名]Preview.vue组件
1. 粘贴到```ui/buyer/components/Decors/[模块名]```目录下即可。
