import { Client, Collection, ActivityType, ApplicationCommandOptionType, Interaction, GatewayIntentBits, Partials, Events, EmbedBuilder } from 'discord.js';
import { connect } from 'mongoose';
import { glob as Glob } from 'glob';

const { fromString, getCompilers } = require('wandbox-api-updated');
const glob = require('util').promisify(Glob);

type CommandOptions = {
	default: {
		name: string;
		description: string;
		type: number;
		run: Function;
	};
}

type ContactEmbeds = {
	main: EmbedBuilder;
	request: EmbedBuilder;
}

type CompileEmbeds = {
	output: Function;
	outputError: Function;
	error: Function;
	compileError: Function;
}

export default class BaseClient extends Client {
	commands: Collection<unknown, unknown>;

	constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildEmojisAndStickers,
				GatewayIntentBits.GuildPresences,
				GatewayIntentBits.DirectMessages,
			],
			partials: [
				Partials.Channel,
				Partials.Reaction,
				Partials.User,
			],
		});

		this.commands = new Collection();

		void connect(process.env.mongoKey as string);

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

			(await glob(process.cwd() + '/src/commands/**/*.ts')).map(async (value: string) => {
				const directory: string = value.split('/')[value.split('/').length - 2],
					command: CommandOptions = require(value);

				commands.push(command.default);
				this.commands.set(command.default.name, { directory, ...command.default });
			});

			this.once(Events.ClientReady, async () =>
				await this.application?.commands.set(commands).then(async () =>
					console.log('Online.'),
				),
			);

			this.on(Events.InteractionCreate, async (interaction: Interaction) => {
				if (interaction.isChatInputCommand()) {
					const command: any = this.commands.get(interaction.commandName),
						args: any[] = [];

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

				if (interaction.isModalSubmit()) {
					if (interaction.customId === 'modal-contact') {
						const message: string = interaction.fields.getTextInputValue('message-input'),
							embeds: ContactEmbeds = {
								main: new EmbedBuilder()
									.setTitle('Successfully Sent')
									.setDescription('Your message has been successfully sent to the owner.')
									.setColor(0x4b9cd3)
									.setTimestamp()
									.setFooter({ text: 'Request sent', iconURL: interaction.user.displayAvatarURL({ extension: 'png' }), }),
								request: new EmbedBuilder()
									.setTitle('New Message')
									.addFields(
										{ name: 'Message', value: message },
									)
									.setTimestamp()
									.setColor(0x4b9cd3)
									.setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: 'png' }), }),
							};

						await interaction.deferReply({ ephemeral: true });
						await interaction.editReply({ embeds: [embeds.main] });
						this.users.cache.get('893211748767768606')?.send({ embeds: [embeds.request] });
					}

					if (interaction.customId === 'modal-compile') {
						const language: string = interaction.fields.getTextInputValue('language-input'),
							code: string = interaction.fields.getTextInputValue('code-input'),
							embeds: CompileEmbeds = {
								output: (output: string, languageType: string) =>
									new EmbedBuilder()
										.setTitle('Compiled Code')
										.setDescription('Compiled and evaluated successfully\n```' + languageType + '```')
										.addFields(
											{ name: 'Compiled Input', value: '```' + language + '\n' + code + '\n```', inline: true },
											{ name: 'Compiled Output', value: '```' + (output ? language : '') + '\n' + (output ? output : 'No output was received while evaluating.') + '\n```' },
										)
										.setColor(0x4b9cd3)
										.setTimestamp()
										.setFooter({ text: 'Compilied', iconURL: interaction.user.displayAvatarURL({ extension: 'png' }), }),
								outputError: (outputError: string, languageType: string) =>
									new EmbedBuilder()
										.setTitle('Compiling Error')
										.setDescription('There was an error in your given code.\n```' + languageType + '```')
										.addFields(
											{ name: 'Compiled Input', value: '```' + language + '\n' + code + '\n```', inline: true },
											{ name: 'Compiling Error', value: '```' + outputError + '\n```' },
										)
										.setColor(0xfa5f55)
										.setTimestamp()
										.setFooter({ text: 'Error', iconURL: interaction.user.displayAvatarURL({ extension: 'png' }), }),
								error: (errorMessage: string) =>
									new EmbedBuilder()
										.setDescription(errorMessage + ' View all of the [availabe languages here](https://github.com/srz-zumix/wandbox-api#cli).\nIn addition, try not to use aliases. (`py` > `python`)')
										.setColor(0xfa5f55),
								compileError: (errorMessage: string) =>
									new EmbedBuilder()
										.setDescription(errorMessage + ' Try pressing the `Insert Code` button to try again.')
										.setColor(0xfa5f55),
							};

						let languageInput: string = language,
							languageVersion: string;

						await interaction.deferUpdate();

						if (language.toLowerCase().startsWith('node')) languageInput = 'javascript';

						getCompilers(languageInput).then((input: any[]) => {
							languageVersion = input[0].name;
							fromString({
								code,
								compiler: languageVersion,
							}).then(async (output: any) => {
								if (output.program_error !== '') return await interaction.editReply({ embeds: [embeds.outputError(output.program_error, languageVersion)] });
								await interaction.editReply({ embeds: [embeds.output(output.program_output, languageVersion)] });
							}).catch(async (error: string) => await interaction.followUp({ embeds: [embeds.compileError(error)], ephemeral: true }));
						}).catch(async (error: string) => await interaction.followUp({ embeds: [embeds.error(error)], ephemeral: true }));
					}
				}
			});
		});
	}
}
