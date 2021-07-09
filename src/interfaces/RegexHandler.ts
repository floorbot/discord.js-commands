import { Message } from 'discord.js';

export interface RegexHandler {

    readonly regex: RegExp;

    onRegex<T>(message: Message, match: String): Promise<T>;
}
