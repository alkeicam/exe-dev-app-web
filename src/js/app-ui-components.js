(function(){


    // class SomeController{}
    
    rivets.components['app-top-listing'] = {
        template: function() {
            const template = `
        <div class="box">
            <p class="heading">{{model.entity.heading}}</p>
            <table class="table">
                <thead>
                <tr>
                    <th><abbr title="When">{{model.entity.when}}</abbr></th>
                    <th><abbr title="Metric">{{model.entity.metric}}</abbr></th>
                </tr>
                </thead>
                <tbody>
                <tr rv-each-item="model.entity.records">
                    <th class="is-size-7">{{item | propertyAt model.entity.propA}}</th>
                    <td class="is-size-7">{{item | propertyAt model.entity.propB}}</td>
                </tr>                      
                </tbody>
            </table>                
        </div>
      `
              return template;
          },
        static: ['heading','when','metric', 'propA', 'propB'],
        // dynamic bound: 'errorMsg'
        initialize: function(el, data) {
            
            const controller = {
                emitter: data.emitter,            
                model: {
                    entity: data, // records
                    forms:{
                        f1: {
                            v: "",
                            e: {
                                code: 0,
                                message: "OK"
                            }
                        },
                        f2: {
                            v: "",
                            e: {
                                code: 0,
                                message: "OK"
                            }
                        }
                    },
                    error:{
                        code: 0,
                        message: "OK"
                    }
                },                                               
            }                    
            return controller;
        }
    }
    
       
    
    
})();
