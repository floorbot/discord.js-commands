module.exports = (Client) => class extends Client {
    constructor(options) {
        super(options);
        options.commands = options.commands || {};
        options.tasks = options.tasks || {};

        // Make sure these are complete before logging in
        this.predicates = options.predicates || [];

        // Initialise the tasks
        this.tasks = Object.keys(options.tasks).reduce((created, key) => {
            const taskOptions = options.tasks[key].options ?? {};
            const TaskClass = options.tasks[key].class;
            created[key] = new TaskClass(this, taskOptions);
            return created;
        }, {})

        // Initialise the commands
        this.commands = Object.keys(options.commands).reduce((created, key) => {
            const commandOptions = options.commands[key].options ?? {};
            const CommandClass = options.commands[key].class;
            created[key] = new CommandClass(this, commandOptions);
            return created;
        }, {})

        // Interaction command triggers
        this.on('interaction', (interaction) => {
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
                    if (passed) return command.execute(interaction).catch(err => console.log('better?', err));
                }).catch((error) => {
                    this.emit('log', `[${command.name}] Failed to execute correctly`);
                    this.emit('error', error);
                    return interaction.reply(`*Sorry! I seem to have run into an issue with \`/${command.name}\` 😵*`);
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
                    }
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

    login(token) {
        return this.predicates.reduce((promise, predicate) => {
            return promise.then(predicate)
        }, Promise.resolve()).then(super.login(token));
    }
}
