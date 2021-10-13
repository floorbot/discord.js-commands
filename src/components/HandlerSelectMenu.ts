import { MessageSelectMenu, MessageSelectMenuOptions, MessageActionRow } from 'discord.js';
import { ComponentHandler, HandlerCustomData } from '../..';

export class HandlerSelectMenu<T extends HandlerCustomData> extends MessageSelectMenu {

    public readonly handler: ComponentHandler<T>;

    constructor(handler: ComponentHandler<T>, data?: MessageSelectMenu | MessageSelectMenuOptions) {
        super(data);
        this.handler = handler;
    };

    public override setCustomId(data: string | T): this {
        if (typeof data === 'string') return super.setCustomId(data);
        return super.setCustomId(`${this.handler.id}-${this.handler.encodeComponent(data)}`);
    }

    public toActionRow(): MessageActionRow {
        return new MessageActionRow().addComponents(this)
    }
}
