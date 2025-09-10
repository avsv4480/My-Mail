// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBz0i_XGwTRFg3_gq_0lSButbslOfuUTBU",
  authDomain: "loginapp-1f9d7.firebaseapp.com",
  projectId: "loginapp-1f9d7",
  storageBucket: "loginapp-1f9d7.firebasestorage.app",
  messagingSenderId: "1080307360093",
  appId: "1:1080307360093:web:d438788a8b3de5bae888b4",
  measurementId: "G-RHCSP8F72M"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

function nextStep(stepId) {
  document.querySelectorAll('.step').forEach(step => step.style.display = 'none');
  document.getElementById(stepId).style.display = 'block';
}

function showWelcome() {
  const username = document.getElementById('username').value.trim();
  if (!username) {
    alert('Please enter your username.');
    return;
  }

  document.querySelectorAll('.step').forEach(step => step.style.display = 'none');
  const welcomeScreen = document.getElementById('welcomeScreen');
  const welcomeMessage = document.getElementById('welcomeMessage');
  welcomeMessage.innerText = `Welcome ${username}. Have fun with this game!`;

  welcomeScreen.style.display = 'block';
  welcomeScreen.style.backgroundColor = 'black';
  welcomeMessage.style.color = 'gold';
  welcomeMessage.style.fontSize = '24px';
}

function verifyEmail() {
  const email = document.getElementById('email').value.trim();
  if (!email) {
    alert('Please enter an email address.');
    return;
  }

  const tempPassword = Math.random().toString(36).slice(-8);

  // Sign up or sign in
  auth.createUserWithEmailAndPassword(email, tempPassword)
    .then(userCredential => {
      const user = userCredential.user;
      sendEmailVerification(user);
    })
    .catch(error => {
      if (error.code === 'auth/email-already-in-use') {
        auth.signInWithEmailAndPassword(email, tempPassword)
          .then(userCredential => {
            const user = userCredential.user;
            sendEmailVerification(user);
          })
          .catch(signInError => {
            alert('Email already registered. Please check your email for verification.');
            console.error(signInError);
          });
      } else {
        alert('Error: ' + error.message);
      }
    });
}

function sendEmailVerification(user) {
  user.sendEmailVerification()
    .then(() => {
      alert(`Verification email sent to ${user.email}. Please check your inbox or spam folder.`);
      auth.signOut();
      nextStep('verifiedScreen');
    })
    .catch(error => {
      console.error('Send Email Verification Error:', error);
      alert('Error sending verification email: ' + error.message);
    });
}

function verifyPhone() {
  const phoneNumber = document.getElementById('phoneNumber').value.trim();
  if (!phoneNumber) {
    alert('Please enter a valid phone number with country code.');
    return;
  }

  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'normal',
    callback: (response) => {
      console.log('reCAPTCHA solved:', response);
    },
    'expired-callback': () => {
      alert('reCAPTCHA expired. Please try again.');
    }
  });

  recaptchaVerifier.render().then(widgetId => {
    window.recaptchaWidgetId = widgetId;
  });

  auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
    .then(confirmationResult => {
      const otp = prompt('Enter the OTP sent to your phone:');
      if (!otp) {
        alert('OTP is required!');
        return;
      }

      confirmationResult.confirm(otp)
        .then(result => {
          alert('Phone number verified!');
          nextStep('verifiedScreen');
        })
        .catch(error => {
          alert('OTP verification failed: ' + error.message);
          console.error(error);
        });
    })
    .catch(error => {
      alert('Error sending OTP: ' + error.message);
      console.error(error);
    });
}
