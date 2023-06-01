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
      
      // console.log('User updated successfully:', updatedUser);
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
  user = await checkUser(user.email)
  verToken = await verificationToken(user)
  const token = jwt.sign({ userId: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, verificationCode: verToken, isVerified: user.isVerified }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  await sendVerificationEmail(user.email, verToken);
  
  return token;
}

// Create the transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
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
    from: 'noreply@travel.com',
    to: email,
    subject: 'Email Verification - Travel 2.0',
    text: `Please click on the following link to verify your email:`, //make Query itll be easy
    html: `<a href="localhost:3000/verify?verToken=${token}">Click Here</a> to Verify your Email`
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
