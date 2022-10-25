const {
	Client,
	Collection,
	ActivityType,
	ApplicationCommandOptionType,
} = require('discord.js');
const glob = require('util').promisify(require('glob').glob);

module.exports = class Basethis extends Client {
	constructor() {
		super({ intents: [32767] });

		this.commands = new Collection();

		void this.login(process.env.token).then(async () => {
			this.user.setPresence({
				activities: [
					{
						name: 'for /help',
						type: ActivityType.Watching,
					},
				],
				status: 'idle',
			});

			const commands = [];

			(await glob(process.cwd() + '/src/commands/**/*.js')).map(
				(value) => {
					const splitted = value.split('/');
					const directory = splitted[splitted.length - 2];
					const command = require(value);
					this.commands.set(command.name, { directory, ...command });
					commands.push(command);
				},
			);

			this.on(
				'ready',
				async () => await this.application.commands.set(commands),
			);

			this.on('interactionCreate', async (interaction) => {
				if (interaction.isChatInputCommand()) {
					await interaction.deferReply({ ephemeral: false });
					const command = this.commands.get(interaction.commandName);
					if (!command) {
						return;
					}
					const args = [];
					for (const option of interaction.options.data) {
						if (
							option.type ===
							ApplicationCommandOptionType.Subcommand
						) {
							option.name
								? args.push(option.name)
								: void option.options?.forEach(
									async (value) => {
										if (value.value) {
											args.push(value.value);
										}
									},
								);
						}
						else if (option.value) {
							args.push(option.value);
						}
					}
					await command.run(this, interaction, args);
				}
			});
		});
	}
};
