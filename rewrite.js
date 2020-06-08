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
// 
async function chinsesToPinyin(inputText){
    return(pinyin(inputText,{
		style: pinyin.STYLE_TONE2,
	}));
}

// 
//return 
async function inputPinYintoTime (pinyin){

    const howhowParser = require('./json/howhow-parser.json'); //with path
   
	
		try {
			startTime = howhowParser[pinyin].startTime;
			endTime = howhowParser[pinyin].endTime;
			//console.log(pinyin + ": startTime: " + howhowParser[pinyin].startTime+ " endTime: "+ howhowParser[pinyin].endTime);
            return {startTime,endTime};
            resolve({startTime,endTime});
		}
		catch (e) {
			Error("無法讀取\""+ pinyin + "\"");
            //console.log("無法讀取\""+ pinyin + "\"");
            
		}
	
	

}

function convertToVedio (element,queue){
    let startTime = timeConversion(element.startTime);
    let endTime = timeConversion(element.endTime);
    let duration = (element.endTime-element.startTime).toFixed(2);
    console.log(startTime, endTime,duration,queue);
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
		   }                 
	   }).save('tmp/source/'+ queue + '.mp4');
	   //.run();
}

let timePoints = [];

async function logging(){
    console.log("finished");
} 
async function coversionOntheWay(){
    //把中文拼音變成羅馬拼音
    chinsesToPinyin(text).then(function(array) {
        //console.log(array);//[ [ 'chi1' ], [ 'bao3' ], [ 'mei2' ] ]
        
        //text有幾個字就有幾個for迴圈，先將拼音對照時間表，換成含有時間的promise，再把時間拿出來轉乘要切的影片。
        for(let i =0;i<array.length;i++){
            let time = inputPinYintoTime(array[i]); 
            //console.log(time);//Promise { { startTime: '1156.25', endTime: '1156.94' } }
            //先將拼音對照時間表，換成含有時間的promi
            time.then(function(obj) {
                //再把時間拿出來轉乘要切的影片。
                //這段花很多時間。
                convertToVedio(obj,i);
                
            });
        };
    }).then(()=>{
        console.log("fuckyou");
    });
}

async function main(){
    //不是應該第一個await做完再做第二個await嗎?
    await coversionOntheWay();
    await logging(); 

};

main();
