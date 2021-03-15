module.exports = Discord => {
    Discord.Client = require('./classes/Client')(Discord.Client);
    Discord.Command = require('./classes/Command');
    Discord.Logger = require('./classes/Logger');
    Discord.Task = require('./classes/Task');
    return Discord;
}
