import { Server } from '@blinddeez/api-core';

import {
  MongoDB,
  Sendgrid,
  Brute,
} from '@blinddeez/api-core/connectors';

import routes from './routes';

export default async ({ port, io } = {}) => {
  const app = await Server({
    serviceName: 'general',
    basePath: '/api/v1',
    connectors: [
      MongoDB,
      Sendgrid,
      Brute,
    ],
    routes: { ...routes },
  });

  app.set('Io', io);

  port = __DEV__ ? 8001 : port;

  return app.start({ port });
};
