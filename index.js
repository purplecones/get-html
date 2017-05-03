const Nightmare = require('nightmare');
const queryString = require('query-string');
const express = require('express');

const app = express();
const PORT = 3000;

app.get('/', function(req, res) {
  const nightmare = Nightmare({
    show: false,
    webPreferences: {
      partition: 'nopersist',
    },
  });

  const paramsRaw = req.url.substring(2, req.url.length);
  const params = queryString.parse(paramsRaw);
  console.log({ params });

  const defaultProperties = {
    params,
    timestamp: Date.now(),
  };

  const { url, wait } = params;

  if (!url) {
    const response = Object.assign({}, defaultProperties, {
      error: {
        message: 'url required',
      },
    });
    res.status(400);
    res.json(response);
  }

  if (url) {
    nightmare
      .goto(url)
      .wait(isNaN(wait) ? wait : Number(wait))
      .evaluate(function() {
        return document.querySelector('html').innerHTML;
      })
      .end()
      .then(function(html) {
        const response = Object.assign({}, defaultProperties, {
          html,
        });
        res.json(response);
      })
      .catch(function(error) {
        const response = Object.assign({}, defaultProperties, {
          error,
        });
        res.status(500);
        res.json(response);
      });
  }
});

app.listen(PORT, function() {
  console.log(`listening on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close();
});
