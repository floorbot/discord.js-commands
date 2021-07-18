import { Client, ClientOptions, Collection, Constants, CloseEvent, ApplicationCommand, Message, Interaction, CommandInteraction, ButtonInteraction, SelectMenuInteraction, TextChannel, MessageEmbed } from 'discord.js';
import { BaseHandler, BaseHandlerOptions } from './BaseHandler';
import * as exitHook from 'async-exit-hook';
const { Events } = Constants;

export interface ComponentCustomData {
    readonly id: string
}

export class CommandClient extends Client {

    public readonly handlers: Collection<string, BaseHandler>;

    constructor(options: CommandClientOptions) {
        super(options);

        this.handlers = new Collection();
        options.handlers.each((options: BaseHandlerOptions, HandlerClass: typeof BaseHandler) => {
            const handler: BaseHandler = new HandlerClass(this, options);
            this.handlers.set(handler.id, handler);
        })

        this.on(Events.SHARD_READY, this.onShardReady);
        this.on(Events.SHARD_RESUME, this.onShardResume);
        this.on(Events.SHARD_DISCONNECT, this.onShardDisconnect);
        this.on(Events.SHARD_ERROR, this.onShardError);
        exitHook(() => this.onExitHook);

        this.on(Events.INTERACTION_CREATE, this.onInteractionCreate);
        this.on(Events.MESSAGE_CREATE, this.onMessageCreate);

        this.on(Events.APPLICATION_COMMAND_CREATE, this.onApplicationCommandCreate);
        this.on(Events.APPLICATION_COMMAND_UPDATE, this.onApplicationCommandUpdate);
        this.on(Events.APPLICATION_COMMAND_DELETE, this.onApplicationCommandDelete);
    }

    private getUnsupportedEmbed(name: string): MessageEmbed {
        return new MessageEmbed()
            .setDescription(
                `Sorry! Command \`${name}\` is not currently supported\n\n` +
                `Possible reasons you see this message:\n` +
                ` - *Planned or WIP feature*\n` +
                ` - *Removed due to stability issues*\n\n` +
                `*Please contact bot owner for more details*`
            );
    }

    private getErrorEmbed(handler: BaseHandler, error: Error): MessageEmbed {
        return new MessageEmbed()
            .setDescription(
                `*Sorry! I seem to have run into an issue with \`/${handler.id}\` 😵*\n` +
                `\`${error.message}\``
            );
    }

    private async onInteractionCreate(interaction: Interaction): Promise<any> {
        const { channel } = interaction;

        if (interaction instanceof CommandInteraction) {
            const handler = this.handlers.get(interaction.commandName);

            if (!handler || !handler.isCommandHandler()) {
                const embed = this.getUnsupportedEmbed(interaction.commandName);
                return interaction.reply({ embeds: [embed], ephemeral: false }).catch(console.error);
            }

            if (channel instanceof TextChannel && !channel.nsfw && handler.nsfw) {
                const embed = handler.getEmbedTemplate(interaction)
                    .setDescription(`*Sorry! \`/${handler.id}\` commands can only be used in \`NSFW\` channels 😏*`);
                return interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
            }

            return handler.onCommand(interaction).then(() => {
                this.emit('log', `[${handler.id}](command) Command completed in ${Date.now() - interaction.createdTimestamp}ms`);
            }).catch(error => {
                this.emit('log', `[${handler.id}](command) Failed to execute correctly`, error);
                const embed = this.getErrorEmbed(handler, error);
                return interaction.followUp({ embeds: [embed], ephemeral: false });
            }).catch(console.error);
        }

        if (interaction instanceof ButtonInteraction) {
            const customData: ComponentCustomData = JSON.parse(interaction.customId);
            const handler = this.handlers.get(customData.id);

            if (!handler || !handler.isButtonHandler()) {
                const embed = this.getUnsupportedEmbed(customData.id);
                return interaction.reply({ embeds: [embed], ephemeral: false }).catch(console.error);
            }

            if (channel instanceof TextChannel && !channel.nsfw && handler.nsfw) {
                const embed = handler.getEmbedTemplate(interaction)
                    .setDescription(`*Sorry! \`/${handler.id}\` buttons can only be used in \`NSFW\` channels 😏*`);
                return interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
            }

            return handler.onButton(interaction, customData).then(() => {
                this.emit('log', `[${handler.id}](button) Button completed in ${Date.now() - interaction.createdTimestamp}ms`);
            }).catch(error => {
                this.emit('log', `[${handler.id}](button) Failed to execute correctly`, error);
                const embed = this.getErrorEmbed(handler, error);
                return interaction.followUp({ embeds: [embed], ephemeral: false });
            }).catch(console.error);
        }

        if (interaction instanceof SelectMenuInteraction) {
            const customData: ComponentCustomData = JSON.parse(interaction.customId);
            const handler = this.handlers.get(customData.id);

            if (!handler || !handler.isSelectMenuHandler()) {
                const embed = this.getUnsupportedEmbed(customData.id);
                return interaction.reply({ embeds: [embed], ephemeral: false }).catch(console.error);
            }

            if (channel instanceof TextChannel && !channel.nsfw && handler.nsfw) {
                const embed = handler.getEmbedTemplate(interaction)
                    .setDescription(`*Sorry! \`/${handler.id}\` buttons can only be used in \`NSFW\` channels 😏*`);
                return interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
            }

            return handler.onSelectMenu(interaction, customData).then(() => {
                this.emit('log', `[${handler.id}](selectmenu) Button completed in ${Date.now() - interaction.createdTimestamp}ms`);
            }).catch(error => {
                this.emit('log', `[${handler.id}](selectmenu) Failed to execute correctly`, error);
                const embed = this.getErrorEmbed(handler, error);
                return interaction.followUp({ embeds: [embed], ephemeral: false });
            }).catch(console.error);
        }
    }


    private async onMessageCreate(message: Message): Promise<void> {
        this.handlers.each((handler: BaseHandler) => {
            if (handler.isRegexHandler()) {
                const matches = handler.regex.exec(message.content);
                if (matches) {
                    const { channel, guild } = message;
                    if (channel instanceof TextChannel) {
                        if (!guild || !guild.me) return;
                        if (!channel.permissionsFor(guild.me).has('SEND_MESSAGES')) return;
                        if (handler.nsfw && !channel.nsfw) return;
                        return handler.onRegex(message, matches[1]).catch((error) => {
                            this.emit('log', `[${handler.id}](regex) Failed to regexecute correctly`, error);
                            return message.reply(`*Sorry! I seem to have run into an issue with \`/${handler.id}\` 😵*`);
                        }).finally(() => {
                            this.emit('log', `[${handler.id}](regex) Command completed in ${Date.now() - message.createdTimestamp}ms`);
                        });
                    }
                }
            }
        });
    }

    private async onApplicationCommandCreate(command: ApplicationCommand): Promise<void> {
        const handler = this.handlers.get(command.name);
        if (handler && handler.isCommandEventHandler()) {
            handler.onCommandCreate(command);
        }
    }

    private async onApplicationCommandUpdate(oldCommand: ApplicationCommand | null, newCommand: ApplicationCommand): Promise<void> {
        const handler = this.handlers.get(newCommand.name);
        if (handler && handler.isCommandEventHandler()) {
            handler.onCommandUpdate(oldCommand, newCommand);
        }
    }

    private async onApplicationCommandDelete(command: ApplicationCommand): Promise<void> {
        const handler = this.handlers.get(command.name);
        if (handler && handler.isCommandEventHandler()) {
            handler.onCommandDelete(command);
        }
    }

    public async login(token?: string): Promise<string> {
        const handlers = Array.from(this.handlers.values());
        for (const handler of handlers) {
            const setup = await handler.setup();
            if (setup) this.emit('log', `[login](${handler.id}) ${setup.message || 'Setup complete'}`);
        }
        return super.login(token).then((string: string) => {
            this.emit('log', `[login] Logged in as <${this.user!.tag}>`)
            return string;
        });
    }

    private async onShardReady(id: number, unavailableGuilds: Set<string> | undefined): Promise<void> {
        this.emit('log', `[shard-ready] Shard ${id} ready with ${unavailableGuilds ? unavailableGuilds.size : 0} unavailable guilds`);
        for (const [_id, handler] of this.handlers) {
            const initialise = await handler.initialise();
            if (initialise) this.emit('log', `[shard-ready](${handler.id}) ${initialise.message || 'Initialised'}`);
        }
    }

    private async onShardResume(id: number, replayedEvents: number): Promise<void> {
        this.emit('log', `[shard-resume] Shard ${id} resumed with ${replayedEvents} replayed events`);
        for (const [_id, handler] of this.handlers) {
            const initialise = await handler.initialise();
            if (initialise) this.emit('log', `[shard-resume](${handler.id}) ${initialise.message || 'Initialised'}`);
        }
    }

    private async onShardDisconnect(event: CloseEvent, id: number): Promise<void> {
        this.emit('log', `[shard-disconnect] Shard ${id} disconnected`, event);
        for (const [_id, handler] of this.handlers) {
            const finalise = await handler.finalise();
            if (finalise) this.emit('log', `[shard-disconnect](${handler.id}) ${finalise.message || 'Finalised'}`);
        }
    }

    private async onShardError(error: Error, id: number): Promise<void> {
        this.emit('log', `[shard-error] Shard ${id} encountered an error`, error);
        for (const [_id, handler] of this.handlers) {
            const finalise = await handler.finalise();
            if (finalise) this.emit('log', `[shard-error](${handler.id}) ${finalise.message || 'Finalised'}`);
        }
    }

    private async onExitHook(): Promise<void> {
        this.emit('log', '[exit-hook] Finalising all handlers before exiting');
        for (const [_id, handler] of this.handlers) {
            const finalise = await handler.finalise();
            if (finalise) this.emit('log', `[exit-hook](${handler.id}) ${finalise.message || 'Finalised'}`);
        }
    }
}

export interface CommandClientOptions extends ClientOptions {
    readonly handlers: Collection<typeof BaseHandler, BaseHandlerOptions>;
}
