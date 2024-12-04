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
 * @typedef {Object} IntervalEffort
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
 * @property {IntervalEffort[]} efforts - day by day stats
 */


// /**
//  * Stats
//  * @typedef {Object} Stats
//  * @property {DayInfo[]} days - days included in stats (ascending, continous)
//  * @property {UserDailyStats[]} users - user raw performance
//  * @property {UserDailyStats[]} usersMa - user moving average performance
//  */

/**
 * Stats
 * @typedef {Object} Stats
 * @property {IntervalInfo[]} intervals - days included in stats (ascending, continous)
 * @property {UserIntervalStats[]} users - user raw performance
 * @property {UserIntervalStats[]} usersMa - user moving average performance
 */



class Controller {
    
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
            projectInfo: {},
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
            rawEvents: [],
            account: undefined,
            participant: undefined,
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
                // _handleOnChangeProject: this._handleOnChangeProject.bind(this),
                _handleSwitchAccount: this._handleSwitchAccount.bind(this),
                _selectAccount: this._selectAccount.bind(this),                
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
            },
            plot: {
                today: {
                    z: [[],[],[],[]],
                    x: [],
                }
            },
            userProjectsStats: {},
            views: {
                weeklyGraph: {
                    title: 'Weekly calories',
                    redrawTs: -1,
                    doAverage: true,
                    traces: {
                        // "some": {
                        //     values: [],
                        //     timestamps: []
                        // }
                    }
                },
                teamMetrics: {
                    value: "",
                    filter: ".*"
                }
            }

        }
    }

    static async getInstance(emitter, container){   
        
        const id = Commons.getQueryParam("i");

        
        const a = new Controller(emitter, container)
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
            
            // await a._loadAccount(accountId);   
            let preferredAccount = State.PREFERENCES.account()||{};     

            await a._selectAccount(preferredAccount.id||a.model.account.id);
 
            const accountAuthority = user.authority.find(item=>item.accountId == a.model.account.id);        
            if(accountAuthority){
                a.model.isManager = accountAuthority.projects.flatMap(item=>item.roles).some(item=>["MANAGER", "DIRECTOR", "OWNER"].includes(item.toUpperCase()))?true:false;
                a.model.isOwner = accountAuthority.roles.some(item=>["OWNER", "ADMIN"].includes(item.toUpperCase()))?true:false;
            }        
                
            

            const projectInfos = await BackendApi.PROJECTS.getProjectInfo(a.model.account.id, id);
            const projectInfo = projectInfos[0];
            a.model.projectInfo = projectInfo            
            // await a._weeklyCaloriesUpdate("next", 52);
            
            
            await a._weeklyCaloriesUpdate(a.model.account.id, a.model.projectInfo.project.id, Date.now(), "next", 52)
            
            


            // const weeklyData = EventProcessor.aggregateCaloriesByWeek(a.model.events['w_52'], -1, Date.now()) 
            // weeklyData.timestamps = weeklyData.timestamps.map(item=>moment(item).format('YYYY-MM[ (W]WW[)]'));
            // a.model.views.weeklyGraph.traces = {
            //     "Weekly project calories": weeklyData
            // }
            // a.model.views.weeklyGraph.redrawTs = Date.now();            


        }catch(error){
            console.log(error);
            window.location = `hello.html?message=Session expired. Please log in again.&url=${Commons.getCurrentPathAndParams()}`;
        }                
        a.model.busy = false;
        return a;
    }

        

    async populateEvents(accountId, projectId, range, referenceDateTs ){        
        this.model.events[range] = await this.loadEvents(accountId, projectId, range, referenceDateTs )

        return this.model.events[range];
    }

    
    async _weeklyCaloriesUpdate(accountId, projectId, baseReferenceTs, direction, window){
        
        // let referenceTs = baseReferenceTs>Date.now()?Date.now():baseReferenceTs;
        
        
        const newRedrawTs = Commons.rebaseTs(baseReferenceTs, direction=="prev"?-window:window, 'weeks', true);
        const newStartTs = Commons.rebaseTs(newRedrawTs, -window, 'weeks', true);        
        
        const events = await CommonsApp.loadEventsForProject(accountId, projectId, `w_${window}`, newRedrawTs)
        const weeklyData = EventProcessor.aggregateCaloriesByWeek(events, newStartTs, newRedrawTs, true);

        weeklyData.timestamps = weeklyData.timestamps.map(item=>moment(item).format('YYYY-MM[ (W]WW[)]'));
        this.model.views.weeklyGraph.traces = {
            "Weekly project calories": weeklyData
        }
        this.model.views.weeklyGraph.redrawTs = newRedrawTs;            
    }

    async _handleChangeWeeklyCalories(e, that){
        that.model.busy = true
        const direction = e.target.dataset.dir
        try{
            await that._weeklyCaloriesUpdate(that.model.account.id, that.model.projectInfo.project.id, that.model.views.weeklyGraph.redrawTs, direction, 52);
            
        }catch(error){
            window.location = `hello.html?message=Session expired. Please log in again.&url=${Commons.getCurrentPathAndParams()}`;
        }
        finally{
            that.model.busy = false
            // hack to redraw graph when busy indicator is hidden
            that.model.views.weeklyGraph.redrawTs++;                        
        }
        

    }

    // ====== standard methods

    async _prepareAccounts(user){
        const accountIds = user.authority.map(item=>item.accountId);

        this.model.accounts.length = 0;

        for(let i=0; i<accountIds.length; i++){
            const account = await BackendApi.getAccount(accountIds[i]);
            this.model.accounts.push(account);
        }
        this.model.account = this.model.accounts[0];                
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

    async _handleSwitchAccount(e, that){
        that.model.busy = true;
        const account = that.item;
        const accountId = account.id;

        // await that.model.handlers._selectAccount(accountId);
        await this._selectAccount(accountId);
        window.location = "index.html";
        that.model.busy = false;

    }  
    
    async _handleFilter(e, that){
        // console.log(that.model.views.teamMetrics.value, that.model.views.teamMetrics.filter)
        that.model.views.teamMetrics.filter = that.model.views.teamMetrics.value?`.*${that.model.views.teamMetrics.value}.*`:`.*`;
    }
}

