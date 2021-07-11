import { Message, MessageEmbedOptions, MessageEmbed, GuildMember, Guild, ApplicationCommand, Permissions, CommandInteraction, ButtonInteraction, SelectMenuInteraction } from 'discord.js';
import { CommandEventHandler } from '../interfaces/CommandEventHandler';
import { SelectMenuHandler } from '../interfaces/SelectMenuHandler';
import { CommandHandler } from '../interfaces/CommandHandler';
import { ButtonHandler } from '../interfaces/ButtonHandler';
import { RegexHandler } from '../interfaces/RegexHandler';
import { CommandClient } from './CommandClient';

export class BaseHandler {

    public readonly client: CommandClient;
    public readonly id: string;
    public readonly name: string;
    public readonly group: string;
    public readonly nsfw: boolean;

    constructor(client: CommandClient, options: BaseHandlerOptions) {
        this.client = client;
        this.id = options.id;
        this.name = options.name;
        this.group = options.group;
        this.nsfw = options.nsfw;
    }

    public setup(): Promise<any> | null { return null }
    public initialise(): Promise<any> | null { return null }
    public finalise(): Promise<any> | null { return null }

    public getEmbedTemplate(context: HandlerContext, data?: MessageEmbedOptions): MessageEmbed {
        const member = <GuildMember>context.member;
        return new MessageEmbed(data)
            .setColor(member.displayColor || 14840969);
    }

    public isCommandEventHandler(): this is CommandEventHandler { return 'onCommandUpdate' in this }
    public isSelectMenuHandler(): this is SelectMenuHandler { return 'onSelectMenu' in this }
    public isCommandHandler(): this is CommandHandler { return 'onCommand' in this }
    public isButtonHandler(): this is ButtonHandler { return 'onButton' in this }
    public isRegexHandler(): this is RegexHandler { return 'onRegex' in this }

    public async fetchCommand(guild?: Guild): Promise<ApplicationCommand | null> {
        if (!this.isCommandHandler()) return null;
        const commands = guild ? await guild.commands.fetch() : await this.client.application!.commands.fetch();
        const found = commands.find(command => command.name === (<CommandHandler><unknown>this).commandData.name);
        return found || null;
    }

    public async isEnabled(guild?: Guild): Promise<boolean> {
        if (!this.isCommandHandler()) return true;
        return Boolean(await this.fetchCommand(guild));
    }

    public async enable(context: HandlerContext): Promise<ApplicationCommand | null> {
        if (!this.isCommandHandler()) return null;
        const found = await this.fetchCommand(context.guild!);
        if (context.guild) return found || context.guild.commands.create(this.commandData);
        else return this.client.application!.commands.create(this.commandData);
    }

    public async disable(context: HandlerContext): Promise<ApplicationCommand | null> {
        if (!this.isCommandHandler()) return null;
        const found = await this.fetchCommand(context.guild!);
        return found ? found.delete() : null;
    }

    public isAdmin(member: GuildMember) {
        return member && member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
    }
}

export interface BaseHandlerOptions {
    readonly id: string;
    readonly name: string;
    readonly group: string;
    readonly nsfw: boolean;
}

export type HandlerContext = CommandInteraction | ButtonInteraction | SelectMenuInteraction | Message;
