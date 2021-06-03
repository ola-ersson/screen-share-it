const signOut = document.querySelector('.sign-out');

const roomLink = document.querySelector('.room-link');
const roomContainer = document.querySelector('.room-container');
const roomBox = document.querySelector('.room-box');

const googleSignIn = document.querySelector('.google-signin');
/* let userName = ''; */

//Sign in with google
const googleLogin = async (provider) => {
  const { additionalUserInfo, user } = await auth.signInWithPopup(provider);

  if (additionalUserInfo.isNewUser) {
    db.collection('users').doc(user.uid).set({ uid: user.uid });
  }
  getUserRooms(user);
};

googleSignIn.addEventListener('click', () => {
  googleLogin(new firebase.auth.GoogleAuthProvider());
});



// sign out
signOut.addEventListener('click', () => {
  auth.signOut();
  roomContainer.style.display = 'none';
  roomBox.style.display = 'none';
});

// auth listener
auth.onAuthStateChanged((user) => {
  if (user) {
    getUserRooms(user);
    appInit(user);
    googleSignIn.style.display = 'none';
    signOut.style.display = 'inline-block';
    console.log(user.email, 'signed in.');
  } else {
    signOut.style.display = 'none';
    googleSignIn.style.display = 'inline-block';
  }
});

function getUserRooms(user) {
  const roomsList = document.querySelector('.room-list');

  function storeRooms(doc) {
    let li = document.createElement('li');
    let room = document.createElement('span');
    
    li.setAttribute('data-id', doc.id);
    li.textContent = doc.data().roomid;

    roomsList.appendChild(li);
  }

  db.collection('users')
  .doc(user.uid)
  .collection('usersRooms')
  .get().then((snapshot) => {
  snapshot.docs.forEach(doc => {
    storeRooms(doc);
    console.log('hello');
    /* let userRooms = doc.data();
    console.log(userRooms); */
    });
  });
}

function appInit(user) {
  const urlParams = new URLSearchParams(window.location.search);
  let roomId = urlParams.get('roomid');

  if (!roomId) {
    var roomUrl = window.location.origin + '?roomid=' + new Date().getTime();

    roomLink.setAttribute('href', roomUrl);
    //roomLink.textContent = roomUrl;
    roomContainer.style.display = 'none';
    roomBox.style.display = 'block';
    return;
  }

  if (roomId) {
    db.collection('users')
      .doc(user.uid)
      .collection('usersRooms')
      .doc(roomId)
      .set({ roomid: roomId });
  }

  /* var userId = urlParams.get("userid");
  if (!userId) {
    userId = window.prompt("Enter your nick!");
  } 
  if (!userId || !roomId) {
    alert("Nickname or roomid missing!");
    return;
  } */

  roomContainer.style.display = 'block';
  roomBox.style.display = 'none';
  Socket.init(user.email, roomId);

  /* userId = null;
roomId = null;
document
  .querySelector('#create-roomBtn')
  .addEventListener('click', () => createRoomName());
function createRoomName() {
  roomId = window.prompt('Enter room name');
  userId = window.prompt('Enter user name');
  Socket.init(userId, roomId);
} */
}
