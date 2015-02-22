/*
Redis Object:

Key:
harradine

Value:
{
	"password": "pass",
	"links": [
		"http://telus.com",
		"https://telus.com",
		"http://google.com",
		"http://microsoft.com"
	]
}

*/

var http = require('http');

function httpParser (request, callback) {
	if (request.method == "POST") {
		request.on ('data', function (data) {
			var bodyData = new Array(),
				bodyData_index = 0,
				lines = data.toString().trim().split ("\n");

			// skip first and last lines (form boundry data)
			for (var i = 1; i < lines.length - 1; i += 4) {
				var	name = lines[i].split ("name=\"")[1].split("\"")[0].trim(),
					value = lines[i+2].trim();

				bodyData[bodyData_index] = new Array();
				bodyData[bodyData_index]['name'] = name;
				bodyData[bodyData_index]['value'] = value;

				bodyData_index++;
			}

			callback(bodyData);
		});
	} else if (request.method== "GET") {
		var bodyData = new Array(),
			bodyData_index = 0,

			urlvars = request.url.split('?')[1].split('&');

		for (var i = 0; i < urlvars.length; i++) {
			var urlvars_split = urlvars[i].split('='),
				name = urlvars_split[0],
				value = urlvars_split[1];

			bodyData[bodyData_index] = new Array();
			bodyData[bodyData_index]['name'] = name;
			bodyData[bodyData_index]['value'] = value;

			bodyData_index++;

			console.log (name + " " + value);
		}

		callback(bodyData);
	}
}

http.createServer(function (req, res) {
	httpParser (req, function (bodyData) {
		var redis = require("redis"),
			client = redis.createClient();

		client.on("error", function (err) {
			console.log("Error " + err);
		});

		if (bodyData != null) {
			var user,
				password,
				link;

			for (var i = 0; i < bodyData.length; i++) {
				if (bodyData[i].name == "user") {
					user = bodyData[i].value;
				} else if (bodyData[i].name == "password") {
					password = bodyData[i].value;
				} else if (bodyData[i].name == "link") {
					link = bodyData[i].value;
				}
			}

			if (req.method == "GET") {
				client.get(user, function (err, reply) {
					if (reply != null) {
						var user_object = JSON.parse(reply.toString());

						res.writeHead(200, {'Content-Type': 'text/plain'});
						res.end(JSON.stringify(user_object.links));
					} else {
						res.writeHead(404, {'Content-Type': 'text/plain'});
						res.end('User not found');
					}
				});
			} else if (req.method == "POST") {
				client.get(user, function (err, reply) {
					if (reply != null) {
						var user_object = JSON.parse(reply.toString()),
							user_actual_password = user_object.password;

						if (password == user_actual_password) {
							user_object.links.push(link);
							client.set (user, JSON.stringify(user_object));

							res.writeHead(200, {'Content-Type': 'text/plain'});
							res.end(link + " added to " + user);
						} else {
							res.writeHead(403, {'Content-Type': 'text/plain'});
							res.end("Auth failed");
						}
					} else {
						res.writeHead(500, {'Content-Type': 'text/plain'});
						res.end('Server error');
					}
				});
			}
		} else {
			console.log ("bodyData=NULL");
		}
	});
}).listen(80);
