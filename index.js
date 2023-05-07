const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

app.get('/store', (req, res) => {
  res.sendFile(__dirname + '/views/store.html')
})

app.get('/explore', (req, res) => {
  res.sendFile(__dirname + '/views/explore.html')
})

app.get('/profile/:profileId', (req, res) => {
    res.sendFile(__dirname + '/views/profile.html')
//   res.send(req.params.bookId)
})

app.use(express.static('public'))
app.listen(port, () => console.log(`Example app listening on port ${port}!`))