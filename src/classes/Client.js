const { CommandInteraction, MessageComponentInteraction } = require('discord.js');
const exitHook = require('async-exit-hook');

module.exports = (Client) => class extends Client {
    constructor(options) {
        super(options);

        const handlers = options.handlers || {};
        this.handlers = Object.keys(handlers).reduce((created, key) => {
            const handlersOptions = handlers[key].options ?? {};
            const HandlersClass = handlers[key].class;
            created[key] = new HandlersClass(this, handlersOptions);
            return created;
        }, {});

        const allHandlers = Object.values(this.handlers);
        this.on('shardReady', (id, unavailableGuilds) => { allHandlers.forEach(handler => { if (handler.initialise()) this.emit('log', `[${handler.id}] Initialised {Shard Ready}`) }) });
        this.on('shardResume', (id, replayedEvents) => { allHandlers.forEach(handler => { if (handler.initialise()) this.emit('log', `[${handler.id}] Initialised {Shard Resume}`) }) });
        this.on('shardError', (error, shardID) => { allHandlers.forEach(handler => { if (handler.finalise()) this.emit('log', `[${handler.id}] Finalised {Shard Error}`) }) });
        exitHook(() => { allHandlers.forEach(handler => { if (handler.finalise()) this.emit('log', `[${handler.id}] Finalised {Exit Hook}`) }) });

        // Listen and process interactions
        this.on('interaction', (interaction) => {
            const { channel, member } = interaction;

            switch (interaction.constructor.name) {
                case 'CommandInteraction': {
                    const handler = allHandlers.filter(handler => handler.getConstructorChain(true).includes('Command')).find(handler => handler.id === interaction.commandName);
                    if (handler && member && handler.nsfw && !channel.nsfw) return interaction.reply(`*Sorry! \`/${handler.id}\` can only be used in \`NSFW\` channels 😏*`, { ephemeral: true });
                    if (handler) return handler.onCommand(interaction).then(() => {
                        this.emit('log', `[${handler.id}](Handler) Command completed in ${Date.now() - interaction.createdTimestamp}ms`);
                    }).catch((error) => {
                        this.emit('log', `[${handler.id}] Failed to execute correctly`, error);
                        return interaction.followUp(`*Sorry! I seem to have run into an issue with \`/${handler.id}\` 😵*`);
                    }).catch(console.error);
                    this.emit('log', `[${interaction.commandName}] Not Implemented`);
                    return interaction.reply(`Sorry! Command \`${interaction.commandName}\` is not currently implemented 🥴\n\nPossible reasons you see this message:\n - *Planned or WIP command*\n - *Removed due to stability issues*\n\n*Please contact bot owner for more details*`).catch(console.error);
                }
                case 'MessageComponentInteraction': {
                    const handerData = JSON.parse(interaction.customID);
                    const handlerId = interaction.customID.split('-')[0]
                    const handler = allHandlers.filter(handler => handler.getConstructorChain(true).includes('Component')).find(handler => handler.id === handerData.id)
                    if (handler && member && handler.nsfw && !channel.nsfw) return interaction.reply(`*Sorry! \`/${handler.id}\` can only be used in \`NSFW\` channels 😏*`, { ephemeral: true });
                    if (handler) return handler.onComponent(interaction).then(() => {
                        this.emit('log', `[${handler.id}](Handler) Component completed in ${Date.now() - interaction.createdTimestamp}ms`);
                    }).catch((error) => {
                        this.emit('log', `[${handler.id}] Failed to execute correctly`, error);
                        return interaction.followUp(`*Sorry! I seem to have run into an issue with \`/${handler.id}\` 😵*`);
                    }).catch(console.error);
                    this.emit('log', `[${interaction.customID}] Not Implemented`);
                    return interaction.reply(`Sorry! Component \`${interaction.customID}\` is not currently implemented 🥴\n\nPossible reasons you see this message:\n - *Planned or WIP component*\n - *Removed due to stability issues*\n\n*Please contact bot owner for more details*`).catch(console.error);
                }
                default:
                    return this.emit('log', `[Support] Unknown Interaction Type`, interaction);
            }
        });

        // Check new messages for regex triggers
        this.on('message', message => {
            Object.values(this.handlers)
                .filter(handler => handler.getConstructorChain(true).includes('Regex'))
                .forEach(handler => {
                    const matches = handler.regex.exec(message.content);
                    if (matches) {
                        const { channel, guild } = message;
                        if (guild && !channel.permissionsFor(guild.me).has('SEND_MESSAGES')) return;
                        if (guild && handler.nsfw && !channel.nsfw) return;
                        return handler.onRegex(message, matches[1]).catch((error) => {
                            this.emit('log', `[${handler.id}] Failed to regexecute correctly`, error);
                            return message.reply(`*Sorry! I seem to have run into an issue with \`/${handler.id}\` 😵*`);
                        }).finally(() => {
                            this.emit('log', `[${handler.id}](regex) Command completed in ${Date.now() - message.createdTimestamp}ms`);
                        });
                    }
                });
        });
    }

    login(token) {
        return Object.values(this.handlers).reduce((promise, handler) => {
            return promise.then(handler.setup())
        }, Promise.resolve()).then(() => {
            return super.login(token).then(res => {
                client.emit('log', `[server] Logged in as <${client.user.tag}>`)
                return res;
            })
        })
    }
}
