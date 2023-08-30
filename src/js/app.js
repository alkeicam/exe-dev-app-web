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
            events: [],
            performance: {
                topPerformers: [],
                topPerformersToday: [],
                topPerformers7d: [],
                topCommitersToday: [],
                topCommiters7d: [],
                topCommiters14d: [],
                topSLOCToday: [],
                topSLOC7d: [],
                topSLOC14d: [],
            },
            // id: id,
            // label: fileMetadata?.fileName||"Untitled",
            // dirty: fileMetadata?false:true,
            // active: true,
            // parent: this,
            // fileMetadata: fileMetadata||{}
            
            handlers: {
            },
            process:{
                step: "PREPARE" // PREPARE // WORKOUT                
            },
            forms:{
                f1: {
                    f1: {
                        v: "",
                        e: {
                            code: 0,
                            message: "OK"
                        }
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


    static async getInstance(emitter, container){                
        const a = new AppDemo(emitter, container)
        let last15DaysMs = moment().startOf("day").add(-14,"days").valueOf();
        const events15days = await BackendApi.getAccountEventsSince("a_execon", last15DaysMs);                                
        a.model.performance.topPerformers = a._performance(events15days).sort((a,b)=>b.s-a.s);
        a.model.performance.topCommiters14d = a._performance(events15days).sort((a,b)=>b.c-a.c);
        a.model.performance.topSLOC14d = a._performance(events15days).sort((a,b)=>b.l-a.l);

        let todayMs = moment().startOf("day").valueOf();
        const eventsToday = await BackendApi.getAccountEventsSince("a_execon", todayMs);                                
        a.model.performance.topPerformersToday = a._performance(eventsToday).sort((a,b)=>b.s-a.s);
        a.model.performance.topCommitersToday = a._performance(eventsToday).sort((a,b)=>b.c-a.c);
        a.model.performance.topSLOCToday = a._performance(eventsToday).sort((a,b)=>b.l-a.l);
        
        let days7Ms = moment().startOf("day").add(-7,"days").valueOf();
        const eventsdays7 = await BackendApi.getAccountEventsSince("a_execon", days7Ms);                                
        a.model.performance.topPerformers7d = a._performance(eventsdays7).sort((a,b)=>b.s-a.s);
        a.model.performance.topCommiters7d = a._performance(eventsdays7).sort((a,b)=>b.c-a.c);
        a.model.performance.topSLOC7d = a._performance(eventsdays7).sort((a,b)=>b.l-a.l);
        
        return a;
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

