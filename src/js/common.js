

class Commons {
        
    static mergeObjects(target, source) {
        for (const key of Object.keys(source)) {
            if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
                Commons.mergeObjects(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        // Include properties from source that are not present in target
        for (const key of Object.keys(target)) {
            if (!(key in source)) {
                source[key] = target[key];
            }
        }
        return source;
    }

    static clearObject(obj) {
        Object.keys(obj).forEach(prop => {
          obj[prop] = undefined;
        });
    }
    
    static downloadDataJSON(object, name){
        var element = document.createElement('a');
        element.setAttribute("href", `data:application/json,${encodeURIComponent(JSON.stringify(object))}`);
        element.setAttribute("download", name);
        document.body.appendChild(element); // required for firefox
        element.click();
        element.remove();                
    }

    static getQueryParam(paramName){
        const urlParams = new URLSearchParams(window.location.search);
        const myParam = urlParams.get(paramName);
        return myParam;
    }
}