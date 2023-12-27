const https = require('https');

https.get("https://www.google.com",(res)=>{
    console.log(res)
})