module.exports = Discord => {

    Discord.Client = require('./classes/Client')(Discord.Client);
    Discord.Util = require('./classes/Util')(Discord.Util);
    Discord.Handler = require('./classes/Handler');
    Discord.Mixin = require('./classes/Mixin');

    Object.assign(Discord.Mixin, {
        Component: require('./classes/mixins/Component'),
        Command: require('./classes/mixins/Command'),
        Regex: require('./classes/mixins/Regex')
    });

    return Discord;
}
