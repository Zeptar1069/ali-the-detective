import { Interaction, Events, ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import BaseClient from '../BaseClient';
const { fromString, getCompilers } = require('wandbox-api-updated');

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

export default async function interaction(client: BaseClient) {
	client.on(Events.InteractionCreate, async (interaction: Interaction) => {
		if (interaction.isChatInputCommand()) {
			const command: any = client.commands.get(interaction.commandName),
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

			await command.run(client, interaction, args);
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
				client.users.cache.get('893211748767768606')?.send({ embeds: [embeds.request] });
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
								.setDescription(errorMessage + '. Try pressing the `Insert Code` button to try again.')
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
}