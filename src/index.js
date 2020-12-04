const { App } = require('@slack/bolt');
const moment = require("moment");
const yaml = require('js-yaml');
const fs = require('fs')
const yamlText = fs.readFileSync('setting.yml', 'utf8')
const chatwork = require('chatwork-client');

SETTING = yaml.safeLoad(yamlText);

const app = new App({
    token: SETTING.SLACK_BOT_TOKEN,
    signingSecret: SETTING.SLACK_SIGNING_SECRET
});

(async () => {
    // Start your app
    await app.start(process.env.PORT || 3001);

    console.log('⚡️ Bolt app is running!');
})();


function sendToMychat(message) {
    user(message).then((users) => {
        let chatworkParams = {
            chatworkToken: SETTING.TOKEN,
            roomId: SETTING.ROOM_ID,
            msg: editmessage(message, users)
        };
        chatwork.init(chatworkParams);
        chatwork.postRoomMessages()
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.log(err);
            });
    })

}

function editmessage(message, users) {

    // ミリ秒切り捨てて時間に変換
    var ts_str = moment.unix(Math.floor(message.ts)).local().toISOString()
    message_result = message.text + '\n' + '-- ' + users.user.real_name + '  ' + ts_str
    console.log(message_result);
    return message_result;
}

app.message('', async ({ message, say }) => {
    sendToMychat(message);
});

function user(data) {
    return app.client.users.info({
        token: SETTING.SLACK_BOT_TOKEN,
        user: data.user
    });
}