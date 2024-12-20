class BackendApi {
    static BASE_URL = "https://devjam-lab.azurewebsites.net"
    // static BASE_URL = "http://localhost:7071"
    static API = {
        EVENTS: "/account/{{accountId}}/events/since/{{dateMs}}",
        USER_EVENTS: "/account/{{accountId}}/user/{{userId}}/events/since/{{dateMs}}",
        EVENTS_BETWEEN: "/account/{{accountId}}/events/since/{{dateMs}}/to/{{dateToMs}}",
        ACCOUNT_INVITATIONS: "/account/{{accountId}}/invitations",
        ACCOUNT_PROJECT_INVITATION: "/account/{{accountId}}/projects/{{projectId}}/invitations",
        ACCOUNT_PROJECT_MGMT_INVITE: "/account/{{accountId}}/projects/{{projectId}}/mgmt/invitations",
        ACCOUNT_PROJECT_MGMT_INVITATION_RESET: "/account/{{accountId}}/projects/{{projectId}}/mgmt/invitation/{{invitationCode}}/reset",
        ACCOUNT_PROJECT: "/account/{{accountId}}/project/{{projectId}}",
        ACCOUNT_PROJECT_EVENTS_BETWEEN: "/account/{{accountId}}/project/{{projectId}}/events/since/{{dateMs}}/to/{{dateToMs}}",
        ACCOUNT_PLAYLIST: "/account/{{accountId}}/playlist/{{playlistId}}/{{secret}}",
        ACCOUNT_DASHBOARDS: "/account/{{accountId}}/dashboards",
        USER: "/user/{{userId}}",
        ACCOUNT: "/account/{{accountId}}",
        AUTH_SIGNIN: "/auth/signin",
        AUTH_MFA_CHECK: "/auth/mfa/check/{{login}}",
        AUTH_MFA_REGISTER: "/auth/mfa/register/{{login}}",
        AUTH_MFA_VERIFY: "/auth/mfa/verify/{{login}}/{{token}}",
        PROJECTS_CREATE: "/account/{{accountId}}/projects"
    }

    static getX(){
        // console.log(BackendApi.BASE_URL);
    }

    static async getUser(){        
        const response = await fetch("/.auth/me");
        const responseJson = await response.json();
        // console.log(responseJson);
        return responseJson
    }

    static AUTH = {
        async signin(login, pass, token){
            const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.AUTH_SIGNIN}`)
            const url = urlFunction({});
            // console.log(url);
            const response = await fetch(url,{
                method: "POST", 
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({login: login, pass: pass, token}),
            });
            const responseJson = await response.json();
            localStorage.setItem("Auth:token", responseJson.token);
            localStorage.setItem("Auth:user", JSON.stringify(responseJson.user));
            return responseJson;
        },
        async me(){
            return {
                token: localStorage.getItem("Auth:token"),
                user: JSON.parse(localStorage.getItem("Auth:user")),
                // // temp
                // accountRole: JSON.parse(localStorage.getItem("Auth:user"))?JSON.parse(localStorage.getItem("Auth:user")).authority[0].roles[0]:""
            }
        },
        async signOut(){
            localStorage.setItem("Auth:token", "");
            localStorage.setItem("Auth:user",JSON.stringify({}));
        },
        async isMFARequired(login){
            const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.AUTH_MFA_CHECK}`)
            const url = urlFunction({
                login
            });
            // console.log(url);
            const response = await fetch(url,{
                method: "GET", 
                headers: {
                  "Content-Type": "application/json",
                }                
            });
            const responseJson = await response.json();
            return responseJson;
        },
        async mfaRegister(login){
            const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.AUTH_MFA_REGISTER}`)
            const url = urlFunction({
                login
            });
            // console.log(url);
            const response = await BackendApi._fetch(url,{
                method: "GET", 
                headers: {
                  "Content-Type": "application/json",
                }                
            });
            const responseJson = await response.json();
            return responseJson;
        },
        async mfaVerify(login, token){
            const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.AUTH_MFA_VERIFY}`)
            const url = urlFunction({
                login, token
            });
            // console.log(url);
            const response = await BackendApi._fetch(url,{
                method: "GET", 
                headers: {
                  "Content-Type": "application/json",
                }                
            });
            if(!response.ok) throw new Error(`Failed mfa verification`);
            // const responseJson = await response.json();
            // return responseJson;
            return;
        }
    }

    static PROJECTS = {
        async create(accountId, name){
            const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.PROJECTS_CREATE}`)
            const url = urlFunction({
                accountId: accountId
            });
            // console.log(url);
            const response = await BackendApi._fetch(url,{
                method: "POST", 
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({name: name}),
            });
            const responseJson = await response.json();            
            return responseJson;
        },
        async getProjectInfo(accountId, projectId){
            const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.ACCOUNT_PROJECT}`)
            const url = urlFunction({accountId: accountId, projectId:projectId });
            // console.log(url);
            const response = await BackendApi._fetch(url);
            const itemsResponse = await response.json();
            const items = itemsResponse.items;
            return items;
        },
        INVITATIONS: {
            async create(accountId, projectId, name, email, role){
                const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.ACCOUNT_PROJECT_INVITATION}`)
                const url = urlFunction({
                    accountId: accountId,
                    projectId: projectId
                });
                // console.log(url);
                const response = await BackendApi._fetch(url,{
                    method: "POST", 
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({name: name, email: email, role: role}),
                });
                const responseJson = await response.json();            
                return responseJson;
            }
        },
        MANAGEMENT: {
            async invite(accountId, projectId, name, email, role, password){
                const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.ACCOUNT_PROJECT_MGMT_INVITE}`)
                const url = urlFunction({
                    accountId: accountId,
                    projectId: projectId
                });
                // console.log(url);
                const response = await BackendApi._fetch(url,{
                    method: "POST", 
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({name: name, email: email, role: role, password: password}),
                });
                const responseJson = await response.json();            
                return responseJson;
            },
            async resetInvitation(accountId, projectId, invitationCode){
                const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.ACCOUNT_PROJECT_MGMT_INVITATION_RESET}`)
                const url = urlFunction({
                    accountId: accountId,
                    projectId: projectId,
                    invitationCode: invitationCode
                });
                // console.log(url);
                const response = await BackendApi._fetch(url,{
                    method: "POST", 
                    headers: {
                    "Content-Type": "application/json",
                    },
                    // body: JSON.stringify({name: name, email: email, role: role, password: password}),
                });
                const responseJson = await response.json();            
                return responseJson;
            }
        }
    }

    static ACCOUNTS = {
        async getAccountInvitations(accountId){        
            const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.ACCOUNT_INVITATIONS}`)
            const url = urlFunction({accountId: accountId});
            // console.log(url);
            const response = await BackendApi._fetch(url);
            const jsonResponse = await response.json();
            return jsonResponse.items;        
        },
        async getPlaylist(accountId, playlistId, secret){
            const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.ACCOUNT_PLAYLIST}`)
            const url = urlFunction({accountId: accountId, playlistId: playlistId, secret: secret});
            // console.log(url);
            const response = await BackendApi._fetch(url);
            const jsonResponse = await response.json();
            return jsonResponse.items;   
        },
        async getDashboards(accountId){
            const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.ACCOUNT_DASHBOARDS}`)
            const url = urlFunction({accountId: accountId});
            // console.log(url);
            const response = await BackendApi._fetch(url);
            const jsonResponse = await response.json();
            return jsonResponse.items;   
        }
    }

    static EVENTS = {
        async getAccountUserEventsSince(accountId, userId, sinceMs){
            const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.USER_EVENTS}`)
            const url = urlFunction({accountId: accountId, dateMs: sinceMs, userId: userId});
            // console.log(url);
            const response = await BackendApi._fetch(url);
            const eventsResponse = await response.json();
            const events = eventsResponse.items;
            return events;
        },
        async getAccountProjectEventsSince(accountId, projectId, sinceMs){
            const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.ACCOUNT_PROJECT_EVENTS_BETWEEN}`)
            const url = urlFunction({accountId: accountId, projectId: projectId, dateMs: sinceMs, dateToMs: Date.now()});
            // console.log(url);
            const response = await BackendApi._fetch(url);
            const eventsResponse = await response.json();
            const events = eventsResponse.items;
            return events;
        },
        async getAccountProjectEventsBetween(accountId, projectId, sinceMs, toMs){
            const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.ACCOUNT_PROJECT_EVENTS_BETWEEN}`)
            const url = urlFunction({accountId: accountId, projectId: projectId, dateMs: sinceMs, dateToMs: toMs});
            // console.log(url);
            const response = await BackendApi._fetch(url);
            const eventsResponse = await response.json();
            const events = eventsResponse.items;
            return events;
        }
    }

    static USERS = {
        async getUserInfo(userId){
            const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.USER}`)
            const url = urlFunction({userId: userId});
            // console.log(url);
            const response = await BackendApi._fetch(url);
            const itemsResponse = await response.json();
            const items = itemsResponse.items;
            return items;
        }
    }

    static _authHeadersDecorator(headers){
        const token = localStorage.getItem("Auth:token");
        if(token){
            headers['Authorization'] = `Bearer ${token}`
        }            
    }

    static async getUser(){        
        

        const response = await fetch("/.auth/me");
        const responseJson = await response.json();
        console.log(responseJson);
        return responseJson
    }

    static async _fetch(url, options, body){
        if(!options)
            options = {}

        if(!options.headers)
            options.headers = {}
 
        BackendApi._authHeadersDecorator(options.headers)
        
        return await fetch(url, options, body);
    }

    static async getAccountEventsSince(accountId, sinceMs){
        const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.EVENTS}`)
        const url = urlFunction({accountId: accountId, dateMs: sinceMs});
        // console.log(url);
        const response = await BackendApi._fetch(url);
        const eventsResponse = await response.json();
        const events = eventsResponse.items;
        return events;
    }



    static async getAccountEventsBetween(accountId, sinceMs, toMs){
        let dateToMs = toMs;

        if(!dateToMs)
            dateToMs = moment().endOf("day").valueOf();


        const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.EVENTS_BETWEEN}`)
        const url = urlFunction({accountId: accountId, dateMs: sinceMs, dateToMs: dateToMs});
        // console.log(url);
        const response = await BackendApi._fetch(url);
        const eventsResponse = await response.json();
        const events = eventsResponse.items;
        return events;
    }

    static async getAccount(accountId){
        const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.ACCOUNT}`)
        const url = urlFunction({accountId: accountId});
        // console.log(url);
        const response = await BackendApi._fetch(url);
        const jsonResponse = await response.json();
        return jsonResponse.item;
    }

    

}