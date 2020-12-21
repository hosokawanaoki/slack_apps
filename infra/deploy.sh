#!/bin/sh

# 実行コマンド sh infra/deploy.sh dev bolt

# 環境名 dev, prod
echo $1

# アプリ名 
echo $2

ansible-playbook infra/slackbolt/setting-$2.yml -i infra/slackbolt/secret/host --private-key=infra/slackbolt/secret/conoha_ssh.pem --extra-vars="@infra/slackbolt/secret/$1/$1-config.yml"