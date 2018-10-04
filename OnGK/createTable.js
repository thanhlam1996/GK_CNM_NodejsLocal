var aws=require("aws-sdk");

aws.config.update({
    region:"us-west-2",
    endpoint: "http://localhost:8000"
});

//Access key

aws.config.accessKeyId="AKIAJFW7426IPWT3K3QA";
aws.config.secretAccessKey="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";

var dynamodb=new  aws.DynamoDB();

var params={
    TableName: "Movies",
    KeySchema:[
        {AttributeName: "year", KeyType:"HASH"}, //partition key
        {AttributeName:"title", KeyType: "RANGE"} //Sort key

    ],

    AttributeDefinitions:[
        {AttributeName:"year", AttributeType:"N"},
        {AttributeName:"title", AttributeType:"S"}
    ],

    ProvisionedThroughput:{
        ReadCapacityUnits:10,
        WriteCapacityUnits:10
    }
};

dynamodb.createTable(params, function(err, data){
    if(err)
    {
        console.error("Unable to create table. Errior", JSON.stringify(err,null,2));
    }
    console.log("Created table. Table description Json: ", JSON.stringify(data, null,2));
});