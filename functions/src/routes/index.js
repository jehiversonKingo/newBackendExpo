const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const moment = require('moment');

const connection = require('../models/datos');
const credential = {
  host: '35.226.160.155',
  user: 'root',
  password: 'UmCYXM9=J=C}jh7+',
  database: 'kinqoenergy',
}
const transporter = nodemailer.createTransport({
  // Configuración del servicio de correo electrónico (por ejemplo, Gmail)
  service: 'gmail',
  auth: {
    user: 'programacionprueba003@gmail.com',
    pass: 'zcjsbczexpzvwtmq',
  },
});
router.post('/enviar-correo', (req, res) => {
  const { email, subject, body } = req.body;
   // Configuración del correo electrónico
   const mailOptions = {
    from: 'tu_correo@gmail.com', // Debes usar el mismo correo configurado en nodemailer
    to: email,
    subject: subject,
    text: body,
  };
  // Enviar el correo electrónico
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error al enviar el correo:', error);
      res.status(500).json({ error: 'Error al enviar el correo electrónico' });
    } else {
      console.log('Correo enviado:', info.response);
      res.status(200).json({ message: 'Correo electrónico enviado exitosamente' });
    }
  });
});

// Ruta para obtener los días de vacaciones restantes y días gozados
router.get('/api/diasvacaciones', (req, res) => {
  const sql = 'SELECT days, daysgozados FROM diasvacaciones';
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Error al obtener los días de vacaciones:', error);
      res.status(500).json({ error: 'Error al obtener los días de vacaciones' });
    } else {
      res.json(results[0]); // Suponiendo que solo hay un registro en la tabla
    }
  });
});
// Ruta para enviar una solicitud de vacaciones
router.post('/api/vacaciones', (req, res) => {
  const { iduser, diasvacaciones, fechainicio, fechafinal } = req.body;

  // Insertar la nueva solicitud de vacaciones en la base de datos
  const sql = 'INSERT INTO vacaciones (iduser, diasvacaciones, fechainicio, fechafinal) VALUES (?, ?, ?, ?)';

  connection.query(sql, [iduser, diasvacaciones, fechainicio, fechafinal], (error, result) => {
    if (error) {
      console.error('Error al enviar la solicitud de vacaciones:', error);
      res.status(500).json({ error: 'Error al enviar la solicitud de vacaciones' });
    } else {
      res.send('Solicitud de vacaciones enviada exitosamente');
    }
  });
});

// Ruta para actualizar los días disponibles y los días gozados en la tabla de diasvacaciones
router.put('/api/diasvacaciones/actualizar', (req, res) => {
  const daysGozados = req.body.daysgozados;

  // Obtener el registro de días de vacaciones existente
  const getQuery = 'SELECT days, daysgozados FROM diasvacaciones LIMIT 1';
  connection.query(getQuery, (error, results) => {
    if (error) {
      console.error('Error al obtener los días de vacaciones:', error);
      res.status(500).send('Error al obtener los días de vacaciones');
      return;
    }

    const daysDisponibles = results[0].days;
    const daysGozadosAnteriores = results[0].daysgozados;

    // Calcular los nuevos días disponibles y los nuevos días gozados
    const nuevosDaysDisponibles = daysDisponibles - daysGozados;
    const nuevosDaysGozados = daysGozadosAnteriores + daysGozados;

    // Actualizar los días disponibles y los días gozados en la base de datos
    const updateQuery = `UPDATE diasvacaciones SET days = ${nuevosDaysDisponibles}, daysgozados = ${nuevosDaysGozados}`;
    connection.query(updateQuery, (error) => {
      if (error) {
        console.error('Error al actualizar los días disponibles y los días gozados:', error);
        res.status(500).send('Error al actualizar los días disponibles y los días gozados');
      } else {
        console.log('Días disponibles y días gozados actualizados correctamente');
        res.sendStatus(200);
      }
    });
  });
});

router.get("/api/requests", (req, res) => {
  const sql = "SELECT * FROM vacaciones WHERE solicitud IS NULL OR solicitud = ''";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener las solicitudes:", err);
      res.status(500).json({ error: "Error al obtener las solicitudes" });
    } else {
      res.json(results);
    }
  });
});

router.put("/api/requests/:iduser/approve", (req, res) => {
  const { iduser } = req.params;
  const sql = 'UPDATE vacaciones SET solicitud = "aceptada", idmanager = ? WHERE iduser = ?';
  const idmanager = req.body.idmanager; // Obtén el id del administrador desde el cuerpo de la solicitud
  connection.query(sql, [idmanager, iduser], (err, result) => {
    if (err) {
      console.error("Error al aprobar la solicitud:", err);
      res.status(500).json({ error: "Error al aprobar la solicitud" });
    } else {
      res.json({ message: "Solicitud aprobada" });
    }
  });
});

router.put("/api/requests/:iduser/reject", (req, res) => {
  const { iduser } = req.params;
  const sql = 'UPDATE vacaciones SET solicitud = "rechazada", idmanager = ? WHERE iduser = ?';
  const idmanager = req.body.idmanager; // Obtén el id del administrador desde el cuerpo de la solicitud
  connection.query(sql, [idmanager, iduser], (err, result) => {
    if (err) {
      console.error("Error al denegar la solicitud:", err);
      res.status(500).json({ error: "Error al denegar la solicitud" });
    } else {
      res.json({ message: "Solicitud denegada" });
    }
  });
});

router.post("/api/daysvacations/:iduser/update", (req, res) => {
  const { iduser } = req.params;
  const sqlSelect = "SELECT fechainicio, fechafinal FROM vacaciones WHERE iduser = ?";
  connection.query(sqlSelect, [iduser], (err, result) => {
    if (err) {
      console.error("Error al obtener las fechas de vacaciones:", err);
      res.status(500).json({ error: "Error al obtener las fechas de vacaciones" });
    } else {
      const { fechainicio, fechafinal } = result[0];
      const days = moment(fechafinal).diff(moment(fechainicio), "days") + 1;
      const sqlUpdate = "UPDATE diasvacaciones SET days = days + ?, daysgozados = daysgozados - ? WHERE iduser = ?";
      //const idmanager = req.body.idmanager; // Obtén el id del administrador desde el cuerpo de la solicitud
      connection.query(sqlUpdate, [days, days, iduser], (err, result) => {
        if (err) {
          console.error("Error al actualizar los días de vacaciones:", err);
          res.status(500).json({ error: "Error al actualizar los días de vacaciones" });
        } else {
          res.json({ message: "Tabla de días de vacaciones actualizada" });
        }
      });
    }
  });
});

// Ruta para filtrar los tickets según la fecha y el tipo de ticket
router.get('/mostrarticket', (req, res) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(0, 10); // Obtener la fecha actual en formato "YYYY-MM-DD"
  const tipoTicket = req.query.tipoticket; // Obtener el tipo de ticket desde la consulta

  connection.query('SELECT * FROM ticket', (error, results) => {
    if (error) {
      console.error('Error al obtener los datos:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    } else {
      const filteredTickets = results.filter((ticket) => {
        const ticketDate = new Date(ticket.fecha_creacion);
        const ticketFormattedDate = ticketDate.toISOString().slice(0, 10);

        // Verificar si el tipo de ticket coincide
        return ticketFormattedDate === formattedDate && ticket.tipo_ticket === tipoTicket;
      });

      res.json(filteredTickets);
    }
  });
});

router.get('/tablaticket', (req, res) => {
  const iduser = req.headers.authorization
  connection.query("SELECT idproblem, iduser, nomempleado, nomproblem, tipoticket, DATE_FORMAT(fecha_creacion, '%Y-%m-%d') AS fecha_creacion, descripcion, diasplazo, estado, prioridad, idmanager FROM ticket WHERE iduser = ?", [iduser], (error, results) => {
    if (error) {
      console.error('Error al obtener los datos:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    } else {
      res.json(results);
    }
  });
});

// Ruta para mostrar los datos de mi Ticket
router.get('/tickesito', (req, res) => {
  connection.query("SELECT idproblem, iduser, nomempleado, nomproblem, tipoticket, DATE_FORMAT(fecha_creacion, '%Y-%m-%d') AS fecha_creacion, descripcion, diasplazo, estado, prioridad, idmanager FROM ticket", (error, results) => {
    if (error) {
      console.error('Error al obtener los datos:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    } else {
      res.json(results);
    }
  });
});

//Ruta para mostrar los datos
router.get('/inventario', (req, res) => {
  connection.query('SELECT * FROM producto', (error, results) => {
    if (error) {
      console.error('Error al obtener los datos:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    } else {
      res.json(results);
    }
  });
});

//Ruta para insertar datos a mi tabla inventario
router.post('/inventario/asignar', (req, res) => {
  const { idinventario, idproducto, iduser, estadoequipo, fecha_creacion } = req.body;

  const sql = `INSERT INTO inventario ( idinventario, idproducto, iduser, estadoequipo, fecha_creacion) VALUES (?, ?, ?, ?, CURDATE())`;

  connection.query(sql, [idinventario, idproducto, iduser, estadoequipo, fecha_creacion], (error, results) => {
    if (error) {
      console.error('Error al insertar mis datos', error);
      res.status(500).json({error: 'Error al insertar los datos'});
    } else {
      res.send('Datos insertados correctamente');
    }
  });
});
//Ruta para insertar datos a mi tabla Modelo
router.post('/insertar/modelo', (req, res) => {
  const { nombremodelo, estadomodelo, fechacreacion } = req.body;

  //Insertar el nuevo registro para modelo en la base de datos
  const sql = `INSERT INTO modelo ( nombremodelo, estadomodelo, fechacreacion) VALUES ( ?, ?, CURDATE())`;

  connection.query(sql, [nombremodelo, estadomodelo, fechacreacion], (error, result) => {
    if (error){
      console.error('Error al insertar los datos:', error);
      res.status(500).json({ error: 'Error al insertar los datos'});
    } else {
    res.send('Datos insertados correctamente');
    }
  });
});
//Ruta para insertar datos a mi tabla Marca
router.post('/insertar/marca', (req, res) => {
  const { nombremarca, estadomarca, fechacreacion } = req.body;

  //Insertar el nuevo registro para marca en la base de datos
  const sql = `INSERT INTO marca ( nombremarca, estadomarca, fechacreacion) VALUES (?, ?, CURDATE())`;

  connection.query(sql, [nombremarca, estadomarca, fechacreacion], (error, result) => {
    if(error){
      console.error('Error al insertar los datos:', error);
      res.status(500).json({ error: 'Error al insertar los datos'});
    } else {
      res.send('Datos insertados correctamente');
    }
  });
});
//Ruta para insertar datos a mi tabla tipoproducto
router.post('/insertar/tipoproducto', (req, res) => {
  const {nombretipo, estadotipo, fechacreacion } = req.body;

  //Insertar el nuevo registro para tipoproducto en la base de datos
  const sql = `INSERT INTO tipoproducto (nombretipo, estadotipo, fechacreacion) VALUES (?, ?, CURDATE())`;

  connection.query(sql, [nombretipo, estadotipo, fechacreacion], (error, result) => {
    if(error){
      console.error('Error al insertar los datos:', error);
      res.status(500).json({ error: 'Error al insertar los datos'});
    } else{
      res.send('Datos insertados correctamente');
    }
  });
});
//Ruta para insertar datos a mi tabla producto
router.post('/insertar/equipo', (req, res) => {
  const {nomproduct, tipoproductos, marca, modelo, estado } = req.body;

  //Insertar el nuevo registro para producto en la base de datos
  const sql = `INSERT INTO producto (nomproduct, tipoproductos, marca, modelo, estado) VALUES (?, ?, ?, ?, ?)`;

  connection.query(sql, [nomproduct, tipoproductos, marca, modelo, estado], (error, results) => {
    if (error) {
      console.error('Error al insertar los datos:', error);
      res.status(500).json({error: 'Error al insertar los datos'});
    } else {
      res.send('Datos insertados correctamente');
    }
  });
});

// Ruta para insertar datos
router.post('/tickets', (req, res) => {
  const { iduser, nomempleado, nomproblem, tipoticket, descripcion } = req.body;

  // Insertar el nuevo ticket en la base de datos
  const sql = `INSERT INTO ticket (iduser, nomempleado, nomproblem, tipoticket, descripcion, fecha_creacion) VALUES (?, ?, ?, ?, ?, CURDATE())`;

  connection.query(sql, [iduser, nomempleado, nomproblem, tipoticket, descripcion], (error, result) => {
    if (error) {
      console.error('Error al insertar los datos:', error);
      res.status(500).json({ error: 'Error al insertar los datos' });
    } else {
      res.send('Datos insertados correctamente');
    }
  });
});

// Ruta para obtener los datos de la tabla tipoticket
router.get('/tipotickets', (req, res) => {
  // Obtener los datos de la tabla tipoticket
  const sql = 'SELECT * FROM tipoticket';

  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Error al obtener los datos:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    } else {
      res.json(results);
    }
  });
});

// Ruta para obtener los datos de la tabla users
router.get('/user', (req, res) => {
  // Obtener los datos de la tabla users
  const sql = 'SELECT * FROM users';

  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Error al obtener los datos:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    } else {
      res.json(results);
    }
  });
});
router.get('/tecnicos', (req, res) => {
  // Obtener los datos de la tabla users y su rol correspondiente mediante JOIN
  const sql = 'SELECT u.iduser, u.nomempleado, r.nomrol FROM users u JOIN rol r ON u.idrol = r.idrol WHERE r.nomrol = "tecnico"';

  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Error al obtener los datos:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    } else {
      res.json(results);
    }
  });
});

//Ruta para obtener los datos de la tabla de TipoProducto
router.get('/api/tipoproducto', (req, res) => {
  const sql = 'SELECT * FROM tipoproducto';

  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Error al obtener los datos:', error);
      res.status(500).json({ error: 'Error al obtener los datos'});
    } else {
      res.json(results);
    }
  });
});
// Ruta para obtener los datos de la tabla de Modelo
router.get('/api/modelo', (req, res) => {
  const sql = 'SELECT * FROM modelo';

  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Error al obtener los datos:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    } else {
      res.json(results);
    }
  });
});
// Ruta para obtener los datos de la tabla de Modelo
router.get('/inventario/asignado', (req, res) => {
  const sql = 'SELECT * FROM inventario';

  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Error al obtener los datos:', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    } else {
      res.json(results);
    }
  });
});
// Ruta para obtener los datos de la tabla de Marcas
router.get('/api/marca', (req, res) => {
  const sql = 'SELECT * FROM marca';

  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Error al obtener los datos', error);
      res.status(500).json({ error: 'Error al obtener los datos' });
    } else {
      res.json(results);
    }
  });
});
// Ruta para generar informe
router.get('/tickets/:iduser', (req, res) => {
  const idUser = req.params.iduser;

  //Realizar consulta a la base de datos para obtener los tickets del usuario especifico
  const sql = 'SELECT * FROM tickets WHERE iduser = ?';

  connection.query(sql, [idUser], (error, results) => {
    if (error) {
      console.error('Error al obtener los datos:', error);
      res.status(500).json({ error: 'Error al obtener los tickets' });
  } else {
    res.json(results);
  }
  });
});

// Ruta para eliminar un registro por idproblem
router.put('/estado/:idproblem', (req, res) => {
  const idproblem = req.params.idproblem;
  const { cerrar } = req.body;

  // Consulta SQL para actualizar el estado del ticket
  const sql = 'UPDATE ticket SET estado = ? WHERE idproblem = ?';

  // Ejecutar la consulta con los parámetros estado e idproblem
  connection.query(sql, [cerrar, idproblem], (err, result) => {
    if (err) {
      console.error('Error al actualizar el registro: ', err);
      res.status(500).json({ error: 'Error al actualizar el registro' });
    } else {
      if (result.affectedRows === 1) {
        // El registro se actualizó correctamente
        res.json({ message: 'El registro se actualizó correctamente' });
      } else {
        // No se encontró el registro con el idproblem especificado
        res.status(404).json({ error: 'No se encontró el registro con el idproblem especificado' });
      }
    }
  });
});

//Ruta para actualizar mi Ticket
router.put('/actualizar/:idproblem', (req, res) => {
  const idproblem = req.params.idproblem;
  const { diasplazo, estado, prioridad, idmanager } = req.body;

  // Consulta SQL para actualizar el registro en la tabla de tickets
  const ticketSql = 'UPDATE ticket SET diasplazo = ?, estado = ?, prioridad = ?, idmanager = ? WHERE idproblem = ?';

  // Ejecutar la consulta con los parámetros actualizados
  connection.query(ticketSql, [diasplazo, estado, prioridad, idmanager, idproblem], (err, result) => {
    if (err) {
      console.error('Error al actualizar el registro:', err);
      res.status(500).json({ error: 'Error al actualizar el registro' });
    } else {
      if (result.affectedRows === 1) {
        // El registro se actualizó exitosamente en la tabla de tickets
        res.json({ message: 'El registro se actualizó correctamente' });
      } else {
        // No se encontró el registro con el idproblem especificado en la tabla de tickets
        res.status(404).json({ error: 'No se encontró el registro con el idproblem especificado en la tabla de tickets' });
      }
    }
  });
});
//Ruta para actualizar mi Ticket
router.put('/estado/actualizar/:idproblem', (req, res) => {
  const idproblem = req.params.idproblem;
  const { estado } = req.body;

  // Consulta SQL para actualizar el registro en la tabla de tickets
  const ticketSql = 'UPDATE ticket SET estado = ? WHERE idproblem = ?';

  // Ejecutar la consulta con los parámetros actualizados
  connection.query(ticketSql, [ estado, idproblem], (err, result) => {
    if (err) {
      console.error('Error al actualizar el registro:', err);
      res.status(500).json({ error: 'Error al actualizar el registro' });
    } else {
      if (result.affectedRows === 1) {
        // El registro se actualizó exitosamente en la tabla de tickets
        res.json({ message: 'El registro se actualizó correctamente' });
      } else {
        // No se encontró el registro con el idproblem especificado en la tabla de tickets
        res.status(404).json({ error: 'No se encontró el registro con el idproblem especificado en la tabla de tickets' });
      }
    }
  });
});
  
//Ruta para enviar al login
router.post('/api/login', (req, res) => {
  const { correo, password } = req.body
  const values = [correo, password]
  var connection = mysql.createConnection(credential)
  connection.query("SELECT * FROM users WHERE correo = ? AND password = ?", values, (err, result) => {
    if (err) {
      res.status(500).send(err)
    } else {
      if (result.length > 0) {
          res.status(200).send({
              "iduser": result[0].iduser,
              "name": result[0].nomempleado,
              "correo": result[0].correo,
              "role": result[0].cargo,
              "iduser": result[0].iduser,
              nomempleado: result[0].nomempleado,
              cargo: result[0].cargo
        })
      } else {
        res.status(400).send('Usuario o Contraseña son incorrectos')
      }
    }
  })
  connection.end()
})

module.exports = router;