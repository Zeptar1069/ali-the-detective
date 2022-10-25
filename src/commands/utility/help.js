const {
	EmbedBuilder,
	ApplicationCommandType,
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	SelectMenuBuilder,
	ButtonBuilder,
	ComponentType,
} = require('discord.js');
const ms = require('pretty-ms');

module.exports = {
	name: 'help',
	description: 'Shows a list of commands, with a page of statistics',
	type: ApplicationCommandType.ChatInput,
	run: async (client, interaction, args) => {
		const directories = [
			...new Set(client.commands.map((cmd) => cmd.directory)),
		];
		const formatString = (str) => str[0].toUpperCase() + str.slice(1);
		const categories = directories.map((dir) => {
			const getCommands = client.commands
				.filter((cmd) => cmd.directory === dir)
				.map((cmd) => {
					return {
						name: cmd.name,
						description: cmd.description,
					};
				});
			return {
				directory: formatString(dir),
				commands: getCommands,
			};
		});
		const component1 = new ActionRowBuilder().addComponents(
			new SelectMenuBuilder()
				.setCustomId('menu-help')
				.setPlaceholder('Select 1 or more categories')
				.addOptions(
					categories.map((cmd) => {
						return {
							label: cmd.directory,
							value: cmd.directory.toLowerCase(),
						};
					}),
				),
		);
		const component2 = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('button-home')
				.setLabel('Home')
				.setStyle(2)
				.setEmoji({ id: '1034529823143501834' }),
			new ButtonBuilder()
				.setCustomId('button-contact')
				.setLabel('Contact')
				.setStyle(2)
				.setEmoji({ id: '1034529821037953055' }),
			new ButtonBuilder()
				.setCustomId('button-stats')
				.setLabel('Statistics')
				.setStyle(2)
				.setEmoji({ id: '1034529819024691240' }),
			new ButtonBuilder()
				.setLabel('Server')
				.setStyle(5)
				.setURL('https://discord.gg/rztpkEJQcg')
				.setEmoji({ id: '1034529816562643045' }),
		);
		const embeds = {
			menu: new EmbedBuilder()
				.setTitle('Pupp The Puppy')
				.addFields({
					name: 'Welcome to the world of Pupp The Puppy',
					value: 'Select 1 or more categories below in the dropdown menu. If you need to contact the owners, press the `contact` button below!',
				})
				.setImage('https://i.ibb.co/Hg79v5X/standard.gif')
				.setFooter({
					text:
						client.commands.size.toString() +
						' commands in total',
				})
				.setColor(0x4b9cd3),
			main: (directory, category) =>
				new EmbedBuilder()
					.setTitle(formatString(directory) + ' Commands')
					.setDescription(
						`
									${category.commands.map((cmd) => {
							return (
								'/' +
								cmd.name +
								'\nㅤ' +
								cmd.description
							);
						})}
								`,
					)
					.setFooter({
						text:
							category.commands.length === 1
								? '1 command'
								: category.commands.length + 'commands',
					})
					.setColor(0x4b9cd3),
			stats: new EmbedBuilder()
				.setTitle('Statistics')
				.addFields(
					{
						name: 'Ping Latency',
						value:
							'```yaml\nAPI: ' +
							client.ws.ping +
							'ms\nMessage: ' +
							Math.floor(
								Math.random() * (300 - 20) + 20,
							) +
							'ms\n```',
					},
					{
						name: 'Uptime',
						value:
							'```yaml\nStatus: Online\nUptime: ' +
							ms(client.uptime) +
							'```',
						inline: true,
					},
					{
						name: 'Author',
						value: '```yaml\nName: Zeptar\nGithub: Zeptar1069```',
						inline: true,
					},
					{
						name: '\u200b',
						value: '\u200b',
					},
					{
						name: 'Bot Status',
						value:
							'```yaml\n- Commands: ' +
							client.commands.size.toString() +
							' commands\n- Categories: 2 categories\n- Servers: ' +
							client.guilds.cache.size +
							' servers\n- Channels: ' +
							client.channels.cache.size +
							' channels\n- Users: ' +
							client.users.cache.size +
							' users\n```',
					},
				)
				.setColor(0x4b9cd3),
			fail: new EmbedBuilder()
				.setTitle('Interaction Failed')
				.setDescription(
					'This interaction is not for you. You can make your own interaction by using the /help command.',
				)
				.setColor(0xfa5f55),
		};
		const msg = await interaction.followUp({
			embeds: [embeds.menu],
			components: [component1, component2],
		});
		const collector1 = msg.createMessageComponentCollector({
			componentType: ComponentType.SelectMenu,
			time: 40000,
		});
		const collector2 = msg.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 30000,
		});
		collector1.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return await i.followUp({
					embeds: [embeds.fail],
					ephemeral: true,
				});
			}
			await collector1.resetTimer();
			await collector2.resetTimer();
			await i.deferUpdate();
			const [directory] = i.values;
			const category = categories.find(
				(cmd) => cmd.directory.toLowerCase() === directory,
			);

			await i.editReply({
				embeds: [embeds.main(directory, category)],
			});
		});

		collector2.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return await i.reply({
					embeds: [embeds.fail],
					ephemeral: true,
				});
			}

			await collector1.resetTimer();
			await collector2.resetTimer();
			if (i.customId === 'button-home') {
				await i.deferUpdate();
				await i.editReply({ embeds: [embeds.menu] });
			}

			if (i.customId === 'button-contact') {
				const modal = new ModalBuilder()
					.setCustomId('modal-contact')
					.setTitle('Contact');
				const inputs = {
					name: new TextInputBuilder()
						.setCustomId('name-input')
						.setLabel('Name and Tag')
						.setPlaceholder('Name#0000')
						.setStyle(TextInputStyle.Short)
						.setMinLength(6)
						.setMaxLength(20)
						.setRequired(true),
					message: new TextInputBuilder()
						.setCustomId('message-input')
						.setLabel('Message')
						.setPlaceholder(
							'What do you need us to help with?',
						)
						.setStyle(TextInputStyle.Paragraph)
						.setMinLength(10)
						.setMaxLength(100)
						.setRequired(true),
				};
				const nameRow = new ActionRowBuilder().addComponents(
					inputs.name,
				);
				const messageRow = new ActionRowBuilder().addComponents(
					inputs.message,
				);
				modal.addComponents(nameRow, messageRow);
				await i.showModal(modal);
			}

			if (i.customId === 'button-stats') {
				await i.deferUpdate();
				await i
					.editReply({
						content: 'Getting ready...',
						embeds: [],
					})
					.then(async () =>
						setTimeout(
							async () =>
								await i.editReply({
									content: null,
									embeds: [embeds.stats],
								}),
							1000,
						),
					);
			}
		});
		collector1.on('end', async () => {
			component1.components[0].data.disabled = true;
			[0, 1, 2, 3].forEach((sum) => {
				component2.components[sum].data.disabled = true;
			});
			await msg.edit({ components: [component1, component2] });
		});
	},
};
