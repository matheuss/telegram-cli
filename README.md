# telegram-cli
Control your server using a Telegram bot

## Installation
```sh
git clone https://github.com/matheuss/telegram-cli.git
cd telegram-cli
npm install
```

## Configuration
### build.js
You need to set some "build variables":

```js
exports.PORT                = 0;
exports.WEBHOOK_ENDPOINT    = "";
exports.BOT_TOKEN           = "";
exports.OWNER_ID            = "";
exports.OWNER_USERNAME      = "";
```
The **PORT** should be one of the following: **443, 80, 88 or 8443.**

The **WEBHOOK_ENDPOINT** should be a "secret" path, to ensure that the requests are coming from Telegram. Example:
```js
exports.WEBHOOK_ENDPOINT = "/BIcif92WztBwirBmgVnsmiZqR3WMZJveaRF5cznO" // don't use that one!
```
The **BOT_TOKEN** you can obtain with [BotFather](https://telegram.me/botfather).

The **OWNER_ID** should be your Telegram user id. To find out yours, talk to [this bot](https://telegram.me/user_id_bot).

The **OWNER_USERNAME** should be your Telegram username.

### HTTPS
HTTPS is mandatory when using a webhook. You can generate a self-signed certificate with the following:
```sh
openssl req -newkey rsa:2048 -sha256 -nodes -keyout key.key -x509 -days 365 -out cert.pem -subj "/C=US/ST=New York/L=Brooklyn/O=Example Brooklyn Company/CN=CHANGE_THIS"
```
The **CN** field should contain the domain/IP where your bot will be running. Examples:
```
CN=my-bot.herokuapp.com
CN=205.139.40.96
```
Note: don't include anything else. Just the domain or the IP. No protocols (http:// or https://) are required.

Now you should issue a POST request to register your webhook. I recommend [Postman](https://www.getpostman.com) for that. [Here's an example of the request](http://cl.ly/dgdE).

## Running
All set, ready to go:
```sh
node index.js
```
Now you should be able to talk with your bot. If he doesn't responds, you probably have done something wrong on the HTTPS step. Feel free to reach me [@matheus.frndes](https://telegram.me/matheusfrndes) (It took me a long time to get this step done correctly, so I think I can help :blush:)