const asyncPool = require('tiny-async-pool');
const poolLimit = 8;
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs')
const getStream = require('get-stream');
const pinyin = require("pinyin");

let text = "吃飽沒";

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

async function convertToVedio (element,queue){
    let startTime = timeConversion(element.startTime);
    let endTime = timeConversion(element.endTime);
    let duration = (element.endTime-element.startTime).toFixed(2);

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




async function coversionOntheWay(){
    let obj = { startTime: '1156.25', endTime: '1156.94' };
    try {
        const cover2vid = await convertToVedio (obj,0);
        const logging = console.log("DONE!!");
    }catch(err){
        console.log(err);
    }
}

coversionOntheWay();
