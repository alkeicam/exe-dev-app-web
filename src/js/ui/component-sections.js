(function(){  
   /**
     * @property {GrmForm} form
     * @property {string} title
     */
   rivets.components['form-root'] = {
    // Return the template for the component.
    template: function() {
      const template = `        
        <h2 class="title is-2" rv-class-is-hidden="model.title | empty">{{model.title}}</h2>
        <div rv-class-is-invisible="model.form.visible | eq false">
            <form-section rv-each-section="model.form.sections" section="section" layout="section.layout" auth="model.auth"></form-section>
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
                error: {
                    message: undefined
                },                                        
                form: data.form, 
                title: data.title,
                auth: data.auth                                                             
            }
        }
        return controller;
    }
}

/**
 * Represents a grouping of fields
 * 
 * @property {GrmSection} section
 * 
 */
rivets.components['form-section'] = {
    // Return the template for the component.
    template: function() {

    const template = `        
    <span class="tag is-link my-4 is-medium" rv-class-is-hidden="model.section.section_name | empty"># {{model.section.section_name}}</span>                
    
    <div class="columns is-multiline">                          
        <div class="column" rv-class-is-full="model.layout | eq 'is-full'" rv-class-is-one-third="model.layout | eq 'is-one-third'" rv-class-is-one-fifth="model.layout | eq 'is-one-fifth'" rv-each-prop="model.section.props" rv-class-is-hidden="prop.visible | eq false">
            <prop prop="prop" props="model.section.props" editable="prop.editable" auth="model.auth"></prop>
        </div>            
    </div>      
    `
        return template;
    },
    // static: ['mode'], // one of "edit" "view"
    // Takes the original element and the data that was passed into the
    // component (either from rivets.init or the attributes on the component
    // element in the template).
    initialize: function(el, data) {  
        const controller = {
            model: {
                section: data.section,
                layout: data.layout||"is-one-third",
                auth: data.auth
            }
        }
        return controller;                       
    }
  }


  /**
   * @param {GrmModal} modal
   * @param {string} title
   * @param {boolean} active
   */
    rivets.components['modal'] = {
        // Return the template for the component.
        template: function() {
        const template = `
            <!-- grm modal -->
            <div class="modal" rv-class-is-active="model.modal.active">
                <div class="modal-background" style="background-color: rgba(255, 255, 255, 1)"></div>
                <div class="modal-content" style="width: 85vw">       
                    
                    <form-root form="model.modal.form" title="model.title" auth="model.auth"></form-root>
                    
                    <footer class="modal-card-foot mt-5" >
                        <button rv-if="model.modal.onSave" class="button is-success" rv-on-click="save">Save changes</button>
                        <button class="button" rv-on-click="hide">Close</button>
                    </footer>
                </div>
                <button class="modal-close is-large" aria-label="close" style="background-color: gray;" rv-on-click="hide"></button>
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
                    error: {
                        message: undefined
                    },                                        
                    modal: data.modal,
                    title: data.title,
                    auth: data.auth

                },
                hide: function(e, that){
                    
                    that._reset();                                        
                    that.model.modal.active = false;
                },
                save: async function(e, that){
                    // validate form
                    let isValid = true;   
                    const form = that.model.modal.form;                 

                    form.sections.forEach(section=>{
                        section.props.forEach(prop=>{
                            // temporary - we validate only "visible" props, in the future maybe new field on prop shoulb be introduced
                            // so rules can more fine grained controll which props should be validated on save
                            if(prop.validate&&(prop.visible||prop.visible === undefined)){
                                isValid = prop.validate()&&isValid
                            }     
                            if(!isValid) console.log("validation failed", prop);
                        })
                    })
                    if(!isValid){
                        alert(`Input validation failed. Please provide valid input into form.`)
                        return;
                    }

                    // beware, this clears validate() function from props
                    await that.model.modal.onSave(JSON.parse(JSON.stringify(that.model.modal.form)));
                    // that.model.modal.onSave(that.model.modal.form);
                    that._reset();                  
                    that.model.modal.active = false;                      
                },     
                
                _reset: function(){
                    for(let i=0; i<controller.model.modal.form.sections.length;i++){
                        const section = controller.model.modal.form.sections[i];
                        for(let j=0; j<section.props.length;j++){
                            // store original value - it will be used when modal is cancelled
                            section.props[j].value = section.props[j]._original.value
                            section.props[j].display_value = section.props[j]._original.display_value
                            section.props[j].visible = section.props[j]._original.visible
                        }
                    }        
                }
            }
            for(let i=0; i<controller.model.modal.form.sections.length;i++){
                const section = controller.model.modal.form.sections[i];
                for(let j=0; j<section.props.length;j++){
                    // store original value - it will be used when modal is cancelled
                    // section.props[j]._original = JSON.parse(JSON.stringify(section.props[j]))
                    section.props[j]._original = {}
                    section.props[j]._original.value = section.props[j].value                    
                    section.props[j]._original.display_value = section.props[j].display_value
                    section.props[j]._original.visible = section.props[j].visible
                    
                }
            }
            return controller;
        }

        
    }

    rivets.components['items-view'] = {
        // Return the template for the component.
        template: function() {
          const template = `
            <nav class="panel" >
                <div class="panel-heading">  
                    <!-- Main container -->
                    <nav class="level">
                        <!-- Left side -->
                        <div class="level-left">
                            <div class="level-item">
                            {{model.title}}
                            </div>                            
                        </div>
                    
                        <!-- Right side -->
                        <div rv-if="model.action | isArray">
                            <div class="level-right">
                                <p class="level-item" rv-each-item="model.action">                                
                                    <a class="button is-info" rv-on-click="handleAction">
                                        <span class="icon is-small">
                                            <i rv-class="item.class"></i>
                                        </span>
                                        <strong>{{item.label}}</strong>
                                    </a>                                                    
                                </p>
                            </div>
                        </div>
                        <div rv-unless="model.action | isArray">
                            <div rv-if="model.action.executor" class="level-right">
                                <p class="level-item">                                
                                    <a class="button is-info" rv-on-click="handleAction">
                                        <span class="icon is-small">
                                            <i rv-class="model.action.class"></i>
                                        </span>
                                        <strong>{{model.action.label}}</strong>
                                    </a>                                                    
                                </p>
                            </div>
                        </div>

                        
                    </nav>                    
                </div>
                
                <div class="panel-block">
                    <p class="control has-icons-left">
                        <input class="input" type="text" placeholder="Hit Enter for Search" rv-value="model.entities.filter" rv-on-blur="handleFilter" rv-on-change="handleFilter">
                        <span class="icon is-left">
                        <i class="fas fa-search" aria-hidden="true"></i>
                        </span>
                    </p>
                </div>
                <div rv-if="model.urlProvider">
                    <a class="panel-block" rv-each-item="model.entities.list" rv-href="model.urlProvider | call item">
                        <span rv-html="model.labelProvider | call item"></span>&nbsp;<span class="tag is-light">{{model.idProvider | call item}}</span>
                    </a>
                </div>
                <div rv-if="model.modalProvider">
                    <a class="panel-block" rv-each-item="model.entities.list" rv-on-click="model.modalProvider">
                        <span rv-html="model.labelProvider | call item"></span>&nbsp;<span class="tag is-light" >{{model.idProvider | call item}}</span>
                    </a>
                </div>
                <div rv-if="model.clickProvider">
                    <a class="panel-block" rv-each-item="model.entities.list" rv-on-click="handleClick" rv-class-has-background-light="item._selected" rv-class-is-hidden="item._hidden">
                        <span rv-html="model.labelProvider | call item"></span>&nbsp;<span class="tag is-light" >{{model.idProvider | call item}}</span>
                    </a>
                </div>
                
                <div rv-if="model.clickProvider | noneTrue model.modalProvider model.urlProvider">
                    <a class="panel-block" rv-each-item="model.entities.list">
                        <span rv-html="model.labelProvider | call item"></span>&nbsp;<span class="tag is-light">{{model.idProvider | call item}}</span>
                    </a>
                </div>

                <a class="panel-block is-hidden" rv-class-is-hidden="model.entities.list | sizeGte 1">
                    <span class="panel-icon">
                        <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
                    </span>
                    No items found. Try different search criteria.
                </a>            
            </nav>               
            `
            return template;
        },
      
        // Takes the original element and the data that was passed into the
        // component (either from rivets.init or the attributes on the component
        // element in the template).
        initialize: function(el, data) {
            
            const controller = {            
                model: {
                    title: data.title,
                    action: data.action, //  executor, label, class                    
                    
                    labelProvider: data.labelProvider,
                    idProvider: data.idProvider,
                    
                    urlProvider: data.urlProvider,
                    modalProvider: data.modalProvider,
                    clickProvider: data.clickProvider,
                    multiSelect: data.multiSelect || false,

                    entities: {
                        original: data.entities,
                        list: data.entities,
                        filter: ""
                    },
                    error: {
                        message: undefined
                    },
                    modal: {
                        visible: false,
                        notBusy: true
                    }
                },
                handleAction: async function(e, that){
                    if(that.item){
                        that.item.executor.call()
                    }else{
                        that.model.action.executor.call()
                    }
                    
                },
                handleClick:  async function(e, that){   
                    // 
                    if(!controller.model.multiSelect){
                        // remove previously selected 
                        controller.model.entities.list.forEach(item=>item._selected = false);
                    }                 
                    that.item._selected = !that.item._selected;
                    // and delegate to click action
                    that.model.clickProvider(that.item, controller.model.entities.list.filter(item=>item._selected));                    
                },
                handleFilter: async function(e, that){
                    that.model.entities.list.forEach(item=>{
                        let match = false;
                        if(that.model.entities.filter.toLowerCase().startsWith("#")){
                            // search by id
                            match = that.model.idProvider(item).toLowerCase().startsWith(that.model.entities.filter.toLowerCase().substring(1))?true:false;
                        }else{
                            Object.keys(item).filter(item=>!["_hidden","_selected"].includes(item)).forEach(key=>{

                                match = JSON.stringify(item[key]).toLowerCase().includes(that.model.entities.filter.toLowerCase())?true:match;
                            })
                        }
                        
                        
                        item._hidden = match?false:true;
                    })
                    // that.model.entities.list = JSON.parse(JSON.stringify(that.model.entities.original))
                    // that.model.entities.list = that.model.entities.list.filter(item=>{
                    //     let match = false;
                    //     if(that.model.entities.filter.toLowerCase().startsWith("#")){
                    //         // search by id
                    //         match = that.model.idProvider(item).toLowerCase().startsWith(that.model.entities.filter.toLowerCase().substring(1))?true:false;
                    //     }else{
                    //         Object.keys(item).forEach(key=>{
                    //             match = JSON.stringify(item[key]).toLowerCase().includes(that.model.entities.filter.toLowerCase())?true:match;
                    //         })
                    //     }
                        
                        
                    //     return match;
                    // });
                }                                
            }

            // data.entities.forEach(item=>{
            //     controller.model.entities.original.push(item);
            //     controller.model.entities.list.push(item);
            // })            

            return controller;
        }
    }

    rivets.components['item-details'] = {
        // Return the template for the component.
        template: function() {
            const template = `
                <div class="card">
                    <header class="card-header">
                        <p class="card-header-title">
                            <span class="icon">
                                <i rv-class="model.item.iconClass"></i>
                            </span>
                            {{model.item.title}}</p>
                    </header>
                    <div class="card-content">
                        <div class="content">
                            <span rv-unless="model.item.selected">{{model.item.noData}}</span>
                            <form-root form="model.item.form" auth="model.auth" rv-if="model.item.selected"></form-root> 
                        </div>
                    </div>
                    <footer class="card-footer" rv-if="model.item.selected">
                        <a class="card-footer-item" rv-each-item="model.item.actions" rv-on-click="handleAction">{{item.label}}</a>                        
                    </footer>
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
                    item: data.item,                    
                    auth: data.auth,
                    error: {
                        message: undefined
                    }
                },
                _debug: function(a, b){
                    console.log("D",controller.model.item.props[0])
                },
                handleAction: async function(e, that){
                    if(that.item){
                        that.item.onClick.call(undefined, controller.model.item)
                    }

                }
                    
                             
            }

            return controller;
        }
    }

    rivets.components['signin'] = {
        // Return the template for the component.
        template: function() {
            const template = `
    
          <div class="notification is-danger is-hidden" rv-class-is-hidden="model.error.message | empty">
            {{model.error.message}}
          </div>
          <form class="box">
            <div class="field">
              <label class="label">Login</label>
              <div class="control">
                <input class="input" type="text" placeholder="john@doe.com" rv-value="model._form.login">
              </div>
            </div>
            <div class="field">
              <label class="label">Password</label>
              <div class="control">
                <input class="input" type="password" placeholder="your password" rv-value="model._form.password">
              </div>
            </div>
            <div class="field">
              <label class="checkbox">
                <input type="checkbox" rv-checked="model._form.impersonate"/>
                <!-- I agree to the <a href="#">terms and conditions</a> -->
                I want to impersonate as another user
              </label>
            </div>            
            <div class="field is-hidden" rv-class-is-hidden="model._form.impersonate | eq false">
              <label class="label">Impersonate user login</label>
              <div class="control">
                <input class="input" placeholder="target user login" rv-value="model._form.impersonateLogin">
              </div>
            </div>
            <div class="field ">
              <div class="control ">
                <button class="button is-link is-fullwidth is-hidden" rv-on-click="handleSignIn" rv-class-is-hidden="model.busy">SignIn</button>
                <button class="button is-link is-fullwidth is-loading is-hidden" rv-class-is-hidden="model.busy | eq false"></button>
              </div>
              <!-- <div class="control">
                <button class="button is-link is-light">Cancel</button>
              </div> -->
            </div>
          </form>
        `
            return template;
        },
      
        // Takes the original element and the data that was passed into the
        // component (either from rivets.init or the attributes on the component
        // element in the template).
        initialize: function(el, data) {
            
            const controller = {            
                model: {                    
                    item: data.item,
                    error: {
                        message: data.item.message
                    },
                    _form: {
                        login: "",
                        password: "",
                        impersonate: false,
                        impersonateLogin: ""
                    },
                    busy: false
                },                
                handleSignIn: async function(e, that){  
                    e.preventDefault();                  
                    let loginSuccess = false;
                    try{
                        loginSuccess = await controller.model.item.performSignIn(controller.model._form);
                    }catch(error){
                        console.error(error);
                        loginSuccess = false;
                    }
                    
                    if(!loginSuccess){
                        controller.model.error.message = `Invalid login attempt`
                    }
                    else{
                        window.location.replace(controller.model.item.successURL)
                    }                        
                }
                    
            }
            let signOut = Commons.getQueryParam("signOut");
            if(signOut) controller.model.item.performSignOut();
            return controller;
        }
    }

    rivets.components['flow-diagram'] = {
        // requires <script src="https://cdn.jsdelivr.net/npm/flowblocks-designer@2.0.32/dist/flowblocks-designer.js"></script>
        // Return the template for the component.
        template: function() {
            const template = `
            <div style="padding-top: 1rem;"></div>
            <span class="is-hidden" rv-data-reload="reload | call model.item"></span>
        `
            return template;
        },
      
        // Takes the original element and the data that was passed into the
        // component (either from rivets.init or the attributes on the component
        // element in the template).
        initialize: function(el, data) {
            
            const controller = {            
                model: {                    
                    item: data.item,
                    error: {
                        message: data.item.message
                    }                    
                },   
                reload: async ()=>{
                    if(!controller.model.item.name) return;
                    if(!controller.model.item.id) return; 
                    if(!controller.model.item.version) return;
                    
                    var rootElement = el.children.item(0);
                    // clear previous just in case
                    // rootElement.replaceChildren()
                    // 
                    const menu = {
                        b: `${controller.model.item.iconURL}`,
                        u: `${controller.model.item.rootURL}`,
                        r: `${controller.model.item.itemURL}`,
                        c: `${controller.model.item.name}`,
                        s: `${controller.model.item.id}@v${controller.model.item.version}`,
                        m: [
                            
                            { s: true },
                            {
                                s: false, 
                                l: controller.model.item.menuLabel, 
                                m: controller.model.item.actions.map(action=>{
                                    return {
                                        s: action.separator, 
                                        l: action.label, 
                                        e: action.eventCode, 
                                        ep: controller.model.item.id, 
                                        ep2: controller.model.item.version                                        
                                    }
                                }),
                                
                                // [
                                //     { s: false, l: 'Save Flow', e: 'grm:publish', ep: self.processDefinition.code, ep2: self.entity.organizationId },
                                //     { s: false, l: 'Close Flow', e: 'grm:close', ep: '../index.html'},
                                //     { s: true },
                                //     { s: false, l: 'Check Flow for errors', e: 'grm:map' },
                                //     { s: true },
                                //     { s: false, l: 'Download Flow', e: 'flowblocks:download' },
                                //     { s: false, l: 'Load/Import Flow from JSON', e: 'menu:import-json', ep: false, ep2: item.id, ep3: item.version, ep4: item.name } // ep=false as we want to disable types import, only model shall be imported 
                                // ]
                            }
                        ]
                    }
                    const flowblocks = await flowblocksdesigner.create(rootElement, undefined, menu, { debug: true, debugEvents: true });
                    flowblocks.notify("flowblocks:busy",'','Processing. Please wait ...');

                    controller.model.item.actions.forEach(action=>{
                        if(action.eventCode){                            
                            flowblocks.on(action.eventCode,(id, version)=>{
                                let diagram = undefined;
                                let validationResult = undefined;

                                if(action.export){
                                    diagram = flowblocks.export()
                                }
                                if(action.validate){
                                    validationResult = flowblocks.validate();
                                }

                                action.handler(action.eventCode, id, version, validationResult, diagram);
                            });
                        }                    
                    })
                    let diagram = controller.model.item.diagram || {
                        "name": controller.model.item.name,
                        "id": controller.model.item.id,
                        "created": Date.now(),
                        "version": controller.model.item.version,
                        "exported": Date.now(),
                        "cells": []
                    }

                    flowblocks.registerTypes(controller.model.item.types);
                    flowblocks.rebuildToolbar(controller.model.item.types);        
                    if (window && window.svgPanZoom)
                        flowblocks.enablePanAndZoom(window.svgPanZoom);


                    // flowblocks.import(diagram, false, forceSpecification)
                    
                    flowblocks.import(JSON.stringify(diagram), false)
                    flowblocks.notify("flowblocks:result-ok",'','Processing. Done.');
                }
            }            
            // controller.reload();                      
            return controller;
        }
    }

    rivets.components['list-selector'] = {
        // Return the template for the component.
        template: function() {
            const template = `

            <div class="fixed-grid has-12-cols">
                <div class="grid">
                    <div class="cell is-col-span-5">
                        <items-view entities="model.source.items" title="model.source.title" label-provider="model.labelProvider" id-provider="model.idProvider" click-provider="model.clickProvider" multi-select="true"></items-view>
                    </div>
                    <div class="cell is-col-span-2 has-text-centered">
                        <div class="container"></div>
                        <ul class="is-block mt-6" style="list-style: none; margin-inline-start: 0rem">
                            <li class="mt-2 mb-2"><button class="button is-small" style="margin: 0 auto;" rv-on-click="handleAddSelected"><i class="fas fa-angle-right"></i></button></li>                            
                            <li class="mt-2 mb-2"><button class="button is-small" style="margin: 0 auto;" rv-on-click="handleRemoveSelected"><i class="fas fa-angle-left"></i></button></li>                            
                        </ul>
                    </div>
                    <div class="cell is-col-span-5">                        
                        <items-view entities="model.target.items" title="model.target.title" label-provider="model.labelProvider" id-provider="model.idProvider" click-provider="model.clickProvider" multi-select="true"></items-view>
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
            
            const controller = {            
                model: {                    
                    source: data.source,
                    target: data.target,
                    labelProvider: data.labelProvider,
                    idProvider: data.idProvider,
                    sourceSelected: [],
                    clickProvider: (item, selectedItems)=>{
                        // after filtering items do not have _selected property
                        // item._selected = item._selected===undefined?true:!item._selected
                        // item._selected = !item._selected
                        // console.log(item, selectedItems);
                        controller.model.sourceSelected = selectedItems;
                    },
                    error: {
                        message: undefined
                    }
                },
                _debug: function(a, b){
                    console.log("D",controller.model.item.props[0])
                },
                handleAction: async function(e, that){
                    if(that.item){
                        // that.item.onClick.call(undefined, controller.model.item)
                    }
                    // else{
                    //     that.model.action.executor.call()
                    // }
                },
                handleAddSelected: async function(e, that){
                    // let selected = JSON.parse(JSON.stringify(controller.model.source.items.filter(item=>item._selected)));                                        
                    // // reset selection
                    // controller.model.source.items.forEach(item=>item._selected = false)
                    // selected.forEach(item=>item._selected = false)
                    controller.model.sourceSelected.forEach(item=>item._selected = false);
                    let selected = Commons.copyArray(controller.model.sourceSelected);

                    // merge with target list
                    let newTarget = Commons.copyArray(controller.model.target.items);
                    newTarget.push(...selected);
                    newTarget = Commons.uniqueArray(newTarget);
                    newTarget.sort((a,b)=>a.value.localeCompare(b.value));
                    // put new target list
                    while(controller.model.target.items.length>0) controller.model.target.items.pop();
                    controller.model.target.items.push(...newTarget);
                },
                handleRemoveSelected: async function(e, that){
                    // const indexesToRemove = Commons.findIndexesOf(controller.model.target.items, "_selected", true);
                    Commons.removeByPropertyInPlace(controller.model.target.items, "_selected", true);                                        
                },
                handleAddVisible: async function(e, that){

                }                                                                                 
            }
            return controller;
        }
    }

    rivets.components['plot-timebased'] = {
        template: function(item) {            
            const template = `            
        <div class="my-4" rv-class-is-hidden="model.traces.hidden">            
            <h5 class="title is-5">{{model.entity.title}}</h5>     
            <div class="dropdown" rv-class-is-active="model.timeFilter.isActive" rv-class-is-hidden="model.timeFilter.isHidden">
                <div class="dropdown-trigger" rv-on-click="_toggleTimeFilter">
                    <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
                    <span>Show only</span>
                    <span class="icon is-small">
                        <i class="fas fa-angle-down" aria-hidden="true"></i>
                    </span>
                    </button>
                </div>
                <div class="dropdown-menu" id="dropdown-menu" role="menu">
                    <div class="dropdown-content">
                        <a class="dropdown-item" rv-class-is-active="model.timeFilter.mins | eq 5" rv-on-click="_filterTime" rv-data-mins="5"> Last 5 mins </a>
                        <a class="dropdown-item" rv-class-is-active="model.timeFilter.mins | eq 10" rv-on-click="_filterTime" rv-data-mins="10"> Last 10 mins </a>
                        <a class="dropdown-item" rv-class-is-active="model.timeFilter.mins | eq 15" rv-on-click="_filterTime" rv-data-mins="15"> Last 15 mins </a>
                        <a class="dropdown-item" rv-class-is-active="model.timeFilter.mins | eq 30" rv-on-click="_filterTime" rv-data-mins="30"> Last 30 mins </a>
                        <a class="dropdown-item" rv-class-is-active="model.timeFilter.mins | eq 60" rv-on-click="_filterTime" rv-data-mins="60"> Last hour </a>
                        <a class="dropdown-item" rv-class-is-active="model.timeFilter.mins | eq 360" rv-on-click="_filterTime" rv-data-mins="360"> Last 6 hours </a>
                        <a class="dropdown-item" rv-class-is-active="model.timeFilter.mins | eq 720" rv-on-click="_filterTime" rv-data-mins="720"> Last 12 hours </a>
                        <a class="dropdown-item" rv-class-is-active="model.timeFilter.mins | eq 1440" rv-on-click="_filterTime" rv-data-mins="1440"> Last 24 hours </a>
                        <a class="dropdown-item" rv-class-is-active="model.timeFilter.mins | eq 2880" rv-on-click="_filterTime" rv-data-mins="2880"> Last 2 days </a>
                        <a class="dropdown-item" rv-class-is-active="model.timeFilter.mins | eq 10080" rv-on-click="_filterTime" rv-data-mins="10080"> Last 7 days </a> 
                        <a class="dropdown-item" rv-class-is-active="model.timeFilter.mins | eq 20160" rv-on-click="_filterTime" rv-data-mins="20160"> Last 14 days </a> 
                        <hr class="dropdown-divider" />               
                        <a class="dropdown-item" rv-on-click="_filterTimeRemove"> Show all data </a>                
                    </div>
                </div>
            </div>     
            <div class="here-plot"></div>       
            <span class="is-hidden">{{redraw | call model.traces.updated}}</span>                
        </div>
      `
              return template;
          },
        static: [],
        // dynamic bound: 'errorMsg'
        initialize: function(el, data) {
            
            const controller = {
                // emitter: data.emitter,            
                model: {
                    traces: data.traces, // { traceName: {l: "label",d: [{x: 1111111; y: numericalValue}]}}  // ts sorted
                    timeFilter: {
                        isHidden: true,
                        isActive: false,
                        value: undefined
                    },                    
                    error:{
                        code: 0,
                        message: "OK"
                    }
                }, 
                _toggleTimeFilter: (e, that)=>{
                    controller.model.timeFilter.isActive = !controller.model.timeFilter.isActive
                },
                _filterTime: (e, that)=>{
                    const ms = Number.parseInt(e.target.dataset.mins)*60*1000;
                    controller.model.timeFilter.mins = Number.parseInt(e.target.dataset.mins);
                    controller.model.timeFilter.value = Date.now()-ms;                    
                    controller._toggleTimeFilter();
                    controller.redraw();
                },
                _filterTimeRemove: (e, that)=>{
                    controller._toggleTimeFilter();
                    controller.redraw(Date.now());
                },
                redraw: (redrawTimestamp)=>{
                    if(redrawTimestamp){
                        controller.model.timeFilter.mins = undefined
                        controller.model.timeFilter.value = undefined
                    }
                    // console.log(`redrawing`, controller.model.traces)
                    // remove previous
                    let holderElement = document.getElementsByClassName("here-plot")[0]
                    holderElement.innerHTML = '';
                    const theElement = document.createElement("div");
                    holderElement.appendChild(theElement);
                    
                    

                    // no data to draw
                    if(Object.keys(controller.model.traces.data).length == 0){
                        controller.model.timeFilter.isHidden = true;
                        return;
                    } 

                    controller.model.timeFilter.isHidden = false;

                    // const stats = value
                    // const dataset = el.dataset;

                    const graphData = [];

                    const xLabels = {}

                    let itemsCount = 0;

                    Object.keys(controller.model.traces.data).forEach((traceName,index)=>{
                        const record = controller.model.traces.data[traceName];

                        const data4Graph = {
                            x: record.d.filter(item=>controller.model.timeFilter.value?item.x>=controller.model.timeFilter.value:true).map(item=>item.x),
                            y: record.d.map(item=>item.y),
                            mode: 'lines',
                            name: record.l,
                            connectgaps: true
                        }
                        graphData.push(data4Graph);

                        record.d.filter(item=>controller.model.timeFilter.value?item.x>=controller.model.timeFilter.value:true).forEach(item=>xLabels[item.x] = item.l)                        

                        itemsCount += record.d.filter(item=>controller.model.timeFilter.value?item.x>=controller.model.timeFilter.value:true).length

                    })



                    
                    var layout = {
                        title: data.title,
                        autosize: true,
                        showlegend: true,
                        // width: 500,
                        legend: {
                            x: 0,
                            y: -0.75
                        },
                        xaxis: {
                            tickvals: Object.keys(xLabels).map(Number).sort((a, b) => a - b),  // Specify the actual x values
                            ticktext: Object.keys(xLabels).map(Number).sort((a, b) => a - b).map(item=>xLabels[item]),  // Custom labels for x values
                            tickmode: 'array'  // Use an array to map tickvals to ticktext
                        }                        
                    };   
                    
                    // once more check if there is anything to draw - as time filter might have filtered out all data
                    if(itemsCount == 0){
                        return
                    }
                        

                    Plotly.newPlot(theElement, graphData, layout,  {displayModeBar: false, responsive: true});            
                }                                              
            }                
            return controller;
        }
    } 
    


})();