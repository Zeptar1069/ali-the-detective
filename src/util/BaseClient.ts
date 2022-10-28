import { Client, Collection, ActivityType, ApplicationCommandOptionType, Interaction } from 'discord.js';
import { glob as Glob } from 'glob';
const glob = require('util').promisify(Glob);

export default class BaseClient extends Client {
	commands: Collection<unknown, unknown>;

	constructor() {
		super({ intents: [32767] });

		this.commands = new Collection();

		void this.login(process.env.token).then(async () => {
			this.user?.setPresence({
				activities: [
					{
						name: 'for /help',
						type: ActivityType.Watching,
					},
				],
				status: 'idle',
			});

			const commands: any[] = [];

			(await glob(process.cwd() + '/src/commands/**/*.ts')).map(async (value: any) => {
				const directory = value.split('/')[value.split('/').length - 2];
				const command = require(value);

				commands.push(command.default);
				this.commands.set(command.default.name, { directory, ...command.default });
			});

			this.once('ready', async () =>
				await this.application?.commands.set(commands).then(async () =>
					console.log('Online.'),
				),
			);

			this.on('interactionCreate', async (interaction: Interaction) => {
				if (interaction.isChatInputCommand()) {
					await interaction.deferReply({ ephemeral: false });

					const command: any = this.commands.get(interaction.commandName);
					const args: any[] = [];

					if (!command) return;

					for (const option of interaction.options.data) {
						if (option.type === ApplicationCommandOptionType.Subcommand) {
							option.name
								? args.push(option.name)
								: void option.options?.forEach(
									async (value: any) => {
										if (value.value) {
											args.push(value.value);
										}
									},
								);
						} else if (option.value) {
							args.push(option.value);
						}
					}

					await command.run(this, interaction, args);
				}
			});
		});
	}
}
