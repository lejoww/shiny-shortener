require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const { check, validationResult } = require('express-validator');
const { Schema } = mongoose;
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Mongoose Connection
mongoose.connect(
  process.env.DB_URI, 
  { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  }
);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/public', express.static(`${process.cwd()}/public`));

app.get(
  '/', 
  (req, res) => {
    res.sendFile(process.cwd() + '/views/index.html');
  }
);

const urlSchema = new Schema({
  url: String,
  code: Number
});

const UrlModel = mongoose.model('Url', urlSchema);

// New URL to short
app.post(
  '/api/shorturl/new',
  [
    check('url').isURL()
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({ error: 'invalid url' });
    } else {
      let shortcut = {
        url: req.body.url,
        code: Math.round(Math.random() * 100)
      };

      UrlModel(shortcut).save((err, url) => {
        res.json({ original_url: shortcut.url, short_url: shortcut.code });
      });
    }
  }
);

app.get(
  '/api/shorturl/:shortUrl', 
  (req, res) => {
    const shortUrl = parseInt(req.params.shortUrl);

    UrlModel.findOne({ code: shortUrl }, (err, url) => {
      if (url) {
        res.redirect(url.url)
      } else {
        res.json({ error: "No short URL found for the given input" });
      }
    });
  }
);

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
