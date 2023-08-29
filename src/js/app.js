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
                topPerformers: []
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
        const events = await BackendApi.getAccountEventsSince("a_execon", last15DaysMs);                        
        a.model.events = events;
        a._topPerformers(events);
        return a;
    }

    _topPerformers(events){
        const performers = [];

        events.forEach((item)=>{
            let user = performers.find((performer)=>performer.user == item.user)
            if(!user){
                user = {s: 0, user: item.user}
                performers.push(user);
            }
            user.s += item.s;
        })

        performers.sort((a,b)=>{return a.s-b.s});

        this.model.performance.topPerformers = performers
    }
    
    async drawPlot(){
        if(this.container){
            if(!this.model.last9DaysMessages)
                return;

            if(this.model.last9DaysMessages.length == 0)
                return;
                            
            var commits = {
                x: this.model.last9DaysMessages.map((item)=>{return item.day.daysAgo}).reverse(),
                y: this.model.last9DaysMessages.map((item)=>{
                    if(!item.users[0])
                        return 0;
                    return item.users[0].commitCnt
                }).reverse(),
                name: 'Commits',
                type: 'bar'
            }   
            var pushes = {
                x: this.model.last9DaysMessages.map((item)=>{return item.day.daysAgo}).reverse(),
                y: this.model.last9DaysMessages.map((item)=>{
                    if(!item.users[0])
                        return 0;
                    return item.users[0].pushCnt
                }).reverse(),
                name: 'Pushes',
                type: 'bar'
            }   
            var calories = {
                x: this.model.last9DaysMessages.map((item)=>{return item.day.daysAgo}).reverse(),
                y: this.model.last9DaysMessages.map((item)=>{
                    if(!item.users[0])
                        return 0;
                    return item.users[0].score
                }).reverse(),
                name: 'Calories',
                type: 'scatter'
            }             

            var pace = {
                x: this.model.last9DaysMessages.map((item)=>{return item.day.daysAgo}).reverse(),
                y: this.model.last9DaysMessages.map((item)=>{
                    if(!item.users[0])
                        return 0;
                    return item.users[0].paceScore
                }).reverse(),
                name: 'Pace',
                type: 'bar'
            }        

            
                
            // var trace1 = {
            //     x: ['giraffes', 'orangutans', 'monkeys'],
            //     y: [20, 14, 23],
            //     name: 'SF Zoo',
            //     type: 'bar'
            //   };
              
            //   var trace2 = {
            //     x: ['giraffes', 'orangutans', 'monkeys'],
            //     y: [12, 18, 29],
            //     name: 'LA Zoo',
            //     type: 'bar'
            //   };
              
            //   var data = [calories, pushes, commits];
              var data = [pushes, commits, calories];
              
              var layout = {barmode: 'stack'};
              
              Plotly.newPlot(this.container, data, layout, {displayModeBar: false});
        }                  
    }
    async drawHeatmap(){
        if(this.container){
            if(!this.model.last9DaysMessages)
                return;

            if(this.model.last9DaysMessages.length == 0)
                return;

            // const last = this.model.last9DaysMessages.map((item)=>{return item.day.daysAgo}).reverse()
            const last = this.model.last9DaysMessages
                            
            var data = [
                {
                    // z[i][] - y czyli 24 godziny (24 tabele)
                    // z[][i] - wartosc to ilosc zdarzen w danym dniu tygodnia (czyli tyle wartosci ile dni - 9)
                    // z[0][i] - y
                    // z[j][0] - x
                    z: [[1, null, 30, 50, 1], [20, 1, 60, 80, 30], [30, 60, 1, -10, 20]],
                    x: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                    y: ['Morning', 'Afternoon', 'Evening'],
                    type: 'heatmap',
                    hoverongaps: false
                }
                ];
              
              
            // var layout = {barmode: 'stack'};
              
            //   Plotly.newPlot("heatmapGraph", data, layout, {displayModeBar: false});
            Plotly.newPlot('heatmapGraph', data);
        }                  
    }
    
    async showData2(message){
        let that = this;
        console.log(`${Date.now()} Got message`, message);  

        if(!message) return;

        let todayMessage = message.find((item)=>{return item.day.today == true});
        console.log(`todayMessage`, todayMessage); 

        todayMessage.users.sort((a,b)=>{return b.score-a.score});
        todayMessage.users.forEach((user)=>{
            user.projects.sort((a,b)=>{return b.score-a.score});
            user.work = moment.duration(user.duration).humanize();
            user.projects.forEach((project)=>{
                project.tasks.sort((a,b)=>{return b.score-a.score});
                project.work = moment.duration(project.duration).humanize()
                project.id = this._ellipsis(project.id)                
                project.hide = Object.keys(that.model.messages).length>0&&that.model.messages.users&&that.model.messages.users.length>0&&that.model.messages.users.find((item)=>{return item.id == user.id}).projects.find((item)=>{return item.id == project.id})?that.model.messages.users.find((item)=>{return item.id == user.id}).projects.find((item)=>{return item.id == project.id}).hide:true
                project.tasks.forEach((task)=>{
                    task.work = moment.duration(task.duration).humanize()
                    // task.id = task.id?task.id:"Unnamed Task"
                })
            })
        });   

        
        
        // a.model.messages.push(message.decoded);
        this.model.messages = todayMessage;
        this.model.last9DaysMessages = message;
        this.drawPlot();
        // this.drawHeatmap();

        if(this.model.messages.users.length >= 1){
            this.model.process.step = "WORKOUT"
        }else{
            this.model.process.step = "PREPARE";
        }                
    }

    async handleHide(e, that){
        that.project.hide = true;
        // console.log(that);
    }

    async handleUnhide(e, that){
        that.project.hide = false;
        // console.log(that);
    }

    handleCloseErrorMessage(e, that){
        that.model.errorMessage = undefined;
    }

    getQueryParam(paramName){
        const urlParams = new URLSearchParams(window.location.search);
        const myParam = urlParams.get(paramName);
        return myParam;
    }
}

