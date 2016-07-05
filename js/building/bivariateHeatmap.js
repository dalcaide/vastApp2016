function bivariateHeatmap(c) {
    
    // -- Check the size of the DIV --
    var wDiv = c.wDiv != null ? c.wDiv : $(c.id).width(),
        hDiv = c.hDiv != null ? c.hDiv : wDiv * .5;

    // --- Define the margin and SVG size ----
    var margin = { top: 0.09 * wDiv, right: 0.00, bottom: 0.1 * wDiv, left: 0.08 * wDiv },
        width = wDiv - margin.left - margin.right,
        height = hDiv - margin.top - margin.bottom;


    // ---- Global variables ----
    var days = ["31", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"],
        zone = c.zones != null ? c.zones : ["F:1-Z:1","F:1-Z:2","F:1-Z:3","F:1-Z:4","F:1-Z:5","F:1-Z:7","F:1-Z:8",
            "F:1-Z:all","F:2-Z:1","F:2-Z:2", "F:2-Z:3","F:2-Z:4","F:2-Z:5","F:2-Z:6","F:2-Z:7","F:2-Z:8","F:2-Z:9",
            "F:2-Z:10","F:2-Z:11","F:2-Z:12", "F:2-Z:14","F:2-Z:15","F:2-Z:16","F:2-Z:all","F:3-Z:1","F:3-Z:2",
            "F:3-Z:3","F:3-Z:5","F:3-Z:6","F:3-Z:7", "F:3-Z:8","F:3-Z:9","F:3-Z:10","F:3-Z:11","F:3-Z:12","F:3-Z:all",
            "F:all-Z:all"
        ],
        colors = ['#ffffb2','#fed976','#feb24c','#fd8d3c','#f03b20','#bd0026'],
        gridSize = c.gridSize != null ? c.gridSize : Math.floor(width / zone.length); // <-- size grid

    // ---- Define the scales used ----
    var dayScale  = d3.scale.ordinal().domain(days).rangePoints([0, days.length-1]),
        zoneScale  = d3.scale.ordinal().domain(zone).rangePoints([0, zone.length-1]),
        colorScale = d3.scale.quantile().domain(d3.extent(c.data, function(d){ return +d.max })).range(colors),
        sizeScale  = d3.scale.linear().domain(d3.extent(c.data, function(d){ return +d.mean })).range([gridSize*.1, gridSize]),
        roundScale = d3.scale.linear().domain(d3.extent(c.data, function(d){ return +d.mean })).range([1, 4]);

    // --- Print the quartile used in this plot for the linecharts ---
    var colorScaleArray = [colorScale.domain()[0]].concat(colorScale.quantiles()).concat(colorScale.domain()[1]);
    console.log(colorScaleArray);

    // -- Create the SVG -- //
    var svg = d3.select(c.id).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // -- Labels -- //
    var dayLabels = svg.selectAll(".dayLabel")
        .data(days)
        .enter().append("text")
        .text(function (d) { return "Day " + d; })
        .attr("x", 0)
        .attr("y", function (d) { return (dayScale(d) * gridSize); })
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + gridSize/2 + ")")
        .attr("class", function (d, i) { return ( [4,5,11,12].indexOf(i) > -1 ? "dayLabel axis-rectangle-weekend" : "dayLabel"); });

    var zoneLabels = svg.selectAll(".zoneGroup")
        .data(zone).enter()
        .append("g")
        .attr("transform", function(d) { return "translate(" + ((zoneScale(d) * gridSize) + gridSize/2) + ", -6)"; })
        .attr("class", "zoneGroup")
        .append("text")
        .text(function(d) { return d; })
        .style("text-anchor", "start")
        .attr("transform", "rotate(-65)");


    // -- Rectangles --//
    var rectanglesGroup = svg.selectAll(".rectangleGroup")
        .data(c.data).enter()
        .append("g");

    var rectanglesBack = rectanglesGroup.append("rect")
        .attr("width", gridSize)
        .attr("height", gridSize)
        .attr("x", function(d) { return zoneScale(d.grFlZone) * gridSize })
        .attr("y", function(d) { return dayScale(d.day) * gridSize })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("class", function (d) {
            return ( [4,5,11,12].indexOf(+d.day) > -1 ? "bivariate-heatmap rectangle-border-back rectangle-weekend" :
                "bivariate-heatmap borderedBack rectangle-border-back rectangle-weekday");
        });

    var rectanglesValues = rectanglesGroup.append("rect")
        .attr("width", function(d){ return sizeScale(+d.mean)})
        .attr("height", function(d){ return sizeScale(+d.mean)})
        .attr("x", function(d) { return (zoneScale(d.grFlZone) * gridSize) + (gridSize - sizeScale(+d.mean))/2 })
        .attr("y", function(d) { return (dayScale(d.day) * gridSize) + (gridSize - sizeScale(+d.mean))/2 })
        .attr("rx", function(d){ return roundScale(+d.mean)})
        .attr("ry", function(d){ return roundScale(+d.mean)})
        .attr("class", "bivariate-heatmap rectangle-border-val")
        .style("fill", function(d) { return colorScale(+d.max) });


    // -- Legend --//
    // -- Compute size of the DIV -- //
    var wDivL = $(c.idLegend).width() *  0.85,
        hDivL = wDiv * .02;

    var marginL = { top: 0 * wDivL, right: 0.001 * wDivL, bottom: 0 * wDivL, left: 0.001 * wDiv },
        widthL = wDivL - marginL.left - marginL.right,
        heightL = hDivL - marginL.top - marginL.bottom;

    var legendScale = d3.scale.ordinal().domain(colorScaleArray).rangePoints([widthL * .15, widthL * 0.5]),
        legendSize = wDivL * 0.05;
    //console.log(wDivL,colorScaleArray.length,wDivL / colorScaleArray.length);

    var svgL = d3.select(c.idLegend).append("svg")
        .attr("width", widthL + marginL.left + marginL.right)
        .attr("height", heightL + marginL.top + marginL.bottom)
        .append("g")
        .attr("transform", "translate(" + marginL.left + "," + marginL.top + ")");

    svgL.append("text")
        .text("SD times:")
        .style("text-anchor", "start")
        .attr({"x": 0, "y":heightL - heightL/4 });


    var gLegend = svgL.selectAll(".rectangle")
        .data(colorScaleArray).enter()
        .append("g")
        .attr("transform", function(d){ return "translate(" + legendScale(d) + "," + 0 + ")"});

    gLegend.append("rect")
        .attr("width",  legendSize)
        .attr("height", heightL)
        .attr({"x": 0, "y":0 })
        .style("fill", function(d) { return colorScale(d) });

    gLegend.append("text")
        .text(function(d){return Math.round(d)})
        .style("text-anchor", "middle")
        .attr({"x": legendSize/2, "y":heightL - heightL/4 });



}