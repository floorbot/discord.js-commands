import { MessageButton, MessageButtonOptions, MessageActionRow } from 'discord.js';
import { ButtonHandler, HandlerCustomData, BaseFactory } from '../..';

export class ButtonFactory<T extends HandlerCustomData, H extends ButtonHandler<T>> extends BaseFactory<H> {

    constructor(handler: H) {
        super(handler);
    }

    public encode(customData: T): string { return JSON.stringify(customData); }
    public decode(customString: string): T { return JSON.parse(customString); }
}

export class HandlerButton<T extends HandlerCustomData, H extends ButtonHandler<T>> extends MessageButton {

    public readonly handler: H;

    constructor(handler: H, data?: MessageButton | MessageButtonOptions) {
        super(data);
        this.handler = handler;
    }

    public override setCustomId(data: string | T): this {
        if (typeof data === 'string') return super.setCustomId(data);
        return super.setCustomId(`${this.handler.id}-${this.handler.buttonFactory.encode(data)}`);
    }

    public toActionRow(): MessageActionRow {
        return new MessageActionRow().addComponents(this)
    }
}
