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


let text = "吃飽沒你這蜘蛛";

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

    videoNames.forEach(function(videoName){
        mergedVideo = mergedVideo.addInput(videoName);
    });

    return new Promise((resolve, reject) => {
        mergedVideo.mergeToFile('./public/output.mp4', './tmp')
		.on('error', function(err) {
			console.log('Error ' + err.message);
		
		}).on("end", function (stdout, stderr) {
            console.log("Finished");
            resolve();
            
            
            //res.redirect('/download');
            
            

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

async function main(){
    let pinyinArray = chinsesToPinyin(text);
    await coversionOntheWay(pinyinArray);
    await console.log("--------------");
    await mergeOntheWay();
    await console.log("--------------");
};



function loopFile(){
	let files = [];
	const testFolder = './tmp/source/';
	fs.readdirSync(testFolder).forEach(file => {
	//console.log(file);
	files.push('./tmp/source/' + file);
	});
	console.log(files);
	return files;
}

/* 

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
} */


main();