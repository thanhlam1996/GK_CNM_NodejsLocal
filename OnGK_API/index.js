var express=require("express");
var app=express();
var aws=require("aws-sdk");

var bodyParser=require("body-parser");
var urlencodeParser=bodyParser.urlencoded({extended:false});

aws.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});

//key
aws.config.accessKeyId = "AKIAJFW7426IPWT3K3QA";
aws.config.secretAccessKey = "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";

var docClient=new aws.DynamoDB.DocumentClient();

app.get("/listUser", function(req, res)
{
    var params={
        TableName: "Movies"
    }
    docClient.scan(params,onScan)
    var arr=[];
    function onScan(err,data)
    {
        if(err)
        {
            console.error("Err ", JSON.stringify(err,null,2));
            res.end();
        }
        else
        {
            return res.send(data);
        }
    }
});

app.get("/:year/:title", function(req, res){
    var _year=req.params.year;
    var _title=req.params.title;

    console.log(_year);
    console.log(_title);
    var movieitem={
        TableName:"Movies",
        Key:{
            "year": parseInt(_year),
            "title": _title
        }
    };
    docClient.get(movieitem, function(err, data){
        if(err)
        {
            console.error("ERR: ", JSON.stringify(err, null, 2));
            res.end();
        }
        else
        {
           return res.send(data);
        }
    });
});

app.post("/addUser", urlencodeParser, function(req,res){
    var _title=req.body.title;
    var _year=req.body.year;
    var _actors=req.body.actors;
    var newitem={
        TableName:"Movies",
        Item:{
            "year":parseInt(_year),
            "title":_title,
            "info":{
                "actors":[_actors]
            }
        }
    };
    docClient.put(newitem, function(err, data){
        if(err)
        {
            console.error("ERR: ", JSON.stringify(err, null, 2));
            res.end();
        }
        else
        {
            return res.send("Added Item"+data);
        }
    });
});

//Thang delete nay cung la method post
app.delete("/delete", urlencodeParser, function(req,res){
    var _year=req.body.year;
    var _title=req.body.title;

    console.log(_year);
    console.log(_title);

    var itemdelete={
        TableName: "Movies",
        Key: {
            "year": parseInt(_year),
            "title": _title
        }
    };
    docClient.delete(itemdelete, function(err,data)
    {
        if(err)
        {
            console.error("Err: ", JSON.stringify(err, null,2));
        }
        else{
            return res.send("Deleted Item ");
        }
    });

});

var server=app.listen(3000, function(){
    var host=server.address().address;
    var port=server.address().port;
    console.log("Example app listen at http://%s:%s", host, port);
});