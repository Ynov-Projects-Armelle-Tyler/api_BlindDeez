import fs from 'fs';
import colors from 'colors/safe';
import https from 'https';
import express from 'express';
import proxy from 'express-http-proxy';
import cors from 'cors';

import Socket from '../core/connectors/Socket';

const port = process.env.PORT || 8000;
const securePort = process.env.SECURE_PORT || 8443;
const app = express();
app.use(cors());

const proxyOptions = {
  https: false,
  parseReqBody: false,
  proxyReqPathResolver: req => req.originalUrl,
};

app.use((req, res, next) => {
  console.log(colors.green('[blinddeez.devserver] Requesting ' + req.originalUrl));
  next();
});

app.set('TEST', 'test');

app.use('/api/v1/general', proxy('http://localhost:8001', proxyOptions));
app.use('/api/v1/auth', proxy('http://localhost:8002', proxyOptions));

export default () => new Promise(resolve => {
  const server = app.listen(port, () => {
    console.log(colors.cyan(
      `[blinddeez.devserver] Running on http://localhost:${port}`
    ));
  });

  const httpsServer = https.createServer({
    key: fs.readFileSync(path.resolve('./.dev/key.pem'), 'utf-8'),
    cert: fs.readFileSync(path.resolve('./.dev/cert.pem'), 'utf-8'),
  }, app);

  server.setTimeout(7200000);
  httpsServer.setTimeout(7200000);

  const io = Socket(httpsServer);

  const secureServer = httpsServer
    .listen(securePort, 'api.blinddeez.develop', () => {
      console.log(colors.cyan(
        `[blinddeez.devserver] Running on https://api.blinddeez.develop:${securePort}`
      ));

      resolve({ server, secureServer });
    });
});
