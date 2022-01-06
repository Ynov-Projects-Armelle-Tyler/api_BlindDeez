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

  'PATCH /general/server/:id': {
    interceptors: [
      AuthInterceptor(),
      IdentityInterceptor,
    ],
    handle: Server.update,
  },

  'PATCH /general/server/:id/add': {
    interceptors: [
      AuthInterceptor(),
      IdentityInterceptor,
    ],
    handle: Server.addUser,
  },

  'PATCH /general/server/:id/remove': {
    interceptors: [
      AuthInterceptor(),
      IdentityInterceptor,
    ],
    handle: Server.removeUser,
  },

  'DELETE /general/server/:id': {
    interceptors: [
      AuthInterceptor(),
      IdentityInterceptor,
    ],
    handle: Server.remove,
  },
};
