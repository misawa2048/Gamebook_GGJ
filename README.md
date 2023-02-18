# Gamebook_GGJ
This is a simple gamebook engine using Google spread sheet.  
gamebook is a type of books you select story youeself.  
this application has made for [Global Game Jam 2023](https://globalgamejam.org/).  

[sample(Japanese)](https://misawa2048.github.io/Gamebook_GGJ/gamebook/?apikey=AKfycbwrT31aa89MyK6-4VWei_PYufr-FbZd-1c-AZK1E5F3OEYQPm9vgoZ6Uxdl5_ISa54x5g)  
<img src="https://camo.qiitausercontent.com/6aed9684ed29dc4d4ad84ec6f98957576c7827ab/68747470733a2f2f71696974612d696d6167652d73746f72652e73332e61702d6e6f727468656173742d312e616d617a6f6e6177732e636f6d2f302f35393931312f36633039356537652d356339612d616165392d663366642d3436313437623763626565362e706e67" width="360px">   

# HOW TO CREATE YOUE GAME BOOK 
[日本語版 instruction for Japanese](https://qiita.com/ELIXIR/items/65f80116418550ab1f85)  
## Create a new Google spread sheet
##### 1. create a new Google spread sheet by your account.  
##### 2. set sheet name to "masterSheet".  
##### 3. make 1st row as following:  
| label | text | buttons | image | se | params |
|:-:|:-:|:-:|:-:|:-:|:-:|  

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/59911/44e4b63e-eb31-4117-79f4-8eff190bfc51.png)  

## Create a new Apps Script
##### 1. select Extensions > Apps Script  
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/59911/ef7a0a7e-d70a-d247-6761-279e61e5b9f3.png)  

##### 2. replace script:  
```
const DEF_SHEET  = "masterSheet";
function doGet(e) {
  const sName = (typeof e === "undefined" || typeof e.parameter.sheet === "undefined")?DEF_SHEET:e.parameter.sheet;
  const sheet = SpreadsheetApp.getActive().getSheetByName(sName);
  let resultDat= read(sheet);
  const json = JSON.stringify({"items": resultDat,"sheet":sName}, null, 2);// Read
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function read(_sheet){
  const rows = _sheet.getDataRange().getValues();
  const keys = rows.splice(0, 1)[0];
  var resultDat = [];
  for(var i=0;i<rows.length;++i){
    const obj = {};
    rows[i].map((item, index) => {
      obj[String(keys[index])] = String(item);
    });
    resultDat.push(obj);
  }
  return resultDat;
}
```

before:  
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/59911/6ac483bb-b5e9-4d6a-c363-fe59416bb926.png)

after:  
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/59911/91d10a2d-e4b3-6385-773d-ce986370f9c8.png)

## Deploy
##### 1. deploy and keep your Deployment ID.
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/59911/f65b54fd-808b-6a17-211f-d2de8028816d.png)  
<img src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/59911/282f7067-df6c-1933-4338-4343a648af37.png" width="65%">   
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/59911/f947e919-80cd-f163-5c8b-95a5734e192e.png)  

##### 2. paste your Deployment ID to [global.js](https://github.com/misawa2048/Gamebook_GGJ/blob/master/gamebook/global.js)
``` global.js
let API_POINT = "https://script.google.com/macros/s/";
let DEF_SHEET_NAME = 'masterSheet';
let MUTE_SE = "" //"./audio/mute.wav";
var g_apiKey = "YOUR_DEPLOYMENT_ID"; //<- here.
var g_isDebug = false;
```

## Make your gamebook by page.
| item | content |
|-:|:-|
|label   |label for jump buttons  |
|text   |message   |
|buttons   |jump buttons   |
|image   |image url   |
|se   |sound url(.wav)  |
|params   |reserved(not use)   |
  
#### ```buttons```   
there are 3 methods to junp to another page.
##### {++}
```Go to next space{++}```  means jump to next row.  
##### {label}
```Go to next space{labelName}```  means jump to a row it has a same label name.  
*labelName* must **not** start with number.  
##### {number}
```Go to next space{4}```  means jump to 4th row in same spreadsheet.  

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/59911/5ea658fc-c124-d7b1-b75c-448b333b398d.png)  
you can use &lt;br&gt; tag in button text  
```Go to next space<br>and escape{escape}```  

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/59911/2c1083fa-5556-9f6c-25e7-7247280b8067.png)  
  
## Check your gamebook and edit it
access to [https://misawa2048.github.io/Gamebook_GGJ/gamebook/?apikey=YOUR_DEPLOYMENT_ID](https://misawa2048.github.io/Gamebook_GGJ/gamebook/?apikey=YOUR_DEPLOYMENT_ID),  
or ```./gamebook/index.html```  and check it.  
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/59911/d46512cb-1186-fae6-3ab9-ba74d4d0fd2a.png)  
  
## QuerySettings
you can change some settings by url query below;
```./gamebook/?apikey=[Deployment ID]&sheet=[sheetname]&debug=true```  

##### Deployment ID
```&apikey=[Deployment ID]``` changes the spreadsheet to specified. 

##### select sheet name
```&sheet=[sheetname]``` changes using sheet except "masterSheet".  

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/59911/1733fe3d-6ef2-51c3-1bab-82d822da8d3a.png)

##### enable image link
```&imglink=true``` enables image link to [MEMEPLEX](https://memeplex.app/).  

##### display debug info
```&debug=true``` displays page stack and back button.  

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/59911/5547f6c1-efce-4712-5db4-b92046832b14.png)  

##### set start page
```&page=[page]``` sets the start page to the specified number.  

##### single page mode
```&row=[row]``` sets the start page by row-index of spreadsheet.  
audio is not available on this mode.  
