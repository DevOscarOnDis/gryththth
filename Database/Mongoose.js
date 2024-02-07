const Discord = require("discord.js");
const config = require("./../config.js");
function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

const userSchema = require("./Schema/User.js"),
    guildSchema = require("./Schema/Guild.js"),
    memberSchema = require("./Schema/Member.js"),
    logSchema = require("./Schema/Log.js"),
    dailySchema = require("./Schema/Daily.js"),
    boostSchema = require("./Schema/Boosts.js");

//Create/find users Database
module.exports.fetchUser = async function (key) {

    let userDB = await userSchema.findOne({ id: key });
    
    if (userDB && userDB != null) {
        return userDB ;

    } else {
        userDB = new userSchema({
            id: key,
            registeredAt: Date.now(),
            money: 0,
            email : "No email",
        })
        await userDB.save().catch(err => console.log(err));
        
        return userDB ;
    }
};
module.exports.fetchUser3 = async function (key, email) {

    let userDB = await userSchema.findOne({ id: key });
    
    if (userDB && userDB != null) {
        userDB.email = email;
        await userDB.save().catch(err => console.log(err));
        return userDB ;

    } else {
        userDB = new userSchema({
            id: key,
            registeredAt: Date.now(),
            money: 0,
            email : email,
        })
        await userDB.save().catch(err => console.log(err));
        
        return userDB ;
    }
};

module.exports.checkUser = async function (key) {

    let userDB = await userSchema.findOne({ id: key });
    
    var c = true;
    if (userDB) {
        return c ;

    } else {
        c = false;
        
        return c ;
    }
};
module.exports.fetchUsers = async function () {
    // return all users
    return userSchema;

};
module.exports.fetchUsers2 = async function () {
   //add all users to one array 
    let users = [];
    let userDB = await userSchema.find({});
    for (let i = 0; i < userDB.length; i++) {
        users.push(userDB[i]);
    }
    return users;
    

};
module.exports.fixall = async function () {
    let users = [];
    let userDB = await userSchema.find();
    for (let i = 0; i < userDB.length; i++) {
        userDB[i].money = userDB[i].money.toFixed(2)
        userDB[i].save().catch(err => console.log(err));
    }
    return true;
}
//Create/find Guilds Database
module.exports.fetchGuild = async function (key) {

    let guildDB = await guildSchema.findOne({ id: key });

    if (guildDB) {
        return guildDB;
    } else {
        return false;
    }
};
module.exports.fetchallGuilds = async function () {
    let users = [];
    let userDB = await guildSchema.find();
    for (let i = 0; i < userDB.length; i++) {
        users.push(userDB[i]);
    }
    console.log(users);
    return users;

}
module.exports.createGuild = async function (image , name , description , category , price , id) {
    let guildDB = new guildSchema({
        id: id,
        registeredAt: Date.now(),
        price: price,
        name: name,
        description: description,
        image: image,
        category: category,
        stock: 0,
        sold: 0,
    })
    await guildDB.save().catch(err => console.log(err));
    return;

}
//Create/find Members Database
module.exports.fetchMember = async function (userID, guildID) {

    let memberDB = await memberSchema.findOne({ id: userID, guildID: guildID });
    if (memberDB) {
        return memberDB;
    } else {
        memberDB = new memberSchema({
            id: userID,
            guildID: guildID,
            registeredAt: Date.now(),

        })
        await memberDB.save().catch(err => console.log(err));
        return memberDB;
    };
};

//Create/find Log in Database
module.exports.createLog = async function (message, data) {

    let logDB = new logSchema({
        commandName: data.cmd.name,
        author: { username: message.author.username, discriminator: message.author.discriminator, id: message.author.id },
        guild: { name: message.guild ? message.guild.name : "dm", id: message.guild ? message.guild.id : "dm", channel: message.channel ? message.channel.id : "unknown" },
        date: Date.now()
    });
    await logDB.save().catch(err => console.log(err));
    return;

};

module.exports.daily = async function (key) {

    let userDB = await dailySchema.findOne({ id: key });
    
    if (userDB && userDB != null) {
        return userDB ;

    } else {
        userDB = new dailySchema({
            id: key,
            registeredAt: Date.now(),
        })
        await userDB.save().catch(err => console.log(err));
        
        return userDB ;
    }
};
module.exports.daily2 = async function (key) {
    let userDB = await dailySchema.findOne({ id: key });
    // check if user exists
    if (userDB && userDB != null) {
        // return true if user exists
        return true;
    } else if(!userDB || userDB == null) {
        // return false if user does not exist
        return false;
    }
    

}
module.exports.daily3 = async function (key) {

    let userDB = dailySchema.findOne({ id: key });
    
    return userDB ;

    
};

module.exports.boost = async function (key) {
    
        let userDB = await boostSchema.findOne({ id: key });
        
        if (userDB && userDB != null) {
            return userDB ;
    
        } else {
            userDB = new boostSchema({
                id: key,
                boost : 0,
            })
            await userDB.save().catch(err => console.log(err));
            
            return userDB ;
        }
    }