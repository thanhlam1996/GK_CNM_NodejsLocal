var aws=require("aws-sdk");
var fs=require("fs");

aws.config.update({
    region: "us-west-2",
    endpoint:"http://localhost:8000"
});

//Access key

aws.config.accessKeyId="AKIAJFW7426IPWT3K3QA";
aws.config.secretAccessKey="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";

var docClient=new  aws.DynamoDB.DocumentClient();

console.log("Importing movies into DynamoDB. Please wait...");

var allMovies=JSON.parse(fs.readFileSync("moviedata.json","utf-8"));
allMovies.forEach(function(movie){
    var params={
        TableName: "Movies",
        Item:{
            "year": movie.year,
            "title": movie.title,
            "info": movie.info
        }
    };
    docClient.put(params, function(err, data){
        if(err)
        {
            console.error("Unable to add movies", movie.title, " .Error Json: ", JSON.stringify(err, null,2));
        }
        else
        {
            console.log("PutItem succeeded: ", movie.title);
        }
});
});