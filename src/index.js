module.exports = Discord => {
    Discord.Client = require('./classes/Client')(Discord.Client);
    Discord.Command = require('./classes/Command');
    Discord.Task = require('./classes/Task');
    return Discord;
}
