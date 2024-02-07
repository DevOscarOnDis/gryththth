module.exports = {
    name: "rova",
    usage: ["Get a list of the currently available commands ```{prefix}rova```"],
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
    async execute(client, message, data) {
        try {
            return client.embed.send(message, {
                color: 'RANDOM',
                title: `Help Commands`,
                author: {
                    name: `${client.user.username} Help Menu`,
                    icon_url: `${message.client.user.displayAvatarURL()}`,
                    url: "",
                },
                fields: [
                    {
                        name: '!rova',
                        value: `send this help command`
                    },
                    {
                        name: '!b <user>',
                        value: `you can check your b or someone else's balance`
                    },
                    {
                        name: '!t <user> <amount>',
                        value: `T from your b to someone else`
                    },
                ]
            });


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