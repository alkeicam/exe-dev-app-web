class HelloController {
    
    constructor(emitter) {
        this.CONST = {
        }
        this.emitter = emitter        
        
        
        
        this.model = {
            queryParams: {
                i: undefined
            },            
            handlers: {
                // handleHide: this.handleHide.bind(this),
            },
            process:{
                step: "ONBOARDING" // PREPARE // WORKOUT                
            },
            notBusy: true,
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
            error:{
                code: 0,
                message: "OK"
            },
            views: {
                login: {
                    isMFARequired: async (login) => {
                        console.log(`checking ${login}`)
                        try{
                            const {enabled} = await BackendApi.AUTH.isMFARequired(login);           
                            return enabled;
                        }catch(error){
                            return true;
                        }                                                
                    },
                    postLoginSuccess: async (login, successURL) => {
                        try{
                            await this._handleOnboarding(login, successURL)
                        }catch(error){
                            window.location = `hello.html?message=Post login failed. Contact tech support.`;
                        }
                        // check user does not have MFA enabled - when so start onboarding process
                        
                        
                    }
                },
                mfaOnboarding: {
                    login: "",
                    successURL: "",
                    active: false
                }
            }
        }
    }

    _ellipsis(text){
        if(text.length<=50)
            return text;
        return text.substring(0,18)+"..."+text.substr(text.length-28, text.length)
    }

    static async getInstance(emitter){
        
        const a = new HelloController(emitter)
        a.emitter.on("ui:busy",()=>{
            a.model.notBusy = false
        })
        a.emitter.on("ui:notBusy",()=>{
            a.model.notBusy = true
        })

        const errorMessage = HelloController.getQueryParam("message");
        if(errorMessage){
            a.model.error.message = errorMessage;
            a.model.error.code = 403
        }
        //message
        
        return a;
    }

    

    async _handleOnboarding(login, successURL){
        this.model.notBusy = false;
        const {enabled} = await BackendApi.AUTH.isMFARequired(login);
        if(!enabled){
            this.model.views.mfaOnboarding.login = login
            this.model.views.mfaOnboarding.successURL = successURL
            this.model.views.mfaOnboarding.active = true
            this.model.notBusy = true
        }else{
            window.location = successURL
        }
    }

    static getQueryParam(paramName){
        const urlParams = new URLSearchParams(window.location.search);
        const myParam = urlParams.get(paramName);
        return myParam;
    }
}

