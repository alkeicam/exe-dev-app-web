/**
 * Day info object
 * @typedef {Object} DayInfo
 * @property {number} ts - start of day timestamp
 * @property {string} dayName - name of day in YYYY-MM-DD format
 */

/**
 * Interval info object
 * @typedef {Object} IntervalInfo
 * @property {number} ts - start of interval timestamp
 * @property {string} name - primary name of interval moment
 * @property {string} nameLong - secondary name of interval moment
 */

/**
 * Hour info object
 * @typedef {Object} HourInfo
 * @property {number} ts - start of hour
 * @property {string} name - name of hour in HH24:MM format
 */

/**
 * Stats holder
 * @typedef {Object} Effort
 * @property {number} cals - number of calories burnt
 * @property {number} commits - number of commits made
 * @property {number} lines - number of lines affected
 * @property {number} entropy - product entropy measure
 */
/**
 * Stats for given day
 * @typedef {Object} DailyStats
 * @property {DayInfo} day - day information
 * @property {Effort} value - day stats
 */

/**
 * Stats for given day
 * @typedef {Object} IntervalEffort
 * @property {IntervalInfo} interval - interval information
 * @property {Effort} value - interval stats
 */


/**
 * User Stats for given period
 * @typedef {Object} UserDailyStats
 * @property {string} user - user id (usually email)
 * @property {DailyStats[]} daily - day by day stats
 */

/**
 * User Stats for given period
 * @typedef {Object} UserIntervalStats
 * @property {string} user - user id (usually email)
 * @property {IntervalEffort[]} efforts - day by day stats
 */


// /**
//  * Stats
//  * @typedef {Object} Stats
//  * @property {DayInfo[]} days - days included in stats (ascending, continous)
//  * @property {UserDailyStats[]} users - user raw performance
//  * @property {UserDailyStats[]} usersMa - user moving average performance
//  */

/**
 * Stats
 * @typedef {Object} Stats
 * @property {IntervalInfo[]} intervals - days included in stats (ascending, continous)
 * @property {UserIntervalStats[]} users - user raw performance
 * @property {UserIntervalStats[]} usersMa - user moving average performance
 */



class Controller {
    
    constructor() {
        this.CONST = {
        }        
        
        
        this.model = {
            user: undefined,
            token: undefined,            
            busy: true,
            accounts: [
                // { Account}
            ],// for account switcher
         
            account: {},                        
            handlers: {},
            views: {
                settings: {
                    mfa: {
                        disabled: false,
                        label: "MFA",
                        cta: {
                            label: "",
                            action: async ()=>{
                                const {codes} = await BackendApi.AUTH.mfaRegister(this.model.user.id);
                                this.model.views.mfaStep1.form.sections[0].props.find(item=>item.unique_name == "code").value = codes.secret
                                
                                const imageInfo = {
                                    name: `code.png`,
                                    size: 100,
                                    src: codes.qr_code,
                                    mimetype: ""
                                }
                                
                                // `name:code.png;size:100;data:${codes.qr_code}`
                                this.model.views.mfaStep1.form.sections[0].props.find(item=>item.unique_name == "qrcode").value = Commons.imageInfo2ImagePropValue(imageInfo).value;
                                this.model.views.mfaStep1.form.sections[0].props.find(item=>item.unique_name == "qrcode").display_value = Commons.imageInfo2ImagePropValue(imageInfo).display_value;
                                
                                this.model.views.mfaStep1.active = true; 
                            }
                        }
                    }
                },
                profile: {
                    visible: true,
                    sections: [
                        {
                            layout: "is-full",
                            section_name:"Core data",
                            props: [
                                {
                                    label: "Id",
                                    datatype: "string",
                                    value: "",
                                    editable: false,
                                    obligatory: true,
                                    unique_name: "id"
                                },
                                {
                                    label: "Name",
                                    datatype: "string",
                                    value: "",
                                    editable: false,
                                    obligatory: true,
                                    unique_name: "name"
                                }
                            ]
                        },
                        {
                            layout: "is-full",
                            section_name:"MFA",
                            props: [
                                {
                                    label: "MFA Enabled",
                                    datatype: "boolean",
                                    value: "",
                                    editable: false,
                                    obligatory: true,
                                    unique_name: "mfa.enabled"
                                }
                            ]
                        },
                        {
                            layout: "is-full",
                            section_name:"Alternative bindings",
                            props: [
                                {
                                    label: "Emails",
                                    datatype: "tags",
                                    value: "",
                                    editable: false,
                                    obligatory: true,
                                    unique_name: "authority"
                                }
                            ]
                        }
                    ]
                },
                mfaStep1: {
                    // title: "MFA Code",
                    active: false,
                    saveLabel: "Proceed",
                    onSave: async (form)=>{                                
                        // const item = Commons.objectFromFormWithProps(form);
                        // await controller.handleLoginWithMFA(item.mfaToken);
                        this.model.views.mfaStep2.active = true
                    },
                    form: {
                        intro: `
                        <strong>Step #1</strong><p>Open you authenticator app and either scan the qr code or enter code manually. Then proceed to next step.</p>
                        `,
                        visible: true,
                        sections: [
                            {
                                layout: "is-full",
                                section_name:"",
                                props: [
                                    {
                                        label: "Code",
                                        datatype: "string",
                                        value: "",                                        
                                        editable: false,
                                        obligatory: true,
                                        unique_name: "code"
                                    },
                                    {
                                        label: "QRCode",
                                        datatype: "image",
                                        value: "",                                        
                                        editable: false,
                                        obligatory: true,
                                        unique_name: "qrcode"
                                    }
                                ]
                            }
                        ]
                    }
                },
                mfaStep2: {
                    // title: "MFA Code",
                    active: false,
                    saveLabel: "Verify",
                    onSave: async (form)=>{                                
                        const item = Commons.objectFromFormWithProps(form);
                        // await controller.handleLoginWithMFA(item.mfaToken);

                        try{
                            await BackendApi.AUTH.mfaVerify(this.model.user.id, item.mfaToken);     
                            window.alert("Success. MFA Enabled.")                                                   
                        }
                        catch(error){
                            window.alert("Invalid token. Try again.")                            
                        }                                                 
                    },
                    form: {
                        visible: true,
                        intro: `
                        <strong>Step #2</strong><p>Now enter token from the authenticator app to verify authenticator and complete the process.</p>
                        `,
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
            }

        }
    }



    

    static async getInstance(){                           
        const a = new Controller()        
        const {token, user} = await BackendApi.AUTH.me();


        if(!user || !token)
            window.location = "hello.html";

        a.model.user = user;
        a.model.token = token

        try{

            await a._prepareAccounts(a.model.user);
            // const participantsData = await BackendApi.USERS.getUserInfo(user.id);
            // a.model.participant = participantsData[0]
            // a.model.participant.id = a.model.participant.email;  
            
            a.model.views.settings.mfa.disabled = a.model.user.mfa?.enabled?"true":undefined
            // a.model.views.settings.mfa.disabled = a.model.user.mfa?.enabled?undefined:"true"
            a.model.views.settings.mfa.cta.label = a.model.user.mfa?.enabled?"👍 MFA Enabled":"⚠️ Enable MFA"
        }catch(error){
            console.log(error);
            window.location = "hello.html?message=Session expired. Please log in again.";
        }                
        a.model.busy = false;
        return a;
    }

    async _handleSignOut(e, that){
        State.PREFERENCES.accountReset();
        await BackendApi.AUTH.signOut();
        window.location = "hello.html?message=Signed out. Please log in again.";
    }

    async _handleToggleMobileMenu(e, that){
        that.model.menu.active = !that.model.menu.active;
    }
    
    async _prepareAccounts(user){
        const accountIds = user.authority.map(item=>item.accountId);

        this.model.accounts.length = 0;

        for(let i=0; i<accountIds.length; i++){
            const account = await BackendApi.getAccount(accountIds[i]);
            this.model.accounts.push(account);
        }
        this.model.account = this.model.accounts[0];                
    }    
}

