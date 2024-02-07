module.exports = {
  name: "t",
  usage: ["transfer amount to someone```{prefix}t <user> <amount>```"],
  enabled: true,
  aliases: [],
  category: "General",
  memberPermissions: [],
  botPermissions: ["SEND_MESSAGES", "EMBED_LINKS"],
  //Settings for command
  nsfw: false,
  ownerOnly: false,
  cooldown: 5000,

  // Execute contains content for the command
  async execute(client, message, data) {

    try {
      args = message.content.split(" ");
      if (!args[1]) return message.channel.send("Please specify a user");
      if (!args[2]) return message.channel.send("Please specify an amount");
      args[2] = parseInt(args[2])
      if (args[2] <= 0) {
        return message.channel.send("Please specify an amount");
      }

      if (!Number.isInteger(args[2])) return message.channel.send("Please specify a valid amount");

      if (args[1]) {
        let member = message.mentions.members.first() || message.guild.members.cache.get(args[1]);

        if (!member) return message.channel.send("Could not find user");
        if (member.id == message.author.id) {
          return message.channel.send("You can't send to yourself");
        }
        let userData = await client.Database.fetchUser(member.id);
        let userData2 = await client.Database.fetchUser(message.author.id);
        if (parseInt(userData2.money) < parseInt(args[2])) return message.channel.send("You don't have enough money");
        userData.money += args[2];
        userData.money = userData.money.toFixed(2);
        userData.save();
        userData2.money -= args[2];
        userData2.money = userData2.money.toFixed(2);
        userData2.save();
        message.channel.send(`${message.author.username} has transferred ${args[2]}$ to ${member.user.username}`);
        client.channels.cache.get(log).send(`${message.author.username} has transferred ${args[2]}$ to ${member.user.username}`);
      } else {
        message.channel.send("Please specify a user");
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
// here did you mean