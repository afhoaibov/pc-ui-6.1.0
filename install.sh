#! /bin/bash

WEB_PATH=$PWD
cd $WEB_PATH

echo "开始安装买家PC端依赖(buyer-pc)..."
cd $WEB_PATH/buyer
yarn --registry=https://registry.npmmirror.com
echo -e "\033[32m买家PC端依赖安装完成...\033[0m"

echo "开始安装商家中心依赖(manager-seller)..."
cd $WEB_PATH/manager-seller
yarn --registry=https://registry.npmmirror.com
echo -e "\033[32m商家中心依赖安装完成...\033[0m"

echo "开始安装后台管理依赖(manager-admin)..."
cd $WEB_PATH/manager-admin
yarn --registry=https://registry.npmmirror.com
echo -e "\033[32m后台管理依赖安装完成...\033[0m"

echo "开始安装装修中心依赖(manager-decor)..."
cd $WEB_PATH/manager-decor
yarn --registry=https://registry.npmmirror.com
echo -e "\033[32m装修中心依赖安装完成...\033[0m"


