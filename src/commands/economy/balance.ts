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

		const user: User = client.users.cache.get(args[0]) || interaction.user;

		let profile: Profile = await balance.findOne({ userID: user.id }) || await new balance({ userID: user.id }).save();

		const condition: Function = (balance: { wallet: number, bank: number }) => {
				const net = balance.wallet + balance.bank;
				if (net <= 2000) return 'Too poor for living? Keep grinding until you get there!';
				if (net > 2000 && net <= 10000) return 'Your balance still wouldn\'t be enough for living...';
				if (net > 10000 && net <= 30000) return 'Just the right amount for a perfect life!';
				if (net > 30000 && net <= 90000) return 'Isn\'t that more than enough, or is it?';
				if (net > 90000 && net <= 800000) return 'Nice, the perfect amount for a rich person!';
				if (net > 800000) return 'Too much, less fun. Time for you to prestige!';
			},
			embeds: Embeds = {
				bot: new EmbedBuilder()
					.setTitle(`${user.username}'s Balance`)
					.setDescription(condition({ wallet: 50000, bank: 50000 }))
					.addFields([
						{ name: 'Wallet', value: '```fix\n✪ 50000\n```', inline: true },
						{ name: 'Bank', value: '```fix\n✪ 50000\n```', inline: true },
						{ name: 'Net', value: '```fix\n✪ 100000\n```', inline: true },
					])
					.setColor(0xfAA61A),
				main: new EmbedBuilder()
					.setTitle(`${user.username}'s Balance`)
					.setDescription(condition(profile))
					.addFields([
						{ name: 'Wallet', value: '```fix\n✪ ' + profile.wallet + '\n```', inline: true },
						{ name: 'Bank', value: '```fix\n✪ ' + profile.bank + '\n```', inline: true },
						{ name: 'Net', value: '```fix\n✪ ' + (profile.wallet + profile.bank) + '\n```', inline: true },
					])
					.setColor(0xfAA61A),
			};

		return await interaction.followUp({ embeds: [embeds.main] });
	},
};
