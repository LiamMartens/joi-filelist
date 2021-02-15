FROM node:14
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y xsel