# README #
## Create user ##
Takes two parameters username and password pretty self explanitory

node adduser.js username password

## Run Server ##
sudo is required to start server as its running on a port < 1024 (port 80)

sudo node server.js

## REST operations ##
### POST ###
Used for insert operations

* user: username to post link
* password: password of user to post link
* ink: link to post

### GET ### 
Used for select operations
* user: username of persons whose links you want

## Redis Object ##
### Key ###
* username

### Value ###
		{
			"password": "pass",
			"links": [
				"http://google.com",
				"http://microsoft.com"
			]
		}