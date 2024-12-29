require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');

// Basic Configuration
const port = process.env.PORT || 3000;

const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));
  
const urlSchema = new mongoose.Schema({
  original_url: { type: String, required: true },
  short_url: { type: String, required: true }
});

const Url = mongoose.model('Url', urlSchema);


app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use(express.json());  // Middleware to parse JSON body
app.use(express.urlencoded({extended:true}))

// Your first API endpoint
app.post('/api/shorturl', async function(req, res) {
  let url = req.body.url; // Get URL from request body

  // Check if URL is provided
  if (!url) {
    return res.json({ error: "No URL provided" });
  }

  // Validate URL format
  const urlRegex = /^https?:\/\/[^\s]+$/;
  if (!urlRegex.test(url)) {
    return res.json({ error: "invalid url" });
  }

  // Generate a simple random short URL
  let urlCount = await Url.countDocuments({});
  let urlDoc = {
    original_url: url,
    short_url:urlCount
  };

  await Url.create(urlDoc);

  // Send response
  res.json({
    original_url: url,
    short_url: urlCount
  });
});

app.get('/api/shorturl/:shorturl', async function(req,res){
  const shorturl = req.params.shorturl;
  const urlDoc = await Url.findOne({short_url: +shorturl});
  res.redirect(urlDoc.original_url);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
