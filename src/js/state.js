class State {
    static STATE_PREFIX = "App:State"
    static PREFERENCES = {
        account(account){
            if(account){
                localStorage.setItem(`${State.STATE_PREFIX}:account`, JSON.stringify(account));
            }
            else{
                const itemString = localStorage.getItem(`${State.STATE_PREFIX}:account`)
                return JSON.parse(itemString)
            }            
        },
        accountReset(){
            localStorage.removeItem(`${State.STATE_PREFIX}:account`);
        }
    }
}