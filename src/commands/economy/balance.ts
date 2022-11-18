import BaseClient from '../../util/BaseClient';
import { ApplicationCommandType, ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, User } from 'discord.js';
import balance from '../../schema/balance';

export default {
	name: 'balance',
	description: 'Take a look at another person\'s balance, or your own',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'user',
			description: 'Take a look at another person\'s balance',
			type: ApplicationCommandOptionType.User,
			required: false,
		},
	],
	run: async (client: BaseClient, interaction: CommandInteraction, args: string[]) => {
		/* Types */
		type Profile = {
			wallet: number,
			bank: number,
		};

		type Embeds = {
			bot: EmbedBuilder;
			main: EmbedBuilder;
		};

		/* Interaction */
		await interaction.deferReply({ ephemeral: false });

		const user: User = client.users.cache.get(args[0]) || interaction.user,

			profile: Profile = await balance.findOne({ userID: user.id }) || await new balance({ userID: user.id }).save(),

			embeds: Embeds = {
				bot: new EmbedBuilder()
					.setTitle(`${user.username}'s Balance`)
					.setDescription('Look at that! Bots are certainly rich')
					.addFields([
						{ name: 'Wallet', value: '```fix\n✪ 500000\n```', inline: true },
						{ name: 'Bank', value: '```fix\n✪ 500000\n```', inline: true },
						{ name: 'Net', value: '```fix\n✪ 1000000\n```', inline: true },
					])
					.setColor(0xfAA61A)
					.setFooter({
						text: interaction.user.username,
						iconURL: interaction.user.displayAvatarURL({ extension: 'png' }),
					})
					.setTimestamp(),
				main: new EmbedBuilder()
					.setTitle(`${user.username}'s Balance`)
					.setDescription('Do you seem too poor? If so, grinding is one solution!')
					.addFields([
						{ name: 'Wallet', value: '```fix\n✪ ' + profile.wallet + '\n```', inline: true },
						{ name: 'Bank', value: '```fix\n✪ ' + profile.bank + '\n```', inline: true },
						{ name: 'Net', value: '```fix\n✪ ' + (profile.wallet + profile.bank) + '\n```', inline: true },
					])
					.setColor(0xfAA61A)
					.setFooter({
						text: interaction.user.username,
						iconURL: interaction.user.displayAvatarURL({ extension: 'png' }),
					})
					.setTimestamp(),
			};

		if (interaction.user.bot) return await interaction.followUp({ embeds: [embeds.bot] });

		return await interaction.followUp({ embeds: [embeds.main] });
	},
};
