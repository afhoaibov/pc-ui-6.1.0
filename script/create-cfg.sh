#!/bin/bash
#创建所需目录
base_dir=.
WEB_PATH=/opt/server/ui
SCRIPT_PATH=$WEB_PATH/script

#配置文件模板
if [[ "$1" == "ssl" ]];then
	nginx_conf=`cat $SCRIPT_PATH/nginx-ssl.conf`
	#--传输协议--#
	PROTOCOL='https'
else
	nginx_conf=`cat $SCRIPT_PATH/nginx.conf`
	PROTOCOL='http'
fi

domain_js=`cat $SCRIPT_PATH/domain.js`
api_js=`cat $SCRIPT_PATH/api.js`


#---------网关域名端口号配置----------#
# 配置为UI-PC服务所需要的域名，如果没有域名网址，填写UI服务器IP
BUYER_PC_DOMAIN='pc.domainName.com'
#服务端口，http://域名 的端口为80，https://域名 的端口为443, http://服务器IP 地址默认的端口是3010（可随意更换，只需要端口不占用就可以）
BUYER_PC_PORT='443'

# 配置为UI-WAP服务所需要的域名，如果没有域名网址，填写UI服务器IP
BUYER_WAP_DOMAIN='m.domainName.com'
#服务端口，http://域名 的端口为80，https://域名 的端口为443, http://服务器IP 地址默认的端口是3001（可随意更换，只需要端口不占用就可以）
BUYER_WAP_PORT='443'

# 配置为UI-manager-seller 服务所需要的域名，如果没有域名网址，填写UI服务器IP
SELLER_DOMAIN='seller.domainName.com'
#服务端口，http://域名 的端口为80，https://域名 的端口为443, http://服务器IP 地址默认的端口是3002（可随意更换，只需要端口不占用就可以）
SELLER_PORT='443'

# 配置为UI-manager-admin服务所需要的域名，如果没有域名网址，填写UI服务器IP
ADMIN_DOMAIN='admin.domainName.com'
#服务端口，http://域名 的端口为80，https://域名 的端口为443, http://服务器IP 地址默认的端口是3003（可随意更换，只需要端口不占用就可以）
ADMIN_PORT='443'

# 配置为UI-楼层装修服务所需要的域名，如果没有域名网址，填写UI服务器IP
DECOR_DOMAIN='decor.domainName.com'
#服务端口，http://域名 的端口为80，https://域名 的端口为443, http://服务器IP 地址默认的端口是3004（可随意更换，只需要端口不占用就可以）
DECOR_PORT='443'



#---------API域名端口号配置----------#
# 配置为API-base-api服务所需要的域名，如果没有域名网址，填写UI服务器IP
BASE_API_DOMAIN='api-base.domainName.com'
#服务端口，http://域名 的端口为80，https://域名 的端口为443, http://服务器IP 地址默认的端口是7000（可随意更换，只需要端口不占用就可以）
BASE_API_PORT='443';

# 配置为API-buyer-api服务所需要的域名，如果没有域名网址，填写UI服务器IP
BUYER_API_DOMAIN='api-buyer.domainName.com'
#服务端口，http://域名 的端口为80，https://域名 的端口为443, http://服务器IP 地址默认的端口是7002（可随意更换，只需要端口不占用就可以）
BUYER_API_PORT='443'

# 配置为API-buyer-api服务所需要的域名，如果没有域名网址，填写UI服务器IP
SELLER_API_DOMAIN='api-seller.domainName.com'
#服务端口，http://域名 的端口为80，https://域名 的端口为443, http://服务器IP 地址默认的端口是7003（可随意更换，只需要端口不占用就可以）
SELLER_API_PORT='443'

# 配置为API-buyer-api服务所需要的域名，如果没有域名网址，填写UI服务器IP
ADMIN_API_DOMAIN='api-admin.domainName.com'
#服务端口，http://域名 的端口为80，https://域名 的端口为443, http://服务器IP 地址默认的端口是7004（可随意更换，只需要端口不占用就可以）
ADMIN_API_PORT='443'


#---------服务地址配置----------#
#填写API服务器的内网ip，端口默认7000，不可随意更换，如需更换，需要改动API代码
BASE_API_SERVICE='192.168.2.103:7000'
#填写API服务器的内网ip，端口默认7002，不可随意更换，如需更换，需要改动API代码
BUYER_API_SERVICE='192.168.2.103:7002'
#填写API服务器的内网ip，端口默认7003，不可随意更换，如需更换，需要改动API代码
SELLER_API_SERVICE='192.168.2.103:7003'
#填写API服务器的内网ip，端口默认7004，不可随意更换，如需更换，需要改动API代码
ADMIN_API_SERVICE='192.168.2.103:7004'

#---------ssl证书位置,非ssl不用动----------#
CRT_POSITION='/opt/ssl/nginx.crt'
KEY_POSITION='/opt/ssl/nginx.key'

#---------以下是生成的脚本，不要动----------#
buyer_pc_str="BUYER_PC_DOMAIN=${BUYER_PC_DOMAIN}\nBUYER_PC_PORT=${BUYER_PC_PORT}\n"
buyer_wap_str="BUYER_WAP_DOMAIN=${BUYER_WAP_DOMAIN}\nBUYER_WAP_PORT=${BUYER_WAP_PORT}\n"
seller_str="SELLER_DOMAIN=${SELLER_DOMAIN}\nSELLER_PORT=${SELLER_PORT}\n"
admin_str="ADMIN_DOMAIN=${ADMIN_DOMAIN}\nADMIN_PORT=${ADMIN_PORT}\n"
decor_str="DECOR_DOMAIN=${DECOR_DOMAIN}\nDECOR_PORT=${DECOR_PORT}\n"


base_api_str="BASE_API_DOMAIN=${BASE_API_DOMAIN}\nBASE_API_SERVICE=${BASE_API_SERVICE}\nBASE_API_PORT=${BASE_API_PORT}\n"
buyer_api_str="BUYER_API_DOMAIN=${BUYER_API_DOMAIN}\nBUYER_API_SERVICE=${BUYER_API_SERVICE}\nBUYER_API_PORT=${BUYER_API_PORT}\n"
seller_api_str="SELLER_API_DOMAIN=${SELLER_API_DOMAIN}\nSELLER_API_SERVICE=${SELLER_API_SERVICE}\nSELLER_API_PORT=${SELLER_API_PORT}\n"
admin_api_str="ADMIN_API_DOMAIN=${ADMIN_API_DOMAIN}\nADMIN_API_SERVICE=${ADMIN_API_SERVICE}\nADMIN_API_PORT=${ADMIN_API_PORT}\n"

ssl_position_str="CRT_POSITION=${CRT_POSITION}\nKEY_POSITION=${KEY_POSITION}\n"

protocol="PROTOCOL=${PROTOCOL}\n"

cd $WEB_PATH
git pull

#echo  $base_str"cat << EOF\n$template\nEOF" 
printf  "${ssl_position_str}${protocol}${buyer_pc_str}${buyer_wap_str}${seller_str}${admin_str}${decor_str}${base_api_str}${buyer_api_str}${seller_api_str}${admin_api_str}cat << EOF\n$nginx_conf\nEOF" | bash > /usr/local/nginx/conf/nginx.conf
printf  "${protocol}${buyer_pc_str}${buyer_wap_str}${seller_str}${admin_str}${decor_str}${base_api_str}${buyer_api_str}${seller_api_str}${admin_api_str}cat << EOF\n$domain_js\nEOF" | bash > $WEB_PATH/ui-domain/domain.js
printf  "${protocol}${buyer_pc_str}${buyer_wap_str}${seller_str}${admin_str}${decor_str}${base_api_str}${buyer_api_str}${seller_api_str}${admin_api_str}cat << EOF\n$api_js\nEOF" | bash > $WEB_PATH/ui-domain/api.js