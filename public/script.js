var inpt = document.getElementById("inpt");
var mainBody = document.getElementById("mainText");

//stack overflow code for xhr GET requests
function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
  		}
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

//my frankenstein code for xhr POST requests
function httpPostAsync(theUrl, body, callback) // body = JSON
{
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("POST", theUrl, true); // no request header???? do i need? idk?
	xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            callback(xmlHttp.responseText);
  		}
	}
	xmlHttp.send(body);
}

//blinking cursor
var dot = document.getElementById("dot");
dot.style.opacity = 0;
var blink;
var counter = 0;
function blinking() {
	if (counter <=1) {
		dot.style.opacity = 0;
	} else {
		dot.style.opacity = 1
	}
	counter += 0.015;
	counter = counter % 2
}



//listen for keyboard
var str = [];
var nokeys = true;
document.addEventListener("keydown", function(event) {
	// visual changes for first start typing
	if (nokeys == true) {
		blink = setInterval(blinking, 10);
		nokeys = false;
		mainBody.style.opacity = 0.7;
		str = [];
	}

	if(event.keyCode == 8) {
		if (str.length > 0) {
			str.pop()
		}
	} else if (event.keyCode == 16) {
		//pass
	} else if (event.keyCode >= 65 && event.keyCode <= 90 || event.keyCode==32) {
		str.push(event.keyCode)
	} else if (event.keyCode >= 186 && event.keyCode <= 189) {
		switch(event.keyCode) {
			case 186:
				str.push(59);
				break;
			case 187:
				str.push(61);
				break;
			case 188:
				str.push(44);
				break;
			case 189:
				str.push(45);
				break;
		}
	} else if (event.keyCode == 190) { // period, end
		httpPostAsync("/sendmessage", "message=" + parseText(str), function(l) {});

		new_message = parseText(str);
		nokeys = true;

		//stop blinking visual
		clearInterval(blink);
		dot.style.opacity = 1;

		//opacity visual
		mainBody.style.opacity = 1;
	}
	inpt.innerHTML = parseText(str);
});

// parse keyboard inputs
function parseText(arr) {
	output = "";
	for (var i = 0; i < str.length; i++) {
		if (i >= 1) {
			output = output + ( String.fromCharCode(str[i]) ).toString().toLowerCase();
		} else {
			output = output + ( String.fromCharCode(str[i]) ).toString()
		}
	}

	//i -> I
	var pronoun = output.search(" i ");
	while (pronoun >= 0) {
		var s1 = output.substr(0, pronoun+1);
		var s2 = output.substr(pronoun+2, output.length);
		var ch = output[pronoun+1].toUpperCase();
		output = s1 + ch + s2;
		pronoun = output.search(" i ");
	}

	//name processing
	var x = output.search("xincong");
	while (x >= 0) {
		var s1 = output.substr(0, x);
		var s2 = output.substr(x+1, output.length);
		var ch = output[x].toUpperCase();
		output = s1 + ch + s2;
		x = output.search("xincong");
	}

	return output;
}

var checkupdates;
var prev_message = "";
var new_message = "";
window.onload = function() {
	httpGetAsync("/formdata", function (data) {
		prev_message = data;
		inpt.innerHTML = prev_message;

		//load in visual dot only after data has loaded in; blank page before everything has loaded
		dot.style.opacity = 1;
		mainBody.style.opacity = 1;
	});

	//loop to check message updates
	checkupdates = setInterval(function () {
		httpGetAsync("/formdata", function (data) {
			if(prev_message != data.toString()) {
				if(new_message != data.toString()) {
					prev_message = data;
					inpt.innerHTML = prev_message;

					//load in visual dot only after data has loaded in; blank page before everything has loaded
					clearInterval(blink);
					dot.style.opacity = 1;
					mainBody.style.opacity = 1;
					nokeys = true;
					//console.log("DIFFERENT");
					str = [];
				} else {
					prev_message = new_message;
				}
			}
			//console.log("check");
		});
	}, 5000);
}



