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
  } catch (err) {
    console.error(err);
    next();
  }
}

async function getOne(req, res, next) {
  try {
    query = req.params.ID
    const results = await SiteModels.Post.findOne({ _id: query })

    console.log(results);
    req.data = results;
    next();
  } catch (err) {
    console.error(err);
    next();
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

function createUser(username, email, hashedpassword) {
  return new Promise((reslove, reject) => {
    const newUser = new UserModels.User({
      name: username,
      email: email,
      password: hashedpassword,
    })
    newUser.save()
    .then((user) => {
      console.log('User saved to the database', user);
      reslove(user);
    })
    .catch((error) => {
      console.error('Error saving user:', error);
    });
  });
}

async function checkUser(email) {
  const user = await UserModels.User.findOne({ email });
  return user
}

async function changeVerified(userId) {
  const updatedUser = await UserModels.User.findOneAndUpdate({ _id: userId }, { isVerified: true }, { new: true })
  console.log(updatedUser);
  return updatedUser
}


module.exports = {
  run,
  getData,
  createPost,
  getOne,
  createUser, // For Auth
  checkUser,  // For Auth
  changeVerified, // For Auth
}
