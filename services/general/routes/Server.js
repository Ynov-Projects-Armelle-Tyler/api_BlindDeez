import {
  AuthInterceptor,
  IdentityInterceptor,
} from '@blinddeez/api-core/interceptors';

import * as Server from '../Server';

export default {

  'POST /general/server': {
    interceptors: [
      AuthInterceptor(),
      IdentityInterceptor,
    ],
    handle: Server.create,
  },

  'GET /general/server': {
    interceptors: [],
    handle: Server.getAll,
  },

  'GET /general/server/:id': {
    interceptors: [
      AuthInterceptor(),
      IdentityInterceptor,
    ],
    handle: Server.get,
  },

  'PUT /general/server/:id': {
    interceptors: [
      AuthInterceptor(),
      IdentityInterceptor,
    ],
    handle: Server.update,
  },

  'PATCH /general/server/:id': {
    interceptors: [
      AuthInterceptor(),
      IdentityInterceptor,
    ],
    handle: Server.update,
  },

  'DELETE /general/server/:id': {
    interceptors: [
      AuthInterceptor(),
      IdentityInterceptor,
    ],
    handle: Server.remove,
  },
};
