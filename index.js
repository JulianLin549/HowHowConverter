const express = require("express");

const ffmpeg = require("fluent-ffmpeg");

const bodyParser = require("body-parser");

const fileUpload = require("express-fileupload");

const pinyin = require("pinyin");

const app = express();

//Node.js File system
const fs = require("fs");
const path = require('path');

let fileCount = 0;

//const parse = require('csv-parse')

//set ffmpeg path
ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");

ffmpeg.setFfprobePath("C:/ffmpeg/bin/ffprobe.exe");

ffmpeg.setFlvtoolPath("C:/flvtool");

//set where the tmp file should go
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

app.get('/delete', function(req, res){
	deleteOntheWay();
	
});



app.get('/download', function(req, res){
	
	var file = __dirname + '/public/videoOutput/output.mp4';
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

	main(input);
	async function main(text){
		let pinyinArray = chinsesToPinyin(text);
		fileCount = pinyinArray.length;
		await coversionOntheWay(pinyinArray);
		await console.log("--------------");
		await mergeOntheWay();
		await console.log("--------------");
		//await deleteOntheWay();
		await res.redirect('/HowhowCanSpeak');
	};

	

});

app.get('/HowhowCanSpeak', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/vedioOutput.html'))
});

app.get('/HowhowCanSpeak/video', function(req, res) {
	const path = __dirname + '/public/videoOutput/output.mp4';
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
			//console.log(pinyin + ": startTime: " + howhowParser[pinyin].startTime+ " endTime: "+ howhowParser[pinyin].endTime);
            return {startTime,endTime};
            resolve({startTime,endTime});
		}
		catch (e) {
			throw Error("無法讀取\""+ pinyin + "\"");
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
function chinsesToPinyin(inputText){
    return(pinyin(inputText,{
		style: pinyin.STYLE_TONE2,
	}));
}

async function convertToVedio (obj,queue){
    let startTime = timeConversion(obj.startTime);
    let endTime = timeConversion(obj.endTime);
    let duration = (obj.endTime-obj.startTime).toFixed(2);

    return new Promise((resolve, reject) => {
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
                    resolve();
                }                 
            }).save('tmp/source/'+ queue + '.mp4');
    });
    
} 

async function coversionOntheWay(array){
	//console.log(array);//[ [ 'chi1' ], [ 'bao3' ], [ 'mei2' ] ]
	
	//text有幾個字就有幾個for迴圈，先將拼音對照時間表，換成含有時間的promise，再把時間拿出來轉乘要切的影片。
	for(let i =0;i< array.length;i++){
		let timeStamp = inputPinYintoTime(array[i]); 
		console.log(timeStamp);//Promise { { startTime: '1156.25', endTime: '1156.94' } }
		//先將拼音對照時間表，換成含有時間的promi
		 try{
			const ccover2vid = await convertToVedio (timeStamp,i);
			const logging = await console.log("DONE!!");
		}catch(err){
			console.log(err);
		}; 
	};

	const log = await console.log("ALL DONE!!!!!!!!");
		   
};


async function mergeToVedio (array){

    console.log("in merge video");
    var mergedVideo = ffmpeg();
    //var videoNames = ['./tmp/source/0.mp4', './tmp/source/1.mp4'];
    var videoNames = array;
	console.log(videoNames);
    videoNames.forEach(function(videoName){
        mergedVideo = mergedVideo.addInput(videoName);
    });

    return new Promise((resolve, reject) => {
        mergedVideo.mergeToFile('./public/videoOutput/output.mp4', './tmp')
		.on('error', function(err) {
			console.log('Error ' + err.message);
		
		}).on("end", function (stdout, stderr) {
            console.log("Finished");
            resolve();
            
		});
    });
};

async function mergeOntheWay(){
    
    try{    
        const merge2vid = await mergeToVedio (loopFile());
        const logging = await console.log("MERGE DONE!!");
    }catch(err){
        console.log(err);
    }; 

    const log = await console.log("ALL DONE!!!!!!!!");
           
};



function deleteOntheWay(){
	console.log("in delete video");
	try {
		fs.unlinkSync('./public/videoOutput/output.mp4');
		const directory = './tmp/source/';
		fs.readdir(directory, (err, files) => {
			if (err) throw err;

			for (const file of files) {
				fs.unlinkSync(path.join(directory, file), err => {
				if (err) throw err;
				});
			}
			console.log("DELETE DONE!!!!!!!!")
		});
	  } catch (err) {
		// handle the error
	  }

}

function loopFile(){
	let filesArray = [];

    for(let i = 0; i < fileCount; i++){
        filesArray.push('./tmp/source/' + i + '.mp4');
    }; 
    //console.log(filesArray);
	return filesArray;
}




