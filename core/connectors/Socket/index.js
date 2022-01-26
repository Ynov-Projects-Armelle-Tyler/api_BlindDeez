import { Server } from 'socket.io';

import log from '../../utils/log';
import { sleep } from '../../utils/helpers';
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

    socket.on('edit_party_visibility', data => {
      socket.to(data.id).emit('edit_party_visibility');
    });

    socket.on('master_launch_game', data => {
      io.to(data.id).emit('master_launch_game');
    });

    // On Game

    socket.on('party_loaded', data => {
      io.to(data.id).emit('start_party');
    });

    socket.on('player_trying', data => {
      io.to(data.id).emit('player_trying', data);
    });

    socket.on('player_not_found', data => {
      io.to(data.id).emit('player_not_found', data);
    });

    socket.on('player_found', async data => {
      io.to(data.id).emit('player_found', data);
      await sleep(500);
      io.to(data.id).emit('next_track', data);
    });

    socket.on('next_track', data => {
      io.to(data.id).emit('next_track', data);
    });

    socket.on('end_of_party', data => {
      io.to(data.id).emit('end_of_party', data);
    });

  });

  return io;
};
