import { BaseHandler, HandlerResult, HandlerCustomData } from '../..';
import { MessageComponentInteraction } from 'discord.js';

export interface ComponentHandler<T extends HandlerCustomData> extends BaseHandler {
    onComponent(interaction: MessageComponentInteraction, customData: T): Promise<HandlerResult | null | any>;
    decodeComponent(customString: string): T;
    encodeComponent(customData: T): string;
}
