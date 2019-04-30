import http from "k6/http";
import { check } from 'k6';

class RealisticQueryMaker {
  constructor() {
    this.topCompanies = new Array(10)
      .fill(0).map(() => this.genRandTicker());
    this.commonCompanies = new Array(100)
      .fill(0).map(() => this.genRandTicker());
    this.occasionalCompanies = new Array(1000)
      .fill(0).map(() => this.genRandTicker());
    this.rareCompanies = new Array(100000)
      .fill(0).map(() => this.genRandTicker());
  }

  getDistributedTicker() {
    let roll = Math.random();
    if (roll < 1) {
      return this.randomChoice(this.topCompanies);
    } else if (roll < 0.75) {
      return this.randomChoice(this.commonCompanies);
    } else if (roll < 0.95) {
      return this.randomChoice(this.occasionalCompanies);
    } else {
      return this.randomChoice(this.rareCompanies);
    }

  }

  randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  makeQuery() {
    let a = `SELECT * FROM stocks WHERE stockid='${this.getDistributedTicker()}' LIMIT 1;`;
    return a
  }



  genRandTicker() {
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H",
      "I", "J", "K", "L", "M", "N", "O", "P", "Q",
      "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    let val = Math.floor(Math.random() * 1000000);
    let a = new Array(5).fill(0);
    return a.map(() => {
      let letter = letters[val % 26];
      val = Math.floor(val / 26);
      return letter;
    }).join('');
  }
}

const gen = new RealisticQueryMaker();

export const options = {
	thresholds: {
    "RTT": [
      "p(99)<300",
      "p(70)<250",
      "avg<200",
      "med<150",
      "min<100",
    ],
    "Content OK": ["rate>0.95"],
    "ContentSize": ["value<4000"],
    "Errors": ["count<100"]
  }
};

export default function () {
  const ticker = gen.getDistributedTicker();
  // let res = http.get(
  //   `http://localhost:4000/stocks/${ticker}`
  // );
  // check(res, {
  //   "is status 200": (r) => r.status === 200
  // });
  let res2 = http.get(`http://localhost:4000/api/chart/${ticker}`);
  check(res2, {
    "is status 200": (r) => r.status === 200
  });
}