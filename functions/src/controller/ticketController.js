const mysql = require('mysql');

// Configura tu conexión a MySQL
const connection = mysql.createConnection({
    host: '35.226.160.155',
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

// Crear un nuevo ticket
exports.createTicket = (req, res) => {
  const { tipoticket, otroCampo } = req.body; // Asegúrate de tener los campos necesarios en tu formulario

  const query = 'INSERT INTO Ticket (tipoticket, otroCampo) VALUES (?, ?)';
  const values = [tipoticket, otroCampo];

  connection.query(query, values, (error, results) => {
    if (error) {
      console.error('Error al insertar un nuevo ticket:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.json({ message: 'Ticket creado exitosamente' });
    }
  });
};
