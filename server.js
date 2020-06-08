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

function loopFile(fileCount){
	let filesArray = [];

    totalFiles = 15; 
    for(let i = 0; i < totalFiles; i++){
        filesArray.push('./tmp/source/' + i + '.mp4');
    }; 
    console.log(filesArray);
	
}
loopFile();
