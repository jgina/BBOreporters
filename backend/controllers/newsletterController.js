const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const { sendEmail } = require('../config/mailer');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.subscribeToNewsletter = async (req, res, next) => {
  const email = req.body?.email?.trim().toLowerCase();

  if (!email || !EMAIL_REGEX.test(email)) {
    res.status(400);
    return next(new Error('Valid email is required'));
  }

  const existing = await NewsletterSubscriber.findOne({ email });
  if (existing) {
    return res.status(200).json({ message: 'Email already subscribed' });
  }

  await NewsletterSubscriber.create({ email });

  try {
    await sendEmail({
      to: email,
      subject: 'Welcome to BBOreporters Newsletter',
      text: 'Thanks for subscribing to BBOreporters. You will now receive our latest updates.',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
          <h2 style="margin: 0 0 12px; color: #c81d25;">Welcome to BBOreporters</h2>
          <p style="margin: 0 0 10px;">
            Thanks for subscribing to our newsletter.
          </p>
          <p style="margin: 0;">
            You will now receive our latest headlines and updates.
          </p>
        </div>
      `,
    });

    if (process.env.NEWSLETTER_NOTIFY_EMAIL) {
      await sendEmail({
        to: process.env.NEWSLETTER_NOTIFY_EMAIL,
        subject: 'New newsletter subscriber',
        text: `A new email subscribed: ${email}`,
        html: `<p style="font-family: Arial, sans-serif;">A new email subscribed: <strong>${email}</strong></p>`,
      });
    }
  } catch (error) {
    res.status(502);
    return next(new Error(error.message || 'Subscription saved but email delivery failed'));
  }

  return res.status(201).json({ message: 'Subscribed successfully' });
};
