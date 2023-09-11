class OnboardingController {
    
    constructor(emitter) {
        this.CONST = {
        }
        this.emitter = emitter        
        
        
        
        this.model = {
            account: {
                projects: []
            },
            invitations: [],
            projects: [
                {
                    name: "1st project",
                    id: 'proj1_id',
                    participants: [
                        {
                            "email": "maciej.grula@execon.pl",
                            "name": "Maciej Grula",
                            "role": "Developer",
                            "invitation": {
                                status: {
                                    name: "Onboarding",
                                    id: "1"
                                },
                                code: "i000001"                                
                            }
                        },
                        {
                            "email": "jan.kowalski@execon.pl",
                            "name": "Jan Kowalski",
                            "role": "Developer",
                            "invitation": {
                                status: {
                                    name: "Invited",
                                    id: "0"
                                },
                                code: "i000002"                                
                            }
                        }
                    ]
                },
                {
                    name: "2nd project",
                    id: "proj2",
                    participants: [
                        {
                            "email": "maciej.grula@execon.pl",
                            "name": "Maciej Grula",
                            "role": "Developer",
                            "invitation": {
                                status: {
                                    name: "Operational",
                                    id: "1"
                                },
                                code: "i000001"                                
                            }
                        },
                        {
                            "email": "jan.kowalski@execon.pl",
                            "name": "Jan Kowalski",
                            "role": "Developer",
                            "invitation": {
                                status: {
                                    name: "Onboarding",
                                    id: "0"
                                },
                                code: "i000002"                                
                            }
                        }
                    ]
                }
            ],
            queryParams: {
                i: undefined
            },            
            handlers: {
                // handleHide: this.handleHide.bind(this),
            },
            process:{
                step: "ONBOARDING" // PREPARE // WORKOUT                
            },
            busy: false,
            forms:{
                f1: {
                    v: "",
                    e: {
                        code: 0,
                        message: "OK"
                    }
                },
                f2: {
                    v: "",
                    e: {
                        code: 0,
                        message: "OK"
                    }
                }
            },
            modals: {
                m1: {
                    active: false
                }
            },
            error:{
                code: 0,
                message: "OK"
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

    static async getInstance(emitter){
        const a = new OnboardingController(emitter)
        a.model.busy = true;
        const {token, user} = await BackendApi.AUTH.me();

        if(!user || !token)
            window.location = "hello.html";

        

        a.model.user = user;
        a.model.token = token
        
        try{
            await a._loadAccount(a.model.user.authority[0].accountId);   
            await a._loadInvitations(a.model.user.authority[0].accountId);
        }catch(error){
            console.error(error);
            window.location = "hello.html?message=Session expired. Please log in again.";
        }
        a.model.busy = false;
        
        return a;
    }

    async _loadAccount(accountId){
        this.model.account = await BackendApi.getAccount(accountId);        
    }

    async _handleToggleMobileMenu(e, that){
        that.model.menu.active = !that.model.menu.active;
    }

    async _loadInvitations(accountId){
        const that = this;
        this.model.invitations = await BackendApi.ACCOUNTS.getAccountInvitations(accountId);  
        this.model.account.projects.map((project)=>{
            project.participants.map((participant)=>{
                participant.invitation = {};
                const matchingInvitation = that.model.invitations.find((item)=>item.account.project.id == project.id && item.account.invitee.email == participant.email);

                participant.invitation.status = {
                    name: matchingInvitation?matchingInvitation.used?"On board":"Invited":"On board",
                    code: matchingInvitation?matchingInvitation.used?1:0:1
                };
                participant.invitation.code = matchingInvitation?.id || "--- Manual Join ---"

                return participant;
            })      
            return project;      
        })               
    }

    async handleLogin(e, that){
        try{
          
            that.model.notBusy = false;
            if(!that._validateField("f1")||!that._validateField("f2"))
                return;            
            const {token, user} = await BackendApi.AUTH.signin(that.model.forms.f1.v, that.model.forms.f2.v)
            that.model.notBusy = true;
            window.location = "index.html";
        }catch(error){
            that.model.notBusy = true;    
            that.model.error.code = 1;
            that.model.error.message = "Please check your email and password."        
        }
        
    }

    async _validateField(field){
        let result = true;
        switch(field){
            case "f1":
                if(this.model.forms[field].v.length>=6){
                    this.model.forms[field].e.code=0
                    this.model.forms[field].e.message="OK"
                }else{
                    this.model.forms[field].e.code=1
                    this.model.forms[field].e.message="Please provide valid project name (at least 6 chars)"
                    result = false;
                }

                break;
            case "f2":
                if(this.model.forms[field].v && this.model.forms[field].v.length>=1){
                    this.model.forms[field].e.code=0
                    this.model.forms[field].e.message="OK"
                }else{
                    this.model.forms[field].e.code=1
                    this.model.forms[field].e.message="Please provide password"
                    result = false;
                }
                break;
        }
        return result;
    }

    async handleInput(e, that){
        const field = e.target.dataset.fieldId;
        
        await that._validateField(field)
        
        
 
    }

    async _handleAddProjectModal(e, that){
        that.model.modals.m1.active = true;
    }
    

    async _handleAddProject(e, that){
        const valid = await that._validateField("f1");

        if(!valid)
            return
        
        const me = await BackendApi.AUTH.me();

        await BackendApi.PROJECTS.create(me.user.authority[0].accountId, that.model.forms.f1.v);        

        that.model.modals.m1.active = false
        console.log("Add")
    }

    async _handleCancelAddProject(e, that){
        that.model.modals.m1.active = false
    }


    getQueryParam(paramName){
        const urlParams = new URLSearchParams(window.location.search);
        const myParam = urlParams.get(paramName);
        return myParam;
    }
}

