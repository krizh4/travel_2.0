// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGO_URI;

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserModels = require('../models/usermodel');
const SiteModels = require('../models/sitemodels')

const mongoose = require('mongoose');

async function run() {
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((error) => {
      console.error('Error connecting to MongoDB:', error);
    });
}

async function getData(req, res, next) {
  // if (!(req.params.blogID)) {
    try {
      const results = await SiteModels.Post.find()
        .sort({ createdAt: -1 })
        .skip(req.refresh || 0)
        .limit(5)
        .exec();
    
      console.log(results);
      req.data = results;
      if (req.refresh) {
        req.refresh += 1;
      }
      next();
      // Process the results
    } catch (err) {
      console.error(err);
      next();
      // Handle error
    }    
  // }

  // req.data = await SiteModels.Post.findById(req.params.blogID)
}

async function getOne(req, res, next) {
    try {
      query = req.params.ID
      const results = await SiteModels.Post.findOne({ _id: query })
    
      console.log(results);
      req.data = results;
      next();
      // Process the results
    } catch (err) {
      console.error(err);
      next();
      // Handle error
    }    
  // }

  // req.data = await SiteModels.Post.findById(req.params.blogID)
}

async function register(req, res, next) {
  const { username, password, email } = req.body;

  try {
    const existingUser = await UserModels.User.findOne({ email });
    if (existingUser) {
      return res.status(409).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModels.User({
      name: username,
      email: email,
      password: hashedPassword,
    })

    newUser.save()
      .then(async (user) => {
        console.log('User saved to the database', user);
        verToken = await verificationToken(user)
        const token = jwt.sign({ userId: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, verificationCode: verToken}, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: true })
        sendVerificationEmail(user.email, verToken);
        next()
      })
      .catch((error) => {
        console.error('Error saving user:', error);
        res.send("Catched Error while Registering 1")
      });

  } catch(error) {
    res.send("Catched Error while Registering 2" + error)
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await UserModels.User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    // Generate a JWT
    const token = jwt.sign({ userId: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, secure: true })

    next()
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function createPost(req, res, next) {
  try {
    const newPost = new SiteModels.Post({
      title: req.body.title,
      desc: req.body.text,
      media: {
        link: req.body.image,
        alt: req.body.alt,
      },
      metrics: {
        likes: 0,
        comments: []
      },
      tags: [req.body.tags],
      location: req.body.location
    })
  
    newPost.save()
        .then(() => {
          console.log('Post saved to the database');
          next()
        })
        .catch((error) => {
          console.error('Error saving post:', error);
          res.send("Catched Error while posting 1")
        });
  } catch (error) {
    res.send("Catched Error while Posting 2" + error)
  }
}

async function setVerified(userId){
  try {
    UserModels.User.findOneAndUpdate({ _id: userId }, { isVerified: true }, { new: true })
    .then(updatedUser => {
      if (updatedUser) {
        user = updatedUser;
        const token = jwt.sign({ userId: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: true })
        console.log('User updated successfully:', updatedUser);
      } else {
        console.log('User not found');
      }
    })
    .catch(error => {
      console.error('Error updating user:', error);
    });
  } catch (error) {
    console.error(error);
  }
}

// Email Verification
const nodemailer = require('nodemailer');

// Create the transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'horacio.mccullough@ethereal.email',
      pass: 'A7vj7ZCeAk3cJrwhhK'
  }
});

// Generate a verification token
const generateVerificationToken = async (user) => {
  const uniqueValue = Date.now() + user.id;
  const token = await bcrypt.hash(uniqueValue.toString(), 10);
  return token;
};

const verificationToken = generateVerificationToken;

const sendVerificationEmail = (email, token) => {
  const mailOptions = {
    from: 'horacio.mccullough@ethereal.email',
    to: email,
    subject: 'Email Verification',
    text: `Please click on the following link to verify your email: localhost:3000/verify/${token}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Verification email sent: ' + info.response);
    }
  });
};

exports.run = run;
exports.getData = getData;
exports.register = register;
exports.login = login;
exports.createPost = createPost;
exports.getOne = getOne;
exports.setVerified = setVerified;
