# Issue Reporting Button for Webex Devices
This macro allows users to report issues in a room through the Cisco device's user interface. Users can select an issue type, provide a short description, and enter their name. The macro then sends the incident report to a specified Webex space based on the device's location.

## Contacts
* Gerardo Chaves (gchaves@cisco.com)
* Mark Orszycki (morszyck@cisco.com)

## Solution Components
* Webex Devices
*  xAPI
*  Javascript

## Prerequisites
- **UI Extension Editor**: To create and activate custom panels, you can use the UI Extension Editor. You need a local Admin user on the device to create UI Extensions together with macros and the xAPI. Follow these instructions to launch the UI Extension Editor:
1. Open the local web interface for the device.
2. From the customer view in [https://admin.webex.com](https://admin.webex.com) go to the <b>Devices page</b>, and select your device in the list. Go to <b>Support</b> and click <b>Web Portal</b>. If you have set up an Admin, Integrator or RoomControl user for the device, you can access the local web interface directly by opening a web browser and typing in http(s)://<endpoint ip or hostname>.
3. From the <b>Customization</b> tab, select <b>UI Extensions Editor</b>.

> For more information about UI Extensions and how to load them from the devices web interface, visit [this article](https://help.webex.com/en-us/n18glho/User-Interface-Extensions-with-Room-and-Desk-Devices-and-Webex-Boards). You can find more details and screenshots 
also in [this guide](https://www.cisco.com/c/dam/en/us/td/docs/telepresence/endpoint/roomos-103/desk-room-kit-boards-customization-guide-roomos-103.pdf).

## Installation/Configuration.
## Step 1: Create a Webex bot
1. Register a new bot on the Webex Developer portal by visiting the following link:
   https://developer.webex.com/my-apps/new/bot
2. After creating the bot, save the bot's Access Token (bearer token); it will be used to authenticate API requests.

## Step 2: Manually obtaining Room IDs and updating app.js
1. Manually create Webex spaces and add the bot to each space.
2. Visit the https://developer.webex.com/docs/api/v1/rooms/list-rooms documentation to learn how to obtain the Room IDs using your bot token.
3. Once you have the Room IDs, open the app.js file and update the following with `BOT_TOKEN` and `Locations` constants.  
   For the `Locations` constant dictionary, create as many key value pairs as you have unique locations with Webex Spaces (rooms) associated to them. The key for each location consists of a string that can be found in the URI for the devices that are running the macro and the value is another key/value pair where the value is the actual space/room ID. For example, an entry with key 'MEMHQ' (case insensitive) will contain the ID of the webex space where the macro on device with URI 'memhq-room1@hww.room.ciscospark.com' will send the reports created by the macro when using the feedback button.

```javascript
const BOT_TOKEN = 'Your Webex bot token';
   
const Locations = {
  MEMHQ: {
    roomId: 'Your Webex room ID for Memphis location issue reports'
  },
  DALSITE: {
    roomId: 'Your Webex room ID for Dallas site issue reports'
  },
  WASHQ: {
    roomId: 'Your Webex room ID for Washington location issue reports'
  }
};
```

## Step 3: Upload the JavaScript macro to the Cisco Webex Local Device Controls and run the macro
1. In your Cisco Webex Local Device Controls:
   - In the left-hand control panel, select 'Macro Editor.'
   - If it's your first time accessing, you'll need to select 'Enable Macros.'
   - Select 'import from file…'
   - Upload the app.js file.
   - Rename and save your Macro.
   - Enable the Macro with the slider.

2. Load the JavaScript code included in the app.js file in this repository into a new Macro in the Macro editor of the Cisco Webex device you wish to use.

3. Activate the macro

> If you are unfamiliar with Cisco Room device macros, [this](https://help.webex.com/en-us/np8b6m6/Use-of-Macros-with-Room-and-Desk-Devices-and-Webex-Boards) is a good article to get started.

> For some sample code to show you how to automate the deployment of this macro, wallpapers, touch 10 UI controls and others to multiple Webex devices, you can visit [this repository](https://github.com/voipnorm/CE-Deploy)

> For information on deploying the macros, you can read the [Awesome xAPI GitHub repository](https://github.com/CiscoDevNet/awesome-xapi#user-content-developer-tools). In addition to the deployment information, this repository also has tutorials for different macro uses, articles dedicated to different macro capabilities, libraries to help interacting with codecs, code samples illustrating the xAPI capabilities, and sandbox and testing resources for macro applications.

### LICENSE

Provided under Cisco Sample Code License, for details see [LICENSE](LICENSE.md)

### CODE_OF_CONDUCT

Our code of conduct is available [here](CODE_OF_CONDUCT.md)

### CONTRIBUTING

See our contributing guidelines [here](CONTRIBUTING.md)

#### DISCLAIMER:
<b>Please note:</b> This script is meant for demo purposes only. All tools/ scripts in this repo are released for use "AS IS" without any warranties of any kind, including, but not limited to their installation, use, or performance. Any use of these scripts and tools is at your own risk. There is no guarantee that they have been through thorough testing in a comparable environment and we are not responsible for any damage or data loss incurred with their use.
You are responsible for reviewing and testing any scripts you run thoroughly before use in any non-testing environment.
