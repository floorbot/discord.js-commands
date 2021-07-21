import { BaseHandler, HandlerResult, HandlerCustomData } from '../..';
import { ButtonInteraction } from 'discord.js'

export interface ButtonHandler<T extends HandlerCustomData> extends BaseHandler {
    onButton(interaction: ButtonInteraction, customData: T): Promise<HandlerResult | null | any>;
    encodeButton(customData: T): string
    decodeButton(customID: string): T
}
