class CommonsApp {
    static async loadEventsForProject(accountId, projectId, range, referenceDateTs ){
        const specifications = range.split("_");

        const mode = range.includes("_")?specifications[0]:"all_time";
        let referenceTs = referenceDateTs?referenceDateTs:Date.now();
        
        let events = []


        switch(mode){
            case "w":
                // weekly 
                // we always include interval that contains referenceTs

                // const endTs = moment(referenceTs).endOf('isoWeek').valueOf();
                // const startTs = moment(endTs).add(-specifications[1],"weeks").valueOf();
                const endTs = moment(referenceTs).endOf('week').add(1, 'days').valueOf();
                const startTs = moment(endTs).add(-specifications[1],"weeks").valueOf();
                events = await BackendApi.EVENTS.getAccountProjectEventsBetween(accountId, projectId, startTs, endTs);
                break;
        }                
        return events;
    } 
}