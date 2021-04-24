let Webrtc = (function () {
  const iceConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  let mySocketId = null;
  let localVideoPlayer = null;
  let serverFunction = null;
  let peerConnections = [];
  let peerConnectionIds = [];
  let remoteVideoStreams = [];
  let remoteAudioStreams = [];
  let rtpVideoSenders = [];
  let screenShare = false;
  let videoCamSSTrack;

  async function init(server_function, my_socket_id) {
    mySocketId = my_socket_id;
    serverFunction = server_function;
    localVideoPlayer = document.getElementById('localVideoCtr');
    eventBinding();
  }

  function eventBinding() {
    document
      .querySelector('#btn-screenshare')
      .addEventListener('click', async function () {
        if (screenShare == true) {
          document.querySelector('#btn-screenshare').textContent =
            'Screen Share';
          screenShare = false;
          videoCamSSTrack.stop();
          videoCamSSTrack = null;
          localVideoPlayer.srcObject = null;
          RemoveAudioVideoSenders(rtpVideoSenders);
          return;
        }
        try {
          document.querySelector('#btn-screenshare').textContent =
            'Stop Screen Share';
          screenShare = true;
          let vstream = null;
          vstream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              width: 720,
              height: 480,
            },
            audio: false,
          });
          if (vstream.getVideoTracks().length > 0) {
            videoCamSSTrack = vstream.getVideoTracks()[0];
            localVideoPlayer.srcObject = new MediaStream([videoCamSSTrack]);
            AddUpdateAudioVideoSenders(videoCamSSTrack, rtpVideoSenders);
          }
        } catch (e) {
          console.log(e);
          return;
        }
      });
  }

  async function RemoveAudioVideoSenders(rtpSenders) {
    for (let id in peerConnectionIds) {
      if (rtpSenders[id] && IsConnectionAvailable(peerConnections[id])) {
        console.log('69 - rtpSenders[id]: ', rtpSenders[id]);
        console.log('70 - peerConnections[id]: ', peerConnections[id]);
        peerConnections[id].removeTrack(rtpSenders[id]);
        console.log('72 - rtpSenders[id]: ', rtpSenders[id]);
        rtpSenders[id] = null;
        console.log('74 - rtpSenders[id]: ', rtpSenders[id]);
      }
    }
  }

  async function AddUpdateAudioVideoSenders(track, rtpSenders) {
    for (let con_id in peerConnectionIds) {
      if (IsConnectionAvailable(peerConnections[con_id])) {
        if (rtpSenders[con_id] && rtpSenders[con_id].track) {
          rtpSenders[con_id].replaceTrack(track);
        } else {
          rtpSenders[con_id] = peerConnections[con_id].addTrack(track);
        }
      }
    }
  }

  async function createConnection(socket_id) {
    let connection = new RTCPeerConnection(iceConfiguration);
    connection.onicecandidate = function (event) {
      if (event.candidate) {
        serverFunction(
          JSON.stringify({ iceCandidate: event.candidate }),
          socket_id
        );
      }
    };
    connection.onnegotiationneeded = async function (event) {
      await createOffer(socket_id);
    };

    connection.ontrack = function (event) {
      if (!remoteVideoStreams[socket_id]) {
        remoteVideoStreams[socket_id] = new MediaStream();
      }

      if (!remoteAudioStreams[socket_id])
        remoteAudioStreams[socket_id] = new MediaStream();

      if (event.track.kind == 'video') {
        remoteVideoStreams[socket_id]
          .getVideoTracks()
          .forEach((t) => remoteVideoStreams[socket_id].removeTrack(t));
        remoteVideoStreams[socket_id].addTrack(event.track);

        let remoteVideoPlayer = document.getElementById('v_' + socket_id);
        remoteVideoPlayer.srcObject = null;
        remoteVideoPlayer.srcObject = remoteVideoStreams[socket_id];
        remoteVideoPlayer.load();
      } else if (event.track.kind == 'audio') {
        let remoteAudioPlayer = document.getElementById('a_' + socket_id);
        remoteAudioStreams[socket_id]
          .getVideoTracks()
          .forEach((t) => _remoteAudioStreams[socket_id].removeTrack(t));
        remoteAudioStreams[socket_id].addTrack(event.track);
        remoteAudioPlayer.srcObject = null;
        remoteAudioPlayer.srcObject = remoteAudioStreams[socket_id];
        remoteAudioPlayer.load();
      }
    };

    peerConnectionIds[socket_id] = socket_id;
    peerConnections[socket_id] = connection;

    if (screenShare) {
      if (videoCamSSTrack) {
        AddUpdateAudioVideoSenders(videoCamSSTrack, rtpVideoSenders);
      }
    }

    return connection;
  }

  async function createOffer(socket_id) {
    let connection = peerConnections[socket_id];
    let offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
    serverFunction(
      JSON.stringify({ offer: connection.localDescription }),
      socket_id
    );
  }

  async function exchangeSDP(message, socket_id) {
    message = JSON.parse(message);
    if (message.answer) {
      await peerConnections[socket_id].setRemoteDescription(
        new RTCSessionDescription(message.answer)
      );
    } else if (message.offer) {
      if (!peerConnections[socket_id]) {
        await createConnection(socket_id);
      }
      await peerConnections[socket_id].setRemoteDescription(
        new RTCSessionDescription(message.offer)
      );
      let answer = await peerConnections[socket_id].createAnswer();
      await peerConnections[socket_id].setLocalDescription(answer);
      serverFunction(JSON.stringify({ answer: answer }), socket_id, mySocketId);
    } else if (message.iceCandidate) {
      if (!peerConnections[socket_id]) {
        await createConnection(socket_id);
      }
      try {
        await peerConnections[socket_id].addIceCandidate(message.iceCandidate);
      } catch (e) {
        console.log(e);
      }
    }
  }

  function IsConnectionAvailable(connection) {
    if (
      connection &&
      (connection.connectionState == 'new' ||
        connection.connectionState == 'connecting' ||
        connection.connectionState == 'connected')
    ) {
      return true;
    } else return false;
  }

  function closeConnection(socket_id) {
    peerConnectionIds[socket_id] = null;

    if (peerConnections[socket_id]) {
      peerConnections[socket_id].close();
      peerConnections[socket_id] = null;
    }
    if (_remoteAudioStreams[socket_id]) {
      _remoteAudioStreams[socket_id].getTracks().forEach((t) => {
        if (t.stop) t.stop();
      });
      remoteAudioStreams[socket_id] = null;
    }

    if (remoteVideoStreams[socket_id]) {
      remoteVideoStreams[socket_id].getTracks().forEach((t) => {
        if (t.stop) t.stop();
      });
      remoteVideoStreams[socket_id] = null;
    }
  }

  return {
    init: async function (server_function, my_socket_id) {
      await init(server_function, my_socket_id);
    },
    ExecuteClientFunction: async function (data, socket_id) {
      await exchangeSDP(data, socket_id);
    },
    createNewConnection: async function (socket_id) {
      await createConnection(socket_id);
    },
    closeExistingConnection: function (socket_id) {
      closeConnection(socket_id);
    },
  };
})();
