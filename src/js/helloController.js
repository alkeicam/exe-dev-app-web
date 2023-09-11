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
        
        return a;
    }

    async handleLogin(e, that){
        try{
          
            that.model.notBusy = false;
            if(!that._validateField("f1")||!that._validateField("f2"))
                return;            
            const {token, user} = await BackendApi.AUTH.signin(that.model.forms.f1.v, that.model.forms.f2.v)            
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
                if(this.model.forms[field].v.match(/(?:[a-z0-9+!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi)){
                    this.model.forms[field].e.code=0
                    this.model.forms[field].e.message="OK"
                }else{
                    this.model.forms[field].e.code=1
                    this.model.forms[field].e.message="Please provide valid email address"
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

    getQueryParam(paramName){
        const urlParams = new URLSearchParams(window.location.search);
        const myParam = urlParams.get(paramName);
        return myParam;
    }
}

