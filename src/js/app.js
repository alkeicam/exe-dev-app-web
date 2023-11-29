/**
 * Day info object
 * @typedef {Object} DayInfo
 * @property {number} ts - start of day timestamp
 * @property {string} dayName - name of day in YYYY-MM-DD format
 */

/**
 * Stats holder
 * @typedef {Object} Effort
 * @property {number} cals - number of calories burnt
 * @property {number} commits - number of commits made
 * @property {number} lines - number of lines affected
 * @property {number} entropy - product entropy measure
 */
/**
 * Stats for given day
 * @typedef {Object} DailyStats
 * @property {DayInfo} day - day information
 * @property {Effort} value - day stats
 */

/**
 * User Stats for given period
 * @typedef {Object} UserDailyStats
 * @property {string} user - user id (usually email)
 * @property {DailyStats[]} daily - day by day stats
 */


/**
 * Stats
 * @typedef {Object} Stats
 * @property {DayInfo[]} days - days included in stats (ascending, continous)
 * @property {UserDailyStats[]} users - user raw performance
 * @property {UserDailyStats[]} usersMa - user moving average performance
 */



class AppDemo {
    
    constructor(emitter, container) {
        this.CONST = {
        }
        this.emitter = emitter
        this.container = container;
        
        
        
        this.model = {
            user: undefined,
            token: undefined,
            busy: true,
            queryParams: {
                i: undefined
            },
            team: {
                present: []
            },
            events: {
                "c_0": [],
                "c_1": [],
                "l_7": [],
                "l_14": [],
                "all_time": [],
                "most_recent": {},
                "most_recent_increment": {}
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
            trends: {
                "all_time": {}
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
            },
            menu:{
                active: false
            }

        }
    }

    _ellipsis(text){
        if(text.length<=50)
            return text;
        return text.substring(0,18)+"..."+text.substr(text.length-28, text.length)
    }

    async _handleOnChangeProject(e, that){
        that.model.busy = true;
        try{
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

            const trends = await that.populateTrends(that.model.events.all_time,"all_time", 7, selectedProjectId!=-1?selectedProjectId:undefined);
            that.drawTrends(trends)

            await that._populateLastIncrementAndTeam(selectedProjectId!=-1?selectedProjectId:undefined);
        }
        catch(error){
            window.location = "hello.html"
        }
        

        that.model.busy = false;
    }

    async populateEvents(accountId, range){
        const specifications = range.split("_");
        // console.log(range, JSON.stringify(specifications));
        let events = []
        if(specifications[0]=="c"){
            // "c_0"
            // console.log(range, specifications[1]);
            let startMs = moment().startOf("day").add(-specifications[1],"days").valueOf();
            let endMs = moment().endOf("day").add(-specifications[1],"days").valueOf();                    
            // console.log(range, startMs, endMs)
            events = await BackendApi.getAccountEventsBetween(accountId, startMs, endMs);                                
        }else if(range.toLowerCase()=="all_time"){
            // get all events since 1.01.2022
            events = await BackendApi.getAccountEventsSince(accountId, 1640991600000); 
        }
        else{
            // "l_7"
            // console.log(range, specifications[1]);
            let startMs = moment().startOf("day").add(-specifications[1],"days").valueOf();
            // console.log(range, startMs)
            events = await BackendApi.getAccountEventsSince(accountId, startMs);                                
        }
        this.model.events[range] = events;
        return events;
    }

    populatePerformers(events, range, projectId){
        let targetEvents = projectId?events.filter((item)=>{return item.project == projectId}):events;

        this.model.performance[range].performers = this._performance(targetEvents).sort((a,b)=>b.s-a.s);
        this.model.performance[range].commiters = this._performance(targetEvents).sort((a,b)=>b.c-a.c);
        this.model.performance[range].liners = this._performance(targetEvents).sort((a,b)=>b.l-a.l);
    }

    populateProjects(events, range, projectId){
        let targetEvents = projectId?events.filter((item)=>{return item.project == projectId}):events;
        this.model.projects[range] = this._projectPerformance(targetEvents);
    }



    

    static async getInstance(emitter, container){                        
        const a = new AppDemo(emitter, container)
        
        
        const {token, user} = await BackendApi.AUTH.me();

        if(!user || !token)
            window.location = "hello.html";

        

        a.model.user = user;
        a.model.token = token
        
        try{
            await a._loadAccount("a_execon");        
            await a._handleRefreshEvents(undefined, a);
        }catch(error){
            window.location = "hello.html?message=Session expired. Please log in again.";
        }
        
        
        a.model.busy = false;
        return a;
    }

    async _handleSignOut(e, that){
        await BackendApi.AUTH.signOut();
        window.location = "hello.html?message=Signed out. Please log in again.";
    }

    async _handleToggleMobileMenu(e, that){
        that.model.menu.active = !that.model.menu.active;
    }

    async _loadAccount(accountId){
        this.model.account = await BackendApi.getAccount(accountId);
        this.model.forms.f1.f1.e = this.model.account.projects.map((item)=>{return {k: item.id, v: item.name}});
    }

    async _handleRefreshEvents(e, that){
        that.model.busy = true;
        let events = await that.populateEvents("a_execon","c_0");
        that.populatePerformers(events, "c_0");
        
        events = await that.populateEvents("a_execon","c_1");
        that.populatePerformers(events, "c_1");

        events = await that.populateEvents("a_execon","l_7");
        that.populatePerformers(events, "l_7");

        events = await that.populateEvents("a_execon","l_14");
        that.populatePerformers(events, "l_14");
        // console.log(events);

        that.populateProjects(that.model.events["c_0"],"c_0")
        that.populateProjects(that.model.events["c_1"], "c_1")
        that.populateProjects(that.model.events["l_7"], "l_7")
        that.populateProjects(that.model.events["l_14"], "l_14")

        // project perspective
        
        events = await that.populateEvents("a_execon","all_time");   
        
        await that._populateLastIncrementAndTeam();
        
        await that.populateTrends(that.model.events["all_time"],"all_time", 7);    
        
        that.model.forms.f1.f1.v = -1
        
        that.model.busy = false;
        that.drawTrends(that.model.trends.all_time);
        
    }

    async _populateLastIncrementAndTeam(projectId){
        this.model.team.present = this.model.events.c_0.filter((item)=>!projectId||item.project==projectId).map((item)=>item.user).filter((value, index, array) => array.indexOf(value) === index);
        this.model.events.most_recent = this.model.events.all_time.filter((item)=>!projectId||item.project==projectId).filter((item)=>item.oper == "commit").sort((a,b)=>b.ct-a.ct)[0];     
        this.model.events.most_recent_increment = this.model.events.all_time.filter((item)=>!projectId||item.project==projectId).filter((item)=>item.oper == "push").sort((a,b)=>b.ct-a.ct)[0];     
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

    /**
     * 
     * @param {*} rawEvents 
     * @returns 
     * @deprecated not used
     */
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

    async populateTrends(events, range, window, projectId){
        let targetEvents = projectId?events.filter((item)=>{return item.project == projectId}):events;
        const processor = new EventProcessor();
        this.model.trends[range] = processor.userTrends(targetEvents, window);
        // console.log("User trends", this.model.events[range]);
        return this.model.trends[range];
    }

    _cretePlotElement(groupId, id){

        let plotElement = document.getElementById(id);
        if(plotElement){
            plotElement.remove();                        
        }

        plotElement = document.createElement('div'); 
        plotElement.setAttribute("id", id);

        document.getElementById(groupId).appendChild(plotElement);
        
        return plotElement
    }

    async _drawStatsLinePlot(group, elementId, stats, kind, effortKey, title){
        const graphData1 = [];
        stats[kind].forEach((user)=>{
            const data = {
                x: stats.days.map(item=>item.dayName),
                y: user.daily.map(item=>item.value[effortKey]),
                mode: 'lines',
                name: user.user
            }
            graphData1.push(data);

        })

        var layout = {
            title: title,
            autosize: true,
            showlegend: true,
            // width: 500,
            legend: {
                x: 0,
                y: -0.3
            }
          };
        
        let plotElement = this._cretePlotElement(group, elementId)
        
        Plotly.newPlot(plotElement, graphData1, layout,  {displayModeBar: false, responsive: true});
    }

    /**
     * 
     * @param {Stats} userTrends 
     */
    async drawTrends(userTrends){
        // moved to html rv-plot-stats divs

        //
        // await this._drawStatsLinePlot("individualGraphs", "graphUserCals", userTrends, "users", "cals", "Daily User Calories");
        // await this._drawStatsLinePlot("individualGraphs", "graphUserCommits", userTrends, "users", "commits", "Daily User Commits");
        // await this._drawStatsLinePlot("individualGraphs", "graphUserLines", userTrends, "users", "commits", "Daily User Lines");
        // await this._drawStatsLinePlot("individualGraphs", "graphUserEntropy", userTrends, "users", "entropy", "Daily User Entropy");
        
        // await this._drawStatsLinePlot("maGraphs", "graphUserCalsMa", userTrends, "usersMa", "cals", "User Contribution");
        // await this._drawStatsLinePlot("maGraphs", "graphUserEntropyMa", userTrends, "usersMa", "entropy", "User Efficiency");
    }

    /**
     * Calculates stats from provided events. Stats are calculated per user basis per day, raw and moving averages for effort are calculated
     * @param {*} events target events
     * @param {*} window window for moving average calculations
     * @returns {Stats} stats for events provided, grouped by users and days, with moving average calculated using provided window
     */
    _userTrends(events, window){
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
            // const userStats = this.dailyEffort(events.filter((item)=>item.user == user)).map((item)=>item.value);
            const userStats = this.dailyEffort(events.filter((item)=>item.user == user));
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
     * Calculates dayly effort from events provided. Date range is calculated from the most recent to most old event in the function argument.
     * @param {*} rawEvents 
     * @returns {DailyStats[]} stats from events for days, sorted by day ascending
     */
    dailyEffort(rawEvents){
        const result = [];
        

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


    getQueryParam(paramName){
        const urlParams = new URLSearchParams(window.location.search);
        const myParam = urlParams.get(paramName);
        return myParam;
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

