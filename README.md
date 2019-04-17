# Project Name

> Project description

## Related Projects

  - https://github.com/invest-ex/about_module
  - https://github.com/invest-ex/ratings_history_module
  - https://github.com/invest-ex/proxy_carl

## Table of Contents

1. [Usage](#Usage)
1. [API](#API)

## Usage

> npm run seed
> npm run start
> npm run start:server

### Installing Dependencies

From within the root directory:

```sh
npm install -g webpack
npm install
```

## Server API

Method | Path | Description| Request Body | Response Body
----|----|----|----|----
GET|api/chart/:stock-id|Gets all data for a stock| None | { stockInfo:{ relatedTags:[Str], stockCompany:Str, noOfOwners:Int, recommendationPercent:Int }, stockData:{ day:[Num], week:[Num], month:[Num], threeMonth:[Num], year:[Num], fiveYear:[Num] }, id:Num, averageStock:Num, changePercent:Num } |
POST|api/chart/:stock-id/stock-price|Add new stock price for time given in body| {price:Num, time:DateTime} | None
DELETE|api/chart/:stock-id|Delete all stock data associated with entry| None |None
POST|api/chart|Create new stock with data defined in body| { stockInfo:{ relatedTags:[Str], stockCompany:Str, noOfOwners:Int, recommendationPercent:Int }, stockData:{ day:[Num], week:[Num], month:[Num], threeMonth:[Num], year:[Num], fiveYear:[Num] }, id:Num, averageStock:Num, changePercent:Num } | None
PUT | api/chart/:stock-id/info/noOfOwners | Set new number of owners | Num | None
PUT | api/chart/:stock-id/info/recommendPercent | Set new recommendation percent | Num | None
PUT | api/chart/:stock-id/averageStock | Set new average price | Num | None


