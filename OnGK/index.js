var http = require("http");
var url = require("url");
var fs = require("fs");
var aws = require("aws-sdk");
var qs = require("querystring");

aws.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});

//key
aws.config.accessKeyId = "AKIAJFW7426IPWT3K3QA";
aws.config.secretAccessKey = "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";


http.createServer(function (req, res) {
    var docClient = new aws.DynamoDB.DocumentClient();
    var q = url.parse(req.url, true);

    var urlquery = q.query;


    if (q.pathname == "/") {
        var params = {
            TableName: "Movies"
        }
        docClient.scan(params, onScan);
        function onScan(err, data) {
            if (err) {
                console.error("unable to scan table. Error JSON: ", JSON.stringify(err, null, 2));
            }
            else {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.write("<div style='margin:50px auto 30px 100px'>");
                res.write("<h1>Movie Data</h1>");
                res.write("<a href='http://localhost:8090/getmovies' style='margin:auto 20px auto auto'>Search</a>");
                res.write("<a href='http://localhost:8090/createItem' >Create</a>");
                res.write("<div style='margin-left:200px; margin-top: 100px'>");
                res.write("</div>");
                data.Items.forEach(function (i) {
                    res.write(i.year + ":" + i.title);
                    res.write("<br>");
                });
                res.write("</div>");
                res.end();
            }
        }
    }
    else if (q.pathname == "/getmovies") {

        console.log(q.query);
        console.log(q.query.txt);
        if (q.query.txt == undefined) {
            fs.readFile("./views/index.html", function (err, data) {
                if (err) {
                    res.writeHead(404, { "Content-Type": "text/html" });
                    res.write("404 not Found");
                }
                res.writeHead(200, { "Content-type": "text/html" })
                res.write(data);
                res.end();
            });
        }
        else {
            var params1 = {
                TableName: "Movies",
                KeyConditionExpression: "#yr=:yyyy",
                ExpressionAttributeNames: {
                    "#yr": "year"
                },
                ExpressionAttributeValues: {
                    ":yyyy": parseInt(q.query.txt)
                }
            };
            docClient.query(params1, function (err, data) {
                if (err) {
                    console.error("Unable to query. Error", JSON.stringify(err, null, 2));
                }
                else {
                    res.writeHead(200, { "Content-Type": "text/html" })
                    res.write('<form method="GET" action="http://localhost:8090/getmovies" style="margin-left:200px;">');
                    res.write('<input type="text" name="txt" width="200px">');
                    res.write('<input type="submit" value="submit">');
                    res.write('</form>');
                    res.write("<div style='margin-left:200px; margin-bottom: 50px'>");
                    data.Items.forEach(function (j) {
                        res.write("<a href='http://localhost:8090/updateItem?year=" + j.year + "&title=" + j.title + "'>Edit</a>|" + "<a href='http://localhost:8090/deleteItem?year=" + j.year + "&title=" + j.title + "'>Delete</a>" + + j.year + ":" + j.title);
                        res.write("<br>");
                    });
                    res.write("</div>");
                }
                res.end();
            });
        }
    }
    else if (q.pathname == "/createItem") {
        if (req.method == 'POST') {
            var body = "";
            req.on('data', function (data) {
                body += data;
            });
            req.on('end', function () {
                var text = qs.parse(body);
                var params2 = {
                    TableName: "Movies",
                    Item: {
                        "year": parseInt(text.txtyear),
                        "title": text.txttitle,
                        "info": {
                            "plot": "Nothing happens at all.",
                            "rating": 0
                        }
                    }
                };
                docClient.put(params2, function (err, data) {
                    if (err) {
                        console.log("Unable to add item. Error JSON: ", JSON.stringify(err, null, 2));
                    }
                    else {
                        res.writeHead(200, { "Content-type": "text/html" })
                        res.write("Added Idem")
                        res.write("<a href='http://localhost:8090/'>Back Home</a>")
                        console.log("Added Item: ", JSON.stringify(data, null, 2));
                        res.end();
                    }
                });

            });
        }
        else {
            fs.readFile("./views/create.html", function (err, data) {
                if (err) {
                    res.writeHead(404, { "Content-Type": "text/html" });
                    res.write("404 not Found");
                }
                res.writeHead(200, { "Content-type": "text/html" })
                res.write(data);
                res.end();
            });
        }
    }
    else if (q.pathname == "/updateItem") {
        if (req.method == 'POST') {
            var body = "";
            req.on('data', function (data) {
                body += data;
            });
            req.on('end', function () {
                var text = qs.parse(body);
                console.log("Du lieu moi nek:" + text.txtactors + "-" + text.txttitle + "-" + text.txtyear);
                var l = text.txtactors;
                console.log(l);
                var itemupdate = {
                    TableName: "Movies",
                    Key: {
                        "year": parseInt(text.txtyear),
                        "title": text.txttitle
                    },
                    UpdateExpression: "set info.actors=:a",

                    ExpressionAttributeValues: {
                        ":a": [text.txtactors]
                    },
                    ReturnValues: "UPDATED_NEW"
                };
                docClient.update(itemupdate, function (err, data) {
                    if (err) {
                        res.writeHead(404, { "Content-Type": "text/html" });
                        console.error("ERR: ", JSON.stringify(err, null, 2));
                        res.write("404 not Found");
                        res.end();
                    }
                    else {
                        res.writeHead(200, { "Content-Type": "text/html" });
                        res.write("Updated Item");
                        res.write("<a href='http://localhost:8090/'>Back Home</a>");
                        console.log("Thanh cong");
                        console.log(JSON.stringify(data, null, 2));
                        res.end();
                    }
                });
            });
        }
        else {
            console.log("Year: " + parseInt(q.query.year));
            console.log("Title: " + q.query.title);
            var itemread = {
                TableName: "Movies",
                Key: {
                    "year": parseInt(q.query.year),
                    "title": q.query.title
                }
            };

            docClient.get(itemread, function (err, data) {
                if (err) {
                    res.writeHead(404, { "Content-Type": "text/html" });
                    res.write("404 not Found");
                    res.end();
                }
                else {

                    res.writeHead(200, { "Content-Type": "text:html" });
                    console.log(data.Item.year);
                    //console.log(data.Item.info.actors);

                    var actor="";
                    if(data.Item.info.actors=="undefined")
                    {
                        actor="new";
                    }
                    else
                    {
                        actor=data.Item.info.actors;
                    }
                    var h = "";
                    h += "<html><head><title>Create Item</title><link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css' integrity='sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO' crossorigin='anonymous'>";
                    h += "</head><body><div class='container'><div style='margin:100px 50px; text-align: center'><h1>Update Item</h1></div><form method='post' action='http://localhost:8090/updateItem'>";
                    h += "<div class='form-group'><label>Year</label><input type='text' name='txtyear' value='" + data.Item.year + "' class='form-control' readonly='readonly'></div>";
                    h += "<div class='form-group'><label>Title</label><input type='text' name='txttitle' value='" + data.Item.title + "' class='form-control'></div>";
                    h += "<div class='form-group'><label>Actors</label><input type='text' name='txtactors' value='"+actor+"'  class='form-control'></div>";
                    h += '<div class="form-group" style="text-align: right">';
                    h += '<input type="submit" value="Edit" class="btn btn-info">';
                    h += '</div></form></div></body></html>';
                    res.write(h);
                    res.end();
                }
            });
        }
    }
    else if (q.pathname == "/deleteItem") {
        var _year = q.query.year;
        var _title = q.query.title;
        //console.log(_)
        var itemdelete = {
            TableName: "Movies",
            Key: {
                "year": parseInt(_year),
                "title": _title
            }
        };
        docClient.delete(itemdelete, function (err, data) {
            if (err) {
                res.writeHead(404, { "Content-Type": "text/html" });
                console.error("sssssssss", JSON.stringify(err, null, 2));
                res.write("404 not Found");
                res.end();
            }
            else {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.write("Deleted Item");
                res.write("<a href='http://localhost:8090/'>Back Home</a>");
                console.log(JSON.stringify(data, null, 2));
                res.end();
            }
        });
    }
}).listen(8090);