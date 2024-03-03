
id("sidebar").style.left = "-200px"
function showSideBar(){   
    animateValue(parseFloat(id("sidebar").style.left),0,300,function(value){
        id("sidebar").style.left = value + "px";
    },function(){});
}

function hideSideBar(){    
    animateValue(parseFloat(id("sidebar").style.left),-200,500,function(value){
        id("sidebar").style.left = value + "px";
    },function(){});
}


var enableSidebar = false;
id("sidebarImg").addEventListener('mouseover', function(){
    if(enableSidebar)
    showSideBar();
});


id("sidebar").addEventListener('mouseleave', function(){
    if(enableSidebar)
    hideSideBar();
});


function Navigate(page,name){
    if(page == "Profile"){
        enableSidebar = false;
        showSideBar();
    } else {
        enableSidebar = true;
    }
    id("headTitle").innerHTML = name;
    // console.log(d)
    Loading(true);
    // Create a new iframe element
    var iframe = id('iframe');
    // Set attributes for the iframe
    iframe.src = getPath(page); 
    iframe.frameborder = '0';
    
    iframe.onload = function() {
        After(500,function(){
            Loading(false);
        })
    };
}


Navigate('Profile','Profile Dashboard');












