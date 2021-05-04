let userId = '';
let roomId = '';
function appInit() {
  /*   const urlParams = new URLSearchParams(window.location.search);
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


userId = null;
roomId = null;
document
  .querySelector('#create-roomBtn')
  .addEventListener('click', () => createRoomName());
function createRoomName() {
  roomId = window.prompt('Enter room name');
  userId = window.prompt('Enter user name');
  Socket.init(userId, roomId);
} */

  let userName = document.querySelector('#set-user-name');
  let password = document.querySelector('#set-room-password');
  let connectBtn = document.querySelector('#connect-btn');
  let roomContainer = document.querySelector('.room-container');
  let roomBox = document.querySelector('.room-box');

  userName.addEventListener('click', () => {
    userId = window.prompt('Enter Name..');
    userName.textContent = `Username: ${userId}`;
    showEnterRoom();
  });
  password.addEventListener('click', () => {
    roomId = window.prompt('Enter Password..');
    password.textContent = `Password: ${roomId}`;
    showEnterRoom();
  });
  function showEnterRoom() {
    if (!userId == '' && !roomId == '') {
      connectBtn.style.display = 'block';
    }
  }
  connectBtn.addEventListener('click', () => {
    roomContainer.style.display = 'block';
    roomBox.style.display = 'none';
    Socket.init(userId, roomId);
  });
}

appInit();
