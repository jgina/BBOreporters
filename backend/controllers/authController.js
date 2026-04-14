const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

exports.loginUser = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400);
    return next(new Error('Username and password are required'));
  }

  const user = await User.findOne({ username });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    return next(new Error('Invalid credentials'));
  }

  res.json({
    token: signToken(user._id),
    user: {
      id: user._id,
      username: user.username,
      role: user.role,
    },
  });
};
