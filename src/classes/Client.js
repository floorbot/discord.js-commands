const { CommandInteraction, MessageComponentInteraction } = require('discord.js');
const exitHook = require('async-exit-hook');

module.exports = (Client) => class extends Client {
    constructor(options) {
        super(options);

        options.handlers = options.handlers || {};
        const { taskData, commandData, componentData, regexData } = options.handlers;
        this.handlers = {
            tasks: taskData ? Object.keys(taskData).reduce((created, key) => {
                const taskOptions = taskData[key].options ?? {};
                const TaskClass = taskData[key].class;
                created[key] = new TaskClass(this, taskOptions);
                return created;
            }, {}) : {},
            commands: commandData ? Object.keys(commandData).reduce((created, key) => {
                const commandOptions = commandData[key].options ?? {};
                const CommandClass = commandData[key].class;
                created[key] = new CommandClass(this, commandOptions);
                return created;
            }, {}) : {},
            components: componentData ? Object.keys(componentData).reduce((created, key) => {
                const componentOptions = componentData[key].options ?? {};
                const ComponentClass = componentData[key].class;
                created[key] = new ComponentClass(this, componentOptions);
                return created;
            }, {}) : {},
            regexes: regexData ? Object.keys(regexData).reduce((created, key) => {
                const regexOptions = regexData[key].options ?? {};
                const RegexClass = regexData[key].class;
                created[key] = new RegexClass(this, regexOptions);
                return created;
            }, {}) : {},
        };

        const allTasks = Object.values(this.handlers).reduce((array, tasks) => [...array, ...Object.values(tasks)], [])
        this.on('shardReady', (id, unavailableGuilds) => { allTasks.forEach(task => { if (task.initialise()) this.emit('log', `[${task.name}] Initialised {Shard Ready}`) }) });
        this.on('shardResume', (id, replayedEvents) => { allTasks.forEach(task => { if (task.initialise()) this.emit('log', `[${task.name}] Initialised {Shard Resume}`) }) });
        this.on('shardError', (error, shardID) => { allTasks.forEach(task => { if (task.finalise()) this.emit('log', `[${task.name}] Finalised {Shard Error}`) }) });
        exitHook(() => { allTasks.forEach(task => { if (task.finalise()) this.emit('log', `[${task.name}] Finalised {Exit Hook}`) }) });

        // Listen and process interactions
        this.on('interaction', (interaction) => {
            switch (interaction.constructor.name) {
                case 'CommandInteraction': {
                    const command = this.handlers.commands[interaction.commandName];
                    if (command) {
                        const { channel, member } = interaction;
                        if (member && command.nsfw && !channel.nsfw) return interaction.followUp(`*Sorry! \`/${command.name}\` can only be used in \`NSFW\` channels 😏*`, { ephemeral: true });
                        return command.onCommand(interaction).then(() => {
                            this.emit('log', `[${command.name}](Command) Command completed in ${Date.now() - interaction.createdTimestamp}ms`);
                        }).catch((error) => {
                            this.emit('log', `[${command.name}] Failed to execute correctly`, error);
                            return interaction.followUp(`*Sorry! I seem to have run into an issue with \`/${command.name}\` 😵*`);
                        }).catch(console.error);
                    } else {
                        this.emit('log', `[${interaction.commandName}] Not Implemented`);
                        return interaction.followUp(`Sorry! \`${this.name}\` is not currently implemented 🥴\n\nPossible reasons you see this message:\n - *Planned or WIP command*\n - *Removed due to stability issues*\n\n*Please contact bot owner for more details*`).catch(console.error);
                    }
                }
                case 'MessageComponentInteraction': {
                    const component = this.handlers.component[interaction.customID.split('-')[0]];
                    if (component) {
                        const { channel, member } = interaction;
                        if (member && component.nsfw && !channel.nsfw) return interaction.followUp(`*Sorry! \`/${component.name}\` can only be used in \`NSFW\` channels 😏*`, { ephemeral: true });
                        return component.onComponent(interaction).then(() => {
                            this.emit('log', `[${component.name}](Component) Component completed in ${Date.now() - interaction.createdTimestamp}ms`);
                        }).catch((error) => {
                            this.emit('log', `[${component.name}] Failed to execute correctly`, error);
                            return interaction.followUp(`*Sorry! I seem to have run into an issue with \`/${component.name}\` 😵*`);
                        }).catch(console.error);
                    } else {
                        this.emit('log', `[${interaction.customID}] Not Implemented`);
                        return interaction.followUp(`Sorry! \`${this.name}\` is not currently implemented 🥴\n\nPossible reasons you see this message:\n - *Planned or WIP component*\n - *Removed due to stability issues*\n\n*Please contact bot owner for more details*`).catch(console.error);
                    }
                }
                default:
                    return this.emit('log', `[UNKNOWN] Unknown Interaction`, interaction);
            }
        });

        // Check new messages for regex triggers
        this.on('message', message => {
            Object.values(this.handlers.regexes).forEach(task => {
                const matches = task.regex.exec(message.content);
                if (matches) {
                    const { channel, guild } = message;
                    if (guild && !channel.permissionsFor(guild.me).has('SEND_MESSAGES')) return;
                    if (guild && task.nsfw && !channel.nsfw) return;
                    return task.onRegex(message, matches[1]).catch((error) => {
                        this.emit('log', `[${task.name}] Failed to regexecute correctly`, error);
                        return message.reply(`*Sorry! I seem to have run into an issue with \`/${task.name}\` 😵*`);
                    }).finally(() => {
                        this.emit('log', `[${task.name}](regex) Command completed in ${Date.now() - message.createdTimestamp}ms`);
                    });
                }
            });
        });
    }
}
