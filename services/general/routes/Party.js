import {
  AuthInterceptor,
  IdentityInterceptor,
} from '@blinddeez/api-core/interceptors';

import * as Party from '../Party';

export default {

  'POST /general/party': {
    interceptors: [
      AuthInterceptor(),
      IdentityInterceptor,
    ],
    handle: Party.create,
  },

  'GET /general/party': {
    interceptors: [],
    handle: Party.getAll,
  },

  'GET /general/party/:id': {
    interceptors: [
      AuthInterceptor(),
      IdentityInterceptor,
    ],
    handle: Party.get,
  },

  'DELETE /general/party/:id': {
    interceptors: [
      AuthInterceptor(),
      IdentityInterceptor,
    ],
    handle: Party.remove,
  },
};
