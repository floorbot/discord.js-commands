const Task = require('../Task');

module.exports = class Component extends Task {

    constructor(client, options) {
        super(client, options);
    }

    /**
     * onComponent - Called when this feature should run from a component interaction
     *
     * @param {MessageComponentInteraction} interaction A discord message component interaction to process
     * @return {Promise} A resolvable promise to indicate success
     */
    onComponent(interaction) { return interaction.reply(`Sorry! \`${this.name}\` components are not supported yet 😦`) }
}
