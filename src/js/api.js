class BackendApi {
    static BASE_URL = "http://localhost:7071"
    static API = {
        EVENTS: "/account/{{accountId}}/events/since/{{dateMs}}",
        EVENTS_BETWEEN: "/account/{{accountId}}/events/since/{{dateMs}}/to/{{dateToMs}}",
        ACCOUNT: "/account/{{accountId}}"
    }

    static getX(){
        console.log(BackendApi.BASE_URL);
    }

    static async getAccountEventsSince(accountId, sinceMs){
        const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.EVENTS}`)
        const url = urlFunction({accountId: accountId, dateMs: sinceMs});
        console.log(url);
        const response = await fetch(url);
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
        console.log(url);
        const response = await fetch(url);
        const eventsResponse = await response.json();
        const events = eventsResponse.items;
        return events;
    }

    static async getAccount(accountId){
        const urlFunction = Handlebars.compile(`${BackendApi.BASE_URL}${BackendApi.API.ACCOUNT}`)
        const url = urlFunction({accountId: accountId});
        console.log(url);
        const response = await fetch(url);
        const jsonResponse = await response.json();
        return jsonResponse.item;
    }
}