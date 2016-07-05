
function individualLineChart(c) {

    // --- Define the margin and SVG size ----
    var margin = { top: 0.1 * c.width, right: 0.02, bottom: 0.1 * c.width, left: 0.1 * c.width },
        width = c.width - margin.left - margin.right,
        height = c.height - margin.top - margin.bottom;

    var parseDate = d3.time.format("%X").parse;

    var data = c.data.slice(0);
    data.sort(function(a,b) {
        return parseDate(a.time) - parseDate(b.time);
    });

    var quantile = [0, 2.4895141474591176, 4.9790282949182325, 7.46854244237735, 9.958056589836465, 12.447570737295585, 14.9370848847547],
        colors   = ['#ffffb2','#fed976','#feb24c','#fd8d3c','#f03b20','#bd0026'],
        colorScale = d3.scale.quantile().domain(quantile).range(colors),
        maxColor =  colorScale( d3.max(c.data, function(d) {return +d.sdTimes}) );

    var x = d3.time.scale().range([0, width]).domain(d3.extent(data, function(d){ return parseDate(d.time) }));
    var y = d3.scale.linear().range([height, 0]);

    y.domain([data[0].min, data[0].max]);

    var xAxis = d3.svg.axis().scale(x).ticks(23).tickFormat(d3.time.format("%H")).orient("bottom").innerTickSize(-height).outerTickSize(0);
    var yAxis = d3.svg.axis().scale(y).orient("left").innerTickSize(-width).outerTickSize(0);

    var lineValue = d3.svg.area()
        .interpolate("basis")
        .x(function(d) { return x(parseDate(d.time)); })
        .y(function(d) { return y(+d.value); });

    var lineRef = d3.svg.area()
        .interpolate("basis")
        .x(function(d) { return x(parseDate(d.time)); })
        .y(function(d) { return y(+d[c.ref]); });

    var area = d3.svg.area()
        .interpolate("basis")
        .x(function(d) { return x(parseDate(d.time)); })
        .y1(function(d) { return y(+d.value); });

    var svg = d3.select(c.id).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.datum(data);

    svg.append("clipPath")
        .attr("id", "clip-below")
        .append("path")
        .attr("d", area.y0(height));

    svg.append("clipPath")
        .attr("id", "clip-above")
        .append("path")
        .attr("d", area.y0(0));

    svg.append("path")
        .attr("class", "area above")
        .attr("clip-path", "url(#clip-above)")
        .attr("d", area.y0(function(d) { return y(+d[c.ref]); }));

    svg.append("path")
        .attr("class", "area below")
        .attr("clip-path", "url(#clip-below)")
        .attr("d", area);

    svg.append("path")
        .attr("class", "value")
        .attr("d", lineValue);

    svg.append("path")
        .attr("class", "ref")
        .attr("d", lineRef);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.append("rect")
        .attr("x", 0)
        .attr("y", - margin.top)
        .attr("rx", 4)
        .attr( "ry", 4 )
        .attr("width", width)
        .attr("height", margin.top * .75)
        .attr("fill", maxColor);

    svg.append("text")
        .text(c.label)
        .attr("x", c.width * 0.01)
        .attr("y", - margin.top * 0.5)
        .style("font-size", "150%");
    
}