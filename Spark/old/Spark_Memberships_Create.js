importPackage(java.util);
importPackage(java.lang);
importPackage(java.io);
importPackage(com.cloupia.lib.util);
importPackage(com.cloupia.model.cIM);
importPackage(com.cloupia.service.cIM.inframgr);
importPackage(org.apache.commons.httpclient);
importPackage(org.apache.commons.httpclient.cookie);
importPackage(org.apache.commons.httpclient.methods);
importPackage(org.apache.commons.httpclient.auth);

//=================================================================
// Title:               Spark_Membership_Create
// Description:         This will add a user to a specific spark group
//
// Author:          	  Rob Edwards (@clijockey/robedwa@cisco.com)
// Date:                18/12/2015
// Version:             0.1
// Dependencies:
// Limitations/issues:
//=================================================================

// Inputs
var token = input.token;
var fqdn = "api.ciscospark.com";
var member = input.member;
var roomId = input.roomId;

// Build up the URI
var primaryTaskPort = "443";
var primaryTaskUri = "/v1/memberships";

// Request Parameters to be passed
var primaryTaskData = "{\"roomId\" : \""+roomId+"\",\
    \"personEmail\" : \""+member+"\", \
    \"isModerator\" : false}";

// Main code start
// Perform primary task
logger.addInfo("Request to https://"+fqdn+":"+primaryTaskPort+primaryTaskUri);
logger.addInfo("Sending payload: "+primaryTaskData);

var proxy_host = "proxy-wsa.esl.cisco.com";
var proxy_port = "80";
var taskClient = new HttpClient();
if (proxy_host != null) {
    taskClient.getHostConfiguration().setProxy(proxy_host, proxy_port);
}

taskClient.getHostConfiguration().setHost(fqdn, primaryTaskPort, "https");
taskClient.getParams().setCookiePolicy("default");
taskMethod = new PostMethod(primaryTaskUri);
taskMethod.setRequestEntity(new StringRequestEntity(primaryTaskData));
taskMethod.addRequestHeader("Content-Type", "application/json");
taskMethod.addRequestHeader("Accept", "application/json");
taskMethod.addRequestHeader("Authorization", token);
taskClient.executeMethod(taskMethod);

// Check status code once again and fail task if necessary.
statuscode = taskMethod.getStatusCode();
resp=taskMethod.getResponseBodyAsString();
logger.addInfo("Response received: "+resp);

// if (statuscode > 299)
// {
//     logger.addError("Failed to configure Spark. HTTP response code: "+statuscode);
//     // Set this task as failed.
//     ctxt.setFailed("Request failed.");
// } else {
//     logger.addInfo("Return code "+statuscode+": successfully configured Openstack task.");
//     logger.addInfo("Response received: "+resp);
//      // Extract ID
//      var resparray=resp.split("\"");
//      var index=43;
//      var objectId = resparray[index];
//      //logger.addInfo("Previous element: "+resparray[index-1]);
//      logger.addInfo("Derived element: "+objectId);
//      //logger.addInfo("Next element: "+resparray[index+1]);
// }
// taskMethod.releaseConnection();

// Process returned status codes
//if (statuscode = 200)
//{
//    logger.addInfo("All looks good. HTTP response code: "+statuscode);
if (statuscode == 400) {
    logger.addError("Failed to configure Spark. HTTP response code: "+statuscode);
    logger.addInfo("Return code "+statuscode+": The request was invalid or cannot be otherwise served. An accompanying error message will explain further.");
    logger.addInfo("Response received: "+resp);
    // Set this task as failed.
    ctxt.setFailed("Request failed.");
} else if (statuscode == 401) {
    logger.addError("Failed to configure Spark. HTTP response code: "+statuscode);
    logger.addInfo("Return code "+statuscode+": Authentication credentials were missing or incorrect.");
    logger.addInfo("Response received: "+resp);
    // Set this task as failed.
    ctxt.setFailed("Request failed.");
} else if (statuscode == 403) {
    logger.addError("Failed to configure Spark. HTTP response code: "+statuscode);
    logger.addInfo("Return code "+statuscode+": The request is understood, but it has been refused or access is not allowed.");
    logger.addInfo("Response received: "+resp);
    // Set this task as failed.
    ctxt.setFailed("Request failed.");
} else if (statuscode == 404) {
    logger.addError("Failed to configure Spark. HTTP response code: "+statuscode);
    logger.addInfo("Return code "+statuscode+": The URI requested is invalid or the resource requested, such as a user, does not exist. Also returned when the requested format is not supported by the requested method.");
    logger.addInfo("Response received: "+resp);
    // Set this task as failed.
    ctxt.setFailed("Request failed.");
} else if (statuscode == 409) {
    logger.addWarn("Failed to configure Spark. HTTP response code: "+statuscode);
    logger.addInfo("Return code "+statuscode+": The request could not be processed because it conflicts with some established rule of the system. For example, a person may not be added to a room more than once.");
    logger.addInfo("Response received: "+resp);
} else if (statuscode == 500) {
    logger.addError("Failed to configure Spark. HTTP response code: "+statuscode);
    logger.addInfo("Return code "+statuscode+": Something went wrong on the server.");
    logger.addInfo("Response received: "+resp);
    // Set this task as failed.
    ctxt.setFailed("Request failed.");
} else if (statuscode == 501) {
    logger.addError("Failed to configure Spark. HTTP response code: "+statuscode);
    logger.addInfo("Return code "+statuscode+": Server is overloaded with requests. Try again later.");
    logger.addInfo("Response received: "+resp);
    // Set this task as failed.
    ctxt.setFailed("Request failed.");
} else {
    logger.addInfo("All looks good. HTTP response code: "+statuscode);
    //logger.addError("Return code "+statuscode+": Something unknown happend!!");
    // Set this task as failed.
    //ctxt.setFailed("Request failed.");
}
taskMethod.releaseConnection();
