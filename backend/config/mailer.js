const nodemailer = require('nodemailer');

let transporter;

const getMailer = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true';

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const mailer = getMailer();

  if (!mailer) {
    throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.');
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  return mailer.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};

module.exports = { sendEmail };
