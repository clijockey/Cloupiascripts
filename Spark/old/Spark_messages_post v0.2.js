//=================================================================
// Title:               Spark_messages_post
// Description:         This will post a message to a specific spark group
//
// Author:              Rob Edwards (@clijockey/robedwa@cisco.com)
// Date:                18/12/2015
// Version:             0.2
// Dependencies:
// Limitations/issues:  Updated for UCSD 5.4
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
importPackage(java.lang);
importClass(org.apache.commons.httpclient.protocol.SecureProtocolSocketFactory);
importPackage(com.cloupia.lib.cIaaS.vcd.api);

// Inputs
var token = input.token;
var fqdn = "api.ciscospark.com";
var message = input.message;
var file = input.file;
var roomId = input.roomId;
var proxy_host = input.proxy;
var proxy_port = input.proxy_port;

// Build up the URI
var primaryTaskPort = "443";
var primaryTaskUri = "/v1/messages";

// Construct JSON:
var map = new HashMap();
map.put("roomId", roomId);
// Check if this will be posting a message and/or file to the room
if (!message.equals("")) {
  map.put("text", message);
}
if (!file.equals("")) {
  map.put("file", file);
}
var primaryTaskData = JSON.javaToJsonString(map, map.getClass());

logger.addInfo("Sending JSON: " + primaryTaskData);

// Main code start
// Perform primary task
logger.addInfo("Request to https://"+fqdn+":"+primaryTaskPort+primaryTaskUri);
logger.addInfo("Sending payload: "+primaryTaskData);

//var taskClient = new HttpClient();
var taskClient = CustomEasySSLSocketFactory.getIgnoreSSLClient(fqdn, 443);
if (proxy_host != null) {
    taskClient.getHostConfiguration().setProxy(proxy_host, proxy_port);
}

//taskClient.getHostConfiguration().setHost(fqdn, primaryTaskPort, "https");
taskClient.getParams().setCookiePolicy("default");
taskMethod = new PostMethod(primaryTaskUri);
taskMethod.setRequestEntity(new StringRequestEntity(primaryTaskData));
taskMethod.addRequestHeader("Content-Type", "application/json");
taskMethod.addRequestHeader("Accept", "application/json");
taskMethod.addRequestHeader("Authorization", token);
taskClient.executeMethod(taskMethod);

// Check status code once again and fail task if necessary.
statuscode = taskMethod.getStatusCode();
resp = taskMethod.getResponseBodyAsString();
//logger.addInfo("Response received: "+resp);

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
    var jsonData = JSON.getJsonElement(resp,null);

    if (jsonData.has("id")) {
        var messageId = JSON.getJsonElement(resp, "id");
        logger.addInfo("The posted message ID is: "+messageId);

    }
}
taskMethod.releaseConnection();
