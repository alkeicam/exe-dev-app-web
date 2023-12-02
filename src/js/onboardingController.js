class OnboardingController {
    
    constructor(emitter) {
        this.CONST = {
        }
        this.emitter = emitter        
        
        
        
        this.model = {
            isManager: false,
            isOwner: false,
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
                            "email": "xx@domain.com",
                            "name": "X Y",
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
                            "email": "zy@domain.com",
                            "name": "Z Y",
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
                            "email": "ddd@ddd.com",
                            "name": "DDD EEE",
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
                            "email": "EEEE@eee.com",
                            "name": "EEE FFFFF",
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
                _handleInviteParticipant: this._handleInviteParticipant.bind(this)
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
                },
                f3: {
                    v: "",
                    e: {
                        code: 0,
                        message: "OK"
                    }
                },
                f4: {
                    v: -1,
                    e: {
                        code: 0,
                        message: "OK"
                    },
                    d: [
                        {id:"Developer", value:"Developer"},
                        {id:"FrontendDeveloper", value:"Frontend Developer"},
                        {id:"BackendDeveloper", value:"Backend Developer"},
                        {id:"MobileDeveloper", value:"Mobile Developer"},
                        {id:"FullstackDeveloper", value:"Fullstack Developer"},
                        {id:"TechLead", value:"Tech Lead"},
                        {id:"Manager", value:"Manager"},                       
                        {id:"Director", value:"Director"},                       
                    ]
                },
                f5: {
                    v: Math.random().toString(36).substring(2, 12),
                    e: {
                        code: 0,
                        message: "OK"
                    },
                    h:true
                },
            },
            modals: {
                m1: {
                    active: false
                },
                m2: {
                    active: false,
                    f1: "",
                    f2: ""
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

        let preferredAccount = State.PREFERENCES.account()||{};
        const accountId =  a.getQueryParam("accountId")||preferredAccount.id;
        
        a.model.busy = true;
        a.model.isManager = false;
        a.model.isOwner = false;

        const {token, user, } = await BackendApi.AUTH.me();

        if(!user || !token)
            window.location = "hello.html";

        a.model.user = user;
        a.model.token = token
    
        const accountAuthority = user.authority.find(item=>item.accountId == accountId);
        if(accountAuthority){
            a.model.isManager = accountAuthority.projects.flatMap(item=>item.roles).some(item=>["MANAGER", "DIRECTOR", "OWNER"].includes(item.toUpperCase()))?true:false;
            a.model.isOwner = accountAuthority.roles.some(item=>["OWNER", "ADMIN"].includes(item.toUpperCase()))?true:false;
        }

        try{
             
            await a._reload(accountId);               
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

    async _handleSignOut(e, that){
        await BackendApi.AUTH.signOut();
        window.location = "hello.html?message=Signed out. Please log in again.";
    }

    async _handleToggleMobileMenu(e, that){
        that.model.menu.active = !that.model.menu.active;
    }

    async _reload(accountId){
        await this._loadAccount(accountId);
        await this._loadInvitations(accountId);
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
                if(this.model.forms[field].v && this.model.forms[field].v.length>=3){
                    this.model.forms[field].e.code=0
                    this.model.forms[field].e.message="OK"
                }else{
                    this.model.forms[field].e.code=1
                    this.model.forms[field].e.message="Please provide valid name (at least 3 chars)"
                    result = false;
                }
                break;
            case "f3":
                if(this.model.forms[field].v.match(/(?:[a-z0-9+!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi)){
                    this.model.forms[field].e.code=0
                    this.model.forms[field].e.message="OK"
                }else{
                    this.model.forms[field].e.code=1
                    this.model.forms[field].e.message="Please provide valid email"
                    result = false;
                }
                break;
            case "f4":
                if(this.model.forms[field].v != -1){
                    this.model.forms[field].e.code=0
                    this.model.forms[field].e.message="OK"
                }else{
                    this.model.forms[field].e.code=1
                    this.model.forms[field].e.message="Please select role"
                    result = false;
                }
                break;
        }
        return result;
    }

    async handleInput(e, that){
        const field = e.target.dataset.fieldId;
        
        await that._validateField(field)

        if(field == "f4" && that.model.forms[field].v != -1){
            if(["MANAGER","DIRECTOR"].includes(that.model.forms[field].v.toUpperCase())){
                that.model.forms["f5"].h = false
                that.model.forms["f5"].v = Math.random().toString(36).substring(2, 12)
            }                
            else{
                that.model.forms["f5"].h = true
                that.model.forms["f5"].v = Math.random().toString(36).substring(2, 12)
            }
                
        }
        
        
 
    }

    async _handleInviteParticipant(e, that){
        that.model.modals.m2.active = true;
        that.model.modals.m2.f1 = e.target.dataset.accountId;
        that.model.modals.m2.f2 = e.target.dataset.projectId;
        that.model.forms.f2.v = "";
        that.model.forms.f3.v = "";
        that.model.forms.f4.v = -1;    
        that.model.forms["f5"].h = true;    
        that.model.forms["f5"].v = Math.random().toString(36).substring(2, 12);
    }

    async _handleAddInvitation(e, that){
        that.model.busy = true;
        const valid1 = await that._validateField("f2");
        const valid2 = await that._validateField("f3");
        const valid3 = await that._validateField("f4");

        if(!valid1||!valid2||!valid3)
            return;

        // const me = await BackendApi.AUTH.me();
        that.model.modals.m2.active = false;        

        // me.user.authority[0].accountId, that.model.forms.f1.v
        

        if(["MANAGER","DIRECTOR"].includes(that.model.forms.f4.v.toUpperCase())){
            // check - if Manager or Director call admin user create
            const user = await BackendApi.PROJECTS.MANAGEMENT.invite(that.model.modals.m2.f1, that.model.modals.m2.f2, that.model.forms.f2.v, that.model.forms.f3.v, that.model.forms.f4.v, that.model.forms.f5.v); 
        }else{
            // project memeber invitation create
            const invitation = await BackendApi.PROJECTS.INVITATIONS.create(that.model.modals.m2.f1, that.model.modals.m2.f2, that.model.forms.f2.v, that.model.forms.f3.v, that.model.forms.f4.v); 
        }
        

        await that._loadAccount(that.model.user.authority[0].accountId);   
        await that._loadInvitations(that.model.user.authority[0].accountId);
        
        
        
        that.model.busy = false;
    }

    async _handleCancelAddInvitation(e, that){
        that.model.modals.m2.active = false;
    }

    async _handleAddProjectModal(e, that){
        that.model.modals.m1.active = true;
    }
    

    async _handleAddProject(e, that){
        const valid = await that._validateField("f1");

        if(!valid)
            return
        
        that.model.modals.m1.active = false            
        that.model.busy = true;

        try{
            const me = await BackendApi.AUTH.me();

            await BackendApi.PROJECTS.create(me.user.authority[0].accountId, that.model.forms.f1.v);        
    
            
            console.log("Add")
    
            await that._reload(that.model.user.authority[0].accountId);
        }catch(error){
            that.model.busy = false    
        }        
        that.model.busy = false
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

