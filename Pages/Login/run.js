
var logingIn = false;

if(isLogedIn()) {
    Loading(true);
    After(3000,function(){
        Navigate("Dashboard");
    });
}

id("LOGIN_BUTTON").onclick = async function() {
    
    if (logingIn == true) {
        return;
    }

    const MailId = id("MailInput").value.trim();
    const Password = id("PasswordInput").value.trim();

    if (MailId.trim() == "") {
        Toast("Enter E-Mail Correctly");
        return;
    }
    

    if (Password.trim() == "") {
        Toast("Enter Password Correctly");
        return;
    }

    logingIn = true;
    
    Loading(true);

    const result = await db.collection(USER_DATA_STORE_FDB).where("Mail", "==", MailId).get();
    let Data = "";
    if (result.empty) {
        Data = null;
    } else {
        Data =  result.docs[0];
    }

    const AccountData = Data;


    if (AccountData == null) {
        Loading(false);
        Toast("The Entered Mail Id Was InCorrect");
    } else {
        
        var Account = AccountData.data();
        Account.id = AccountData.id;

        if (Account.Password == undefined) {
            Loading(false);
            Dialog("Account Info", "Currently Password Was Not Set For This Mail(" + MailId + ").So Click Confirm To Set '" + Password + "' As Password",["Confirm","Cancel"],async function(option){
                if(option == "Confirm"){
                    Loading(true);
                    await db.collection(USER_DATA_STORE_FDB).doc(Account.id).update({
                        Password: Password
                    });
                    
                    Login({
                        Id: Account.id,
                        Name: Account.Name,
                        Email: Account.Mail,
                        Details: Account
                    });
                    
                    setTimeout(() => {
                        Navigate("Dashboard");
                    }, 1550);
                    
                    Toast("Login Success");
                } else {
                    Toast("Password Was Not Set");
                }
            });
        } else {
            if (Account.Password == Password) {
                Login({
                    Id: Account.id,
                    Name: Account.Name,
                    Email: Account.Mail,
                    Details: Account
                });

                setTimeout(() => {
                    Navigate("Dashboard");
                }, 1750);

                Toast("Login Success");
            } else {
                Loading(false);
                Toast("InCorrect Password");
            }
        }
    }

    logingIn = false;
}
