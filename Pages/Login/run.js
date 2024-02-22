

if (isLogedIn() == true) {
    Navigate(getCurrentPage());
}

CurrentPage("Login");




var logingIn = false;

id("LOGIN_BUTTON").onclick = async function() {
    if (logingIn == true) {
        return;
    }
    const MailId = id("MailInput").value;
    const Password = id("PasswordInput").value;

    if (isNull(MailId)) {
        showToast("Enter Mail Correctly");
        return;
    }

    if (isNull(Password)) {
        showToast("Enter Password Correctly");
        return;
    }

    logingIn = true;
    show("loading");
    const AccountData = await searchUserByEmail(MailId);

    logingIn = false;

    if (AccountData == null) {
        showToast("The Entered Mail Id Was InCorrect");
        hide("loading");
    } else {
        var Account = AccountData.data();
        Account.id = AccountData.id;

        if (isNull(Account.Password)) {
            showDialog("Account Info", "Currently Password Was Not Set For This Mail(" + MailId + ").So Click Confirm To Set '" + Password + "' As Password", async function() {
                hideDialog();

                await db.collection("ALLUSERS").doc(Account.id).update({
                    Password: Password
                });
                
                signIn({
                    Id: Account.id,
                    Name: Account.Name,
                    Mail: Account.Mail,
                    Type: Account.Type,
                    ProfileUrl : Account.ProfileUrl
                });

                CurrentPage("Auth");

                //Log
                Log("NEW", "(LogIn) " + (Account.Type == 0 ? "Admin" : "User") + " is Loged In " + Account.Name + " (" + MailId + ")");

                //Log
                Log("NEW", " Password Has been Choosen for " + Account.Name + " (" + MailId + ")");

                CurrentPage("Login");

                setTimeout(() => {
                    Navigate("Home");
                }, 1550);
                showToast("Login Success");
            }, function() {
                showToast("Password Was Not Set");
                hideDialog();
                hide("loading");
            })
        } else {
            if (Account.Password == Password) {

                signIn({
                    Id: Account.id,
                    Name: Account.Name,
                    Mail: Account.Mail,
                    Type: Account.Type,
                    ProfileUrl : Account.ProfileUrl
                });

                CurrentPage("Auth");
                //Log
                Log("NEW", "(LogIn) " + (Account.Type == 0 ? "Admin" : "User") + " is Loged In " + Account.Name + " (" + Account.Mail + ")");
                CurrentPage("Login");

                setTimeout(() => {
                    Navigate("Home");
                }, 1750);
                showToast("Login Success");
            } else {
                showToast("InCorrect Password");
                hide("loading");
            }
        }
    }
}

async function searchUserByEmail(email) {
    const MailIds = await db.collection("ALLUSERS").where("Mail", "==", email).get();
    if (MailIds.empty) {
        return null;
    } else {
        return MailIds.docs[0];
    }
}

