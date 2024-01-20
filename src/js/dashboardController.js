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
            entity: {
                //id
            },
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
            account: {},
            participant: undefined,            
            // id: id,
            // label: fileMetadata?.fileName||"Untitled",
            // dirty: fileMetadata?false:true,
            // active: true,
            // parent: this,
            // fileMetadata: fileMetadata||{}
            
            handlers: {                
                _handleSwitchAccount: this._handleSwitchAccount.bind(this),
                _selectAccount: this._selectAccount.bind(this),                
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

            dashboards: [],
            playlist: {}
        }
    }

    static async getInstance(emitter, container){               
        
        const a = new Controller(emitter, container)
        // const accountId =  "a_execon";
        
        a.model.account.id = Controller.getQueryParam("a");
        a.model.playlist.id = Controller.getQueryParam("p");
        a.model.playlist.secret = Controller.getQueryParam("s");
        a.model.playlist.item = Controller.getQueryParam("i")||0;
        const timeout = Controller.getQueryParam("t")||15000;


        // a.model.isManager = false;
        // a.model.isOwner = false;

        // const {token, user} = await BackendApi.AUTH.me();


        // if(!user || !token)
        //     window.location = "hello.html";

        // a.model.user = user;
        // a.model.token = token

        try{
            
            await a._populatePlaylist(a.model.account.id, a.model.playlist.id, a.model.playlist.secret);            

            await a._activateDashboard(a.model.playlist.item);
            
            // play playlit
            setTimeout(()=>{
                    let nextId = ++a.model.playlist.item;
                    if(nextId>a.model.dashboards.length-1)
                        nextId = 0
                    window.location = `dashboard.html?a=${a.model.account.id}&p=${a.model.playlist.id}&i=${nextId}&t=${timeout}&s=${a.model.playlist.secret}`;
            }, timeout);
            


            a.model.busy = false;

        }catch(error){
            console.log(error);
            // setTimeout(()=>{
            //     window.location = "hello.html?message=Session expired. Please log in again.";
            // }, 10500);
            
        }                        
        return a;
    }


    async _populatePlaylist(accountId, playlistId, secret){
        const dashboards = await BackendApi.ACCOUNTS.getPlaylist(accountId, playlistId, secret);
        this.model.dashboards.length = 0;
        dashboards.forEach(element => {
            this.model.dashboards.push(element);
        });
    }

    async _populateDashboards(){
        const dashboards = await BackendApi.ACCOUNTS.getDashboards(this.model.account.id);
        this.model.dashboards.length = 0;
        dashboards.forEach(element => {
            this.model.dashboards.push(element);
        });
    }
    
    async _activateDashboard(dashboardId){

        if(Number.isInteger(Number.parseInt(dashboardId))){
            const dashboard = this.model.dashboards[dashboardId]
            this.model.entity = dashboard;        
        }        
        else{
            const dashboard = this.model.dashboards.find(item=>item.id == dashboardId);
            this.model.entity = dashboard;        
        }
        
    }

 



    

// helper methods
    _ellipsis(text){
        if(text.length<=50)
            return text;
        return text.substring(0,18)+"..."+text.substr(text.length-28, text.length)
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

    static getQueryParam(paramName){
        const urlParams = new URLSearchParams(window.location.search);
        const myParam = urlParams.get(paramName);
        return myParam;
    }    
}

