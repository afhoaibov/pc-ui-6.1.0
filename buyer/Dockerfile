FROM nginx:alpine
MAINTAINER ShopTnt

RUN mkdir -p /app/
COPY ./buyer/dist /app/
COPY ./buyer/nginx.conf /etc/nginx/nginx.conf
COPY ./buyer/set-envs.sh /app/set-envs.sh

RUN ["chmod", "+x", "/app/set-envs.sh"]

EXPOSE 443 80

CMD sh -c "/app/set-envs.sh && exec nginx -g 'daemon off;'"

