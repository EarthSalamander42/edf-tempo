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

		const remaining_days = await axios.get(`https://particulier.edf.fr/services/rest/referentiel/getNbTempoDays`);
	
		if (today_color === 'bleu') {
			today_color = 'blue_circle';
		} else if (today_color === 'blanc') {
			today_color = 'white_circle';
		} else if (today_color === 'rouge') {
			today_color = 'red_circle';
		}

		if (tomorrow_color === 'bleu') {
			tomorrow_color = 'blue_circle';
		} else if (tomorrow_color === 'blanc') {
			tomorrow_color = 'white_circle';
		} else if (tomorrow_color === 'rouge') {
			tomorrow_color = 'red_circle';
		} else {
			tomorrow_color = 'person_shrugging';
		}

		const channel = await client.channels.fetch(yourDiscordChannelID);

		// Send an embed instead of a message
		channel.send({
			embeds: [
				{
					title: `Bonjour !`,
					description: `La couleur Tempo pour aujourd'hui est :${today_color}: \nLa couleur Tempo pour demain est :${tomorrow_color}: \n\nIl reste ${remaining_days.data.PARAM_NB_J_BLEU} jours :blue_circle:, ${remaining_days.data.PARAM_NB_J_BLANC} jours :white_circle: et ${remaining_days.data.PARAM_NB_J_ROUGE} jours :red_circle: dans le mois.`,
					color: 0x0099ff,
				},
			],
		});

		// remaining_days.data.PARAM_NB_J_BLEU
		// remaining_days.data.PARAM_NB_J_BLANC
		// remaining_days.data.PARAM_NB_J_ROUGE
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
