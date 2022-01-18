import './config';

import fs from 'fs';
import path from 'path';
// import http from 'http';
import https from 'https';
import events from 'events';

import colors from 'colors/safe';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import Socket from '../core/connectors/Socket';
import { ErrorsInterceptor, DefaultsInterceptor } from './interceptors';
import { TEST } from './utils/env';
import { catchError } from './utils/errors';

export default async ({
  serviceName,
  basePath = '/api/v1',
  connectors = [],
  corsOptions = {},
  routes = [],
} = {}) => {
  const app = express();
  app.events = new events();

  app.use(bodyParser.json());
  app.use(cookieParser());

  app.use(cors({
    origin: true,
    credentials: true,
    ...corsOptions,
    allowedHeaders: [
      'Content-Type', 'Accept', 'Origin', 'Authorization', 'Cache-Control',
      'Token', 'Signature', 'Additional', 'Bundle-Identifier',
      'True-Referer', 'Platform',
      ...(corsOptions.allowedHeaders || []),
    ],
    exposedHeaders: [
      ...(corsOptions.exposedHeaders || []),
    ],
  }));

  await Promise.all(connectors.map(c => c(app)));

  const router = express.Router();

  app.use((req, res, next) => {
    console.log(colors.green(
      '[blinddeez.devserver] Requesting ' + req.originalUrl
    ));
    next();
  });

  Object.entries(routes).map(([route, options]) => {
    options = typeof options === 'function'
      ? { handle: options }
      : options;

    options.interceptors = options.interceptors || [];

    const [method, path] = route.split(' ');
    router.route(path)[method.toLowerCase()](
      [
        DefaultsInterceptor,
        ...options.interceptors.map(interceptor =>
          catchError(interceptor)
        ),
      ],
      catchError(options.handle)
    );

    return null;
  });

  router.route(`/${serviceName}/health`).get((req, res) => {
    res.send('OK');
  });

  router.route(`/${serviceName}/socket`).get((req, res) => {
    res.sendFile('socket-test.html', { root: __dirname });
  });

  router.use(ErrorsInterceptor);
  process.on('unhandledRejection', ErrorsInterceptor);

  app.use(basePath, router);

  const server = https.createServer({
    key: fs.readFileSync(path.resolve('./.dev/key.pem'), 'utf-8'),
    cert: fs.readFileSync(path.resolve('./.dev/cert.pem'), 'utf-8'),
  }, app);

  const io = Socket(server, app);

  app.start = ({ port } = {}) => new Promise(resolve => {
    server.on('close', () => app.emit('close'));

    server.stop = async () => {
      await Promise.all(connectors.map(c => c?.disconnect?.()));
      await new Promise(resolve => server.close(resolve));
    };

    server.listen(port, 'api.blinddeez.develop', () => {
      console.log(colors.cyan(
        `[blinddeez.${serviceName}] Running on ` +
        `https://api.blinddeez.develop:${port}`
      ));

      resolve({ app, server, port });
    });
  });

  return app;
};
