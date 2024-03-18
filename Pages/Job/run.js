const JOBID = PARAMS_PASSED["jobid"];
var COMID = "";
var COMP_NAME = "";
var JOB_DETAIL = {};

const statList = ["Active", "Closed", "Hold"];

function customSelectBox(Text, ElementID, values, options) {
    var text = "<label for='" + ElementID + "' class='inp'><select id='" + ElementID + "'>";

    for (var i = 0; i < options.length; i++) {
        text += "<option value='" + values[i] + "'>" + options[i] + "</option>";
    }

    text += "</select><span class='label'>" + Text + "</span><span class='focus-bg'></span></label><br>";
    return text;
}



var spocs = [];
var AllUserNamesObj = {};

async function init(){
    const INIT_DATA =  await fetchAWS('sql/jobs/job_init_data',{
        "JOBID": JOBID
    });

    JOB_DETAIL = INIT_DATA["JOB_DETAIL"];
    COMID = INIT_DATA["COMID"];
    COMP_NAME = INIT_DATA["COMP_NAME"];
    spocs = INIT_DATA["spocs"];
    AllUsers = INIT_DATA["AllUsers"];

    id("CompTitle").innerHTML = COMP_NAME + " > "+ JOB_DETAIL[1];
    // search("");

    let spocsIdsTemp = [];
    let spocsNamesTemp = [];

    spocs.forEach(rec => {
        spocsIdsTemp.push(rec[0]);
        spocsNamesTemp.push(rec[1]);
    });

    spocsIdsTemp.unshift("Empty");
    spocsNamesTemp.unshift("Empty");

    
    html("inp1", inpBox("Name", "tid1"));
    html("inp2", inpBox("Openings", "tid2", "number"));
    html("inp6", inpBox("Comment", "tid6", "multiline", 5, 30));
    html("inp3", inpBox("Description", "tid3", "multiline", 15, 30));
    html("inp4", inpBox("Closed", "tid4", "number"));
    html("inp5", selectBox("Status", "tid5", statList));
    html("inp7", customSelectBox("Spoc", "tid7", spocsIdsTemp, spocsNamesTemp));
    // id("tid2").disabled = true;
    id("tid4").disabled = true;

    id("tid1").value = JOB_DETAIL[1];
    id("tid2").value = JOB_DETAIL[4];
    id("tid3").value = JOB_DETAIL[3];
    id("tid4").value = JOB_DETAIL[5];
    id("tid5").value = JOB_DETAIL[6];
    id("tid6").value = JOB_DETAIL[8];
    id("tid7").value = JOB_DETAIL[9];
    

    AllUsers.forEach(rec => {
        AllUserNamesObj[rec[0]] = rec[1];
    });


    parseRecruiterAndRefresh(JOB_DETAIL[7]);
    
    
}

function parseRecruiterAndRefresh(idList){
    try {
        JOB_DETAIL[7] = idList;
        let RecruitersListIdlist = JSON.parse(idList || "[]");
        let RecruitersListNamelist = [];
        RecruitersListIdlist.forEach(e => {
            RecruitersListNamelist.push(AllUserNamesObj[e] || "Deleted");
        });
        refreshRecruiterView(RecruitersListNamelist);
    } catch (error) {
        log(error.message)
    }
}

function refreshRecruiterView(RecruitersListNamelist) {

    html("filters", "");

    for (var i = 0; i < RecruitersListNamelist.length; i++) {
        txt = "<div id='filter" + i + "' class='filterCard' style='display:flex'>";
        txt += "<div>";
        txt += "<div>" + RecruitersListNamelist[i] + "</div>";
        txt += "</div>";
        txt += "<img onclick=deleteFilter(" + i + ") src='../../Images/remove.png' width=30px height=30px >"
        txt += "</div>";
        id("filters").insertAdjacentHTML("beforeend", txt);
    }
}

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


init();


id("BackButton").addEventListener("click", function() {
    Navigate("Back");
});



function AddFilter() {
    // console.log(RecruitersListIdlist.length);
    log(typeof AllUserNamesObj)
    
    let userIds = [];
    let userNames = [];

    const keys = Object.keys(AllUserNamesObj);

    for (let i = 0; i < keys.length; i++) {
        const id = keys[i];
        const name = AllUserNamesObj[id];
        userIds.push(id);
        userNames.push(name);
    }

    let inputElements = [customSelectBox("User Name","selectUser",userIds,userNames)];

    inputDialog("Select the user",inputElements,["Confirm","Cancel"], async function(opt, closeCallback) {
        if(opt == "Confirm") {
            var user_id = id("selectUser").value;
            var user_name = AllUserNamesObj[user_id];
    
            Loading(true);
            JOB_DETAIL = await fetchAWS('sql/jobs/get',{
                "COLUMNS": "id,Name,Comid,Description,Opening,Closed,Status,UserList,Comment,Spocid,CreatedBy,CreatedOn,CreatedOnMS",
                "CONDITION": "WHERE id="+JOBID,
            });
        
            JOB_DETAIL.splice(0,1);
            JOB_DETAIL = JOB_DETAIL[0];
            
            let UserList = JOB_DETAIL[7];
            parseRecruiterAndRefresh(UserList);

            let RecruitersListIdlist = JSON.parse(UserList || "[]");
            
            if(RecruitersListIdlist.includes(user_id)){
                Loading(false);
                Toast("Already Added");
                return;
            } else {
    
                RecruitersListIdlist.push(user_id);
    
                UserList = JSON.stringify(RecruitersListIdlist);
                
                
                var success = await fetchAWS('sql/jobs/update',{
                    "CONDITION":"ID='"+JOBID+"'",
                    "DATA":{
                        "UserList": UserList
                    }
                });

    
                if(success == "1"){
                    parseRecruiterAndRefresh(UserList);
                    Toast("Recruiter Added");
                } else {
                    Toast("Something Went Wrong");
                    Dialog("Error Occured!","Contact the developer, ERROR!",["Ok"]);
                }
            }
            Loading(false);
            closeCallback();
            
        } else {
            closeCallback();
        }
        
    }, function() {
        hide("customRequestDialogrec");
    });
}


function deleteFilter(index) {
    Dialog("Delete Recuriter","Click confirm to perform deletion...",["Confirm","Cancel"],async function(opt){
        if(opt == "Confirm"){
            Loading(true);
            let UserList = JOB_DETAIL[7];
            let RecruitersListIdlist = JSON.parse(UserList || "[]");

            RecruitersListIdlist.splice(index, 1);
            UserList = JSON.stringify(RecruitersListIdlist);

            var success = await fetchAWS('sql/jobs/update',{
                "CONDITION":"ID='"+JOBID+"'",
                "DATA":{
                    "UserList": UserList
                }
            });
            Loading(false);

            if(success == "1"){
                parseRecruiterAndRefresh(UserList);
                Toast("Recruiter Deleted");
            } else {
                Toast("Something Went Wrong");
                Dialog("Error Occured!","Contact the developer, ERROR!",["Ok"]);
            }
        } else {

        }
    })
}


async function Save(){

    let Name = id("tid1").value.trim();
    let Opening = id("tid2").value.trim();
    let Closed = id("tid4").value.trim();
    let Description = id("tid3").value.trim();
    let Status = id("tid5").value.trim();
    let Comment = id("tid6").value.trim();
    let Spocid = id("tid7").value.trim();


    if (Name == "") {
        Toast("Enter Name");
        return;
    }

    if (Opening == "") {
        Toast("Enter Openings");
        return;
    }

    if (Description == "") {
        Toast("Enter Description");
        return;
    }
    
    Loading(true);

    var success = await fetchAWS('sql/jobs/update',{
        "CONDITION":"ID='"+JOBID+"'",
        "DATA":{
            "Name": Name,
            "Opening":Opening,
            "Closed":Closed,
            "Description":Description,
            "Status":Status,
            "Comment":Comment,
            "Spocid":Spocid
        }
    });
    Loading(false);

    if(success == "1"){
        Toast("Saved Successfully");
    } else {
        Toast("Something Went Wrong");
        Dialog("Error Occured!","Contact the developer, ERROR!",["Ok"]);
    }
}