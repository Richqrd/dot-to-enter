const express = require('express')
const app = express()
const port = 3000
const { google } = require("googleapis");

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.get('/', async (req, res) => {
	res.sendFile('index.html');
});

app.get('/formdata', async (req, res) => {
	const auth = new google.auth.GoogleAuth({
		keyFile: "credentials.json",
		scopes: "https://www.googleapis.com/auth/spreadsheets",
	});
	// Create client instance for auth
	const client = await auth.getClient();

	// Create instance of Google Sheets API
	const googleSheets = google.sheets({version:"v4", auth: client});
	const spreadsheetId = "1IuTcgyInnpUCkcaN_uHt5iTZxFXPWYw4H7f3dMlOCLs";

	// Read rows
	const getRows = await googleSheets.spreadsheets.values.get({
		auth,
		spreadsheetId,
		range: "Sheet1"
	});

	res.send(getRows.data.values[getRows.data.values.length-1][0])
});

app.post('/sendmessage', async (req, res) => {
	const auth = new google.auth.GoogleAuth({
		keyFile: "credentials.json",
		scopes: "https://www.googleapis.com/auth/spreadsheets",
	});
	// Create client instance for auth
	const client = await auth.getClient();

	// Create instance of Google Sheets API
	const googleSheets = google.sheets({version:"v4", auth: client});
	const spreadsheetId = "1IuTcgyInnpUCkcaN_uHt5iTZxFXPWYw4H7f3dMlOCLs";

	// Read rows
	const getRows = await googleSheets.spreadsheets.values.get({
		auth,
		spreadsheetId,
		range: "Sheet1"
	});

	// Write
	await googleSheets.spreadsheets.values.append({
		auth,
		spreadsheetId,
		range: "Sheet1",
		valueInputOption: "RAW",
		resource: {
			values: [
				[req.body.message.toString()]
			]
		}
	});


	console.log("Message added to database: " + req.body.message.toString());
	res.send("post succesful");
});

app.listen(process.env.PORT || port, () => { 
	console.log('Hello world on port 3000!')
});
