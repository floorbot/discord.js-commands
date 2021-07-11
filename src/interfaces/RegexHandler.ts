import { BaseHandler } from '../classes/BaseHandler';
import { Message } from 'discord.js';

export interface RegexHandler extends BaseHandler {

    readonly regex: RegExp;

    onRegex<T>(message: Message, match: String): Promise<T>;
}
