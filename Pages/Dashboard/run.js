
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


id("sidebarImg").addEventListener('mouseover', function(){
    showSideBar();
});


id("sidebar").addEventListener('mouseleave', function(){
    hideSideBar();
});


function Navigate(page){
    Loading(true);
    // Create a new iframe element
    var iframe = id('iframe');
    // Set attributes for the iframe
    iframe.src = getPath(page); 
    iframe.frameborder = '0';

    After(500,function(){
        Loading(false);
        log(getCurrentPage());
    })
}

Navigate("Home");