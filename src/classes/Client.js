module.exports = (Client) => class extends Client {
    constructor(options) {
        super(options);
        options.commands = options.commands || {};
        options.tasks = options.tasks || {};

        // Interaction command triggers
        this.on('interactionCreate', (interaction) => {

            // START OF TEMPORARY SOLUTIONS
            const followup = function(data) { return interaction.client.api['webhooks'][interaction.client.applicationID][interaction.token].post({ data: data }).then(() => { return { followup: followup } }) }
            const edit = function(data) { return interaction.client.api['webhooks'][interaction.client.applicationID][interaction.token]['messages']['@original'].patch({ data: data }) }
            interaction.reply = (options) => {
                if (options.embed) options.embeds = [options.embed];
                if (options.ephemeral && options?.embeds?.length) {
                    options.ephemeral = false;
                    this.emit('log', `[${interaction.commandName}] Unsupported Feature <ephemeral with embed>\n - Attempted to send ephemeral message with an embed\n - See <https://github.com/discord/discord-api-docs/issues/2318> for info\n - Removed the ephemeral message flag <workaround>`)
                }
                return interaction.client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: { type: 4, data: { ...options, flags: options.ephemeral ? 64 : undefined } }
                }).then(res => {
                    return { edit: edit, followup: followup }
                })
            }
            interaction.defer = (options = {}) => {
                return interaction.client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: { type: 5, data: { flags: options.ephemeral ? 64 : undefined } }
                }).then(res => { return { followup: followup } })
            }
            // END OF TEMPORARY SOLUTIONS

            const startTime = Date.now();
            const command = this.commands[interaction.commandName];
            if (command) {
                new Promise((resolve, reject) => {
                    const { channel, member } = interaction;
                    if (!command.allowDM && !member) return resolve(interaction.replyEphemeral(`*Sorry! \`/${command.name}\` can only be used in guilds 😒*`)).then(false);
                    if (member && !channel.permissionsFor(member).has(command.permissions)) return resolve(interaction.replyEphemeral(`*Sorry! You do not have permission to use \`/${command.name}\` 😑*`)).then(false);
                    if (member && command.nsfw && !channel.nsfw) return resolve(interaction.replyEphemeral(`*Sorry! \`/${command.name}\` can only be used in \`NSFW\` channels 😏*`)).then(false);
                    return resolve(true);
                }).then(passed => {
                    if (passed) return command.execute(interaction);
                }).catch((error) => {
                    this.emit('log', `[${command.name}] Failed to execute correctly`);
                    this.emit('error', error);
                    return interaction.replyContent(`*Sorry! I seem to have run into an issue with \`/${command.name}\` 😵*`);
                }).finally(() => {
                    this.emit('log', `[${command.name}](execute) Command completed in ${Date.now() - startTime}ms`);
                });
            } else {
                this.emit('log', `[${interaction.commandName}] NOT IMPLEMENTED`);
                interaction.reply({
                    embed: {
                        color: 14840969,
                        title: 'Not Implemented',
                        description: `Sorry! \`${interaction.commandName}\` is not currently implemented 🥴\n\nPossible reasons you see this message:\n - *Planned or WIP command*\n - *Removed due to stability issues*\n\n*Please contact bot owner for more details*`
                    },
                    ephemeral: true
                });
            }
        });

        // Regex triggers on messages
        this.on('message', message => {
            const startTime = Date.now();
            const { channel, guild, member } = message;
            Object.values(this.commands).filter(command => command.regex).forEach(command => {
                const matches = command.regex.exec(message.content);
                if (matches) {
                    new Promise((resolve, reject) => {
                        if (guild && !channel.permissionsFor(guild.me).has('SEND_MESSAGES')) return resolve(false);
                        if (!command.allowDM && !guild) return resolve(message.reply(`*Sorry! \`/${command.name}\` can only be used in guilds 😒*`)).then(false);
                        if (member && !channel.permissionsFor(member).has(command.permissions)) return resolve(message.reply(`*Sorry! You do not have permission to use \`/${command.name}\` 😑*`)).then(false);
                        if (guild && command.nsfw && !channel.nsfw) return resolve(message.reply(`*Sorry! \`/${command.name}\` can only be used in \`NSFW\` channels 😏*`)).then(false);
                        return resolve(true);
                    }).then(passed => {
                        if (passed) return command.regexecute(message, matches[1]);
                    }).catch((error) => {
                        this.emit('log', `[${command.name}] Failed to execute correctly`);
                        this.emit('error', error);
                        return message.reply(`*Sorry! I seem to have run into an issue with \`${command.name}\` 😵*`);
                    }).finally(() => {
                        this.emit('log', `[${command.name}](regex) Command completed in ${Date.now() - startTime}ms`);
                    });
                }
            });
        });
    }
}
