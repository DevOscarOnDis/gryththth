const config = require("../config.js"),
  cmdCooldown = {};
const ms = require("ms")
const usersMap = new Map();
const LIMIT = 5;
const TIME = ms('3h');
const DIFF = 10000;
const Discord = require("discord.js")
log = '1078004643487031387'
module.exports = async (client, message) => {
  try {
    if (message.author.bot) return; // Return if author is bot
    if (!message.guild) return; // Return if dms or group chat




    // Define prefix as variable
    let prefix = '!';

    //Check if message mentions bot only
    if (message.content === `<@!${message.client.user.id}>` || message.content === `<@${message.client.user.id}>`) {
      return message.reply({ content: `Uh-Oh! You forgot the prefix? It's \`${prefix}\``, allowedMentions: { repliedUser: true } });
    }
    var x = true

    // Return if it doesn't start with prefix
    if (!message.content.toLowerCase().startsWith(prefix)) var x = false;
    //Checking if the message is a command
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const commandName = args.shift().toLowerCase();
    const cmd = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    //If it isn't a command then return
    if (!cmd) var x = false;
    if (x) {

      let userPerms = [];
      //Checking for members permission
      cmd.memberPermissions.forEach((perm) => {
        if (!message.channel.permissionsFor(message.member).has(perm)) {
          userPerms.push(perm);
        }
      });
      //If user permissions arraylist length is more than one return error
      if (userPerms.length > 0 && !message.member.roles.cache.find((r) => r.name.toLowerCase() === config.adminRole.toLowerCase())) {
        client.logger.cmd(`${message.author.tag} used ${cmd.name} - Missing permissions`);
        return message.channel.send("Looks like you're missing the following permissions:\n" + userPerms.map((p) => `\`${p}\``).join(", "));
      }

      let clientPerms = [];
      //Checking for client permissions
      cmd.botPermissions.forEach((perm) => {
        if (!message.channel.permissionsFor(message.guild.me).has(perm)) {
          clientPerms.push(perm);
        }
      });
      //If client permissions arraylist length is more than one return error
      if (clientPerms.length > 0) {
        client.logger.cmd(`${message.author.tag} used ${cmd.name} - Missing permissions`);
        return message.channel.send("Looks like I'm missing the following permissions:\n" + clientPerms.map((p) => `\`${p}\``).join(", "));
      }

      let userCooldown = cmdCooldown[message.author.id];

      if (!userCooldown) {
        cmdCooldown[message.author.id] = {};
        uCooldown = cmdCooldown[message.author.id];
      }

      let time = uCooldown[cmd.name] || 0;
      //Check if user has a command cooldown
      if (time && (time > Date.now())) {
        let timeLeft = Math.ceil((time - Date.now()) / 1000);
        return message.channel.send(`Command is on cooldown. You need to wait ${timeLeft} seconds`)//Error message
      }

      cmdCooldown[message.author.id][cmd.name] = Date.now() + cmd.cooldown;

      //Get the user database
      let userData = await client.Database.fetchUser(message.author.id);
      // guildData = await client.Database.fetchGuild(message.guild.id);let
      let data = {};
      data.user = userData;
      data.cmd = cmd;
      data.config = config;
      //Execute the command and log the user in console
      cmd.execute(client, message, data);
      client.logger.cmd(`${message.author.tag} used ${cmd.name}`);

      //Create a new log for the command
      client.Database.createLog(message, data);
    }
    if (message.channel.id == config.channelid) {// بدل ما تعمل كده خليها في config.js
      let userData = await client.Database.fetchUser(message.author.id);
      // guildData = await client.Database.fetchGuild(message.guild.id);let
      let data = {};
      data.user = userData;
      // message.author.id == config.probot
      // stop
      if (message.content.includes(`#credits `) && message.content.includes(config.id2) || message.content.includes(`#credits `) && message.content.includes(config.id2) || message.content.includes(`c `) && message.content.includes(config.id2) || message.content.includes(`c `) && message.content.includes(config.id2) || message.content.includes(`C <@!${config.id2}>`) || message.content.includes(`C `) && message.content.includes(config.id2) || message.content.includes(`#credit `) && message.content.includes(config.id2) || message.content.includes(`#credit `) && message.content.includes(config.id2)) {

        //wait for 2 messages to be sent from probot
        const filter = m => m.author.id == config.probot;
        const collector = message.channel.createMessageCollector(filter, { time: 60000 });
        console.log(message.author.username)
        v = 0;
        collector.on('collect', m => {
          var t = message.author.username;
          var hi = t.length;
          hi2 = message.author.username.length + 35;
          hi3 = message.author.username.length + 35;

          if (m.content.includes(`:moneybag: | ${message.author.username}, has transferred`) && m.content.includes(config.id2)) {
            // get user length
            while (m.content[hi3] != '`') {
              hi3++;
            }
            console.log(m.content.substring(hi2, hi3))
            console.log(m.content.substring(hi2, hi3) / 7125)
            if (m.content.substring(hi2, hi3) / 7125 < 0) {
              hi2 = message.author.username.length + 35;
              hi3 = message.author.username.length + 35;
              while (m.content[hi3] != '`') {
                hi3++;
              }
            }
            if (message.member.roles.cache.some(role => role.name === 'BASIC')) {
              data.user.money += m.content.substring(hi2, hi3) / 4211;
              data.user.money = data.user.money.toFixed(2);
              data.user.save()
              var hhhh = m.content.substring(hi2, hi3) / 4211
            } else if (message.member.roles.cache.some(role => role.name === 'STANDARD')) {
              data.user.money += m.content.substring(hi2, hi3) / 2106;
              data.user.money = data.user.money.toFixed(2);
              data.user.save()
              var hhhh = m.content.substring(hi2, hi3) / 2106;
            } else if (message.member.roles.cache.some(role => role.name === 'PREMIUM')) {
              data.user.money += m.content.substring(hi2, hi3) / 1053;
              data.user.money = data.user.money.toFixed(2);
              data.user.save()
              var hhhh = m.content.substring(hi2, hi3) / 7125;
            } else {
              data.user.money += m.content.substring(hi2, hi3) / 7125;
              data.user.money = data.user.money.toFixed(2);
              data.user.save()
              var hhhh = m.content.substring(hi2, hi3) / 4106
            }

            client.channels.cache.get(log).send(`<@!${message.author.id}> has received ${hhhh.toFixed(2)} from transfer to rova bank account`)

            m.react('💸');

            collector.stop();
          } else {
            console.log('Hi')
          }
        })

      }
    }

  } catch (err) {
    console.error(err);
  }

};