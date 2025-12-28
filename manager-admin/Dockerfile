FROM nginx:alpine
MAINTAINER ShopTnt

RUN mkdir -p /app/
COPY ./manager-admin/dist /app/
COPY ./manager-admin/nginx.conf /etc/nginx/nginx.conf
COPY ./manager-admin/set-envs.sh /app/set-envs.sh

RUN ["chmod", "+x", "/app/set-envs.sh"]

EXPOSE 443 80

CMD sh -c "/app/set-envs.sh && exec nginx -g 'daemon off;'"

