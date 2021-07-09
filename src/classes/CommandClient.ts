import { Client, ClientOptions, Collection, Constants, CloseEvent, Message, Interaction, CommandInteraction, ButtonInteraction, SelectMenuInteraction, TextChannel, MessageEmbed } from 'discord.js';
import { BaseHandler, BaseHandlerOptions } from './BaseHandler';
import { isSelectMenuHandler } from '../interfaces/SelectMenuHandler';
import { isCommandHandler } from '../interfaces/CommandHandler';
import { isButtonHandler } from '../interfaces/ButtonHandler';
import { isRegexHandler } from '../interfaces/RegexHandler';
const { Events } = Constants;

// @ts-ignore
import * as exitHook from 'async-exit-hook';

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
        exitHook(this.onExitHook);

        this.on(Events.INTERACTION_CREATE, this.onInteractionCreate);
        this.on(Events.MESSAGE_CREATE, this.onMessageCreate);
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

            if (!handler || !isCommandHandler(handler)) {
                const embed = this.getUnsupportedEmbed(interaction.commandName);
                return interaction.reply({ embeds: [embed], ephemeral: false }).catch(console.error);
            }

            if (channel instanceof TextChannel && !channel.nsfw && handler.nsfw) {
                const embed = handler.getEmbedTemplate(interaction)
                    .setDescription(`*Sorry! \`/${handler.id}\` commands can only be used in \`NSFW\` channels 😏*`);
                return interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
            }

            return handler.onCommand(interaction).then(() => {
                this.emit('log', `[handler:${handler.id}](command) Command completed in ${Date.now() - interaction.createdTimestamp}ms`);
            }).catch(error => {
                this.emit('log', `[handler:${handler.id}] Failed to execute correctly`, error);
                const embed = this.getErrorEmbed(handler, error);
                return interaction.followUp({ embeds: [embed], ephemeral: false });
            }).catch(console.error);
        }

        if (interaction instanceof ButtonInteraction) {
            const customData = JSON.parse(interaction.customId);
            const handler = this.handlers.get(customData.id);

            if (!handler || !isButtonHandler(handler)) {
                const embed = this.getUnsupportedEmbed(customData.id);
                return interaction.reply({ embeds: [embed], ephemeral: false }).catch(console.error);
            }

            if (channel instanceof TextChannel && !channel.nsfw && handler.nsfw) {
                const embed = handler.getEmbedTemplate(interaction)
                    .setDescription(`*Sorry! \`/${handler.id}\` buttons can only be used in \`NSFW\` channels 😏*`);
                return interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
            }

            return handler.onButton(interaction, customData).then(() => {
                this.emit('log', `[handler:${handler.id}](button) Button completed in ${Date.now() - interaction.createdTimestamp}ms`);
            }).catch(error => {
                this.emit('log', `[handler:${handler.id}] Failed to execute correctly`, error);
                const embed = this.getErrorEmbed(handler, error);
                return interaction.followUp({ embeds: [embed], ephemeral: false });
            }).catch(console.error);
        }

        if (interaction instanceof SelectMenuInteraction) {
            const customData = JSON.parse(interaction.customId);
            const handler = this.handlers.get(customData.id);

            if (!handler || !isSelectMenuHandler(handler)) {
                const embed = this.getUnsupportedEmbed(customData.id);
                return interaction.reply({ embeds: [embed], ephemeral: false }).catch(console.error);
            }

            if (channel instanceof TextChannel && !channel.nsfw && handler.nsfw) {
                const embed = handler.getEmbedTemplate(interaction)
                    .setDescription(`*Sorry! \`/${handler.id}\` buttons can only be used in \`NSFW\` channels 😏*`);
                return interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
            }

            return handler.onSelectMenu(interaction, customData).then(() => {
                this.emit('log', `[handler:${handler.id}](button) Button completed in ${Date.now() - interaction.createdTimestamp}ms`);
            }).catch(error => {
                this.emit('log', `[handler:${handler.id}] Failed to execute correctly`, error);
                const embed = this.getErrorEmbed(handler, error);
                return interaction.followUp({ embeds: [embed], ephemeral: false });
            }).catch(console.error);
        }
    }


    private async onMessageCreate(message: Message): Promise<void> {
        this.handlers.each((handler: BaseHandler) => {
            if (isRegexHandler(handler)) {
                const matches = handler.regex.exec(message.content);
                if (matches) {
                    const { channel, guild } = message;
                    if (channel instanceof TextChannel) {
                        if (!guild || !guild.me) return;
                        if (!channel.permissionsFor(guild.me).has('SEND_MESSAGES')) return;
                        if (handler.nsfw && !channel.nsfw) return;
                        return handler.onRegex(message, matches[1]).catch((error) => {
                            this.emit('log', `[handler:${handler.id}] Failed to regexecute correctly`, error);
                            return message.reply(`*Sorry! I seem to have run into an issue with \`/${handler.id}\` 😵*`);
                        }).finally(() => {
                            this.emit('log', `[handler:${handler.id}](regex) Command completed in ${Date.now() - message.createdTimestamp}ms`);
                        });
                    }
                }
            }
        });
    }

    public async login(token?: string): Promise<string> {
        const handlers = Array.from(this.handlers.values());
        for (const handler of handlers) {
            if (await handler.setup()) this.emit('log', `[setup][handler:${handler.id}] Handler setup complete`);
        }
        return super.login(token).then((string: string) => {
            this.emit('log', `[client] Logged in as <${this.user!.tag}>`)
            return string;
        });
    }

    private onShardReady(id: number, unavailableGuilds: Set<string> | undefined): void {
        this.emit('log', `[shard:${id}][SHARD_READY] Shard Ready with ${unavailableGuilds ? unavailableGuilds.size : 0} unavailable guilds`);
        this.handlers.each((handler: BaseHandler) => {
            const initialise: Promise<any> | null = handler.initialise();
            if (initialise) initialise.then(() => {
                this.emit('log', `[shard:${id}][handler:${handler.id}] Initialised {Shard Ready}`);
            });
        });
    }

    private onShardResume(id: number, replayedEvents: number): void {
        this.emit('log', `[shard:${id}][SHARD_RESUME] Shard Resumed with ${replayedEvents} replayed events`);
        this.handlers.each((handler: BaseHandler) => {
            const initialise: Promise<any> | null = handler.initialise();
            if (initialise) initialise.then(() => {
                this.emit('log', `[shard:${id}][handler:${handler.id}] Initialised {Shard Resume}`);
            });
        });
    }

    private onShardDisconnect(event: CloseEvent, id: number): void {
        this.emit('log', `[shard:${id}][SHARD_DISCONNECT] Shard disconnected`, event);
        this.handlers.each((handler: BaseHandler) => {
            const finalise: Promise<any> | null = handler.finalise();
            if (finalise) finalise.then(() => {
                this.emit('log', `[shard:${id}][handler:${handler.id}] Finalised {Shard Disconnect}`);
            });
        });
    }

    private onShardError(error: Error, id: number): void {
        this.emit('log', `[shard:${id}][SHARD_ERROR] Shard encountered an error`, error);
        this.handlers.each((handler: BaseHandler) => {
            const finalise: Promise<any> | null = handler.finalise();
            if (finalise) finalise.then(() => {
                this.emit('log', `[shard:${id}][handler:${handler.id}] Finalised {Shard Error}`);
            });
        });
    }

    private onExitHook(): void {
        this.emit('log', '[EXIT_HOOK] Finalising all handlers before exiting');
        this.handlers.each((handler: BaseHandler) => {
            const finalise: Promise<any> | null = handler.finalise();
            if (finalise) finalise.then(() => {
                this.emit('log', `[EXIT_HOOK][handler:${handler.id}] Finalised {Exit Hook}`);
            });
        });
    }
}

export interface CommandClientOptions extends ClientOptions {
    readonly handlers: Collection<typeof BaseHandler, BaseHandlerOptions>;
}
