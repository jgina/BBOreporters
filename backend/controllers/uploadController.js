const cloudinary = require('../config/cloudinaryConfig');

exports.uploadImage = async (req, res, next) => {
  if (!req.file) {
    res.status(400);
    return next(new Error('No image file uploaded'));
  }

  const stream = cloudinary.uploader.upload_stream(
    { folder: 'news-platform' },
    (error, result) => {
      if (error) {
        res.status(500);
        return next(new Error('Cloudinary upload failed'));
      }
      res.json({ url: result.secure_url });
    }
  );

  stream.end(req.file.buffer);
};
