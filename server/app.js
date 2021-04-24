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
    var otherUsers = userConnections.filter(
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

  socket.on('disconnect', function () {
    var userObj = userConnections.find((p) => p.connectionId == socket.id);
    if (userObj) {
      var meetingId = userObj.meeting_id;

      userConnections = userConnections.filter(
        (p) => p.connectionId != socket.id
      );
      var list = userConnections.filter((p) => p.meeting_id == meetingId);

      list.forEach((v) => {
        socket.to(v.connectionId).emit('informAboutConnectionEnd', socket.id);
      });
    }
  });
});
