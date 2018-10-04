var aws=require("aws-sdk");

aws.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});
//key
aws.config.accessKeyId="AKIAJFW7426IPWT3K3QA";
aws.config.secretAccessKey="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";


var dynamodb=new aws.DynamoDB();
var params={
    TableName: "Movies"
};

dynamodb.deleteTable(params, function(err, data)
{
    if(err)
    {
        console.error("Unable to delete table. Error JSON: ", JSON.stringify(err, null,2));
    }
    else{
        console.log("Deleted table. Table description JSON: ", JSON.stringify(data, null,2));
    }
});