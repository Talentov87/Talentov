const firebaseConfig = {
    apiKey: "AIzaSyDCwDrArna6cXZuFBXng3WlAzHnY9tQXz4",
    authDomain: "talentov-jay.firebaseapp.com",
    databaseURL: "https://talentov-jay-default-rtdb.firebaseio.com",
    projectId: "talentov-jay",
    storageBucket: "talentov-jay.appspot.com",
    messagingSenderId: "592991638011",
    appId: "1:592991638011:web:c8ce409ed9bf70c4d4bb5e"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const rdb = firebase.database();

// function listenerNotifications(UID,callBack){
//     var ref = rdb.ref("Notification/"+UID);
//     ref.on("child_added", function(snapshot) {
//         var childData = snapshot.val();
//         callBack(snapshot,childData);
//         ref.child(childData.mid).remove();
//     });
// }

