FROM node:alpine3.21 AS builder
WORKDIR /app/frontend
COPY Frontend/package*.json /app/frontend/
RUN npm ci
COPY Frontend /app/frontend/
RUN npm run build


FROM nginx:1.30.4-alpine 
#${} these values are provided by the CI pipeline
LABEL org.opencontainers.image.version=${VERSION}\
      org.opencontainers.image.authors="sanrosebhetuwal@gmail.com"\
      org.opencontainers.image.description="Frontend Server"\
      org.openconatiners.image.created=${BUILD_TIME}
#copying the bundle.js created from the react into the nginx html folder
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
#Providing the nginx(non root user) access to some folders and its content required to start the nginx server
RUN chown -R nginx:nginx /usr/share/nginx/html &&\
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/run && \
    chown -R nginx:nginx /run
USER nginx
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]