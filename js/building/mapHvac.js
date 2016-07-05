
function mapHvac(c) {

    $(c.id).empty();

    var wDiv = $(c.id).width(),
        hDiv = wDiv * .772;

    var max = { x: wDiv, y: hDiv},
        svg = d3.select(c.id).append("svg").attr("width", max.x).attr("height", max.y),
        imgUrl = "images/building/VAST_EnergyZones_F"+ c.floor +".jpg";

    svg.append("defs")
        .append("pattern")
        .attr("id", "venus")
        .attr('patternUnits', 'userSpaceOnUse')
        .attr("width", max.x)
        .attr("height", max.y)
        .append("image")
        .attr("xlink:href", imgUrl)
        .attr("width", max.x)
        .attr("height", max.y);

    svg.append("rect")
        .attr("x", "0")
        .attr("y", "0")
        .attr("width", max.x)
        .attr("height", max.y)
        .attr("fill", "url(#venus)");

    svg.on("click", function () {
        var coordinates = [0, 0];
        coordinates = d3.mouse(this);
        var x = coordinates[0];
        var y = coordinates[1];
        console.log(x,y);
    });

    var xScale = d3.scale.linear().range([0, wDiv]).domain([0,1]),
        yScale = d3.scale.linear().range([0, hDiv]).domain([0,1]);

    svg.selectAll(".positions")
        .data(c.data).enter()
        .append("circle")
        .attr("cx", function(d){ return xScale(+d.x) })
        .attr("cy", function(d){ return yScale(+d.y) })
        .attr("r", max.x * 0.0125)
        .style("fill", "rgba(37,37,37,0.5)")
        .style("stroke", "rgba(37,37,37,0.95)")
        .style("stroke-width", 2)
    
}