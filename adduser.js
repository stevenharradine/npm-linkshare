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

var redis = require("redis"),
	client = redis.createClient(),
	userToAdd = process.argv[2],
	passwordToAdd = process.argv[3];

client.on("error", function (err) {
	console.log("Error " + err);
});

client.get(userToAdd, function (err, reply) {
	// if the user does not exist and the password is defined
	if (reply == null && passwordToAdd != "undefined") {
		client.set (userToAdd, "{\"password\": \"" + passwordToAdd + "\", \"links\": []}");
		console.log (userToAdd + " had been created");
	} else {
		console.log (userToAdd + " already exists or no password defined");
	}

	client.quit();
});