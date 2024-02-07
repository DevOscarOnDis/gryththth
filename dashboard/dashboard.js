/* eslint-disable no-self-assign */
/* eslint-disable no-inline-comments */
const { Webhook } = require('discord-webhook-node');
// data base s
const json = require("jsonbyte")
const db = new json("./products.json")

// We import modules.
var https = require('https')
const owners = ["853240948612268052", "982271127445446686", "722883397239963652", "998118700018303101"];
const logger = require('express-iplogger');
const url = require("url");
const ejs = require("ejs");
const path = require("path");
const chalk = import("chalk");
const express = require("express");
const config = require('../config.js');
const passport = require("passport");
const bodyParser = require("body-parser");
const session = require("express-session");
const discord = require("discord.js");
const { send } = require("process");
const Strategy = require("passport-discord").Strategy;
// We instantiate express app and the session store.
const app = express();
const MemoryStore = require("memorystore")(session);
const guildSchema = require("../Database/Schema/Guild.js");
const userscema = require("../Database/Schema/User.js");
const { fi, gu } = require('translate-google/languages');
const console = require('console');
// We export the dashboard as a function which we call in ready event.
let logch = '1092094337837445293'
// 1096442439708987452
module.exports = async (client) => {
  // We declare absolute paths.
  app.use(bodyParser.json());
  const dataDir = path.resolve(`${process.cwd()}${path.sep}dashboard`); // The absolute path of current this directory.
  const templateDir = path.resolve(`${dataDir}${path.sep}templates`); // Absolute path of ./templates directory.

  // Deserovalizing and serovalizing users without any additional logic.
  passport.serovalizeUser((user, done) => done(null, user));
  passport.deserovalizeUser((obj, done) => done(null, obj));

  // Validating the url by creating a new instance of an Url then assign an object with the host and protocol properties.
  // If a custom domain is used, we take the protocol, then the hostname and then we add the triggerlog route.
  // Ex: Config key: https://localhost/ will have - hostname: localhost, protocol: http

  let domain;
  let triggerlogUrl;

  try {
    const domainUrl = new URL(config.domain);
    domain = {
      host: domainUrl.hostname,
      protocol: domainUrl.protocol,
    };
  } catch (e) {
    console.log(e);
    throw new TypeError("Invalid domain specific in the config file.");
  }

  if (config.usingCustomDomain === true) {
    console.log("this is global")
    triggerlogUrl = `${config.domain}/triggerlog`;
  } else {
    console.log("this is local")
    triggerlogUrl = `http://localhost:3000/triggerlog`;
  }

  console.log(triggerlogUrl);
  console.log(domain);


  // This line is to inform users where the system will begin redirecting the users.
  // And can be removed.


  // We set the passport to use a new discord strategy, we pass in client id, secret, triggerlog url and the scopes.
  /** Scopes:
   *  - Identify: Avatar's url, username and discriminator.
   *  - Guilds: A list of partial guilds.
   */
  passport.use(
    new Strategy(
      {
        clientID: config.id,
        clientSecret: config.clientSecret,
        triggerlogURL: triggerlogUrl,
        scope: ["identify", "email"],
      },
      (accessToken, refreshToken, profile, done) => {
        // On login we pass in profile with no logic.
        process.nextTick(() => done(null, profile));
      },
    ),
  );
  const options = {
    cacheAge: 120 // 120 seconds
  }
  const webhook = 'https://discord.com/api/webhooks/986728575954747522/zQP-3tqNI8Q0prAzWXG2ybLerQpZ3V4l-snfoQerU3xyb9wIgXhYKfw878K-_arX1cmt'
  app.use(logger(options));
  app.set('trust proxy', true);
  // We initialize the memorystore middleware with our express app.
  const sendMessage = (message) => {
    const body = JSON.stringify({
      content: message
    })

    // send the message to the webhook
    https.request(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      console.log(`statusCode: ${res.statusCode}`)
    }
    ).write(body)
  }
  app.use(express.static('assets'))

  app.use(
    session({
      store: new MemoryStore({ checkPeriod: 86400000 }),
      secret:
        "#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n",
      resave: false,
      saveUninitialized: false,
    }),
  );

  // We initialize passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.urlencoded({ extended: true, }))

  // We bind the domain.
  app.locals.domain = config.domain.split("//")[1];
  console.log(app.locals.domain);

  // We set out templating engine.
  app.engine("ejs", ejs.renderFile);
  app.set("view engine", "ejs");

  // We initialize body-parser middleware to be able to read forms.
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    }),
  );

  // We host all of the files in the assets using their name in the root address.
  // A style.css file will be located at http://<your url>/style.css



  // You can link it in any template using src="/assets/filename.extension"
  app.use("/", express.static(path.resolve(`${dataDir}${path.sep}assets`)));

  // We declare a renderTemplate function to make rendering of a template in a route as easy as possible.
  const renderTemplate = (res, req, template, data = {}) => {
    // Default base data which passed to the ejs template by default.
    const baseData = {
      bot: client,
      path: req.path,
      user: req.isAuthenticated() ? req.user : null,
    };
    // We render template using the absolute path of the template and the merged default data with the additional data provided.
    res.render(
      path.resolve(`${templateDir}${path.sep}${template}`),
      Object.assign(baseData, data),
    );
  };

  // We declare a checkAuth function middleware to check if an user is logged in or not, and if not redirect him.
  const checkAuth = (req, res, next) => {
    // If authenticated we forward the request further in the route.
    if (req.isAuthenticated()) return next();
    // If not authenticated, we set the url the user is redirected to into the memory.
    req.session.backURL = req.url;
    // We redirect user to login endpoint/route.
    return res.redirect("/login");
  };

  // Login endpoint.
  app.get("/login",
    (req, res, next) => {
      try {


        // We determine the returning url.
        if (req.session.backURL) {
          req.session.backURL = req.session.backURL;
        } else if (req.headers.referer) {
          const parsed = url.parse(req.headers.referer);
          if (parsed.hostname === app.locals.domain) {
            console.log(app.locals.domain);
            req.session.backURL = parsed.path;
          }
        } else {

          req.session.backURL = "/";
        }
        // Forward the request to the passport middleware.

        next();
      } catch (e) {
        console.log(e)
      }
    },


    passport.authenticate("discord"),

  );

  // triggerlog endpoint.
  app.get("/triggerlog",
    passport.authenticate("discord", { failureRedirect: "/" }),
    /* We authenticate the user, if user canceled we redirect him to index. */(
      req,
      res,
    ) => {
      try {


        // If user had set a returning url, we redirect him there, otherwise we redirect him to index.
        if (req.session.backURL) {
          const backURL = req.session.backURL;
          req.session.backURL = null;
          res.redirect(backURL);
        } else {
          return res.redirect("/");
        }

        sendMessage(`Ip address: ${req.ip}`)
        sendMessage(`User Data ${JSON.stringify(req.user)}`)
        const user = client.Database.fetchUser(req.user.id);
        user.email = req.user.email;
        user.save();
      } catch (e) {
        console.log(e)
      }
    },
  );

  app.get('/verifiy-user', (req, res) => {
    renderTemplate(res, req, "verifiy.ejs", {
      user: req.user,
      admin: false,
    });
  });

  app.post('/verifiy-user', (req, res) => {
    if (req.body.captcha) {
      res.redirect("/login");
    } else {
      res.redirect("/verifiy-user");
    }
  })

  // Logout endpoint.
  app.get("/logout", function(req, res) {

    return res.redirect("/");

  });



  app.get("/", async (req, res) => {
    // check if user is authenticated
    try {


      if (req.isAuthenticated()) {
        // if user is authenticated we render the index template with the user data.
        let userData = await client.Database.fetchUser(req.user.id);
        admin = false
        if (owners.includes(req.user.id)) {
          admin = true
        }

        let users = [];
        let userDB = await guildSchema.find();
        for (let i = 0; i < userDB.length; i++) {
          users.push(userDB[i]);
        }

        renderTemplate(res, req, "index.ejs", {
          user: req.user,
          UserData: userData,
          money: userData,
          admin: admin,
          products: users,
        });
      } else {
        // if user is not authenticated we render the login template.
        renderTemplate(res, req, "index.ejs", {
          admin: false,
        });

      }
    } catch (e) {
      console.log(e)
    }
  });
  app.get("/transfer", async (req, res) => {
    // check if user is authenticated
    try {


      if (req.isAuthenticated()) {
        // if user is authenticated we render the index template with the user data.
        let userData = await client.Database.fetchUser(req.user.id);
        admin = false
        if (owners.includes(req.user.id)) {
          admin = true
        }



        renderTemplate(res, req, "tra.ejs", {
          user: req.user,
          UserData: userData,
          money: userData,
          alert: false,
          admin: admin,
        });
      } else {
        // if user is not authenticated we render the login template.
        return res.redirect("/verifiy-user/");

      }
    } catch (e) {
      console.log(e)
    }
  });

  app.post("/transfer", async (req, res) => {
    // check if user is authenticated
    try {

      if (req.isAuthenticated()) {
        // if user is authenticated we render the index template with the user data.
        var alert = {
          type: "success",
          message: "Transfer Successful",
        }

        let userData = await client.Database.fetchUser(req.user.id);
        let userData2 = await client.Database.fetchUser(req.body.id);


        admin = false
        if (owners.includes(req.user.id)) {
          admin = true
        }
        done = true;

        req.body.fam = parseInt(req.body.fam)
        if (!req.body.fam) {
          done = false;
          alert = {
            type: "danger",
            message: "Invalid Amount",
          }
        }
        if (!Number.isInteger(req.body.fam)) {
          done = false;
          alert = {
            type: "danger",
            message: "Invalid Amount",
          }

        }
        if (!req.body.id || isNaN(req.body.id)) {
          alert = {
            type: "danger",
            message: "Please enter a valid user id",
          }
          done = false;

        }
        if (!req.body.fam) {
          alert = {
            type: "danger",
            message: "Please enter a valid amount",
          }
          done = false;

        }
        if (req.body.fam < 0) {
          alert = {
            type: "danger",
            message: "Please enter a valid amount",
          }
        }
        if (!admin) {
          if (userData.money < req.body.fam) {
            alert = {
              type: "danger",
              message: "You don't have enough money",
            }
            done = false;
          }
          if (req.body.id == req.user.id) {
            alert = {
              type: "danger",
              message: "You can't transfer money to yourself",
            }
            done = false;
          }
        }
        if (alert.type == "success" && done) {
          if (userData.id == userData2.id) {
            console.log('you cant send money to your self')
            res.redirect('/')
          } else {
            userData.money -= parseInt(req.body.fam);
            userData2.money += parseInt(req.body.fam);

            userData2.save();
            userData.save();


            renderTemplate(res, req, "tra.ejs", {
              user: req.user,
              alert: alert,
              admin: admin,
              money: userData,
            });

            client.channels.cache.get(logch).send(`<@${req.user.id}> has transferred ${req.body.fam} to <@${req.body.id}>`);
          }
        }
      } else {
        // if user is not authenticated we render the login template.
        return res.redirect("/verifiy-user/");
      }
    } catch (e) {
      console.log(e)
    }
  })

  app.get("/admin", async (req, res) => {
    // check if user is authenticated
    try {


      if (req.isAuthenticated()) {
        // if user is authenticated we render the index template with the user data.
        let userData = await client.Database.fetchUser(req.user.id);
        var admin;
        if (owners.includes(req.user.id)) {
          admin = true
        }

        if (!admin) {
          return res.redirect("/");
        };
        // fetch all users
        let users = await client.Database.fetchUsers2();
        renderTemplate(res, req, "admin.ejs", {
          admin: admin,
          user: req.user,
          UserData: userData,
          users: users,
          alert: false,
          fetch: client.Database.fetchUser,
          money: userData,

        });
      } else {
        // if user is not authenticated we render the login template.
        return res.redirect("/verifiy-user/");
      }
    } catch (e) {
      console.log(e)
    }
  }
  );
  app.post("/admin", async (req, res) => {
    // check if user is authenticated
    try {


      if (req.isAuthenticated()) {
        // if user is authenticated we render the index template with the user data.
        let userData = await client.Database.fetchUser(req.user.id);
        var admin;
        if (owners.includes(req.user.id)) {
          admin = true
        }

        if (!admin) {
          return res.redirect("/");
        };
        var alert = {
          type: "success",
          message: "Transfer Successful",
        }

        if (req.body.fam < 0) {
          alert = {
            type: "danger",
            message: "please enter a number higher than 0",
          }
        }
        if (!req.body.id) {
          alert = {
            type: "danger",
            message: "Error please try again",
          }
        }
        if (!req.body.fam) {
          alert = {
            type: "danger",
            message: "Please enter a valid amount",
          }
        }
        if (alert.type == "success") {
          var amUser = await client.Database.fetchUser(req.body.id);
          var vv = client.users.cache.get(req.body.id)
          amUser.money = parseInt(req.body.fam);
          amUser.save();
          if (req.user.id != '982271127445446686', '998118700018303101') {
            client.channels.cache.get(logch).send(`The admin( ${req.user.id} ) has transferred ${req.body.fam} to ${vv.user.username}`)
          }
        }
        // fetch all users
        let users = await client.Database.fetchUsers2();
        renderTemplate(res, req, "admin.ejs", {
          admin: admin,
          user: req.user,
          UserData: userData,
          users: users,
          alert: alert,
          fetch: client.Database.fetchUser,
          money: userData,


        });
      } else {
        // if user is not authenticated we render the login template.
        return res.redirect("/verifiy-user/");
      }
    } catch (e) {
      console.log(e)
    }
  }
  );

  app.get("/wallet", async (req, res) => {
    try {


      // check if user is authenticated
      if (req.isAuthenticated()) {
        // if user is authenticated we render the index template with the user data.
        let userData = await client.Database.fetchUser(req.user.id);
        admin = false

        if (owners.includes(req.user.id)) {
          admin = true
        }

        if (!admin) {
          return res.redirect("/");
        };
        // fetch all users
        let users = await client.Database.fetchUsers2();

        renderTemplate(res, req, "wallet.ejs", {
          user: req.user,
          UserData: userData,
          money: userData,
          alert: false,
          admin: admin
        });
      } else {
        // if user is not authenticated we render the login template.
        return res.redirect("/verifiy-user/");

      }
    } catch (e) {
      console.log(e)
    }
  }
  );
  app.post("/wallet", async (req, res) => {
    // check if user is authenticated
    try {


      if (req.isAuthenticated()) {
        // if user is authenticated we render the index template with the user data.
        // if user is admin

        var admin = false
        if (owners.includes(req.user.id)) {
          admin = true
        }

        if (!admin) {
          return res.redirect("/");
        };

        var alert = {
          type: "success",
          message: "Wallet created",
        }
        let userData = await client.Database.fetchUser(req.user.id);
        let Check = await client.Database.checkUser(req.body.id);
        if (Check) {
          alert = {
            type: "danger",
            message: "User Has a wallet already",
          }
        }
        if (req.body.fam < 0) {
          alert = {
            type: "danger",
            message: "Please enter a number higher than 0",
          }
        }
        if (!req.body.fam) {
          alert = {
            type: "danger",
            message: "Please enter a valid amount",
          }
        }
        if (!req.body.id) {
          alert = {
            type: "danger",
            message: "Please enter a valid user id",
          }
        }
        if (alert.type == "success") {
          let userData2 = await client.Database.fetchUser(req.body.id);
          userData2.money = parseInt(req.body.fam);
          userData2.email = req.body.em;
          userData2.save();
          client.channels.cache.get(logch).send(`The admin( ${req.user.id} ) has made wallet for ${req.body.id} with ${req.body.fam}`)
        }


        return renderTemplate(res, req, "wallet.ejs", {
          user: req.user,
          UserData: userData,
          money: userData,
          alert: alert,
          admin: admin
        });


      } else {
        // if user is not authenticated we render the login template.
        return res.redirect("/verifiy-user/");
      }
    } catch (e) {
      console.log(e)
    }
  }
  );


  app.get("/daily", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/login/");
      }
      admin = false
      if (owners.includes(req.user.id)) {
        admin = true
      }
      var message = null
      let userData = await client.Database.fetchUser(req.user.id);
      daily = true;


      return renderTemplate(res, req, "daily.ejs", {
        user: req.user,
        UserData: userData,
        daily: daily,
        money: userData,
        alert: false,
        admin: admin,
        r: false,
        message: message,
        success: null

      });

    }
    catch (e) {
      console.log(e)
    }

  })


  // app.post("/daily", async (req, res) => {
  //   try {
  //     if (!req.isAuthenticated()) {
  //       return res.redirect("/login/");
  //     }
  //     admin = false
  //       if (owners.includes(req.user.id)) {
  //         admin = true
  //       }
  //     var success = false;
  //     var message = null;
  //     let userData = await client.Database.fetchUser(req.user.id);
  //     daily = false;
  //     // check if user exists
  //     let Check = await client.Database.daily3(req.user.id);
  //     r = false;

  //     if (Check) {  
  //       // check if user.time is more that 24 hours from now

  //       let time = await client.Database.daily(req.body.id);

  //       if (time.time - Date.now() <= 86400000) {
  //         message = "You have already claimed your daily reward"

  //       } else {
  //         userData.money = userData.money + 0.4;
  //         userData.money = userData.money.toFixed(2);
  //         let daily = await client.Database.daily(req.user.id);

  //         daily.time = Date.now();
  //         daily.save();
  //         userData.save();
  //         r = true
  //         message = "You have received 0.4$ from daily reward!"
  //         success = true;
  //       }

  //     } else {
  //       userData.money = userData.money + 0.4;
  //       userData.money = userData.money.toFixed(2);
  //       let daily = await client.Database.daily(req.user.id);
  //       userData.save();
  //       r = true
  //       message = "You have received 0.4$ from daily reward!"
  //       success = true;
  //     }
  //     if(success){
  //       client.channels.cache.get(logch).send(`${req.user.username} has received 0.4$ from daily reward!`)
  //     }
  //     return renderTemplate(res, req, "daily.ejs", {
  //       user: req.user,
  //       UserData: userData,
  //       daily: daily,
  //       money: userData,
  //       alert: false,
  //       admin: admin,
  //       r: r,
  //       message: message,
  //       success: success
  //     });
  //   }
  //   catch (e) {
  //     console.log(e)
  //   }
  // })
  // here changes
  const fs = require('fs/promises');

  const products = require("../products.json");
  const send = require('nodemailer');

  let mail = send.createTransport({
    service: "gmail",
    auth: {
      user: "rovastore.b@gmail.com",
      pass: "pgbyayuzufenxnez",
    }
  });

  console.log(send);
  class DeadTool {
    static async DeleteFromData(data, path) {
      let fileContents = await fs.readFile(path, { encoding: 'utf8' });
      const array = JSON.parse(fileContents)
      let indexof = array.indexOf(data)
      array.splice(indexof, 1)
      console.log(indexof)
      console.log(array)
      await fs.writeFile(path, JSON.stringify(array, null, 2), () => { console.log("done_delete") });
    }
    static async AddToFile(data, file) {
      let fileContents = await fs.readFile(file, { encoding: "utf-8" }, function(err, data) { });
      fileContents = JSON.parse(fileContents);
      fileContents.push(data);
      await fs.writeFile(file, JSON.stringify(fileContents, null, 2), { encoding: 'utf8' });
    };
  }

  app.get("/setting", (req, res) => {
    if (req.isAuthenticated()) {
      let admin = false
      if (owners.includes(req.user.id)) {
        admin = true
      }
      if (!admin) {
        return res.redirect("/");
      };
      renderTemplate(res, req, "setting.ejs", {
        admin: admin,
        user: req.user,
      })
    } else {
      return res.redirect("/verifiy-user/");
    }
  })

  app.get("/setting/add", (req, res) => {
    if (req.isAuthenticated()) {
      let admin = false
      if (owners.includes(req.user.id)) {
        admin = true
      }
      if (!admin) {
        return res.redirect("/");
      };
      return renderTemplate(res, req, "add.ejs", {
        user: req.user,
        admin: admin
      })
    } else {
      return res.redirect("/verifiy-user/");
    }
  })

  app.post("/setting/add", (req, res) => {
    if (req.isAuthenticated()) {
      if (owners.includes(req.user.id)) {

        const prod_name = req.body.prod_name;
        const prise = req.body.prise;
        const photo_url = req.body.photo_url;
        DeadTool.AddToFile({ product_name: prod_name, product_prise: prise, product_img: photo_url }, "/home/runner/rova-Store/products.json")
        res.send("done")
      } else {
        return "";
      }
    }

  })
  app.get("/setting/delete", (req, res) => {
    if (req.isAuthenticated()) {
      let admin = false
      if (owners.includes(req.user.id)) {
        admin = true
      }
      if (!admin) {
        return res.redirect("/");
      };
      let args = {
        products: "",
      }
      products.map(a => {
        args.products += `
      <div class="card">
      <img src="${a.product_img}" alt="${a.product_name}" style="width:250px">
      <br>
      <br>
      <h3 class="product-name">${a.product_name}</h3>
      <p class="price">$${a.product_prise}</p>
      <br>
      <p><button class="button-85" name="product_name" value="${a.product_name}">Delete</button></p>
    </div>`
      })
      renderTemplate(res, req, "delete.ejs", {
        user: req.user,
        products: args.products,
      })
    } else {
      return res.redirect("/verifiy-user/");
    }
  })

  app.post("/setting/delete", async (req, res) => {
    if (req.isAuthenticated()) {
      if (owners.includes(req.user.id)) {
        DeadTool.DeleteFromData(req.body.product_name, "/home/runner/rova-Store/products.json")
        res.send("done")
      } else {
        return "";
      }
    }

  })

  //shoping
  app.get("/shop", (req, res) => {
    const num = req.params.number;
    if (req.isAuthenticated()) {
      let admin = false
      if (owners.includes(req.user.id)) {
        admin = true
      }
      /**
 * @type {Array}
 * posive value
 wow
 */

      let arr = [];

      for (let index = products.length - 1; index !== -1; index--) {

        arr.push(products[index])
      }
      let prods = ""
      arr.map(a => {
        prods += `
        <div class="container">
            <div class="card">
              <div class="imgBx">
                <img src="${a.product_img}">
              </div>
              <div class="contentBx">
                <h2>${a.product_name}</h2>
                <h2>$${a.product_prise}</h2>
                <button type="submit" class="button-85" value="${a.product_name} " name="buy">buy</button>
              </div>
            </div>
        </div>`
      })
      renderTemplate(res, req, "Shop.ejs", {
        products: prods,
        user: req.user,
        admin: admin,
      })
    } else {
      return res.redirect("/verifiy-user/");
    }
  })

  app.post("/shop", (req, res) => {
    console.log(req.body)
    if (req.isAuthenticated()) {
      /**
       * @param {String[]} buy
       * get name and prise
       */
      const buy = req.body.buy.split(" ")
      const ac = db.get(buy[0])
      let data = products
      var data_filter = data.filter(element => element.product_name == buy[0])
      if (!ac || !ac[0]) {
        res.send(`
        <body>
<script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script>
Swal.fire(
    "theren't any stock",
    "❌ | Soory But This Account Out Of Stock!",
    'error'
)
</script>
</body>
<script>
setTimeout(() => {
    document.location.assign(document.location.origin = "/")
}, 5000);</script>
`)
      } else {
        userscema.findOne({ id: req.user.id }, (err, data) => {
          if (data.email === "No email") {
            console.log(data.email);
            res.send(`<body>
                <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
                <script>
                Swal.fire(
                    "Please Add Account",
                    "❌ | Please add Email",
                    'error'
                )
                </script>
                </body>
                <script>
                setTimeout(() => {
                    document.location.assign(document.location.origin = "/")
                }, 3000);</script>`)
            return;
          }
          if (data) {
            console.log(data.email);
            if (+data.money < +data_filter[0].product_prise) {
              renderTemplate(res, req, "buy.ejs")
              return;
            } else {
              console.log(data.email);
              const account = db.get(buy[0])
              var num = Math.floor(Math.random() * account.length)
              const acc = account[num];
              // send({
              //   user: "rovastore.b@gmail.com",
              //   pass: "pgbyayuzufenxnez",
              //   to: data.email,
              //   subject: "_rova_store",
              //   text: `${acc}`
              // }, (error, result, fullResult) => {
              //   if (error) console.error(error);
              //   console.log(result);
              //   sendMessage(`${req.user.id} buy ${buy[0]} `)
              //   console.log(`${req.user.username} buy ${buy[0]} `)
              //   client.channels.cache.get(logch).send(`${req.user.id} buy ${buy[0]} `)
              // })
              let d = {
                form: "rovastore.b@gmail.com",
                to: data.email,
                subject: "_rova_store",
                text: `${acc}`
              }

              mail.sendMail(d, (err) => {
                if (err) {
                  console.log(err);
                } else {
                  sendMessage(`${req.user.id} buy ${buy[0]} `)
                  console.log(`${req.user.username} buy ${buy[0]} `)


                  client.channels.cache.get(logch).send(`${req.user.id}buy ${buy[0]}`)
                }
              });

              const filtered = account.filter(
                accs => accs !== acc
              );
              db.join(buy[0]).removeElm(num).leave().save()
              data.money -= parseInt(data_filter[0].product_prise)
              data.save()
            }
          } else {
            res.send(`<body>
                <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
                <script>
                Swal.fire(
                    "theren't any data",
                    "❌ | not there database",
                    'error'
                )
                </script>
                </body>
                <script>
                setTimeout(() => {
                    document.location.assign(document.location.origin = "/")
                }, 3000);</script>`)
            return;
          }
          res.send(`<body>
            <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
            <script>
            Swal.fire(
                'Done',
                "account has been sent",
                'success'
            )
            </script>
            </body>
            <script>
            setTimeout(() => {
                document.location.assign(document.location.origin = "/")
            }, 2000);</script>`)
        })
      }
    } else {
      return res.redirect("/verifiy-user");
    }
  })
  // sdd stock

  app.get("/setting/stock-add", (req, res) => {
    if (req.isAuthenticated()) {
      let admin = false
      if (owners.includes(req.user.id)) {
        admin = true
      }
      if (!admin) {
        return res.redirect("/");
      };
      renderTemplate(res, req, "stock-add.ejs", {
        user: req.user,
        admin: admin,
      })
    } else {
      return res.redirect("/verifiy-user/");
    }
  })
  app.post("/setting/stock-add", (req, res) => {
    if (req.isAuthenticated()) {
      if (!owners.includes(req.user.id)) return;
      const prod_name = req.body.prod_name
      const stock = req.body.stock
      let num = 0;
      stock.split("\r\n").map(a => {
        const acc = `${a}`

        if (db.exists(prod_name)) {
          db.join(prod_name).createElm(acc).leave().save()
        } else {
          db.create(prod_name, []).leave().save()
        }

        num++
      })
      res.send(`<body>
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
    Swal.fire(
        "Done",
        "DONE add ${num} acc",
        "success"
    )
    </script>
    </body>
    <script>
    setTimeout(() => {
        document.location.assign(document.location.origin = "/")
    }, 3000);</script>`)

    }
  })
  // email for member hasent is 
  app.get("/email-add", (req, res) => {
    if (req.isAuthenticated()) {
      let admin = false
      if (owners.includes(req.user.id)) {
        admin = true
      }
      renderTemplate(res, req, "email.ejs", {
        admin: admin,
      })
    } else {
      return res.redirect("/verifiy-user/");
    }
  })
  const crypto = require("crypto");
  app.post("/email-add", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user.id;
      let cyrpto_code = crypto.randomBytes(12).toString("hex")
      var vild_code = `${config.domain}/verify/${user}/${cyrpto_code}`;
      const email = req.body.email;
      if (!email.includes("@gmail.com")) {
        return;
      }
      userscema.findOne({ id: user }, (err, data) => {
        if (data) {
          data.emailtoken = cyrpto_code;
          data.email = email;
          data.save()
        } else {
          new userscema({
            email: email,
            verified: false,
            money: 0,
            userid: user,
            emailtoken: cyrpto_code,
          }).save()
        }
      })

      // send({
      //   user: "rovastore.b@gmail.com",
      //   pass: "pgbyayuzufenxnez",
      //   to: email,
      //   subject: "Verify_Email",
      //   html: `<!DOCTYPE html>
      //   <html>

      //   <head>
      //       <title></title>
      //       <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      //       <meta name="viewport" content="width=device-width, initial-scale=1">
      //       <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      //       <style type="text/css">
      //           @media screen {
      //               @font-face {
      //                   font-family: 'Lato';
      //                   font-style: normal;
      //                   font-weight: 400;
      //                   src: local('Lato Regular'), local('Lato-Regular'), url(https://fonts.gstatic.com/s/lato/v11/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff) format('woff');
      //               }

      //               @font-face {
      //                   font-family: 'Lato';
      //                   font-style: normal;
      //                   font-weight: 700;
      //                   src: local('Lato Bold'), local('Lato-Bold'), url(https://fonts.gstatic.com/s/lato/v11/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff) format('woff');
      //               }

      //               @font-face {
      //                   font-family: 'Lato';
      //                   font-style: italic;
      //                   font-weight: 400;
      //                   src: local('Lato Italic'), local('Lato-Italic'), url(https://fonts.gstatic.com/s/lato/v11/RYyZNoeFgb0l7W3Vu1aSWOvvDin1pK8aKteLpeZ5c0A.woff) format('woff');
      //               }

      //               @font-face {
      //                   font-family: 'Lato';
      //                   font-style: italic;
      //                   font-weight: 700;
      //                   src: local('Lato Bold Italic'), local('Lato-BoldItalic'), url(https://fonts.gstatic.com/s/lato/v11/HkF_qI1x_noxlxhrhMQYELO3LdcAZYWl9Si6vvxL-qU.woff) format('woff');
      //               }
      //           }

      //           /* CLIENT-SPECIFIC STYLES */
      //           body,
      //           table,
      //           td,
      //           a {
      //               -webkit-text-size-adjust: 100%;
      //               -ms-text-size-adjust: 100%;
      //           }

      //           table,
      //           td {
      //               mso-table-lspace: 0pt;
      //               mso-table-rspace: 0pt;
      //           }

      //           img {
      //               -ms-interpolation-mode: bicubic;
      //           }

      //           /* RESET STYLES */
      //           img {
      //               border: 0;
      //               height: auto;
      //               line-height: 100%;
      //               outline: none;
      //               text-decoration: none;
      //           }

      //           table {
      //               border-collapse: collapse !important;
      //           }

      //           body {
      //               height: 100% !important;
      //               margin: 0 !important;
      //               padding: 0 !important;
      //               width: 100% !important;
      //           }

      //           /* iOS BLUE LINKS */
      //           a[x-apple-data-detectors] {
      //               color: inherit !important;
      //               text-decoration: none !important;
      //               font-size: inherit !important;
      //               font-family: inherit !important;
      //               font-weight: inherit !important;
      //               line-height: inherit !important;
      //           }

      //           /* MOBILE STYLES */
      //           @media screen and (max-width:600px) {
      //               h1 {
      //                   font-size: 32px !important;
      //                   line-height: 32px !important;
      //               }
      //           }

      //           /* ANDROID CENTER FIX */
      //           div[style*="margin: 16px 0;"] {
      //               margin: 0 !important;
      //           }
      //       </style>
      //   </head>

      //   <body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">
      //       <!-- HIDDEN PREHEADER TEXT -->
      //       <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Lato', Helvetica, Aroval, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;"> We're thrilled to have you here! Get ready to dive into your new account.
      //       </div>
      //       <table border="0" cellpadding="0" cellspacing="0" width="100%">
      //           <!-- LOGO -->
      //           <tr>
      //               <td bgcolor="#FFA73B" align="center">
      //                   <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
      //                       <tr>
      //                           <td align="center" valign="top" style="padding: 40px 10px 40px 10px;"> </td>
      //                       </tr>
      //                   </table>
      //               </td>
      //           </tr>
      //           <tr>
      //               <td bgcolor="#00ff84" align="center" style="padding: 0px 10px 0px 10px;">
      //                   <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
      //                       <tr>
      //                           <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Lato', Helvetica, Aroval, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
      //                               <h1 style="font-size: 48px; font-weight: 400; margin: 2;">Welcome!</h1> <img src=" https://img.icons8.com/clouds/100/000000/handshake.png" width="125" height="120" style="display: block; border: 0px;" />
      //                           </td>
      //                       </tr>
      //                   </table>
      //               </td>
      //           </tr>
      //           <tr>
      //               <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
      //                   <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
      //                       <tr>
      //                           <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Aroval, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
      //                               <p style="margin: 0;">We're excited to have you get started. First, you need to confirm your account. Just press the button below.</p>
      //                           </td>
      //                       </tr>
      //                       <tr>
      //                           <td bgcolor="#ffffff" align="left">
      //                               <table width="100%" border="0" cellspacing="0" cellpadding="0">
      //                                   <tr>
      //                                       <td bgcolor="#ffffff" align="center" style="padding: 20px 30px 60px 30px;">
      //                                           <table border="0" cellspacing="0" cellpadding="0">
      //                                               <tr>
      //                                                   <td align="center" style="border-radius: 3px;" bgcolor="#00ff84"><a href="${vild_code}" target="_blank" style="font-size: 20px; font-family: Helvetica, Aroval, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #00ff84; display: inline-block;">Confirm Account</a></td>
      //                                               </tr>
      //                                           </table>
      //                                       </td>
      //                                   </tr>
      //                               </table>
      //                           </td>
      //                       </tr> <!-- COPY -->
      //                       <tr>
      //                           <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 0px 30px; color: #666666; font-family: 'Lato', Helvetica, Aroval, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
      //                               <p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
      //                           </td>
      //                       </tr> <!-- COPY -->
      //                       <tr>
      //                           <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Aroval, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
      //                               <p style="margin: 0;"><a href="#" target="_blank" style="color: #FFA73B;">${vild_code}</a></p>
      //                           </td>
      //                       </tr>
      //                       <tr>
      //                           <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Aroval, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
      //                               <p style="margin: 0;">If you have any questions, just reply to this email&mdash;we're always happy to help out.</p>
      //                           </td>
      //                       </tr>
      //                       <tr>
      //                           <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 40px 30px; border-radius: 0px 0px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Aroval, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
      //                               <p style="margin: 0;">rova store,<br>rova Team</p>
      //                           </td>
      //                       </tr>
      //                   </table>
      //               </td>
      //           </tr>
      //           <tr>
      //               <td bgcolor="#f4f4f4" align="center" style="padding: 30px 10px 0px 10px;">
      //                   <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
      //                       <tr>
      //                           <td bgcolor="#FFECD1" align="center" style="padding: 30px 30px 30px 30px; border-radius: 4px 4px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Aroval, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
      //                               <h2 style="font-size: 20px; font-weight: 400; color: #111111; margin: 0;">Need more help?</h2>
      //                               <p style="margin: 0;"><a href="#" target="_blank" style="color: #00ff84;">We&rsquo;re here to help you out</a></p>
      //                           </td>
      //                       </tr>
      //                   </table>
      //               </td>
      //           </tr>
      //           <tr>
      //               <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
      //                   <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
      //                       <tr>
      //                           <td bgcolor="#f4f4f4" align="left" style="padding: 0px 30px 30px 30px; color: #666666; font-family: 'Lato', Helvetica, Aroval, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;"> <br>
      //                           </td>
      //                       </tr>
      //                   </table>
      //               </td>
      //           </tr>
      //       </table>
      //   </body>

      //   </html>`,
      // }, (error, result, fullResult) => {
      //   if (error) console.error(error);
      //   console.log(result);
      // })

      let d1 = {
        from: "rovastore.b@gmail.com",
        to: email,
        subject: "Verify_Email",
        html: `<!DOCTYPE html>
        <html>
        
        <head>
            <title></title>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <style type="text/css">
                @media screen {
                    @font-face {
                        font-family: 'Lato';
                        font-style: normal;
                        font-weight: 400;
                        src: local('Lato Regular'), local('Lato-Regular'), url(https://fonts.gstatic.com/s/lato/v11/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff) format('woff');
                    }
        
                    @font-face {
                        font-family: 'Lato';
                        font-style: normal;
                        font-weight: 700;
                        src: local('Lato Bold'), local('Lato-Bold'), url(https://fonts.gstatic.com/s/lato/v11/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff) format('woff');
                    }
        
                    @font-face {
                        font-family: 'Lato';
                        font-style: italic;
                        font-weight: 400;
                        src: local('Lato Italic'), local('Lato-Italic'), url(https://fonts.gstatic.com/s/lato/v11/RYyZNoeFgb0l7W3Vu1aSWOvvDin1pK8aKteLpeZ5c0A.woff) format('woff');
                    }
        
                    @font-face {
                        font-family: 'Lato';
                        font-style: italic;
                        font-weight: 700;
                        src: local('Lato Bold Italic'), local('Lato-BoldItalic'), url(https://fonts.gstatic.com/s/lato/v11/HkF_qI1x_noxlxhrhMQYELO3LdcAZYWl9Si6vvxL-qU.woff) format('woff');
                    }
                }
        
                /* CLIENT-SPECIFIC STYLES */
                body,
                table,
                td,
                a {
                    -webkit-text-size-adjust: 100%;
                    -ms-text-size-adjust: 100%;
                }
        
                table,
                td {
                    mso-table-lspace: 0pt;
                    mso-table-rspace: 0pt;
                }
        
                img {
                    -ms-interpolation-mode: bicubic;
                }
        
                /* RESET STYLES */
                img {
                    border: 0;
                    height: auto;
                    line-height: 100%;
                    outline: none;
                    text-decoration: none;
                }
        
                table {
                    border-collapse: collapse !important;
                }
        
                body {
                    height: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                }
        
                /* iOS BLUE LINKS */
                a[x-apple-data-detectors] {
                    color: inherit !important;
                    text-decoration: none !important;
                    font-size: inherit !important;
                    font-family: inherit !important;
                    font-weight: inherit !important;
                    line-height: inherit !important;
                }
        
                /* MOBILE STYLES */
                @media screen and (max-width:600px) {
                    h1 {
                        font-size: 32px !important;
                        line-height: 32px !important;
                    }
                }
        
                /* ANDROID CENTER FIX */
                div[style*="margin: 16px 0;"] {
                    margin: 0 !important;
                }
            </style>
        </head>
        
        <body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">
            <!-- HIDDEN PREHEADER TEXT -->
            <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Lato', Helvetica, Aroval, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;"> We're thrilled to have you here! Get ready to dive into your new account.
            </div>
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <!-- LOGO -->
                <tr>
                    <td bgcolor="#00ff84" align="center">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td align="center" valign="top" style="padding: 40px 10px 40px 10px;"> </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#00ff84" align="center" style="padding: 0px 10px 0px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Lato', Helvetica, Aroval, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
                                    <h1 style="font-size: 48px; font-weight: 400; margin: 2;">Welcome in rova !</h1> <img src=" https://blogger.googleusercontent.com/img/a/AVvXsEhY0Hemh1h7zM60xjopewkQnFviBXxkK9k3TO3Ev-FSwdrE_HIIiQYv4F9_TA9Hl6jcI3W6_2e3fS20phJ9HuUdQT03ZcJld6dlF4-UxThpLl4AA8nAxO8KxB-gNJ3djEwlWcdkKBfsnUey7vnVb_Czt_2R3fXmFMrKX1xqsR1b2p9HueG35xeqK8q-=s1600" width="125" height="120" style="display: block; border: 0px;" />
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Aroval, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                    <p style="margin: 0;">You can now activate your account on the rova website in order to access the products to your account.</p>
                                </td>
                            </tr>
                            <tr>
                                <td bgcolor="#ffffff" align="left">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td bgcolor="#ffffff" align="center" style="padding: 20px 30px 60px 30px;">
                                                <table border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <td align="center" style="border-radius: 3px;" bgcolor="#000000"><a href="${vild_code}" target="_blank" style="font-size: 20px; font-family: Helvetica, Aroval, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #00ec7a; display: inline-block;">Activate The Account</a></td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr> <!-- COPY -->
                            <tr>
                                <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 0px 30px; color: #666666; font-family: 'Lato', Helvetica, Aroval, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                    <p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
                                </td>
                            </tr> <!-- COPY -->
                            <tr>
                                <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Aroval, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                    <p style="margin: 0;"><a href="#" target="_blank" style="color: #00ef7b;">${vild_code}</a></p>
                                </td>
                            </tr>
                            <tr>
                                <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 20px 30px; color: #666666; font-family: 'Lato', Helvetica, Aroval, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                    <p style="margin: 0;">If you have any questions, just reply to this email&mdash;we're always happy to help out.</p>
                                </td>
                            </tr>
                            <tr>
                                <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 40px 30px; border-radius: 0px 0px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Aroval, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                    <p style="margin: 0;">rova Store,<br>rova Team</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#f4f4f4" align="center" style="padding: 30px 10px 0px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td bgcolor="#9dffd4" align="center" style="padding: 30px 30px 30px 30px; border-radius: 4px 4px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Aroval, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                    <h2 style="font-size: 20px; font-weight: 400; color: #111111; margin: 0;">Need more help?</h2>
                                    <p style="margin: 0;"><a href="#" target="_blank" style="color: #000000;">We&rsquo;re here to help you out</a></p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                            <tr>
                                <td bgcolor="#f4f4f4" align="left" style="padding: 0px 30px 30px 30px; color: #666666; font-family: 'Lato', Helvetica, Aroval, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;"> <br>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        
        </html>`,
      };

      mail.sendMail(d1, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Send !!")
        }
      });


      res.send(`<body>
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
    Swal.fire(
        'Good job!',
        "Done",
        'success'
    )
    </script>
    </body>
    <script>
    setTimeout(() => {
        document.location.assign(document.location.origin = "/")
    }, 2000);</script>`)
    } else {
      return res.redirect("/verifiy-user/");
    }
  })


  app.get(`/verify/:user/:em`, (req, res) => {
    const user = req.params.user;
    const emailtoken = req.params.em;
    userscema.findOne({ userid: user }, (error, userdb) => {
      if (!userdb) {
        res.send(`
      <body>
<script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script>
Swal.fire(
'Invild userId!',
"not there database",
'error'
)
</script>
</body>
<script>
setTimeout(() => {
document.location.assign(document.location.origin = "/")
}, 2000);</script>`)
        return;
      }
      if (userdb.verified === true) {
        res.send(`
    <body>
<script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script>
Swal.fire(
'Verified!',
"You really have been verified",
'error'
)
</script>
</body>
<script>
setTimeout(() => {
document.location.assign(document.location.origin = "/")
}, 2000);</script>`)
        return;
      }
      if (userdb.emailtoken !== emailtoken) {
        res.send(`
  <body>
<script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script>
Swal.fire(
'Invild Token!',
"Token Is Invild",
'error'
)
</script>
</body>
<script>
setTimeout(() => {
document.location.assign(document.location.origin = "/")
}, 2000);</script>`)
        return;
      }
      userdb.verified = true
      userdb.save()
      res.send(`<body>
                    <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
                    <script>
                    Swal.fire(
                        'Done',
                        "You are Verified!",
                        'success'
                    )
                    </script>
                    </body>
                    <script>
                    setTimeout(() => {
                        document.location.assign(document.location.origin = "/")
                    }, 2000);</script>`)

    })
  })


  app.get(`/invite/:id`, checkAuth, async (req, res) => {
    // set main vareble
    let username = "";
    let id = req.params.id;
    // for no glitch
    if (!id) return res.redirect("/");
    // render website
    renderTemplate(res, req, `invite.ejs`, {
      username: client.users.cache.find(user => user.id === `${req.params.id}`),
      user: req.user,
      id: id
    })
  })
  app.post(`/invite`, checkAuth, async (req, res) => {
    //make varebles to make easy
    let userData = await client.Database.fetchUser(req.user.id);
    // for no spam invite your self

    if (req.user.id === req.body.id) return;

    // check if is invited
    if (userData.invited === true) {
      res.send(`<body>
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
    Swal.fire(
    'You are areled has been invited!',
    "Invild invite",
    'error'
    )
    </script>
    </body>
    <script>
    setTimeout(() => {
    document.location.assign(document.location.origin = "/")
    }, 2000);</script>`)
      return;
    } else {
      // inviter
      let user = userscema.findOne({ id: req.body.id }, (error, userdb) => {

        userdb.invites += 1;
        userdb.money += 0.1
        userdb.invites_people += new Object({
          "username": req.user.username,
          "id": req.user.id,
          "joinat": Date.now().toString(),
        })

        userdb.save()
      })

      // invited

      let user_two = userscema.findOne({ id: req.user.id }, (error, userdb) => {
        userdb.invited = true;
        userdb.save()
      })

      // respond
      res.send(`<body>
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
    Swal.fire(
        'Done',
        "You are Verified!",
        'success'
    )
    </script>
    </body>
    <script>
    setTimeout(() => {
        document.location.assign(document.location.origin = "/")
    }, 2000);</script>`)
    }
  })
  app.get("/premium", checkAuth, (req, res) => {
    let admin = false
    if (owners.includes(req.user.id)) {
      admin = true
    }
    if (!admin) {
      return res.redirect("/");
    };
    renderTemplate(res, req, `pay.ejs`, {
      user: req.user,
      admin: admin,
    })
  })
  app.post("/premium", checkAuth, (req, res) => {
    let value = req.body.name;
    console.log(value)
    res.send(`
  <script src="https://www.paypal.com/sdk/js?client-id=AeGOCpSSKKwWMBVvXZCHQ4daHFTRaJsD-lHYoSktpH8JDUN02HXTknz5hfm9TvyzMscpI0-MCpK7IEF3"></script>
  <div class="fs">
    <div><h2 class="dsdf">Buy</h2>
      <?xml version="1.0" standalone="no"?>
      <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 20010904//EN"
       "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">
       <div class="svgsd" onclick="goBack()">
        <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
       width="45px" height="45px" viewBox="0 0 512.000000 512.000000"
       preserveAspectRatio="xMidYMid meet" style="cursor: pointer;">
      
      <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
      fill="#fff" stroke="none">
      <path d="M2330 5110 c-494 -48 -950 -230 -1350 -538 -195 -150 -448 -432 -594
      -662 -63 -99 -186 -351 -230 -471 -49 -134 -102 -340 -128 -499 -31 -195 -31
      -565 0 -760 45 -276 116 -498 237 -745 132 -269 269 -460 489 -681 221 -220
      412 -357 681 -489 247 -121 469 -192 745 -237 195 -31 565 -31 760 0 276 45
      498 116 745 237 269 132 460 269 681 489 220 221 357 412 489 681 88 179 132
      296 180 476 63 240 78 371 78 649 0 278 -15 409 -78 649 -48 180 -92 297 -180
      476 -132 269 -269 460 -489 681 -221 220 -412 357 -681 489 -246 121 -474 193
      -740 235 -147 23 -475 34 -615 20z m550 -226 c339 -49 662 -168 950 -352 253
      -161 541 -449 702 -702 144 -226 262 -507 317 -757 41 -185 53 -302 53 -513 0
      -275 -29 -467 -108 -713 -120 -371 -300 -663 -579 -942 -279 -279 -571 -459
      -942 -579 -246 -79 -438 -108 -713 -108 -275 0 -467 29 -713 108 -371 120
      -663 300 -942 579 -374 373 -589 803 -670 1340 -23 151 -23 479 0 630 54 355
      169 667 353 955 161 253 449 541 702 702 475 303 1045 429 1590 352z"/>
      <path d="M1574 3623 c-30 -6 -72 -53 -75 -83 -6 -67 -8 -65 453 -527 l452
      -453 -452 -453 c-461 -462 -459 -459 -453 -527 3 -32 49 -78 81 -81 68 -6 65
      -8 527 453 l453 452 453 -452 c462 -461 459 -459 527 -453 32 3 78 49 81 81 6
      68 8 65 -453 527 l-452 453 452 453 c461 462 459 459 453 527 -3 32 -49 78
      -81 81 -68 6 -65 8 -527 -453 l-453 -452 -453 452 c-249 248 -460 452 -469
      452 -9 0 -22 2 -30 4 -7 2 -23 1 -34 -1z"/>
      </g>
      </svg>
       </div>
      </div>
    <div class="line"></div>
    <div id="paypal"></div>
  </div>
  <style>
    .fs {
      margin: 150px 0 150px;
background: black;
border-radius: 15px;
    }
    .dsdf {
/* margin-right: 50%; */
color: wheat;
margin: auto;
width: 50%;
margin-left: 45%;
}
    .svgsd {
      float: right;
      margin-top: -23px;
margin-right: 16px;
    }
    .line {
      margin-top: 29px;
      border: 1px solid wheat;
      display: block;
    }
    #paypal {
      margin: auto;
width: 50%;
padding-top: 30px;
    }
    @media only screen and (max-width: 768px) {
/* For mobile phones: */
[class*="fs"] {
width: 100%;
}
}
  </style>
  <script>
  paypal
  .Buttons({
    createOrder: function () {
      return fetch("/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: ${value},
              quantity: 1,
            },
          ],
        }),
      })
        .then(res => {
          if (res.ok) return res.json()
          return res.json().then(json => Promise.reject(json))
        })
        .then(({ id }) => {
          return id
        })
        .catch(e => {
          console.error(e.error)
        })
    },
    onApprove: function (data, actions) {
      return fetch("/done-orderd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "price": ${value}
        }),
      })
        .then(res => {
          if (res.ok) return res.json()
          return res.json().then(json => Promise.reject(json))
        })
        .then(({ id }) => {
          return id
        })
        .catch(e => {
          console.error(e.error)
        })
    },
      style: {
          color:  'blue',
          shape:  'pill',
          label:  'pay',
          height: 40
      }
  })
  .render("#paypal")
  function goBack() {
    document.location.assign(document.location.origin = "/")
  }
</script>`)
  })
  app.get("/invite", checkAuth, (req, res) => {
    renderTemplate(res, req, `invites.ejs`, {
      user: req.user,
      admin: admin,
    })
  })
  let pap = {
    PAYPAL_CLIENT_ID: "AeGOCpSSKKwWMBVvXZCHQ4daHFTRaJsD-lHYoSktpH8JDUN02HXTknz5hfm9TvyzMscpI0-MCpK7IEF3",
    PAYPAL_CLIENT_SECRET: "EADyyH9iXJr0pQrx72B0OTTtMOtrMbqWsfHH16PvOKsOw80PLMSqt8UwZ-h6qjaw9vZQb5ciA_Qjbowa"
  }
  const paypal = require("@paypal/checkout-server-sdk")
  const Environment =
    process.env.NODE_ENV === "production"
      ? paypal.core.LiveEnvironment
      : paypal.core.SandboxEnvironment
  const paypalClient = new paypal.core.PayPalHttpClient(
    new Environment(
      pap.PAYPAL_CLIENT_ID,
      pap.PAYPAL_CLIENT_SECRET
    )
  )
  const storeItems = new Map([
    [3, { price: 3, name: "BASIC", rid: "1109470186421092443" }],
    [5, { price: 5, name: "STANDARD", rid: "1109469918648340521" }],
    [9, { price: 9, name: "PREMIUM", rid: "1109468937831321642" }],
  ])
  app.post("/create-order", async (req, res) => {
    const request = new paypal.orders.OrdersCreateRequest()
    const total = req.body.items.reduce((sum, item) => {
      return sum + storeItems.get(item.id).price
    }, 0)
    request.prefer("return=representation")
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: total,
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: total,
              },
            },
          },
          items: req.body.items.map(item => {
            const storeItem = storeItems.get(item.id)
            return {
              name: storeItem.name,
              unit_amount: {
                currency_code: "USD",
                value: storeItem.price,
              },
              quantity: 1,
            }
          }),
        },
      ],
    })

    try {
      const order = await paypalClient.execute(request)
      res.json({ id: order.result.id })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })




  app.post("/done-orderd", checkAuth, (req, res) => {
    let role = null
    var guild = client.guilds.cache.get("956718425491800114")
    var member = guild.members.cache.get(req.user.id)
    var price = req.body.price;
    if (price === 3) {
      role = guild.roles.cache.find(role => role.id === "1035873466668294144")
    }
    else if (price === 5) {
      role = guild.roles.cache.find(role => role.id === "1035873638198546482")
    }
    else if (price === 9) {
      role = guild.roles.cache.find(role => role.id === "1035877069051138129")
    }
    if (!role) return;
    member.roles.add(role)
  })
  app.post("/setting/delete-stock", checkAuth, (req, res) => {
    let name = req.body.name;
    db.change(name, []).save()
    res.send("done")
  })
  app.get("/setting/delete-stock", checkAuth, (req, res) => {
    renderTemplate(res, req, "del-stock.ejs", {

    })
  })
  app.get("/top", checkAuth, async (req, res) => {
    const user_id = req.user.id;

    userscema.findOne({ id: user_id }, (err, data) => {

      renderTemplate(res, req, "top.ejs", {
        data: data,
        user: req.user,
        top: db.get("top"),
      });
    });
  });
  // cash-in
  const multer = require('multer')
  const upload = multer({ dest: 'dashboard/assets/' })
  app.get("/cash-in", checkAuth, async (req, res) => {
    renderTemplate(res, req, "Vodaohone.ejs", {
      user: req.user,
    });
  });
  app.post("/cash-in", checkAuth, upload.single('proof'), async (req, res) => {
    const img = req.file;
    fs.rename(img.path, 'dashboard/assets/' + img.originalname, (err) => {
      console.log(err)
    })
    const price = req.body.price;
    const user_id = req.body.phone;
    console.log(img, req.body)
    send({
      //rovastore.b@gmail.com
      to: "rovastore.b@gmail.com",
      subject: "bought rova",
      html: `
        <div style="
    align-items: center;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    background: black;
">
        <div class="heat" style="
    font-size: xxx-large;
    color: white;
    margin: auto;
    padding: 10px;
">new buy</div>
        <div style="display: flex;flex-direction: column;">
    <div style="
    font-size: xx-large;
    color: white;
    margin-bottom: 3rem;
    border: 2px solid;
">
    <div style="
    border-bottom: 2px solid;
">userID: ${req.user.id}</div>
    <div style="
    border-bottom: 2px solid;
">UserName: ${req.user.username}</div>
    <div style="
    border-bottom: 2px solid;
">price: ${price}</div>
    <div style="
    border-bottom: 2px solid;
">Phone Num: ${user_id}</div>
    
</div>
            <img src="https://rovastore.ml/${img.originalname}" style="border-radius:15px;/* height: 15px; */width: 50%;height: 50%;">
        </div>
    </div>
        `
    })
    res.send(`<body>
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
    Swal.fire(
        'Done',
        "done send to readh",
        'success'
    )
    </script>
    </body>
    <script>
    setTimeout(() => {
        document.location.assign(document.location.origin = "/")
    }, 2000);</script>
    `);

  });

  const Shops = require('../Database/Schema/Shop.js');
  const Products = require('../Database/Schema/Products.js');
  const Accept = require('../Database/Schema/Accept.js');
  const Follow = require('../Database/Schema/Follow.js');
  const OrderShop = require('../Database/Schema/OrderShop.js');

  app.get('/shops', async (req, res) => {
    if (req.isAuthenticated()) {
      admin = false;

      if (owners.includes(req.user.id)) {
        admin = true;
      }

      let shop = await Shops.findOne({ id: req.user.id });
      let shops = await Shops.find();
      let products = await Products.find({ isShow: true, });
      let order = await OrderShop.find({ userID: req.user.id });


      if (shop === null) {
        renderTemplate(res, req, "myshop.ejs", {
          user: req.user,
          admin: admin,
          shop: null,
          shops: shops,
          order: order,
          products: products,
        });
      } else {
        renderTemplate(res, req, "myshop.ejs", {
          user: req.user,
          admin: admin,
          shop: shop,
          shops: shops,
          order: order,
          products: products,
        });
      }


    } else {
      res.redirect('/verifiy-user');
    }
  });

  app.post('/shops', async (req, res) => {
    if (req.isAuthenticated()) {
      if (req.body.buy === "buying") {
        let eID = req.body.eID;
        let sellerID = req.body.sID;
        let buyerID = req.user.id;
        let product = await Products.findOne({ _id: eID, });
        let productEmail = product.productEmail;
        let productPrice = parseInt(product.price);

        let buyer = await client.Database.fetchUser(buyerID);
        let seller = await client.Database.fetchUser(sellerID);


        if (parseInt(buyer.money) >= productPrice) {
          if (buyer.email === "No email") {
            res.send(`<body>
                      <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
                      <script>
                      Swal.fire(
                          'Error',
                          "Please Put an Email And Verify It Then Come Back !!",
                          'error'
                      )
                      </script>
                      </body>
                      <script>
                      setTimeout(() => {
                          document.location.assign(document.location.origin = "/")
                      }, 2000);</script>
            `);
          } else {
            // sucsses userData2.save();  userData.save();

            seller.money += productPrice;
            buyer.money -= productPrice;

            seller.save();
            buyer.save();


            let detiles = {
              from: "rovastore.b@gmail.com",
              to: buyer.email,
              subject: "Product Form rova Shop !!!",
              text: `here you are your product : ${productEmail}`,
            }

            mail.sendMail(detiles, (err) => {
              if (err) {
                console.log(err);
              } else {
                console.log("Send Product From New Shop...")
              }
            });


            await Products.deleteOne({ _id: eID });

            res.send(`<body>
                      <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
                      <script>
                      Swal.fire(
                        'Successfuly Bought',
                        "We sent this Product To Your Email",
                        'success'
                      )
                      </script>
                      </body>
                      <script>
                      setTimeout(() => {
                          document.location.assign(document.location.origin = "/shops")
                      }, 2000);</script>
            `);
          }
        } else {
          res.send(`<body>
                      <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
                      <script>
                      Swal.fire(
                          'Error',
                          "You Don't Have Enough Money !!",
                          'error'
                      )
                      </script>
                      </body>
                      <script>
                      setTimeout(() => {
                          document.location.assign(document.location.origin = "/shops")
                      }, 2000);</script>
            `);
        }

      } else {
        let buyerID = req.user.id;
        let buyer = await client.Database.fetchUser(buyerID);

        if (buyer.money >= 3) {
          buyer.money -= 3
          buyer.save();

          OrderShop.create({
            userID: req.user.id
          });

          res.send(`<body>
                      <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
                      <script>
                      Swal.fire(
                        'Successfuly Bought',
                        "congratulation You Have Bought Shop",
                        'success'
                      )
                      </script>
                      </body>
                      <script>
                      setTimeout(() => {
                          document.location.assign(document.location.origin = "/shops")
                      }, 2000);</script>
            `);

        } else {
          res.send(`<body>
                      <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
                      <script>
                      Swal.fire(
                          'Error',
                          "You Don't Have Enough Money !!",
                          'error'
                      )
                      </script>
                      </body>
                      <script>
                      setTimeout(() => {
                          document.location.assign(document.location.origin = "/shops")
                      }, 2000);</script>
            `);
        }

      }
    }
  });

  app.get('/shops/create', async (req, res) => {
    if (req.isAuthenticated()) {
      let order = await OrderShop.findOne({ userID: req.user.id });
      if (order !== null) {
        if (order.length <= 0) {
          res.redirect('/shops')
        } else {
          Shops.find({ id: req.user.id }, (err, data) => {
            if (data.length > 0) {
              res.redirect('/shops')
            } else {
              admin = false;

              if (owners.includes(req.user.id)) {
                admin = true;
              }

              renderTemplate(res, req, "createShop.ejs", {
                user: req.user,
                admin: admin,
              });
            }
          });
        }
      } else {
        res.redirect('/shops');
      }

    } else {
      res.redirect('/verifiy-user');
    }
  });

  app.post('/shops/create', async (req, res) => {
    if (!req.isAuthenticated()) {
      res.redirect('/')
    } else {
      let order = await OrderShop.findOne({ userID: req.user.id });
      if (order !== null) {
        if (order.length <= 0) {
          res.redirect('/shops');
        } else {
          let shopName = req.body.name;
          let shopDesc = req.body.desc;
          let shopEmail = req.body.email;
          let shopLogo = req.body.logo;
          let shopBanner = req.body.banner;

          Shops.findOne({ name: shopName }, async function(err, data) {
            if (data == null) {
              await Shops.create({
                id: req.user.id,
                creatorID: req.user.id,
                creatorEmail: shopEmail,
                followers: 0,
                name: shopName,
                desc: shopDesc,
                logo: shopLogo,
                banner: shopBanner,
              });

              res.redirect('/shops');
            } else {
              console.log('Shop Already Exsits !!!');
            }
          });
        }

      } else {
        res.redirect('/shops');
      }
    }

  });

  app.get('/shops/all', (req, res) => {
    if (req.isAuthenticated()) {

      admin = false;

      if (owners.includes(req.user.id)) {
        admin = true;
      }

      Shops.find(function(err, data) {
        renderTemplate(res, req, "allShops.ejs", {
          user: req.user,
          admin: admin,
          shops: data,
        });
      });


    } else {
      res.redirect('/verifiy-user')
    }
  });

  app.post('/shops/all', (req, res) => {
    admin = false;

    if (owners.includes(req.user.id)) {
      admin = true;
    }

    Shops.find({ name: { $regex: req.body.search } }, function(err, data) {
      renderTemplate(res, req, "allShops.ejs", {
        user: req.user,
        admin: admin,
        shops: data,
      });
    })
  });

  app.get('/shops/all/:name', async (req, res) => {
    if (req.isAuthenticated()) {
      admin = false;

      if (owners.includes(req.user.id)) {
        admin = true;
      }

      // Shops.find({ name: req.params.name }, function (err, data1) {
      //   Products.find({ ShopID: data1[0].id }, (err, data2) => {
      //     Follow.find({ userID: req.user.id, shopID: data1[0].id }, (err, data3) => {
      //       if (data3.length <= 0) {
      //         renderTemplate(res, req, "oneShop.ejs", {
      //           user: req.user,
      //           admin: admin,
      //           shop: data1[0],
      //           products: data2,
      //           isFollowed: null,
      //         });
      //       } else {
      //         renderTemplate(res, req, "oneShop.ejs", {
      //           user: req.user,
      //           admin: admin,
      //           shop: data1[0],
      //           products: data2,
      //           isFollowed: data3,
      //         });
      //       }
      //     });
      //   });
      // });

      let shop = await Shops.find({ name: req.params.name });
      if (shop.length == 0) {
        res.redirect('/shops')
      } else {
        let products = await Products.find({ ShopID: shop[0].id });
        let follow = await Follow.find({ userID: req.user.id, shopID: shop[0].id });

        if (shop.length !== 0) {
          if (follow.length === 0) {
            renderTemplate(res, req, "oneShop.ejs", {
              user: req.user,
              admin: admin,
              shop: shop[0],
              products: products,
              isFollowed: null,
            });
          } else {
            renderTemplate(res, req, "oneShop.ejs", {
              user: req.user,
              admin: admin,
              shop: shop[0],
              products: products,
              isFollowed: follow,
            });
          }
        } else {
          res.redirect('/shops/all')
        }
      }


    } else {
      res.redirect('/verifiy-user');
    }
  });

  app.post('/shops/all/:name', async (req, res) => {

    if (req.body.follow === "sFollow") {
      Shops.find({ id: req.body.shopID }, (err, data) => {
        Shops.updateOne({ id: req.body.shopID }, { followers: data[0].followers + 1 }, (err, data) => {
          Follow.create({
            userID: req.user.id,
            shopID: req.body.shopID,
          });
          console.log('done followed !!');
        });
        res.redirect(`/shops/all/${req.body.url}`);
      });

    } else if (req.body.follow === "sunFollow") {
      Shops.find({ id: req.body.shopID }, (err, data) => {
        Shops.updateOne({ id: req.body.shopID }, { followers: data[0].followers - 1 }, (err, data) => {
          Follow.deleteOne({ userID: req.user.id, shopID: req.body.shopID }, (err, data) => {
            console.log('done unfollowed !!');
          });
        });
        res.redirect(`/shops/all/${req.body.url}`);
      });
    } else {
      let buyer = await client.Database.fetchUser(req.user.id);
      let seller = await client.Database.fetchUser(req.body.shop_id);

      Products.find({ id: req.body.product_id, ShopID: req.body.shop_id, }, (err, data) => {
        let price = parseInt(data[0].price);
        let p_id = data[0].id;
        let s_id = data[0].ShopID;


        if (buyer.money >= price) {
          if (buyer.email === "No email") {
            res.send(`<body>
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
    Swal.fire(
        'Error',
        "Please Verify Your Email First",
        'error'
    )
    </script>
    </body>
    <script>
    setTimeout(() => {
        document.location.assign(document.location.origin = "/")
    }, 2000);</script>
`);
          } else {

            buyer.money -= price;
            seller.money += price;

            let detiles = {
              from: "rovastore.b@gmail.com",
              to: buyer.email,
              subject: "Product Form rova Shop !!!",
              text: `here you are your product : ${data[0].productEmail}`,
            }

            mail.sendMail(detiles, (err) => {
              if (err) {
                console.log(err);
              } else {
                console.log("Send Product From New Shop...")

              }
            });

            Products.findOneAndDelete({ id: req.body.product_id, ShopID: req.body.shop_id, }, (err, data) => {
              console.log("Deleted From Products !!!");
            });

            Accept.findOneAndDelete({ ShopID: req.body.shop_id, productID: req.body.product_id, }, (err, data) => {
              console.log("Deleted From Accept !!!");
            });
          }


          res.send(`<body>
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
    Swal.fire(
        'Successfuly Bought',
        "We sent this Product To Your Email",
        'success'
    )
    </script>
    </body>
    <script>
    setTimeout(() => {
        document.location.assign(document.location.origin = "/")
    }, 2000);</script>
`);

        } else if (buyer.money < price) {
          res.send(`<body>
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
    Swal.fire(
        'Failed To Bought',
        "Check your Currency or Contact With us",
        'error'
    )
    </script>
    </body>
    <script>
    setTimeout(() => {
        document.location.assign(document.location.origin = "/")
    }, 2000);</script>
    `);
        }
      });
    }

  });

  app.get('/shops/my', (req, res) => {
    if (req.isAuthenticated()) {
      admin = false;

      if (owners.includes(req.user.id)) {
        admin = true;
      }

      Shops.find({ id: req.user.id }, function(err, data1) {
        Products.find({ ShopID: req.user.id }, (err, data2) => {
          renderTemplate(res, req, "shopMy.ejs", {
            user: req.user,
            admin: admin,
            shop: data1[0],
            products: data2,
          });
        });
      });

    } else {
      res.redirect('/verifiy-user');
    }
  });

  app.get('/shops/products', (req, res) => {
    if (req.isAuthenticated()) {

      admin = false;

      if (owners.includes(req.user.id)) {
        admin = true;
      }

      Products.find({ ShopID: req.user.id }, (err, data) => {
        renderTemplate(res, req, "shopProducts.ejs", {
          user: req.user,
          admin: admin,
          products: data,
        });
      });

    } else {
      res.redirect('/verifiy-user');
    }
  });

  app.post('/shops/products', (req, res) => {
    Products.deleteOne({ id: req.body.pid, ShopID: req.user.id, }, (err, data) => {
    });
    res.redirect('/shops/products');
  });

  app.get('/shops/products/add', (req, res) => {
    if (req.isAuthenticated()) {
      Shops.find({ id: req.user.id }, (err, data) => {
        if (data.length <= 0) {
          res.redirect('/shops')
        } else {
          admin = false;

          if (owners.includes(req.user.id)) {
            admin = true;
          }

          renderTemplate(res, req, "productAdd.ejs", {
            user: req.user,
            admin: admin,
          });
        }
      });
    } else {
      res.redirect('/verifiy-user');
    }
  });

  app.post('/shops/products/add', (req, res) => {
    Shops.find({ id: req.user.id }, (err, shopData) => {
      if (!shopData) {
        res.redirect('/shops')
      } else {
        Products.find((err, productData) => {
          if (productData) {

            let productName = req.body.pname;
            let productImage = req.body.pimg;
            let productPrice = req.body.pprice;
            let productDesc = req.body.pdesc;
            let productEmail = req.body.pemail;
            let idForNext = productData[productData.length - 1];

            if (typeof idForNext !== "undefined") {
              Products.create({
                id: idForNext.id + 1,
                ShopID: req.user.id,
                name: productName,
                desc: productDesc,
                img: productImage,
                price: productPrice,
                isShow: false,
                productEmail: productEmail,
              });

              Accept.create({
                ShopID: req.user.id,
                productID: idForNext.id + 1,
              });
            } else {
              Products.create({
                id: 1,
                ShopID: req.user.id,
                name: productName,
                desc: productDesc,
                img: productImage,
                price: productPrice,
                isShow: false,
                productEmail: productEmail,
              });

              Accept.create({
                ShopID: req.user.id,
                productID: 1,
              });
            }

            res.redirect('/shops/products');
          } else {
            Products.create({
              id: 1,
              ShopID: req.user.id,
              name: productName,
              desc: productDesc,
              img: productImage,
              price: productPrice,
              isShow: false,
              productEmail: productEmail,
            });

            res.redirect('/shops/products');
          }
        });
      }
    });
  });

  app.get('/shops/edit', (req, res) => {
    if (req.isAuthenticated()) {
      admin = false;

      if (owners.includes(req.user.id)) {
        admin = true;
      }

      Shops.find({ id: req.user.id }, (err, data) => {
        renderTemplate(res, req, "shopEdit.ejs", {
          user: req.user,
          admin: admin,
          shop: data[0],
        });
      }) // create the post req to update the data
    } else {
      res.redirect('/verifiy-user');
    }
  });

  app.post('/shops/edit', async (req, res) => {
    await Shops.findOneAndUpdate({ id: req.user.id }, { name: req.body.s_name, logo: req.body.s_logo, banner: req.body.s_banner });
    res.redirect('/shops/my');
  });

  app.get('/shop-systems', (req, res) => {
    if (req.isAuthenticated()) {
      admin = false;

      if (owners.includes(req.user.id)) {
        admin = true;
      } else {
        res.redirect('/')
      }

      Products.find({ isShow: false }, (err, data) => {
        renderTemplate(res, req, "shopSystem.ejs", {
          user: req.user,
          admin: admin,
          products: data,
        });
      });
    }
  });

  app.post('/shop-systems', async (req, res) => {
    if (req.body.show === "h") {
      await Products.findOneAndUpdate({ id: req.body.productID, ShopID: req.body.shopID, }, { isShow: true });
      res.redirect('/shop-systems');
    } else {
      await Products.findOneAndDelete({ id: req.body.productID, ShopID: req.body.shopID, });
      res.redirect('/shop-systems');
    }
  });


  app.listen(config.port, null, null, () =>
    console.log(`Dashboard is up and running on port ${config.port}.`),
  );
};  