let Socket = (function () {
  let socket = null;
  const socker_url = 'https://screen-share-it.herokuapp.com/';
  /* const socker_url = 'http://localhost:3000/'; */
  let roomId = null;
  let userName = null;

  function init(user_name, room_id) {
    userName = user_name;
    roomId = room_id;
    let roomName = document.querySelector('.room-name');
    roomName.textContent = `Room id: ${room_id}`;
    document.title = `SSI ${user_name}`;
    SignalServerEventBinding();
    EventBinding();
  }

  function SignalServerEventBinding() {
    socket = io.connect(socker_url);
    const serverFunction = function (data, socket_id) {
      socket.emit('exchangeSDP', { message: data, socketId: socket_id });
    };

    socket.on('connect', () => {
      if (socket.connected) {
        Webrtc.init(serverFunction, socket.id);
        if (userName != null && roomId != null) {
          socket.emit('userconnect', {
            userName: userName,
            roomId: roomId,
          });
        }
      }
    });

    socket.on('exchangeSDP', async function (data) {
      await Webrtc.ExecuteClientFunction(data.message, data.socketId);
    });

    socket.on('informAboutNewConnection', function (data) {
      AddNewUser(data.userName, data.socketId);
      Webrtc.createNewConnection(data.socketId);
    });

    socket.on('informAboutConnectionEnd', function (socket_id) {
      console.log('information about connection end: ', socket_id);
      document.querySelector(`#${socket_id}`).remove();
      Webrtc.closeExistingConnection(socket_id);
    });

    socket.on('userconnected', function (other_users) {
      if (other_users) {
        for (let i = 0; i < other_users.length; i++) {
          AddNewUser(other_users[i].userName, other_users[i].socketId);
          Webrtc.createNewConnection(other_users[i].socketId);
        }
      }
      document.querySelector('.tool-box').style.display = 'block';
      document.querySelector('#users').style.display = 'block';
    });
  }

  function EventBinding() {
    document
      .querySelector('#localVideoCtr')
      .addEventListener('dblclick', (element) => {
        document.querySelector('#localVideoCtr').requestFullscreen();
      });
  }

  function AddNewUser(user_name, socket_id) {
    const videoModal = document
      .querySelector('#other-template')
      .cloneNode(true);
    videoModal.id = socket_id;
    videoModal.classList.add('other');
    videoModal.querySelector('h2').textContent = user_name;
    videoModal.querySelector('video').id = `v_${socket_id}`;
    videoModal.style.display = 'block';
    document.querySelector('#users').append(videoModal);
  }

  return {
    init: function (user_name, room_id) {
      init(user_name, room_id);
    },
  };
})();
