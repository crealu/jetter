const fs = require('fs');
const path = require('path');

module.exports = {
	filterArticles: () => {
		const compiledData = [];
		let fileNames = [];

		for (let i = 2006; i < 2026; i++) {
		  fileNames.push(`articles${i}.json`);
		}

		fileNames.forEach(fileName => {
		  try {
		    const filePath = path.join(__dirname, '../public/data/archive', fileName); // Adjust path if files are in a different directory
		    const fileContent = fs.readFileSync(filePath, 'utf8');
		    const parsedData = JSON.parse(fileContent);

		    compiledData.push(...parsedData);

		    // // If each JSON file contains an array, use concat or spread to merge
		    // if (Array.isArray(parsedData)) {
		    //   compiledData.push(...parsedData);
		    // } else {
		    //   // If each JSON file contains an object, push the object
		    //   compiledData.push(parsedData);
		    // }
		  } catch (error) {
		    console.error(`Error processing ${fileName}:`, error);
		  }
		});

		let filtered = compiledData.filter(article => article.company == 'Lockheed Martin')

		return filtered;
	}
}