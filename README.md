# Oh-Hell-Backend
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

Backend for online oh hell card game

## Deployment

`npm install` - Install dependencies

### Local instance
`mongodb --config mongo.conf` - setup and start mongodb
`npm start` - start server at localhost:4000

### Deployed instance
`DBURL=http://mydb.com PORT=4000 npm start` - Provide environmental variables for database url and port and start server
