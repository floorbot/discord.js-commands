import { ComponentCustomData } from '../classes/CommandClient';
import { BaseHandler } from '../classes/BaseHandler';
import { SelectMenuInteraction } from 'discord.js';

export interface SelectMenuHandler extends BaseHandler {
    onSelectMenu<T extends ComponentCustomData, R>(interaction: SelectMenuInteraction, customData: T): Promise<R>;
}
