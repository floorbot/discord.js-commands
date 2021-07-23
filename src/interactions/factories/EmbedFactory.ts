import { MessageEmbed, MessageEmbedOptions, InteractionReplyOptions, Message, GuildMember } from 'discord.js'
import { BaseFactory, BaseHandler, HandlerContext } from '../..';

export class EmbedFactory<H extends BaseHandler> extends BaseFactory<H> {

    constructor(handler: H) {
        super(handler);
    }

    public getEmbedTemplate(context: HandlerContext, data?: MessageEmbed | MessageEmbedOptions): HandlerEmbed {
        const embed = new HandlerEmbed(context, data);
        const { member } = context;
        const user = context instanceof Message ? context.author : context.user;
        if (member && member instanceof GuildMember) {
            embed.setAuthor(member.displayName, user.displayAvatarURL());
            embed.setColor(member.displayColor || 14840969);
        } else {
            embed.setAuthor(user.username, user.displayAvatarURL());
            embed.setColor(14840969);
        }
        return embed;
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
