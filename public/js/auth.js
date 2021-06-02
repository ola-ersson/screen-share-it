/*const switchLink = document.querySelectorAll('.switch');
const authModal = document.querySelectorAll('.auth-modal');
const authWrapper = document.querySelector('.auth-wrapper');
const registerForm = document.querySelector('.register');
const loginForm = document.querySelector('.login');
const signIn = document.querySelector('.sign-in');
const signOut = document.querySelector('.sign-out');
const cancelFormBtn = document.querySelectorAll('.cancel-btn');

const googleSignIn = document.querySelector('.google-signin');

let userName = '';

 // toggle modals
switchLink.forEach((link) => {
  link.addEventListener('click', () => {
    authModal.forEach((modal) => modal.classList.toggle('active'));
  });
});
 */
//Sign in with google

/* const googleLogin = async (provider) =>{
    const {additionalUserInfo, user} = await auth.signInWithPopup(provider);

    if(additionalUserInfo.isNewUser) {
      db.collection('users').doc(user.uid).set({uid: user.uid})
    }

    appInit(user.uid);
    
}
googleSignIn.addEventListener('click', () => {googleLogin(new firebase.auth.GoogleAuthProvider())});

 */




/* // sign in
signIn.addEventListener('click', () => {
  authWrapper.classList.add('open');
  authModal[0].classList.add('active');
});

// sign out
signOut.addEventListener('click', () => {
  firebase.auth().signOut();
});

// register form
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = registerForm.email.value;
  const password = registerForm.password.value;
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((user) => {
      registerForm.reset();
    })
    .catch((error) => {
      registerForm.querySelector('.error').textContent = error.message;
    });
});

// login form
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = loginForm.email.value;
  const password = loginForm.password.value;
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((user) => {
      loginForm.reset();
    })
    .catch((error) => {
      loginForm.querySelector('.error').textContent = error.message;
    });
});

// cancel form
cancelFormBtn.forEach((button) => {
  button.addEventListener('click', () => {
    authWrapper.classList.remove('open');
    authModal.forEach((modal) => modal.classList.remove('active'));
  });
});

// auth listener
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    authWrapper.classList.remove('open');
    authModal.forEach((modal) => modal.classList.remove('active'));
    signIn.style.display = 'none';
    signOut.style.display = 'inline-block';
    userName = user.email;
    console.log(user.email, 'signed in.');
  } else {
    signIn.style.display = 'inline-block';
    signOut.style.display = 'none';
    console.log(userName, 'signed out.');
  }
});
 */