const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const port = process.env.PORT || 3000;
server = app.listen(port);
const io = require('socket.io')(server);
let userConnections = [];

app.get('/', (req, res) => {
  res.send(`Node Signal Server runing on port ${port}`);
});

io.on('connection', (socket) => {
  socket.on('userconnect', (data) => {
    let otherUsers = userConnections.filter(
      (user) => user.roomId == data.roomId
    );
    userConnections.push({
      socketId: socket.id,
      userName: data.userName,
      roomId: data.roomId,
    });
    otherUsers.forEach((user) => {
      socket.to(user.socketId).emit('informAboutNewConnection', {
        userName: data.userName,
        socketId: socket.id,
      });
    });

    socket.emit('userconnected', otherUsers);
  }); //end of userconnect

  socket.on('exchangeSDP', (data) => {
    socket
      .to(data.socketId)
      .emit('exchangeSDP', { message: data.message, socketId: socket.id });
  }); //end of exchangeSDP

  socket.on('stopedScreenShareForRemote', (data) => {
    let otherUsers = userConnections.filter(
      (user) => user.roomId == data.roomId
    );
    otherUsers.forEach((user) => {
      socket.to(user.socketId).emit('informAboutStopedScreenShare', {
        socketId: data.socketId,
        screenShareStatus: data.screenShareStatus,
      });
    });
  });

  socket.on('disconnect', function () {
    console.log('disconnect');
    let userObj = userConnections.find((user) => user.socketId == socket.id);
    if (userObj) {
      let roomId = userObj.roomId;

      userConnections = userConnections.filter(
        (user) => user.socketId != socket.id
      );
      let list = userConnections.filter((user) => user.roomId == roomId);

      list.forEach((userInRoom) => {
        socket
          .to(userInRoom.socketId)
          .emit('informAboutConnectionEnd', socket.id);
      });
    }
  });
});
