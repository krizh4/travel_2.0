require('dotenv').config();

const express = require('express')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { run, getData, createPost, getOne, getProfileData } = require('./config/db');
const { register, login, setVerified, verifyEmail } = require('./config/auth');

const app = express()
const port = process.env.PORT || 8000

app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public/static'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());

run()

// Route Handleing
// Admin Route
app.get('/admin', checkUser, checkVerified, checkAdmin, (req, res) => {
  res.sendFile(__dirname + '/public/views/admin.html')
}).post('/admin/:command/:type', (req, res) => {
  if (req.params.command == 'add'){
    if (req.params.type == 'post'){
    } else if (req.params.type == 'place'){
      console.log("place");
    } else {
      console.log("Error");
    }
  }
})

// Index Route
app.get('/', getData,(req, res) => {
  req.refresh = 1;
  data = req.data
  res.render(__dirname + '/public/views/index.ejs', {data})
})

// Individual Post Route
app.get('/post/:ID', getOne, (req, res) => {
  data = req.data;
  res.render(__dirname + '/public/views/post.ejs', data)
})

// Store Route {not devloped yet}
app.get('/store', checkVerified, (req, res) => {
  res.sendFile(__dirname + '/public/views/store.html')
})

// Explore Route {not devloped yet}
app.get('/explore', (req, res) => {
  res.sendFile(__dirname + '/public/views/explore.html')
})

app.get('/profile', checkUser, getProfileData, (req, res) => {
  data.push(req.data);
  console.log(data);
  res.render('../public/views/profile.ejs', data);
})

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/public/views/register.html')
}).post('/register', register ,(req, res) => {
  res.send("Registration Succesful <a href='/'>Go Back to Home</a>")
})

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/views/login.html');
}).post('/login', login, (req, res) => {
  res.redirect('/profile')
})

app.post('/logout', (req, res) => {
  res.cookie('token', '', { expires: new Date(0) });
  res.send('Logout successful');
})

app.get('/newpost', checkAdmin, (req, res) => {
  res.sendFile(__dirname + '/public/views/addpost.html')
}).post('/newpost', checkAdmin, createPost, (req,res) => {
  res.send("Post Created!")
})

// API endpoint for email verification
app.get('/verify', async (req, res) => {
  let token = req.cookies.token;
  const { verToken } = req.query;

  // Retrieve the stored hashed token for the user
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  const storedHashedToken = decoded.verificationCode; // Retrieve from your database

  // Compare the token with the stored hashed token
  const isTokenValid = (verToken == storedHashedToken);
  console.log(verToken, storedHashedToken);

  if (isTokenValid) {
    // Perform necessary database updates or business logic
    token = await setVerified(decoded.userId)
    // Respond with a success message
    res.cookie('token', token, { httpOnly: true, secure: true })
    res.send('Email verified successfully!');
  } else {
    // Handle invalid token case
    res.status(400).send('Invalid token');
  }
});

app.get('/email-verification', async (req, res) => {
  let token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  token = await verifyEmail(decoded)

  res.cookie('token', token, { httpOnly: true, secure: true })
  res.send("Please Check Your Emails")
})


// Middleware Functions
// Check if user is a Admin
function checkAdmin(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).send('Unauthorized <a href="/login">Go login<a>');
  } else {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.isAdmin) {
        next()
      } else {
        res.status(401).send('Unauthorized (Uba admin nemei)');
      }
    } catch (error) {
      console.error('Error during token verification:', error);
      res.status(401).send('Unauthorized');
    }
  }
}

// Check if user is logged
async function checkUser(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).send('Unauthorized <a href="/login">Go login<a> (Log in Wela idpn)');
  } else {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log(decoded);
      data = [decoded];
      next()
    } catch (error) {
      if (error.name == 'TokenExpiredError') {
        res.status(401).send('Unauthorized <a href="/login">Go login<a> (Token Eka expired)');
      }
      console.error('Error during token verification:', error);
      res.status(401).send('Unauthorized');
    }
  }
}

// Check if user is verified
async function checkVerified(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).send('Unauthorized <a href="/login">Go login<a>');
  } else {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.isVerified) {
        next()
      } else {
        res.status(401).send('Unauthorized Check your email Dumb mf');
      }
    } catch (error) {
      console.error('Error during token verification:', error);
      res.status(401).send('Unauthorized');
    }
  }
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))