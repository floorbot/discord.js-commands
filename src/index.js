module.exports = Discord => {
    Discord.Client = require('./client')(Discord.Client);
    Discord.Command = require('./command');
    Discord.Tracker = require('./tracker');
    return Discord;
}
