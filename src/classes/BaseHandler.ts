import { Client, Message, Interaction, MessageEmbedOptions, MessageEmbed, GuildMember } from 'discord.js';

export class BaseHandler {
    public readonly client: Client;
    public readonly id: string;
    public readonly name: string;
    public readonly group: string;
    public readonly nsfw: boolean;

    constructor(client: Client, options: BaseHandlerOptions) {
        this.client = client;
        this.id = options.id;
        this.name = options.name;
        this.group = options.group;
        this.nsfw = options.nsfw;
    }

    public setup(): Promise<void> | null { return null }
    public initialise(): Promise<void> | null { return null }
    public finalise(): Promise<void> | null { return null }

    public getEmbedTemplate(context: Message | Interaction, data?: MessageEmbedOptions): MessageEmbed {
        const member = <GuildMember>context.member;
        return new MessageEmbed(data)
            .setColor(data.color || member.displayColor || 14840969);
    }
}

export interface BaseHandlerOptions {
    readonly id: string;
    readonly name: string;
    readonly group: string;
    readonly nsfw: boolean;
}
