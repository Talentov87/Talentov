

var job_states_and_spocs_for_all = {};

const html_loading = `<div class="card" id="tempLoading">
<div class="card-title">Loading</div>
<div class="card-content">
    Please wait while we are fetch the data...
</div>
</div>`;


async function init(){
    job_states_and_spocs_for_all = await fetchAWS('sql/company/get_job_states_and_spocs_for_all');
    await search("");
}


init();



function makeCard(Title, Content, i, AnimTime) {
    return `
        <div id='card${i}' class='card' style='animation: slideInUp ${AnimTime}s ease;'>
            <div class='card-title'>${Title}</div>
            <div class='card-content'>${Content}</div>
            <div class='card-actions' style='display:flex'>
            `+ (true ? `<a class='btn-card c1' onclick='OnDelete(${i})' >Delete</a>` : ``) + `
                <a class='btn-card c2' onclick='OnEdit(${i})' >Spocs</a>
                <a class='btn-card c3' onclick='OnOpen(${i})' >Jobs</a>
            </div>
        </div>
    `;
}


var companies = [];
async function search(txt){
    
    id("list").innerHTML = html_loading;

    companies = await fetchAWS('sql/company/get',{
        "COLUMNS": "ID,NAME",
        "CONDITION": "WHERE NAME LIKE '%"+txt+"%'",
    });

    let html_text = ""

    for (let index = 1; index < companies.length; index++) {
        const element = companies[index];

        const job_states_and_spocs = job_states_and_spocs_for_all[element[0]]

        var atxt="",htxt="",ctxt="",ttxt="",utxt="";


        try {
            atxt = (job_states_and_spocs["active"] == 0 ? "" : job_states_and_spocs["active"] + "-Active ");
            htxt = (job_states_and_spocs["hold"] == 0 ? "" : job_states_and_spocs["hold"] + "-Hold ");
            ctxt = (job_states_and_spocs["closed"] == 0 ? "" : job_states_and_spocs["closed"] + "-Closed ");
            ttxt = (job_states_and_spocs["unset"] == 0 ? "" : job_states_and_spocs["unset"] + "-Unset ");
            utxt = (job_states_and_spocs["total"] == 0 ? "" : job_states_and_spocs["total"] + "-Total");
        } catch (error) {}
        
        var text1 = atxt + htxt + ctxt + ttxt + utxt;
        var text2 = "";

        var spocsForComp = [];
        try {
            spocsForComp = job_states_and_spocs["spocs"];
        } catch (error) {}


        for (let indexj = 0; indexj < spocsForComp.length; indexj++) {
            const spoc = spocsForComp[indexj];
            let spocName = spoc[0];

            if (indexj == 0) {
                indexj++;
            } else {
                text2 += ", ";
            }
            text2 += spocName;
        }
        
        var text = text1 + "<br>" + text2;

        if (text == "<br>") {
            text = "Add Spocs And Jobs For This Company!";
        }

        html_text += makeCard(element[1],text,index,1);
    }

    id("list").innerHTML = html_text;


}


id("search").addEventListener("input", function() {
    search(id("search").value);
});

id("createCompany").addEventListener("click", function() {
    createCompany();
});

function createCompany(){
    let inputElements = [customInpBox("Company Name", "compName","","text")];
    inputDialog("New Company!",inputElements,["Create","Cancel"],async function onButtonClicked(opt,closeCallback){
        if(opt == "Create"){
            let compName = id("compName").value.trim();
            if(compName == ""){
                Toast("Please Enter Company Name");
                return;
            }
            Loading(true);
            
            const tempID = Date.now().toString();

            var success = await fetchAWS('sql/company/store',{
                "ID":tempID,
                "DATA":{
                    "NAME":compName
                }
            });

            id("compName").value = "";
            closeCallback();
            
            await search("");
            Loading(false);


            if(success == "ok"){
                Toast("Company Added");
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
    Navigate("Spocs",false,{},{},"comid="+companies[index][0]);
}

function OnDelete(index) {
    Dialog("Delete Company!","Are you sure to delete "+companies[index][1]+" Company? This will lead to many kind of data lose!!!",["Confirm","Cancel"],async function(opt){
        if(opt == "Confirm"){

            Loading(true)
            var success = await fetchAWS('sql/company/delete',{
                "CONDITION":"ID = '"+companies[index][0]+"'"
            });

            Loading(false)


            if(success == "1"){
                Toast("Company Deleted");
            } else {
                Toast("Something Went Wrong");
                Dialog("Error Occured!","Contact the developer, ERROR!",["Ok"]);
            }
            search("");
        } else {

        }
    });
}



function OnOpen(index){
    Navigate("Jobs",false,{},{},"comid="+companies[index][0]
    );
}