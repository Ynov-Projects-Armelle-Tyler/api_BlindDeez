export const demo = socket => {
  socket.on('key', arg => {
    socket.emit('key', `recevied ${arg} !!!`);
  });
};
