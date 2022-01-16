require('dotenv').config();
const Discord = require('discord.js');
const CronJob = require('cron').CronJob;

const client = new Discord.Client({
	intents: [
		Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Discord.Intents.FLAGS.GUILDS,
		Discord.Intents.FLAGS.GUILD_MESSAGES,
		Discord.Intents.FLAGS.DIRECT_MESSAGES
	],
	partials: [
		'CHANNEL'
	]
});

const DataStorage = require('./src/DataStorage');
const {isModerator} = require('./src/util');
const ChatFilter = require('./src/ChatFilter');

client.once('ready', async () => {
	const job = new CronJob('0 0 * * * *', function () {
		ChatFilter.fetchThirdPartyScamListRecent(3610);
	}, null, true, 'Europe/London');
	await ChatFilter.fetchThirdPartyScamListAll();
	job.start();
	console.log('Ready!');
});

client.on('messageCreate', async message => {
	if (message.author.bot) return;
	try {
		if (message.content.startsWith('?scamlist') && await isModerator(message.author.id, message)) {
			const domain = message.content.substring(10);
			if (DataStorage.storage.scamfilter == undefined) DataStorage.storage.scamfilter = [];
			if (!domain) {
				let scamdomains = '`'+(DataStorage.storage.scamfilter.toString()).replaceAll(',','`\n`')+'`';
				message.channel.send(scamdomains=='``'?'No domains are in the scam list yet.':scamdomains);
			}
			else if (DataStorage.storage.scamfilter.includes(domain)) {
				DataStorage.storage.scamfilter = DataStorage.storage.scamfilter.filter(x=>x!=domain);
				message.channel.send('Removed `' + domain + '` from the scam list.');
			}
			else {
				DataStorage.storage.scamfilter.push(domain);
				message.channel.send('Added `' + domain + '` to the scam list.');
			}
			DataStorage.save();
		}
		else {
			let urlsInMessage = message.content.match(/(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/gi);
			
			if (
				ChatFilter.scam(message.content) || 
				ChatFilter.scam(message.embeds[0]?.url) || 
				ChatFilter.scam(message.embeds[0]?.thumbnail?.url) || 
				// ChatFilter.scam(await ChatFilter.expandUrl(message.embeds[0]?.url)) ||
				ChatFilter.scam((await ChatFilter.expandMultipleUrls(urlsInMessage)).join())
			) {
				message.delete().catch(console.error);
				if (process.env.CLEAR_ROLES_ON_MUTE.toLowerCase() === 'true') {
					message.member.roles.set([process.env.MUTED_ROLE]).catch(console.error);
				}
				else {
					message.member.roles.add(process.env.MUTED_ROLE).catch(console.error);
				}
				message.channel.send(
					'.　。　　　　•　　　ﾟ　　。　　.　　　　•\n'+
					'　　　.　　　　　.　　　　　。　　。　.　　.\n'+
					'。　　ඞ　　.　•　　Scammer was ejected...\n'+
					'。　.　　　　。　　　　　　ﾟ　　　.　　　　.\n'+
					'　　　　.　.　　　.　　　•　　.　　　　ﾟ　.\n'
				);
				
				let channel = await message.guild.channels.fetch(process.env.LOG_CHANNEL);
				channel.send({
					embeds:[
						{
							title: 'Scam Filter',
							description: 'Muted <@' + message.author.id + '>',
							fields:[
								{
									name: 'Message',
									value: message.content==''?'[empty]':message.content
								}
							],
							color: 'ff5114'
						}
					]
				});
			}
		}
	}
	catch (error) {
		console.error(error.stack);

		client.channels.fetch(process.env.LOG_CHANNEL)
			.then(channel => channel.send({
				content: error.toString(),
				files: [{
					attachment: Buffer.from(error.stack, 'utf-8'),
					name: 'error.txt'
				}]
			}).catch(console.error)).catch(console.error);
	}
});

client.login(process.env.TOKEN);
