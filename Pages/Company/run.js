
function parseDataString(dataString, callback) {
    if(dataString == "[]"){
        return [];
    }
    const data = [];
    let start = 1; // Start index to slice the string
    let end = dataString.indexOf("), ("); // End index of the first tuple
    let index = 0;
    // Loop until there are no more tuples
    while (end !== -1) {
        // Extract the tuple string
        const tupleStr = dataString.slice(start, end);
        
        // Parse the tuple string and add it to the data array
        const columns = tupleStr.slice(1,-1).split("', '");
        if(columns != undefined){
            data.push(columns);
            callback(index,columns);
            index++;
        }

        // Update start and end indexes for the next iteration
        start = end + 4;
        end = dataString.indexOf("), (", start);
    }

    // Process the last tuple
    const lastTupleStr = dataString.slice(start, -1);
    const lastColumns = lastTupleStr.slice(2, -2).split("', '");
    if(lastColumns != undefined){
        data.push(lastColumns);
        callback(index,lastColumns);
        index++;
    }
    return data;
}



async function init(){
    search("")
    // console.log(data);
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

async function search(txt){
    var resp = await fetchAWS('sql/company/get',{
        "COLUMNS": "ID,NAME",
        "WHERE": "NAME LIKE '%"+txt+"%'",
    });

    id("list").innerHTML = "";

    const data = parseDataString(resp,function(index,columns){
        log(index)
        id("list").innerHTML += makeCard(columns[1],"Add Spocs And Jobs For This Company!",index,1);
    });

}

id("search").addEventListener("input", function() {
    search(id("search").value);
});