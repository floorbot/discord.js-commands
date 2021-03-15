const { MessageEmbed } = require('discord.js');
const exitHook = require('async-exit-hook');
const Logger = require('./Logger');

module.exports = class Command {
    constructor(client, options = {}) {
        this.client = client;
        this.name = options.name || this.constructor.name;
        this.permissions = options.permissions ?? [];
        this.allowDM = options.allowDM ?? true;
        this.regex = options.regex || null;
        this.nsfw = options.nsfw ?? false;
        this.json = options.json ?? {};

        this.client.on('shardReady', (id, unavailableGuilds) => { if (this.initialise()) Logger.log(this.name, 'Initialised (Shard Ready)') })
        this.client.on('shardResume', (id, replayedEvents) => { if (this.initialise()) Logger.log(this.name, 'Initialised (Shard Resume)') })
        this.client.on('shardError', (error, shardID) => { if (this.finalise()) Logger.log(this.name, 'Finalised (Shard Error)') })
        exitHook(() => { if (this.finalise()) Logger.log(this.name, 'Finalised (Exit Hook)') });
    }

    initialise() {
        return null; // Called when reconnecting or application starting up
    }

    finalise() {
        return null; // Called when disconnected or application closing
    }

    execute(interaction) {
        return interaction.replyEphemeral(`Sorry! \`${this.name}\` has not been implemented 😦`);
    }

    regexecute(message, match) {
        return message.reply(`Sorry! \`${this.name}\` has not been implemented 😦`);
    }

    getEmbedTemplate(interaction, options) {
        options = Object.assign({ embed: null, description: null }, options);
        const { member } = interaction;
        const embed = (options.embed || new MessageEmbed())
            .setColor(member?.displayColor ?? 14840969)
        if (options.description) embed.setDescription(options.description);
        return embed;
    };
}
