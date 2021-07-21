import { BaseHandler, HandlerResult } from '../BaseHandler';
import { Message } from 'discord.js';

export interface RegexHandler extends BaseHandler {

    readonly regex: RegExp;

    onRegex(message: Message, match: string): Promise<HandlerResult | null>;
}
