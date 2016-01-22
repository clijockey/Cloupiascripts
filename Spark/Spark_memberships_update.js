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

// NOT TESTED!!!
//=================================================================
// Title:               Spark_Membership_Update
// Description:
//
// Author:          	  Rob Edwards (@clijockey/robedwa@cisco.com)
// Date:                18/12/2015
// Version:             0.1
// Dependencies:
// Limitations/issues:
//=================================================================

// Inputs
var token = input.token;
//var token = "Bearer MzA5ODA4OTUtNDBjYi00NzhlLTg3NDYtOTEyNWMyNzRmM2NiMDBiMDU5ZGUtMDZl";
var fqdn = "api.ciscospark.com";
var member = input.member;
var roomId = input.roomId;

// Build up the URI
var primaryTaskPort = "443";
var primaryTaskUri = "/v1/memberships";

// Data to be passed

//var primaryTaskData = "{\"roomId\" : \"Y2lzY29zcGFyazovL3VzL1JPT00vMDFkMmM5NjAtOWVjNy0xMWU1LTk2OTItZWIwMjZmZTliY2Mw\",\
//    \"personEmail\" : \"rob.edwards@outlook.com\", \
//    \"isModerator\" : false}";

var primaryTaskData = "{\"roomId\" : \""+roomId+"\",\
    \"personEmail\" : \""+member+"\", \
    \"isModerator\" : false}";

// Main code start
// Perform primary task
logger.addInfo("Request to https://"+fqdn+":"+primaryTaskPort+primaryTaskUri);
logger.addInfo("Sending payload: "+primaryTaskData);

var proxy_host = "";
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

if (statuscode > 299)
{
    logger.addError("Failed to configure Spark. HTTP response code: "+statuscode);
    // Set this task as failed.
    ctxt.setFailed("Request failed.");
} else {
    logger.addInfo("Return code "+statuscode+": successfully configured Openstack task.");
    logger.addInfo("Response received: "+resp);
     // Extract ID
     var resparray=resp.split("\"");
     var index=43;
     var objectId = resparray[index];
     //logger.addInfo("Previous element: "+resparray[index-1]);
     logger.addInfo("Derived element: "+objectId);
     //logger.addInfo("Next element: "+resparray[index+1]);
}
taskMethod.releaseConnection();
