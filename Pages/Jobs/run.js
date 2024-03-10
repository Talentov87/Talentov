

var job_states_and_spocs_for_all = {};

const html_loading = `<div class="card" id="tempLoading">
<div class="card-title">Loading</div>
<div class="card-content">
    Please wait while we are fetch the data...
</div>
</div>`;

const html_empty = `<div class="card" id="tempLoading">
<div class="card-title">Looks Empty</div>
<div class="card-content">
    There is no details available!
</div>
</div>`;


var spocs = [];
var AllUserNamesObj = {};
var AllSpocsNameObj = {};

const COMID = PARAMS_PASSED["comid"];


async function init(){
    let company = await fetchAWS('sql/company/get',{
        "COLUMNS": "Name",
        "CONDITION": "WHERE id="+COMID,
    });
    id("CompTitle").innerHTML = company[1][0];



    let AllUsers = await fetchAWS('sql/users/get',{
        "COLUMNS": "id,Name",
        "CONDITION": "",
    });

    // log(AllUsers)

    AllUsers.splice(0,1);

    AllUsers.forEach(rec => {
        AllUserNamesObj[rec[0]] = rec[1];
    });

    spocs = await fetchAWS('sql/spoc/get',{
        "COLUMNS": "id,NAME,Mail,Comid",
        "CONDITION": "WHERE Comid='"+COMID+"'",
    });
    
    spocs.splice(0, 1);

    spocs.forEach(rec => {
        AllSpocsNameObj[rec[0]] = rec[1];
    });

    search("");
}


init();




function makeCard(Title, Status, Content, i, AnimTime) {
    var color = "";
    var textColor = "";

    if (Status == "0") {
        color = "#90EE90"; // LightGreen
        textColor = "#000"; // BlacWhite tex Black  text f Black text for LightGreen background
    } else if (Status == "1") {
        color = "#203050"; // Dark Blue-Grey
        textColor = "#FFF"; // White text fo
    } else if (Status == "2") {
        color = "#D7BDE2"; // Light Purple
        textColor = "#000"; // Blac
    }

    return `
        <div id='card${i}' class='card' style='animation: slideInUp ${AnimTime}s ease;background-color: ${color}; color: ${textColor};'>
            <div class='card-title'>${Title}</div>
            <div class='card-content'>${Content}</div>
            <div class='card-actions' style='display:flex'>
                `+ (true ? `<a class='btn-card c1' onclick='OnDelete(${i})'>Delete</a>` : ``) + `
                <a class='btn-card c2' onclick='OnEdit(${i})'>Edit</a>
                <a class='btn-card c3' onclick='OnOpen(${i})'>Open</a>
            </div>
        </div>
    `;
}



var jobs = [];
const statList = ["Active", "Closed", "Hold"];

async function search(txt){
    
    id("list").innerHTML = html_loading;

    jobs = await fetchAWS('sql/jobs/get',{
        "COLUMNS": "id,Description,Name,Opening,Comid,Closed,Status,UserList,Comment,Spocid,CreatedBy,CreatedOn,CreatedOnMS",
        "CONDITION": "WHERE Comid='"+COMID+"' and NAME LIKE '%"+txt+"%'",
    });

    let html_text = ""

    for (let index = 1; index < jobs.length; index++) {
        const element = jobs[index];

        var spocName = AllSpocsNameObj[element[9]];
        if(spocName == undefined){
            spocName = "No Spoc Selected";
        }
        var userListDisp = "";
        try {
            var tempRecruitersListIdlist = JSON.parse(element[7] || "");

            tempRecruitersListIdlist.forEach((e, index1) => {
                if (index1 != 0) {
                    userListDisp += ",";
                }
                try {
                    userListDisp += (AllUserNamesObj[e] || "Deleted");
                } catch (error) {
                    userListDisp += "Deleted";
                }
                
            });
            
            if (userListDisp != "") {
                userListDisp += "<br>";
            }
        } catch (e) {
            // console.log(e)
        }
        var content = userListDisp + "<b><i>" + spocName + "</i></b><br>" + element[3] + " Open" + (element[5] ? ", " + element[5] + " Close" : "") + (element[6] ? ", Status : " + statList[element[6]] : "");

        card = makeCard(element[2], element[6], content, index, 0);
        html_text += card;

        // html_text += makeCard(element[2],"","",index,1);
    }

    id("list").innerHTML = html_text==""?html_empty:html_text;
}


id("search").addEventListener("input", function() {
    search(id("search").value);
});


id("BackButton").addEventListener("click", function() {
    Navigate("Back");
});


function AddNewJob(){
    let inputElements = [customInpBox("Title", "jobTitle","","text"),customInpBox("Openings", "jobOpenings","0","number"),customInpBox("Description", "jobDesc","","text"),customSelectBox("Spoc", "jobSpoc", spocs.map(spoc => spoc[1]))];
    inputDialog("New Job Role!",inputElements,["Create","Cancel"],async function onButtonClicked(opt,closeCallback){
        if(opt == "Create"){
            let jobTitle = id("jobTitle").value.trim();
            let jobOpenings = id("jobOpenings").value.trim();
            let jobDesc = id("jobDesc").value.trim();
            let spocId = spocs[id("jobSpoc").value][0];
            
            if(jobTitle == ""){
                Toast("Please Enter Job Title");
                return;
            }
            if(jobOpenings == ""){
                Toast("Please Enter Job Openings");
                return;
            }
            try {
                jobOpenings = Number(jobOpenings);
            } catch (error) {
                Toast("Please Enter Job Openings In Number Only");
                return;
            }
            
            if(jobDesc == ""){
                Toast("Please Enter Job Description");
                return;
            }
            Loading(true);
            
            const tempID = Date.now().toString();
            var inputDate = new Date();
            // Format the Date object as a string in the desired format (dd/MM/yyyy)
            var dd = inputDate.getDate().toString().padStart(2, '0');
            var MM = (inputDate.getMonth() + 1).toString().padStart(2, '0');
            var yyyy = inputDate.getFullYear();
            var formattedDateString = yyyy + '-' + MM + '-' + dd;

            var success = await fetchAWS('sql/jobs/store',{
                "ID":tempID,
                "DATA":{
                    "Name": jobTitle,
                    "Opening": jobOpenings,
                    "Description": jobDesc,
                    "Comment": "",
                    "CreatedOnMS": tempID,
                    "CreatedOn": formattedDateString,
                    "CreatedBy": getUser().UID,
                    "Closed": 0,
                    "Comid": COMID,
                    "Spocid": spocId,
                }
            });

            closeCallback();
            
            await search("");
            Loading(false);


            if(success == "ok"){
                Toast("Job Role Added");
            } else {
                Toast("Something Went Wrong");
                Dialog("Error Occured!","Contact the developer, ERROR!",["Ok"]);
            }
        } else {
            closeCallback();
        }
    });
}

function OnEdit(index){
    Navigate("Job",false,{},{},"jobid="+jobs[index][0]);
}

function OnDelete(index) {
    Dialog("Delete Job Role!","Are you sure to delete "+jobs[index][2]+" Job Role? This will lead to many kind of data lose!!!",["Confirm","Cancel"],async function(opt){
        if(opt == "Confirm"){

            Loading(true);
            var success = await fetchAWS('sql/jobs/delete',{
                "CONDITION":"ID = '"+jobs[index][0]+"'"
            });
            Loading(false);

            if(success == "1"){
                Toast("Job Role Deleted");
            } else {
                Toast("Something Went Wrong");
                Dialog("Error Occured!","Contact the developer, ERROR!",["Ok"]);
            }
            search("");
        } else {

        }
    });
}

