require('dotenv').config();

const express = require('express')
const bodyParser = require('body-parser');

const SiteModels = require('./models/sitemodels')
const UserModels = require('./models/usermodel');
const db = require('./config/db');

const app = express()
const port = process.env.PORT || 8000

app.engine('html', require('ejs').renderFile);
app.use(express.static(__dirname + '/public/static'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

db.run()

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

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/views/index.html')
})

app.get('/store', (req, res) => {
  res.sendFile(__dirname + '/public/views/store.html')
})

app.get('/explore', (req, res) => {
  res.sendFile(__dirname + '/public/views/explore.html')
})

app.get('/profile/:profileId', (req, res) => {
    res.sendFile(__dirname + '/public/views/profile.html')
//   res.send(req.params.bookId)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))