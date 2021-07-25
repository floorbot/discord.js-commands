import { MessageButton, MessageButtonOptions, MessageActionRow } from 'discord.js';
import { ButtonHandler, HandlerCustomData } from '../..';

export class HandlerButton<T extends HandlerCustomData> extends MessageButton {

    public readonly handler: ButtonHandler<T>;

    constructor(handler: ButtonHandler<T>, data?: MessageButton | MessageButtonOptions) {
        super(data);
        this.handler = handler;
    }

    public override setCustomId(data: string | T): this {
        if (typeof data === 'string') return super.setCustomId(data);
        return super.setCustomId(`${this.handler.id}-${this.handler.encodeButton(data)}`);
    }

    public toActionRow(): MessageActionRow {
        return new MessageActionRow().addComponents(this)
    }
}
