/**
 * Day info object
 * @typedef {Object} DayInfo
 * @property {number} ts - start of day timestamp
 * @property {string} dayName - name of day in YYYY-MM-DD format
 */

/**
 * Interval info object
 * @typedef {Object} IntervalInfo
 * @property {number} ts - start of interval timestamp
 * @property {string} name - primary name of interval moment
 * @property {string} nameLong - secondary name of interval moment
 */

/**
 * Hour info object
 * @typedef {Object} HourInfo
 * @property {number} ts - start of hour
 * @property {string} name - name of hour in HH24:MM format
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
 * Stats for given day
 * @typedef {Object} IntervalStats
 * @property {IntervalInfo} interval - interval information
 * @property {Effort} value - interval stats
 */


/**
 * User Stats for given period
 * @typedef {Object} UserDailyStats
 * @property {string} user - user id (usually email)
 * @property {DailyStats[]} daily - day by day stats
 */

/**
 * User Stats for given period
 * @typedef {Object} UserIntervalStats
 * @property {string} user - user id (usually email)
 * @property {IntervalStats[]} stats - day by day stats
 */


/**
 * Stats
 * @typedef {Object} Stats
 * @property {DayInfo[]} days - days included in stats (ascending, continous)
 * @property {UserDailyStats[]} users - user raw performance
 * @property {UserDailyStats[]} usersMa - user moving average performance
 */

/**
 * Stats
 * @typedef {Object} IntervalStats
 * @property {IntervalInfo[]} intervals - days included in stats (ascending, continous)
 * @property {UserIntervalStats[]} users - user raw performance
 * @property {UserIntervalStats[]} usersMa - user moving average performance
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
            isManager: false,
            busy: true,
            accounts: [
                // { Account}
            ],// for account switcher
            currentAccount: undefined,// currently selected account
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
                _handleOnChangeProject: this._handleOnChangeProject.bind(this),
                _handleSwitchAccount: this._handleSwitchAccount.bind(this),
                _selectAccount: this._selectAccount.bind(this),
                _handleRefreshEvents: this._handleRefreshEvents.bind(this)
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
        const projectPerformance = this._projectPerformance(targetEvents);
        Commons.mergeObjects(this.model.projects[range], projectPerformance);
    }



    

    static async getInstance(emitter, container){                        
        const a = new AppDemo(emitter, container)
        // const accountId =  "a_execon";
        
        a.model.isManager = false;
        a.model.isOwner = false;

        const {token, user} = await BackendApi.AUTH.me();

        if(!user || !token)
            window.location = "hello.html";

        a.model.user = user;
        a.model.token = token

        try{

            await a._prepareAccounts(a.model.user);

            

            const accountAuthority = user.authority.find(item=>item.accountId == a.model.account.id);        
            if(accountAuthority){
                a.model.isManager = accountAuthority.projects.flatMap(item=>item.roles).some(item=>["MANAGER", "DIRECTOR", "OWNER"].includes(item.toUpperCase()))?true:false;
                a.model.isOwner = accountAuthority.roles.some(item=>["OWNER", "ADMIN"].includes(item.toUpperCase()))?true:false;
            }        
        
        
            // await a._loadAccount(accountId);   
            let preferredAccount = State.PREFERENCES.account()||{};     

            await a._selectAccount(preferredAccount.id||a.model.account.id);
            await a._handleRefreshEvents(undefined, a);
        }catch(error){
            console.log(error);
            window.location = "hello.html?message=Session expired. Please log in again.";
        }
        
        
        a.model.busy = false;
        return a;
    }

    async _handleSignOut(e, that){
        State.PREFERENCES.accountReset();
        await BackendApi.AUTH.signOut();
        window.location = "hello.html?message=Signed out. Please log in again.";
    }

    async _handleToggleMobileMenu(e, that){
        that.model.menu.active = !that.model.menu.active;
    }

    async _selectAccount(accountId){
        // this.model.account = await BackendApi.getAccount(accountId);
        this.model.account = this.model.accounts.find(item=>item.id == accountId);
        // store preferences
        State.PREFERENCES.account(this.model.account);
        this.model.forms.f1.f1.e = this.model.account.projects.map((item)=>{return {k: item.id, v: item.name}});
    }

    async _prepareAccounts(user){
        const accountIds = user.authority.map(item=>item.accountId);

        this.model.accounts.length = 0;

        for(let i=0; i<accountIds.length; i++){
            const account = await BackendApi.getAccount(accountIds[i]);
            this.model.accounts.push(account);
        }
        this.model.account = this.model.accounts[0];                
    }

    async _handleSwitchAccount(e, that){
        that.model.busy = true;
        const account = that.item;
        const accountId = account.id;

        // await that.model.handlers._selectAccount(accountId);
        await this._selectAccount(accountId);
        window.location = "index.html";
        that.model.busy = false;

    }

    async _handleRefreshEvents(e, that){
        that.model.busy = true;
        const accountId = that.model.account.id;
        let events = await that.populateEvents(accountId,"c_0");
        that.populatePerformers(events, "c_0");
        
        events = await that.populateEvents(accountId,"c_1");
        that.populatePerformers(events, "c_1");

        events = await that.populateEvents(accountId,"l_7");
        that.populatePerformers(events, "l_7");

        events = await that.populateEvents(accountId,"l_14");
        that.populatePerformers(events, "l_14");
        // console.log(events);

        that.populateProjects(that.model.events["c_0"],"c_0")
        that.populateProjects(that.model.events["c_1"], "c_1")
        that.populateProjects(that.model.events["l_7"], "l_7")
        that.populateProjects(that.model.events["l_14"], "l_14")

        // project perspective
        
        events = await that.populateEvents(accountId,"all_time");   
        
        await that._populateLastIncrementAndTeam();
        
        await that.populateTrends(that.model.events["all_time"],"all_time", 7);    
        
        that.model.forms.f1.f1.v = -1
        
        that.model.busy = false;
        
        
    }

    async _populateLastIncrementAndTeam(projectId){
        this.model.team.present = this.model.events.c_0.filter((item)=>!projectId||item.project==projectId).map((item)=>item.user).filter((value, index, array) => array.indexOf(value) === index);
        this.model.team.all_time = this.model.events.all_time.filter((item)=>!projectId||item.project==projectId).map((item)=>item.user).filter((value, index, array) => array.indexOf(value) === index);
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



    async populateTrends(events, range, window, projectId){
        let targetEvents = projectId?events.filter((item)=>{return item.project == projectId}):events;
        const processor = new EventProcessor();
        // this.model.trends[range] = processor.userTrends(targetEvents, window);
        // this.model.trends[range] = processor.userTrends2(targetEvents, "day", window, 1680326539000)
        // this.model.trends[range] = processor.userTrends2(targetEvents, "day", window, 1680326539000, 1701326573000)
        
        
        this.model.trends[range] = processor.userTrends(targetEvents, "day", window)
        
        
        // this.model.trends[range] = processor.userTrends(targetEvents, "day", window)
        
        // this.model.trends[range] = processor.userTrends2(targetEvents, "hour", window)
        // console.log("User trends", this.model.events[range]);
        return this.model.trends[range];
    }

    getQueryParam(paramName){
        const urlParams = new URLSearchParams(window.location.search);
        const myParam = urlParams.get(paramName);
        return myParam;
    }
}

