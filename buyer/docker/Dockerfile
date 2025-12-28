FROM registry.cn-beijing.aliyuncs.com/shoptnt-k8s-images/nginx:alpine-v1
MAINTAINER shoptnt.cn

RUN mkdir -p /opt/pc/

COPY ./buyer/dist   /opt/pc
COPY ./buyer/docker/nginx.conf /etc/nginx/nginx.conf
