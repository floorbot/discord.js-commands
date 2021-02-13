const { MessageEmbed } = require('discord.js');

module.exports = class Command {
    constructor(client, options = {}) {
        Object.assign(this, {
            permissions: options.permissions ?? [],
            nsfw: options.nsfw ?? false,
            json: options.json ?? {},
            regex: options.regex,
            client: client,
            allowDM: true,
            global: true
        }, options);

        // These are cookie cutter responses for different events
        this.responses = Object.assign({
            200: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! I've successfully processed your request 😕` }),
            400: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! I do not understand your request 😦` }),
            401: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! You do not have permission for this command 😑` }),
            403: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! This is not the appropriate place for that content 😏` }),
            404: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! I could not find what you were looking for 😟` }),
            406: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! I do not have permission or access to view to this channel 🥺\n*This was sent via webhook as a direct responses to the request*` }),
            409: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! This command is only usable inside a guild 😒` }),
            418: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! I'm a teapot 😅` }),
            500: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! I seem to have run into an issue 😵` }),
            501: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! I'm not sure how to handle this command 😥` }),
            504: (interaction, options) => this.getEmbedTemplate(interaction, { description: `Sorry! The request took too long to respond 😭` })
        }, options.responses || {})
    }

    predicate(interaction) {
        const { channel, member } = interaction;
        if (!channel.viewable) return interaction.reply({ embed: this.responses[406](interaction), hideSource: true }).then(false);
        if (member && !channel.permissionsFor(member).has('SEND_MESSAGES')) return interaction.reply({ embed: this.responses[406](interaction), hideSource: true }).then(false);
        if (!this.allowDM && !member) return interaction.reply({ embed: this.responses[409](interaction), hideSource: true }).then(false);
        if (member && this.permissions.length && !member.hasPermission(this.permissions)) return interaction.reply({ embed: this.responses[401](interaction), hideSource: true }).then(false);
        if (member && this.nsfw && !channel.nsfw) return interaction.reply({ embed: this.responses[403](interaction), hideSource: true }).then(false);
        return Promise.resolve(true);
    }

    execute(interaction) {
        const { channel } = interaction;
        return channel.send(this.responses[501](interaction));
    }

    regexecute(message, match) {
        return this.execute({
            commandName: this.json.name,
            options: [{ value: match }],
            channel: message.channel,
            member: message.member,
            client: message.client,
            guild: message.guild,
            user: message.author,
            message: message,
            regex: true,
            acknowledge: (options) => {
                if (
                    message.deleteable &&
                    options.hideSource &&
                    message.content.split(' ').length === 1
                ) return message.delete();
                return Promise.resolve();
            }
        });
    }

    getEmbedTemplate(interaction, options) {
        options = Object.assign({ embed: null, description: null, time: null }, options);
        const { member, user } = interaction;
        const action = interaction.regex ? `Linked` : `\/${interaction.commandName}`;
        const timeString = options.time ? ` - ${(Date.now() - options.time)}ms` : '';
        const embed = (options.embed || new MessageEmbed())
            .setColor(member?.displayColor ?? 16007850)
            .setFooter(`${action} by ${member?.displayName || user.username}${timeString}`, user.displayAvatarURL());
        if (options.description) embed.setDescription(options.description);
        return embed;
    }

    failed(interaction, error) {
        console.log(error);
        const { channel } = interaction;
        return channel.send(this.responses[500](interaction));
    }
}
