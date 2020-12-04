
# 環境構築
ubuntu 20.04基準として作成している。
サーバー設定にはansibleを使用する。ansibleはローカルPCにインストールしてください。

## slackサイトの設定

```
ansible-playbook infra/slackbolt/setting-bolt.yml -i infra/slackbolt/secret/host --private-key=infra/slackbolt/secret/conoha_ssh.pem --extra-vars="@infra/slackbolt/secret/dev/dev-config.yml"
```

# 開発用コマンド
# nginx
## ログ場所
```
/var/log/nginx/error.log
```
