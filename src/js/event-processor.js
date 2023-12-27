class EventProcessor{


    /**
     * 
     * @param {*} events
     * @param {string} interval "day" or "hour"
     * @param {number} window moving average length
     * @param {number} minTs when provided this is a start date, overwrites start date calculated from the earliest event in set
     * @param {number} maxTs when provided this is an end date, overwrites end date calculated from the latest event in set
     * @returns {Stats} stats for events provided, grouped by users and intervals, with moving average calculated using provided window
     */
    userTrends(events, interval, window, minTs, maxTs){

        const intervals = this.intervalsFromEvents(events, interval, minTs, maxTs);

        const result = {
            intervals: intervals,
            users: [], //[{user, daily: [{cals:,commits:,lines:}]}],            
            usersMa: [] //[{user, daily: [{cals:,commits:,lines:}]}],
        }

        const minMaxTs = this.windowTsFromEvents(events)
        if(minTs)
            minMaxTs.minTs = minTs
        if(maxTs)
            minMaxTs.maxTs = maxTs



        // get all users
        const allUsers = events.reduce((prev, curr)=>{
            prev[curr.user] = {
                user: curr.user,
                cals: 0,
                commits: 0,
                lines: 0
            }
            return prev;
        },{})        

        const users = [];
        const usersMa = []

        Object.keys(allUsers).forEach((user)=>{
            // const userStats = this.dailyEffort(events.filter((item)=>item.user == user)).map((item)=>item.value);
            // const userStats = this.dailyEffort(events.filter((item)=>item.user == user), minMaxTs.minTs, minMaxTs.maxTs);
            const userStats = this.effort(events.filter((item)=>item.user == user), minMaxTs.minTs, minMaxTs.maxTs, interval);
            users.push({
                user: user,
                efforts: userStats
            })    

            console.log(`User stats ${user} ${userStats[0].interval.nameLong} ${userStats[userStats.length-1].interval.nameLong}`)

            const userCals = userStats.map((item)=>item.value.cals);
            const userCommits = userStats.map((item)=>item.value.commits);
            const userLines = userStats.map((item)=>item.value.lines);
            const userEntropy = userStats.map((item)=>item.value.entropy);

            const userCalsMa = this.movingAverage(userCals, "SMA", window);
            const userCommitsMa = this.movingAverage(userCommits, "SMA", window);
            const userLinesMa = this.movingAverage(userLines, "SMA", window);
            const userEntropyMa = this.movingAverage(userEntropy, "SMA", window);

            

            const dailyMas = []
            for(let i=0; i<userCalsMa.length; i++){
                dailyMas.push({
                    interval: intervals[i],
                    value: {
                        cals: userCalsMa[i],
                        commits: userCommitsMa[i],
                        lines: userLinesMa[i],
                        entropy: userEntropyMa[i]
                    }
                })
            }

            usersMa.push({
                user: user,
                efforts: dailyMas
            })
            
        })

        result.users = users;
        result.usersMa = usersMa;
        return result;
    }


    /**
     * Calculates time window (minTs, maxTs) from a given set of events rounded to interval including all events
     * @param {*} rawEvents target events
     * @param {string} interval "day" or "hour"
     * @returns {minTs, maxTs} window begin and end time, truncated to interval start and end
     */
    windowTsFromEvents(rawEvents, interval){
        //sorted, ascending by date, missing dates are filled with given value
        const minMaxTs = rawEvents.reduce((prev, curr)=>{
            return {
                minTs: Math.min(prev.minTs, curr.ct),
                maxTs: Math.max(prev.maxTs, curr.ct)
            }
        },{minTs: Number.MAX_SAFE_INTEGER, maxTs: -1});

        minMaxTs.minTs = moment(minMaxTs.minTs).startOf(interval).valueOf();
        minMaxTs.maxTs = moment(minMaxTs.maxTs).endOf(interval).valueOf();

        return minMaxTs;
    }

    /**
     * Builds continous interval info array for given events or between min and max when provided
     * @param {*} rawEvents 
     * @param {*} interval 
     * @param {*} minTs 
     * @param {*} maxTs 
     * @returns {IntervalInfo[]} array of interval infos
     */
    intervalsFromEvents(rawEvents, interval, minTs, maxTs){
        const result = [];        
        
        //sorted, ascending by date, missing dates are filled with given value
        // first from event time period
        const minMaxTs = rawEvents.reduce((prev, curr)=>{
            return {
                minTs: Math.min(prev.minTs, curr.ct),
                maxTs: Math.max(prev.maxTs, curr.ct)
            }
        },{minTs: Number.MAX_SAFE_INTEGER, maxTs: -1});
        

        let begin = moment(minMaxTs.minTs).startOf(interval).valueOf()
        let end = moment(minMaxTs.maxTs).endOf(interval).valueOf()

        // if min, max provided then override values from events
        if(minTs)
            begin = minTs
        if(maxTs)
            end = maxTs

        for(let i=begin; i<=end; i = moment(i).add(1,interval.charAt(0)).valueOf()){
            const stepBegin = moment(i).startOf(interval).valueOf()            
          
            const intervalSpecs = {
                ts: stepBegin,                
                name: interval == "day"?moment(stepBegin).format("YYYY-MM-DD"):moment(stepBegin).format("HH:mm"),
                nameLong: moment(stepBegin).format("YYYY-MM-DD HH:mm"),
            }
            result.push(intervalSpecs)
        }
        return result;
    }

    /**
     * Calculates interval effort from events provided. 
     * There is continous and order time range, when no events are at given time then zeros are returned.
     * @param {*} rawEvents 
     * @param {*} minTs start timestamp, events registered earlier are discarded
     * @param {*} maxTs end timestamp, events registered later are discarded 
     * @param {*} interval one of "day", "hour"
     * @returns {IntervalStats[]} stats from events for interval, sorted by interval ascending
     */
    effort(rawEvents, minTs, maxTs, interval){
        const result = [];        
        // const begin = moment(minTs).startOf(interval).valueOf()
        // const end = moment(maxTs).endOf(interval).valueOf()
        const begin = minTs
        const end = maxTs

        console.log(`Effort between ${moment(begin).format("YYYY-MM-DD HH:mm")} - ${moment(end).format("YYYY-MM-DD HH:mm")}`)

        for(let i=begin; i<moment(end).add(1,interval.charAt(0)).valueOf(); i = moment(i).add(1,interval.charAt(0)).valueOf()){
            // console.log(`Passing ${moment(i).format("YYYY-MM-DD HH:mm")}`)
            const intervalStats = this.intervalEffort(rawEvents, i, interval);
            result.push(intervalStats)
        }
        return result;
    }

    /**
     * Takes provided moment, calculates single interval including provided moment and calculates stats from
     * events registered during the interval
     * @param {*} rawEvents events
     * @param {*} i moment in time for which interval and stats will be calculated
     * @param {*} interval "day" or "hour"
     * @returns {IntervalStats} single interval stats
     */
    intervalEffort(rawEvents, i, interval){
        const stepBegin = moment(i).startOf(interval).valueOf()
        const stepEnd = moment(i).endOf(interval).valueOf()
        // fore every interval between min and max
        const intervalSpecs = {
            ts: stepBegin,                
            name: interval == "day"?moment(stepBegin).format("YYYY-MM-DD"):moment(stepBegin).format("HH:mm"),
            nameLong: moment(stepBegin).format("YYYY-MM-DD HH:mm"),
        }
        // console.log(`Internal Effort between ${moment(stepBegin).format("YYYY-MM-DD HH:mm")} - ${moment(stepEnd).format("YYYY-MM-DD HH:mm")}`)
        const events = rawEvents.filter((item)=>item.ct>=stepBegin&&item.ct<=stepEnd);
        const total = events.reduce((prev, curr, currentIndex)=>{
            return {
                cals: prev.cals + curr.s,
                commits: prev.commits + (curr.oper=="commit"?1:0),      
                lines: prev.lines + curr.decoded.changeSummary.inserts+curr.decoded.changeSummary.deletions,
                entropy: prev.entropy + (Number.isNaN(curr.e.e)?0:curr.e.e)
            }
        },{cals: 0, commits: 0, lines: 0, entropy: 0});
        
        total.entropy /=  events.length>0?events.length:1;

        return {
            interval: intervalSpecs,
            value: total
        }
    }
    
    movingAverage(arr, type, size) {
        if(!arr || arr.length < 4) {
            return arr || [];
        }
        if(size > arr.length) {
            size = arr.length;
        }
        let resArr = [];
        let srcArr = arr.map(val => { return Number(val); });
        let srcIdx = 0;
        let srcLength = srcArr.length;
        let isSMA = (/SMA/i.test(type));
        let isWMA = (/WMA/i.test(type));
        let isEMA = (/EMA/i.test(type));
        let isSMM = (/SMM/i.test(type));
        let isSlope = (/Slope/i.test(type));
        let isBalanced = (/^B/i.test(type));
        let halfSize = 0;
        if(!isBalanced) {
            // classic moving average (financial)
            if(isSMA) {
                srcArr.forEach(function(val, idx) {
                    let start = Math.max(0, idx - size + 1);
                    let end = Math.min(srcArr.length, idx + 1);
                    val = srcArr.slice(start, end).reduce(function(acc, v) {
                        return acc + v;
                    }, 0);
                    val = val / (end - start);
                    resArr.push(val);
                });
            } else if(isWMA) {
                srcArr.forEach(function(val, idx) {
                    let start = Math.max(0, idx - size + 1);
                    let end = Math.min(srcArr.length, idx + 1);
                    let result = srcArr.slice(start, end).reduce(function(acc, v) {
                        acc.i++;
                        acc.v += acc.i * v;
                        acc.d += acc.i;
                        return acc;
                    }, { i: 0, v: 0, d: 0});
                    val = result.v / result.d;
                    resArr.push(val);
                });
            } else if(isEMA) {
                let weight = 2 / (size + 1);
                let prevVal = srcArr[0];
                srcArr.forEach(function(val) {
                    val = (val - prevVal) * weight + prevVal;
                    resArr.push(val);
                    prevVal = val;
                });
            } else if(isSMM) {
                srcArr.forEach(function(val, idx) {
                    let start = Math.max(0, idx - size + 1);
                    let end = Math.min(srcArr.length, idx + 1);
                    let half = Math.floor((end - start) / 2);
                    val = srcArr.slice(start, end).sort()[half];
                    resArr.push(val);
                });
            } else if(isSlope) {
                let stats = srcArr.reduce(function(acc, v, idx, arry) {
                    if(idx < srcLength) {
                        let next = arry[idx+1];
                        if(next != undefined) {
                            acc.diff += next - v;
                        }
                        acc.sum += v;
                    }
                    return acc;
                }, { diff: 0, sum: 0 });
                let average = stats.sum / srcLength;
                let slope = stats.diff / (srcLength - 1);
                let val = average - slope * (srcLength + 1) / 2;
                srcArr.forEach(function(v) {
                    val += slope;
                    resArr.push(val);
                });
            }
        } else {
            // balanced moving average (technical)
            halfSize = Math.floor(size / 2);
            // preparation: calculate slope and average for halfSize width on left and right
            let stats = srcArr.reduce(function(acc, v, idx, arry) {
                if(idx <= halfSize) {
                    let next = arry[idx+1];
                    if(idx < halfSize && !Number.isNaN(next)) {
                        acc.lDiff += next - v;
                    }
                    acc.lSum += v;
                }
                if(idx >= srcLength - halfSize - 1) {
                    let prev = arry[idx-1];
                    if(idx >= srcLength - halfSize && !Number.isNaN(prev)) {
                        acc.rDiff += v - prev;
                    }
                    acc.rSum += v;
                }
                return acc;
            }, { lDiff: 0, lSum: 0, rDiff: 0, rSum: 0 });
            let lAverage = stats.lSum / (halfSize + 1);
            let lSlope = stats.lDiff / halfSize;
            let rAverage = stats.rSum / (halfSize + 1);
            let rSlope = stats.rDiff / halfSize;
            let lStartVal = lAverage - lSlope * halfSize / 2;
            let rStartVal = rAverage + rSlope * halfSize / 2 + rSlope;
            // preparation: extend srcArr on left and right side
            // extended array is assumed to be the extension of the slope of halfSize window
            let lSlopeArr = [];
            let rSlopeArr = [];
            for(let i = 0; i < halfSize; i++) {
                lSlopeArr.unshift(lStartVal - (i + 1) * lSlope);
                rSlopeArr.push(rStartVal + (i - 0) * rSlope);
            }
            srcArr = lSlopeArr.concat(srcArr, rSlopeArr);
            if(isSMA) {
                srcArr.forEach(function(val, idx) {
                    let start = Math.max(0, idx - halfSize);
                    let end = Math.min(srcArr.length, idx + halfSize + 1);
                    val = srcArr.slice(start, end).reduce(function(acc, v) {
                        return acc + v;
                    }, 0);
                    val = val / (end - start);
                    resArr.push(val);
                });
            } else if(isWMA) {
                srcArr.forEach(function(val, idx) {
                    let start = Math.max(0, idx - halfSize + 1);
                    let end = Math.min(srcArr.length, idx + 1);
                    let result = srcArr.slice(start, end).reduce(function(acc, v) {
                        acc.i++;
                        acc.v += acc.i * v;
                        acc.d += acc.i;
                        return acc;
                    }, { i: 0, v: 0, d: 0});
                    val = result.v / result.d;
                    resArr.push(val);
                });
                srcArr.reverse().forEach(function(val, idx) {
                    let start = Math.max(0, idx - halfSize + 1);
                    let end = Math.min(srcArr.length, idx + 1);
                    let result = srcArr.slice(start, end).reduce(function(acc, v) {
                        acc.i++;
                        acc.v += acc.i * v;
                        acc.d += acc.i;
                        return acc;
                    }, { i: 0, v: 0, d: 0});
                    val = result.v / result.d;
                    let rIdx = srcArr.length - idx - 1;
                    resArr[rIdx] = (resArr[rIdx] + val) / 2;
                });
            } else if(isEMA) {
                let weight = 2 / (halfSize + 1);
                let prevVal = srcArr[0];
                srcArr.forEach(function(val) {
                    val = (val - prevVal) * weight + prevVal;
                    resArr.push(val);
                    prevVal = val;
                });
                prevVal = srcArr[srcArr.length-1];
                for(let idx = srcArr.length - 1; idx >= 0; idx--) {
                    let val = srcArr[idx];
                    val = (val - prevVal) * weight + prevVal;
                    resArr[idx] = (resArr[idx] + val) / 2;
                    prevVal = val;
                };
            } else if(isSMM) {
                srcArr.forEach(function(val, idx) {
                    let start = Math.max(0, idx - halfSize);
                    let end = Math.min(srcArr.length, idx + halfSize + 1);
                    let half = Math.floor((end - start) / 2);
                    val = srcArr.slice(start, end).sort()[half];
                    resArr.push(val);
                });
            } else if(isSlope) {
                // return expanded slope on left and right, with gap in middle
                for(let i = 0; i <= halfSize; i++) {
                    lSlopeArr.push(lStartVal + i * lSlope);
                    rSlopeArr.unshift(rStartVal - (i + 1) * rSlope);
                }
                if(srcLength === 2 * halfSize + 1) {
                    resArr = lSlopeArr.concat(rSlopeArr.slice(1));
                } else if(srcLength < 2 * halfSize + 1) {
                    resArr = lSlopeArr.slice(0, -1).concat(rSlopeArr.slice(1));
                } else {
                    let nullArr = [];
                    for(let i = 0; i < srcLength - (2 * halfSize) - 2; i++) {
                        nullArr.push(null);
                    }
                    resArr = lSlopeArr.concat(nullArr, rSlopeArr);
                }
                return resArr;
            }
            resArr = resArr.slice(halfSize).slice(0, srcLength);
        }
        return resArr;
    }

    /**
     * 
     * @param {Stats} stats 
     */
    trendsTo4ValueHitmapZX(stats, effortCode, thresholds, user, beginTs, endTs){
        
        const x = [];
        const z = [[],[],[],[]];
        const intervalEfforts = stats.users.find(item=>item.user == user).efforts.filter((item)=>{
            let isBegin = beginTs?item.interval.ts>=beginTs:true;
            let isEnd = endTs?item.interval.ts<endTs:true;
            return isBegin&&isEnd
        });

        intervalEfforts.forEach((item)=>{
            x.push(item.interval.nameLong);
            const value = this.valueTo4ThresholdId(thresholds, item.value[effortCode]);
            if(item.value[effortCode]>0){
                console.log(`${item.value[effortCode]} => ${value}`)
            }
            switch(value){
                case 0:
                    z[0].push(0);
                    z[1].push(null);
                    z[2].push(null);
                    z[3].push(null);
                    break;
                case 1:
                    z[0].push(1);
                    z[1].push(1);
                    z[2].push(null);
                    z[3].push(null);
                    break;
                case 2:
                    z[0].push(2);
                    z[1].push(2);
                    z[2].push(2);
                    z[3].push(null);
                    break;
                case 3:
                    z[0].push(3);
                    z[1].push(3);
                    z[2].push(3);
                    z[3].push(3);
                    break;
            }

            
        })
        // z: [
        //     [0, 1, 2, 3, 3], 
        //     [null, 1, 2, 3, 3], 
        //     [null, undefined, 2, 3, 3],
        //     [undefined, undefined, undefined, 3, 3]
        //   ],
        //   x: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        return {
            z: z,
            x: x
        }
    }

    valueTo4ThresholdId(thresholds, value){
        let result = 0;        
        const thresholdsArray = thresholds.split(",");
        for(let i=1; i<=4; i++){
            if((!thresholdsArray[i])||value<thresholdsArray[i]){
                result = i-1;
                break;
            }
        }
        return result;
    }
}