import { Server } from 'socket.io';

import log from '../../utils/log';
import * as party from './party';
import { Party } from '../../models';

export default (httpsServer, app) => {
  const io = new Server(httpsServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connect', socket => {
    // by default
    socket.blinddeez = undefined;

    log('bgCyan', `[Socket] ${socket.id} Connected`);

    app.set('Socket', socket);
    app.set('Io', io);

    socket.on('disconnecting', () => {
      log('bgYellow', `[Socket] ${socket.id} Disconnecting`);
    });

    socket.on('disconnect', async () => {
      log('bgGreen', `[Socket] ${socket.id} Disconnected`);

      if (socket.blinddeez?.id) {
        const party = await Party.findOne({ _id: socket.blinddeez.id });
        party.users = party.users.filter(u =>
          u.username !== socket.blinddeez.user.username);
        await party.save();

        socket.to(socket.blinddeez.id)
          .emit('user_leave_room', socket.blinddeez.user);
      }
    });

    socket.on('connect_error', err => {
      log('bgRed', `[Socket] Error: ${err}`);
    });

    // Party
    socket.on('join_room_code', data => {
      socket.blinddeez = data;
      socket.join(data.id);
      socket.to(data.id).emit('user_join_room', data.user);
    });

    socket.on('user_leave_room', async () => {
      if (socket.blinddeez?.id) {
        const party = await Party.findOne({ _id: socket.blinddeez.id });
        party.users = party.users.filter(u =>
          u.username !== socket.blinddeez.user.username);
        await party.save();

        socket.to(socket.blinddeez.id)
          .emit('user_leave_room', {
            socketId: socket.id,
            user: socket.blinddeez.user,
          });
      }
    });

  });

  return io;
};
