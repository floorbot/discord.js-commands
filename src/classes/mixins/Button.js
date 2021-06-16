module.exports = (superclass) => class Button extends superclass {

    constructor(client, options) {
        super(client, options);
    }

    /**
     * onButton - Called when this mixin should run from a component interaction
     *
     * @param {ButtonInteraction} interaction A discord button interaction to process
     * @return {Promise} A resolvable promise to indicate success
     */
    onComponent(interaction) { return interaction.reply(`Sorry! \`${this.name}\` buttons are not supported yet 😦`) }
}
