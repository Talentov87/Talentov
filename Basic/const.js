//Constants
const USER_DATA_STORE = "UserData";
const USER_DATA_STORE_DB = "Globe_User_Data";
const INTENT_SHARABLE = "SharableDataPoint";
const QuickSet = parse("QuickSet");
const Intent = parse(INTENT_SHARABLE);

const DB_PROTOCALL = "http";
const DB_DOMAIN = "ec2-54-210-243-240.compute-1.amazonaws.com";
const DB_PORT = "5000";

const DB_URL = DB_PROTOCALL + "://" + DB_DOMAIN + ":" + DB_PORT;















function parse(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch (e) {
        return null;
    }
}