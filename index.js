require('dotenv').config();

const express = require('express')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// const SiteModels = require('./models/sitemodels')
const db = require('./config/db');

const app = express()
const port = process.env.PORT || 8000

app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public/static'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());

db.run()

// Route Handleing
app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/public/views/admin.html')
}).post('/admin/:command/:type', (req, res) => {
  if (req.params.command == 'add'){
    if (req.params.type == 'post'){

      // SiteModels.Post({
      //   title: req.body.post_name,
      //   desc: req.body.post_desc
      // }).save((err, data) => {
      //   if (err) return console.log(err._message);
      //   console.log(`> ${data.title} created Successfully`);
      // });
    } else if (req.params.type == 'place'){
      console.log("place");
    } else {
      console.log("Error");
    }
  }
})

app.get('/', db.getData,(req, res) => {
  // data = await db.getData();
  // console.log(data);
  // res.sendFile(__dirname + '/public/views/index.html')
  req.refresh = 1;
  data = req.data
  res.render(__dirname + '/public/views/index.ejs', {data})
})

app.get('/post/:ID', db.getOne, (req, res) => {
  // console.log(req.params.blogID);
  // data = await db.getData(req.params.blogID)
  // console.log(data);
  data = req.data;
  res.render(__dirname + '/public/views/post.ejs', data)
})

app.get('/store', (req, res) => {
  res.sendFile(__dirname + '/public/views/store.html')
})

app.get('/explore', (req, res) => {
  res.sendFile(__dirname + '/public/views/explore.html')
})

app.get('/profile', checkUser, (req, res) => {
  // const token = req.cookies.token;
  // db.checkUser(token, res)
  res.render('../public/views/profile.ejs', data);
})

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/public/views/register.html')
}).post('/register', db.register ,(req, res) => {
  res.send("Registration Succesful, Go login")
})

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/views/login.html');
}).post('/login', db.login, (req, res) => {
  res.redirect('/profile')
})

app.post('/logout', (req, res) => {
  res.cookie('token', '', { expires: new Date(0) });
  res.json({ message: 'Logout successful' });
})

app.get('/newpost', checkAdmin, (req, res) => {
  res.sendFile(__dirname + '/public/views/addpost.html')
}).post('/newpost', checkAdmin, db.createPost, (req,res) => {
  res.send("Post Created!")
})

// Middleware Functions
function checkAdmin(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).send('Unauthorized');
  } else {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.isAdmin) {
        next()
      } else {
        res.status(401).send('Unauthorized');
      }
    } catch (error) {
      console.error('Error during token verification:', error);
      res.status(401).send('Unauthorized');
    }
  }
}

async function checkUser(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).send('Unauthorized <a href="/login">Go login<a>');
  } else {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded.name);
      data = {name: decoded.name};
      next()
    } catch (error) {
      console.error('Error during token verification:', error);
      res.status(401).send('Unauthorized');
    }
  }
}


app.listen(port, () => console.log(`Example app listening on port ${port}!`))