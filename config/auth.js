const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const { createUser, checkUser, changeVerified } = require('./db')

// Register Middleware
async function register(req, res, next) {
  const { username, password, email } = req.body;

  try {
    const existingUser = await checkUser(email)
    if (existingUser) {
      return res.status(409).send('User already exists <a href="/login">Login<a>');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    createUser(username, email, hashedPassword)
      .then(async user => {
        verToken = await verificationToken(user);
        const token = jwt.sign({ userId: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, verificationCode: verToken }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: true });
        console.log(verToken);
    
        sendVerificationEmail(user.email, verToken);
        next()
      })
      .catch(error => {
        console.error(error);
      })
  } catch (error) {
    res.send("Catched Error while Registering" + error)
  }
}

// Login Middleware
async function login(req, res, next) {
  const { email, password } = req.body;

  try {
    const user = await checkUser(email)

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check Login
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send('Invalid password');
    }
    // Generate a JWT
    const token = jwt.sign({ userId: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, verificationCode: user.verificationCode, isVerified: user.isVerified }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, secure: true })
    next()
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Internal server error');
  }
}

// Set Verify Middleware
async function setVerified(userId) {
  const updatedUser = await changeVerified(userId)
  try {
    if (updatedUser) {
      user = updatedUser;
      const token = jwt.sign({ userId: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, verificationCode: user.verificationCode, isVerified: user.isVerified }, process.env.JWT_SECRET, { expiresIn: '1h' });
      // res.cookie('token', token, { httpOnly: true, secure: true })
      console.log('User updated successfully:', updatedUser);
      return token;
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error(error);
  }
}

// Email Verification
const verifyEmail = async (user) => {
  verToken = await verificationToken(user)
  const token = jwt.sign({ userId: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, verificationCode: verToken, isVerified: user.isVerified }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true, secure: true })
  console.log('User updated successfully:', updatedUser);
}

// Create the transporter
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.sendinblue.com',
  port: 587,
  auth: {
      user: 'testtruecall50@gmail.com',
      pass: 'ctALGwHJpF8nZgEv'
  }
});

// Generate a verification token
const generateVerificationToken = async (user) => {
  const uniqueValue = Date.now() + user._id;
  const token = await bcrypt.hash(uniqueValue.toString(), 10);
  return token;
};
const verificationToken = generateVerificationToken;

const sendVerificationEmail = (email, token) => {
  const mailOptions = {
    from: 'travel2.0@travel.com',
    to: email,
    subject: 'Email Verification',
    text: `Please click on the following link to verify your email: localhost:3000/verify?verToken=${token}` //make Query itll be easy
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Verification email sent: ' + info.response);
    }
  });
};

// Module Exports
module.exports = {
  register,
  login,
  setVerified,
  verifyEmail,
}
