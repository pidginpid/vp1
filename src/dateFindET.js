const dateFormattedET = function() {
	let timeNow = new Date();
	const monthNamesET = ["jaanuar", 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];
	const folkMonthNamesET = ["näärikuu", 'küünlakuu', 'paastukuu', 'jürikuu', 'lehekuu', 'jaanikuu', 'heinakuu', 'lõikuskuu', 'mihklikuu', 'viinakuu', 'talvekuu', 'jõulukuu'];
	const calendarType = process.argv[2]; /// Vaatab mis argument on sisestatud. Nt 'node www_3.js 1' annab rahvakalendri ja 'node www_3.js' ilma argumentita (või suvalise argumentiga) annab traditsioonilise.
	if(calendarType === '1') {
		return timeNow.getDate() + '. ' + folkMonthNamesET[timeNow.getMonth()] + ' ' + timeNow.getFullYear();
	}
	else {
		return timeNow.getDate() + '. ' + monthNamesET[timeNow.getMonth()] + ' ' + timeNow.getFullYear();
	}
}

const timeFormattedET = function() {
	let timeNow = new Date();
	let hourNow = timeNow.getHours();
	let minuteNow = timeNow.getMinutes();
	let secondNow = timeNow.getSeconds();
	if(minuteNow < 10){
		minuteNow = '0' + minuteNow;
	}
	if(secondNow < 10){
		secondNow = '0' + secondNow;
	}
	let timeFormatted = hourNow + ":" + minuteNow + ':' + secondNow;
	return timeFormatted;
}

const weekDayET = function() {
	let weekDay = new Date().getDay();
	const weekDayNamesET = ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev'];
	let today = weekDayNamesET[weekDay]
	return today
}

//ekspordin kõik vajaliku
module.exports = {fullDate: dateFormattedET, fullTime: timeFormattedET, currentDay: weekDayET}
