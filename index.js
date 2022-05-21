console.log(require('discord.js').version)

const prefix = '!'
LOG_CHANNEL_ID = '937190204693958706'
const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const discord_job = require("discord-job-panel");
discord_job.db_type({ id: 1, label: "db", key: "mongodb://localhost:27017" });
discord_job.custom_id("HOGEHOGE");

client.on("interactionCreate", async i => {
    if (i.customId == "HOGEHOGE") {
        const select = discord_job(i);
        await i.deferReply({ ephemeral: true });
        if (select.bol) {
            const role = await i.member.roles.add(select.info).catch(() => { });
            if (!role) return i.followUp("エラー");
            i.followUp("ロール追加");
        } else {
            const role = await i.member.roles.remove(select.info).catch(() => { });
            if (!role) return i.followUp("エラー");
            i.followUp("ロール削除");
        }
    }
    if (i.isCommand() && i.applicationId === client.application.id) {
        command(i.commandName, [i.options.get("role1"), i.options.get("role2"), i.options.get("role3")]);
    }
});

client.on('ready', () => {
    const servers = client.guilds.cache.size
    console.log(`Botは今 ${servers} 個のサーバーに入ってるよー`)
    client.user.setActivity(`/help | 導入数 ${servers} `, {
        type: 'PLAYING',
    })
    client.application.commands.set([
        {name: "support", description: "サポートサーバーのリンクを表示します"},
        {name: "privacy", description: "プライバシーポリシーのリンクを表示します"},
        {name: "help", description: "botのヘルプを表示します"},
        {name: "ping", description: "Pingを表示します"},
        {name: "job", description: "パネルを作成します", options: [{name: "role1", type: "ROLE", description: "ロール1", required: false},{name: "role2", type: "ROLE", description: "ロール2", required: false},{name: "role3", type: "ROLE", description: "ロール3", required: false}]},
        {name: "addjob", description: "前回作成したパネルに追加します", options: [{name: "role1", type: "ROLE", description: "ロール1", required: false},{name: "role2", type: "ROLE", description: "ロール2", required: false},{name: "role3", type: "ROLE", description: "ロール3", required: false}]},
        {name: "deletejob", description: "前回のデータを削除します"}
    ])
})
client.on('messageCreate', async message => {
    async function sendError(err) {
        const err_embed = new MessageEmbed({
            description: '```\n' + err.toString() + '\n```',
            footer: {
                text: `サーバー: ${message.guild.id} | ${message.content}`
            }
        })
        const ch = await client.channels.fetch(LOG_CHANNEL_ID)
        if (ch) {
            ch.send({ embeds: [err_embed] })
        }
    }

    if (message.author.bot) {
        return;
    }



    if (message.content.indexOf(prefix) !== 0) return;
    const [command_name, ...args] = message.content.slice(prefix.length).split(' ')
    command(command_name, args)
})
async function command(command, args) {
    switch (command) {
        case 'support':
            var embed = new MessageEmbed({
                title: "サポートサーバーです",
                description: "SupportServer",
                color: 0xffff00,
                fields: [{
                    name: "URL",
                    value: "https://discord.gg/Y6w5Jv3EAR",
                    inline: false,
                }]
            })
            message.reply({ embeds: [embed] });
            break;
        case 'PrivacyPolicy':
            var embed = new MessageEmbed({
                title: "プライバシーポリシーです",
                description: "SupportServer",
                color: 0xffff00,
                fields: [{
                    name: "URL",
                    value: "https://kuroneko6423.com/PrivacyPolicy",
                    inline: false,
                }]
            })
            message.reply({ embeds: [embed] });
            break;

        case 'help':
            var embed = new MessageEmbed({
                title: "helpです",
                description: "This is Help commands",
                color: 0xffff12,
                fields: [{
                    name: "!help",
                    value: "今、表示しているやつです"
                },
                {
                    name: "!job @ロール @ロール. . .",
                    value: "役職パネルを作成します"
                },
                {
                    name: "!addjob",
                    value: "前回作成したパネルに追加します"
                },
                {
                    name: "!deletejob",
                    value: "前回のデータを削除します"
                },
                {
                    name: "!ping",
                    value: "応答速度を表示します"
                },
                {
                    name: "!support",
                    value: "サポートサーバーのリンクを表示します"
                },
                {
                    name: "!PrivacyPolicy",
                    value: "botのPrivacyPolicyを表示します"
                }
                ]
            })
            message.reply({ embeds: [embed] })
            break;


        case 'ping':
            message.reply({ content: ` Ping を確認しています...` })
                .then((pingcheck) => {
                    pingcheck.edit(
                        `botの速度|${pingcheck.createdTimestamp - message.createdTimestamp} ms`
                    )
                });
            break;
        case "job":
            getdata = await discord_job.add_panel({ role: args, in: message, title: "ロールを選ぼう" });
            if (getdata == 1) return message.reply("入力されていません");
            if (getdata == 2) return message.reply("ロールが見つかりませんでした");
            for (let i = 0; i < getdata.content.length; i++) message.reply({ embeds: [{ description: getdata.content[i].join("\n") }], components: [getdata.select[i]] });
            break;
        case "addjob":
            getdata = await discord_job.add_panel({ role: args, in: message, title: "ロールを選ぼう" });
            if (getdata == 1) return message.reply("入力がされていません");
            if (getdata == 2) return message.reply("前回のデータが見つかりません");
            if (getdata == 3) return message.reply("ロールが見つかりません");
            for (let i = 0; i < getdata.content.length; i++)message.reply({ embeds: [{ description: getdata.content[i].join("\n") }], components: [getdata.select[i]] });
            break
        case 'deletedb':
            const deletedb = await discord_job.delete_db(message.guild.id);
            if (deletedb == 1) return message.reply("何も保存されていません");
            if (deletedb == 2) return message.reply("完了");
            break
        case "deletejob":
            const getdata = await discord_job.remove_panel({ num: args, title: "ロールを選ぼう", in: message });
            if (getdata == 1) return message.reply("前回のデータが見つかりませんでした");
            if (getdata == 2) return message.reply("前回のパネルの範囲内の数値を入れてください");
            if (getdata == 3) return message.reply("すべてのコンテンツがなくなりました");
            message.reply({ embeds: [{ description: getdata.content.join("\n") }], components: [getdata.select] });
            break
        case "cleardb":
            await discord_job.clear_db();
            message.reply("完了しました");
            break
    }
}

client.login("TOKEN");
