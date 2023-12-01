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

async function sendColorNotification() {
	const currentDate = new Date();
	const tomorrowDate = new Date(currentDate);
	tomorrowDate.setDate(currentDate.getDate());
	const formattedDate = formatDate(tomorrowDate);

	console.log(`Fetching tempo color for ${formattedDate}`);

	try {
		const response = await axios.get(`https://particulier.edf.fr/services/rest/referentiel/searchTempoStore?dateRelevant=${formattedDate}`);
		let today_color = response.data.couleurJourJ.replace('TEMPO_', '').toLowerCase();
		let tomorrow_color = response.data.couleurJourJ1.replace('TEMPO_', '').toLowerCase();
	
		if (today_color === 'bleu') {
			today_color = 'blue';
		} else if (today_color === 'blanc') {
			today_color = 'white';
		} else if (today_color === 'rouge') {
			today_color = 'red';
		}

		if (tomorrow_color === 'bleu') {
			tomorrow_color = 'blue';
		} else if (tomorrow_color === 'blanc') {
			tomorrow_color = 'white';
		} else if (tomorrow_color === 'rouge') {
			tomorrow_color = 'red';
		}

		const channel = await client.channels.fetch(yourDiscordChannelID);

		channel.send(`Aujourd'hui, c'est un jour :${today_color}_circle: \nDemain, c'est un jour :${tomorrow_color}_circle:`);
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
