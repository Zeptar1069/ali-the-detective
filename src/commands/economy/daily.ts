import BaseClient from '../../util/BaseClient';
import { ApplicationCommandType, ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, User } from 'discord.js';
import balance from '../../schema/balance';
import daily from '../../schema/daily';

export default {
	name: 'daily',
	description: 'Get a bundle of money each 24 hours, streaks add up more!',
	type: ApplicationCommandType.ChatInput,
	run: async (_client: BaseClient, interaction: CommandInteraction, _args: string[]) => {
		const profile = await balance.findOne({ userID: interaction.user.id }) || await new balance({ userID: interaction.user.id }).save(),
			{ cooldown } = await daily.findOne({ userID: interaction.user.id }) || await new daily({ userID: interaction.user.id }),
			embeds = {
				fail: (hours: number) => new EmbedBuilder()
					.setDescription('You\'ve already claimed your daily today, try again in <t:' + Math.floor(hours / 1000) + ':R>.')
					.setColor(0xfa5f55),
				main: new EmbedBuilder()
					.setTitle(interaction.user.username + '\'s Reward')
					.setDescription('`✪ 500` was added to your wallet!')
					.setColor(0xfAA61A),
			};

		if (86400000 - (Date.now() - cooldown) > 0) {
			await interaction.deferReply({ ephemeral: true });
			return interaction.editReply({ embeds: [embeds.fail(86400000 + cooldown)] });
		}

		await balance.updateOne({ wallet: profile.wallet + 500 });
		await daily.updateOne({ cooldown: Date.now() });

		await interaction.deferReply({ ephemeral: false });
		await interaction.editReply({ embeds: [embeds.main] });
	},
};
