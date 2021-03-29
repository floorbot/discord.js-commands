module.exports = Discord => {
    Discord.Client = require('./classes/Client')(Discord.Client);
    Discord.Util = require('./classes/Util')(Discord.Util);
    Discord.Command = require('./classes/Command');
    Discord.Task = require('./classes/Task');
    return Discord;
}
