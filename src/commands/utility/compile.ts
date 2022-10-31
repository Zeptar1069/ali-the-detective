import BaseClient from '../../util/BaseClient';
import { ApplicationCommandType, CommandInteraction, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
const { fromString } = require('wandbox-api-updated');

export default {
	name: 'compile',
	description: 'A safe, simple code compiler evaluation',
	type: ApplicationCommandType.ChatInput,
	run: async (client: BaseClient, interaction: CommandInteraction, args: string[]) => {
		await interaction.deferReply({ ephemeral: false });

		const components: any = {
			component1: new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId('code')
					.setLabel('Insert Code')
					.setStyle(2)
					.setEmoji({
						id: '1036058059719589928'
					}),
			),
		},

			embeds: any = {
				main: new EmbedBuilder()
					.setTitle('Compile Code')
					.setDescription('To insert code, click the insert code button below. You can keep inserting code multiple times.')
					.setColor(0x4b9cd3)
					.setFooter({ text: 'Setting up', iconURL: interaction.user.displayAvatarURL({ extension: 'png' }) })
					.setTimestamp(),
				fail: new EmbedBuilder()
						.setDescription(
							'This interaction is\'nt for you. Try making your own interaction by using the </compile:0> command.',
						)
						.setColor(0xfa5f55),
			},

			msg = await interaction.followUp({ embeds: [embeds.main], components: [components.component1] }),

			collectors: any = {
				collector1: msg.createMessageComponentCollector({
					componentType: ComponentType.Button,
					time: 40000,
				}),
			};

		collectors.collector1.on('collect', async (i: any) => {
			if (i.user.id !== interaction.user.id) {
				return await i.followUp({
					embeds: [embeds.fail(i)],
					ephemeral: true,
				});
			}

			collectors.collector1.resetTimer();
			if(i.customId === 'code') {
				const modal = new ModalBuilder()
						.setCustomId('modal-compile')
						.setTitle('Compile Code'),

					inputs = {
						language: new TextInputBuilder()
							.setCustomId('language-input')
							.setLabel('Programming Language')
							.setPlaceholder('Javascript')
							.setStyle(TextInputStyle.Short)
							.setMaxLength(20)
							.setRequired(true),
						code: new TextInputBuilder()
							.setCustomId('code-input')
							.setLabel('Code')
							.setPlaceholder('Type your code to evaluate here')
							.setStyle(TextInputStyle.Paragraph)
							.setRequired(true),
					};

				modal.addComponents([(new ActionRowBuilder().addComponents(
					inputs.language,
				) as any), (new ActionRowBuilder().addComponents(
					inputs.code,
				)) as any]);
				await i.showModal(modal);
			}
		});
	},
};
