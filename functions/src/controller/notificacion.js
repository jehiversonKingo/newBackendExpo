const nodemailer = require('nodemailer')

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aroldoescobar@emilianisomascos.edu.gt',
    pass: '54224703AroldoL',
  },
})

// Función para enviar el correo de notificación
const enviarCorreoNotificacion = (correoDestino, tipoTicket) => {
  const mailOptions = {
    from: 'aroldol005@gmail.com', // Puedes dejarlo así o proporcionar un correo específico si lo deseas
    to: correoDestino,
    subject: 'Nuevo Ticket Administrativo',
    text: `Se ha creado un nuevo ticket administrativo. Tipo de ticket: ${tipoTicket}`,
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar el correo de notificación:', error)
    } else {
      console.log('Correo de notificación enviado:', info.response)
    }
  })
}

module.exports = enviarCorreoNotificacion