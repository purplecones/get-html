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

  const { url, wait = 'html', selector = 'html' } = params;
  const defaultProperties = {
    params,
  };

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
      .on('did-start-loading', () => {
        defaultProperties.didStartLoading = Date.now();
      })
      .on('did-stop-loading', () => {
        defaultProperties.didStopLoading = Date.now();
      })
      .on('did-get-response-details', () => {
        defaultProperties.didGetResponseDetails = Date.now();
      })
      .on('dom-ready', () => {
        defaultProperties.domReady = Date.now();
      })
      .goto(url)
      // wait in ms or wait when css selector is ready
      .wait(isNaN(wait) ? wait : Number(wait))
      .evaluate(
        _selector => {
          // grab contents using selector provided
          return document.querySelector(_selector).outerHTML;
        },
        selector
      )
      .end()
      .then(html => {
        const response = Object.assign({}, defaultProperties, {
          processEnd: Date.now(),
          timezoneOffset: new Date().getTimezoneOffset(),
          html,
        });
        res.json(response);
      })
      .catch(error => {
        console.error({ error });
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
