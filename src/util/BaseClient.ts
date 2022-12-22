import { Client, Collection, ActivityType, GatewayIntentBits, Partials } from 'discord.js';
import { connect, set } from 'mongoose';

export default class BaseClient extends Client {
	commands: Collection<unknown, unknown>;
	owner: any;

	constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildEmojisAndStickers,
				GatewayIntentBits.GuildPresences,
			],
			partials: [
				Partials.Channel,
				Partials.Reaction,
				Partials.User,
			],
		});

		this.commands = new Collection();
		this.owner = null;

		void set('strictQuery', false);
		void connect(process.env.mongoKey as string);

		void this.login(process.env.token).then(async () => {
			this.owner = this.users.fetch('893211748767768606');
			this.user?.setPresence({
				activities: [
					{
						name: 'for /help',
						type: ActivityType.Watching,
					},
				],
				status: 'idle',
			});

			['interaction', 'ready'].map((file) => require(`./handlers/${file}.ts`).default(this));
		});
	}
}
