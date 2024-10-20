// function initializeRivetFormatters() {
    rivets.formatters.fromTimestamp = function (value, format) {
        var theDate = new Date(value);
        
        if(format == 'day'){
            var result = theDate.toLocaleDateString(undefined, {
                day: 'numeric',
                month: '2-digit',
                year: 'numeric'
            })
        }else{
            var result = theDate.toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'short',
                // year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        }
        
        return result;
    }

    rivets.formatters.timeFormatMoment = function (value, format) {
        let result = 'moment lib not detected';
        if(moment){
            result = moment.utc(value).format(format)
        }
        return result;        
    }

    rivets.formatters.timeAgoMoment = function (value) {
        let result = 'moment lib not detected';
        if(moment){
            if(value)
                result = moment.utc(value).fromNow();
            else 
                result = "Long time ago"
        }
        return result;        
    }

    rivets.formatters.modeq = function(value, mod, target){
        console.log(value, mod, target)
        console.log(value % mod)
        return value % mod == target;
    }

    // <a rv-href="group.Id | hrefBuilder 'group.aspx?id=@value&name=@0&owner=@1' group.Name group.Owner">My Link</a>
    rivets.formatters.hrefBuilder = function (value, text) {
        text = text.replace('@value', value);

        var args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
        args.shift(); args.shift(); //remove the "value" and "text" arguments from the array

        for (var i = 0; i < args.length; i++) {
            text = text.replace('@' + i, args[i]);
        }

        text = text.replace('@now', new Date().getTime());

        return text;
    };

    rivets.formatters.variableBuilder = function (value, text) {
        text = text.replace('@value', value);

        var args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
        args.shift(); args.shift(); //remove the "value" and "text" arguments from the array

        for (var i = 0; i < args.length; i++) {
            text = text.replace('@' + i, args[i]);
        }

        text = text.replace('@now', new Date().getTime());

        return text;
    };

    rivets.formatters.eq = function (value, arg) {
        return value == arg;
    };

    rivets.formatters.eqCI = function (value, arg) {
        if(!value || !arg)
            return false;
        return value.toUpperCase() == arg.toUpperCase();
    };

    rivets.formatters.neq = function (value, arg) {
        return value != arg;
    };

    rivets.formatters.neqCI = function (value, arg) {
        if(!value || !arg)
            return false;
        return value.toUpperCase() != arg.toUpperCase();
    };

    rivets.formatters.split = function (value) {
        var result = [];
        if (!value)
            return result;
        try {
            result = value.trim().split(',');
        } catch (exception) {
            result = [];
        }
        return result;
    };

    rivets.formatters.notEmpty = function (value) {
        if (value)
            return true;
        return false;
    }

    rivets.formatters.empty = function (value) {
        if (value)
            return false;
        return true;
    }

    rivets.formatters.emptyObject = function (value) {
        if (!value)
            return true;
        return Object.keys(value).length === 0 && value.constructor === Object;
    }

    rivets.formatters.notEmptyObject = function (value) {
        if (!value)
            return false;
        return !(Object.keys(value).length === 0 && value.constructor === Object);
    }

    rivets.formatters.size = function (value) {
        if(value?.constructor === Object) return 0
        if (!value)
            return 0;
        return value.length;
    }

    rivets.formatters.sizeGte = function (value, arg) {
        if(value?.constructor === Object) return 0
        if (!value)
            return false;
        
        return value.length >= arg;
    }

    rivets.formatters.sizeLt = function (value, arg) {
        if(value?.constructor === Object) return 0
        if (!value)
            return false;

        if(!Array.isArray(value)) return false;
        
        return value.length < arg;
    }

    rivets.formatters.sizeLtAnd = function (value, arg, condition) {
        if(value?.constructor === Object) return 0
        if (!value)
            return false;
        
        return value.length < arg && condition;
    }

    rivets.formatters.sizeLte = function (value, arg) {
        if(value?.constructor === Object) return 0
        if (!value)
            return false;
        
        return value.length <= arg;
    }

    rivets.formatters.gt = function (value, arg) {
        if (!value)
            return false;
        return value > arg;
    }

    rivets.formatters.gte = function (value, arg) {
        if (!value)
            return false;
        return value >= arg;
    }

    rivets.formatters.lt = function (value, arg) {
        if (!value)
            return false;
        return value < arg;
    }
    rivets.formatters.lte = function (value, arg, property) {
        if (!value)
            return false;        
        return value <= arg;                
    }

    rivets.formatters.lteObject = function (value, arg, property) {
        if (!value)
            return false;

        if(property){
            const p1 = property.split(".")[0]
            const p2 = property.split(".")[1]
            return p2?value <= arg[p1][p2]:arg[p1];
        }else{
            return value <= arg;
        }
        
    }

    

    rivets.formatters.betweenLo = function (value, arg1, arg2) {
        if (!value)
            return false;
        return value > arg1 && value <= arg2;
    }

    rivets.formatters.itemAt = function (value, index) {
        if (!(value && value instanceof Array))
            return null;
        return value[index || 0];
    }

    rivets.formatters.propertyAt = function (value, propName) {
        if (!(value && value instanceof Object))
            return null;

        if(propName.includes(".")){
            const p1 = propName.split(".")[0]
            const p2 = propName.split(".")[1]
            return value[p1][p2];
        }else{
            return value[propName];
        }
        
    }

    rivets.formatters.propertyAtWithSubProperty = function (value, propName, subPropName) {
        if (!(value && value instanceof Object))
            return null;
        const main = value[propName];
        return main[subPropName];
    }

    rivets.formatters.filterEq = function (value, arg1, arg2) {
        if (!(value && value instanceof Array))
            return null;
        
        return value.filter((item)=>{return item[arg1] == arg2})
    }

    rivets.formatters.hasRole = function (value, roleId) {
        if(!value)
            return false;
        
        if(!value.data)
            return false;
        
        if(!value.data.r)
            return false;

        return value.data.r.split(',').includes(roleId);        
    }

    rivets.formatters.lacksRole = function (value, roleId) {
        return  !rivets.formatters.hasRole(value, roleId);      
    }

    rivets.formatters.addNumber = function (value, arg) {
        return value + arg;
    }

    rivets.formatters.toCurrency = function (value){
        var amount = value/100.0;
        var amountFormatted = amount.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });
        
        return amountFormatted;
    }

    rivets.formatters.GWEItoETH = function (value){
        var amount = value/1e9;
        var amountFormatted = amount.toLocaleString('pl-PL', { maximumSignificantDigits: 9,  currency: 'ETH'});
        
        return amountFormatted;
    }

    rivets.formatters.decodeStatus = function (value){
        var descriptions = {
            'P': 'Oczekujaca'
        };
        var description =  descriptions[value];
        
        return description;
    }

    rivets.formatters.anchor = function (value){
        return "#"+value
    }

    rivets.formatters.twitterLink = function (value){
        let href = location.href;
        href += `%23${value.ct}`;       
        let txt = encodeURIComponent(value.b);
        const link = `https://twitter.com/share?url=${href}&text=${txt}`
        // console.log(link);
        return link;
    }

    rivets.formatters.decodeTransactionType = function (value){
        var descriptions = {
            'T': 'Napiwek',
            'W': 'Wypłata'
        };
        var description =  descriptions[value];
        
        if(!description){
            // when not set then use T
            description = descriptions['T'];
        }
        return description;
    }

    rivets.formatters.default = function(value, defaultValue) {
        return value || defaultValue;
    };

    rivets.formatters.and = function(comparee, comparator) {
        return comparee && comparator;
    }

    rivets.formatters.toCurrencyWithTypeAware = function (value, type){
        var amount = value/100.0;
        // when withdrawal then present as "minus" value
        if(type == 'W')
            amount = -amount;
        var amountFormatted = amount.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });
        
        return amountFormatted;
    }

    rivets.formatters.prefix = function (value, arg) {
        return `${value}${arg}` ;
    }

    rivets.formatters.debug = function (value){
        console.log(value);        
    }

    rivets.formatters.isMac = function (){
        isMac = navigator.platform.indexOf("Mac") === 0;

        return isMac
    }
    rivets.formatters.isWin = function (){
        isMac = navigator.platform.indexOf("Mac") === 0;

        return !isMac
    }

    rivets.formatters.whenEmpty = function (value, arg) {
        console.log(value)
        console.log(arg)
        if(!value) 
            return arg
        return value;
    }

    rivets.formatters.numberRoundDecimal = function (value, arg) {
        return parseFloat(value.toFixed(arg))
    }
    
    rivets.formatters.sliceArray = function(array, arg) {
        return array.slice(0, arg);
    };

    rivets.formatters.noneTrue = function(comparee, ...rest) {
        let result = rest.reduce((prev, curr)=>{
            return prev || curr
        },false);

        result =  comparee || result;
        return !result;
    }
    rivets.formatters.anyTrue = function(comparee, ...rest) {
        let result = rest.reduce((prev, curr)=>{
            return prev || curr
        },false);

        result =  comparee || result;
        return result;
    }

    rivets.formatters.fmtJsonString = function (value){
        return `${JSON.stringify(value)}`;
    }

    rivets.formatters.objectToArray = function (value){
        return Object.keys(value).map(item=>value[item])
    }

    rivets.formatters.objectsArraySortBy = function (value, property, ascending){
        return value.sort((a,b)=>{
            return ascending?a[property]-b[property]:b[property]-a[property]
        })
    }
    
    rivets.formatters.objectsArraySortBy = function (value, property, ascending){
        if(property.includes(".")){
            return value.sort((a,b)=>{
                const p1 = property.split(".")[0]
                const p2 = property.split(".")[1]
                return ascending?a[p1][p2]-b[p1][p2]:b[p1][p2]-a[p1][p2]
            })
        }else{
            return value.sort((a,b)=>{
                return ascending?a[property]-b[property]:b[property]-a[property]
            })
        }

        
    }

    rivets.formatters.matchPercentile = function (value, percentile, values){
        // Step 1: Sort the array in ascending order
        const sortedArr = values.sort((a, b) => a - b);

        // Step 2: Calculate the index for the percentile
        const index = (percentile / 100) * (sortedArr.length - 1);

        // Step 3: If the index is an integer, return the element at that index
        if (Number.isInteger(index)) {
            return sortedArr[index];
        }

        // Step 4: If not an integer, interpolate between two closest values
        const lowerIndex = Math.floor(index);
        const upperIndex = Math.ceil(index);
        const weight = index - lowerIndex;

        const percentileTarget =  sortedArr[lowerIndex] * (1 - weight) + sortedArr[upperIndex] * weight;
        return value >= percentileTarget
    }

    rivets.formatters.matchPercentileFromObject = function (value, percentile, sourceProperty, targetProperty){
        const values = [];
        // get values array from object - its assumed that first level keys will be turned to array
        Object.keys(value).map(key=>value[key]).map(item=>{
            const p1 = targetProperty.split(".")[0]
            const p2 = targetProperty.split(".")[1]
            const arrayItem = p2?item[p1][p2]:item[p1]
            values.push(arrayItem)
        })
        
        // Step 1: Sort the array in ascending order
        const sortedArr = values.sort((a, b) => a - b);

        // Step 2: Calculate the index for the percentile
        const index = (percentile / 100) * (sortedArr.length - 1);

        // Step 3: If the index is an integer, return the element at that index
        if (Number.isInteger(index)) {
            return sortedArr[index];
        }

        // Step 4: If not an integer, interpolate between two closest values
        const lowerIndex = Math.floor(index);
        const upperIndex = Math.ceil(index);
        const weight = index - lowerIndex;

        const percentileTarget =  sortedArr[lowerIndex] * (1 - weight) + sortedArr[upperIndex] * weight;

        const p1 = sourceProperty.split(".")[0]
        const p2 = sourceProperty.split(".")[1]

        return p2?value[p1][p2] >= percentileTarget:value[p1] >= percentileTarget
    }

    rivets.formatters.percentileValueFromObject = function (value, percentile, targetProperty){
        const values = [];
        // get values array from object - its assumed that first level keys will be turned to array
        Object.keys(value).map(key=>value[key]).map(item=>{
            const p1 = targetProperty.split(".")[0]
            const p2 = targetProperty.split(".")[1]
            const arrayItem = p2?item[p1][p2]:item[p1]
            values.push(arrayItem)
        })
        
        // Step 1: Sort the array in ascending order
        const sortedArr = values.sort((a, b) => a - b);

        // Step 2: Calculate the index for the percentile
        const index = (percentile / 100) * (sortedArr.length - 1);

        // Step 3: If the index is an integer, return the element at that index
        if (Number.isInteger(index)) {
            return sortedArr[index];
        }

        // Step 4: If not an integer, interpolate between two closest values
        const lowerIndex = Math.floor(index);
        const upperIndex = Math.ceil(index);
        const weight = index - lowerIndex;

        const percentileTarget =  sortedArr[lowerIndex] * (1 - weight) + sortedArr[upperIndex] * weight;

        return percentileTarget
    }

    /**
     * Calculates percentiles for the array generated from theObject objectProperty values and
     * checks if target object target property value matches requested percentile.
     * @param {*} theObject 
     * @param {*} objectProperty 
     * @param {*} percentile 
     * @param {*} targetObject 
     * @param {*} targetProperty 
     * @returns 
     */
    rivets.formatters.percentileValueFromObjectAgainstObject = function (theObject, objectProperty, percentile, targetObject, targetProperty){
        const values = [];
        // get values array from object - its assumed that first level keys will be turned to array
        Object.keys(theObject).map(key=>theObject[key]).map(item=>{
            const p1 = objectProperty.split(".")[0]
            const p2 = objectProperty.split(".")[1]
            const arrayItem = p2?item[p1][p2]:item[p1]
            values.push(arrayItem)
        })
        
        // Step 1: Sort the array in ascending order
        const sortedArr = values.sort((a, b) => a - b);

        // Step 2: Calculate the index for the percentile
        const index = (percentile / 100) * (sortedArr.length - 1);

        // Step 3: If the index is an integer, return the element at that index
        if (Number.isInteger(index)) {
            return sortedArr[index];
        }

        // Step 4: If not an integer, interpolate between two closest values
        const lowerIndex = Math.floor(index);
        const upperIndex = Math.ceil(index);
        const weight = index - lowerIndex;

        const percentileTarget =  sortedArr[lowerIndex] * (1 - weight) + sortedArr[upperIndex] * weight;

        const p1 = targetProperty.split(".")[0]
        const p2 = targetProperty.split(".")[1]

        if(p2){
            return targetObject[p1][p2] >= percentileTarget
        }else{
            return targetObject[p1] >= percentileTarget
        }

        
    }


    rivets.formatters.percentileLabelFromObjectAgainstObject = function (theObject, objectProperty, targetObject, targetProperty, percentileThresholds, percentileLabels, theDefault){
        const values = [];
        // get values array from object - its assumed that first level keys will be turned to array
        Object.keys(theObject).map(key=>theObject[key]).map(item=>{
            const p1 = objectProperty.split(".")[0]
            const p2 = objectProperty.split(".")[1]
            const arrayItem = p2?item[p1][p2]:item[p1]
            values.push(arrayItem)
        })
        // Step 1: Sort the array in ascending order
        const sortedArr = values.sort((a, b) => a - b);

        const percentileTargets = percentileThresholds.split(",").map(item=>{
            const percentile = item
            // Step 2: Calculate the index for the percentile
            const index = (percentile / 100) * (sortedArr.length - 1);

            // Step 3: If the index is an integer, return the element at that index
            if (Number.isInteger(index)) {
                return sortedArr[index];
            }

            // Step 4: If not an integer, interpolate between two closest values
            const lowerIndex = Math.floor(index);
            const upperIndex = Math.ceil(index);
            const weight = index - lowerIndex;

            const percentileTarget =  sortedArr[lowerIndex] * (1 - weight) + sortedArr[upperIndex] * weight;
            return percentileTarget;
        })                
        
        const p1 = targetProperty.split(".")[0]
        const p2 = targetProperty.split(".")[1]

        let targetValue = p2?targetObject[p1][p2]:targetObject[p1];                

        for(let i=0; i<percentileTargets.length; i++){
            if(percentileTargets[i]<targetValue) return percentileLabels.split(",")[i]
        }

        return theDefault
    }
    
    

// };