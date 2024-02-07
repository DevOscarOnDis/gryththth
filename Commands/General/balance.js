module.exports = {
    name: "b",
    usage: ["check your balance```{prefix}b```", "check someone's balance```{prefix}balance <user>```"],
    enabled: true,
    aliases: [],
    category: "General",
    memberPermissions: [],
    botPermissions: ["SEND_MESSAGES"],
    //Settings for command
    nsfw: false,
    ownerOnly: false,
    cooldown: 10000,

    // Execute contains content for the command
    async execute(client, message, data){
        try{

            args = message.content.split(" ");
            if (args[1]) {
                let member = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
                if (!member) return message.channel.send("Could not find user");
                let userData = await client.Database.fetchUser(member.id);

                client.embed.send(message, {
                description: `${member.user.username} has ${userData.money}$`,
                color: `RED`,
                author: {
                    name: `${member.user.username}`,
                    icon_url: `${message.author.displayAvatarURL()}`,
                    url: "",
                }
            });
            } else {
              client.embed.send(message, {
                description: `${message.author.username} has ${data.user.money}$`,
                color: `RED`,
                author: {
                    name: `${message.author.username}`,
                    icon_url: `${message.author.displayAvatarURL()}`,
                    url: "",
                }
            })
            }

        }catch(err){
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