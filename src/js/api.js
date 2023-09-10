class BackendApi {
    // static BASE_URL = "https://devjam-lab.azurewebsites.net"
    static BASE_URL = "http://localhost:7071"
    static API = {
        EVENTS: "/account/{{accountId}}/events/since/{{dateMs}}",
        EVENTS_BETWEEN: "/account/{{accountId}}/events/since/{{dateMs}}/to/{{dateToMs}}",
        ACCOUNT: "/account/{{accountId}}",
        AUTH_SIGNIN: "/auth/signin"
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
        async signin(login, pass){
            const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.AUTH_SIGNIN}`)
            const url = urlFunction({});
            // console.log(url);
            const response = await fetch(url,{
                method: "POST", 
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({login: login, pass: pass}),
            });
            const responseJson = await response.json();
            localStorage.setItem("Auth:token", responseJson.token);
            localStorage.setItem("Auth:user", responseJson.user);
            return responseJson;
        },
        async me(){
            return {
                token: localStorage.getItem("Auth:token"),
                user: localStorage.getItem("Auth:user")
            }
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