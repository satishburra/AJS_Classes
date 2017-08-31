var express = require("express");
var mysql = require("mysql");
var mongodb = require("mongodb");
var jwt = require("jwt-simple");
var bodyparser = require("body-parser");
var fs = require("fs");

var app = express();
app.use(bodyparser.json());

app.use(express.static(__dirname+"/../POC"));


var connection = mysql.createConnection({
   "host":"localhost",
   "user":"root",
   "password":"root",
   "database":"poc"
});

connection.connect();

var tokensArray=[];

app.post("/login",function(req,res){
    var uname = req.body.uname;
    var upwd = req.body.upwd;
    connection.query("select uname from login_details where uname='"+uname+"'",function (err,recordsArray,fields) {
        if(recordsArray.length>0){
            var token = jwt.encode({'uname':uname},'hr@tcs.com');
            tokensArray.push(token);
            res.send({'login':'success','token':token});
        }else{
            res.send({'login':'fail'});
        }
    });
});


app.post("/static",function (req,res) {
    var token = req.body.token;
    if(tokensArray[0]==token){
        fs.readFile(__dirname+"/sample.json",function (err,data) {
            res.send(data);
        });
    }else{
        res.send({"401":"Authentication Failed !"});
    };
});


app.post("/mysql",function (req,res) {
    var token = req.body.token;
    if(tokensArray[0]==token){
       connection.query("select * from products",function (err,recordsArray,fields) {
           res.send(recordsArray);
       });
    }else{
        res.send({"401":"Authentication Failed !"});
    };
});

var poc = mongodb.MongoClient;
app.post("/mongodb",function (req,res) {
    var token = req.body.token;
    if(tokensArray[0]==token){
        poc.connect("mongodb://localhost:27017/poc",function (err,db) {
            db.collection("products").find().toArray(function (mongoError,array) {
                res.send(array);
            });
        });
    }else{
        res.send({"401":"Authentication Failed !"});
    };
});





app.listen(8080);
console.log("Server Listening the Port No.8080");