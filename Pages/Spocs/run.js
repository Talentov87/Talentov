

var job_states_and_spocs_for_all = {};

async function init(){
    search("");
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



function makeSpocCard(Title, Content, i, AnimTime) {
    return `
        <div id='spocCard${i}' class='card' style='animation: slideInUp ${AnimTime}s ease;'>
            <div class='card-title'>${Title}</div>
            <div class='card-content'>${Content}</div>
            <div class='card-actions' style='display:flex'>
                `+ (true ? `<a class='btn-card' onclick='OnSpocDelete(${i})'>Delete</a>` : ``) + `
            </div>
        </div>
    `;
}


var spocs = [];
async function search(txt){
    
    id("list").innerHTML = html_loading;

    spocs = await fetchAWS('sql/spoc/get',{
        "COLUMNS": "id,Name,Mail,Comid",
        "CONDITION": "WHERE Comid = '"+Intent["Comid"]+"' and (NAME LIKE '%"+txt+"%' or Mail LIKE '%"+txt+"%')",
    });

    let html_text = "";

    for (let index = 1; index < spocs.length; index++) {
        const element = spocs[index];
        html_text += makeSpocCard(element[1], element[2], index, 1);
    }


    id("list").innerHTML = html_text==""?html_empty:html_text;

}


id("search").addEventListener("input", function() {
    search(id("search").value);
});

id("BackButton").addEventListener("click", function() {
    Navigate("Back");
});





//Spoc Add
function AddNewSpoc(){
    let inputElements = [customInpBox("Spoc Name", "spocName","","text"),customInpBox("Spoc E-mail", "spocMail","","text")];
    inputDialog("New Spoc!",inputElements,["Create","Cancel"],async function onButtonClicked(opt,closeCallback){
        if(opt == "Create"){
            let Name = id("spocName").value.trim();
            let Mail = id("spocMail").value.trim();

            if(Name == ""){
                Toast("Please Enter Spoc Name");
                return;
            }
            if(Mail == ""){
                Toast("Please Enter Spoc E-mail");
                return;
            }
            const tempID = Date.now().toString();
            // const tempData = {
            //     Name: id("tid1").value.trim(),
            //     Mail: id("tid2").value.trim(),
            //     Comid: Data.id
            // };

            Loading(true);

            var success = await fetchAWS('sql/spoc/store',{
                "ID":tempID,
                "DATA":{
                    "Name":Name,
                    "Mail":Mail,
                    "Comid":Intent["Comid"]
                }
            });

            id("spocName").value = "";
            id("spocMail").value = "";
            
            await search("");
            closeCallback();
            Loading(false)


            if(success == "ok"){
                Toast("Spoc Added");
            } else {
                Toast("Something Went Wrong");
                Dialog("Error Occured!","Contact the developer, ERROR!",["Ok"]);
            }

        } else {
            closeCallback();
        }
    });
}

function OnSpocDelete(index) {
    Dialog("Delete Spoc!","Are you sure to delete "+spocs[index][1]+" spoc for "+Intent["Name"]+" Company?",["Confirm","Cancel"],async function(opt){
        if(opt == "Confirm"){

            Loading(true)

            var success = await fetchAWS('sql/spoc/delete',{
                "CONDITION":"ID = '"+spocs[index][0]+"'"
            });

            Loading(false)


            if(success == "1"){
                Toast("Spoc Deleted");
            } else {
                Toast("Something Went Wrong");
                Dialog("Error Occured!","Contact the developer, ERROR!",["Ok"]);
            }
            search("");
        } else {

        }
    });
}