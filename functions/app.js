'use strict'

const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const morgan = require('morgan');

//CABEZERAS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
    next();
  });

//CARGAR RUTAS
const routesTickets = require('./src/routes/index');

//MIDDELWARES
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json());

const storage = multer.diskStorage({
    filename: function(req, file, cb) {
        cb(null, new Date().getTime()+ path.extname(file.originalname));
    },
})
app.use(multer({storage}).single('file'));

//RUTAS
app.use('', routesTickets);

//EXPORTAR
module.exports = app;