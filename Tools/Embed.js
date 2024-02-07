const Discord = require("discord.js"),
config = require('./../config.js');

module.exports.send = async function(message, embed){
    let newEmbed = new Discord.MessageEmbed()
    .setColor('RANDOM')
    embed = {... newEmbed, ... embed}

    return message.channel.send({embeds: [embed]});

};

module.exports.send2 = async function(channel, embed){
    let newEmbed = new Discord.MessageEmbed()
    .setColor('RANDOM')
    embed = {... newEmbed, ... embed}

    return channel.send({embeds: [embed]});

};
module.exports.usage = async function(message, data){
    let cmd = data.cmd;
    let usageDesc = await cmd.usage.join("\n").replace(/{prefix}/g, data.guild.prefix);

    let newEmbed = new Discord.MessageEmbed()
    .setColor("RED")
    .setAuthor("Uh Oh!", message.author.displayAvatarURL())
    .setDescription("Missing arguments for command. Please provide the valid inputs.")
    .addField("__Usage__", usageDesc);

    return message.channel.send({embeds: [newEmbed]});

};