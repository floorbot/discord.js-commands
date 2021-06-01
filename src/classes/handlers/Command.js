const Task = require('../Task');

module.exports = class Command extends Task {

    constructor(client, options) {
        super(client, options);

        /**
         * The data for this feature if it is a slash command
         * @type {Object}
         */
        this.json = options.json ?? {};
    }

    /**
     * onCommand - Called when this feature should run from a command interaction
     *
     * @param {CommandInteraction} interaction A discord command interaction to process
     * @return {Promise} A resolvable promise to indicate success
     */
    onCommand(interaction) { return interaction.reply(`Sorry! \`${this.name}\` commands are not supported yet 😦`) }
}
