FROM nginx:alpine
MAINTAINER ShopTnt

RUN mkdir -p /app/
COPY ./manager-decor/dist /app/
COPY ./manager-decor/nginx.conf /etc/nginx/nginx.conf
COPY ./manager-decor/set-envs.sh /app/set-envs.sh

RUN ["chmod", "+x", "/app/set-envs.sh"]

EXPOSE 443 80

CMD sh -c "/app/set-envs.sh && exec nginx -g 'daemon off;'"

