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

			(await glob(process.cwd() + '/src/commands/**/*.ts')).map((value: string) => {
					const splitted = value.split('/');
					const directory = splitted[splitted.length - 2];
					const command = require(value);
					this.commands.set(command.default.name, { directory, ...command.default });
					commands.push(command.default);
				},
			);

			this.on('ready', async () => {
				await this.application?.commands.set(commands);
			});

			this.on('interactionCreate', async (interaction: Interaction) => {
				if (interaction.isChatInputCommand()) {
					await interaction.deferReply({ ephemeral: false });

					const command = this.commands.get(interaction.commandName);
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

					await (command as any).run(this, interaction, args);
				}
			});
		});
	}
};
