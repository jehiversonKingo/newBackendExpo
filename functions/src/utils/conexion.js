const mysql = require ('mysql');

const connection = mysql.createConnection({
    host: '10.54.128.25',
    user: 'root',
    password: 'UmCYXM9=J=C}jh7+',
    database: 'kinqoenergy'
})

connection.connect((err)=>{
    if (err) throw err
    console.log('Conexion establecida exitosamente!')
})

connection.end()