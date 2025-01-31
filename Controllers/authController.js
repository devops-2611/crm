const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../Models/user');

exports.registerUser = async (req, res) => {
  const {username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: "Username, Email, password, and role are required." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.findOne({ email });
    if (user) {
      // If user exists, check if the role already exists
      if (user.roles.includes(role)) {
        return res.status(400).json({ message: "User already has this role." });
      }

       // Add the new role to the roles array
       user.roles.push(role);
       await user.save();
       return res.status(200).json({ message: "Role added to the user successfully." });
    }

    // If user does not exist, create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      roles: [role],
    });

    await newUser.save();

    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, message: "Registration Successful", obj: user });
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
    res.status(201).json({ token, message: "Logged In Successfully", obj: user });
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

exports.createSuperAdmin = async (req, res) => {
  const { username, email, password, secretKey } = req.body;

  if (secretKey !== process.env.SUPER_ADMIN_SECRET) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.findOne({ email });

    if (user) {
      if (user.roles.includes("super-admin")) {
        return res.status(400).json({ message: "User is already a super admin." });
      }

      user.roles.push("super-admin");
      await user.save();
      return res.status(200).json({ message: "Super admin role added to the user." });
    }

    const superAdmin = new User({
      username,
      email,
      password: hashedPassword,
      roles: ["super-admin"],
    });

    await superAdmin.save();
    return res.status(201).json({ message: "Super admin created successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}