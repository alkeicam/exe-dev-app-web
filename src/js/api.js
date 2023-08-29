class BackendApi {
    static BASE_URL = "https://devjam-lab.azurewebsites.net"
    static API = {
        EVENTS: "/account/{{accountId}}/events/since/{{dateMs}}"
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
}