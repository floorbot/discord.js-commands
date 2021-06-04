const { Base, MessageEmbed } = require('discord.js');

module.exports = class Handler extends Base {

    constructor(client, options = {}) {
        super(client);

        /**
         * The id of this handler
         * @type {String}
         */
        this.id = options.id || undefined;

        /**
         * The name of this handler
         * @type {String}
         */
        this.name = options.name || undefined;

        /**
         * The name of the group this handler is part of
         * @type ?{String}
         */
        this.group = options.group ?? null;

        /**
         * Whether this handler is NSFW or not
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
     * @return {Boolean} Whether or not the handler "finalised"
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

    /**
     * getConstructorChain - Returns an array of the prototype chain for this object
     *
     * @param {Boolean} names Whether or not to return an array of names only
     * @return {Array} An array of names or prototypes for this object
     */
    getConstructorChain(names = false) {
        const constructors = [];
        let prototype = this;

        while (prototype = Object.getPrototypeOf(prototype)) {
            constructors.push(prototype.constructor || null);
        }

        return names ? constructors.map(function(constructor) {
            return constructor ? constructor.toString().split(/\s|\(/)[1] : null;
        }) : constructors;
    }
}
