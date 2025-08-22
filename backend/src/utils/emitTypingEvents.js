export const registerTypingEvents = (socket) => {
  const userId = socket.user?.userId;

  // typing start
  socket.on('typing', ({ chatId }) => {
    socket.to(chatId).emit('typing', { userId, chatId });
  });

  // typing stop
  socket.on('stopTyping', ({ chatId }) => {
    socket.to(chatId).emit('stopTyping', { userId, chatId });
  });
};
