import { BaseHandler, HandlerResult, HandlerCustomData } from '../..';
import { SelectMenuInteraction } from 'discord.js';

export interface SelectMenuHandler<T extends HandlerCustomData> extends BaseHandler {
    onSelectMenu(interaction: SelectMenuInteraction, customData: T): Promise<HandlerResult | null>;
    encodeSelectMenu(customData: T): string
    decodeSelectMenu(customID: string): T
}
