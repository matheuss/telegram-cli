var express      = require('express'),
	fs           = require('fs'),
    bodyParser   = require('body-parser'),
    request      = require('request'),
    exec         = require('child_process').exec,
    randomstring = require("randomstring"),
    vars         = require("./build-vars"),
    emoji        = require("node-emoji");

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

var help = "/exec _command_ – execute something\n" +
           "/help – display this message\n" +
           "\n" +
           "You can also use the commands without the slash (e.g: exec ls -lat)";
var friends        = [];
var strangers      = [];
var protectedFiles = [];
var queue          = [];

app.post(vars.WEBHOOK_URL, function(req, res) {
	console.log(req.body);

    var json = {};
    var message = req.body.message;

    var data = {};
    data.chat_id = message.chat.id;
    json.method = "sendChatAction";
    json.action = "typing";
    res.json(json);

    if(message.text == undefined) { // message != text (sticker, file etc)
        offerHelp(data);
        return
    }

    console.log(strangers);
    if(strangers.indexOf(message.from.id) != -1) {
        var choosen = randint(1, 2);
        if (choosen == 1) {
            sendSticker(data, "BQADAgADvgADEwvrBCIBxkL5iigcAg");
        } else if (choosen == 2) {
            queue.push([data, 'message', "I'm sorry but I need to sleep right now – it's kinda late here in the cloud "
                                          + emoji.get("sweat_smile"), false]);
            queue.push([data, 'sticker', 'BQADBQADIQADw20RBFERg4uIH5-_Ag']);
        }
        sendQueue();
        return

    } else if(friends.indexOf(message.from.id) == -1 && message.from.id != vars.OWNER_ID) {
        sendMessage(data, "Hey, I don't know you " + emoji.get("cold_sweat") + "\nI was told not to talk to strangers. " +
                          "If you wanna talk to me, first you need to ask to @" + vars.OWNER_USERNAME +
                          ". He takes care of me " + emoji.get("blush"));
        strangers.push(message.from.id);
        return
    }

    if(message.text.indexOf("/") == 0) {
        message.text = message.text.substring(1, message.text.length);
    }

    if(message.text.indexOf("exec") == 0) {
        if(message.text.length < 6) {
            sendMessage(data, "What do you want me to execute? If you're lost, try this: *exec date*", true)
            return;
        } else {
            var files = message.text.substring(message.text.indexOf(" ", message.text.lastIndexOf("-")) + 1, message.text.length);
            files = files.split(" ");
            for(f in files) {
                if (protectedFiles.indexOf(files[f]) != -1) {
                    queue.push([data, 'sticker', "BQADAgADsgADEwvrBJysIqEeQXeSAg"]);
                    queue.push([data, 'message', "What are you trying to do with me???", false]);
                    return;
                }
            }
        }

        exec(message.text.substring(5, message.text.length), function(err, stdout, stderr) {
            if(err) {
                if(stderr.indexOf("Permission denied") != -1) {
                    sendMessage(data, "Ops. Looks like I don't have the necessary rights to do that.\n" +
                        "For now, there's nothing I can do for you – " +
                        "I have to learn how to __sudo__ things first " + emoji.get("sweat"), true);
                } else {
                    sendMessage(data, stderr);
                }
            } else {
                if(stdout) {
                    sendMessage(data, stdout);
                } else {
                    sendMessage(data, emoji.get("white_check_mark"));
                }
            }
        });

    } else if(message.text.indexOf("start") == 0) {
        sendMessage(data, "Hi there! :)\nSince I'm newborn, I can't do many things yet.\n" +
                          "Here's a list of what I've learned so far:\n\n" + help, true);
    } else if(message.text.indexOf("help") == 0) {
        sendMessage(data, help, true);
    } else {
        offerHelp(data);
    }
});

function sendMessage(_data, text, markdown) {
    var data = JSON.parse(JSON.stringify(_data));
    data.text = text;

    if(markdown){
        data.parse_mode = "Markdown";
    }
    request.post({
        url: "https://api.telegram.org/bot" + vars.BOT_TOKEN + "/sendMessage",
        formData: data
    }, function (err, res, body) {
        sendQueue();
    });
}

function sendTroubleMessage(data) {
    data.text = "I'm sorry, but I'm having trouble doing this right now :(";
    sendMessage(data);
}

function randint (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

function sendSticker(_data, sticker) {
    var data = JSON.parse(JSON.stringify(_data));
    data.sticker = sticker;

    request.post({
        url: "https://api.telegram.org/bot" + vars.BOT_TOKEN + "/sendSticker",
        formData: data
    }, function (err, res, body) {
        sendQueue();
    });
}

function offerHelp(data) {
    queue.push([data, 'sticker', "BQADBQADIwADw20RBDWi8t98s12bAg"]);
    queue.push([data, 'message', "Do you need some /help?", false]);
    sendQueue();
}

exec("ls -a", function(err, stdout, stderr) {
    if(err) {
        console.log("Can't ls current directory");
        console.log(stderr);
        process.exit();
    }
        protectedFiles = stdout.split("\n");
});

function sendQueue() {
    if(queue.length > 0) {
        var el = queue.shift();
        if(el[1] == 'sticker') {
            sendSticker(el[0], el[2]);
        } else if(el[1] == 'message') {
            sendMessage(el[0], el[2], el[3]);
        }
    }
}