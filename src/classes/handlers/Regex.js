const Task = require('../Task');

module.exports = class Regex extends Task {

    constructor(client, options) {
        super(client, options);

        /**
         * The regex to use when processing new messages and execute matches
         * @type ?{Regex}
         */
        this.regex = options.regex || null;
    }

    /**
     * onRegex - Called when a new message matches regex
     *
     * @param {Message} message A discord message to process
     * @param {String} match The regex matching string from the message
     * @return {Promise} A resolvable promise to indicate success
     */
    onRegex(message, match) { return message.reply(`Sorry! \`${this.name}\` regex is not supported yet 😦`) }
}
