FROM nginx:alpine
MAINTAINER ShopTnt

RUN mkdir -p /app/
COPY ./buyer/dist /app/buyer
COPY ./manager-seller/dist /app/seller
COPY ./manager-admin/dist /app/admin
COPY ./manager-decor/dist /app/decor



COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./set-envs.sh /app/set-envs.sh
RUN ["chmod", "+x", "/app/set-envs.sh"]

EXPOSE 3000 3001 3002 3003 3004 3005 3006

CMD sh -c "/app/set-envs.sh && exec nginx -g 'daemon off;'"
