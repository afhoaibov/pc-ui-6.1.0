#! /bin/bash

WEB_PATH=$PWD
cd $WEB_PATH
git pull
# 更新git代码
if [[ "$1" == "git-pull" ]];then
  echo "拉取最新的代码..."
  git reset --hard origin/feature_7.2.3
  git clean -f
  git pull origin feature_7.2.3
  git pull
  echo -e "\033[32m代码拉取完成...\033[0m"
fi

# 部署nodejs、nginx、yarn
if [[ "$1" == "base" ]];then
  # 移除yum lock
  rm -f /var/run/yum.pid

  # 关闭防火墙
  # systemctl stop firewalld
  # systemctl disable firewalld

  # 安装nodejs
  cd /usr/local/
  wget https://cdn.npmmirror.com/binaries/node/latest-v14.x/node-v14.21.3-linux-x64.tar.gz
  tar -zxvf node-v14.21.3-linux-x64.tar.gz
  rm -rf node-v14.21.3-linux-x64.tar.gz
  mv node-v14.21.3-linux-x64 node
  echo 'export NODE_HOME=/usr/local/node
export PATH=$NODE_HOME/bin:$PATH'>>/etc/profile
  source /etc/profile

  # 安装yarn
  npm install yarn -g --registry=https://registry.npmmirror.com

  # nginx安装
  yum install -y gcc gcc-c++
  yum install -y pcre pcre-devel
  yum install -y zlib zlib-devel
  yum install -y openssl openssl-devel

  cd /usr/local
  wget https://nginx.org/download/nginx-1.14.0.tar.gz
  tar -zxvf nginx-1.14.0.tar.gz
  cd nginx-1.14.0
  ./configure --prefix=/usr/local/nginx --with-http_stub_status_module --with-http_ssl_module
  make && make install
  cd ..
  rm -rf nginx-1.14.0.tar.gz
  rm -rf nginx-1.14.0
fi

if [[ ! -n "$1" || "$1" == "manager-admin" || "$1" == "uni" || "$1" == "test" ]];then
  echo "开始部署后台管理(manager-admin)..."
  cd $WEB_PATH/manager-admin
  rm -rf dist
  rm -rf node_modules yarn.lock
  echo "开始安装项目依赖..."
  yarn --registry=https://registry.npmmirror.com
  echo "开始打包..."
  if [[ "$1" == "test" || "$2" == "test" ]];then
    yarn run build:test
  else
    yarn run build:prod
  fi
  rm -rf www
  mv dist www
  echo -e "\033[32m后台管理部署完成...\033[0m"
fi

if [[ ! -n "$1" || "$1" == "manager-seller" || "$1" == "uni" || "$1" == "test" ]];then
  echo "开始部署商家中心(manager-seller)..."
  cd $WEB_PATH/manager-seller
  rm -rf dist
  rm -rf node_modules yarn.lock
  echo "开始安装项目依赖..."
  yarn --registry=https://registry.npmmirror.com
  echo "开始打包..."
  if [[ "$1" == "test" || "$2" == "test" ]];then
    yarn run build:test
  else
    yarn run build:prod
  fi
  rm -rf www
  mv dist www
  echo -e "\033[32m商家中心部署完成...\033[0m"
fi

if [[ ! -n "$1" || "$1" == "manager-decor" || "$1" == "uni" || "$1" == "test" ]];then
  echo "开始部署装修中心(manager-decor)..."
  cd $WEB_PATH/manager-decor
  rm -rf dist
  rm -rf node_modules yarn.lock
  echo "开始安装项目依赖..."
  yarn --registry=https://registry.npmmirror.com
  echo "开始打包..."
  if [[ "$1" == "test" || "$2" == "test" ]];then
    yarn run build:test
  else
    yarn run build:prod
  fi
  rm -rf www
  mv dist www
  echo -e "\033[32m装修中心部署完成...\033[0m"
fi

if [[ ! -n "$1" || "$1" == "buyer-pc" || "$1" == "uni" || "$1" == "test" ]];then
  echo "开始部署买家PC端(buyer-pc)..."
  cd $WEB_PATH/buyer
  rm -rf dist
  rm -rf node_modules yarn.lock
  echo "开始安装项目依赖..."
  yarn --registry=https://registry.npmmirror.com
  echo "开始打包..."
  if [[ "$1" == "test" || "$2" == "test" ]];then
    yarn run build:test
  else
    yarn run build:prod
  fi
  rm -rf www
  mv dist www
  echo -e "\033[32m买家PC端部署完成...\033[0m"
fi


