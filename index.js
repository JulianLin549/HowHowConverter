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


app.get('/merge', (req, res) => {
	//console.log(loopFile());
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
		
		}).on("end", function (stdout, stderr) {
			console.log("Finished");
			res.redirect('/download');
			
		});
	}

	mergeVedio(loopFile());
});

app.get('/HowHowSpeaks', function(req, res){
    res.sendFile(__dirname + '/public/howhowSpeaks.html');
});


app.get('/download', function(req, res){
	
	var file = __dirname + '/public/output.mp4';
	if(file){
		res.sendFile(file);
		
	}
	else{
		alert("download failed");
	}
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
	//mergeVedio(loopFile());
});

app.get('/HowhowCanSpeak', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/vedioOutput.html'))
});

app.get('/HowhowCanSpeak/video', function(req, res) {
	const path = __dirname + '/public/output.mp4';
	const stat = fs.statSync(path);
	const fileSize = stat.size;
	const range = req.headers.range;
  
	if (range) {
	  const parts = range.replace(/bytes=/, "").split("-")
	  const start = parseInt(parts[0], 10)
	  const end = parts[1]
		? parseInt(parts[1], 10)
		: fileSize-1
  
	  if(start >= fileSize) {
		res.status(416).send('Requested range not satisfiable\n'+start+' >= '+fileSize);
		return
	  }
	  
	  const chunksize = (end-start)+1
	  const file = fs.createReadStream(path, {start, end})
	  const head = {
		'Content-Range': `bytes ${start}-${end}/${fileSize}`,
		'Accept-Ranges': 'bytes',
		'Content-Length': chunksize,
		'Content-Type': 'video/mp4',
	  }
  
	  res.writeHead(206, head)
	  file.pipe(res)
	} else {
	  const head = {
		'Content-Length': fileSize,
		'Content-Type': 'video/mp4',
	  }
	  res.writeHead(200, head)
	  fs.createReadStream(path).pipe(res)
	}
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

/* 
async function mergeVedio(arr){
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
	
	}).on("end", function () {
		console.log("Finished");
  
		//download file when finished Set disposition and send it.
		res.download(__dirname + '/public/output.mp4', function (err) {
		  
			if (err) throw err;
			//delete file from tmp
			 fs.unlink(__dirname + fileName, function (err) {
				if (err) throw err;
				console.log("File deleted");
			}); 
		}); 
	});
}
 */

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


