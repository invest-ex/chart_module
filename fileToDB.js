const fs = require('fs');
const readLine = require('readline');
const { Writable } = require('stream');

class DbWriteManager {
	constructor(writeFunc, restartFunc, numStreams = 4) {
		this.writeFunc = writeFunc;
		this.restartFunc = restartFunc;
		this.numStreams = numStreams;
		this.streams = [];
    this.streamsFull = [];
		let stream;
		for (let i = 0; i < numStreams; i++) {
			stream = new Writable({write: writeFunc});
      this.streamsFull.push(false);
			stream.on('drain', ()=> {
        this.streamsFull[i] = false;
        restartFunc();
      });
			this.streams.push(stream);
		}
	}

	write(data) {
    let j = 0;
    while (j < this.numStreams) {
      if (this.streamsFull[j]) {
        j ++; 
        continue;
      }
      let worked = this.streams[j].write(data);
      if (!worked)
      {
        this.streamsFull[j] = true;
      } 
      break;

    }
		return j < this.numStreams;
	}
}

class FileToDBManager {
  constructor(writeFunc, filePath, streams = 32) {

    this.restartLineReader = this.restartLineReader.bind(this);
    this.onReaderLine = this.onReaderLine.bind(this);
    this.interValPrint = this.interValPrint.bind(this);
    
    this.streams = streams;
    this.dbWrite = new DbWriteManager(writeFunc, this.restartLineReader, streams);
    this.lineReader = readLine.createInterface({
      input: fs.createReadStream(filePath),
      console: false
    });
    this.lineReader.on('line', this.onReaderLine);
    this.bufferLines = [];
    this.numLines = 0;
    this.tick = 0;
    console.time(`Cassandra write ${this.streams} streams`);
    setInterval(this.interValPrint, 1000);

  }

  restartLineReader() {
    while (this.bufferLines.length) {
      let line = this.bufferLines.pop();
      if (!this.dbWrite.write(line)) {
        this.bufferLines.push(line);
        return;
      }
    }
    this.lineReader.resume();
  }

  onReaderLine(line) {
    this.numLines ++;
    if(!this.dbWrite.write(line)) {
      this.lineReader.pause();
      this.bufferLines.push(line);
    }
  }

  interValPrint() {
    console.log(this.numLines, '/', ++this.tick);
    if (this.lastNumLines === this.numLines) {
      console.timeEnd(`Cassandra write ${this.streams} streams`);
      process.exit();
    } 
    this.lastNumLines = this.numLines;
  }
}

module.exports = FileToDBManager;