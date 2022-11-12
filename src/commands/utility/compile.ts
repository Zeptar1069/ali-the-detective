import BaseClient from '../../util/BaseClient';
import { ApplicationCommandType, CommandInteraction, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle, Message, InteractionCollector, ButtonInteraction, CacheType } from 'discord.js';

export default {
	name: 'compile',
	description: 'A safe, simple code compiler evaluation',
	type: ApplicationCommandType.ChatInput,
	run: async (_client: BaseClient, interaction: CommandInteraction, _args: string[]) => {
		/* Types */
		type Components = {
			component1: any;
		};

		type Embeds = {
			main: EmbedBuilder;
			fail: EmbedBuilder;
		};

		type Collectors = {
			collector1: InteractionCollector<ButtonInteraction<CacheType>>;
		}

		type Inputs = {
			language: TextInputBuilder;
			code: TextInputBuilder;
		}

		/* Interaction */
		await interaction.deferReply({ ephemeral: false });

		const components: Components = {
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

			embeds: Embeds = {
				main: new EmbedBuilder()
					.setTitle('Compile Code')
					.setDescription('To insert code, click the insert code button below. You can keep inserting code multiple times.')
					.setColor(0x4b9cd3)
					.setFooter({
						text: interaction.user.username,
						iconURL: interaction.user.displayAvatarURL({ extension: 'png' }),
					})
					.setTimestamp(),
				fail: new EmbedBuilder()
					.setDescription(
						'This interaction is\'nt for you. Try making your own interaction by using the </compile:0> command.',
					)
					.setColor(0xfa5f55),
			},

			msg: Message = await interaction.followUp({ embeds: [embeds.main], components: [components.component1] }),

			collectors: Collectors = {
				collector1: msg.createMessageComponentCollector({
					componentType: ComponentType.Button,
				}),
			};

		collectors.collector1.on('collect', async (i: any) => {
			if (i.user.id !== interaction.user.id) {
				return await i.followUp({
					embeds: [embeds.fail],
					ephemeral: true,
				});
			}

			if (i.customId === 'code') {
				const modal: ModalBuilder = new ModalBuilder()
					.setCustomId('modal-compile')
					.setTitle('Compile Code'),

					inputs: Inputs = {
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
					},

					actionRows: any = {
						first: new ActionRowBuilder().addComponents(
							inputs.language,
						),
						second: new ActionRowBuilder().addComponents(
							inputs.code,
						)
					};

				modal.addComponents(actionRows.first, actionRows.second);
				await i.showModal(modal);
			}
		});
	},
};
