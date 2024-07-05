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
                _handleInviteParticipant: this._handleInviteParticipant.bind(this),
                _handleBulkInviteParticipants: this._handleBulkInviteParticipants.bind(this)
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
                }                
            },
            modals: {
                m1: {
                    active: false
                },
                m2: {
                    active: false,
                    f1: "",
                    f2: ""
                },
                m3: {
                    active: false,
                    f1: "",
                    f2: "",
                    valid: false,
                    forms: {
                        f1: {
                            f1: {
                                v: ""
                            },
                            f2: [],
                            e: {
                                code: 0,
                                message: "OK"
                            },                            
                            handleChooseParticipantsFile: this._handleChooseParticipantsFile.bind(this),                            
                        },                        
                    },
                    handleAddParticipantsFile: this._handleImportParticipantsFromFile.bind(this),
                    handleCancelAddParticipants: this._handleCancelAddParticipants.bind(this)
                    
                }
            },
            error:{
                code: 0,
                message: "OK"
            },
            menu:{
                active: false
            },
            f: {
                _handleResetInvitation: this._handleResetInvitation.bind(this)
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
        State.PREFERENCES.accountReset();
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
                participant.invitation.resendable = matchingInvitation && matchingInvitation.id && matchingInvitation.used?true:false                

                return participant;
            })      
            return project;      
        })               
    }

    async _handleResetInvitation(e, that){
        that.model.busy = true;
        const participantInvitation = that.participant.invitation;
        const projectId = that.project.id;
        const accountId = that.model.account.id;        
        const {responseJson} = await BackendApi.PROJECTS.MANAGEMENT.resetInvitation(accountId, projectId, participantInvitation.code); 
        this._reload(accountId)       
        that.model.busy = false;
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

    async _handleBulkInviteParticipants(e, that){
        that.model.modals.m3.active = true;
        that.model.modals.m3.f1 = e.target.dataset.accountId;
        that.model.modals.m3.f2 = e.target.dataset.projectId;
    }

    async _handleChooseParticipantsFile(e, that){
        // clear previous errors
        const errors = [];
        this.model.modals.m3.forms.f1.e = errors

        if(e.target.files.length>0){
            const fileName = e.target.files[0].name;
            this.model.modals.m3.forms.f1.f1.v = fileName

            var fileReader = new FileReader();

            fileReader.onloadend = () => {
                
                const fileData = fileReader.result;
                console.log(fileData);            
                const lines = fileData.split(/\r?\n/);

                if(lines.length==0) return;
                let indexShift = 0
                // remove column names
                if(lines[0].toLowerCase().startsWith("name")){
                    lines.shift()
                    indexShift += 1
                }

                
                const participants = []


                for(let i=0; i<lines.length; i++){
                    const lineNo = i+indexShift;
                    if(lines[i].length == 0) continue;
                    const participant = {
                        name: undefined,
                        email: undefined,
                        role: undefined,                        
                        lineNo: lineNo,
                        password: undefined,
                        line: undefined,
                        errorMessage: undefined                                                      
                    }
                    try{
                        participant.line = lines[i]
                        const columns = lines[i].split(/\s+/g)                        
                        if(columns.length<4) throw new Error(`Invalid entry at line ${lineNo} - At least Name, Surname, Email and Role must be provided`)
                        if(columns.length>5) throw new Error(`Invalid entry at line ${lineNo} - At most five columns may be provided: Name, Surname, Email, Role and (optionally for Manager/Director) Password`)
                        let role = columns[3].toLowerCase();
                        role = role.charAt(0).toUpperCase() + role.slice(1);
                        participant.name = `${columns[0]} ${columns[1]}`;
                        participant.email = columns[2]
                        participant.role = role     
                        
                        if(!["DEVELOPER", "FRONTENDDEVELOPER", "BACKENDDEVELOPER", "MOBILEDEVELOPER", "FULLSTACKDEVELOPER", "TECHLEAD", "MANAGER", "DIRECTOR"].includes(participant.role.toUpperCase())) throw new Error(`Invalid entry at line ${lineNo} - role must be one of Developer, FrontendDeveloper, BackendDeveloper, MobileDeveloper, FullstackDeveloper, TechLead, Manager, Director`)
                        if(["MANAGER", "DIRECTOR"].includes(role.toUpperCase())){
                            // use provided, if not password will be autogenerated
                            if(columns.length == 5 && columns[4]) 
                                participant.password = columns[4]
                            else
                                participant.password = Math.random().toString(36).substring(2, 12)
                        }else{
                            if(columns.length == 5 && columns[4].length > 0) throw new Error(`Invalid entry at line ${lineNo} - Non manager/director role MUST NOT have password provided`)
                        }
                        let validEmailRegexp = new RegExp("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])");
                        if(!validEmailRegexp.test(participant.email)) throw new Error(`Invalid entry at line ${lineNo} - valid email must be provided in third column`)                    
                        // check duplicates in file
                        if(participants.findIndex(item=>item.email == participant.email) != -1) throw new Error(`Invalid entry at line ${lineNo} - duplicate email ${participant.email}`)                                                                                            
                        // check if the user is already a member of the project
                        const userAlreadyInProject = this.model.account.projects.find(item=>item.id == this.model.modals.m3.f2).participants?.find(item=>item.email == participant.email);
                        if(userAlreadyInProject) throw new Error(`Invalid entry at line ${lineNo} - user ${participant.email} already in project`)
                        
                        participants.push(participant)
                    }
                    catch(error){                        
                        participant.errorMessage = error.message
                        participants.push(participant)
                        errors.push({
                            code: 13,
                            message: error.message
                        });                        
                    }                                        
                }
                this.model.modals.m3.forms.f1.f2 = participants
                this.model.modals.m3.forms.f1.e = errors
                

                // that.model.prop.display_value = `${e.target.files[0].name}`
                const fileName = e.target.files[0].name;
                const fileSize = e.target.files[0].size;
                // that.model.prop.value = `name:${fileName};size:${fileSize};${fileData}`
                // // Logs data:<type>;base64,wL2dvYWwgbW9yZ...
                // that.validate();
                // // process rule if validation is ok
                // if(!that.model.error.message && that.model.prop.rule){
                //     const f = new Function('value','props', that.model.prop.rule);
                //     f.call(null, that.model.prop.value, that.model.props)
                // }
            };

            fileReader.readAsText(e.target.files[0]);
        }else{
            this.model.modals.m3.forms.f1.f1.v = undefined
        }
        
    }

    async _handleCancelAddParticipants(e, that){
        // clear previous errors
        const errors = [];
        this.model.modals.m3.forms.f1.e = errors
        this.model.modals.m3.forms.f1.f1.v = undefined

        this.model.modals.m3.active = false
        that.model.modals.m3.f1 = undefined
        that.model.modals.m3.f2 = undefined

        // on change workaround to allow multiple times to load same file
        const fileInputElement = document.getElementsByClassName("participants-file-input")[0];
        fileInputElement.value = ""

    }

    async _handleImportParticipantsFromFile(e, that){
        this.model.busy = true;
        
        const participants = this.model.modals.m3.forms.f1.f2;
        const accountId = this.model.modals.m3.f1;
        const projectId = this.model.modals.m3.f2;

        console.log(participants);
        for(let i=0; i<participants.length; i++){
            const participant = participants[i];
            if(["MANAGER","DIRECTOR"].includes(participant.role.toUpperCase())){
                // check - if Manager or Director call admin user create
                const user = await BackendApi.PROJECTS.MANAGEMENT.invite(accountId, projectId, participant.name, participant.email, participant.role, participant.password); 
            }else{
                // project memeber invitation create
                const invitation = await BackendApi.PROJECTS.INVITATIONS.create(accountId, projectId, participant.name, participant.email, participant.role); 
            }
        }  
        
        await this._loadAccount(this.model.account.id);   
        await this._loadInvitations(this.model.account.id);
        
        
        
        this.model.busy = false;
        
        
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
        

        await that._loadAccount(that.model.account.id);   
        await that._loadInvitations(that.model.account.id);
        
        
        
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

            await BackendApi.PROJECTS.create(that.model.account.id, that.model.forms.f1.v);        
    
            
            console.log("Add")
    
            await that._reload(that.model.account.id);
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

