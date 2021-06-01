module.exports = Discord => {

    Discord.Client = require('./classes/Client')(Discord.Client);
    Discord.Util = require('./classes/Util')(Discord.Util);
    Discord.Task = require('./classes/Task');

    Discord.Component = require('./classes/handlers/Component');
    Discord.Command = require('./classes/handlers/Command');
    Discord.Regex = require('./classes/handlers/Regex');

    return Discord;
}
