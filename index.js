// Importing modules
const Discord = require('discord.js')
const fs = require('fs')
const mongoose = require('mongoose')
const util = require('util')
const config = require('./config.js')
const readdir = util.promisify(fs.readdir)
const client = new Discord.Client({ intents: new Discord.Intents(32767), shards: 'auto' });
const Dashboard = require("./dashboard/dashboard");
const { glob } = require("glob");
const { promisify } = require("util");
const logs = require('discord-logs');
const { MessageBuilder } = require('discord-webhook-node');
const ms = require('ms');
const globPromise = promisify(glob);
function generatePassword() {
  var length = 8,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}
log = '1078004643487031387'

// Adding to the client
client.event = new Discord.Collection();
client.commands = new Discord.Collection();
client.config = config;
client.Database = require('./Database/Mongoose.js');
client.tools = require('./Tools/Tools.js');
client.logger = require('./Tools/Logger.js');
client.embed = require('./Tools/Embed.js');
client.log = log;
client.owner = ['982271127445446686', "722883397239963652", "998118700018303101"]

client.generatePassword = generatePassword();
// logs(client);
mongoose.set('strictQuery', true);

async function init() {
  const json = require("jsonbyte")
  const file = new json("./database.json")
  file.save()
  // Load Discordjs Events
  const eventFiles = fs.readdirSync('./Events/').filter(file => file.endsWith('.js'));
  for (const file of eventFiles) {
    const event = require(`./Events/${file}`);
    const eventName = file.split(".")[0];
    console.log(`Loading... ${eventName}`)
    client.on(eventName, event.bind(null, client));
  }

  // Load commands 
  let folders = await readdir("./Commands/");
  folders.forEach(direct => {
    const commandFiles = fs.readdirSync('./Commands/' + direct + "/").filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(`./Commands/${direct}/${file}`);
      client.commands.set(command.name, command);
    }
  })







  // Connect to the database
  mongoose.connect(config.mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('Connected to MongoDB')
  }).catch((err) => {
    console.log('Unable to connect to MongoDB Database.\nError: ' + err)
    process.kill()
  })



  Dashboard(client);
  client.on("messageCreate", msd => {
  })
  setInterval(() => {
    if (!client.user) process.kill(1)
  }, 3 * 1000 * 60)
}


init();
// create guildbanadd event and get who banned the user from the guild with audit logs


process.on('unhandledRejection', err => {
  console.log('Unknown error occured:\n')
  console.log(err)
})
setInterval(() => {
  if (!client || !client.user) {
    process.kill(1)
  }
}, 3 * 1000 * 60)
client.login(config.token)
