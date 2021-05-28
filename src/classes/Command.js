const { MessageEmbed } = require('discord.js');
const Task = require('./Task');

module.exports = class Command extends Task {
    constructor(client, options) {
        super(client, options);
        this.regex = options.regex || null;
        this.nsfw = options.nsfw ?? false;
        this.json = options.json ?? {};
    }

    // Called when this command should run from an interaction
    execute(interaction) {
        return interaction.reply(`Sorry! \`${this.name}\` has not been implemented 😦`);
    }

    // Called when a new message matches regex
    regexecute(message, match) {
        return message.reply(`Sorry! \`${this.name}\` has not been implemented 😦`);
    }

    // A util method for keeping embeds uniform
    getEmbedTemplate(interaction, data = {}) {
        const { member } = interaction;
        return new MessageEmbed(data)
            .setColor(member?.displayColor ?? data?.color ?? 14840969);
    }
}
