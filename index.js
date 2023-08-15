const { Partials, Client, GatewayIntentBits, PermissionsBitField, AuditLogEvent, ActivityType } = require('discord.js');
const yetkipermleri = [PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.ManageWebhooks, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageGuild, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.MentionEveryone]
const settings = require("../../base/globalsettings.json")
const { JsonDatabase } = require("wio.db");
const db = new JsonDatabase({ databasePath: "./MAIN/base/Database/guards.json" });
const { readdirSync } = require('fs')
const fs = require('fs')
const moment = require('moment')
require('moment-duration-format')
const { getVoiceConnection, joinVoiceChannel } = require("@discordjs/voice");

let Tokens = settings.tokens.Helpers;
let danger = false;
const Bots = global.Bots = [];
Tokens.forEach(token => {
    let bot = new Client({
        fetchAllMembers: true,
        fetchBans: true,
        intents: [
            GatewayIntentBits.GuildBans,
            GatewayIntentBits.GuildEmojisAndStickers,
            GatewayIntentBits.GuildIntegrations,
            GatewayIntentBits.GuildInvites,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildMessageTyping,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildPresences,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildWebhooks,
            GatewayIntentBits.Guilds,
            GatewayIntentBits.MessageContent,
        ],
        partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction, Partials.ThreadMember],
    })
    bot.on("ready", () => {
        bot.Busy = false;
        bot.Uj = 0;
        Bots.push(bot);
        setInterval(() => {
            bot.user.setPresence({
                activities: [
                    {
                        name: settings.guild.Bot_Durum,
                        type: ActivityType.Watching,
                    },
                ],
                status: "dnd",
            });
        }, 10000);
        })

    require("../../base/Functions/Guards/guard")(bot)
    bot.login(token).then(e => {
    }).catch(e => {
        console.error(`${token.substring(Math.floor(token.length / 2))} giriş yapamadı.`);
    });
});
require("../../base/Functions/Guards/guard")(Bots)
function giveBot(length) {
    if (length > Bots.length) length = Bots.length;
    let availableBots = Bots.filter(e => !e.Busy);
    if (availableBots.length <= 0) availableBots = Bots.sort((x, y) => x.Uj - y.Uj).slice(0, length);
    return availableBots;
}

function processBot(bot, busy, job, equal = false) {
    bot.Busy = busy;
    if (equal) bot.Uj = job;
    else bot.Uj += job;

    let index = Bots.findIndex(e => e.user.id == bot.user.id);
    Bots[index] = bot;
}

const client = (global.client = new Client({
    fetchAllMembers: true,
    fetchBans: true,
    intents: [
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction, Partials.ThreadMember]
}));

client.on("ready", () => {
    const guild = client.guilds.cache.first();
    const connection = getVoiceConnection(guild.id);
    if (connection) return;

    const VoiceChannel = client.channels.cache.get(settings.guild.Bot_Voice);
    joinVoiceChannel({
        channelId: VoiceChannel.id,
        guildId: VoiceChannel.guild.id,
        adapterCreator: VoiceChannel.guild.voiceAdapterCreator,
        selfDeaf: true,
        selfMute: true
    });

	setInterval(() => {
		client.user.setPresence({
			activities: [
				{
					name: settings.guild.Bot_Durum,
					type: ActivityType.Watching,
				},
			],
			status: "dnd",
		});
	}, 10000);
});

client.login(settings.tokens.Async).then(console.log("Async botuna giriş yapıldı."))

client.on("channelCreate", async (channel) => {
    let entry = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 1000 * 30) return;
    if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || whitelistchecker(entry.executor, "Full")) return;
    if (whitelistchecker(entry.executor, "Channel") || whitelistchecker(entry.executor, "RoleAndChannel")) return;
    let bot = giveBot(1)[0];
    processBot(bot, true, 1);
    let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
    cezalandırılacak.roles.cache.has(settings.roles.Cezalı) ? cezalandırılacak.roles.set([settings.roles.Booster, settings.roles.Cezalı]) : cezalandırılacak.roles.set([settings.roles.Cezalı]);
    processBot(bot, false, -1);
})

client.on("channelDelete", async (channel) => {
    let entry = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 1000 * 30) return;
    if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || whitelistchecker(entry.executor, "Full")) return;
    if (whitelistchecker(entry.executor, "Channel") || whitelistchecker(entry.executor, "RoleAndChannel")) return;
    let bot = giveBot(1)[0];
    processBot(bot, true, 1);
    let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
    cezalandırılacak.ban({ reason: "Mateas Guard" }).catch(err => { console.log(err) })
    processBot(bot, false, -1);
})

client.on("channelUpdate", async (oldChannel, newChannel) => {
    let entry = await oldChannel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelUpdate }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 1000 * 30) return;
    if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || whitelistchecker(entry.executor, "Full")) return;
    if (whitelistchecker(entry.executor, "Channel") || whitelistchecker(entry.executor, "RoleAndChannel")) return;
    let bot = giveBot(1)[0];
    processBot(bot, true, 1);
    let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
    cezalandırılacak.roles.cache.has(settings.roles.Cezalı) ? cezalandırılacak.roles.set([settings.roles.Booster, settings.roles.Cezalı]) : cezalandırılacak.roles.set([settings.roles.Cezalı]);
    processBot(bot, false, -1);
})

client.on("emojiCreate", async (emoji) => {
    let entry = await emoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiCreate }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 1000 * 30) return;
    if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || whitelistchecker(entry.executor, "Full")) return;
    if (whitelistchecker(entry.executor, "Emoji")) return;
    let bot = giveBot(1)[0];
    processBot(bot, true, 1);
    let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
    cezalandırılacak.roles.cache.has(settings.roles.Cezalı) ? cezalandırılacak.roles.set([settings.roles.Booster, settings.roles.Cezalı]) : cezalandırılacak.roles.set([settings.roles.Cezalı]);
    processBot(bot, false, -1);
})

client.on("emojiUpdate", async (oldEmoji, newEmoji) => {
    let entry = await oldEmoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiUpdate }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 1000 * 30) return;
    if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || whitelistchecker(entry.executor, "Full")) return;
    if (whitelistchecker(entry.executor, "Emoji")) return;
    let bot = giveBot(1)[0];
    processBot(bot, true, 1);
    let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
    cezalandırılacak.roles.cache.has(settings.roles.Cezalı) ? cezalandırılacak.roles.set([settings.roles.Booster, settings.roles.Cezalı]) : cezalandırılacak.roles.set([settings.roles.Cezalı]);
    processBot(bot, false, -1);
})

client.on("emojiDelete", async (emoji) => {
    let entry = await emoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiDelete }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 1000 * 30) return;
    if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || whitelistchecker(entry.executor, "Full")) return;
    if (whitelistchecker(entry.executor, "Emoji")) return;
    let bot = giveBot(1)[0];
    processBot(bot, true, 1);
    let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
    cezalandırılacak.roles.cache.has(settings.roles.Cezalı) ? cezalandırılacak.roles.set([settings.roles.Booster, settings.roles.Cezalı]) : cezalandırılacak.roles.set([settings.roles.Cezalı]);
    processBot(bot, false, -1);
})

client.on("guildMemberRemove", async (member) => {
    let entry = await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 1000 * 30) return;
    if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || whitelistchecker(entry.executor, "Full")) return;
    if (whitelistchecker(entry.executor, "BanAndKick")) return;
    let bot = giveBot(1)[0];
    processBot(bot, true, 1);
    let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
    cezalandırılacak.roles.cache.has(settings.roles.Cezalı) ? cezalandırılacak.roles.set([settings.roles.Booster, settings.roles.Cezalı]) : cezalandırılacak.roles.set([settings.roles.Cezalı]);
    processBot(bot, false, -1);
})

client.on("guildMemberAdd", async (member) => {
    let entry = await member.guild.fetchAuditLogs({ type: AuditLogEvent.BotAdd }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 1000 * 30) return;
    if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || whitelistchecker(entry.executor, "Full")) return;
    let bot = giveBot(1)[0];
    processBot(bot, true, 1);
    let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
    cezalandırılacak.roles.cache.has(settings.roles.Cezalı) ? cezalandırılacak.roles.set([settings.roles.Booster, settings.roles.Cezalı]) : cezalandırılacak.roles.set([settings.roles.Cezalı]);
    processBot(bot, false, -1);
})

client.on("guildMemberRemove", async (member) => {
    let entry = await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 1000 * 30) return;
    if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || db.fetch(`Whitelist.Full`).filter(e => e == entry.executor.id) === true) return;
    if (whitelistchecker(entry.executor, "BanAndKick")) return;
    let bot = giveBot(1)[0];
    processBot(bot, true, 1);
    let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
    cezalandırılacak.roles.cache.has(settings.roles.Cezalı) ? cezalandırılacak.roles.set([settings.roles.Booster, settings.roles.Cezalı]) : cezalandırılacak.roles.set([settings.roles.Cezalı]);
    processBot(bot, false, -1);
})

client.on("guildBanRemove", async (ban) => {
    let entry = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 1000 * 30) return;
    if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || db.fetch(`Whitelist.Full`).filter(e => e == entry.executor.id) === true) return;
    if (whitelistchecker(entry.executor, "BanAndKick")) return;
    let bot = giveBot(1)[0];
    processBot(bot, true, 1);
    let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
    cezalandırılacak.roles.cache.has(settings.roles.Cezalı) ? cezalandırılacak.roles.set([settings.roles.Booster, settings.roles.Cezalı]) : cezalandırılacak.roles.set([settings.roles.Cezalı]);
    processBot(bot, false, -1);
})

client.on("guildMemberUpdate", async (oldMember, newMember) => {
    if (oldMember.roles.cache.size != newMember.roles.cache.size) {
        let diffRoles = newMember.roles.cache.filter(o => !oldMember.roles.cache.has(o.id));
        let perms = yetkipermleri
        if (!diffRoles.some(e => perms.some(perm => e.permissions.has(perm)))) {
            return;
        }
        let entry = await oldMember.guild.fetchAuditLogs({ type: AuditLogEvent.MemberUpdate }).then(audit => audit.entries.first());
        if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 1000 * 30) return;
        if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || db.fetch(`Whitelist.Full`).filter(e => e == entry.executor.id) === true) return;

        let bot = giveBot(1)[0];
        processBot(bot, true, 1);
        let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
        cezalandırılacak.roles.cache.has(settings.roles.Cezalı) ? cezalandırılacak.roles.set([settings.roles.Booster, settings.roles.Cezalı]) : cezalandırılacak.roles.set([settings.roles.Cezalı]);
        processBot(bot, false, -1);
    }
})

client.on("guildUpdate", async (oldGuild, newGuild) => {
    let entry = await newGuild.fetchAuditLogs({ type: AuditLogEvent.GuildUpdate }).then(audit => audit.entries.first());
    if (!entry.executor || Date.now() - entry.createdTimestamp > 1000 * 60 * 10 || entry.executor.id === client.user.id) return;
    if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || db.fetch(`Whitelist.Full`).filter(e => e == entry.executor.id) === true) return;

    let bot = giveBot(1)[0];
    processBot(bot, true, 1);
    let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
    cezalandırılacak.ban({ reason: "Mateas Guard" }).catch(err => { console.log(err) })
    processBot(bot, false, -1);
})

client.on("channelUpdate", async (oldChannel , newChannel) => {
    let entry = await oldChannel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelOverwriteCreate }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 1000 * 30) return;
    if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || db.fetch(`Whitelist.Full`).filter(e => e == entry.executor.id) === true) return;
    if (whitelistchecker(entry.executor, "Channel") || whitelistchecker(entry.executor, "RoleAndChannel")) return;
    let bot = giveBot(1)[0];
    processBot(bot, true, 1);
    let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
    cezalandırılacak.roles.cache.has(settings.roles.Cezalı) ? cezalandırılacak.roles.set([settings.roles.Booster, settings.roles.Cezalı]) : cezalandırılacak.roles.set([settings.roles.Cezalı]);
    processBot(bot, false, -1);
})

client.on("channelUpdate", async (oldChannel , newChannel) => {
    let entry = await oldChannel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelOverwriteUpdate }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 1000 * 30) return;
    if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || db.fetch(`Whitelist.Full`).filter(e => e == entry.executor.id) === true) return;
    if (whitelistchecker(entry.executor, "Channel") || whitelistchecker(entry.executor, "RoleAndChannel")) return;
    let bot = giveBot(1)[0];
    processBot(bot, true, 1);
    let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
    cezalandırılacak.roles.cache.has(settings.roles.Cezalı) ? cezalandırılacak.roles.set([settings.roles.Booster, settings.roles.Cezalı]) : cezalandırılacak.roles.set([settings.roles.Cezalı]);
    processBot(bot, false, -1);
})

client.on("channelUpdate", async (oldChannel , newChannel) => {
    let entry = await oldChannel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelOverwriteDelete }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 1000 * 30) return;
    if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || db.fetch(`Whitelist.Full`).filter(e => e == entry.executor.id) === true) return;
    if (whitelistchecker(entry.executor, "Channel") || whitelistchecker(entry.executor, "RoleAndChannel")) return;
    let bot = giveBot(1)[0];
    processBot(bot, true, 1);
    let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
    cezalandırılacak.roles.cache.has(settings.roles.Cezalı) ? cezalandırılacak.roles.set([settings.roles.Booster, settings.roles.Cezalı]) : cezalandırılacak.roles.set([settings.roles.Cezalı]);
    processBot(bot, false, -1);
})

client.on("roleCreate", async (role) => {
    let entry = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleCreate }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 1000 * 30) return;
    if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || db.fetch(`Whitelist.Full`).filter(e => e == entry.executor.id) === true) return;
    if (whitelistchecker(entry.executor, "Role") || whitelistchecker(entry.executor, "RoleAndChannel")) return;
    let bot = giveBot(1)[0];
    processBot(bot, true, 1);
    let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
    cezalandırılacak.roles.cache.has(settings.roles.Cezalı) ? cezalandırılacak.roles.set([settings.roles.Booster, settings.roles.Cezalı]) : cezalandırılacak.roles.set([settings.roles.Cezalı]);
    processBot(bot, false, -1);
})

client.on("roleDelete", async (role) => {
    let entry = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleDelete }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 1000 * 30) return;
    if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || db.fetch(`Whitelist.Full`).filter(e => e == entry.executor.id) === true) return;
    if (whitelistchecker(entry.executor, "Role") || whitelistchecker(entry.executor, "RoleAndChannel")) {
        if (settings.guard.importantroles.some(element => element === role.id)) {
            let bot = giveBot(1)[0];
            processBot(bot, true, 1);
            let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
            cezalandırılacak.roles.cache.has(settings.roles.Cezalı) ? cezalandırılacak.roles.set([settings.roles.Booster, settings.roles.Cezalı]) : cezalandırılacak.roles.set([settings.roles.Cezalı]);
            client.channels.cache.get(settings.channels.guard_log).send(`${entry.executor} - ${entry.executor.id} kullanıcısı whitelistte fakat önemli olan **${role.name}** - **${role.id}** rolünü sildiği için cezalı olarak işaretlendi.`)
            processBot(bot, false, -1);
        } else return;
    }
    let bot = giveBot(1)[0];
    processBot(bot, true, 1);
    let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
    cezalandırılacak.ban({ reason: "Mateas Guard" }).catch(err => { console.log(err) })
    processBot(bot, false, -1);
})

client.on("roleUpdate", async (oldRole, newRole) => {
    let entry = await oldRole.guild.fetchAuditLogs({ type: AuditLogEvent.RoleUpdate }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 1000 * 30) return;
    if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || db.fetch(`Whitelist.Full`).filter(e => e == entry.executor.id) === true) return;
    if (whitelistchecker(entry.executor, "Role") || whitelistchecker(entry.executor, "RoleAndChannel")) return;
    let bot = giveBot(1)[0];
    processBot(bot, true, 1);
    let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
    cezalandırılacak.roles.cache.has(settings.roles.Cezalı) ? cezalandırılacak.roles.set([settings.roles.Booster, settings.roles.Cezalı]) : cezalandırılacak.roles.set([settings.roles.Cezalı]);
    processBot(bot, false, -1);
})

client.on("webhookUpdate", async (channel) => {
    let entry = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.WebhookCreate }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 1000 * 30) return;
    if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || db.fetch(`Whitelist.Full`).filter(e => e == entry.executor.id) === true) return;
    if (whitelistchecker(entry.executor, "Webhook")) return;
    let bot = giveBot(1)[0];
    processBot(bot, true, 1);
    let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
    cezalandırılacak.roles.cache.has(settings.roles.Cezalı) ? cezalandırılacak.roles.set([settings.roles.Booster, settings.roles.Cezalı]) : cezalandırılacak.roles.set([settings.roles.Cezalı]);
    processBot(bot, false, -1);
})

client.on("webhookUpdate", async (channel) => {
    let entry = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.WebhookUpdate }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 1000 * 30) return;
    if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || db.fetch(`Whitelist.Full`).filter(e => e == entry.executor.id) === true) return;
    if (whitelistchecker(entry.executor, "Webhook")) return;
    let bot = giveBot(1)[0];
    processBot(bot, true, 1);
    let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
    cezalandırılacak.roles.cache.has(settings.roles.Cezalı) ? cezalandırılacak.roles.set([settings.roles.Booster, settings.roles.Cezalı]) : cezalandırılacak.roles.set([settings.roles.Cezalı]);
    processBot(bot, false, -1);
})

client.on("webhookUpdate", async (channel) => {
    let entry = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.WebhookDelete }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 1000 * 30) return;
    if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || db.fetch(`Whitelist.Full`).filter(e => e == entry.executor.id) === true) return;
    if (whitelistchecker(entry.executor, "Webhook")) return;
    let bot = giveBot(1)[0];
    processBot(bot, true, 1);
    let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
    cezalandırılacak.roles.cache.has(settings.roles.Cezalı) ? cezalandırılacak.roles.set([settings.roles.Booster, settings.roles.Cezalı]) : cezalandırılacak.roles.set([settings.roles.Cezalı]);
    processBot(bot, false, -1);
})

client.on("guildMemberRemove", async (member) => {
    let entry = await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberPrune }).then(audit => audit.entries.first());
    if (!entry || !entry.executor || Date.now() - entry.createdTimestamp > 1000 * 30) return;
    if (settings.guard.BotIDs.some(e => e == entry.executor.id) || settings.guard.Botcus.some(e => e == entry.executor.id) || settings.guard.Kurucu.some(e => e == entry.executor.id) || db.fetch(`Whitelist.Full`).filter(e => e == entry.executor.id) === true) return;
    let bot = giveBot(1)[0];
    processBot(bot, true, 1);
    let cezalandırılacak = bot.guilds.cache.get(settings.guild.GuildID).members.cache.get(entry.executor.id)
    cezalandırılacak.ban({ reason: "Mateas Guard" }).catch(err => { console.log(err) })
    processBot(bot, false, -1);
})

function whitelistchecker(member, dbname) {
    let datax = db.get(`Whitelist.${dbname}`);
    let user = client.guilds.cache.get(settings.guild.GuildID).members.cache.get(member.id)
    if (datax.some(element => element == member.id)) return true;
    if (user.roles.cache.some(role => datax.some(element => role.id == element))) return true;
    else return false;
}
