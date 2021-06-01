# discord.js-commands

A small library for discord.js to add command uniformity with interactions

#### Installation

```bash
npm install github:floorbot-js/discord.js-commands
```

#### Example

```js
const Discord = require('discord.js-commands')(require('discord.js'));
const client = new Discord.Client({
    token: '<bot token>',
    publicKey: '<bot public key>',

    handlers: {
        tasks: [ /** TODO EXAMPLES **/ ],
        commands: [ /** TODO EXAMPLES **/ ],
        components: [ /** TODO EXAMPLES **/ ],
        regexes: [ /** TODO EXAMPLES **/ ]
    }
});

client.on('log', (string, object) => { console.log(string, object) })
client.on('ready', () => client.emit('log', `[SETUP] Logged in as <${client.user.tag}>`));
client.login();
```

#### Disclaimer

This is still a work in progress...
discord.js does not officially support a lot of the lastest discord features. This has resulted in using various frequently changing draft pull requests.
This also means the discord.js dependency changes at a moments notice and will keep changing until these features are officially implemented.
