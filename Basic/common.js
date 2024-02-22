
function id(val) {
    return document.getElementById(val);
}

function get(id,qry) {
    return document.querySelector('#' + id + ">" + qry);
}

function hs(eid,val){
    if(val == 0){
        hide(eid);
    } else {
        show(eid);
    }
}

function hide(eid) {
    style(eid,"display","none");
}

function show(eid) {
    style(eid,"display","block");
}

function style(eid,ele,value) {
    id(eid).style[ele] = value;
}

function animateValue(start, end, duration, onUpdate, onComplete) {
    let startTime;

    function update(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = start + (end - start) * progress;

        onUpdate(value);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            if (onComplete) onComplete();
        }
    }

    requestAnimationFrame(update);
}

// // Example usage:
// const startValue = 0;
// const endValue = 100;
// const animationDuration = 1000; // in milliseconds

// animateValue(startValue, endValue, animationDuration, function(value) {
//     console.log(value); // Log the current animated value
// }, function() {
//     console.log("Animation complete");
// });






//Shared Data Store
function storeMap(key, map) {
    localStorage.setItem(key, JSON.stringify(map));
}

function getMap(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch (e) {
        return {};
    }
}

//Login Preference Data
function Login(data) {
    var UserData = {};

    var firstName = "";
    var lastName = "";
    var phoneNumber = "";
    if(data.phoneNumber != null){
        phoneNumber = data.phoneNumber;
    }

    try{
        [firstName, lastName] = user.displayName ? user.displayName.split(' ') : ['', ''];
    } catch(e) {}
    
    UserData.UID = data.uid;
    UserData.Email = data.email;
    UserData.Details = {
        VerifiedEmail : data.emailVerified,
        Photo : data.photoURL,
        Contact : {
            Phone : phoneNumber
        },
        Name : {
            FullName : data.displayName,
            FirstName : firstName,
            LastName : lastName
        }
    }

    const timeMs = new Date().getTime();
    UserData.LastLog = {
        TimeMs : timeMs,
        TimeStamp : convertMillisecondsToTimestamp(timeMs)
    }
    
    UserData.isLoggedIn = true;
    storeMap(USER_DATA_STORE,UserData);
    rdb.ref(USER_DATA_STORE_DB).child(UserData.UID).update(UserData);
    db.collection(USER_DATA_STORE_DB).doc(UserData.UID).set({
        Name : data.displayName,
        Email : UserData.Email,
        Phone : phoneNumber,
        FirstName : firstName,
        LastName : lastName,
        Photo : data.photoURL,
    });
}

function isLogedIn() {
    var UserData = getMap(USER_DATA_STORE);
    if(UserData == null ) {
        return false;
    }
    return UserData.isLoggedIn;
}

function getUser() {
    var UserData = getMap(USER_DATA_STORE);
    if(UserData == null) {
        return {};
    }
    return UserData;
}

function Logout() {
    signOut(function(){
        if(isLogedIn()){
            rdb.ref(USER_DATA_STORE_DB).child(getUser().UID).update({
                isLoggedIn : false
            });
            storeMap(USER_DATA_STORE,null);
            console.log("Logout Success");
        } else {
            console.log("Not Logged In")
        }
        
    },function(e){
        console.log("Logout Fail "+e);
    });
}


function getUserDataFromChatList(UID) {
    var ChatList = getMap("ChatList");

    for (let uid in ChatList) {
        let data = ChatList[uid];
        if(uid == UID){
            return data;
        }
    }
    
    return null;
}

function setUserDataToChatList(UID,Data) {
    var ChatList = getMap("ChatList");
    if(ChatList == null){
        ChatList = {};
    }
    ChatList[UID] = Data;
    storeMap("ChatList",ChatList);
}





//Others
function convertMillisecondsToTimestamp(milliseconds) {
    const date = new Date(milliseconds);
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}



function getMs(dateobj){
    return dateobj.getTime();
}

function getDate(datems){
    return new Date(datems);
}
