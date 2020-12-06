const { App } = require('@slack/bolt');
const moment = require("moment");
const yaml = require('js-yaml');
const fs = require('fs')
const chatwork = require('chatwork-client');

// 初期対応

// 設定
const setting_path = fs.readFileSync('setting.yml', 'utf8')
SETTING = yaml.safeLoad(setting_path);

// ユーザー情報

// 存在しな場合は作成
if (!fs.existsSync('user.json')) {
    fs.writeFileSync("user.json", "{}");
}
const row_user = fs.readFileSync('user.json', 'utf8')
let user_list = JSON.parse(row_user);

const app = new App({
    token: SETTING.SLACK_BOT_TOKEN,
    signingSecret: SETTING.SLACK_SIGNING_SECRET
});

(async () => {
    // Start your app
    await app.start(process.env.PORT || 3001);

    console.log('⚡️ Bolt app is running!');

    // ユーザー情報読み込み
})();


function sendToMychat(message) {
    findUser(message.user).then((user) => {
        let chatworkParams = {
            chatworkToken: SETTING.TOKEN,
            roomId: SETTING.OUT_ROOM_ID,
            msg: editmessage(message, user)
        };
        chatwork.init(chatworkParams);
        chatwork.postRoomMessages()
            .then((data) => {
            })
            .catch((err) => {
                console.log(err);
            });
    })

}

function editmessage(message, user) {

    // ミリ秒切り捨てて時間に変換
    var ts_str = moment.unix(Math.floor(message.ts)).local().format('MM-DD HH:mm:ss')
    // ユーザーID　抽出

    var trimed_text = regexMention(message.text)
    message_result = trimed_text + '\n' + '-- ' + user.real_name + '  ' + ts_str
        + '\nslack より転載 slackの閲覧方法はこちら'
    return message_result;
}

function regexMention(text) {
    const regex = /<@.*?>/g;
    const match_list = text.match(regex);
    if (!match_list) {
        return text
    }
    match_list.forEach(match => {
        var user_id = match.replace(/<@/g, '').replace(/>/g, '')
        var user = user_list[user_id]
        if (user) {
            text = text.replace(match, 'TO : ' + user.real_name);
        }
    });
    return text
}

app.message('', async ({ message }) => {
    if (message.channel == SETTING.IN_ROOM_ID) {
        sendToMychat(message);
    }
});

function findUser(user_id) {

    // user list by files
    var user = user_list[user_id]
    if (user) {
        return new Promise((resolve) => {
            resolve(user)
        });
    } else {
        return new Promise((resolve) => {
            app.client.users.info({
                token: SETTING.SLACK_BOT_TOKEN,
                user: user_id
            }).then(user => {
                user_list[user.user.id] = user.user
                fs.writeFileSync("user.json", JSON.stringify(user_list));
                resolve(user.user)
            });
        });
    }

}