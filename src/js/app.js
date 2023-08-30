class AppDemo {
    
    constructor(emitter, container) {
        this.CONST = {
        }
        this.emitter = emitter
        this.container = container;
        
        
        
        this.model = {
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
        that.populatePerformers(that.model.events["c_0"], "c_0", selectedProjectId!=-1?selectedProjectId:undefined);
        that.populatePerformers(that.model.events["c_1"], "c_1", selectedProjectId!=-1?selectedProjectId:undefined);
        that.populatePerformers(that.model.events["l_7"], "l_7", selectedProjectId!=-1?selectedProjectId:undefined);
        that.populatePerformers(that.model.events["l_14"], "l_14", selectedProjectId!=-1?selectedProjectId:undefined);
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

    static async getInstance(emitter, container){                
        const a = new AppDemo(emitter, container)
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

        // project perspective
        

        await a._loadAccount("a_execon");


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


    getQueryParam(paramName){
        const urlParams = new URLSearchParams(window.location.search);
        const myParam = urlParams.get(paramName);
        return myParam;
    }
}

