var express      = require('express'),
	fs           = require('fs'),
    bodyParser   = require('body-parser'),
    request      = require('request'),
    exec         = require('child_process').exec,
    randomstring = require("randomstring"),
    vars         = require("./build-vars");

var options = {
    cert: fs.readFileSync('cert/cert.pem'),
    key: fs.readFileSync('cert/key.key'),
    requestCert: false,
    rejectUnauthorized: false
};

var app      = express(),
	https    = require('https').createServer(options, app);

https.listen(vars.PORT);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var help = "/ls _options_ – list directory content\n" +
           "/help – display this message\n\n" +
           "You can also use the commands without the slash (e.g: ls -la)";

app.post(vars.WEBHOOK_URL, function(req, res) {
	console.log(req.body);
	var json = {};
    var message = req.body.message;

    var data = {};
    data.chat_id = message.chat.id;
    //data.reply_to_message_id = req.body.message.message_id;
    data.text = "^~^";

    json.method = "sendChatAction";
    json.action = "typing";

    if(message.text.indexOf("/") == 0) {
        message.text = message.text.substring(1, message.text.length);
    }

    if(message.text.indexOf("ls") == 0 || message.text.indexOf('ls') == 0) {
        res.json(json);
        var options = "";
        if (message.text.length > 2) {
            options = message.text.substring(3, message.text.length);
        }
        exec("ls " + options, function (err, stdout, stderr) {
            if(err) {
                if(stderr.indexOf("Permission denied") != -1) {
                    sendMessage(data, "Ops. Looks like I don't have the necessary rigts to _ls_ this directory.\n" +
                                "For now, there's nothing I can do for you – " +
                                "I haven't learnt yet to use the _sudo_ command :(", true);
                } else {
                    sendMessage(data, stderr);
                }
            } else {
                sendMessage(data, stdout);
            }
        });
    } else if(message.text.indexOf("start") == 0) {
        res.json(json);
        sendMessage(data, "Hi there! :)\nSince I'm newborn, I can't do many things yet.\n" +
                          "Here's a list of what I've learned so far:\n\n" + help, true);
    } else if(message.text.indexOf("help") == 0) {
        res.json(json);
        sendMessage(data, help, true);
    } else {
        res.send(200);
    }
});

function sendMessage(data, text, markdown) {
    if(markdown){
        data.parse_mode = "Markdown";
    }
    data.text = text;
    request.post({
            url: "https://api.telegram.org/bot" + vars.BOT_TOKEN + "/sendMessage",
            formData: data
        }, function(err, res, body) {
            console.log(err);
            console.log(body);
        }
    );
}

function sendTroubleMessage(data) {
    data.text = "I'm sorry, but I'm having trouble doing this right now :(";
    sendMessage(data);
}