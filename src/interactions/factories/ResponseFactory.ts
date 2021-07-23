import { MessageEmbed, MessageEmbedOptions, InteractionReplyOptions, CommandInteraction, ButtonInteraction, SelectMenuInteraction } from 'discord.js'
import { BaseFactory, BaseHandler, HandlerContext } from '../..';

export class ResponseFactory<H extends BaseHandler> extends BaseFactory<H> {

    constructor(handler: H) {
        super(handler);
    }

    protected getContextName(context: HandlerContext) {
        switch (true) {
            case context instanceof CommandInteraction: return 'command';
            case context instanceof ButtonInteraction: return 'button';
            case context instanceof SelectMenuInteraction: return 'select menu';
            default: throw context;
        }
    }

    public getHandlerErrorResponse(context: HandlerContext): InteractionReplyOptions {
        return new HandlerEmbed(context)
            .setDescription([
                `Sorry! I seem to have run into an issue with \`/${this.handler.id}\``,
                `*The error has been reported and will be fixed!*`
            ].join('\n')).toReplyOptions(false);
    }

    public getHandlerDisabledResponse(context: HandlerContext): InteractionReplyOptions {
        const type = this.getContextName(context);
        return new HandlerEmbed(context).setDescription([
            `Sorry! It looks like \`/${this.handler.id}\` \`${type}\`s are currently disabled`,
            `*If this is wrong please be patient and try again later!*`
        ].join('\n')).toReplyOptions(true);
    }

    public getHandlerNSFWResponse(context: HandlerContext): InteractionReplyOptions {
        return new HandlerEmbed(context)
            .setDescription(`*Sorry! \`/${this.handler.id}\` commands can only be used in \`NSFW\` channels*`)
            .toReplyOptions(true);
    }
}

export class HandlerEmbed extends MessageEmbed {

    public readonly context: HandlerContext;

    constructor(context: HandlerContext, data?: MessageEmbed | MessageEmbedOptions) {
        super(data);
        this.context = context;
    }

    public toReplyOptions(ephemeral?: boolean): InteractionReplyOptions {
        return { embeds: [this], ephemeral: ephemeral ?? false }
    }
}
