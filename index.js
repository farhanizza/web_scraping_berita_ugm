const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeDataBerita(link) {
	try {
		// Contoh https://ugm.ac.id/id/berita/17779-belajar-dari-pengalaman-dieng-kulon-mengelola-desa-wisata
		const respone = await axios.get(`https://ugm.ac.id/id/berita/${link}`);
		const $ = cheerio.load(respone.data);
		const titles = [];
		const body = [];

		console.log('Sedang scrapping data....');
		await delay(2500);

		console.log('\n');

		// Judul
		$('.post-heading .post-title').each((index, element) => {
			titles.push($(element).text());
		});

		// body
		$('.post-content p').each((index, element) => {
			const body_replace = $(element).text().replace(/\./g, '');
			body.push(body_replace);
		});

		const data = {
			body: body,
		};

		const filterData = data.body.filter((element) => element.trim() !== '');

		const filterDataResult = {
			titles: titles,
			body: filterData,
		};

		fs.readFile('data.json', 'utf8', (error, data) => {
			if (error) {
				console.log(error);
				return;
			}

			if (data) {
				let jsonData;
				try {
					jsonData = JSON.parse(data);
					if (!Array.isArray(jsonData)) {
						jsonData = [];
					}

					const isDataExist = jsonData.some((item) => {
						return JSON.stringify(item) === JSON.stringify(filterDataResult);
					});

					if (isDataExist) {
						console.log('Data sudah ada');
						return false;
					} else {
						jsonData.push(filterDataResult);
						writeDataToJson(jsonData);
						return true;
					}
				} catch (error) {
					console.log('Error Parsing JSON data: ', error);
					return;
				}
			} else {
				jsonData = [filterDataResult];
				writeDataToJson(filterDataResult);
			}
		});
	} catch (error) {
		console.log(error);
	}
}

function writeDataToJson(jsonData) {
	fs.writeFile('data.json', JSON.stringify(jsonData), 'utf8', (error) => {
		if (error) throw error;
		console.log('Data berhasil ditambahkan dan disimpan dalam file JSON');
	});
}

if (process.argv[2] === undefined) {
	console.log('Tolong masukan link');
} else {
	scrapeDataBerita(process.argv[2]);
}
