[![Awesome](https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg)](https://github.com/sindresorhus/awesome)

##  :beginner: About
Simple Url Shortener service made with Node, Express, Handlebars and Mysql with analytics that shows you how many interactions your link had as well as the browser and operating system of each click.


![Home page screenshot](https://raw.githubusercontent.com/tbvescio/Planck/master/public/home-example.jpg)


## :zap: Usage
To use this project you need to have node installed as well as an instance of mysql database.

You need to make an .env file like this:

```
DB_HOST=test
DB_NAME=test
DB_PASSWORD=test
DB_PORT=3306
DB_USER=test
DOMAIN=https://localhost/
SESSION_SECRET=secret
```
Now run:

```
$ cd Planck
$ npm install
$ npm start
```


