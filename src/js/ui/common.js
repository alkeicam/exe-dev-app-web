/**
 * @typedef GRMEntity
 * @property {number} id
 * @property {number} task_id
 * @property {number} form_id
 * @property {string} name
 * @property {string} description
 * @property {number} tenant_id
 * @property {number} type_id
 * @property {number} assigned_to_id id of the user
 * @property {number} created_by_id id of the user
 * @property {number} owner_id id of the user
 * @property {string} create_date 
 * @property {string} last_modified_date
 * @property {number} security_group_owner_id
 * @property {GRMExtension[]} extensions
 * @property {GRMProcessInfo} process
 */

/**
 * @typedef GRMExtension
 * @property {string} value
 * @property {number} extension_id
 * @property {number} metadata_id
 * @property {number} entity_instance_id
 * @property {string} datatype
 * @property {string} unique_name
 * @property {number} tenant_id
 */

/**
 * @typedef GRMProcessInfo
 * @property {string} contextid
 * @property {number} id
 * @property {string} parentworkflowprocesscode
 * @property {string} status_label
 * @property {string} status_name
 * @property {string} statuscode 
 * @property {string} status_id
 */

/**
 * @typedef GRMMetadataInfo
 * @property {string} datatype
 * @property {boolean} editable
 * @property {boolean} is_header
 * @property {string} label
 * @property {number} metadata_id
 * @property {boolean} obligatory
 * @property {number} ordering
 * @property {number} section_id
 * @property {string} section_name
 * @property {number} section_number
 * @property {number} size
 * @property {number} tenant_id
 * @property {number} type_id
 * @property {string} unique_name
 * @property {number} visible
 * @property {string} pattern
 * @property {string} pattern_message
 * @property {string} rule
 * @property {string} default_value
 */

/**
 * @typedef Item
 * @property {Prop[]} props
 */

/**
 * @typedef Prop
 * @property {string} display_value
 * @property {string} latlng
 * 
 * @property {number} extension_id
 * @property {string} value
 * @property {string} datatype
 * @property {boolean} editable
 * @property {boolean} is_header
 * @property {string} label
 * @property {number} metadata_id
 * @property {boolean} obligatory
 * @property {number} ordering
 * @property {number} section_id
 * @property {string} section_name
 * @property {number} section_number
 * @property {number} size
 * @property {number} tenant_id
 * @property {number} type_id
 * @property {string} unique_name
 * @property {number} visible
 * @property {string} pattern
 * @property {string} pattern_message
 * @property {string} rule
 * @property {number} entity_instance_id
 * 
 * @property {PropDict} dict
 */

/**
 * @typedef PropDict
 * @property {number} id
 * @property {string} value
 * @property {string} display_value
 * 
 */

class Props {
    /**
     * 
     * @param {GRMExtension} extension (optional) when provided prop value will be populated with extension value
     * @param {GRMMetadataInfo} metadata 
     */
    static parse(metadata, extension, readonly=false){        

        if(extension&&metadata&&metadata.unique_name&&extension.unique_name&&extension.unique_name!=metadata.unique_name) throw new Error(`Metadata mismatch for extension ${extension.unique_name} and metadata ${metadata.unique_name}`);

        // initialize prop by merging
        const prop = Commons.mergeObjects(metadata, extension||{
            display_value: "",
            value: ""
        });
        if(metadata&&metadata.datatype){
            switch(metadata.datatype){
                case "array":
                    // {picklist_data_id: "88701", tenant_id: "88630", value: "City Express", metadata_id: "88644"}
                    // need to translate into prop                
                    prop.dict = metadata.dict.map(item=>{
                        return {
                            id: item.picklist_data_id,
                            value: item.value,
                            display_value: item.value
                        }
                    })
                    
                    break;
            }
        }
        

        if(extension){
            // now handle specific types of props
            // custom logic for point type // (lat,lon)#pointName" or (lat, lon) or (lat, lon)#
            let display;
            switch(extension.datatype){
                
                // date?calendar?dict?
                case "data":
                    display = moment(parseInt(extension.value)).format("YYYY-MM-DD HH:mm");
                    prop.display_value = display;
                    break;
                case "point":
                    display = extension.value.split("#")[1]
                    const latlng = extension.value.split("#")[0].replace("(","").replace(")","").trim()||"0,0";
                    prop.latlng = latlng;
                    prop.display_value = display;
                    break;
                case "array":
                    display = prop.dict.find(item=>item.id == extension.value)?.display_value;
                    prop.display_value = display;                    
                    break;
                // case "array":
                //     // {picklist_data_id: "88701", tenant_id: "88630", value: "City Express", metadata_id: "88644"}
                //     // for picklist we 
                //     break;
                default:
                    prop.display_value = extension.display_value||extension.value;
                    break
            }
        }
        if(readonly) prop.editable = false;
        return prop;

    }
}


class Commons {
    
    /**
     * 
     * @param {GRMEntity} entity (optional) when provided entity values will be populated to form values, it is also require when prelimnarySection is set to yes
     * @param {GRMMetadataInfo[]} metadatas 
     * @param {string} layout      
     * @returns 
     */
    static async metadatasToForm(metadatas, layout, entity, readonly=false, preliminarySection=true){
        const form = {
            visible: true,
            sections: []
        }
        const sections = [];

        if(preliminarySection&&!entity) throw new Error(`For prelimnary section entity data is required.`)

        let callResult = await grm.AdminApi.organizationAssetsTypes(entity.tenant_id);
        const grmType  = callResult.items.find((item)=>{
            return item.type_id == entity.type_id
        })

        metadatas.map((item)=>{
            // item is a metadata with section information to which metadata item belongs to
            // here we prepare a tempopary structure to extract all sections from this data.
            // here we will also provide actual value from entity extensions
            const processed = {
                spec: {
                    section_id: item.section_id,
                    section_intro_information: item.section_intro_information,
                    section_name: item.section_name,
                    section_number: item.section_number                    
                },
                prop: item
            }   

            let extension;
            if(entity){
                extension = entity.extensions.find(thatItem=>thatItem.unique_name == item.unique_name)
            }             

            processed.prop = Props.parse(item, extension, readonly);                           
            return processed;
        })
        .sort((a,b)=>{return a.spec.section_number-b.spec.section_number})
        .forEach((section)=>{
            const theSection = sections.find((item)=>{
                // console.log(item)
                return item.section_id == section.spec.section_id
            });            
            if(theSection){
                theSection.props.push(section.prop);                
            }else{
                /**
                 * section_name: "",
                                layout: "is-full",
                                props:
                 */
                sections.push({
                    section_id: section.spec.section_id,
                    section_name: section.spec.section_name,
                    section_intro_information: section.spec.section_name,
                    layout: layout||"is-one-third", //"is-full", "is-one-third"
                    props: [section.prop]
                })
            }
        })    
        let sectionsTemp = Commons._prepareSectionsData(sections);
        sectionsTemp.forEach((item)=>{item.props.sort((a,b)=>{return a.ordering-b.ordering})});

        if(preliminarySection){
            // todo add preliminary section with entity data 
            let entityId;

            switch(grmType.grm_type){
                case "Task":
                    entityId = entity.task_id
                    break;
                case "Resource":
                    entityId = entity.id
                    break;
                case "Object":
                    entityId = entity.id
                    break;
                case "Form":
                    entityId = entity.form_id
                    break;
            }
            const props = [
                {
                    label: "Id",
                    unique_name: "entity_id",
                    editable: false,
                    visible: true,
                    datatype: "string",
                    value: entityId                    
                },
                {
                    label: "Status",
                    unique_name: "entity_status",
                    editable: false,
                    visible: true,
                    datatype: "string",
                    value: entity.process?entity.process.status_name:""
                },
                {
                    label: "Name",
                    unique_name: "entity_name",
                    editable: false,
                    visible: true,
                    datatype: "string",
                    value: entity.name                    
                },
                {
                    label: "Description",
                    unique_name: "entity_description",
                    editable: false,
                    visible: true,
                    datatype: "string",
                    value: entity.description                    
                },
                {
                    label: "Owner",
                    unique_name: "entity_owner",
                    editable: false,
                    visible: true,
                    datatype: "string",
                    value: (await grm.AdminApi.userWithStruct(entity.owner_id)).items[0].login                    
                },
                {
                    label: "Assigne",
                    unique_name: "entity_assigne",
                    editable: false,
                    visible: true,
                    datatype: "string",
                    value: (await grm.AdminApi.userWithStruct(entity.assigned_to_id)).items[0].login                    
                },
                {
                    label: "Created by",
                    unique_name: "entity_creator",
                    editable: false,
                    visible: true,
                    datatype: "string",
                    value: (await grm.AdminApi.userWithStruct(entity.created_by_id)).items[0].login                    
                },
                {
                    label: "Created at",
                    unique_name: "entity_created",
                    editable: false,
                    visible: true,
                    datatype: "data",
                    value: entity.create_date,
                    display_value: moment(parseInt(entity.create_date)).format("YYYY-MM-DD HH:mm"),                    
                },
                {
                    label: "Modified at",
                    unique_name: "entity_modified",
                    editable: false,
                    visible: true,
                    datatype: "data",
                    value: entity.last_modified_date,
                    display_value: moment(parseInt(entity.last_modified_date)).format("YYYY-MM-DD HH:mm")                 
                }

            ]
            

            // get visible location based properties
            metadatas.forEach(metadata=>{
                if(metadata.datatype=="point" && metadata.visible) {
                    const extension = entity.extensions.find(item=>item.unique_name == metadata.unique_name);    
                    const prop = Props.parse(metadata, extension, readonly);                                
                    props.push(prop);
                }
            })
            const firstSection = {
                section_id: -1,
                section_name: "Info",
                section_intro_information: "General information",
                layout: layout||"is-one-third", //"is-full", "is-one-third"
                props: props
            }
            sections.splice(0,0,firstSection);
        }
        

        sections.forEach(section=>form.sections.push(section))
        

        return form;
    }

    static async metadatasToFormWithObject(metadatas, layout, obj, readonly=false, preliminarySection=true){
        const form = {
            visible: true,
            sections: []
        }
        const sections = [];
        
        metadatas.map((item)=>{
            // item is a metadata with section information to which metadata item belongs to
            // here we prepare a tempopary structure to extract all sections from this data.
            // here we will also provide actual value from object fields
            const processed = {
                spec: {
                    section_id: item.section_id,
                    section_intro_information: item.section_intro_information,
                    section_name: item.section_name,
                    section_number: item.section_number                    
                },
                prop: item
            }   

            let extension;
            if(obj){
                extension = obj[item.unique_name]
            }             

            processed.prop = Props.parse(item, extension, readonly);                           
            return processed;
        })
        .sort((a,b)=>{return a.spec.section_number-b.spec.section_number})
        .forEach((section)=>{
            const theSection = sections.find((item)=>{
                // console.log(item)
                return item.section_id == section.spec.section_id
            });            
            if(theSection){
                theSection.props.push(section.prop);                
            }else{
                /**
                 * section_name: "",
                                layout: "is-full",
                                props:
                 */
                sections.push({
                    section_id: section.spec.section_id,
                    section_name: section.spec.section_name,
                    section_intro_information: section.spec.section_name,
                    layout: layout||"is-one-third", //"is-full", "is-one-third"
                    props: [section.prop]
                })
            }
        })    
        let sectionsTemp = Commons._prepareSectionsData(sections);
        sectionsTemp.forEach((item)=>{item.props.sort((a,b)=>{return a.ordering-b.ordering})});                
        sections.forEach(section=>form.sections.push(section))        

        return form;
    }

    static _prepareSectionsData(sections, onlyEditable=false){
        // at least one field must be visible in section. if not then section is omitted
        const visibleSections = sections.filter((section)=>{
            const visibleCount = section.props.reduce((visibleCnt, item)=>{
                return visibleCnt + (item.visible?1:0)
            },0)
            return visibleCount > 0;
        })
        visibleSections.forEach((section)=>{
            section.props = section.props.filter((item)=>{return item.visible || (onlyEditable && item.editable)})
        })        

        return visibleSections;
    }

    /**
     * Creates a single object from fields provided as props in argument.
     * Each object property is a prop unique name and each value is a value of prop
     * @param {*} props 
     */
    static objectFromProps(props){
        const result = {}

        props.forEach(item=>{
            result[item.unique_name] = item.value            
        })

        return result;
    }

    static objectFromFormWithProps(form){
        const result = {}

        form.sections.forEach(section=>{
            section.props.forEach(prop=>{
                result[prop.unique_name] = prop.value;
            })
        })        
        return result;
    }

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
    static downloadDataText(text, name){
        var element = document.createElement('a');
        element.setAttribute("href", `data:text/plain,${encodeURIComponent(text)}`);
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

    static uniqueArrayBy(array, property){
        return array.filter((item, index, self) =>
            index === self.findIndex((t) => t[property] === item[property])
        );
    }

    static uniqueArray(array){
        return array.filter((item, index, self) =>
            index === self.findIndex((t) => JSON.stringify(t) === JSON.stringify(item))
        );
    }

    static copyArray(array){
        return JSON.parse(JSON.stringify(array))
    }

    static findIndexesOf(array, propertyName, value){
        const indexes = array.reduce((acc, item, index) => {
            if (item[propertyName] === value) {
              acc.push(index);
            }
            return acc;
        }, []);
        return indexes
    }

    static removeByIndexesInPlace(array, indexes){
        indexes.sort((a, b) => b - a); // Sort indexes in descending order

        indexes.forEach(index => {
            array.splice(index, 1); // Remove item at each index
        });        
    }

    static removeByPropertyInPlace(array, propertyName, value){
        const indexes = Commons.findIndexesOf(array, propertyName, value);
        Commons.removeByIndexesInPlace(array, indexes);
    }

    static capitalizeFirstLetters(text) {
        if (typeof text !== 'string' || text.length === 0) {
          return '';
        }
        
        return text
          .split(' ')                         // Split the string into an array of words
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))  // Capitalize the first letter of each word
          .join(' ');                         // Join the array back into a single string
    }

    static uniqueArrayByProperty(array, propertyName){
        return array.filter((obj, index, self) =>
            index === self.findIndex((t) => (
              t[propertyName] === obj[propertyName]
            ))
        );
    }
    
}