const { MessageEmbed } = require('discord.js');
const Task = require('./Task');

module.exports = class Command extends Task {
    constructor(client, options = {}) {
        super(client, options)
        this.permissions = options.permissions ?? [];
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
        const embed = new MessageEmbed(data)
            .setColor(member?.displayColor ?? data?.color ?? 14840969)
        return embed;
    }

    post(guild) {
        return this.client.interactionClient.createCommand(this.json, guild.id)
            .then(() => this.emit('log', `[${commands[key].name}](POST) Success ${guild ? `for guild <${guild.name} : ${guild.id}>` : ''}`))
            .catch(error => this.emit('log', `[${commands[key].name}](POST) Failed ${guild ? `for guild <${guild.name} : ${guild.id}>` : ''}`, error));
    }
}
