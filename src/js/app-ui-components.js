(function(){

    /**
     * Renders stats plot using value provided in rv-plot-stats attribute.
     * @param {*} el must provide followind data-* attributes: data-kind data-effort-key data-title
     * @param {*} value observable stats object that will be plotted
     */
    rivets.binders["plot-stats"] = function(el, value) {
        const stats = value
        const dataset = el.dataset;

        const graphData = [];

        stats[dataset.kind].forEach((user)=>{
            const data = {
                x: stats.days.map(item=>item.dayName),
                y: user.daily.map(item=>item.value[dataset.effortKey]),
                mode: 'lines',
                name: user.user
            }
            graphData.push(data);
        })

        var layout = {
            title: dataset.title,
            autosize: true,
            showlegend: true,
            // width: 500,
            legend: {
                x: 0,
                y: -0.3
            }
        };        

        Plotly.newPlot(el, graphData, layout,  {displayModeBar: false, responsive: true});
    }
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

                    <td class="is-size-7 is-hidden" rv-class-is-hidden="model.entity.round | gte 1">{{item | propertyAt model.entity.propB | numberRoundDecimal 2}}</td>
                    <td class="is-size-7 is-hidden" rv-class-is-hidden="model.entity.round | empty">{{item | propertyAt model.entity.propB}}</td>
                </tr>                      
                </tbody>
            </table>                
        </div>
      `
              return template;
          },
        static: ['heading','when','metric', 'propA', 'propB', 'round'],
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
