class AppDemo {
    
    constructor(emitter, container) {
        this.CONST = {
        }
        this.emitter = emitter
        this.container = container;
        
        
        
        this.model = {
            user: undefined,
            queryParams: {
                i: undefined
            },
            events: {
                "c_0": [],
                "c_1": [],
                "l_7": [],
                "l_14": []
            },
            account: undefined,
            performance: {
                "c_0": {performers: [], commiters: [], liners: []},
                "c_1": {performers: [], commiters: [], liners: []},
                "l_7": {performers: [], commiters: [], liners: []},
                "l_14": {performers: [], commiters: [], liners: []},
            },
            projects: {
                "c_0": {},
                "c_1": {},
                "l_7": {},
                "l_14": {},
            },
            selectedProject: {},
            // id: id,
            // label: fileMetadata?.fileName||"Untitled",
            // dirty: fileMetadata?false:true,
            // active: true,
            // parent: this,
            // fileMetadata: fileMetadata||{}
            
            handlers: {
                _handleOnChangeProject: this._handleOnChangeProject.bind(this)
            },
            process:{
                step: "PREPARE" // PREPARE // WORKOUT                
            },
            forms:{
                f1: {
                    f1: {
                        v: "-1",
                        e: {
                            code: 0,
                            message: "OK"
                        },
                        e: [{k: "p1", v:"Projekt #1"}]
                    }
                }                
            }

        }
    }

    _ellipsis(text){
        if(text.length<=50)
            return text;
        return text.substring(0,18)+"..."+text.substr(text.length-28, text.length)
    }

    _handleOnChangeProject(e, that){
        const selectedProjectId = that.model.forms.f1.f1.v; 
        that.model.selectedProject = that.model.account.projects.find((item)=>item.id == selectedProjectId);
        that.populatePerformers(that.model.events["c_0"], "c_0", selectedProjectId!=-1?selectedProjectId:undefined);
        that.populatePerformers(that.model.events["c_1"], "c_1", selectedProjectId!=-1?selectedProjectId:undefined);
        that.populatePerformers(that.model.events["l_7"], "l_7", selectedProjectId!=-1?selectedProjectId:undefined);
        that.populatePerformers(that.model.events["l_14"], "l_14", selectedProjectId!=-1?selectedProjectId:undefined);

        that.populateProjects(that.model.events["c_0"], "c_0", selectedProjectId!=-1?selectedProjectId:undefined);
        that.populateProjects(that.model.events["c_1"], "c_1", selectedProjectId!=-1?selectedProjectId:undefined);
        that.populateProjects(that.model.events["l_7"], "l_7", selectedProjectId!=-1?selectedProjectId:undefined);
        that.populateProjects(that.model.events["l_14"], "l_14", selectedProjectId!=-1?selectedProjectId:undefined);
    }

    async populateEvents(accountId, range){
        const specifications = range.split("_");
        console.log(range, JSON.stringify(specifications));
        let events = []
        if(specifications[0]=="c"){
            // "c_0"
            console.log(range, specifications[1]);
            let startMs = moment().startOf("day").add(-specifications[1],"days").valueOf();
            let endMs = moment().endOf("day").add(-specifications[1],"days").valueOf();                    
            console.log(range, startMs, endMs)
            events = await BackendApi.getAccountEventsBetween(accountId, startMs, endMs);                                
        }else{
            // "l_7"
            console.log(range, specifications[1]);
            let startMs = moment().startOf("day").add(-specifications[1],"days").valueOf();
            console.log(range, startMs)
            events = await BackendApi.getAccountEventsSince(accountId, startMs);                                
        }
        this.model.events[range] = events;
        return events;
    }

    populatePerformers(events, range, accountId){
        let targetEvents = accountId?events.filter((item)=>{return item.project == accountId}):events;

        this.model.performance[range].performers = this._performance(targetEvents).sort((a,b)=>b.s-a.s);
        this.model.performance[range].commiters = this._performance(targetEvents).sort((a,b)=>b.c-a.c);
        this.model.performance[range].liners = this._performance(targetEvents).sort((a,b)=>b.l-a.l);
    }

    populateProjects(events, range, accountId){
        let targetEvents = accountId?events.filter((item)=>{return item.project == accountId}):events;
        this.model.projects[range] = this._projectPerformance(targetEvents);
    }



    

    static async getInstance(emitter, container){                
        const a = new AppDemo(emitter, container)
        if(!window.location.origin.toLowerCase().startsWith("http://")){
            a.model.user = await BackendApi.getUser();
            if(!a.model.user)
                window.location = "/.auth/login/aad"
        }

        
        await a._loadAccount("a_execon");
        // account perspective
        // let last15DaysMs = moment().startOf("day").add(-14,"days").valueOf();
        // a.model.events.last14d = await BackendApi.getAccountEventsSince("a_execon", last15DaysMs);                                
        // a.model.performance.topPerformers = a._performance(a.model.events.last14d).sort((a,b)=>b.s-a.s);
        // a.model.performance.topCommiters14d = a._performance(a.model.events.last14d).sort((a,b)=>b.c-a.c);
        // a.model.performance.topSLOC14d = a._performance(a.model.events.last14d).sort((a,b)=>b.l-a.l);
        
        let events = await a.populateEvents("a_execon","c_0");
        a.populatePerformers(events, "c_0");

        events = await a.populateEvents("a_execon","c_1");
        a.populatePerformers(events, "c_1");

        events = await a.populateEvents("a_execon","l_7");
        a.populatePerformers(events, "l_7");

        events = await a.populateEvents("a_execon","l_14");
        a.populatePerformers(events, "l_14");
        console.log(events);

        a.populateProjects(a.model.events["c_0"],"c_0")
        a.populateProjects(a.model.events["c_1"], "c_1")
        a.populateProjects(a.model.events["l_7"], "l_7")
        a.populateProjects(a.model.events["l_14"], "l_14")

        // project perspective
        

        const trends = await a.populateTrends("a_execon");
        a.drawTrends(trends)

        return a;
    }

    async _loadAccount(accountId){
        this.model.account = await BackendApi.getAccount(accountId);
        this.model.forms.f1.f1.e = this.model.account.projects.map((item)=>{return {k: item.id, v: item.name}});
    }

    

    _performance(events){
        const performers = [];

        events.forEach((item)=>{
            let user = performers.find((performer)=>performer.user == item.user)
            if(!user){
                user = {
                    s: 0, 
                    c: 0,
                    l: 0,
                    user: item.user}
                performers.push(user);
            }
            user.s += item.s;
            user.c += item.oper.toLowerCase()=="commit"?1:0
            user.l += item.decoded.changeSummary.inserts
            user.l += item.decoded.changeSummary.deletions
        })
        

        return performers;
    }

    _projectPerformance(events){
        const performance = {
            s: 0,
            c: 0,
            l: 0
        };

        events.forEach((item)=>{            
            performance.s += item.s;
            performance.c += item.oper.toLowerCase()=="commit"?1:0
            performance.l += item.decoded.changeSummary.inserts
            performance.l += item.decoded.changeSummary.deletions
        })
        

        return performance;
    }

    _groupByDayInfo(rawEvents){
        const dayEvents = []

        // get unique days timestamps from all events sorted
        const uniqueDayTss = rawEvents.map((event)=>moment(event.ct).startOf("day").valueOf()).filter((value, index, array)=>array.indexOf(value) === index).sort((a,b)=>b-a);

        uniqueDayTss.forEach((dayTs)=>{
            rawEvents.filter((event)=>moment(event.ct).startOf("day").valueOf()==dayTs).forEach((event)=>{
                let dayEvent = dayEvents.find((item)=>item.day.ts==dayTs);
                if(!dayEvent){
                    dayEvent = {
                        day: {
                            ts: dayTs,
                            today: dayTs>=moment().startOf("day").valueOf()?true:false,
                            daysAgo: moment(dayTs).endOf("day").add(-8,"hours").fromNow(), // -8 hours for "a day ago"
                            daysAgoMs: moment(dayTs).endOf("day").add(-8,"hours"), // -8 hours for "a day ago"
                            dayName: moment(dayTs).format("dddd"),
                            dayName: moment(dayTs).format("YYYY-MM-DD"),
                        },            
                        events  : []
                    }
                    dayEvents.push(dayEvent)
                }
                
                // most recent are presented as "days ago"
                dayEvent.day.daysAgo = dayTs>dayEvent.day.daysAgoMs?moment(dayTs).endOf("day").add(-8,"hours").fromNow():dayEvent.day.daysAgoMs;
                dayEvent.day.daysAgoMs = dayTs>dayEvent.day.daysAgoMs?dayTs:dayEvent.day.daysAgoMs;

                dayEvent.events.push(event);
            })
        })

        return dayEvents;       
    }

    async populateTrends(accountId){
        // get all events since 1.01.2022
        const events = await BackendApi.getAccountEventsSince(accountId, 1640991600000); 
        const userTrends = this._userTrends(events, 2);
        console.log("User trends", userTrends);
        return userTrends;
    }

    async drawTrends(userTrends){
        const graphData1 = [];
        userTrends.users.forEach((user)=>{
            const data = {
                x: userTrends.days.map(item=>item.dayName),
                y: user.daily.map(item=>item.cals),
                mode: 'lines',
                name: user.user
            }
            graphData1.push(data);

        })

        var layout = {
            title:'Daily User Calories'
          };
          
        Plotly.newPlot('graphUserCals', graphData1, layout,  {displayModeBar: false});

        const graphData2 = [];
        userTrends.users.forEach((user)=>{
            const data = {
                x: userTrends.days.map(item=>item.dayName),
                y: user.daily.map(item=>item.commits),
                mode: 'lines',
                name: user.user
            }
            graphData2.push(data);

        })

        var layout = {
            title:'Daily User Commits'
        };
          
        Plotly.newPlot('graphUserCommits', graphData2, layout,  {displayModeBar: false});

        const graphData3 = [];
        userTrends.users.forEach((user)=>{
            const data = {
                x: userTrends.days.map(item=>item.dayName),
                y: user.daily.map(item=>item.lines),
                mode: 'lines',
                name: user.user
            }
            graphData3.push(data);

        })

        var layout = {
            title:'Daily User Lines'
        };
          
        Plotly.newPlot('graphUserLines', graphData3, layout,  {displayModeBar: false});

        const graphData4 = [];
        userTrends.usersMa.forEach((user)=>{
            const data = {
                x: userTrends.days.map(item=>item.dayName),
                y: user.daily.map(item=>item.cals),
                mode: 'lines',
                name: user.user
            }
            graphData4.push(data);

        })

        var layout = {
            title:'Effort trend'
        };
          
        Plotly.newPlot('graphUserCalsMa', graphData4, layout,  {displayModeBar: false});

        graphUserCalsMa
    }

    _userTrends(events, window){
        // day by day calories (per user and average)
        // [
        //     day:,
            // users: [{user:, cal:, commits, lines, calMa, }]
        //     quantiles: {cals: {25, 50, 75, 90}, commits: {}, lines: {}}, // over users
        //     mas : {cals, commits, lines} //  days moving average daily cals over all users
        // ]

        const result = {
            days: this.daysFromEvents(events),
            users: [], //[{user, daily: [{cals:,commits:,lines:}]}],            
            usersMa: [] //[{user, daily: [{cals:,commits:,lines:}]}],
        }



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
            const userStats = this.byDays(events.filter((item)=>item.user == user)).map((item)=>item.value);
            users.push({
                user: user,
                daily: userStats
            })    

            const userCals = userStats.map((item)=>item.cals);
            const userCommits = userStats.map((item)=>item.commits);
            const userLines = userStats.map((item)=>item.lines);

            const userCalsMa = this.movingAverage(userCals, "SMA", window);
            const userCommitsMa = this.movingAverage(userCommits, "SMA", window);
            const userLinesMa = this.movingAverage(userLines, "SMA", window);

            const dailyMas = []
            for(let i=0; i<userCalsMa.length; i++){
                dailyMas.push({
                    cals: userCalsMa[i],
                    commits: userCommitsMa[i],
                    lines: userLinesMa[i]
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

        





        // const eventsByDay = this._groupByDayInfo(events);

        // eventsByDay.forEach((dayEvents)=>{            
        //     // single day events

        //     const dayData = {
        //         day: dayEvents.day,
        //         users: [],
        //         quantiles: {},
        //         mas: {}

        //     }
        //     // average for last n days for user
        //     let userAvgs = (user, days, tillDay)=>{

        //     }

        //     const users = [];
        //     for(let i=0; i<dayEvents.length; i++){
        //         const event = dayEvents[i];
        //     }   
        //     dayEvents.events.forEach((event)=>{
        //         let user = users.find((item)=>item.user == event.user);
        //         if(!user){
        //             user = {user: "", cals: 0, commits: 0, lines: 0, calsMa: 0, commitsMa: 0, linesMa: 0}
        //             users.push(user);
        //         }
        //         user.cals += event.s;
        //         user.commits += event.oper == "commit"?1:0;
        //         user.lines += event.decoded.changeSummary.inserts+event.decoded.changeSummary.deletions;
        //         // ma???
        //     })
        //     users.forEach()
        //     // for each user calculate its ma for given day

            

        //     // let users = dayEvents.events.reduce((prev, curr, cidx, arr)=>{},{user: "", cals: 0, commits: 0, lines: 0, calsMa: 0, commitsMa: 0, linesMa: 0})
        //     let quantile =  users.reduce((prev, curr, cidx, arr)=>{},{cals: {25: 0, 50: 0, 75:0, 90:0}, commits: {25: 0, 50: 0, 75:0, 90:0}, lines: {25: 0, 50: 0, 75:0, 90:0}})
        //     let mas: // average over all events

        //     //{day, events} = dayEvents;
            
        // })



    }

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
                dayName: moment(i).format("dddd"),
                dayName: moment(i).format("YYYY-MM-DD"),
            }
            result.push(day);
        }
        return result;
    }

    byDays(rawEvents){
        const result = [];
        // {
        //     day:
        //     avg: {c
        //         als:
        //         commits:
        //         lines:
        //     }
        // }

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
                dayName: moment(i).format("dddd"),
                dayName: moment(i).format("YYYY-MM-DD"),
            }
            const events = rawEvents.filter((item)=>item.ct>=i&&item.ct<moment(i).add(1,"days"));
            const total = events.reduce((prev, curr)=>{
                return {
                    cals: prev.cals + curr.s,
                    commits: prev.commits + (curr.oper=="commit"?1:0),      
                    lines: prev.lines + curr.decoded.changeSummary.inserts+curr.decoded.changeSummary.deletions
                }
            },{cals: 0, commits: 0, lines: 0});
            
            result.push({
                day: day,
                value: total
            })
 
        }
        return result;
    }


    getQueryParam(paramName){
        const urlParams = new URLSearchParams(window.location.search);
        const myParam = urlParams.get(paramName);
        return myParam;
    }

    // sort array ascending
    // const asc = arr => arr.sort((a, b) => a - b);

    // const quantile = (arr, q) => {
    //     const sorted = asc(arr);
    //     const pos = (sorted.length - 1) * q;
    //     const base = Math.floor(pos);
    //     const rest = pos - base;
    //     if (sorted[base + 1] !== undefined) {
    //         return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    //     } else {
    //         return sorted[base];
    //     }
    // };

    // const calculateItemsSum = (data, start, stop) => {
    //     let sum = 0;
    //       for (let j = start; j < stop; ++j) {
    //           sum += data[j];
    //     }
    //       return sum;
    // };
    
    // const caculateMovingAverage = (data, window) => {
    //     const steps = data.length - window;
    //     const result = [ ];
    //     for (let i = 0; i < steps; ++i) {
    //         const sum = calculateItemsSum(data, i, i + window);
    //         result.push(sum / window);
    //     }
    //       return result;
    // };
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

