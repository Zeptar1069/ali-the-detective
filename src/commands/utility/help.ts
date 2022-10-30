import BaseClient from '../../util/BaseClient';
import {
	CommandInteraction,
	ApplicationCommandType,
	ComponentType,
	TextInputStyle,
	EmbedBuilder,
	ActionRowBuilder,
	SelectMenuBuilder,
	ButtonBuilder,
	ModalBuilder,
	TextInputBuilder
} from 'discord.js';
import ms from 'pretty-ms';

export default {
	name: 'help',
	description: 'Shows a list of commands, with a page of statistics',
	type: ApplicationCommandType.ChatInput,
	run: async (client: BaseClient, interaction: CommandInteraction, args: string[]) => {
		await interaction.deferReply({ ephemeral: false });

		const directories = [
				...new Set(client.commands.map((cmd: any) => cmd.directory)),
			],

			formatString = (str: string) => str[0].toUpperCase() + str.slice(1),
			categories = directories.map((dir: string) => {
				const getCommands = client.commands
					.filter((cmd: any) => cmd.directory === dir)
					.map((cmd: any) => {
						return {
							name: cmd.name,
							description: cmd.description,
							id: cmd.id,
						};
					});
				return {
					directory: formatString(dir),
					commands: getCommands,
				};
			}),

			components: any = {
				component1: new ActionRowBuilder().addComponents(
					new SelectMenuBuilder()
						.setCustomId('menu-help')
						.setPlaceholder('Select 1 or more categories')
						.addOptions(
							categories.map((cmd: any) => {
								return {
									label: cmd.directory,
									value: cmd.directory.toLowerCase(),
								};
							}),
						),
				),
				component2: new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('button-home')
						.setLabel('Home')
						.setStyle(2)
						.setEmoji({
							id: '1034529823143501834'
						}),
					new ButtonBuilder()
						.setCustomId('button-contact')
						.setLabel('Contact')
						.setStyle(2)
						.setEmoji({
							id: '1034529821037953055'
						}),
					new ButtonBuilder()
						.setCustomId('button-stats')
						.setLabel('Statistics')
						.setStyle(2)
						.setEmoji({
							id: '1034529819024691240'
						}),
					new ButtonBuilder()
						.setLabel('Server')
						.setStyle(5)
						.setURL('https://discord.gg/rztpkEJQcg')
						.setEmoji({
							id: '1034529816562643045'
						}),
				),
			},
        
			embeds: any = {
				menu: new EmbedBuilder()
					.setTitle('Ali The Detective')
					.addFields({
						name: 'Welcome to the world of Ali The Detective',
						value: 'Select 1 or more categories below in the dropdown menu. If you need to contact the owners, press the `contact` button below!',
					})
					.setImage('https://i.ibb.co/Hg79v5X/standard.gif')
					.setFooter({
						text: client.commands.size.toString() +
                        ' commands in total',
						iconURL: interaction.user.displayAvatarURL({ extension: 'png' }),
					})
					.setColor(0x4b9cd3)
					.setTimestamp(),
				main: (directory: string, category: any) =>
					new EmbedBuilder()
						.setTitle(formatString(directory) + ' Commands')
						.setDescription(
							category.commands.map((cmd: any) => {
								return `</${cmd.name}:0>\n<:connection:1036070328843120660> ${cmd.description}`;
							}).join('\n'),
						)
						.setFooter({
							text: category.commands.length === 1 ?
								'1 command' :
								category.commands.length + ' commands',
							iconURL: interaction.user.displayAvatarURL({ extension: 'png' }),
						})
						.setTimestamp()
						.setColor(0x4b9cd3),
				stats: new EmbedBuilder()
					.setTitle('Statistics')
					.addFields({
						name: 'Ping Latency',
						value: '```yaml\nAPI: ' +
                        client.ws.ping +
                        'ms\nMessage: ' +
                        Math.floor(
                        	Math.random() * (300 - 20) + 20,
                        ) +
                        'ms\n```',
					}, {
						name: 'Uptime',
						value: '```yaml\nStatus: Online\nUptime: ' +
                        ms((client as any).uptime) +
                        '```',
						inline: true,
					}, {
						name: 'Author',
						value: '```yaml\nName: Zeptar\nGithub: Zeptar1069```',
						inline: true,
					}, {
						name: 'Bot Status',
						value: '```yaml\n- Commands: ' +
                        client.commands.size.toString() +
                        ' commands\n- Categories: 2 categories\n- Servers: ' +
                        client.guilds.cache.size +
                        ' servers\n- Channels: ' +
                        client.channels.cache.size +
                        ' channels\n- Users: ' +
                        client.users.cache.size +
                        ' users\n```',
					}, )
					.setColor(0x4b9cd3)
					.setFooter({ text: 'Statistics', iconURL: interaction.user.displayAvatarURL({ extension: 'png' }) })
					.setTimestamp(),
				fail: (i: any) =>
					new EmbedBuilder()
						.setTitle('Interaction Failed')
						.setDescription(
							'This interaction is not for you. You can make your own interaction by using the /help command.',
						)
						.setColor(0xfa5f55)
						.setFooter({ text: 'Interaction Declined', iconURL: i.user.displayAvatarURL({ extension: 'png' }) })
						.setTimestamp(),
			},

			msg = await interaction.followUp({
				embeds: [embeds.menu],
				components: [components.component1, components.component2],
			}),

			collectors: any = {
				collector1: msg.createMessageComponentCollector({
					componentType: ComponentType.SelectMenu,
					time: 40000,
				}),
				collector2: msg.createMessageComponentCollector({
					componentType: ComponentType.Button,
					time: 30000,
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
			collectors.collector2.resetTimer();

			await i.deferUpdate();
			const [directory] = i.values;
			const category = categories.find(
				(cmd: any) => cmd.directory.toLowerCase() === directory,
			);

			await i.editReply({
				embeds: [embeds.main(directory, category)],
			});
		});

		collectors.collector2.on('collect', async (i: any) => {
			if (i.user.id !== interaction.user.id) {
				return await i.reply({
					embeds: [embeds.fail(i)],
					ephemeral: true,
				});
			}

			collectors.collector1.resetTimer();
			collectors.collector2.resetTimer();

			if (i.customId === 'button-home') {
				await i.deferUpdate();
				await i.editReply({
					embeds: [embeds.menu]
				});
			}

			if (i.customId === 'button-contact') {
				const modal = new ModalBuilder()
						.setCustomId('modal-contact')
						.setTitle('Contact'),

					inputs = {
						type: new TextInputBuilder()
							.setCustomId('type-input')
							.setLabel('Message Type')
							.setPlaceholder('Issue / Feature Request')
							.setStyle(TextInputStyle.Short)
							.setMinLength(5)
							.setMaxLength(20)
							.setRequired(true),
						message: new TextInputBuilder()
							.setCustomId('message-input')
							.setLabel('Message')
							.setPlaceholder('Type your question/issue here')
							.setStyle(TextInputStyle.Paragraph)
							.setMinLength(10)
							.setMaxLength(100)
							.setRequired(true),
					};

				modal.addComponents([(new ActionRowBuilder().addComponents(
					inputs.type,
				) as any), (new ActionRowBuilder().addComponents(
					inputs.message,
				)) as any]);
				await i.showModal(modal);
			}

			if (i.customId === 'button-stats') {
				await i.deferUpdate();
				await i
					.editReply({
						content: 'Getting ready...',
						embeds: [],
					}).then(async () =>
						setTimeout(
							async () =>
								await i.editReply({
									content: null,
									embeds: [embeds.stats],
								}),
							1000,
						), );
			}
		});

		collectors.collector1.on('end', async () => {
			components.component1.components[0].data.disabled = true;
          
			[0, 1, 2, 3].forEach((sum) => {
				components.component2.components[sum].data.disabled = true;
			});
          
			await msg.edit({
				components: [components.component1, components.component2]
			});
		});
	},
};
