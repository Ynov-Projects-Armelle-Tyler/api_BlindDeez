import { Server } from '@blinddeez/api-core';

import {
  MongoDB,
  Sendgrid,
} from '@blinddeez/api-core/connectors';

import routes from './routes';

export default async ({ port } = {}) => {
  const app = await Server({
    serviceName: 'general',
    basePath: '/api/v1',
    connectors: [
      MongoDB,
      Sendgrid,
    ],
    routes: { ...routes },
  });

  port = __DEV__ ? 8001 : port;

  return app.start({ port });
};
