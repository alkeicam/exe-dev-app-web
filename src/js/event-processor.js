class EventProcessor{
    /**
     * Calculates stats from provided events. Stats are calculated per user basis per day, raw and moving averages for effort are calculated
     * @param {*} events target events
     * @param {*} window window for moving average calculations
     * @param {*} interval one of "day" or "hour", when day then events should span multiple days, when hour events should span multiple hours in a single day
     * @returns {Stats} stats for events provided, grouped by users and days, with moving average calculated using provided window
     */
    userTrends(events, window){
        const result = {
            days: this.daysFromEvents(events),
            users: [], //[{user, daily: [{cals:,commits:,lines:}]}],            
            usersMa: [] //[{user, daily: [{cals:,commits:,lines:}]}],
        }

        const minMaxTs = this.windowTsFromEvents(events)



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
            const userStats = this.dailyEffort(events.filter((item)=>item.user == user), minMaxTs.minTs, minMaxTs.maxTs);
            users.push({
                user: user,
                daily: userStats
            })    

            const userCals = userStats.map((item)=>item.value.cals);
            const userCommits = userStats.map((item)=>item.value.commits);
            const userLines = userStats.map((item)=>item.value.lines);
            const userEntropy = userStats.map((item)=>item.value.entropy);

            const userCalsMa = this.movingAverage(userCals, "SMA", window);
            const userCommitsMa = this.movingAverage(userCommits, "SMA", window);
            const userLinesMa = this.movingAverage(userLines, "SMA", window);
            const userEntropyMa = this.movingAverage(userEntropy, "SMA", window);

            const days = this.daysFromEvents(events.filter((item)=>item.user == user));

            const dailyMas = []
            for(let i=0; i<userCalsMa.length; i++){
                dailyMas.push({
                    day: days[i],
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
                daily: dailyMas
            })
            
        })

        result.users = users;
        result.usersMa = usersMa;
        return result;
    }

    /**
     * 
     * @param {*} events 
     * @param {*} window 
     * @param {*} minTs 
     * @param {*} maxTs 
     * @returns {UserIntervalStats[]}
     */
    userTrends2(events, interval, window, minTs, maxTs){

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
                    day: intervals[i],
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
     * Calculates continous single day hours array that covers today events
     * @param {*} rawEvents 
     * @returns {HourInfo[]} sorted by hour, ascending
     */
    hoursFromEvents(rawEvents){
        const result = []
        //sorted, ascending by hours, missing hours are filled with given value
        const minMaxTs = rawEvents.filter(item=>item.ct>=moment().startOf("day").valueOf()&&item.ct<moment().endOf("day").valueOf()).reduce((prev, curr)=>{
            return {
                minTs: Math.min(prev.minTs, curr.ct),
                maxTs: Math.max(prev.maxTs, curr.ct)
            }
        },{minTs: Number.MAX_SAFE_INTEGER, maxTs: -1});

        minMaxTs.minTs = moment(minMaxTs.minTs).startOf("day").valueOf();
        minMaxTs.maxTs = moment(minMaxTs.minTs).endOf("day").valueOf();

        for(let i=minMaxTs.minTs; i<=minMaxTs.maxTs; i = moment(i).add(1,"hours").valueOf()){
            // fore every hour between min and max
            const interval = {
                ts: i,                
                name: moment(i).format("HH-mm")
            }
            result.push(interval);
        }
        return result;
    }

    /**
     * Calculates continous day array that covers all dates from events
     * @param {*} rawEvents 
     * @returns {DayInfo[]} sorted by day, ascending
     */
    daysFromEvents(rawEvents){
        const result = []
        //sorted, ascending by date, missing dates are filled with given value
        const minMaxTs = rawEvents.reduce((prev, curr)=>{
            return {
                minTs: Math.min(prev.minTs, curr.ct),
                maxTs: Math.max(prev.maxTs, curr.ct)
            }
        },{minTs: Number.MAX_SAFE_INTEGER, maxTs: -1});

        minMaxTs.minTs = moment(minMaxTs.minTs).startOf("day").valueOf();
        minMaxTs.maxTs = moment(minMaxTs.maxTs).startOf("day").valueOf();

        for(let i=minMaxTs.minTs; i<=minMaxTs.maxTs; i = moment(i).add(1,"days").valueOf()){
            // fore every day between min and max
            const day = {
                ts: i,                
                dayName: moment(i).format("YYYY-MM-DD"),
            }
            result.push(day);
        }
        return result;
    }

    /**
     * Calculates time window (minTs, maxTs) from a given set of events
     * @param {*} rawEvents target events
     * @returns {minTs, maxTs} window begin and end time, truncated to day start
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
        // if min, max provided then override values from events
        if(minTs)
            minMaxTs.minTs = minTs
        if(maxTs)
            minMaxTs.maxTs = maxTs

        const begin = moment(minMaxTs.minTs).startOf(interval).valueOf()
        const end = moment(minMaxTs.maxTs).endOf(interval).valueOf()

        for(let i=begin; i<end; i = moment(i).add(1,interval.charAt(0)).valueOf()){
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
        const begin = moment(minTs).startOf(interval).valueOf()
        const end = moment(maxTs).endOf(interval).valueOf()

        for(let i=begin; i<end; i = moment(i).add(1,interval.charAt(0)).valueOf()){
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
        const events = rawEvents.filter((item)=>item.ct>=stepBegin&&item.ct<stepEnd);
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


    /**
     * Calculates dayly effort from events provided. Date range is calculated from the most recent to most old event in the function argument.
     * @param {*} rawEvents 
     * @returns {DailyStats[]} stats from events for days, sorted by day ascending
     */
    dailyEffort(rawEvents, minTs, maxTs){
        const result = [];
        

        //sorted, ascending by date, missing dates are filled with given value
        // const minMaxTs = rawEvents.reduce((prev, curr)=>{
        //     return {
        //         minTs: Math.min(prev.minTs, curr.ct),
        //         maxTs: Math.max(prev.maxTs, curr.ct)
        //     }
        // },{minTs: Number.MAX_SAFE_INTEGER, maxTs: -1});

        // minMaxTs.minTs = moment(minMaxTs.minTs).startOf("day").valueOf();
        // minMaxTs.maxTs = moment(minMaxTs.maxTs).startOf("day").valueOf();
        // const minMaxTs = this.windowTsFromEvents(rawEvents)

        for(let i=minTs; i<=maxTs; i = moment(i).add(1,"days").valueOf()){
            // fore every day between min and max
            const day = {
                ts: i,                
                dayName: moment(i).format("YYYY-MM-DD"),
            }
            const events = rawEvents.filter((item)=>item.ct>=i&&item.ct<moment(i).add(1,"days"));
            const total = events.reduce((prev, curr, currentIndex)=>{
                return {
                    cals: prev.cals + curr.s,
                    commits: prev.commits + (curr.oper=="commit"?1:0),      
                    lines: prev.lines + curr.decoded.changeSummary.inserts+curr.decoded.changeSummary.deletions,
                    entropy: prev.entropy + (Number.isNaN(curr.e.e)?0:curr.e.e)
                }
            },{cals: 0, commits: 0, lines: 0, entropy: 0});
            
            total.entropy /=  events.length>0?events.length:1;

            result.push({
                day: day,
                value: total
            })
    
        }
        return result;
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
}