const signOut = document.querySelector('.sign-out');
const roomLink = document.querySelector('.room-link');
const roomNameBox = document.querySelector('.room-name');
const roomContainer = document.querySelector('.room-container');
const joinRoomContainer = document.querySelector('.join-room-container');
const googleSignIn = document.querySelector('.google-signin');
const roomsList = document.querySelector('.room-list');
const leaveRoom = document.querySelector('.leave-room');
const loginContainer = document.querySelector('.login-container');
let user = null;
let userName = null;
let roomId = null;
let roomLinkInfo = null;

/* match /rooms/{roomsId} {
  allow read, write: if request.auth.uid !=null;
} */

// create copy input
function copyRoomUrl(roomUrl) {
  let copyRoomId = document.createElement('input');
  copyRoomId.setAttribute('value', roomUrl);
  document.body.appendChild(copyRoomId);
  copyRoomId.select();
  document.execCommand('copy');
  copyRoomId.parentNode.removeChild(copyRoomId);
}

// bind room url function
function bindRoomURL(roomUrl) {
  document.querySelector('.copy-link-btn').addEventListener('click', () => {
    copyRoomUrl(roomUrl);
  });
}

// join room
document.querySelector('.join-room-btn').addEventListener('click', async () => {
  roomUrl = window.prompt('Enter room link');
  window.history.pushState({}, userName, roomUrl);
  joinRoomContainer.style.display = 'none';
  roomContainer.style.display = 'block';
  const urlParams = new URLSearchParams(window.location.search);
  let roomId = urlParams.get('roomid');
  Socket.init(user.displayName, roomId);
  let roomName = '';
  await db
    .collection('rooms')
    .doc(roomId)
    .get()
    .then((snapshot) => {
      roomName = snapshot.data().roomname;
      roomNameBox.textContent = `RoomName : ${roomName}`;
      if (snapshot.data().creator !== user.uid) {
        db.collection('users')
          .doc(user.uid)
          .collection('usersRooms')
          .doc(roomId)
          .set({ roomname: roomName });
      }
      bindRoomURL(roomUrl);
    });
});

// create room
document
  .querySelector('.create-room-btn')
  .addEventListener('click', async () => {
    roomname = window.prompt('Enter room name');
    if (roomname !== '' && roomname !== null && roomname !== undefined) {
      await db
        .collection('rooms')
        .add({ roomname: roomname, creator: user.uid })
        .then(function (docRef) {
          db.collection('users')
            .doc(user.uid)
            .collection('usersRooms')
            .doc(docRef.id)
            .set({ roomname: roomname, creator: true });
        });
    }
    window.location.replace(window.location.origin);
  });

// leave room
document.querySelector('.leave-room-btn').addEventListener('click', () => {
  window.location.replace(window.location.origin);
  /* window.history.pushState({}, userName, window.location.origin);
  roomContainer.style.display = 'none';
  joinRoomContainer.style.display = 'block'; */
});

function buttonBindings() {
  // enter button
  const enterBtn = document.querySelectorAll('button.enter-btn');
  enterBtn.forEach((node) => {
    node.addEventListener('click', () => {
      let roomId = node.parentNode.getAttribute('roomid');
      let roomName = node.parentNode.children[0].innerText;
      let roomUrl = `${window.location.origin}?roomid=${roomId}`;
      joinRoomContainer.style.display = 'none';
      roomContainer.style.display = 'block';
      Socket.init(user.displayName, roomId);
      roomNameBox.textContent = `RoomName : ${roomName}`;
      window.history.pushState({}, userName, roomUrl);
      bindRoomURL(roomUrl);
    });
  });

  // copy link button
  document.querySelectorAll('button.link-btn').forEach((node) => {
    node.addEventListener('click', () => {
      let roomId = node.parentNode.getAttribute('roomid');
      let roomUrl = `${window.location.origin}?roomid=${roomId}`;
      // copy link
      copyRoomUrl(roomUrl);
      /* let copyRoomId = document.createElement('input');
      copyRoomId.setAttribute('value', roomUrl);
      document.body.appendChild(copyRoomId);
      copyRoomId.select();
      document.execCommand('copy');
      copyRoomId.parentNode.removeChild(copyRoomId); */
    });
  });

  // remove button
  document.querySelectorAll('button.remove-btn').forEach((node) => {
    node.addEventListener('click', () => {
      let roomId = node.parentNode.getAttribute('roomid');
      //db.collection('rooms').doc(roomId).delete();
      db.collection('users')
        .doc(user.uid)
        .collection('usersRooms')
        .doc(roomId)
        .delete();
      node.parentNode.style.display = 'none';
    });
  });

  // delete button
  document.querySelectorAll('button.delete-btn').forEach((node) => {
    node.addEventListener('click', () => {
      let roomId = node.parentNode.getAttribute('roomid');
      db.collection('rooms').doc(roomId).delete();
      db.collection('users')
        .doc(user.uid)
        .collection('usersRooms')
        .doc(roomId)
        .delete();
      node.parentNode.style.display = 'none';
    });
  });
}

//Sign in with google
const googleLogin = async (provider) => {
  const { additionalUserInfo, user } = await auth.signInWithPopup(provider);
  if (additionalUserInfo.isNewUser) {
    db.collection('users').doc(user.uid).set({ uid: user.uid });
  }
};
googleSignIn.addEventListener('click', () => {
  googleLogin(new firebase.auth.GoogleAuthProvider());
});

// sign out
signOut.addEventListener('click', () => {
  auth.signOut();
  roomsList.innerHTML = null;
  roomContainer.style.display = 'none';
  joinRoomContainer.style.display = 'none';
  googleSignIn.style.display = 'flex';
  window.history.pushState({}, userName, window.location.origin);
});

// auth listener
auth.onAuthStateChanged((_user) => {
  if (_user) {
    user = _user;
    getUserRooms(user);
    setTimeout(() => {
      joinRoomContainer.style.display = 'block';
    }, 500);

    loginContainer.style.display = 'none';
    googleSignIn.style.display = 'none';
    signOut.style.display = 'inline-block';
  } else {
    signOut.style.display = 'none';
    loginContainer.style.display = 'flex';
    googleSignIn.style.display = 'block';
  }
});

// get user rooms
async function getUserRooms(user) {
  function storeRooms(doc) {
    let li = document.createElement('li');
    li.classList.add('room');
    li.setAttribute('roomid', doc.id);
    if (doc.data().creator == true) {
      li.innerHTML = `
      <div class="room-list-name">${doc.data().roomname}</div>
      <button class="enter-btn room-btn s-btn">Enter Room</button>
      <button class="link-btn room-btn s-btn">Copy Link</button>
      <button class="delete-btn room-btn s-btn">Delete</button>
      `;
      roomsList.appendChild(li);
    } else {
      li.innerHTML = `
      <div class="room-list-name">${doc.data().roomname}</div>
      <button class="enter-btn room-btn s-btn">Enter Room</button>
      <button class="link-btn room-btn s-btn">Copy Link</button>
      <button class="remove-btn room-btn s-btn">Remove</button>
      `;
      roomsList.appendChild(li);
    }
  }
  await db
    .collection('users')
    .doc(user.uid)
    .collection('usersRooms')
    .get()
    .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        storeRooms(doc);
      });
    });
  buttonBindings();
}
