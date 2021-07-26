import { Message, CommandInteraction, ButtonInteraction, SelectMenuInteraction, InteractionReplyOptions, Util } from 'discord.js';
import { CommandHandler, ButtonHandler, SelectMenuHandler, RegexHandler, HandlerEmbed } from '..';
import { CommandClient } from '../discord/CommandClient';

export interface HandlerOptions {
    readonly nsfw?: boolean;
    readonly id: string;
}

export interface JsonArray extends Array<string | number | boolean | null | undefined | Json | JsonArray> { }
export interface Json { [x: string]: string | number | boolean | null | undefined | Json | JsonArray }
export interface HandlerCustomData extends Json { wl?: string }
export interface HandlerResult { message?: string; }

export type HandlerContext = CommandInteraction | ButtonInteraction | SelectMenuInteraction | Message;

export class BaseHandler {

    public readonly nsfw: boolean;
    public readonly id: string;

    constructor(options: HandlerOptions) {
        this.nsfw = options.nsfw ?? false;
        this.id = options.id;
    }

    public async isEnabled(_context: HandlerContext, _customData?: HandlerCustomData): Promise<boolean> { return true; }
    public async isAuthorised(_context: HandlerContext, _customData?: HandlerCustomData): Promise<string[]> { return [] }
    public async isWhitelisted(context: HandlerContext, customData?: HandlerCustomData): Promise<boolean> {
        return (context.member ?.user ?.id === customData ?.wl) || true
    }

    public async initialise(_client: CommandClient): Promise<HandlerResult | any> { return null }
    public async finalise(_client: CommandClient): Promise<HandlerResult | any> { return null }
    public async setup(_client: CommandClient): Promise<HandlerResult | any> { return null }

    public isSelectMenuHandler(): this is SelectMenuHandler<HandlerCustomData> { return 'onSelectMenu' in this }
    public isButtonHandler(): this is ButtonHandler<HandlerCustomData> { return 'onButton' in this }
    public isCommandHandler(): this is CommandHandler { return 'onCommand' in this }
    public isRegexHandler(): this is RegexHandler { return 'onRegex' in this }

    protected getContextName(context: HandlerContext) {
        switch (true) {
            case context instanceof CommandInteraction: return 'command';
            case context instanceof ButtonInteraction: return 'button';
            case context instanceof SelectMenuInteraction: return 'select menu';
            default: throw context;
        }
    }

    public getHandlerDisabledResponse(context: HandlerContext, _customData?: HandlerCustomData): InteractionReplyOptions {
        const type = this.getContextName(context);
        return new HandlerEmbed().setContextAuthor(context).setDescription([
            `Sorry! It looks like \`/${this.id} ${type}\`s are currently disabled`,
            `*If this is wrong please be patient and try again later!*`
        ].join('\n')).toReplyOptions(true);
    }

    public getWhitelistedResponse(context: HandlerContext, _customData?: HandlerCustomData): InteractionReplyOptions {
        const type = this.getContextName(context);
        return new HandlerEmbed().setContextAuthor(context).setDescription([
            `Sorry! It seems you are not able to use this specific \`${this.id} ${type}\``,
            `*If possible please try create one of your own to use*`
        ].join('\n')).toReplyOptions(false);
    }

    public getUnauthorisedResponse(context: HandlerContext, missing: string[], _customData?: HandlerCustomData): InteractionReplyOptions {
        const type = this.getContextName(context);
        return new HandlerEmbed().setContextAuthor(context).setDescription([
            `Sorry! It seems you are not allowed to use that ${this.id} ${type}`,
            `*It appears you are missing \`${missing.map(miss => Util.capitalizeString(miss)).join('\`, \`').replace(/, ([^,]*)$/, ' or \`$1')}\`*`
        ].join('\n')).toReplyOptions(false);
    }

    public getHandlerErrorResponse(context: HandlerContext, _customData?: HandlerCustomData): InteractionReplyOptions {
        const type = this.getContextName(context);
        return new HandlerEmbed().setContextAuthor(context).setDescription([
            `Sorry! I seem to have run into an issue with your \`${this.id} ${type}\``,
            `*The error has been reported and will be fixed in the future!*`
        ].join('\n')).toReplyOptions(false);
    }

    public getHandlerNSFWResponse(context: HandlerContext, _customData?: HandlerCustomData): InteractionReplyOptions {
        const type = this.getContextName(context);
        return new HandlerEmbed().setContextAuthor(context).setDescription([
            `Sorry! This \`/${this.id} ${type}\` can only be used in \`NSFW\` channels 😏`,
            '*Try a different channel or make this one NSFW if it is appropriate!*'
        ].join('\n')).toReplyOptions(true);
    }
}
