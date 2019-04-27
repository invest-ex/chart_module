const fs = require('fs');
const readLine = require('readline');
const { Writable } = require('stream');

class DBStreamManager {
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
  constructor(writeFunc, filePath, streams = 32, dBName, batchedQueries = 0) {

    this.restartLineReader = this.restartLineReader.bind(this);
    this.onReaderLine = this.onReaderLine.bind(this);
    this.interValPrint = this.interValPrint.bind(this);
    
    this.streams = streams;
    this.dBName = dBName;

    this.batchedQueries = batchedQueries;
    this.batchBuffer = [];
    this.dbWrite = new DBStreamManager(writeFunc, this.restartLineReader, streams);
    this.lineReader = readLine.createInterface({
      input: fs.createReadStream(filePath),
      console: false
    });
    this.lineReader.on('line', this.onReaderLine);
    this.bufferLines = [];
    this.numLines = 0;
    this.tick = 0;
    this.misses = 0;
    console.time(`${this.dBName} write ${this.streams} streams, batched: ${this.batchedQueries}`);
    setInterval(this.interValPrint, 5000);

  }

  restartLineReader() {
    while (this.bufferLines.length) {
      let line = this.bufferLines.pop();
      if (this.batchedQueries) {
        if (!this.dbWrite.write(JSON.stringify(line))) {
          this.bufferLines.push(line);
          return;
        }
      } else {
        if (!this.dbWrite.write(line)) {
          this.bufferLines.push(line);
          return;
        }
      }
    }
    this.lineReader.resume();
  }

  onReaderLine(line) {
    this.numLines ++;
    if (this.batchedQueries) {
      this.batchBuffer.push(line.toString());
      if (this.batchBuffer.length >= this.batchedQueries) {
        if(!this.dbWrite.write(JSON.stringify(this.batchBuffer))) {
          this.lineReader.pause();
          this.bufferLines.push(this.batchBuffer);
        }
        this.batchBuffer = [];
      }
    } else {
      if(!this.dbWrite.write(line)) {
        this.lineReader.pause();
        this.bufferLines.push(line);
      }
    }
  }

  interValPrint() {
    console.log(this.numLines, '/', ++this.tick);
    if (this.lastNumLines === this.numLines) {
      this.misses ++;
      console.log('no progress');
      if (misses > 5) {
        console.timeEnd(`${this.dBName} write ${this.streams} streams, batched: ${this.batchedQueries}`);
        process.exit();
      }
    } else {
      this.misses = 0;
    }
    this.lastNumLines = this.numLines;
  }
}

module.exports = FileToDBManager;