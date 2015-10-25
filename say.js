/**
 * Created by matheus on 10/25/15.
 */

/**
 * TODO: figure an alternative to Google TTS private API
 */
if(message.text.indexOf("say") == 0) {
    json.action = "record_audio";
    res.json(json);

    var lang = "en";
    var text = "What do you want me to say?";
    var fileName = randomstring.generate();

    if(message.text.length > 3) { // has something after 'say'
        if (message.text.indexOf("-l") == 4) { // has -l
            lang = message.text.substring(7, 9);

            if (message.text.length > 9) { // has text to speak
                text = message.text.substring(10, message.text.length);
            }
            console.log(lang);
            console.log(text);
        } else { // doesn't have -l
            text = message.text.substring(4, message.text.length);
        }
    }
    exec("curl 'http://translate.google.com/translate_tts?ie=UTF-8&q=" + encodeURIComponent(text)+ "&client=t&tl=" + lang +
        "' -H 'Referer: http://translate.google.com/' -H 'User-Agent: stagefright/1.2 (Linux;Android 5.0)'" +
        " > " + fileName + ".mp3; mv " + fileName + ".mp3 " + fileName + ".ogg",
        function(err, stdout, stderr) {
            if(err) {
                sendTroubleMessage();
            } else {
                data.voice = fs.createReadStream(fileName + '.ogg');
                request.post({
                        url: "https://api.telegram.org/bot" + vars.BOT_TOKEN + "/sendMessage",
                        formData: data
                    }, function (err, res, body) {
                        console.log(err);
                        console.log(body);
                    }
                );
            }
        });
}