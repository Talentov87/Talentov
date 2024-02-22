CurrentPage("Home");

if (isLogedIn() != true) {
    Navigate("Login");
}


const user = getUserInfo();


id("NameText").innerHTML = user.Name;
id("MailText").innerHTML = user.Mail;


function getCurrentDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    return `${day}/${month}/${year}`;
}

id("DashboardButton").onclick = async function() {
    if (allowDashBoard) {
        console.log(retrieveFromLocalStorage(getCurrentDate()))
        if (retrieveFromLocalStorage(getCurrentDate()) == "yes") {
            Navigate("Dashboard");
        } else {
            showToast("Please Wait Pulling Origin!");
            pullDB(function() {
                Navigate("Dashboard");
            });
            storeToLocalStorage(getCurrentDate(), "yes");
        }
    } else {
        showToast("Please Wait Pulling Origin!");
        pullDB(function() {
            Navigate("Dashboard");
        });
    }
};

id("SignoutButton").onclick = async function() {
    showDialog("Logout?", "Click Confirm Button To Logout!", async function() {
        hideDialog();
        show("loading");
        var Account = getUserInfo()

        CurrentPage("Auth");
        //Log
        Log("NEW", "(LogOut) " + (Account.Type == 0 ? "Admin" : "User") + " is Loged Out " + Account.Name + " (" + Account.Mail + ")");
        CurrentPage("Home");

        signout();
        setTimeout(() => {
            Navigate("Login");
        }, 1750);
    }, function() {
        showToast("Logout Canceled");
        hideDialog();
    });
};




function onResumeSelected(src) {
    const fileInput = src.target;

    if (fileInput.files && fileInput.files[0]) {
        const storage = firebase.storage();
        var file = fileInput.files[0];
        const filename = file.name;
        const fileExtension = filename.split('.').pop();

        if (fileExtension != "png" && fileExtension != "jpg" && fileExtension != "jpeg") {
            showToast("Profile Picture Must Be In This Format Only  'Png' or 'Jpg' or 'Jpeg'");
            return;
        }


        const maxSize = 3 * 1024 * 1024; // 5 MB in bytes
        if (file.size > maxSize && isLogedIn()) {
            showToast("Profile Picture Size is More than 3 MB");
            return;
        }


        show("loading");
        var storageRef = storage.ref().child("Profiles/" + user.Id + "." + fileExtension);
        var uploadTask = storageRef.put(file);

        uploadTask.on(
            "state_changed",
            function(snapshot) {
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                showInfo("Uploading...", "Progress " + Math.round(progress) + "%");
            },
            function(error) {
                console.error("Upload failed:", error);
                showInfo("Upload failed!", "Contact developer and send this below error message:\n" + error, function() {
                    hide("loading");
                    hide("requestDialog");
                });
            },
            function() {

                uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {

                    console.log("File available at:", downloadURL);
                    db.collection("ALLUSERS").doc(user.Id).update({
                        ProfileUrl: downloadURL
                    }).then(eve => {
                        localStorage.loginProfileUrl = downloadURL;
                        id("profileImg").src = downloadURL;
                        showToast("Profile Picture Updated");
                        hide("loading");
                        hide("requestDialog");
                    });

                    //Log
                    CurrentPage("User");
                    Log("NEW", "<a href='" + downloadURL + "'>Profile Image</a> is Updated ");
                    CurrentPage("Home");

                });
            }
        );

    } else {
        //nothing
    }
}




var allowDashBoard = false;


var request = indexedDB.open("myDatabase");

request.onsuccess = function(event) {
    var ldb = event.target.result;
    if (ldb.objectStoreNames.contains("dataStore")) {
        allowDashBoard = true;
    } else {
        allowDashBoard = false;
    }
    ldb.close();
};

function convertToCSV(dataArray) {
    // Implement your own logic to convert an array of JSON data to CSV format
    // You can use a library like json2csv or manually format the data
    // For simplicity, let's assume dataArray is an array of plain objects with key-value pairs
    const header = Object.keys(dataArray[0]).join('~');
    const rows = dataArray.map(record => Object.values(record).join('~'));
    return [header, ...rows].join('\n');
}

/*

var CVrecordsToStore = await db.collection("ALLCVS").get();

const allRecords = [];

CVrecordsToStore.forEach((rec) => {
    allRecords.push({ ...rec.data(), id: rec.id });
});


// Convert dataArray to a JSON string
const csvContent = JSON.stringify(allRecords);

// const csvContent = convertToCSV(allRecords);
const blob = new Blob([csvContent], { type: 'text/csv' });

const downloadLink = document.createElement('a');
downloadLink.href = URL.createObjectURL(blob);
downloadLink.download = 'all_records.csv';

document.body.appendChild(downloadLink);
downloadLink.click();
document.body.removeChild(downloadLink);

console.log(CVrecordsToStore)
hide("loading")
*/


async function pullDB(aftCalback) {


    // const CVsRef = firebase.database().ref("CVS");
    // var tempID = "1";

    // await CVsRef.child(tempID).set({"his":"hello","hi":"jhghvg"});
    // await CVsRef.child(tempID).remove();
    // await CVsRef.child(tempID).update({"his":"hello1"});




    // return;

    show("loading");


    deleteIndexDB("myDatabase");
    const CVrecordsToStore = await new Promise((resolve, reject) => {
        firebase.database().ref("CVS").once("value", (data) => resolve(data.val()), reject);
    });
    await storeRecordsInIndexedDB('myDatabase', 'dataStore', CVrecordsToStore, function() {
        console.log('All CV records stored successfully');
    }, true);


    // deleteIndexDB("myDatabase");
    // var CVrecordsToStore1 = await db.collection("ALLCVS").get();
    // await storeRecordsInIndexedDB('myDatabase', 'dataStore', CVrecordsToStore1, function() {
    //     console.log('All CV records stored successfully');
    // });


    try {
        deleteIndexDB("allJobs");
        var JOBrecordsToStore = await db.collection("ALLJOBS").get();
        await storeRecordsInIndexedDB('allJobs', 'dataStore', JOBrecordsToStore, function() {
            console.log('All JOB records stored successfully');
        });


        deleteIndexDB("allSpocs");
        var SPOCrecordsToStore = await db.collection("ALLSPOCS").get();
        await storeRecordsInIndexedDB('allSpocs', 'dataStore', SPOCrecordsToStore, function() {
            console.log('All SPOC records stored successfully');
        });


        deleteIndexDB("companies");
        var COMPrecordsToStore = await db.collection("COMPANIES").get();
        await storeRecordsInIndexedDB('companies', 'dataStore', COMPrecordsToStore, function() {
            console.log('All COMPANY records stored successfully');
        });


        deleteIndexDB("allUsers");
        var COMPrecordsToStore = await db.collection("ALLUSERS").get();
        await storeRecordsInIndexedDB('allUsers', 'dataStore', COMPrecordsToStore, function() {
            console.log('All USER records stored successfully');
        });


        hide("loading");
        allowDashBoard = true;
        if (typeof aftCalback === 'function') {
            aftCalback();
        }
    } catch (error) {
        if (error.message && error.message.includes("Quota")) {
            console.error("Quota error:", error.message);
            showToast("Quota Exceeded");
            showInfo("Quota Exceed!", "Be patient,The quota will be reseted automatically every day @1:30 Pm.\nPlease wait until reseting...", function() {
                hide("requestDialog");
            });
            hide("loading");
        } else {
            console.error("Error fetching data:", error);
        }
    }

}


id("pullOrigin").onclick = pullDB;





var menuBool = false;
var canAnimateMenu = true;

function hideMenu() {
    if (canAnimateMenu == false) {
        return;
    }
    canAnimateMenu = false;
    var menuCard = document.getElementById("menuCard");
    menuBool = false;
    // If the animation is already set, remove it to hide the menu
    menuCard.style.animation = 'slideOutLoading1 1s alternate';
    setTimeout(function() {
        menuCard.style.marginLeft = "100%";
        canAnimateMenu = true;
    }, 1000);
}

function showMenu() {
    if (canAnimateMenu == false) {
        return;
    }
    canAnimateMenu = false;
    var menuCard = document.getElementById("menuCard");
    menuBool = true;
    // If the animation is not set, add it to show the menu
    menuCard.style.animation = 'slideInUpLoading1 1s alternate';
    setTimeout(function() {
        menuCard.style.marginLeft = "60%";
        canAnimateMenu = true;
    }, 1000);
}

// id("MenuButton").onclick = function() {
//     if (menuBool) {
//         hideMenu();
//     } else {
//         showMenu();
//     }
// };


function initAch() {
    db.collection("Achievement").doc("PANEL").get().then(e => {
        if (e.exists) {

            var doc = e.data();
            if (doc.NAME == "") {
                return;
            }

            id("name").innerHTML = doc.NAME;
            id("desc").innerHTML = doc.DESCRIPTION;
            id("achImage").src = doc.IMAGE;

            showMenu();
        }
    });
}

initAch()

function CloseAch() {
    hideMenu();
}


async function getClockDataByID(uid, day, call_back_Active, call_back_Away) {
    console.log(day)
    var ClockDateMs = parseDayMs(day);
    console.log(ClockDateMs)
    var e = await db.collection("ATTENDANCE_BY_UID").doc(uid + "").get({ fieldMask: [ClockDateMs] });
    if (e.exists) {
        var doc = e.data();
        if (doc.hasOwnProperty(ClockDateMs + "")) {
            if (doc[ClockDateMs].hasOwnProperty('LAST') && doc[ClockDateMs].LAST == "IN") {
                call_back_Active(doc, ClockDateMs);
            } else {
                call_back_Away(doc, true);
            }
        } else {
            call_back_Away(null, false);
        }
    } else {
        call_back_Away(null, false);
    }

}


function initAttendance() {
    getClockDataByID(user.Id, add5(new Date(Date.now())), function(doc, key) {//onActive
        setStateOfUser("Active");

        id("StatusButton").onclick = function() {
            Navigate("Attendance");
        }
    }, function(doc, hasData) {//onAway
        setStateOfUser("Away");
        if (!hasData) {
            showToast("Click Clock In To Track Your Attendance");
        }

        id("StatusButton").onclick = function() {
            Navigate("Attendance");
        }
    });
}


function setStateOfUser(state) {
    if (state == "Active") {
        id("StatusButton").style.backgroundColor = "#1ABC9C";
        id("StatusButton").innerHTML = "Active";
        show("ClockOUT");
    } else if (state == "Away") {
        id("StatusButton").style.backgroundColor = "#FF6666";
        id("StatusButton").innerHTML = "Away";
        show("ClockIN");
    } else {
        id("StatusButton").style.backgroundColor = "#FF6666";
        id("StatusButton").innerHTML = "...";
    }

}

id("ClockIN").onclick = function() {
    show("loading");
    getClockDataByID(user.Id, add5(new Date(Date.now())), function(doc, ClockDateMs) {//onActive
        hide("loading");
        showToast("Already Clocked In");
        setStateOfUser("Active");
    }, function(doc, hasData) {//onAway
        hide("loading");
        var today = add5(new Date(Date.now()));
        var ClockDateMs = parseDayMs(today);
        today = today.getTime();
        let txt = "Click Confirm To Clock In Today";

        if (hasData) {
            if (doc[ClockDateMs].hasOwnProperty("HOURS")) {
                txt += "<br>But You Already Worked For " + doc[ClockDateMs].HOURS + " Hours";
            }
        }

        showDialog("Clock In?", txt, function() {

            var ClockInMs = today;

            var FIRST_MS = ClockInMs;
            if (hasData) {
                if (doc[ClockDateMs].hasOwnProperty("FIRST_MS")) {
                    FIRST_MS = doc[ClockDateMs].FIRST_MS;
                }
            }

            db.collection("ATTENDANCE_BY_UID").doc(user.Id + "").set({
                [ClockDateMs]: {
                    [ClockInMs]: "IN",
                    LAST: "IN",
                    LAST_MS: ClockInMs,
                    FIRST_MS: FIRST_MS
                }
            }, { merge: true });

            db.collection("ATTENDANCE_BY_DATE").doc(ClockDateMs + "").set({
                [user.Id]: {
                    [ClockInMs]: "IN",
                    LAST: "IN",
                    LAST_MS: ClockInMs,
                    FIRST_MS: FIRST_MS
                }
            }, { merge: true });

            hide("ClockIN");
            show("ClockOUT");
            setStateOfUser("Active");
            showToast("Clock In Success");
            hideDialog();
        }, function() {
            hideDialog();
        });
    });


}
id("ClockOUT").onclick = function() {
    show("loading");
    getClockDataByID(user.Id, add5(new Date(Date.now())), function(doc, ClockDateMs) {//onActive
        hide("loading");
        if (doc[ClockDateMs].hasOwnProperty("LAST_MS")) {
            var Hrs = 0;
            var OldHrs = 0;
            if (doc[ClockDateMs].hasOwnProperty("HOURS")) {
                OldHrs = doc[ClockDateMs].HOURS;
                Hrs = doc[ClockDateMs].HOURS;
            }

            var ClockInMs = doc[ClockDateMs].LAST_MS + "";
            var ClockOutMs = add5(new Date(Date.now())).getTime().toString();
            var Hours = calculateHours(ClockInMs, ClockOutMs);

            Hrs += parseFloat(Hours);


            var txt = "Click Confirm To Clock Out<br>";

            if (OldHrs > 0) {
                txt += "Today Total Work Time Will Be, " + OldHrs + " + " + Hours + " Hours<br>";
            } else {
                txt += "Today Total Work Time Will Be " + Hours + " Hours<br>";
            }

            txt += "From " + rem5(new Date(Number(doc[ClockDateMs].FIRST_MS))).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            txt += " To " + rem5(new Date(Number(ClockOutMs))).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            showDialog("Clock Out?", txt, function() {

                db.collection("ATTENDANCE_BY_UID").doc(user.Id + "").set({
                    [ClockDateMs]: {
                        [ClockOutMs]: "OUT",
                        LAST: "OUT",
                        LAST_MS: ClockOutMs,
                        HOURS: Hrs
                    }
                }, { merge: true });

                db.collection("ATTENDANCE_BY_DATE").doc(ClockDateMs + "").set({
                    [user.Id]: {
                        [ClockOutMs]: "OUT",
                        LAST: "OUT",
                        LAST_MS: ClockOutMs,
                        HOURS: Hrs
                    }
                }, { merge: true });

                show("ClockIN");
                hide("ClockOUT");
                setStateOfUser("Away");
                showToast("Clock Out Success");
                hideDialog();
            }, function() {
                hideDialog();
            });
        } else {

        }
    }, function(doc, hasData) {//onAway
        hide("loading");
        showToast("Already Clocked Out");
        setStateOfUser("Away");
    });

}


function calculateHours(inTime, outTIme) {
    return ((Number(outTIme) - Number(inTime)) / 3600000).toFixed(1);
}

hide("ClockIN");
hide("ClockOUT");


function add5(date) {
    date.setHours(date.getHours() + 5);
    date.setMinutes(date.getMinutes() + 30);
    return date;
}
function rem5(date) {
    date.setHours(date.getHours() - 5);
    date.setMinutes(date.getMinutes() - 30);
    return date;
}


initAttendance();





