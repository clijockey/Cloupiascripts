//=================================================================
// Title:               Spark_membership_delete
// Description:         This will delete a member from a specific spark group
//
// Author:              Rob Edwards (@clijockey/robedwa@cisco.com)
// Date:                18/12/2015
// Version:             1.2 (updated 22/01/2016)
// Dependencies:
// Limitations/issues:  Updated for UCSD 5.4
//=================================================================

importPackage(java.util);
importPackage(java.lang);
importPackage(java.io);
importPackage(com.cloupia.lib.util);
importPackage(org.apache.commons.httpclient);
importPackage(org.apache.commons.httpclient.cookie);
importPackage(org.apache.commons.httpclient.methods);
importPackage(org.apache.commons.httpclient.auth);
importPackage(org.apache.commons.httpclient.protocol);
importClass(org.apache.commons.httpclient.protocol.SecureProtocolSocketFactory);
importPackage(com.cloupia.lib.cIaaS.vcd.api);

//----------------------------------------------------------------------------------------
//
//        Author: Russ Whitear (rwhitear@cisco.com)
//
// Function Name: httpRequest()
//
//       Version: 3.0
//
// Modifications: Added HTTP header Connection:close to execute method to overcome the
//                CLOSE_WAIT issue caused with releaseConnection().
//
//                Modified SSL socket factory code to work with UCS Director 5.4.0.0.
//
//   Description: HTTP Request function - httpRequest.
//
//                I have made the httpClient functionality more object like in order to
//                make cloupia scripts more readable when making many/multiple HTTP/HTTPS
//                requests within a single script.
//
//      Usage: 1. var request = new httpRequest();                   // Create new object.
//
//             2. request.setup("192.168.10.10","https","admin","cisco123");      // SSL.
//          or:   request.setup("192.168.10.10","http","admin","cisco123");       // HTTP.
//          or:   request.setup("192.168.10.10","https");           // SSL, no basicAuth.
//          or:   request.setup("192.168.10.10","http");            // HTTP, no basicAuth.
//
//             3. request.getRequest("/");                    // HTTP GET (URI).
//          or:   request.postRequest("/","some body text");  // HTTP POST (URI,BodyText).
//          or:   request.deleteRequest("/");                 // HTTP DELETE (URI).
//
//  (optional) 4. request.contentType("json");            // Add Content-Type HTTP header.
//          or:   request.contentType("xml");
//
//  (optional) 5. request.addHeader("X-Cloupia-Request-Key","1234567890");  // Any Header.
//
//             6. var statusCode = request.execute();                     // Send request.
//
//             7. var response = request.getResponse("asString");   // Response as string.
//          or:   var response = request.getResponse("asStream");   // Response as stream.
//
//             8. request.disconnect();                             // Release connection.
//
//
//          Note: Be sure to add these lines to the top of your script:
//
//          importPackage(java.util);
//          importPackage(com.cloupia.lib.util);
//          importPackage(org.apache.commons.httpclient);
//          importPackage(org.apache.commons.httpclient.cookie);
//          importPackage(org.apache.commons.httpclient.methods);
//          importPackage(org.apache.commons.httpclient.auth);
//          importPackage(org.apache.commons.httpclient.protocol);
//          importClass(org.apache.commons.httpclient.protocol.SecureProtocolSocketFactory);
//          importPackage(com.cloupia.lib.cIaaS.vcd.api);
//
//----------------------------------------------------------------------------------------

var httpRequest = function () {};

httpRequest.prototype.setup = function(serverIp, transport, username, password) {
    this.serverIp = serverIp;
    this.transport = transport;
    this.username = username;
    this.password = password;

    this.httpClient = new HttpClient();

    // Decide whether to create an HTTP or HTTPS connection based up 'transport'.
    if( this.transport == "https" ) {
		this.httpClient = CustomEasySSLSocketFactory.getIgnoreSSLClient(this.serverIp, 443);

        // Set proxy configuration if proxy info has been passed to the task
        if (proxyHost) {
            logger.addInfo("Proxy configuration has been passed, adding - "+proxyHost+":"+proxyPort);
            this.httpClient.getHostConfiguration().setProxy(proxyHost, proxyPort);
        }

		this.httpClient.getParams().setCookiePolicy("default");
    } else {
        // Create new HTTP connection.
        this.httpClient.getHostConfiguration().setHost(this.serverIp, 80, "http");
    }

    this.httpClient.getParams().setCookiePolicy("default");

    // If username and password supplied, then use basicAuth.
    if( this.username && this.password ) {
        this.httpClient.getParams().setAuthenticationPreemptive(true);
        this.defaultcreds = new UsernamePasswordCredentials(this.username, this.password);
        this.httpClient.getState().setCredentials(new AuthScope(this.serverIp, -1, null), this.defaultcreds);
    }
};

httpRequest.prototype.contentType = function(contentType) {
    this.contentType = contentType;

    this.contentTypes = [
        ["xml","application/xml"],
        ["json","application/json"]
    ];

    for( this.i=0; this.i<this.contentTypes.length; this.i++)
        if(this.contentTypes[this.i][0] == this.contentType)
            this.httpMethod.addRequestHeader("Content-Type", this.contentTypes[this.i][1]);
};

httpRequest.prototype.addHeader = function(headerName,headerValue) {
    this.headerName = headerName;
    this.headerValue = headerValue;

    this.httpMethod.addRequestHeader(this.headerName, this.headerValue);
};

httpRequest.prototype.execute = function() {
    // Connection:close is hard coded here in order to ensure that the TCP connection
    // gets torn down immediately after the request. Comment this line out if you wish to
    // experiment with HTTP persistence.
    this.httpMethod.addRequestHeader("Connection", "close");

    this.httpClient.executeMethod(this.httpMethod);

    // Retrieve status code.
    this.statusCode = this.httpMethod.getStatusCode();

    return this.statusCode;
}

httpRequest.prototype.getRequest = function(uri) {
    this.uri = uri;

    // Get request.
    this.httpMethod = new GetMethod(this.uri);
};

httpRequest.prototype.postRequest = function(uri,bodytext) {
    this.uri = uri;
    this.bodytext = bodytext;

    // POST Request.
    this.httpMethod = new PostMethod(this.uri);
    this.httpMethod.setRequestEntity(new StringRequestEntity(this.bodytext));
};

httpRequest.prototype.getResponse = function(asType) {
    this.asType = asType;

    if( this.asType == "asStream" )
        return this.httpMethod.getResponseBodyAsStream();
    else
        return this.httpMethod.getResponseBodyAsString();
};

httpRequest.prototype.deleteRequest = function(uri) {
    this.uri = uri;

    // Get request.
    this.httpMethod = new DeleteMethod(this.uri);
};

httpRequest.prototype.disconnect = function() {
    // Release connection.
    this.httpMethod.releaseConnection();
};




//----------------------------------------------------------------------------------------
// Author:      Rob Edwards (@clijockey/robedwa@cisco.com)
// Description: Delete a memeber from a Spark group
//----------------------------------------------------------------------------------------
function membershipDelete(token,messageId) {
  this.destination = "api.ciscospark.com";
  this.token = token;
  this.messageId = messageId;


  var postURI = '/v1/messages/'+messageId
  logger.addInfo("The delete URL will : "+postURI);
  // Make Rest call
  var request = new httpRequest();
  request.setup(this.destination,"https");
  request.deleteRequest(postURI);
  request.contentType("json");
  request.addHeader("Authorization", token);

  var statusCode = request.execute();
  if (statusCode != 204) {
      logger.addError("Request failed. HTTP response code: "+statusCode);
      logger.addError("Response = "+request.getResponse("asString"));

      request.disconnect();

      // Set this task as failed.
      ctxt.setFailed("Request failed.");
  } else {
      /// All done. Release HTTP connection anyway.
      request.disconnect();

      return true;
  }

}

//////////////////////////////////////////////////////////////////////////////////////////

// main();

// Workflow Inputs.
var token = input.token;
var messageId = input.messageId;

var result = messageDelete(token,messageId);
//logger.addInfo("Testing return: "+result);

if( result )
    logger.addInfo("Successfully posted message");
    //output.messageId = result;


// Register rollback task.
//registerUndoTask(token,messageId);
