"use strict";
const logger = require("../config/logger");

const repository = (container) => {
  const sendEmail = (payload) => {
    return new Promise((resolve, reject) => {
      const { smtpSettings, smtpTransport, nodemailer } = container.cradle;

      const transporter = nodemailer.createTransport(
        smtpTransport({
          service: smtpSettings.service,
          auth: {
            user: smtpSettings.user,
            pass: smtpSettings.pass,
          },
        })
      );

      const mailOptions = {
        from: '"Do Not Reply, Cinemas Company 👥" <no-replay@cinemas.com>',
        to: `${payload.user.email}`,
        subject: `Tickects for movie ${payload.movie.title}`,
        html: `
            <h1>Tickest for ${payload.movie.title}</h1>

            <p>Cinem: ${payload.cinema.name}</p>
            <p>Room: ${payload.cinema.room}</p>
            <p>Seats: ${payload.cinema.seats}</p>

            <p>description: ${payload.description}</p>

            <p>Total: ${payload.totalAmount}</p>
            <p>Total: ${payload.orderId}</p>

            <h3>Cinemas Microserivce 2017, Enjoy your movie !</h3>
          `,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        logger.trace({ mailOptions: mailOptions }, "Enetering sendMail");
        if (err) {
          reject(new Error("An error occured sending an email, err:" + err));
        }
        transporter.close();
        logger.trace({ info: info }, "Exiting sendMail");
        resolve(info);
      });
    });
  };

  const sendSMS = (payload) => {
    // TODO: code for some sms service
  };

  return Object.create({
    sendSMS,
    sendEmail,
  });
};

const connect = (container) => {
  logger.info("repository connect");

  return new Promise((resolve, reject) => {
    if (!container) {
      logger.error("dependencies not supplied!");
      reject(new Error("dependencies not supplied!"));
    }
    resolve(repository(container));
  });
};

module.exports = Object.assign({}, { connect });
