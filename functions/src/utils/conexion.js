const mysql = require ('mysql');

const connection = mysql.createConnection({
    host: '35.226.160.155',
    user: 'root',
    password: 'UmCYXM9=J=C}jh7+',
    database: 'kinqoenergy',
})

connection.connect((err)=>{
    if (err) throw err
    console.log('Conexion establecida exitosamente!')
})

connection.end()