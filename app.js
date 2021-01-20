const express = require("express");
const bodyParser = require("body-parser");
const mailchimp = require('@mailchimp/mailchimp_marketing');

require('dotenv').config(); //get .env variables
//console.log(process.env);

const app = express();

const key = process.env.key;
const serverPrefix = process.env.serverPrefix;
const listId =  process.env.listId;

//authentication
mailchimp.setConfig({
  apiKey: key,
  server: serverPrefix,
});

//add new subscibers to mailchimp
const addSubs = async (fname,lname,email) => {
  console.log("new Subscibers to add request is made!");
  const response = await mailchimp.lists.batchListMembers(listId, {
    members: [{email_address: email,
              status: "subscribed",
              merge_fields: {
                FNAME: fname,
                LNAME: lname,
              }
              }],
  });

  //get list info
  // const response = await mailchimp.lists.getList(listId);

  //get list subscibers info
  // const response = await mailchimp.lists.getListMembersInfo(listId);

  // console.log("ERROR :",response.errors);
  return response.errors;
};

app.use(express.static("public")); //to use static pages like images, css in html file
app.use(bodyParser.urlencoded({extended:true})); //to read data from html form

app.get("/",(req,res)=>{
  res.sendFile(__dirname+"/index.html");
});

app.post("/",(req,res)=>{
  console.log("\nPost request is made with data:\n "+JSON.stringify(req.body));
  //read all the user inputted values from html form
  let fname=req.body.fname;
  let lname=req.body.lname;
  let email=req.body.email;

  //add subscibers
  let response = addSubs(fname,lname,email);

  response.then((errorStatus)=>{
    if(errorStatus.length===0){ //no error
      console.log("Subsciber added successfully !");
      res.sendFile(__dirname+"/success.html");
    }
    else{ //some error
      console.log("Subsciber fail to add ! Reason:",errorStatus[0].error_code);
      res.sendFile(__dirname+"/failure.html");
    }
  })
});

app.post("/failure",(req,res)=>{
  res.redirect("/");
});

app.listen(80,()=>{
  console.log("SERVER STARTED at localhost!");
});
