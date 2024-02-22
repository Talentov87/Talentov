const firebaseConfig = {
    apiKey: "AIzaSyCBHid3ZwrXGqBIjUfa4BcuhhqdAm9LoIs",
    authDomain: "global-chat-connect.firebaseapp.com",
    databaseURL: "https://global-chat-connect-default-rtdb.firebaseio.com",
    projectId: "global-chat-connect",
    storageBucket: "global-chat-connect.appspot.com",
    messagingSenderId: "331687908959",
    appId: "1:331687908959:web:b37b331480a2cc8366edea"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const rdb = firebase.database();

function listenerNotifications(UID,callBack){
    var ref = rdb.ref("Notification/"+UID);
    ref.on("child_added", function(snapshot) {
        var childData = snapshot.val();
        callBack(snapshot,childData);
        ref.child(childData.mid).remove();
    });
}

firebase.auth().onAuthStateChanged(function(loggedIN) {
    if (loggedIN) {
        // console.log("Logged In As " + getUser().Email);
    } else {
        // console.log("Logged Out");
    }
});

// Function to handle Google sign-in
function signInGoogle(onsuccess) {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' }); // Add this line
    firebase.auth().signInWithPopup(provider)
        .then(function(result) {
            // User signed in with Google
            Login(result.user);
            console.log("Login Success");
            onsuccess();
        })
        .catch(function(error) {
            // Handle errors
            console.error(error);
        });
}

// Function to handle sign out
function signOut(on_sign_out,on_error) {
    firebase.auth().signOut()
        .then(function() {
            // Sign-out successful
            on_sign_out();
        })
        .catch(function(error) {
            // An error happened
            on_error(error);
        });
}