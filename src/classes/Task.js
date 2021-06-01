const { MessageEmbed } = require('discord.js');

module.exports = class Task {

    constructor(client, options = {}) {

        /**
         * The discord client that created this feature
         * @type {Client}
         */
        this.client = client;

        /**
         * The name of this feature
         * @type {String}
         */
        this.name = options.name || this.constructor.name;

        /**
         * The name of the group this feature is part of
         * @type ?{String}
         */
        this.group = options.group ?? null;

        /**
         * Whether this feature is NSFW or not
         * @type {Boolean}
         */
        this.nsfw = options.nsfw ?? false;
    }

    /**
     * initialise - Called when a client reconnected or the application is starting up
     *
     * @return {type}  description
     */
    initialise() { return null; }

    /**
     * finalise - Called when a client disconnected or the application is closing
     *
     * @return {Boolean} Whether or not the feature "finalised"
     */
    finalise() { return null; }

    /**
     * getEmbedTemplate - A util method for keeping embeds uniform to be extended by implementations
     *
     * @param {Interaction|Message} context An interaction or message to provide data for creating a template
     * @param {MessageEmbed|MessageEmbedOptions} data An embed or embed options for creating a new embed
     * @return {MessageEmbed} A new message embed with provided data
     */
    getEmbedTemplate(context, data = {}) {
        const { member } = context;
        return new MessageEmbed(data)
            .setColor(member?.displayColor ?? data?.color ?? 14840969);
    }
}
