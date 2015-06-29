var barchart = function(d3){

    var selection, shownPoints, svg

    var settings = {
        'x':{
            'margin':60,
            'gutter':60,
            'axisWidth':600,
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
                'color': 'blue',
                'padding-percentage': .05 
            },
            'lines':{
                'vertical': {
                    'stroke-dasharray': '3,3',
                    'stroke-width': '1.5px',
                    'fill': '#fff',
                    'stroke': '#000'
                }
            }
        }
    }

    var plot = {
        'group':undefined,
        'mean': undefined
    }

    var axis = {
        'x':{
            'scale': d3.scale.linear(),
            'group': undefined, 
            'svg': d3.svg.axis(),
            'tickValues': undefined,
            'label': undefined,
            'labels': {
                'transformer': function(i){ return i }
            }
        },
        'y':{
            'scale': d3.scale.linear(),
            'group': undefined,
            'svg': d3.svg.axis(),
            'label': undefined,
            'labels': {
                'transformer': function(i){ return i }
            }
        }
    }

    var brush = {
        'instance': d3.svg.brush(),
        'group': undefined,
        'selection': false
    }

    var barWidth = function(point, paddingPerc){
        var full = axis.x
            .scale(point.dx + point.x) -
                axis.x.scale(point.x)

        var offset = full * paddingPerc

        return full - offset
    }

    var dispatch = d3.dispatch('brushend', 'update', 'draw')

    var exports = function(){

        axis.x.scale
            .range([settings.x.margin +
                settings.x['gutter'],
                    settings.x.margin + settings.x['axisWidth'] + 
                settings.x.gutter])

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

        plot.line = svg.append('g')
            .classed('histogramplot-line', true)

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

            axis.x.svg
                .orient('bottom')

            axis.y.svg
                .orient('left')

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

                    return barWidth(point, 
                        settings.styles.bars['padding-percentage'])

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
                .attr("x", function(point){
                    return axis.x.scale(point.x)
                })
                .attr("height", function(point){
                    return axis.y.scale.range()[0] 
                        - axis.y.scale(point.y)
                })
                .style("fill", settings.styles.bars.color)

            var lines = plot.line.selectAll('line')
                .data(reqs.data.lines.verticals, function(line){ return line.value })

            lines.enter()
                .append('line')
                    .attr('class', 'histogramplot-line')
                    .attr('x2', function(line){
                        return axis.x.scale(line.value)
                    })
                    .attr('x1', function(line){ 
                        return axis.x.scale(line.value)
                    })
                    .attr('y2', function(line){
                        return axis.y.scale(reqs.y.min)
                    })
                    .attr('y1', function(line){ 
                        return axis.y.scale(reqs.y.min)
                    })
                    .style(settings.styles.lines.vertical)

            lines
                .transition().duration(2000)
                    .attr('y2', function(line){
                        return axis.y.scale(reqs.y.max)
                    })
        })

        dispatch.on('update', function(reqs){

            updateScales(reqs)
            updateBrush()

            axis.x.svg
                .orient('bottom')

            axis.y.svg
                .orient('left')

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
                    return barWidth(point, 
                        settings.styles.bars['padding-percentage'])
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
                    return barWidth(point, 
                        settings.styles.bars['padding-percentage'])
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

            var lines = plot.line.selectAll('line')
                .data(reqs.data.lines.verticals, function(line){ return line.value })

            lines.enter()
                .append('line')
                    .attr('class', 'histogramplot-line')
                    .attr('x2', function(line){
                        return axis.x.scale(line.value)
                    })
                    .attr('x1', function(line){ 
                        return axis.x.scale(line.value)
                    })
                    .attr('y2', function(line){
                        return axis.y.scale(reqs.y.min)
                    })
                    .attr('y1', function(line){ 
                        return axis.y.scale(reqs.y.min)
                    })
                    .style(settings.styles.lines.vertical)

            lines
                 .transition().duration(2000)
                    .attr('class', 'histogramplot-line')
                    .attr('y2', function(line){
                        return axis.y.scale(reqs.y.max)
                    })

            lines.exit()
                .transition().duration(2000)
                    .attr('y2', function(line){
                        return axis.y.scale(reqs.y.min)
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

    exports.axis = function(){ 
        if (arguments.length > 0){
            axis = arguments[0]
            return exports
        }
        return axis 
    }

    exports.axis.x = function(){ 
        if (arguments.length > 0){
            axis.x = arguments[0]
            return exports
        }
        return axis.x 
    }

    exports.axis.y = function(){ 
        if (arguments.length > 0){
            axis.y = arguments[0]
            return exports
        }
        return axis.y 
    }

    exports.axis.x.label = function(){
    /*Sets or gets axis.x.label for axis formatting
    */

        if (arguments.length > 0){
            axis.x.label = arguments[0]
            return exports
        }
        return axis.x.label
    }

    exports.axis.y.label = function(){
    /*Sets or gets axis.y.label for axis formatting
    */

        if (arguments.length > 0){
            axis.y.label = arguments[0]
            return exports
        }
        return axis.y.label
    }

    exports.axis.x.labels = function(){ 
        if (arguments.length > 0){
            axis.x.labels = arguments[0]
            return exports
        }
        return axis.x.labels
    }

    exports.axis.x.tickValues = function(){
        if (arguments.length > 0){
            axis.x.tickValues = arguments[0]
            return exports
        }
        return axis.x.tickValues
    }

    exports.axis.x.labels.transformer = function(){ 
        if (arguments.length > 0){
            axis.x.labels.transformer = arguments[0]
            return exports
        }
        return axis.x.labels.transformer
    }

    exports.dispatch = function(){

        if (arguments.length > 0){
            dispatch = arguments[0]
            return exports
        }
        return dispatch 

    }

    function lastElementOffset(reqs){
        var offset = 0
        if(reqs.data.points && reqs.data.points.length > 0){
            offset = reqs.data.points[0].dx * 
                (1 + settings.styles.bars['padding-percentage'])
        }

        return offset
    }

    function updateScales(data){

        axis.x.scale
            .domain([data.x.min, data.x.max + lastElementOffset(data)])

        axis.y.scale.domain([data.y.min, data.y.max]) 

        axis.x.svg
            .tickValues(axis.x.tickValues)
            .tickFormat(axis.x.labels.transformer)
            .scale(axis.x.scale)

        axis.y.svg
            .tickFormat(axis.y.labels.transformer)
            .scale(axis.y.scale)
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
