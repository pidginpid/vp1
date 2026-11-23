// ühekordne skript: loob kõigile olemasolevatele galeriipiltidele uued pisipildid,
// kus vesimärk on 20% pisipildi laiusest (nagu üleslaadimise kontrolleris)
// käivitamine projekti kaustast: node regenerateThumbs.js
require('dotenv').config();
const fs = require('fs').promises;
const sharp = require('sharp');

const regenerateThumbs = async () => {
	const origPath = process.env.UPLOAD_ORIGINAL_PATH;
	const thumbPath = process.env.UPLOAD_THUMBNAIL_PATH;
	// pisipildi vesimärk on 20% pisipildi laiusest (100 x 100 pildil 20 px)
	const thumbWatermarkWidth = Math.round(100 * 0.2);
	const thumbWatermark = await sharp('./public/pic/watermark.png').resize({width: thumbWatermarkWidth}).toBuffer();
	// loeme originaalpiltide kaustast kõik .jpg failid
	const allFiles = await fs.readdir(origPath);
	const photoFiles = allFiles.filter(function(fileName){
		return fileName.toLowerCase().endsWith('.jpg');
	});
	let doneCount = 0;
	let failedCount = 0;
	for(const fileName of photoFiles) {
		try {
			// teeme pisipildi (100 x 100), samamoodi nagu üleslaadimisel
			await sharp(origPath + fileName).resize(100, 100).jpeg({quality: 15}).composite([{
				input: thumbWatermark,
				gravity: 'southeast'
			}]).toFile(thumbPath + fileName);
			doneCount += 1;
			console.log('Pisipilt tehtud: ' + fileName);
		} catch (err) {
			failedCount += 1;
			console.log('Viga failiga ' + fileName + ': ' + err);
		}
	}
	console.log('Valmis. Uuendatud pisipilte: ' + doneCount + ', ebaõnnestus: ' + failedCount);
};

regenerateThumbs().catch(function(err){
	console.log('Viga: ' + err);
});
