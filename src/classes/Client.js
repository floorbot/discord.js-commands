const exitHook = require('async-exit-hook');

module.exports = (Client) => class extends Client {
    constructor(options) {
        super(options);

        // Initialise the tasks
        options.tasks = options.tasks || {};
        this.tasks = Object.keys(options.tasks).reduce((created, key) => {
            const taskOptions = options.tasks[key].options ?? {};
            const TaskClass = options.tasks[key].class;
            created[key] = new TaskClass(this, taskOptions);
            return created;
        }, {})

        // Initialise the commands
        options.commands = options.commands || {};
        this.commands = Object.keys(options.commands).reduce((created, key) => {
            const commandOptions = options.commands[key].options ?? {};
            const CommandClass = options.commands[key].class;
            created[key] = new CommandClass(this, commandOptions);
            return created;
        }, {})

        const allTasks = [...Object.values(this.tasks), ...Object.values(this.commands)];
        this.on('shardReady', (id, unavailableGuilds) => { allTasks.forEach(command => { if (command.initialise()) client.emit('log', `[${command.name}] Initialised {Shard Ready}`) }) });
        this.on('shardResume', (id, replayedEvents) => { allTasks.forEach(command => { if (command.initialise()) client.emit('log', `[${command.name}] Initialised {Shard Resume}`) }) });
        this.on('shardError', (error, shardID) => { allTasks.forEach(command => { if (command.finalise()) client.emit('log', `[${command.name}] Finalised {Shard Error}`) }) });
        exitHook(() => { allTasks.forEach(command => { if (command.finalise()) client.emit('log', `[${command.name}] Finalised {Exit Hook}`) }) });

        // Listen and process interactions
        this.on('interaction', (interaction) => {
            if (!interaction.isCommand()) return this.emit('log', `[UNKNOWN] Unknown Interaction`, interaction);
            const command = this.commands[interaction.commandName];
            if (command) {
                const { channel, member } = interaction;
                if (member && command.nsfw && !channel.nsfw) return interaction.reply(`*Sorry! \`/${command.name}\` can only be used in \`NSFW\` channels 😏*`, { ephemeral: true });
                return command.execute(interaction).catch((error) => {
                    this.emit('error', `[${command.name}] Failed to execute correctly`, error);
                    return interaction.reply(`*Sorry! I seem to have run into an issue with \`/${command.name}\` 😵*`);
                }).finally(() => {
                    this.emit('log', `[${command.name}](execute) Command completed in ${Date.now() - interaction.createdTimestamp}ms`);
                });
            } else {
                this.emit('log', `[${interaction.commandName}] Not Implemented`);
                return interaction.reply(`Sorry! \`${this.name}\` is not currently implemented 🥴\n\nPossible reasons you see this message:\n - *Planned or WIP command*\n - *Removed due to stability issues*\n\n*Please contact bot owner for more details*`);
            }
        });

        // Check new messages for regex triggers
        this.on('message', message => {
            Object.values(this.commands).filter(command => command.regex).forEach(command => {
                const matches = command.regex.exec(message.content);
                if (matches) {
                    const { channel, guild } = message;
                    if (guild && !channel.permissionsFor(guild.me).has('SEND_MESSAGES')) return;
                    if (guild && command.nsfw && !channel.nsfw) return;
                    return command.regexecute(message, matches[1]).catch((error) => {
                        this.emit('error', `[${command.name}] Failed to regexecute correctly`, error);
                        return message.reply(`*Sorry! I seem to have run into an issue with \`/${command.name}\` 😵*`);
                    }).finally(() => {
                        this.emit('log', `[${command.name}](regex) Command completed in ${Date.now() - message.createdTimestamp}ms`);
                    });
                }
            });
        });
    }
}
