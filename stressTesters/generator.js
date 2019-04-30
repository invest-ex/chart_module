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
    if (roll < 2) {
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

export default gen;