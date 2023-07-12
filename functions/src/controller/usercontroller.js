const mysql = require('mysql');

//Credencilaes de mi base de datos
const connection = mysql.createConnection({
    host: '10.54.128.2',
    user: 'root',
    password: 'UmCYXM9=J=C}jh7+',
    database: 'kinqoenergy',
});

// Obtener tipos de ticket
exports.getTipoTickets = (req, res) => {
  const query = 'SELECT id, tipo FROM tipoticket';

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener los tipos de ticket:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.json(results);
    }
  });
};

// Obtener un ticket por ID
exports.getTicketById = (req, res) => {
  const ticketId = req.params.id;
  const query = 'SELECT * FROM Ticket WHERE id = ?';
  const values = [ticketId];

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error('Error al obtener el ticket:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Ticket no encontrado' });
    } else {
      res.json(results[0]);
    }
  });
};

// Obtener todos los tickets
exports.getAllTickets = (req, res) => {
  const query = 'SELECT * FROM ticket';

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener los tickets:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.json(results);
    }
  });
};

connection.end();
