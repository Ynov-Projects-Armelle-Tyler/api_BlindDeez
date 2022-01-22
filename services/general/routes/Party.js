// import {
//   AuthInterceptor,
//   IdentityInterceptor,
// } from '@blinddeez/api-core/interceptors';

import * as Party from '../Party';

export default {

  'POST /general/party': {
    interceptors: [
      // AuthInterceptor(),
      // IdentityInterceptor,
    ],
    handle: Party.create,
  },

  'GET /general/party': {
    interceptors: [],
    handle: Party.getAll,
  },

  'GET /general/party/pending': {
    interceptors: [
      // AuthInterceptor(),
      // IdentityInterceptor,
    ],
    handle: Party.getAllPending,
  },

 'GET /general/party/pending/:musicLabel': {
   interceptors: [
     // AuthInterceptor(),
     // IdentityInterceptor,
   ],
   handle: Party.getPendingByMusicLabel,
 },

  'GET /general/party/:id': {
    interceptors: [
      // AuthInterceptor(),
      // IdentityInterceptor,
    ],
    handle: Party.get,
  },

  'DELETE /general/party/:id': {
    interceptors: [
      // AuthInterceptor(),
      // IdentityInterceptor,
    ],
    handle: Party.remove,
  },

  'PATCH /general/party/:id/name': {
    interceptors: [
      // AuthInterceptor(),
      // IdentityInterceptor,
    ],
    handle: Party.editName,
  },

  'PATCH /general/party/:id/public': {
    interceptors: [
      // AuthInterceptor(),
      // IdentityInterceptor,
    ],
    handle: Party.editPublic,
  },

  'PATCH /general/party/:id/player': {
    interceptors: [
      // AuthInterceptor(),
      // IdentityInterceptor,
    ],
    handle: Party.editPlayers,
  },

};
