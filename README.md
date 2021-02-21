# discord.js-commands

A small library for discord.js to add command uniformity with interactions

#### Installation

```bash
npm install git://github.com/floorbot-js/discord.js-commands
```

#### Example

```js
const Discord = require('discord.js-commands')(require('discord.js'));
const client = new Discord.Client({
    token: '<bot token>',
    publicKey: '<bot public key>',

    commands: {
        ping: {
            class: class extends Discord {
                constructor(client) {
                    super(client, {
                        json: { name: 'ping', description: 'pong' },
                        responses: { 200: (interaction, options) => interaction.reply('pong!') }
                    })
                }

                execute(interaction) { return this.respond[200](interaction) }
            }
        }
    }
});

client.once('ready', () => {
    client.registerCommand(command, false); // true will update/post to discord
})

client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`));
client.login('<bot token>');
```

#### Disclaimer

This is still a work in progress...
The only support discord.js currently has for interactions is a draft PR ([#5106](https://github.com/discordjs/discord.js/pull/5106)) which comes with all sorts of errors and issues.
To solve the current issues that cause this package to break use the #interactions branch from this [fork of the PR](https://github.com/floorbot-js/discord.js/tree/interactions).
