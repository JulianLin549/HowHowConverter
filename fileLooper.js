//https://gist.github.com/adamwdraper/4212319

 let files = [];
/*  
//requiring path and fs modules
const path = require('path');
const fs = require('fs');
//joining path of directory 
const directoryPath = path.join(__dirname, '/tmp/source/');
//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file) {
        // Do whatever you want to do with the file
        console.log(file); 
        files.push(file);
    });
});

console.log(files); */

/* function walk(){
    return new Promise(function (resolve, reject) {
        //requiring path and fs modules
        const path = require('path');
        const fs = require('fs');
        //joining path of directory 
        const directoryPath = path.join(__dirname, '/tmp/source/');
        //passsing directoryPath and callback function
        fs.readdir(directoryPath, function (err, files) {
            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            } 
            //listing all files using forEach
            files.forEach(function (file) {
                // Do whatever you want to do with the file
                console.log(file); 
                files.push(file);
            });
         resolve('walking finished');   
        });

    });
}
 */

/* var fs = require('fs');
var path = require('path');
var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                results.push(file);
                if (!--pending) done(null, results);
                }
            });
        });
    });
};

walk('tmp/source/', function(err, results) {
    if (err) throw err;
    console.log(results);
  }); */
//https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
/* const { promisify } = require('util');
const { resolve } = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function getFiles(dir) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.reduce((a, f) => a.concat(f), []);
}

getFiles(__dirname + '/tmp/source/')
  .then(files => console.log(files))
  .catch(e => console.error(e)); */

const testFolder = './tmp/source/';
const fs = require('fs');


fs.readdirSync(testFolder).forEach(file => {
  console.log(file);
  files.push('./tmp/source/' + file);
});
console.log(files)