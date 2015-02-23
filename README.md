# README #
## REST operations ##
### POST ###
Used for insert operations

* user: username to post link
* password: password of user to post link
* ink: link to post

### GET### 
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