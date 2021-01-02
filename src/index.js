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
    await app.start(process.env.PORT || SETTING.PORT);

    console.log('⚡️ Bolt app is running!');

    // ユーザー情報読み込み
})();


function sendToMychat(message, cw_chanels) {
    findUser(message.user).then((user) => {

        cw_chanels.forEach(chanel => {
            let chatworkParams = {
                chatworkToken: SETTING.TOKEN,
                roomId: chanel,
                msg: editmessage(message, user)
            };
            chatwork.init(chatworkParams);
            chatwork.postRoomMessages()
                .then((data) => {
                })
                .catch((err) => {
                    console.log(err);
                });
        });
    });
}

function editmessage(message, user) {

    // ミリ秒切り捨てて時間に変換
    var time_string = moment.unix(Math.floor(message.ts)).local().format('MM月DD日 HH:mm:ss')
    // ユーザーID　抽出

    var trimed_body = regexMention(message.text)
    trimed_body = regexUrl(trimed_body)
    trimed_body = regexQuote(trimed_body)
    message_result = '[info][title]' + user.real_name + '   ' + time_string + '[/title]\n'
        + trimed_body + '[/info]' + 'slack(https://' + SETTING.URI + '/archives/'
        + message.channel + ') の転載です。\nslackの閲覧方法は問い合わせください'
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

function regexUrl(text) {
    const regex = /<http.*?>/g;
    const match_list = text.match(regex);
    if (!match_list) {
        return text
    }
    match_list.forEach(match => {
        trim_text = match.replace(/<http/g, 'http').replace(/>/g, '')
        // slackでのリンク省略を無効化する。
        if (trim_text.indexOf("|") >= 0) {
            trim_text = trim_text.substring(0, trim_text.indexOf("|"));
        }
        text = text.replace(match, trim_text)
    });
    return text
}

function regexQuote(text) {
    const regex = /&gt;/g;
    const match_list = text.match(regex);
    if (!match_list) {
        return text
    }
    match_list.forEach(match => {
        trim_text = match.replace(/&gt;/g, '>')
        text = text.replace(match, trim_text)
    });
    return text
}
app.message('', async ({ message }) => {
    if (Object.keys(SETTING.ROOM).includes(message.channel)) {
        cw_chanels = SETTING.ROOM[message.channel]
        sendToMychat(message, cw_chanels);
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