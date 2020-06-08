const ffmpeg = require("fluent-ffmpeg");

const bodyParser = require("body-parser");

const pinyin = require("pinyin");



//Node.js File system
const fs = require("fs");
const path = require('path');

//const parse = require('csv-parse')

//set ffmpeg path
ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");

ffmpeg.setFfprobePath("C:/ffmpeg/bin/ffprobe.exe");

ffmpeg.setFlvtoolPath("C:/flvtool");

let split = [  'wan3' , 'can1'  ];

const asyncPool = require('tiny-async-pool');
const poolLimit = 8;

async function main(array) {

    let queue = 0;
    let pool = [];
    array.forEach((element) => {
        let time = inputPinYintoTime(element);
        queue++;
        pool.push({time,queue})
    });
    

    let convert = (object) => new Promise((resolve, reject) => {
        
        let startTime = timeConversion(object.time.startTime);
        console.log(startTime);
        let endTime = timeConversion(object.time.endTime);
        let duration = (object.time.endTime-object.time.startTime).toFixed(2);
        console.log("start:"+ startTime + "end:"+ endTime + "dur:"+ duration + "que:"+ queue);
        
        ffmpeg('tmp/HowFun.mp4')
        .setStartTime(startTime)
        .setDuration(duration)
        .output('tmp/source/'+ queue + '.mp4')
        .on('error', (err) => {
            console.log('conversion error: ', + err);
            reject(err);
        })
        .on('end', () => {   
            console.log('successfully converted');
            resolve("yaya");
                  
        })
        .save('tmp/source/'+ queue + '.mp4')
   
    }); 

    
    //console.log(pool);
    await asyncPool(poolLimit, pool, convert);
    await console.log("complete");
    
 


}

main(split);

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
