(function(){

    // tryb wprowadzania nowego
    // tryb wyswietlenia istniejacego
    // bez trybu edycja - edycja tylko przez tranzycje na wyswietlaniu istniejacego

    // class SomeController{}



    rivets.components['grm-prop-string'] = {
        // Return the template for the component.
        template: function() {
          const template = `
    <div class="field">
        <label class="label">{model.prop.label} <span rv-if="model.prop.obligatory">*</span></label>
        <div class="control has-icons-right">
            <input class="input" type="text" rv-placeholder="model.prop.placeholder" rv-value="model.prop.value" rv-on-change="handleOnChange" rv-on-blur="handleOnChange" rv-class-is-danger="model.error.message | notEmpty">        
            <span class="icon is-small is-right is-hidden" rv-class-is-hidden="model.error.message | empty">
                <i class="fas fa-exclamation-triangle"></i>
            </span>
        </div>
        <p class="help is-danger is-hidden" rv-class-is-hidden="model.error.message | empty">{model.error.message}</p>
    </div>      
    `
            return template;
        },
      
        // Takes the original element and the data that was passed into the
        // component (either from rivets.init or the attributes on the component
        // element in the template).
        initialize: function(el, data) {
            return {
                model: {
                    prop: data.prop,
                    error: {
                        message: undefined
                    }
                },
                handleOnChange: function(e,that){
                    that.model.error.message = undefined;
                    if(that.model.prop.obligatory && (!that.model.prop.value || that.model.prop.value.length==0))
                        that.model.error.message = `${that.model.prop.label} must not be empty`;
                    if(that.model.prop.pattern){
                        try{
                            const re = new RegExp(that.model.prop.pattern, "g");
                            if(!re.test(that.model.prop.value))
                                that.model.error.message = `${that.model.prop.label} invalid format`;                        
                        }
                        catch(error){
                            console.log(`Invalid pattern format for ${that.model.prop.unique_name}`);
                        }                    
    
                    }
                    // console.log(that.model.error.message, that.model.prop.obligatory, that.model.prop.pattern)
                }
            }
        }
    }
    
    rivets.components['grm-prop-date'] = {
        // Return the template for the component.
        template: function() {
          const template = `
    <div class="field">
        <label class="label">{model.prop.label} <span rv-if="model.prop.obligatory">*</span></label>
        <div class="control has-icons-right">
            
            <input readonly class="input" rv-name="model.prop.unique_name | prefix 'date-'" type="text" rv-placeholder="model.prop.placeholder" rv-value="model.prop.displayValue" rv-on-blur="handleOnChangeManual" rv-on-change="handleOnChangeManual" rv-class-is-danger="model.error.message | notEmpty">        
            <span class="icon is-small is-right is-hidden" rv-class-is-hidden="model.error.message | empty">
                <i class="fas fa-exclamation-triangle"></i>
            </span>
        </div>
        <p class="help is-danger is-hidden" rv-class-is-hidden="model.error.message | empty">{model.error.message}</p>
    </div>      
    `
            return template;
        },
      
        // Takes the original element and the data that was passed into the
        // component (either from rivets.init or the attributes on the component
        // element in the template).
        initialize: function(el, data) {
            const controller = {
                model: {
                    prop: data.prop,
                    error: {
                        message: undefined
                    }
                },
                handleOnChangeManual: function(e, that){  
                    if(that.model.prop.displayValue){
                        var momentDate = moment(that.model.prop.displayValue);
                        // miliseconds
                        that.model.prop.value = momentDate.valueOf();
                    }              
                    
    
                    if(that.model.prop.obligatory && (!that.model.prop.value))
                        that.model.error.message = `${that.model.prop.label} must not be empty`;
    
                    // console.log(that.model.prop.value);  
                    
                },
                handleOnChange: function(e){
    
                    // console.log(this.model.prop);
                    const selectedDate = e.detail.datepicker.getDate("yyyy-mm-dd");
    
                    if(e.detail.date){
                        // value is time in miliseconds, to user displayValue is presented
                        this.model.prop.value = e.detail.date.getTime() ;
                        this.model.prop.displayValue = selectedDate
                    }
                    
    
                    this.model.error.message = undefined;
                    if(this.model.prop.obligatory && (!this.model.prop.value))
                        this.model.error.message = `${this.model.prop.label} must not be empty`;
                    // if(this.model.prop.pattern){
                    //     try{
                    //         const re = new RegExp(this.model.prop.pattern, "g");
                    //         if(!re.test(this.model.prop.value))
                    //         this.model.error.message = `${this.model.prop.label} invalid format`;                        
                    //     }
                    //     catch(error){
                    //         console.log(`Invalid pattern format for ${this.model.prop.unique_name}`);
                    //     }                    
                    // }  
                    // console.log(this.model.prop.value);              
                }
            }
    
            // setup calendar controll
            const elem = el.querySelector(`input`);
            const datepicker = new Datepicker(elem, {
                format: "yyyy-mm-dd"
            });
    
            elem.addEventListener("changeDate",controller.handleOnChange.bind(controller));
    
            return controller;
        }
    }
    
    
    
    
    
    rivets.components['grm-prop-reference'] = {
        // Return the template for the component.
        template: function() {
          const template = `
    <div class="field mb-2">
        <label class="label">{model.prop.label} <span rv-if="model.prop.obligatory">*</span></label>
    </div>
    <div class="field has-addons" style>
        <div class="control is-expanded">
            <input readonly type="text" class="input" rv-value="model.prop.displayValue" rv-on-change="handleOnChange" rv-on-blur="handleOnChange" rv-class-is-danger="model.error.message | notEmpty">        
        </div>
        <div class="control">
            <button class="button" rv-on-click="showBrowser">
                <span class="icon is-small">
                    <i class="fas fa-search"></i>
                </span>
            </button>
        </div>
    </div>
    <!-- reference search modal -->  
    <div class="modal" rv-class-is-active="model.modal.visible">
        <div class="modal-background" style="background-color: rgba(255, 255, 255, 0.96)"></div>
        <div class="modal-content">
            <nav class="panel">
                <p class="panel-heading">
                    Browser
                </p>
                <div class="panel-block">
                    <p class="control has-icons-left">
                    <input class="input" type="text" placeholder="Search">
                    <span class="icon is-left">
                        <i class="fas fa-search" aria-hidden="true"></i>
                    </span>
                    </p>
                </div>
                <a class="panel-block " rv-on-click="handleItemSelected" rv-each-entity="model.entities.list" rv-data-entity="entity.id">
                    <span class="panel-icon">
                    <i class="fas fa-book" aria-hidden="true"></i>
                    </span>
                    {entity.name}
                </a>
                
                <a class="panel-block" rv-unless="model.modal.notBusy">
                    <span class="panel-icon">
                    <i class="fas fa-spinner fa-pulse" aria-hidden="true"></i>
                    </span>
                    Loading data....                
                </a>
                <a class="panel-block" rv-if="model.entities.list | sizeLtAnd 1 model.modal.notBusy">
                    <span class="panel-icon">
                    <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
                    </span>
                    No data found. Either change search criteria or check configuration.                
                </a>
            </nav>
        </div>
        <button class="modal-close is-large" aria-label="close" rv-on-click="hideBrowser"></button>
    </div>    
    `
            return template;
        },
      
        // Takes the original element and the data that was passed into the
        // component (either from rivets.init or the attributes on the component
        // element in the template).
        initialize: function(el, data) {
            console.log(rivets.formatters);
            return {            
                model: {
                    prop: data.prop,
                    entities: {
                        original: [],
                        list: []
                    },
                    error: {
                        message: undefined
                    },
                    modal: {
                        visible: false,
                        notBusy: true
                    }
                },
                showBrowser: function(e, that){
                    that.model.modal.visible = true;
                    that.model.modal.notBusy = false;
                    grm.AdminApi.organizationEntitiesByType(that.model.prop.tenant_id, that.model.prop.refer_type).then((entities)=>{
                        that.model.entities.original = entities.items;
                        that.model.entities.list = entities.items;                    
                    }).finally(()=>{
                        that.model.modal.notBusy = true;
                    })
                },
                hideBrowser: function(e, that){
                    that.model.modal.visible = false;
                },
                handleItemSelected: function(e, that){
                    const input = e.target;
                    const entityId = input.dataset.entity;
                    const entity = that.model.entities.original.find((item)=>{return item.id == entityId});
                    that.model.prop.displayValue = entity.name;
                    that.model.prop.value = entity.id;
                    that.hideBrowser(e, that);
                },
                handleOnChange: function(e,that){
                    that.model.error.message = undefined;
                    if(that.model.prop.obligatory && (!that.model.prop.value || that.model.prop.value.length==0))
                        that.model.error.message = `${that.model.prop.label} must not be empty`;
                    if(that.model.prop.pattern){
                        try{
                            const re = new RegExp(that.model.prop.pattern, "g");
                            if(!re.test(that.model.prop.value))
                                that.model.error.message = `${that.model.prop.label} invalid format`;                        
                        }
                        catch(error){
                            console.log(`Invalid pattern format for ${that.model.prop.unique_name}`);
                        }                    
    
                    }
                    // console.log(that.model.error.message, that.model.prop.obligatory, that.model.prop.pattern)
                }
            }
        }
    }
    
    rivets.components['g-sign-in-email-pass'] = {
        template: function() {
            const template = `
        <div class="box" style="padding-bottom: 30%; margin-top: 10vh;">                                                
            <div class="columns">
                <div class="column is-offset-4 is-one-third">
                    <p class="heading">{{model.entity.heading}}</p>
                    <p class="title"><i rv-class="model.entity.titleIconClasses"></i>&nbsp;{{model.entity.title}}</p>
                    <p class="help has-text-danger" rv-class-is-hidden="model.error.code | eq 0"><strong><i class="fas fa-exclamation-triangle"></i> {{model.entity.failedMsg}}.</strong> {{model.error.message}}</a></p>                    
                    <div class="field">
                        <label class="label">{{model.entity.loginLabel}}</label>
                        <div class="control has-icons-left has-icons-right">
                            <input class="input" type="text" placeholder="" rv-value="model.forms.f1.v" rv-class-is-danger="model.forms.f1.e.code | neq 0" data-field-id="f1" rv-on-input="handleInput">
                            <span class="icon is-small is-left">
                                <i class="fas fa-paper-plane"></i>
                            </span>
                            <span class="icon is-small is-right is-hidden" rv-class-is-hidden="model.forms.f1.e.code | eq 0">
                                <i class="fas fa-exclamation-triangle"></i>
                            </span>
                        </div>
                        <p class="help is-danger is-hidden" rv-class-is-hidden="model.forms.f1.e.code | eq 0">{{model.forms.f1.e.message}}</p>
                    </div>
                    <div class="field">
                        <label class="label">{{model.entity.passLabel}}</label>
                        <div class="control has-icons-left has-icons-right">
                            <input class="input" type="password" placeholder="" rv-value="model.forms.f2.v" rv-class-is-danger="model.forms.f2.e.code | neq 0" data-field-id="f2" rv-on-input="handleInput">
                            <span class="icon is-small is-left">
                                <i class="fas fa-key"></i>
                            </span>
                            <span class="icon is-small is-right is-hidden" rv-class-is-hidden="model.forms.f2.e.code | eq 0">
                                <i class="fas fa-exclamation-triangle"></i>
                            </span>
                        </div>
                        <p class="help is-danger is-hidden" rv-class-is-hidden="model.forms.f2.e.code | eq 0">{{model.forms.f2.e.message}}</p>
                    </div>
                    <div class="field is-grouped">
                        <div class="control">
                        <button class="button is-link" rv-on-click="handleLogin">{{model.entity.signCtaLabel}}</button>
                        </div>
                        <!-- <div class="control">
                        <button class="button is-link is-light">{{model.entity.cancelCtaLabel}}</button>
                        </div> -->
                    </div>
                    <p class="help" rv-html="model.entity.helpMsg"></p>
                </div>
                
            </div>                          
        </div>      
      `
              return template;
          },
        static: ['heading','title','titleIconClasses','failedMsg', 'loginLabel', 'passLabel', 'signCtaLabel', 'cancelCtaLabel', 'helpMsg', 'successUrl'],
        // dynamic bound: 'errorMsg','emitter'
        initialize: function(el, data) {
            
            const controller = {
                emitter: data.emitter,            
                model: {
                    entity: data, // heading, title, titleIconClasses, failedMsg, errorMsg, loginLabel, passLabel, signCtaLabel, cancelCtaLabel, helpMsg, successURL                                          
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
                },
                async handleLogin(e, that){
                    try{
                        that.emitter?.emit("ui:busy");                        
                        if(!that._validateField("f1")||!that._validateField("f2"))
                            return;            
                        const {token, user} = await BackendApi.AUTH.signin(that.model.forms.f1.v, that.model.forms.f2.v)            
                        window.location = that.model.entity.successUrl;
                    }catch(error){
                        that.emitter?.emit("ui:notBusy");    
                        that.model.error.code = 1;
                        that.model.error.message = "Please check your email or password."        
                    }
                    
                },
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
                },
                async handleInput(e, that){
                    const field = e.target.dataset.fieldId;                    
                    await that._validateField(field)                                                     
                }                
            }
    
            // // setup calendar controll
            // const elem = el.querySelector(`input`);
            // const datepicker = new Datepicker(elem, {
            //     format: "yyyy-mm-dd"
            // });
    
            // elem.addEventListener("changeDate",controller.handleOnChange.bind(controller));
    
            return controller;
        }
    }

    rivets.components['g-sign-in-email-pass-mfa'] = {
        template: function() {
            const template = `
        <div class="box" style="padding-bottom: 30%; margin-top: 10vh;">                                                
            <div class="columns">
                <div class="column is-offset-4 is-one-third">
                    <p class="heading">{{model.entity.heading}}</p>
                    <p class="title"><i rv-class="model.entity.titleIconClasses"></i>&nbsp;{{model.entity.title}}</p>
                    <p class="help has-text-danger" rv-class-is-hidden="model.error.code | eq 0"><strong><i class="fas fa-exclamation-triangle"></i> {{model.entity.failedMsg}}.</strong> {{model.error.message}}</a></p>                    
                    <div class="field">
                        <label class="label">{{model.entity.loginLabel}}</label>
                        <div class="control has-icons-left has-icons-right">
                            <input class="input" type="text" placeholder="" rv-value="model.forms.f1.v" rv-class-is-danger="model.forms.f1.e.code | neq 0" data-field-id="f1" rv-on-input="handleInput">
                            <span class="icon is-small is-left">
                                <i class="fas fa-paper-plane"></i>
                            </span>
                            <span class="icon is-small is-right is-hidden" rv-class-is-hidden="model.forms.f1.e.code | eq 0">
                                <i class="fas fa-exclamation-triangle"></i>
                            </span>
                        </div>
                        <p class="help is-danger is-hidden" rv-class-is-hidden="model.forms.f1.e.code | eq 0">{{model.forms.f1.e.message}}</p>
                    </div>
                    <div class="field">
                        <label class="label">{{model.entity.passLabel}}</label>
                        <div class="control has-icons-left has-icons-right">
                            <input class="input" type="password" placeholder="" rv-value="model.forms.f2.v" rv-class-is-danger="model.forms.f2.e.code | neq 0" data-field-id="f2" rv-on-input="handleInput">
                            <span class="icon is-small is-left">
                                <i class="fas fa-key"></i>
                            </span>
                            <span class="icon is-small is-right is-hidden" rv-class-is-hidden="model.forms.f2.e.code | eq 0">
                                <i class="fas fa-exclamation-triangle"></i>
                            </span>
                        </div>
                        <p class="help is-danger is-hidden" rv-class-is-hidden="model.forms.f2.e.code | eq 0">{{model.forms.f2.e.message}}</p>
                    </div>
                    <div class="field is-grouped">
                        <div class="control">
                        <button class="button is-link" rv-on-click="handleLogin">{{model.entity.signCtaLabel}}</button>
                        </div>
                        <!-- <div class="control">
                        <button class="button is-link is-light">{{model.entity.cancelCtaLabel}}</button>
                        </div> -->
                    </div>
                    <p class="help" rv-html="model.entity.helpMsg"></p>
                </div>
                
            </div>                          
        </div>   
        <modal modal="model.views.mfa" auth=""></modal>   
      `
              return template;
          },
        static: ['heading','title','titleIconClasses','failedMsg', 'loginLabel', 'passLabel', 'signCtaLabel', 'cancelCtaLabel', 'helpMsg', 'successUrl'],
        // dynamic bound: 'errorMsg','emitter'
        initialize: function(el, data) {
            
            const controller = {
                emitter: data.emitter,            
                model: {
                    entity: data, // heading, title, titleIconClasses, failedMsg, errorMsg, loginLabel, passLabel, signCtaLabel, cancelCtaLabel, helpMsg, successURL, mfaEnabled (boolean)                                          
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
                        f3: { // MFA Code
                            v: "",
                            e: {
                                code: 0,
                                message: "OK"
                            }
                        }
                    },
                    views: {
                        mfa: {
                            // title: "MFA Code",
                            active: false,
                            onSave: async (form)=>{                                
                                const item = Commons.objectFromFormWithProps(form);
                                await controller.handleLoginWithMFA(item.mfaToken);
                            },
                            form: {
                                visible: true,
                                sections: [
                                    {
                                        layout: "is-full",
                                        section_name:"",
                                        props: [
                                            {
                                                label: "MFA Code",
                                                datatype: "number",
                                                value: "",
                                                placeholder: "6 digits from your MFA app",
                                                editable: true,
                                                obligatory: true,
                                                unique_name: "mfaToken"
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    error:{
                        code: 0,
                        message: "OK"
                    }
                },
                async handleLogin(e, that){
                    try{
                        if(!that._validateField("f1")||!that._validateField("f2"))
                            return;            
                        // check that user requires MFA
                        if(that.model.entity.mfaChecker){
                            const isMFARequired = await that.model.entity.mfaChecker(that.model.forms.f1.v);
                            if(isMFARequired){
                                controller.model.views.mfa.active = true;
                            return;
                            }

                        }
                        if(that.model.entity.mfaEnabled){
                            controller.model.views.mfa.active = true;
                            return;    
                        }
                        that.emitter?.emit("ui:busy");                                                
                        // const {token, user} = await BackendApi.AUTH.signin(that.model.forms.f1.v, that.model.forms.f2.v)            
                        // window.location = that.model.entity.successUrl;
                        await that._processLogin(that.model.forms.f1.v, that.model.forms.f2.v)
                    }catch(error){
                        that.emitter?.emit("ui:notBusy");    
                        that.model.error.code = 1;
                        that.model.error.message = "Please check your email or password."        
                    }
                    
                },
                async handleLoginWithMFA(mfaCode){
                    try{                        
                        controller.emitter?.emit("ui:busy");                                                
                        // const {token, user} = await BackendApi.AUTH.signin(that.model.forms.f1.v, that.model.forms.f2.v)            
                        // window.location = that.model.entity.successUrl;
                        await controller._processLogin(controller.model.forms.f1.v, controller.model.forms.f2.v, mfaCode)
                    }catch(error){
                        controller.emitter?.emit("ui:notBusy");    
                        controller.model.error.code = 1;
                        controller.model.error.message = "Please check your email, password or mfa token"        
                    }
                    
                },
                async _processLogin(login, pass, mfaToken){                    
                    const {token, user} = await BackendApi.AUTH.signin(login, pass, mfaToken);            
                    window.location = controller.model.entity.successUrl;                    
                },
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
                },
                async handleInput(e, that){
                    const field = e.target.dataset.fieldId;                    
                    await that._validateField(field)                                                     
                }                
            }
    
            // // setup calendar controll
            // const elem = el.querySelector(`input`);
            // const datepicker = new Datepicker(elem, {
            //     format: "yyyy-mm-dd"
            // });
    
            // elem.addEventListener("changeDate",controller.handleOnChange.bind(controller));
    
            return controller;
        }
    }
    
    rivets.components['q-settings-toggle'] = {
        // Return the template for the component.
        template: function() {
          const template = `
    <style>
        .settings-container {
            align-self: stretch;
            border-radius: 6px;
            border: 1px solid var(--Border-border, #dbdbdb);
            display: flex;
            max-width: 414px;
            flex-direction: column;
            font-family: Montserrat, sans-serif;
            padding: 8px 24px 24px;
        }

        .settings-header {
            align-self: stretch;
            border-radius: 6px;
            width: 100%;
            font-size: 20px;
            color: #000;
            font-weight: 700;
            letter-spacing: -0.2px;
            line-height: 1.6;
            padding: 8px 0;
        }

        .mfa-button {
            border-radius: 6px;
            background-color: rgba(47, 21, 254, 1);
            align-self: start;
            display: flex;
            margin-top: 8px;
            align-items: center;
            gap: 8px;
            font-size: 16px;
            color: var(--Black-white, #fff);
            font-weight: 500;
            padding: 12px 24px;
            cursor: pointer;
            border: none;
        }

        .visually-hidden {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            border: 0;
        }
    </style>

    <div class="settings-container" role="region" aria-label="Settings Section">
        <h2 class="settings-header">{{model.setting.label}}</h2>
        <button class="mfa-button" tabindex="0" rv-on-click="model.setting.cta.action" rv-disabled="model.setting.disabled">
            {{model.setting.cta.label}}
        </button>
    </div>  
    `
            return template;
        },
      
        // Takes the original element and the data that was passed into the
        // component (either from rivets.init or the attributes on the component
        // element in the template).
        initialize: function(el, data) {
            return {
                model: {
                    setting: data.setting,                    
                    error: {
                        message: undefined
                    }
                }                
            }
        }
    }
    
    rivets.components['q-settings-profile-bar'] = {
        // Return the template for the component.
        template: function() {
          const template = `
    <style>
        .profile-container {
        justify-content: space-between;
        align-items: center;
        border-radius: 6px;
        background: var(--grad-exe, linear-gradient(90deg, #fb1457 0%, #df128b 20%, #c10fbb 40%, #8d11d9 60%, #6943b2 80%, #2c15ff 100%));
        display: flex;
        font-family: Montserrat, sans-serif;
        padding: 24px;
        }

        .profile-wrapper {
        align-self: stretch;
        display: flex;
        min-width: 240px;
        width: 936px;
        align-items: center;
        gap: 24px;
        justify-content: flex-start;
        flex-wrap: wrap;
        margin: auto 0;
        }

        .profile-image {
        aspect-ratio: 1;
        object-fit: contain;
        object-position: center;
        width: 112px;
        border-radius: 0;
        align-self: stretch;
        margin: auto 0;
        }

        .profile-info {
        align-self: stretch;
        display: flex;
        min-width: 240px;
        flex-direction: column;
        justify-content: flex-start;
        width: 493px;
        margin: auto 0;
        }

        .company-name {
        align-self: flex-start;
        gap: 8px;
        font-size: 16px;
        color: rgba(255, 255, 255, 1);
        font-weight: 400;
        white-space: nowrap;
        letter-spacing: -0.32px;
        }

        .user-details {
        display: flex;
        margin-top: 8px;
        width: 100%;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        }

        .name-trend {
        display: flex;
        width: 268px;
        max-width: 100%;
        align-items: center;
        gap: 16px;
        justify-content: flex-start;
        }

        .user-name {
        color: rgba(255, 255, 255, 1);
        font-size: 28px;
        font-weight: 700;
        line-height: 1;
        letter-spacing: -0.56px;
        align-self: stretch;
        flex: 1;
        flex-basis: 16px;
        margin: auto 0;
        }

        .trend-indicator {
        border-radius: 6px;
        background: var(--User-colors-Base-colors-Background, #fff);
        box-shadow: 0px 8px 16px -2px rgba(0, 0, 0, 0.1), 0px 0px 0px 1px rgba(0, 0, 0, 0.02);
        align-self: stretch;
        display: flex;
        flex-direction: column;
        font-size: 10px;
        color: var(--Success-success, #48c78e);
        font-weight: 600;
        white-space: nowrap;
        line-height: 0.8;
        justify-content: flex-start;
        margin: auto 0;
        padding: 8px;
        }

        .trend-icon {
        aspect-ratio: 1;
        object-fit: contain;
        object-position: center;
        width: 24px;
        }

        .user-email {
        align-self: stretch;
        gap: 8px;
        font-size: 16px;
        color: var(--User-colors-Base-colors-Background, #fff);
        font-weight: 400;
        white-space: nowrap;
        letter-spacing: -0.32px;
        }

        @media (max-width: 991px) {
        .profile-container {
            padding: 0 20px;
        }
        
        .profile-info {
            max-width: 100%;
        }
        
        .user-details {
            max-width: 100%;
        }
        
        .company-name,
        .trend-indicator,
        .user-email {
            white-space: initial;
        }
        }
        </style>

        <div class="profile-container">
            <div class="profile-wrapper">
                <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/6fbf5b558418418111c1409275f8293715bd90045e74d7fe87cca4085a207e0e?placeholderIfAbsent=true&apiKey=66f5e0717ad248d493b672f2f07a92d7" class="profile-image" alt="" />
                <div class="profile-info">
                <div class="company-name">{{model.account.name}}</div>
                <div class="user-details">
                    <div class="name-trend">
                    <div class="user-name">{{model.user.name}}</div>
                    <!-- <div class="trend-indicator">
                        <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/TEMP/99b8907273b0f31bc2a9b91aa27d6aa9ff89cb2e9cc7f94a666d9ad6f88504b3?placeholderIfAbsent=true&apiKey=66f5e0717ad248d493b672f2f07a92d7" class="trend-icon" alt="Upward trend indicator" />
                        <div>+18%</div>
                    </div>
                    -->
                    </div>
                    <div class="user-email">{{model.user.id}}</div>
                </div>
                </div>
            </div>
        </div>
    `
            return template;
        },
      
        // Takes the original element and the data that was passed into the
        // component (either from rivets.init or the attributes on the component
        // element in the template).
        initialize: function(el, data) {
            return {
                model: {
                    user: data.profile,
                    account: data.account,                    
                    error: {
                        message: undefined
                    }
                }                
            }
        }
    }
    
    
    
})();
