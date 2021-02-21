const { MessageEmbed } = require('discord.js');
const exitHook = require('async-exit-hook');

module.exports = class Command {
    constructor(client, options = {}) {
        this.client = client;
        this.name = options.name || this.constructor.name;
        this.permissions = options.permissions ?? [];
        this.safeClose = options.safeClose ?? false;
        this.allowDM = options.allowDM ?? true;
        this.global = options.global ?? true;
        this.regex = options.regex || null;
        this.nsfw = options.nsfw ?? false;
        this.json = options.json ?? {};

        // These are cookie cutter responses for different events
        this.responses = Object.assign({
            200: (interaction, options) => interaction.reply({ embed: this.getEmbedTemplate(interaction, { description: `Sorry! I've successfully processed your request 😕` }), hideSource: true }),
            400: (interaction, options) => interaction.reply({ embed: this.getEmbedTemplate(interaction, { description: `Sorry! I do not understand your request 😦` }), hideSource: true }),
            401: (interaction, options) => interaction.reply({ embed: this.getEmbedTemplate(interaction, { description: `Sorry! You do not have permission for this command 😑` }), hideSource: true }),
            403: (interaction, options) => interaction.reply({ embed: this.getEmbedTemplate(interaction, { description: `Sorry! This is not the appropriate place for NSFW content 😏` }), hideSource: true }),
            404: (interaction, options) => interaction.reply({ embed: this.getEmbedTemplate(interaction, { description: `Sorry! I could not find what you were looking for 😟` }), hideSource: true }),
            405: (interaction, options) => interaction.reply({ embed: this.getEmbedTemplate(interaction, { description: `Sorry! I am not allowed to do that 🙃` }), hideSource: true }),
            409: (interaction, options) => interaction.reply({ embed: this.getEmbedTemplate(interaction, { description: `Sorry! This command is only usable inside a guild 😒` }), hideSource: true }),
            415: (interaction, options) => interaction.reply({ embed: this.getEmbedTemplate(interaction, { description: `Sorry! I do not have permission or access to view to this channel 🥺\n*This was sent via webhook as a direct responses to the request*` }), hideSource: true }),
            418: (interaction, options) => interaction.reply({ embed: this.getEmbedTemplate(interaction, { description: `Sorry! I'm a teapot! 😅${options.message ? `\n*${options.message}*` : ''}` }), hideSource: true }),
            426: (interaction, options) => interaction.reply({ embed: this.getEmbedTemplate(interaction, { description: `Sorry! I do not have permission to send messages in this channel 🥺\n*This was sent via webhook as a direct responses to the request*` }), hideSource: true }),
            500: (interaction, options) => interaction.reply({ embed: this.getEmbedTemplate(interaction, { description: `Sorry! I seem to have run into an issue 😵` }), hideSource: true }),
            501: (interaction, options) => interaction.reply({ embed: this.getEmbedTemplate(interaction, { description: `Sorry! I'm not sure how to handle this command 😥` }), hideSource: true }),
            504: (interaction, options) => interaction.reply({ embed: this.getEmbedTemplate(interaction, { description: `Sorry! The request took too long to respond 😭` }), hideSource: true })
        }, options.responses || {});

        const thisCommaand = this;
        this.respond = new Proxy(this.responses, {
            get(response, code) {
                let keyCode = null;
                const handler = {
                    get(responseCode, key) {
                        keyCode = key;
                        return new Proxy(responseCode[key], handler)
                    },
                    apply(target, thisArg, argsArray) {
                        return target.apply(thisArg, argsArray).then(res => {
                            console.log(`[${thisCommaand.name}] Success:`, code, keyCode);
                            return res;
                        }).catch(error => {
                            console.log(`[${thisCommaand.name}] Failure:`, code);
                            if (code !== '500' && code !== 500) return thisCommaand.respond[500](...argsArray)
                            console.log('THIS SHOULD PROBABLY NOT HAPPEN!', error);
                        });
                    }
                }
                return new Proxy(response[code], handler);
            }
        });

        if (this.safeClose) {
            this.client.on('shardReady', (id, unavailableGuilds) => this.initialize())
            this.client.on('shardResume', (id, replayedEvents) => this.initialize())
            this.client.on('shardError', (error, shardID) => this.finalize());
            exitHook(() => {
                console.log(`Safely Closing Command: ${this.constructor.name}`);
                return this.finalize();
            });
        }
    }

    initialize() {
        // Called when reconnecting or application starting up
    }

    finalize() {
        // Called when disconnected or application closing
    }

    predicate(interaction) {
        const { channel, member } = interaction;
        if (!channel.viewable) return this.respond[415](interaction).then(false);
        if (member && !channel.permissionsFor(member).has('SEND_MESSAGES')) return this.respond[426](interaction).then(false);
        if (!this.allowDM && !member) return this.respond[409](interaction).then(false);
        if (member && this.permissions.length && !member.hasPermission(this.permissions)) return this.respond[401](interaction).then(false);
        if (member && this.nsfw && !channel.nsfw) return this.respond[403](interaction).then(false);
        return Promise.resolve(true);
    }

    execute(interaction) {
        const { channel } = interaction;
        return this.respond[501](interaction);
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
    };
}
