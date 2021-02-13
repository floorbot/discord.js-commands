module.exports = Discord => {
    Discord.Client = require('./client')(Discord.Client);
    Discord.Command = require('./command');
    return Discord;
}
