class Controller {
    
    constructor(emitter, container) {
        this.CONST = {
        }
        this.emitter = emitter
        this.container = container;
        
        
        
        this.model = {
            projects: [],


            ///////
            user: undefined,
            token: undefined,
            isManager: false,
            busy: false,
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
                // _handleSwitchAccount: this._handleSwitchAccount.bind(this),
                // _selectAccount: this._selectAccount.bind(this),                
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
                }
            }

        }
    }

    static async getInstance(emitter, container){   
        
        

        
        const a = new Controller(emitter, container)
        const data = await a.getData();
        a.model.projects.push(...data);       
        return a;
    }

    // ================
    async getData(){
        const items = [window.q247Data]
        return items;
    }
}

