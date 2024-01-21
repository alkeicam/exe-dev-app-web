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
                x: stats.intervals.map(item=>item.name),
                y: user.efforts.map(item=>item.value[dataset.effortKey]),
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
    
    rivets.components['plot-map'] = {
        template: function(item) {
            
            const template = `
        <div class="box my-2">               
            <div class="here-plot"></div>                        
        </div>
      `
              return template;
          },
        static: ['iconClass', 'metricLabel', 'label', 'metricProp', 'title'],
        // dynamic bound: 'errorMsg'
        initialize: function(el, data) {
            
            const controller = {
                emitter: data.emitter,            
                model: {
                    entity: data, // timeAgoEvent, metric
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
            // const stats = {}
            // const dataset = el.dataset;
    
            // const graphData = [];
    
            // stats[dataset.kind].forEach((user)=>{
            //     const data = {
            //         x: stats.intervals.map(item=>item.name),
            //         y: user.efforts.map(item=>item.value[dataset.effortKey]),
            //         mode: 'lines',
            //         name: user.user
            //     }
            //     graphData.push(data);
            // })

            var colorscaleValue = [
                [0, '#f24545'],
                [0.33, '#f5e943'],
                [0.66, '#4edee8'],
                [1, '#91e84e']
              ];
              
              var dd = [
                {
                  z: data.z,
                  x: data.x,
                  y: ['Poor', 'Average', 'Good', 'Stellar'],
                  type: 'heatmap',
                  hoverongaps: false,
                  colorscale: colorscaleValue,
                  showscale: false,
                //   hoverinfo: "x+y",
                  hoverinfo: "none",
                  zmin: 0,
                  zmax: 3
                }
              ];
    
            var layout = {
                title: data.title,
                autosize: true,
                showlegend: true,
                // yaxis: {
                //     range: [0, 3],
                //     autorange: false
                // },
                // width: 500,
                legend: {
                    x: 0,
                    y: -0.3
                }
            };      
            
            const theElement = el.getElementsByClassName("here-plot")[0];
    
            Plotly.newPlot(theElement, dd, layout,  {displayModeBar: false, responsive: true});                
            return controller;
        }
    }  
    
    rivets.components['heat-map-events'] = {
        template: function(item) {        
            const template = `
        <div class="my-4 ">  
            <h5 class="title is-5">{{model.entity.title}}</h5>
            <div class="here-plot"></div>                        
        </div>
      `
              return template;
          },
        static: ['iconClass', 'metricLabel', 'label', 'metricProp', 'title', 'domain', 'subDomain'],
        // dynamic bound: 'errorMsg'
        initialize: function(el, data) {
            
            const controller = {
                emitter: data.emitter,            
                model: {
                    entity: data, // timeAgoEvent, metric
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
            // const stats = {}
            // const dataset = el.dataset;
    
            // const graphData = [];
    
            // stats[dataset.kind].forEach((user)=>{
            //     const data = {
            //         x: stats.intervals.map(item=>item.name),
            //         y: user.efforts.map(item=>item.value[dataset.effortKey]),
            //         mode: 'lines',
            //         name: user.user
            //     }
            //     graphData.push(data);
            // })

            var colorscaleValue = [
                [0, '#f24545'],
                [0.33, '#f5e943'],
                [0.66, '#4edee8'],
                [1, '#91e84e']
              ];
              
            
            
            const theElement = el.getElementsByClassName("here-plot")[0];

            

            const config = {
                itemSelector: theElement,
                range: Math.abs(data.range),
                domain: {
                    type: data.domain
                },
                subDomain: {type: data.subDomain},
                
                date:  {},
                data: {
                    source: data.events,
                    x: "ct",
                    y: "s"
    
                }                
            }

            let date = data.range<0?{start: new Date(moment().add(-(Math.abs(data.range)-1),data.domain).valueOf())}:{};
    
            if(data.startHour){
                if(data.domain != "hour")
                    throw new Error(`Can't use "startHour" without domain set to "hour"`);
                date.start = new Date(moment().hour(data.startHour,"hour").valueOf())
            }

            config.date = date;

            console.log(date.start, moment(date.start).format("HH:mm"), moment(date.start).valueOf());

            if(data.domain == "hour"){
                config.domain.label = {
                    text: (timestamp)=>{return moment(timestamp).format("HH:mm")}
                }
            }
            

            const cal = new CalHeatmap();
            cal.paint(config,
                [[
                    Tooltip,
                    {
                      text: function (date, value, dayjsDate) {
                        let label;
                        switch(data.subDomain){
                            case "minute": 
                                label = (value ? value.toFixed(1) + ' calories' : 'No data') + ' on ' + moment(date).format("LT")
                            break;
                            // case "day": 
                            //     label = (value ? value.toFixed(1) + ' calories' : 'No data') + ' on ' + dayjsDate.format('LL')
                            // break;
                            default: 
                                label = (value ? value.toFixed(1) + ' calories' : 'No data') + ' on ' + dayjsDate.format('LL')
                            break;

                        }
                        return label;
                      },
                    },
                  ]]
            );   
            return controller;
        }
    } 


    rivets.components['plot-stats'] = {
        template: function(item) {            
            const template = `
        <div class="my-4">    
            <h5 class="title is-5">{{model.entity.title}}</h5>           
            <div class="here-plot"></div>                        
        </div>
      `
              return template;
          },
        static: ['kind','effortKey', 'title'],
        // dynamic bound: 'errorMsg'
        initialize: function(el, data) {
            
            const controller = {
                emitter: data.emitter,            
                model: {
                    entity: data, // timeAgoEvent, metric
                    error:{
                        code: 0,
                        message: "OK"
                    }
                },                                               
            }    

     
            
            const theElement = el.getElementsByClassName("here-plot")[0];

            // const stats = value
            // const dataset = el.dataset;

            const graphData = [];

            data.stats[data.kind].forEach((record)=>{
                const data4Graph = {
                    x: data.stats.intervals.map(item=>item.name),
                    y: record.efforts.map(item=>item.value[data.effortKey]),
                    mode: 'lines',
                    name: record.user
                }
                graphData.push(data4Graph);
            })

            var layout = {
                title: data.title,
                autosize: true,
                showlegend: true,
                // width: 500,
                legend: {
                    x: 0,
                    y: -0.3
                }
            };        

            Plotly.newPlot(theElement, graphData, layout,  {displayModeBar: false, responsive: true});
    
            // Plotly.newPlot(theElement, dd, layout,  {displayModeBar: false, responsive: true});                
            return controller;
        }
    } 

    /**
     * Renders card component that displays top performers from stats.
     * Folling attributes are required on this tag
     * heading, when, metric, records, prop-a, prop-b
     * @param {string} heading text for heading
     * @param {string} when time description
     * @param {string} metric metric description
     * @param {string} prop-a name of the main property
     * @param {string} prop-b name of the metric property
     * @param {string} records property holding records for which top performenrs using metric will be displayed
     */
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
                    <th class="is-size-7"><a target="_blank" rv-href="item.user | hrefBuilder 'participant.html?u=@value'">{{item.user}}</a></th>

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
        
    rivets.components['user-stats'] = {
        template: function() {
            const template = `
        <div class="box">   
            {{model.entity.timeAgoEvent.ct}}                                             
            <div>
              <p class="is-size-3"><i rv-class="model.entity.iconClass"></i></p>
              <p rv-if="model.entity.metricProp | eq 's'" class="title is-hidden" rv-class-is-hidden="model.entity.metricProp | neq 's'">{{model.entity.metric.s | numberRoundDecimal 2}} <span class="is-size-7">{{model.entity.metricLabel}}</span></p>
              <p rv-if="model.entity.metricProp | eq 'c'" class="title is-hidden" rv-class-is-hidden="model.entity.metricProp | neq 'c'">{{model.entity.metric.c | numberRoundDecimal 2}} <span class="is-size-7">{{model.entity.metricLabel}}</span></p>
              <p rv-if="model.entity.metricProp | eq 'l'" class="title is-hidden" rv-class-is-hidden="model.entity.metricProp | neq 'l'">{{model.entity.metric.l | numberRoundDecimal 2}} <span class="is-size-7">{{model.entity.metricLabel}}</span></p>
              <p rv-if="model.entity.timeAgoEvent" class="title is-hidden" rv-class-is-hidden="model.entity.timeAgoEvent | empty">{{model.entity.timeAgoEvent.ct | timeAgoMoment}} </p>
              <p rv-if="model.entity.timeAgoEvent"><span class="is-size-7 is-hidden" rv-class-is-hidden="model.entity.timeAgoEvent | empty">{{model.entity.metricLabel}}</span></p>
            </div>                          
        </div>
      `
              return template;
          },
        static: ['iconClass', 'metricLabel', 'label', 'metricProp'],
        // dynamic bound: 'errorMsg'
        initialize: function(el, data) {
            
            const controller = {
                emitter: data.emitter,            
                model: {
                    entity: data, // timeAgoEvent, metric
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

    rivets.components['dashboard-l4'] = {
        template: function(item) {        
            const template = `
            <div class="columns">
                <div class="column is-two-fifths">
                    <h1 class="title is-1">{{model.entity.dashboard.title}}</h1>
                    <h2 class="title is-2">{{model.entity.dashboard.subtitle}}</h2>
                    <h2 class="title is-6">{{model.entity.dashboard.info}}</h2>
                </div>
                <div class="column">
                <p class="has-text-centered">
                    <img rv-src="model.entity.dashboard.resources.image" style="width: 45cqmin"></img>
                </p>
                </div>                
            </div>
            
            
            <div class="tile is-ancestor">
              <div class="tile is-4 is-vertical is-parent">                
                <div class="tile is-child box notification" rv-class-is-success="model.metrics.m1.state | eq 'green'" rv-class-is-warning="model.metrics.m1.state | eq 'yellow'" rv-class-is-danger="model.metrics.m1.state | eq 'red'">
                  <p class="title is-5">{{model.metrics.m1.label }}</p>                                    
                  <p class="has-text-centered" style="font-size: 15cqmin;">{{model.metrics.m1.value}}<span class="ml-3 has-text-weight-bold" style="font-size: 5cqb;">{{model.metrics.m1.suffix}}</span></p>
                </div>                
              </div>
              <div class="tile is-parent">
                <div class="tile is-child box notification " rv-class-is-success="model.metrics.m3.state | eq 'green'" rv-class-is-warning="model.metrics.m3.state | eq 'yellow'" rv-class-is-danger="model.metrics.m3.state | eq 'red'">
                  <article>
                  <p class="title is-5">{{model.metrics.m3.label }}</p>                                    
                  <p class="has-text-centered" style="font-size: 15cqmin;">{{model.metrics.m3.value}}<span class="ml-3 has-text-weight-bold" style="font-size: 5cqb;">{{model.metrics.m3.suffix}}</span></p>
                    
                  </article>                  
                </div>
              </div>
              <div class="tile is-parent">
                <div class="tile is-child box notification" rv-class-is-success="model.metrics.m4.state | eq 'green'" rv-class-is-warning="model.metrics.m4.state | eq 'yellow'" rv-class-is-danger="model.metrics.m4.state | eq 'red'">
                  <article>
                  <p class="title is-5">{{model.metrics.m4.label }}</p>                                    
                  <p class="has-text-centered" style="font-size: 15cqmin;">{{model.metrics.m4.value}}<span class="ml-3 has-text-weight-bold" style="font-size: 5cqb;">{{model.metrics.m4.suffix}}</span></p>
                  </article>                  
                </div>                
              </div>
              <div class="tile is-parent">
                <div class="tile is-child box notification" rv-class-is-success="model.metrics.m2.state | eq 'green'" rv-class-is-warning="model.metrics.m2.state | eq 'yellow'" rv-class-is-danger="model.metrics.m2.state | eq 'red'">
                  <article>
                  <p class="title is-5">{{model.metrics.m2.label }}</p>                                    
                  <p class="has-text-centered" style="font-size: 15cqmin;">{{model.metrics.m2.value}}<span class="ml-3 has-text-weight-bold" style="font-size: 5cqb;">{{model.metrics.m2.suffix}}</span></p>
                  </article>                  
                </div>                
              </div>
            </div>
            
            
            
      `
              return template;
          },
        static: [],
        // dynamic bound: 'errorMsg'
        initialize: function(el, data) {
            
            const controller = {
                emitter: data.emitter,            
                model: {
                    entity: data, // dashboard
                    metrics: {},
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

            function make(which){
                if(!controller.model.entity.dashboard.data[which]) return;
                controller.model.metrics[which] = {
                    label: controller.model.entity.dashboard.data[which].specs.label,
                    value: controller.model.entity.dashboard.data[which].item.value,
                    suffix: controller.model.entity.dashboard.data[which].specs.suffix,
                    state: controller.model.entity.dashboard.data[which].item.state
                }    
            }
            
            make("m1");
            make("m2");
            make("m3");
            make("m4");
            return controller;
        }
    }
    
    rivets.components['dashboard-l3'] = {
        template: function(item) {        
            const template = `
            <div class="columns">
                <div class="column is-two-fifths">
                    <h1 class="title is-1">{{model.entity.dashboard.title}}</h1>
                    <h2 class="title is-2">{{model.entity.dashboard.subtitle}}</h2>
                    <h2 class="title is-6">{{model.entity.dashboard.info}}</h2>
                </div>
                <div class="column">
                <p class="has-text-centered">
                    <img rv-src="model.entity.dashboard.resources.image" style="width: 45cqmin"></img>
                </p>
                </div>                
            </div>

            <div class="tile is-ancestor">
              <div class="tile is-4 is-vertical is-parent">                
                <div class="tile is-child box notification" rv-class-is-success="model.metrics.m1.state | eq 'green'" rv-class-is-warning="model.metrics.m1.state | eq 'yellow'" rv-class-is-danger="model.metrics.m1.state | eq 'red'">
                  <p class="title is-5">{{model.metrics.m1.label }}</p>                                    
                  <p class="has-text-centered" style="font-size: 10cqmin;">{{model.metrics.m1.value}}<span class="ml-3 has-text-weight-bold" style="font-size: 3cqb;">{{model.metrics.m1.suffix}}</span></p>
                </div>                
              </div>
              <div class="tile is-parent">
                <div class="tile is-child box notification " rv-class-is-success="model.metrics.m2.state | eq 'green'" rv-class-is-warning="model.metrics.m2.state | eq 'yellow'" rv-class-is-danger="model.metrics.m2.state | eq 'red'">
                  <article>
                  <p class="title is-5">{{model.metrics.m2.label }}</p>                                    
                  <p class="has-text-centered" style="font-size: 10cqmin;">{{model.metrics.m2.value}}<span class="ml-3 has-text-weight-bold" style="font-size: 3cqb;">{{model.metrics.m2.suffix}}</span></p>
                    
                  </article>                  
                </div>
              </div>
              <div class="tile is-parent">
                <div class="tile is-child box notification" rv-class-is-success="model.metrics.m3.state | eq 'green'" rv-class-is-warning="model.metrics.m3.state | eq 'yellow'" rv-class-is-danger="model.metrics.m3.state | eq 'red'">
                  <article>
                  <p class="title is-5">{{model.metrics.m3.label }}</p>                                    
                  <p class="has-text-centered" style="font-size: 10cqmin;">{{model.metrics.m3.value}}<span class="ml-3 has-text-weight-bold" style="font-size: 3cqb;">{{model.metrics.m3.suffix}}</span></p>
                  </article>                  
                </div>
              </div>
            </div>
            
      `
              return template;
          },
        static: [],
        // dynamic bound: 'errorMsg'
        initialize: function(el, data) {
            
            const controller = {
                emitter: data.emitter,            
                model: {
                    entity: data, // dashboard
                    metrics: {},
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

            function make(which){
                if(!controller.model.entity.dashboard.data[which]) return;
                controller.model.metrics[which] = {
                    label: controller.model.entity.dashboard.data[which].specs.label,
                    value: controller.model.entity.dashboard.data[which].item.value,
                    suffix: controller.model.entity.dashboard.data[which].specs.suffix,
                    state: controller.model.entity.dashboard.data[which].item.state
                }    
            }
            
            make("m1");
            make("m2");
            make("m3");            
            return controller;
        }
    }

    rivets.components['user-projects-stats'] = {
        template: function(item) {        
            const template = `
            <table class="table my-6">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Effort</th>
                  <th>Commits</th>
                  <th>Lines</th>
                </tr>
              </thead>
              <tbody rv-if="model.projects | sizeGte 1">
                <tr rv-each-item="model.projects">
                  <th>{{item.name}}@{{item.accountName}}</th>
                  <td>{{item.stats.s | numberRoundDecimal 2}}</td>
                  <td>{{item.stats.c | numberRoundDecimal 2}}</td>
                  <td>{{item.stats.l | numberRoundDecimal 2}}</td>
                </tr>
              </tbody>
              <tbody rv-if="model.projects | sizeLt 1">
                <tr >
                  <th></th>
                  <td colspan="3">No data</td>                  
                </tr>
              </tbody>
            </table>            
      `
              return template;
          },
        static: [],
        // dynamic bound: 'errorMsg'
        initialize: function(el, data) {
            
            const controller = {
                emitter: data.emitter,            
                model: {
                    entity: data, // dashboard
                    
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
                    },
                    projects: []
                },                                               
            }     

            let projects = data.stats[data.user]?.projects;
            if(projects){
                controller.model.projects = Object.keys(projects).map(item=>projects[item])
            }        
            return controller;
        }
    }

})();
