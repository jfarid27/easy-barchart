var barchart = function(d3){

    var selection, shownPoints

    var settings = {
        'x':{
            'margin':60,
            'gutter':60,
            'axisWidth':600,
            'paddingPercentage':.05,
        },
        'y':{
            'margin':20,
            'gutter':30,
            'axisWidth':600,
        },
        'styles':{
            'brush': {
                'color': '#903b20'
            },
            'bars':{
                'color': 'blue'
            }
        }
    }

    var plot = {
        'group':undefined
    }

    var axis = {
        'x':{
            'scale': d3.scale.ordinal(),
            'group': undefined, 
            'svg': d3.svg.axis()
            },
        'y':{
            'scale': d3.scale.linear(),
            'group': undefined,
            'svg': d3.svg.axis()
        }
    }

    var brush = {
        'instance': d3.svg.brush(),
        'group': undefined,
        'selection': false
    }

    var dispatch = d3.dispatch('brushend', 'update', 'draw')

    var exports = function(){

        axis.x.scale
            .rangeRoundBands([settings.x.margin +
                settings.x['gutter'],
                    settings.x.margin + settings.x['axisWidth'] + 
                settings.x.gutter], settings.x.paddingPercentage)

        axis.y.scale
            .range([settings.y.margin + 
                settings.y['axisWidth'], settings.y.margin ])

        svg = selection.append('g')
            .classed('easy-barchart', true)

        brush.group = svg.append('g')
            .classed('histogramplot-brush', true)

        axis.x.group = svg.append('g')
            .classed('histogramplot-x-axis', true)

        axis.y.group = svg.append('g')
            .classed('histogramplot-y-axis', true)

        plot.group = svg.append('g')
            .classed('histogramplot-plot', true)

        brush.instance.on('brush', function(){
            brush.group.selectAll('rect')
                .attr('fill', settings.styles.brush.color)
                .attr('fill-opacity', '30%')
                .attr('y', settings.y['margin'])
                .attr('height', settings.y['axisWidth']) 
        })

        brush.instance.on('brushend', function(){
           dispatch.brushend(brush.instance.extent()) 
        })

        dispatch.on('draw', function(reqs){

            updateScales(reqs)
            updateBrush()

            axis.x.svg.scale(axis.x.scale).orient('bottom')
            axis.y.svg.scale(axis.y.scale).orient('left')

            axis.x.group
                .attr("transform", "translate(0," 
                    + (settings.y.margin 
                        + settings.y['axisWidth'] ) + ")")
                .call(axis.x.svg)

            axis.y.group.call(axis.y.svg)
                .attr("transform", "translate(" 
                    + (settings.x.margin 
                        + settings.x['gutter'] ) + ",0)")

            var bars = plot.group
                .selectAll("rect")
                .data(reqs.data.points)

            bars.enter()
            .append("rect")
                .classed("histogramplot-bar", true)
                .attr("id", function(d, index){
                    return d.id || index
                })
                .attr("x", function(point){
                    return axis.x.scale(point.x)
                })
                .attr("width", function(point){
                    return axis.x.scale.rangeBand()
                })
                .attr("y", function(point){
                    return axis.y.scale.range()[0] 
                })
                .attr("height", function(point){
                    return 0
                })
                .style("fill", settings.styles.bars.color)

            bars
            .transition().duration(2000)
                .attr("y", function(point){
                    return axis.y.scale(point.y)
                })
                .attr("height", function(point){
                    return axis.y.scale.range()[0] 
                        - axis.y.scale(point.y)
                })
                .style("fill", settings.styles.bars.color)
        })

        dispatch.on('update', function(reqs){

            updateScales(reqs)
            updateBrush()

            axis.x.svg.scale(axis.x.scale).orient('bottom')
            axis.y.svg.scale(axis.y.scale).orient('left')

            axis.x.group
                .attr("transform", "translate(0," 
                    + (settings.y.margin 
                        + settings.y['axisWidth'] ) + ")")
                .call(axis.x.svg)

            axis.y.group.call(axis.y.svg)
                .attr("transform", "translate(" 
                    + (settings.x.margin 
                        + settings.x['gutter'] ) + ",0)")

            var bars = plot.group
                .selectAll("rect")
                .data(reqs.data.points)
                
            bars.enter()
            .append("rect")
                .classed("histogramplot-bar", true)
                .attr("id", function(d, index){
                    return d.id || index
                })
                .attr("x", function(point){
                    return axis.x.scale(point.x)
                })
                .attr("width", function(point){
                    return axis.x.scale.rangeBand()
                })
                .attr("y", function(point){
                    return axis.y.scale.range()[0] 
                })
                .attr("height", function(point){
                    return 0
                })
                .style("fill", settings.styles.bars.color)


            bars
            .transition().duration(2000)
                .attr("x", function(point){
                    return axis.x.scale(point.x)
                })
                .attr("y", function(point){
                    return axis.y.scale(point.y)
                })
                .attr("width", function(point){
                    return axis.x.scale.rangeBand()
                })
                .attr("height", function(point){
                    return axis.y.scale.range()[0] 
                        - axis.y.scale(point.y)
                })
                .style("fill", settings.styles.bars.color)

            bars.exit().selectAll("rect")
            .transition().duration(2000)
                .attr("height", function(point){
                    return 0
                })
            .remove()

        })

    }

    d3.rebind(exports, dispatch, 'on', 'draw', 'update', 'brushend')

    exports.settings = function(){

        if (arguments.length > 0){
            settings = arguments[0]
            return exports
        }
        return settings

    }

    exports.settings.x = function(){

        if (arguments.length > 0){
            settings.x = arguments[0]
            return exports
        }
        return settings.x

    }

    exports.settings.y = function(){

        if (arguments.length > 0){
            settings.y = arguments[0]
            return exports
        }
        return settings.y

    }

    exports.selection = function(){

        if (arguments.length > 0){
            selection = arguments[0]
            return exports
        }
        return selection
    }

    exports.brush = function(){
        if (arguments.length > 0){
            brush = arguments[0]
            return exports
        }
        return brush
    }
    exports.brush.selection = function(){
        if (arguments.length > 0){
            brush.selection = arguments[0]
            return exports
        }
        return brush.selection
    }

    exports.dispatch = function(){

        if (arguments.length > 0){
            dispatch = arguments[0]
            return exports
        }
        return dispatch 

    }

    function updateScales(data){

        axis.x.scale
            .domain(data.labels)
        axis.y.scale.domain([data.y.min, data.y.max]) 
        axis.x.svg.scale(axis.x.scale)
        axis.y.svg.scale(axis.y.scale)
    }

    function updateBrush(){
        if (brush.selection){    
        brush.instance.x(axis.x.scale)
        brush.instance.y(axis.y.scale)
        brush.group.call(brush.instance) 
        }
    }

    return exports

}

module.exports = barchart 
