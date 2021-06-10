const twemoji = require('twemoji');

class Resolver {
    static resolve(interaction, string = '', type, bot = true) {
        const { user, member, guild, client, channel } = interaction;

        if (!string.length) return {};
        if (Array.isArray(type)) {
            const resolved = type.map(typeSingle => {
                return Resolver.resolve(interaction, string, typeSingle, bot);
            }).filter(result => Object.keys(result).length)
            return resolved.length ? resolved[0] : {};
        }
        string = string.toLowerCase();
        switch (type) {
            case Resolver.EMOJI:
                const emojiDefault = twemoji.parse(string).match(/(src=\"http(s?):)([^\s])*\.(?:jpg|gif|png)/g);
                if (emojiDefault) return { emoji: string };
                const emojiCustom = string.match(/<a?:[^:]+:(\d+)>/g);
                if (emojiCustom?.length) return { emoji: emojiCustom[0] };
                break;
            case Resolver.USER:
                if (string === 'me') return { user };
                if (!guild) {
                    if (channel.recipient.tag.toLowerCase().includes(string)) return { user };
                    if (bot && client.user.tag.toLowerCase().includes(string)) return { user: client.user };
                    break;
                }
                for (let m of channel.members.values()) {
                    if (!bot && user.bot) continue;
                    const testMention = m.toString() === string;
                    const testUsername = user.tag.toLowerCase().includes(string);
                    const testDisplayName = m.displayName.toLowerCase().includes(string);
                    if (testMention || testUsername || testDisplayName) return { user: m.user };
                }
                break;
            case Resolver.MEMBER:
                if (!guild) break;
                if (string === 'me') return { member };
                for (let m of channel.members.values()) {
                    if (!bot && user.bot) continue;
                    const testMention = m.toString() === string;
                    const testUsername = user.tag.toLowerCase().includes(string);
                    const testDisplayName = m.displayName.toLowerCase().includes(string);
                    if (testMention || testUsername || testDisplayName) return { member: m };
                }
                break;
            case Resolver.ROLE:
                if (!guild) break;
                for (let role of guild.roles.cache.values()) {
                    const testName = role.name.toLowerCase().includes(string);
                    const testMention = role.toString().includes(string);
                    if (testName || testMention) return { role };
                }
                break;
        }
        return {};
    }
}

Resolver.ROLE = 'role';
Resolver.USER = 'user';
Resolver.EMOJI = 'emoji';
Resolver.MEMBER = 'member';

module.exports = Resolver;
