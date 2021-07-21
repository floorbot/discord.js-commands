import { BaseHandler, HandlerResult, HandlerCustomData } from '../..';
import { SelectMenuInteraction } from 'discord.js';

export interface SelectMenuHandler<T extends HandlerCustomData> extends BaseHandler {

    onSelectMenu(interaction: SelectMenuInteraction, customData: T): Promise<HandlerResult | null | any>;
    encodeSelectMenu(customData: T): string
    decodeSelectMenu(customId: string): T
}
