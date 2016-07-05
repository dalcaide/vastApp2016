function globalLineChart(c) {

    $(c.id).empty();
    var wDiv = $(c.id).width(),
        hDiv = wDiv * .30;

    // --- Define the margin and SVG size ----
    var margin = { top: 0.0 * wDiv, right: 0.01 * wDiv, bottom: 0.08 * wDiv, left: 0.04 * wDiv },
        width = wDiv - margin.left - margin.right,
        height = hDiv - margin.top - margin.bottom;

    var parseDate = d3.time.format("%X").parse;

    var x = d3.time.scale().range([0, width]).domain(d3.extent(c.dataRaw, function(d){ return parseDate(d.time) }));
    var y = d3.scale.linear().range([height, 0]).domain(d3.extent(c.dataRaw, function(d){ return +d.max }));
    var size = d3.scale.linear().range([width * 0.001, width * 0.03]).domain(d3.extent(c.dataRaw, function(d){ return +d.mean }));
    var xAxis = d3.svg.axis().scale(x).ticks(23).tickFormat(d3.time.format("%H")).orient("bottom").innerTickSize(-height).outerTickSize(0);
    var yAxis = d3.svg.axis().scale(y).orient("left").innerTickSize(-width).outerTickSize(0);

    var line = d3.svg.ribbon()
        .x(function(d) {return x(parseDate(d.time));})
        .y(function(d) {return y(+d.max);})
        .r(function(d) {return size(+d.mean);});


    var quantile = [0, 2.4895141474591176, 4.9790282949182325, 7.46854244237735, 9.958056589836465, 12.447570737295585, 14.9370848847547],
        color   = ['#ffffb2','#fed976','#feb24c','#fd8d3c','#f03b20','#bd0026'];

    var svg = d3.select(c.id).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("linearGradient")
        .attr("id", "temperature-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", y(quantile[1]))
        .attr("x2", 0).attr("y2", y(quantile[2]))
        .attr("x2", 0).attr("y2", y(quantile[3]))
        .attr("x2", 0).attr("y2", y(quantile[4]))
        .attr("x2", 0).attr("y2", y(quantile[5]))
        .attr("x2", 0).attr("y2", y(quantile[6]))
        .selectAll("stop")
        .data([
            {offset: "0%", color: color[0]},
            {offset: "16.7%", color: color[1]},
            {offset: "33.4%", color: color[2]},
            {offset: "50.1%", color: color[3]},
            {offset: "66.8%", color: color[4]},
            {offset: "83.5%", color: color[5]},
            {offset: "100%", color: color[6]}
        ])
        .enter().append("stop")
        .attr("offset", function(d) { return d.offset; })
        .attr("stop-color", function(d) { return d.color; });
    
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width * 0.48)
        .attr("y", height * .2)
        .style("text-anchor", "start")
        .text("Time (Hour)");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("SD times");
    
    svg.append("path")
        .datum(c.data)
        .attr("class", "line")
        .attr("d", line);

    
    // Adding the legend
    $(c.idLegend).empty();
    var wDivL = $(c.id).width(),
        hDivL = wDiv * .30;


}
