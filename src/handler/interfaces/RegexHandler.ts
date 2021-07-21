import { BaseHandler, HandlerResult } from '../..';
import { Message } from 'discord.js';

export interface RegexHandler extends BaseHandler {

    readonly regex: RegExp;
    readonly nsfw: boolean;

    onRegex(message: Message, match: string): Promise<HandlerResult | null | any>;
}
