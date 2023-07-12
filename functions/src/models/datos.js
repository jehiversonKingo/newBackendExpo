const mysql = require('mysql2');

// Crea una conexión con la base de datos MySQL
const connection = mysql.createConnection({
    host: '10.54.128.2',
    user: 'root',
    password: 'UmCYXM9=J=C}jh7+',
    database: 'kinqoenergy'
});

module.exports = connection;

