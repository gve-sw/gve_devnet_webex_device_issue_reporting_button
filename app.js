/*
Copyright (c) 2022 Cisco and/or its affiliates.

This software is licensed to you under the terms of the Cisco Sample
Code License, Version 1.1 (the "License"). You may obtain a copy of the
License at

               https://developer.cisco.com/docs/licenses

All use of the material herein must be in accordance with the terms of
the License. All rights not expressly granted by the License are
reserved. Unless required by applicable law or agreed to separately in
writing, software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied.
*/


/********************************************************
 * Configure the settings below
**********************************************************/

import xapi from 'xapi';

//Specify the Initial issue topics (up to 5)
const issueOptions = {
   Title: 'Report issue in this room:',
   Text: 'What type of issue?',
   'Option.1': 'Room System Issue',
   "Option.2": 'Facility issue',
   'Option.3': 'Request Security',
   'Option.4': 'Catering Request',
   'Option.5': 'Share Feedback',
   FeedbackId: 'issue-category',
   Duration: 20,
};
 
//Configure the 2nd and 3rd input prompt text
const promptText = {
    second: {
    Title: 'Report issue step 2:',
    Text: 'Enter a short description of the issue'
    },
    third: {
    Title: 'Report issue step 3:',
    Text: 'Please enter your name'
   }
}
 
// Webex token for the bot that is used to send the feedback messages to the various spaces
const BOT_TOKEN = 'Your Webex bot token';

// Create as many key value pairs as you have unique locations with Webex Spaces (rooms) associated to them 
// The key for each location consists of a string that can be found in the URI for the devices that are running the 
// macro and the value is another key/value pair where the value is the actual space/room ID. 
// For example, an entry with key 'MEMHQ' (case insensitive) will contain the ID of the webex space where the macro
// on device with URI 'memhq-room1@hww.room.ciscospark.com' will send the reports created by the macro when using the feedback button
const Locations = {
    MEMHQ: { 
    roomId: 'Your Webex room ID for Memphis location issue reports'
    },
    DALSITE: {
    roomId: 'Your Webex room ID for Dallas location issue reports'
    },
    WASHQ: {
    roomId: 'Your Webex room ID for McClean location issue reports'
   }
};

/*********************************************************
  * Main function to setup and add event listeners
**********************************************************/
 
//Macros variables
let serialNumber;
let issueCategory;
let issueComment;
let software;
let person;
let ipAddress;
 
//retrieve deviceURI
async function getURI() {
    const deviceURI = await xapi.Status.UserInterface.ContactInfo.ContactMethod[1].Number.get();
    //const deviceURI = 'memhq-room1@hww.room.ciscospark.com'; //For Testing
    return deviceURI;
}
 
//parse the deviceURI and extract location-room
function parseDeviceURI(deviceURI) {
   const regex = /^(.+)-(.+)@.+/;
   const match = deviceURI.match(regex);
   let actualLocName;
   let actualRoomName;

   //storing URI regex matches (1 - Location Name, 2 - Room)
   if (match) {
    actualLocName = match[1].toLowerCase();
    actualRoomName = match[2];
   }
    return {
        actualLocName,
        actualRoomName
   };
}
 
 //match the roomName in the dictionary and return roomId
function getRoomIdFromDict(locationName) {
    if (Locations.hasOwnProperty(locationName)) {
    return Locations[locationName].roomId;
    } else {
    return null;
    }
}
 
//Build incident report. Edit below to change actual text reported in message
async function createReport() {
    const parsedURI = await getURI().then(parseDeviceURI);
    const actualRoomName = parsedURI.actualRoomName;
    const actualLocName = parsedURI.actualLocName;

    return `Incident Report:
    - Category: ${issueCategory}
    - Description: ${issueComment}
    - Reported By: ${person}
    - Software: ${software}
    - Serial number: ${serialNumber}
    - IP Address: ${ipAddress}
    - Device URI: ${await getURI()}
    - Campus: ${actualLocName}
    - Campus Room Name: ${actualRoomName}`;
}
 
//Post a message to a Webex Space
function postMessageToWebexSpace(roomId, message) {
    const url = 'https://webexapis.com/v1/messages';
    const headers = `Bearer ${BOT_TOKEN}`;
    const data = {
        'roomId': roomId,
        'text': message
    };
    xapi.command('HttpClient Post', {
        'Header': [`Authorization: ${headers}`, 'Content-Type: application/json'],
        'Url': url,
        'AllowInsecureHTTPS': 'True'
    }, JSON.stringify(data))
        .then(response => {
            console.log('Message sent to Webex space:', response);
        })
        .catch(error => {
            console.error('Error posting message to Webex space:', error);
        });
}
  
//Send incident report to webex space
async function sendReportToWebexSpace() {
    const report = await createReport(); 
    const parsedURI = await getURI().then(parseDeviceURI); //retrieve and parseDeviceURI
    const roomId = getRoomIdFromDict(parsedURI.actualLocName.toUpperCase()); //match roomId to location of device
  
    if (roomId) {
        postMessageToWebexSpace(roomId, report);
        alert('Report sent', 'Thank you for reporting the issue. We will address it as soon as possible.', 5);
    } else {
        alert('Error', 'Unable to send report. Invalid room name.', 5);
    }
}
  
//Display an alert message on the device UI
function alert(title, text, duration) {
    xapi.Command.UserInterface.Message.Alert.Display({ Title: title, Text: text, Duration: duration });
    console.log(`${title}: ${text}`);
}
  
//Handle the input text for the incident report
function onTextInput(e) {
    // If the input is for the issue comment
    if (e.FeedbackId === 'issue-comment') {
      issueComment = e.Text;
      // Display the third input prompt after a short delay
      setTimeout(() => {
        xapi.Command.UserInterface.Message.TextInput.Display({
          Title: promptText.third.Title,
          Text: promptText.third.Text,
          FeedbackId: 'issue-name',
          InputText: '',
        });
      }, 600);
    }
    // If the input is for the user's name
    else if (e.FeedbackId === 'issue-name') {
      person = e.Text;
      // Send the incident report to the appropriate Webex space
      sendReportToWebexSpace();
    }
}
  
// Handle the prompt response event
function onPromptResponse(e) {
    if (e.FeedbackId !== 'issue-category') return;
    issueCategory = issueOptions['Option.' + e.OptionId];
    // Display the second input prompt
    xapi.Command.UserInterface.Message.TextInput.Display({
      Title: promptText.second.Title,
      Text: promptText.second.Text,
      InputText: '',
      FeedbackId: 'issue-comment',
      Duration: 600,
    });
}
  
//Handle the panel click event
function onPanelClicked(e) {
    // If the clicked panel is the "report-issue" panel
    if (e.PanelId === 'report-issue') {
      // Display the issue category prompt
      xapi.Command.UserInterface.Message.Prompt.Display(issueOptions);
    }
}
  
//Create the Button
function createPanel() {
    const panel = `
    <Extensions>
      <Version>1.9</Version>
      <Panel>
        <PanelId>report-issue</PanelId>
        <Origin>local</Origin>
        <Type>Statusbar</Type>
        <Location>HomeScreenAndCallControls</Location>
        <Icon>Info</Icon>
        <Color>#FC5143</Color>
        <Name>Report Issue</Name>
        <ActivityType>Custom</ActivityType>
      </Panel>
    </Extensions>`;
    xapi.Command.UserInterface.Extensions.Panel.Save(
      { PanelId: 'report-issue' },
      panel
    )
}

//Initialize macro
async function init() {
  await xapi.Config.HttpClient.Mode.set('On');
  await xapi.Config.HttpClient.AllowInsecureHTTPS.set('True');
  serialNumber = await xapi.Status.SystemUnit.Hardware.Module.SerialNumber.get();
  software = await xapi.Status.SystemUnit.Software.DisplayName.get();
  ipAddress = await xapi.Status.Network.IPv4.Address.get();

  // Set event listeners
  xapi.Event.UserInterface.Extensions.Panel.Clicked.on(onPanelClicked);
  xapi.Event.UserInterface.Message.Prompt.Response.on(onPromptResponse);
  xapi.Event.UserInterface.Message.TextInput.Response.on(onTextInput);
  // Create the "Report Issue" button
  createPanel();
}

init();
