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

app.get("/merge", (req, res) => {
	console.log(loopFile());
	mergeVedio(loopFile());
});


app.post("/convert", (req, res) => {
	//document = req.query.document;

	let input = req.body.input;

	let split = pinyin(input,{
		style: pinyin.STYLE_TONE2,
	});
	console.log(split);//split contain [ [ 'wan3' ], [ 'can1' ] ]
	console.log(split.length); 

	/* //queue determine output sequence and file name
	//convert pinyin to time stemp and 
	//convert time stemp to actual vedio footage 
	let queue = 0;
	split.forEach((element) => {
		let time = inputPinYintoTime(element);
		convert(time,queue);
		queue++;
	});

	console.log("convert down")
	//merge output file */

	convertAllFile(split);
	mergeVedio(loopFile());
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


function timeConversion(time){
	let mSec = Math.round((time * 100)%100);
	let date = new Date(null);
	date.setSeconds(time); // specify value for SECONDS here
	let result = date.toISOString().substr(11, 8) + "." + mSec;
	return(result);
}


function mergeVedio(arr){
	console.log("in merge video");
	var mergedVideo = ffmpeg();

	//var videoNames = ['./tmp/source/0.mp4', './tmp/source/1.mp4'];
	var videoNames = arr;

	videoNames.forEach(function(videoName){
		mergedVideo = mergedVideo.addInput(videoName);
	});

	mergedVideo.mergeToFile('./public/output.mp4', './tmp')
	.on('error', function(err) {
		console.log('Error ' + err.message);
	})
	.on('end', function() {
		console.log('Finished!');
	});
}


function convert(element,queue){
		
	new Promise(function(resolve, reject) {
	   let startTime = timeConversion(element.startTime);
	   let endTime = timeConversion(element.endTime);
	   let duration = (element.endTime-element.startTime).toFixed(2);
	   console.log(startTime, endTime,duration);
	   ffmpeg('tmp/HowFun.mp4')
	   .setStartTime(startTime)
	   .setDuration(duration)
	   //.output('tmp/source/'+ queue + '.mp4')
	   .on('error', function(err){
	   console.log('conversion error: ', + err);
	   })
	   .on('end', function(err) {   
		   if(!err){
				   console.log('successfully converted');
				   resolve("yaya");
		   }                 
	   }).save('tmp/source/'+ queue + '.mp4');
	   //.run();
   });
}


async function convertAllFile(array,done){
	return new Promise((resolve, reject) => {
		//queue determine output sequence and file name
		//convert pinyin to time stemp and 
		//convert time stemp to actual vedio footage 
		let queue = 0;
		function convertEachFile(array){
			return new Promise((resolve, reject) => {
				array.forEach((element) => {
					let time = inputPinYintoTime(element);
					convert(time,queue);
					queue++;
				});
				resolve('vedio'+ queue + 'complete');
			})
		};

		convertEachFile(array).then();
		
		if (typeof done ==='function'){
			done();
			
		}
		return resolve();
	});

} 


function Error(error){
	console.log(error);
}



function loopFile(){
	let files = [];
	const testFolder = './tmp/source/';
	fs.readdirSync(testFolder).forEach(file => {
	//console.log(file);
	files.push('./tmp/source/' + file);
	});
	//console.log(files);
	return files;
}
