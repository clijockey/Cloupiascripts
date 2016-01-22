//=================================================================
// Title:               TechHuddle Contractor
// Description:         This is part of the Jan 2015 Cisco TechHuddle
//                      demo. It is used as a custom task in UCS Direcor
//                      to workout the correct syntax for a number of
//                      powershell commands and Spark messages.
//                      It will take a number of inputs and create the
//                      required syntax which is availbe as an output to
//                      be used by other tasks in the workflow. 
//
// Author:          	  Rob Edwards (@clijockey/robedwa@cisco.com)
// Date:                18/12/2015
// Version:             0.1
// Dependencies:
// Limitations/issues:
//=================================================================

logger.addInfo("Taking the input parameters and making them useful");
// Take inputs
var Pass = input.Pass;
// Take first and last name and create an account user name by taking the 1st charector of the 1st name and whole last name
var shortname = input.FirstName.substr(0,1) + input.LastName;
// Generate email address based on inputs
var email = input.FirstName + "." +input.LastName + "@miggins.com";


// Powershell syntax to create a new user in AD
//output.PowerShell_ADUser = "New-ADUser -Name \"" +input.FirstName + " " + input.LastName+ "\" -Enabled 1 -GivenName \"" + input.FirstName + "\" -Surname \"" + input.LastName + "\" -SamAccountName \"" + shortname +"\" -UserPrincipalName \"" + shortname + "\@miggins.com\""
output.PowerShell_ADUser = "New-ADUser -Name \"" +input.FirstName + " " + input.LastName+ "\" -Enabled 1 -GivenName \"" + input.FirstName + "\" -Surname \"" + input.LastName + "\" -SamAccountName \"" + shortname +"\" -UserPrincipalName \"" + shortname + "\@miggins.com\"";
logger.addInfo("Created Powershell syntax to create a new user in AD");
logger.addInfo(output.PowerShell_ADUser);
// Powershell syntax set user password in AD
output.PowerShell_ADPassword = "Set-ADAccountPassword -Identity " + shortname + " -Reset -NewPassword (ConvertTo-SecureString -AsPlainText \"C15co123\" -Force)"
logger.addInfo("Created Powershell syntax set user password in AD");
logger.addInfo(output.PowerShell_ADPassword);
// Powershell syntax to put a user in AD group
output.PowerShell_ADGroup = "Add-ADGroupMember -Members \"" + shortname + "\" -Identity contractor";
logger.addInfo("Created Powershell syntax to put a user in AD group");
logger.addInfo(output.PowerShell_ADGroup);

output.Email = email;
logger.addInfo("Created email variable to be passed to other tasks");
logger.addInfo(output.Email);

output.SparkMessage = "Please welcome " + input.FirstName + " " + input.LastName + " to the Manchester office. They are joining us as a contractor.";
logger.addInfo("Created Spark Message");
logger.addInfo(output.SparkMessage);
