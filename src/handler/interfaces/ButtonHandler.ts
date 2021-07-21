import { BaseHandler, HandlerResult, HandlerCustomData } from '../BaseHandler';
import { ButtonInteraction } from 'discord.js'

export interface ButtonHandler<T extends HandlerCustomData> extends BaseHandler {
    onButton(interaction: ButtonInteraction, customData: T): Promise<HandlerResult | null>;
    encodeButton(customData: T): string
    decodeButton(customID: string): T
}
