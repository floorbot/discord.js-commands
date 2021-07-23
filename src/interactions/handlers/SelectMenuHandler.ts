import { BaseHandler, HandlerResult, HandlerCustomData, SelectMenuFactory } from '../..';
import { SelectMenuInteraction } from 'discord.js';

export interface SelectMenuHandler<T extends HandlerCustomData> extends BaseHandler {

    readonly selectMenuFactory: SelectMenuFactory<T, SelectMenuHandler<T>>

    onSelectMenu(interaction: SelectMenuInteraction, customData: T): Promise<HandlerResult | null | any>;
}
