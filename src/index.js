const { App } = require('@slack/bolt');
const yaml = require('js-yaml');
const yamlText = fs.readFileSync('setting.yml', 'utf8')
const chatwork = require('chatwork-client');

SETTING = yaml.safeLoad(yamlText);

const app = new App({
    token: SETTING.SLACK_BOT_TOKEN,
    signingSecret: SETTING.SLACK_SIGNING_SECRET
});

(async () => {
    // Start your app
    await app.start(process.env.PORT || 3000);

    console.log('⚡️ Bolt app is running!');
})();


app.message('hello', async ({ message, say }) => {
    // say() sends a message to the channel where the event was triggered
    await say(`Hey there <@${message.user}>!`);
    sendToMychat(message)
});

function sendToMychat() {
    console.log(message);
    let chatworkParams = {
        chatworkToken: SETTING.TOKEN,
        roomId: SETTING.ROOM_ID,
        msg: 'Hello, i using chatwork-client'
    };
    chatwork.init(chatworkParams);
    chatwork.postRoomMessages()
        .then((data) => {
            doSomething(data);
        })
        .catch((err) => {
            console.log(err);
        });

}