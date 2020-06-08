const asyncPool = require('tiny-async-pool');
const poolLimit = 8;
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs')
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
function chinsesToPinyin(inputText){
    return(pinyin(inputText,{
		style: pinyin.STYLE_TONE2,
	}));
}

// 
//return 
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

async function main(){
    let pinyinArray = chinsesToPinyin(text);
    await coversionOntheWay(pinyinArray);
    await console.log("--------------");

};


main();