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

    async handleJoin(e, that){
        try{
          
            that.model.notBusy = false;
            const account = await electronAPI.API.authJoin(that.model.forms.f1.v);  
            that.model.notBusy = true;
            window.location = "index.html";
        }catch(error){
            that.model.notBusy = true;
            that.model.forms.f1.e.code=1
            that.model.forms.f1.e.message="Invalid invitation code"
        }
        
    }

    async _validateField(field){
        switch(field){
            case "f1":
                if(this.model.forms[field].v.match(/(?:[a-z0-9+!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi)){
                    this.model.forms[field].e.code=0
                    this.model.forms[field].e.message="OK"
                }else{
                    this.model.forms[field].e.code=1
                    this.model.forms[field].e.message="Please provide valid email address"
                }

                break;
            case "f2":
                if(this.model.forms[field].v && this.model.forms[field].v.length>=1){
                    this.model.forms[field].e.code=0
                    this.model.forms[field].e.message="OK"
                }else{
                    this.model.forms[field].e.code=1
                    this.model.forms[field].e.message="Please provide password"
                }
                break;
        }
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

