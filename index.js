const express = require("express");

const ffmpeg = require("fluent-ffmpeg");

const bodyParser = require("body-parser");

const fileUpload = require("express-fileupload");

const pinyin = require("pinyin");

const app = express();

//Node.js File system
const fs = require("fs");
const path = require('path');

//const parse = require('csv-parse')

//set ffmpeg path
ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");

ffmpeg.setFfprobePath("C:/ffmpeg/bin/ffprobe.exe");

ffmpeg.setFlvtoolPath("C:/flvtool");

//console.log(ffmpeg);

//set there the tmp file should go
app.use(
    fileUpload({
     	useTempFiles: true,
      	tempFileDir: "/tmp/",
    })
  );
app.use(express.static('public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post("/convert", (req, res) => {
	document = req.query.document;

	let input = req.body.input;

	let split = pinyin(input,{
		style: pinyin.STYLE_TONE2,
	});
	console.log(split);
	console.log(split.length);

	let time = [];
	split.forEach((element) => {
		time.push(inputPinYintoTime(element));
	});

	//console.log(time);
	
	let queue = 0;
	time.forEach((element) => {
		//console.log(element);
		convert(element,queue);
		queue++;
	});
	

});



app.listen(5000,() => {
    console.log("App is listening on Port 5000")
});

// inputPinYintoTime("g4");
function inputPinYintoTime (pinyin){

    const howhowParser = require('./json/howhow-parser.json'); //with path
   
	
		try {
			startTime = howhowParser[pinyin].startTime;
			endTime = howhowParser[pinyin].endTime;
			console.log(pinyin + ": startTime: " + howhowParser[pinyin].startTime+ " endTime: "+ howhowParser[pinyin].endTime);
			return {startTime,endTime};
		}
		catch (e) {
			Error("無法讀取\""+ pinyin + "\"");
			//console.log("無法讀取\""+ pinyin + "\"");
		}
	
	

}

function convert(element,queue){
	
	let startTime = timeConversion(element.startTime);
	let endTime = timeConversion(element.endTime);
	let duration = (element.endTime-element.startTime).toFixed(2);
	console.log(startTime, endTime,duration);
	ffmpeg('tmp/HowFun.mp4')
	.setStartTime(startTime)
	.setDuration(duration)
	.output('tmp/output/'+ queue + '.mp4')
	.on('end', function(err) {   
	if(!err)
	{
		console.log('successfully converted');
		
	}                 
	})
	.on('error', function(err){
	console.log('conversion error: ', + err);
	}).run()

}


function timeConversion(time){
	let mSec = Math.round((time * 100)%100);
	let date = new Date(null);
	date.setSeconds(time); // specify value for SECONDS here
	let result = date.toISOString().substr(11, 8) + "." + mSec;
	return(result);
}

function Error(error){
	console.log(error);
}