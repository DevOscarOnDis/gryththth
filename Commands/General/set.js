module.exports = {
    name: "set",
    usage: ["For owners only"],
    enabled: true,
    aliases: [],
    category: "General",
    memberPermissions: [],
    botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
    //Settings for command
    nsfw: false,
    ownerOnly: false,
    cooldown: 10000,

    // Execute contains content for the command
    async execute(client, message, data) {
        try {
            let users = await client.Database.fetchUsers2();


            if (!client.owner.includes(message.author.id)) {
                return client.embed.send(message, {
                    description: `An issue has occured while running the command. You are not owner .`,
                    color: `RED`,
                    author: {
                        name: `Uh Oh!`,
                        icon_url: `${message.author.displayAvatarURL()}`,
                        url: "",
                    }
                });
            }
            args = message.content.split(" ");
            if (!args[1]) return message.channel.send("Please specify a user");
            if (!args[2]) return message.channel.send("Please specify an amount");
            args[2] = parseInt(args[2])
            

            if (args[2] < 0) {
                return message.channel.send("Please specify an amount higher than 0");
            }
            let member = message.mentions.members.first() || message.guild.members.cache.get(args[1]);

          

            if (member) {
                let userData = await client.Database.fetchUser(member.id);
                args[2] = args[2].toFixed(2)
                userData.money = args[2]
                userData.save();
                message.channel.send(`${member.user.username} balance is \`${args[2]}\` now`)
                client.channels.cache.get(log).send(`${message.author.username} has changed ${member.user.username} balance to ${args[2]}$ `);

            }

            if (!member) {
                let userData = await client.Database.fetchUser(`${args[1]}`);
                args[2] = args[2].toFixed(2)
                userData.money = args[2]
                userData.save();
                message.channel.send(`${args[1]} balance is \`${args[2]}\` now`)
                client.channels.cache.get(log).send(`${message.author.username} has changed ${args[1]} balance to ${args[2]}$ `);
                return
            }





        } catch (err) {
            client.logger.error(`Ran into an error while executing ${data.cmd.name}`)
            console.log(err)
            return client.embed.send(message, {
                description: `An issue has occured while running the command. If this error keeps occuring please contact our development team.`,
                color: `RED`,
                author: {
                    name: `Uh Oh!`,
                    icon_url: `${message.author.displayAvatarURL()}`,
                    url: "",
                }
            });
        }
    }
}