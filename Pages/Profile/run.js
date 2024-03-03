var USER = getUser()

// log(USER)
id("Name").innerHTML = "<h1>"+USER.Details.Name+"</h1>";
id("role").innerHTML = "Role: " + ((USER.Details.Type == "0")?"Admin":"User");
id("location").innerHTML = "Location: ...";
id("email").innerHTML = "Email: "+USER.Email;

var ProfileUrl = USER.Details.ProfileUrl;
if(ProfileUrl){
    setTimeout(() => {
        id("profileImg").src = ProfileUrl;
    }, 1);
}