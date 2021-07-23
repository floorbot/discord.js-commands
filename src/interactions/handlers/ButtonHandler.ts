import { BaseHandler, HandlerResult, HandlerCustomData, ButtonFactory } from '../..';
import { ButtonInteraction } from 'discord.js';

export interface ButtonHandler<T extends HandlerCustomData> extends BaseHandler {

    readonly buttonFactory: ButtonFactory<T, ButtonHandler<T>>

    onButton(interaction: ButtonInteraction, customData: T): Promise<HandlerResult | null | any>;
}
