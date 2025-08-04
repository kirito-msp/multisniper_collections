let path = require('path');
const http = require('http');
const methodOverride = require('method-override')
const express = require('express');
let session = require('express-session');
let cors = require('cors');
const axios = require('axios');
let multiWallets = 5;
const app = express();
const server = http.createServer(app);
const port = 3000;

app.use(cors());

app.use('/assets', express.static('assets'))

app.use(session({
	secret: 'asdASDAd1sda6SAD!AQwr~acx&cvdfhRTHcgd',
	resave: false,
	saveUninitialized: false
}));

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(methodOverride('_method'))

app.get('/', function(request, response) {
	return response.sendFile(path.join(__dirname + '/public/login.html'));
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		if (username === "x3raphim" && password === "05081984") {
				request.session.loggedin = true;
				request.session.username = username;

				let authToken = '9BF1E98D2C1A2099632E681B0C71FCD1F8F36236938E1B5F1FC752B8732F7CDC';
				let params = new URLSearchParams();
				params.append('token', authToken);
				axios.post('https://multi-sniper.com/apiPlus.php', params).then(function (response) {
				if (response.data) {
					if(response.data != null){
						multiWallets = response.data;
					}
				}
				});
				return response.redirect('/bot1');
			} else return response.send('Incorrect Username and/or Password!');
	} else return response.send('Please enter Username and Password!');	
});

	app.get('/bot1', function(request, response) {
		if (request.session.loggedin) return response.sendFile((__dirname + '/public/index.html'));	
	   else return response.redirect('/');
	});
	
	app.get('/bot2', function(request, response) {
		if (request.session.loggedin) return response.sendFile((__dirname + '/public/index.html'));	
	   else return response.redirect('/');
	});
	
	app.get('/bot3', function(request, response) {
		if (request.session.loggedin) return response.sendFile((__dirname + '/public/index.html'));	
	   else return response.redirect('/');
	});
	
	app.get('/bot4', function(request, response) {
		if (request.session.loggedin) return response.sendFile((__dirname + '/public/index.html'));	
	   else return response.redirect('/');
	});
	
	app.get('/bot5', function(request, response) {
		if (request.session.loggedin) return response.sendFile((__dirname + '/public/index.html'));	
	   else return response.redirect('/');
	});
	
	app.get('/bot6', function(request, response) {
		if (request.session.loggedin) return response.sendFile((__dirname + '/public/index.html'));	
	   else return response.redirect('/');
	});
	
	app.get('/bot7', function(request, response) {
		if (request.session.loggedin) return response.sendFile((__dirname + '/public/index.html'));	
	   else return response.redirect('/');
	});
	
	app.get('/bot8', function(request, response) {
		if (request.session.loggedin) return response.sendFile((__dirname + '/public/index.html'));	
	   else return response.redirect('/');
	});
	
	app.get('/bot9', function(request, response) {
		if (request.session.loggedin) return response.sendFile((__dirname + '/public/index.html'));	
	   else return response.redirect('/');
	});
	
	app.get('/bot10', function(request, response) {
		if (request.session.loggedin) return response.sendFile((__dirname + '/public/index.html'));	
	   else return response.redirect('/');
	});

	app.get('/bot11', function(request, response) {
		if (request.session.loggedin) return response.sendFile((__dirname + '/public/index.html'));	
	   else return response.redirect('/');
	});
	
	app.get('/bot12', function(request, response) {
		if (request.session.loggedin) return response.sendFile((__dirname + '/public/index.html'));	
	   else return response.redirect('/');
	});
	
	app.get('/bot13', function(request, response) {
		if (request.session.loggedin) return response.sendFile((__dirname + '/public/index.html'));	
	   else return response.redirect('/');
	});
	
	app.get('/bot14', function(request, response) {
		if (request.session.loggedin) return response.sendFile((__dirname + '/public/index.html'));	
	   else return response.redirect('/');
	});
	
	app.get('/bot15', function(request, response) {
		if (request.session.loggedin) return response.sendFile((__dirname + '/public/index.html'));	
	   else return response.redirect('/');
	});
	


server.listen(port, () => {
  console.log(`listening on *:`);
});