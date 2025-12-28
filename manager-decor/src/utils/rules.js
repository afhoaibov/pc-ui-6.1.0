// email(邮箱)
export const email = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const isEmail = (_email) => email.test(_email);

// 手机号(mobile phone)中国(宽松), 只要是13,14,15,16,17,18,19开头即可
export const phone = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/;
export const isPhone = (_phone) => phone.test(_phone);

// 网址(url,支持端口和"?+参数"和"#+参数)
export const url = /^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
export const isUrl = (_url) => url.test(_url);
