const functions = require("firebase-functions");
const app = require("./app");
const express = require('express');

//Middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//Initializations
require('./src/utils/conexion');

//Routes
app.use('/api/datos', require('./src/routes/index'));

exports.expotec = functions.https.onRequest(app);