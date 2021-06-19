import { BaseHandler } from '../classes/BaseHandler';
import { ButtonInteraction } from 'discord.js';

export interface ButtonHandler extends BaseHandler {
    onButton<T>(interaction: ButtonInteraction, customData: ButtonHandlerCustomData): Promise<T>;
}

export interface ButtonHandlerCustomData {
    readonly id: string
}

export function isButtonHandler(handler: any): handler is ButtonHandler {
    return typeof handler.onButton === 'function';
}
