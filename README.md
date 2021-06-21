# discord.js-commands

A small library for discord.js to add command uniformity with interactions

#### Installation

```bash
npm install github:floorbot/discord.js-commands
```

#### Example

```ts
import { CommandClient } from 'discord.js-commands';

const client = new CommandClient({
    intents: Discord.Intents.ALL,
    handlers: /** TODO EXAMPLES **/
});

client.on('log', (string, object) => { console.log(string, object || '') });
client.login('<bot token>');
```

#### Disclaimer

This is still a work in progress...
discord.js does not officially support a lot of the latest discord features. This has resulted in using various frequently changing draft pull requests.
This also means the discord.js dependency changes at a moments notice and will keep changing until these features are officially implemented.
