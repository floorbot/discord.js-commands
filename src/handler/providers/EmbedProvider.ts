import { MessageEmbed, MessageEmbedOptions, Message, GuildMember, InteractionReplyOptions } from 'discord.js'
import { BaseHandler, HandlerContext } from '../BaseHandler';

export class EmbedProvider extends MessageEmbed {

    constructor(context: HandlerContext, data?: MessageEmbed | MessageEmbedOptions) {
        super(data);
        const { member } = context;
        const user = context instanceof Message ? context.author : context.user;
        if (member && member instanceof GuildMember) {
            this.setAuthor(member.displayName, user.displayAvatarURL());
            this.setColor(member.displayColor || 14840969);
        } else {
            this.setAuthor(user.username, user.displayAvatarURL());
            this.setColor(14840969);
        }
    }

    public static getErrorEmbed(context: HandlerContext, handler: BaseHandler): EmbedProvider {
        return new EmbedProvider(context)
            .setDescription([
                `Sorry! I seem to have run into an issue with \`/${handler.id}\` 😵`,
                `*The error has been reported and will be fixed!*`
            ].join('\n'));
    }

    public static getNSFWEmbed(handler: BaseHandler, context: HandlerContext): EmbedProvider {
        return new EmbedProvider(context)
            .setDescription(`*Sorry! \`/${handler.id}\` commands can only be used in \`NSFW\` channels 😏*`);
    }

    public toReplyOptions(ephemeral?: boolean): InteractionReplyOptions {
        return { embeds: [this], ephemeral: ephemeral ?? false }
    }
}
