/*
 * Copyright (c) 2015, Steven J. Harradine <stevenharradine@gmail.com>
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

var http = require('http');
var httpRequestParser = require('httpresponseparser');

function json2rss (user, user_object) {
	responseMessage  = '\
<?xml version="1.0" encoding="UTF-8" ?>\
<rss version="2.0">\
<channel>\
 <title>Shared links</title>\
 <description>This links have been publicly shared by ' + user + '</description>';

	for (var i = 0; i < user_object.links.length; i++) {
		responseMessage += '\
 <item>\
  <title>Link #' + i + '</title>\
  <link>' + user_object.links[i] + '</link>\
 </item>';
 	}
	responseMessage += '\
</channel>\
</rss>';

	return responseMessage;
}

http.createServer(function (req, res) {
	httpRequestParser.parse (req, function (httpRequestData) {
		var redis = require("redis"),
			client = redis.createClient();

		client.on("error", function (err) {
			console.log("Error " + err);
		});

		if (httpRequestData != null) {
			var user,
				password,
				link,
				returnType;

			for (var i = 0; i < httpRequestData.length; i++) {
				if (httpRequestData[i].name == "user") {
					user = httpRequestData[i].value;
				} else if (httpRequestData[i].name == "password") {
					password = httpRequestData[i].value;
				} else if (httpRequestData[i].name == "link") {
					link = httpRequestData[i].value;
				} else if (httpRequestData[i].name == "returnType") {
					returnType = httpRequestData[i].value;
				}
			}

			if (req.method == "GET") {
				client.get(user, function (err, reply) {
					if (reply != null) {
						var user_object = JSON.parse(reply.toString());

						responseCode = 200;

						if (returnType == "RSS") {
							responseMessage = json2rss (user, user_object);
						} else {
							responseMessage = JSON.stringify(user_object.links);
						}
					} else {
						responseCode = 404;
						responseMessage = "User not found";
					}

					res.writeHead (responseCode, {'Content-Type': 'text/plain'});
					res.end (responseMessage);

					client.quit();
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

					client.quit();
				});
			}
		} else {
			console.log ("httpRequestData=NULL");
		}
	});
}).listen(80);

