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
		mainBody.style.opacity = 0.5;
		str = [];
	}

	if(event.keyCode == 8) {
		if (str.length > 0) {
			str.pop()
		}
	} else if (event.keyCode == 16) {
		//pass
	} else if (event.keyCode >= 65 && event.keyCode <= 90 || event.keyCode==32 || event.keyCode >= 48 && event.keyCode <= 57) { //alphanumeric and space
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
	} else if (event.keyCode == 222) { //apostrophe
		str.push(4278124583);
	}

	inpt.innerHTML = parseText(str);
});


//main parse function
function parseText(arr) {
	output = "";

	//lowercase everything initially except first character
	for (var i = 0; i < str.length; i++) {
		if (i >= 1) {
			output = output + ( String.fromCharCode(str[i]) ).toString().toLowerCase();
		} else {
			output = output + ( String.fromCharCode(str[i]) ).toString()
		}
	}

	//text replacement
	for (var i = 0; i < replacement_dictionary.length; i++) {
		output = textReplace(output, replacement_dictionary[i][0], replacement_dictionary[i][1]);
	}

	return output;
}

//dictionary of replacements - can be used for replacements or CAPITALIZATION
var replacement_dictionary = [ // each subarray has 2 elements: what is being replaced, then replaced with what
	[" i ", " I "],
	[" i'", " I'"],
	["xincong", "Xincong"],
	["less than three", "<3"],
	["heart", "❤️"],
	["Xincong is cool", "😹"],
	["michael", "PULLS"]
];

//text replace function
function textReplace(inp, tis, tat) { // replace tis with tat
	var out = inp;
	while(out.search(tis) >= 0) {
		out = out.replace(tis, tat);
	}
	return out;
}


//onload
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



