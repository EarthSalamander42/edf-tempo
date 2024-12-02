const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const config = require('./config.json');

const client = new Client({
	intents: [
		// GatewayIntentBits.Guilds, // Nous autorise à voir les serveurs sur lesquels le bot est
		// GatewayIntentBits.GuildMessages, // Nous autorise à lire les messages
		// GatewayIntentBits.MessageContent, // Nous autorise à lire le contenu des messages
		// GatewayIntentBits.GuildMembers, // Nous autorise à voir les membres du serveur
	]
})

const yourDiscordChannelID = config.channel_id;

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	scheduleNotification();
	// sendColorNotification(); // test purpose only
});

client.login(config.bot_secret);

function scheduleNotification() {
	const currentDate = new Date();
	const nextDay = new Date(currentDate);
	nextDay.setDate(currentDate.getDate() + 1);
	// Les paramètres de setHours sont : heures, minutes, secondes, millisecondes
	nextDay.setHours(11, 0, 0, 0); // Mettez l'heure à laquelle vous souhaitez recevoir la notification

	const timeUntilNextDay = nextDay - currentDate;
	const timeUntilNextDayInHours = (timeUntilNextDay / 1000 / 60 / 60).toFixed(1);
	const timeUntilNextDayInMinutes = (timeUntilNextDay / 1000 / 60).toFixed(1);

	console.log(`Next notification in ${timeUntilNextDayInHours} hours (${timeUntilNextDayInMinutes} minutes)`);

	setTimeout(() => {
		sendColorNotification();
	}, timeUntilNextDay);
}

const enum_to_color = [
	"Inconnu",
	"Bleu",
	"Blanc",
	"Rouge"
]

const enum_to_emoji = [
	"person_shrugging",
	"blue_circle",
	"white_circle",
	"red_circle"
]

async function sendColorNotification() {
	const currentDate = new Date();
	const tomorrowDate = new Date(currentDate);
	tomorrowDate.setDate(currentDate.getDate() + 1);
	const formattedDate = formatDate(currentDate);
	const formattedTomorrowDate = formatDate(tomorrowDate);

	console.log(`Fetching tempo color for ${formattedDate} and ${formattedTomorrowDate}`);

	try {
		const response = await axios.get(`https://www.api-couleur-tempo.fr/api/joursTempo?dateJour%5B%5D=${formattedDate}&dateJour%5B%5D=${formattedTomorrowDate}`);
		// console.log(response.data);
		const today_color = enum_to_color[response.data[0].codeJour];
		const tomorrow_color = enum_to_color[response.data[1].codeJour];

		const channel = await client.channels.fetch(yourDiscordChannelID);

		channel.send({
			embeds: [
				{
					title: `Bonjour !`,
					description: `La couleur Tempo pour aujourd'hui est ${today_color} :${enum_to_emoji[response.data[0].codeJour].toLowerCase()}: \nLa couleur Tempo pour demain est ${tomorrow_color} :${enum_to_emoji[response.data[1].codeJour].toLowerCase()}: \n\nBonne journée !`,
					// description: `La couleur Tempo pour aujourd'hui est ${today_color} :${today_emoji}: \nLa couleur Tempo pour demain est ${tomorrow_color} :${tomorrow_emoji}: \n\nIl reste ${remaining_days.data.PARAM_NB_J_BLEU} jours :blue_circle:, ${remaining_days.data.PARAM_NB_J_BLANC} jours :white_circle: et ${remaining_days.data.PARAM_NB_J_ROUGE} jours :red_circle: dans l'année.\n\nLe compteur est remis à zéro le 1er septembre de chaque année.\n\nBonne journée !`,
					color: 0x0099ff,
				},
			],
		});
	} catch (error) {
		console.error('Error fetching tempo color:', error.message);
	}

	scheduleNotification();
}

function formatDate(date) {
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');

	return `${year}-${month}-${day}`;
}
