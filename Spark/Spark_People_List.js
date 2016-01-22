// NOT TESTED & NEEDS FURTHER WORK FOR GET REQUESTS!!!
//=================================================================
// Title:               Spark_People_List
// Description:         People are registered users of the Spark
//                      application. Currently, people can only be
//                      searched with this API. Future releases of
//                      the API will allow for more complete user
//                      administration.
//                      To learn more about managing people in a
//                      room see https://developer.ciscospark.com/resource-memberships.html
//
// Author:              Rob Edwards (@clijockey/robedwa@cisco.com)
// Date:                18/12/2015
// Version:             0.1
// Dependencies:
// Limitations/issues:
//=================================================================

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

// Inputs from UCSD
var token = input.token;                    // API token/Key
var email = input.email;                    // email address of user to be listed
var displayName = input.displayName;        // People whoose name starts with this string
var max = input.max;                        //

// Variables
var fqdn = "api.ciscospark.com";            // Spark URL
var proxy_host = ""; // Corp Proxy
var proxy_port = "80";                      // Port used by corp proxy

// Build up the URI
var primaryTaskPort = "443";
//var primaryTaskUri = "/v1/people/?";

if (email !== null) {
    var primaryTaskUri = "/v1/people/?email=" + email;
} else if (displayName !== null) {
    var primaryTaskUri = "/v1/people/?displayName=" + displayName;
} else if (max !=== null) {
    var primaryTaskUri = primaryTaskUri + "&max=" + max;
}


// Main code start
// Perform primary task
logger.addInfo("Request to https://"+fqdn+":"+primaryTaskPort);
logger.addInfo("Sending payload: "+primaryTaskData);


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

// Process returned status codes
if (statuscode > 200) {
    logger.addInfo("All looks good. HTTP response code: "+statuscode);
} else if (statuscode = 400) {
    logger.addError("Failed to configure Spark. HTTP response code: "+statuscode);
    logger.addInfo("Return code "+statuscode+": The request was invalid or cannot be otherwise served. An accompanying error message will explain further.");
    logger.addInfo("Response received: "+resp);
    // Set this task as failed.
    ctxt.setFailed("Request failed.");
} else if (statuscode = 401) {
    logger.addError("Failed to configure Spark. HTTP response code: "+statuscode);
    logger.addInfo("Return code "+statuscode+": Authentication credentials were missing or incorrect.");
    logger.addInfo("Response received: "+resp);
    // Set this task as failed.
    ctxt.setFailed("Request failed.");
} else if (statuscode = 403) {
    logger.addError("Failed to configure Spark. HTTP response code: "+statuscode);
    logger.addInfo("Return code "+statuscode+": The request is understood, but it has been refused or access is not allowed.");
    logger.addInfo("Response received: "+resp);
    // Set this task as failed.
    ctxt.setFailed("Request failed.");
} else if (statuscode = 404) {
    logger.addError("Failed to configure Spark. HTTP response code: "+statuscode);
    logger.addInfo("Return code "+statuscode+": The URI requested is invalid or the resource requested, such as a user, does not exist. Also returned when the requested format is not supported by the requested method.");
    logger.addInfo("Response received: "+resp);
    // Set this task as failed.
    ctxt.setFailed("Request failed.");
} else if (statuscode = 409) {
    logger.addError("Failed to configure Spark. HTTP response code: "+statuscode);
    logger.addInfo("Return code "+statuscode+": The request could not be processed because it conflicts with some established rule of the system. For example, a person may not be added to a room more than once.");
    logger.addInfo("Response received: "+resp);
    // Set this task as failed.
    ctxt.setFailed("Request failed.");
} else if (statuscode = 500) {
    logger.addError("Failed to configure Spark. HTTP response code: "+statuscode);
    logger.addInfo("Return code "+statuscode+": Something went wrong on the server.");
    logger.addInfo("Response received: "+resp);
    // Set this task as failed.
    ctxt.setFailed("Request failed.");
} else if (statuscode = 501) {
    logger.addError("Failed to configure Spark. HTTP response code: "+statuscode);
    logger.addInfo("Return code "+statuscode+": Server is overloaded with requests. Try again later.");
    logger.addInfo("Response received: "+resp);
    // Set this task as failed.
    ctxt.setFailed("Request failed.");
} else {
      logger.addError("Return code "+statuscode+": Something unknown happend!!");
      // Set this task as failed.
      ctxt.setFailed("Request failed.");
}
taskMethod.releaseConnection();
