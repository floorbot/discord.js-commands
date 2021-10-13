import { Message, BaseCommandInteraction, MessageComponentInteraction, Interaction, Util } from 'discord.js';
import { CommandHandler, ComponentHandler, RegexHandler, HandlerEmbed } from '..';
import { CommandClient } from '../discord/CommandClient';

export interface HandlerOptions {
    readonly nsfw?: boolean;
    readonly id: string;
}

export interface JsonArray extends Array<string | number | boolean | null | undefined | Json | JsonArray> { }
export interface Json { [x: string]: string | number | boolean | null | undefined | Json | JsonArray }
export interface HandlerCustomData extends Json { wl?: string }
export interface HandlerResult { message?: string; }

export type HandlerContext = BaseCommandInteraction | MessageComponentInteraction | Message;

export class BaseHandler {

    public readonly nsfw: boolean;
    public readonly id: string;

    constructor(options: HandlerOptions) {
        this.nsfw = options.nsfw ?? false;
        this.id = options.id;
    }

    public async initialise(_client: CommandClient): Promise<HandlerResult | any> { return null }
    public async finalise(_client: CommandClient): Promise<HandlerResult | any> { return null }
    public async setup(_client: CommandClient): Promise<HandlerResult | any> { return null }

    public isComponentHandler(): this is ComponentHandler<HandlerCustomData> { return 'onComponent' in this }
    public isBaseCommandHandler(): this is CommandHandler { return 'onCommand' in this }
    public isRegexHandler(): this is RegexHandler { return 'onRegex' in this }

    public onError(context: HandlerContext, _customData?: HandlerCustomData) {
        const type = Util.resolveContextName(context);
        const response = new HandlerEmbed().setContextAuthor(context).setDescription([
            `Sorry! I seem to have run into an issue with your \`${this.id} ${type}\``,
            `*The error has been reported and will be fixed in the future!*`
        ].join('\n')).toReplyOptions(false);
        return context instanceof Interaction ? context.followUp(response) : context.reply(response);
    }

    public onNSFW(context: HandlerContext, _customData?: HandlerCustomData) {
        const type = Util.resolveContextName(context);
        const response = new HandlerEmbed().setContextAuthor(context).setDescription([
            `Sorry! This \`/${this.id} ${type}\` can only be used in \`NSFW\` channels 😏`,
            '*Try a different channel or make this one NSFW if it is appropriate!*'
        ].join('\n')).toReplyOptions(true);
        return context instanceof Interaction ? context.followUp(response) : context.reply(response);
    }
}
