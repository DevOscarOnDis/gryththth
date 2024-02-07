const chalk = import("chalk");
const moment = require("moment");

exports.log = (content, type = "log") => {
    const timestamp = `[${moment().format("DD-MM-YY H:m:s")}]`;
    switch (type) {
        case "log": {
        return console.log(`${timestamp} ${content} `);
        }
        case 'warn': {
        return console.log(`${timestamp} ${content} `);
        }
        case 'error': {
        return console.log(`${timestamp} ${content} `);
        }
        case 'cmd': {
        return console.log(`${timestamp} ${content}`);
        }
        case 'ready': {
        return console.log(`${timestamp} ${content}`);
        }
        case 'load': {
        return console.log(`${timestamp} ${content} `);
        }
        case 'event': {
        return console.log(`${timestamp} ${content} `);
        }
        default: throw new TypeError('Wrong type of logger kid');
    }
};

exports.error = (...args) => this.log(...args, 'error');

exports.warn = (...args) => this.log(...args, 'warn');

exports.cmd = (...args) => this.log(...args, 'cmd');

exports.ready = (...args) => this.log(...args, 'ready');

exports.load = (...args) => this.log(...args, 'load');

exports.event = (...args) => this.log(...args, 'event');