const mongoose = require('mongoose');

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

newsletterSubscriberSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
