import BaseClient from '../../util/BaseClient';
import { ApplicationCommandType, ApplicationCommandOptionType, CommandInteraction } from 'discord.js';

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
		/* await interaction.deferReply({ ephemeral: false });
        const user = client.users.cache.get(args[0]) || interaction.user;

        const profile = {
            wallet: await db.get(interaction.user.id + '.wallet'),
            bank: await db.get(interaction.user.id + '.bank'),
        };

        if (!profile.wallet) {
            await db.set(interaction.user.id + '.wallet', 1000);
            profile.wallet = await db.get(interaction.user.id + '.wallet');
        }

        if (!profile.bank) {
            await db.set(interaction.user.id + '.bank', 1000);
            profile.bank = await db.get(interaction.user.id + '.bank');
        }

        let condition = (balance) => {
            const net = balance.wallet + balance.bank;
            if (net <= 2000) return 'Too poor for living? Keep grinding until you get there!';
            if (net > 2000 && net <= 10000) return 'Your balance still woudln\'t be enough for living...';
            if (net > 10000 && net <= 30000) return 'Just the right amount for a perfect life!';
            if (net > 30000 && net <= 90000) return 'Isn\'t that more than enough, or is it?';
            if (net > 90000 && net <= 800000) return 'Nice, the perfect amount for a rich person!';
            if (net > 800000) return 'Too much, less fun. Time for you to prestige!';
        };

        const embeds = {
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

        return await interaction.followUp({ embeds: [embeds.main] }); */
	},
};
