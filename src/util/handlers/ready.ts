import { Events } from 'discord.js';
import { glob as Glob } from 'glob';
import BaseClient from '../BaseClient';

const glob = require('util').promisify(Glob);

const commands: any[] = [];

type CommandOptions = {
	default: {
		name: string;
		description: string;
		type: number;
		run: Function;
	};
}

export default async function ready(client: BaseClient) {
	(await glob(process.cwd() + '/src/commands/**/*.ts')).map(async (value: string) => {
		const directory: string = value.split('/')[value.split('/').length - 2],
			command: CommandOptions = require(value);

		commands.push(command.default);
		client.commands.set(command.default.name, { directory, id: '', ...command.default });
	});

	client.once(Events.ClientReady, async () =>
		await client.application?.commands.set(commands).then(async () => {
			(await client.application?.commands.fetch())?.toJSON().map((cmd) => {
				(client.commands.get(cmd.name) as any).id = cmd.id;
			});

			console.log('Online.');
		}),
	);
}