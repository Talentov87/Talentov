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



async function fetchAWS(path,body) {
    const url = DB_URL+"/"+path;
    const headers = {
        'X-Encrypted-Key': 'gAkhJbEBXzR5CVj2rngd9S1kL+FFAGeAGvkmbIx1CUpvshOXceq80P58/qAKAajz',
        'Content-Type': 'application/json'
    };
    var response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
    });
    return await response.text();
}
