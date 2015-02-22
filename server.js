/*

REST operations:
	POST: 		// insert
		user 	// username to post link
		password// password of user to post link
		link 	// link to post
	GET: 		// select
		user 	// username of persons whose links you want

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

function httpRequestParser (request, callback) {
	if (request.method == "POST") {
		request.on ('data', function (data) {
			var httpRequestData = new Array(),
				httpRequestData_index = 0,
				lines = data.toString().trim().split ("\n");

			// skip first and last lines (form boundry data)
			for (var i = 1; i < lines.length - 1; i += 4) {
				var	name = lines[i].split ("name=\"")[1].split("\"")[0].trim(),
					value = lines[i+2].trim();

				httpRequestData[httpRequestData_index] = new Array();
				httpRequestData[httpRequestData_index]['name'] = name;
				httpRequestData[httpRequestData_index]['value'] = value;

				httpRequestData_index++;
			}

			callback(httpRequestData);
		});
	} else if (request.method== "GET") {
		var httpRequestData = new Array(),
			httpRequestData_index = 0,

			urlvars = request.url.split('?')[1].split('&');

		for (var i = 0; i < urlvars.length; i++) {
			var urlvars_split = urlvars[i].split('='),
				name = urlvars_split[0],
				value = urlvars_split[1];

			httpRequestData[httpRequestData_index] = new Array();
			httpRequestData[httpRequestData_index]['name'] = name;
			httpRequestData[httpRequestData_index]['value'] = value;

			httpRequestData_index++;

			console.log (name + " " + value);
		}

		callback(httpRequestData);
	}
}

http.createServer(function (req, res) {
	httpRequestParser (req, function (httpRequestData) {
		var redis = require("redis"),
			client = redis.createClient();

		client.on("error", function (err) {
			console.log("Error " + err);
		});

		if (httpRequestData != null) {
			var user,
				password,
				link;

			for (var i = 0; i < httpRequestData.length; i++) {
				if (httpRequestData[i].name == "user") {
					user = httpRequestData[i].value;
				} else if (httpRequestData[i].name == "password") {
					password = httpRequestData[i].value;
				} else if (httpRequestData[i].name == "link") {
					link = httpRequestData[i].value;
				}
			}

			if (req.method == "GET") {
				client.get(user, function (err, reply) {
					if (reply != null) {
						var user_object = JSON.parse(reply.toString());

						responseCode = 200;
						responseMessage = JSON.stringify(user_object.links);
					} else {
						responseCode = 404;
						responseMessage = "User not found";
					}

					res.writeHead (responseCode, {'Content-Type': 'text/plain'});
					res.end (responseMessage);
				});
			} else if (req.method == "POST") {
				client.get(user, function (err, reply) {
					if (reply != null) {
						var user_object = JSON.parse(reply.toString()),
							user_actual_password = user_object.password;

						if (password == user_actual_password) {
							user_object.links.push(link);
							client.set (user, JSON.stringify(user_object));

							responseCode = 200;
							responseMessage = link + " added to " + user;
						} else {
							responseCode = 403;
							responseMessage = "Auth failed";
						}
					} else {
						responseCode = 500;
						responseMessage = "Server error";
					}

					res.writeHead (responseCode, {'Content-Type': 'text/plain'});
					res.end (responseMessage);
				});
			}
		} else {
			console.log ("httpRequestData=NULL");
		}
	});
}).listen(80);
