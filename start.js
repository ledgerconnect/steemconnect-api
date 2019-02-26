const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const steem = require('@steemit/steem-js');
const { strategy } = require('./helpers/middleware');

const app = express();
const port = process.env.PORT || 3000;

if (process.env.STEEMD_URL) {
  steem.api.setOptions({ url: process.env.STEEMD_URL });
}

app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  req.steem = steem;
  next();
});

app.enable('trust proxy');
app.disable('x-powered-by');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(strategy);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', require('./routes/api'));
app.use('/api/oauth2', require('./routes/oauth2'));

app.get('/*', (req, res) => {
  res.redirect(`https://app.steemconnect.com${req.url}`);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
