const { MessageEmbed } = require('discord.js');
const Task = require('./Task');

module.exports = class Command extends Task {
    constructor(client, options) {
        super(client, options);
        this.allowDM = options.allowDM ?? true;
        this.regex = options.regex || null;
        this.nsfw = options.nsfw ?? false;
        this.json = options.json ?? {};
    }

    execute(interaction) {
        return interaction.replyEphemeral(`Sorry! \`${this.name}\` has not been implemented 😦`);
    }

    regexecute(message, match) {
        return message.reply(`Sorry! \`${this.name}\` has not been implemented 😦`);
    }

    getEmbedTemplate(interaction, data = {}) {
        const { member } = interaction;
        return new MessageEmbed(data)
            .setColor(member?.displayColor ?? data?.color ?? 14840969);
    }
}
