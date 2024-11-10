const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../Models/user');

exports.registerUser = async (req, res) => {
  const { username, email, password, mobile } = req.body;
  
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(200).json({ message: 'User already exists' });
    }

    user = new User({
      username,
      email,
      mobile,
      password
    });

    await user.save();
    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, message : "Registration Successful", obj: user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: 'No User Found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(202).json({ message: 'Invalid credentials' });
    }

    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token,  message : "Logged In Successfully",  obj: user});
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};

exports.checkAuth = async (req, res) => {
  try {
    res.status(200).json({ loggedIn: true, user: req.user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const user = await User.find();
    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
}
