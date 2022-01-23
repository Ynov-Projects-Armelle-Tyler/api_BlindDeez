import { Server } from 'socket.io';

import log from '../../utils/log';
import * as party from './party';

export default (httpsServer, app) => {
  const io = new Server(httpsServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connect', socket => {
    Object.values(party).forEach(func => func(socket));

    log('bgCyan', `[Socket] ${socket.id} Connected`);

    app.set('Socket', socket);
    app.set('Io', io);

    socket.on('disconnecting', () => {
      log('bgYellow', `[Socket] ${socket.id} Disconnecting`);
    });

    socket.on('disconnect', () => {
      log('bgGreen', `[Socket] ${socket.id} Disconnected`);
    });

    socket.on('connect_error', err => {
      log('bgRed', `[Socket] Error: ${err}`);
    });

    // Party
    socket.on('join_room_code', data => {
      socket.join(data.id);
      socket.to(data.id).emit('user_join_room', data.user);
    });

  });

  return io;
};
