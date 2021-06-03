module.exports = (superclass) => class Command extends superclass {

    constructor(client, options) {
        super(client, options);

        /**
         * The data for this mixin if it is a slash command
         * @type {Object}
         */
        this.json = options.json ?? {};
    }

    /**
     * onCommand - Called when this mixin should run from a command interaction
     *
     * @param {CommandInteraction} interaction A discord command interaction to process
     * @return {Promise} A resolvable promise to indicate success
     */
    onCommand(interaction) { return interaction.reply(`Sorry! \`${this.name}\` commands are not supported yet 😦`) }
}
