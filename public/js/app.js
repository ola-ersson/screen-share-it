function appInit() {
  const urlParams = new URLSearchParams(window.location.search);
  var roomId = urlParams.get('roomid');
  let roomLink = document.querySelector('.room-link');
  var roomContainer = document.querySelector('.room-container');
  var roomBox = document.querySelector('.room-box');

  if (!roomId) {
    var roomUrl = window.location.origin + '?roomid=' + new Date().getTime();
    roomLink.setAttribute('href', roomUrl);
    //roomLink.textContent = roomUrl;
    roomContainer.style.display = 'none';
    roomBox.style.display = 'block';
    return;
  }

  var userId = urlParams.get('userid');
  if (!userId) {
    userId = window.prompt('Enter your nick!');
  }

  if (!userId || !roomId) {
    alert('Nickname or roomid missing!');
    return;
  }
  roomContainer.style.display = 'block';
  roomBox.style.display = 'none';
  Socket.init(userId, roomId);
}
appInit();
