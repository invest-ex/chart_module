import http from "k6/http";
import { check } from 'k6';
import gen from './generator.js'


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