function linechartLegend() {



    var w = $("#linechart-legend1").width();
    var h = w < 500 ? w * 0.03 : w * 0.02;

    $("#linechart-legend1").empty();
    $("#linechart-legend2").empty();

    var svg1 = d3.select("#linechart-legend1").append("svg")
        .attr("width", w)
        .attr("height", h);

    // Actual Value
    svg1.append("text").text("Actual value:").attr({"x" : w * (0.25/2), "y" : h }).attr("text-anchor", "middle");
    svg1.append("line").attr({"x1": w * .25, "x2": w * .45, "y1": h * .5 , "y2": h * .5 }).attr("stroke-width", "2.5px").attr("stroke", "#000000");

    // Reference Value
    svg1.append("text").text("Reference value:").attr({"x" : (w * .5) + (w * (0.25/2)), "y" : h }).attr("text-anchor", "middle");
    svg1.append("line").attr({"x1": w * .75, "x2": w * .95, "y1": h * .5 , "y2": h * .5 }).attr("stroke-width", "1.5px").attr("stroke", "#6c6c6c");


    var svg2 = d3.select("#linechart-legend2").append("svg")
        .attr("width", w)
        .attr("height", h);

    // Actual Value
    svg2.append("text").text("Lower than ref.:").attr({"x" : w * (0.25/2), "y" : h }).attr("text-anchor", "middle");
    svg2.append("rect").attr({"x": w * .35, "width": w * .1, "y": 0 , "height": h  }).attr("fill", "#336699");

    // Reference Value
    svg2.append("text").text("Greater than ref.:").attr({"x" : (w * .5) + (w * (0.25/2)), "y" : h }).attr("text-anchor", "middle");
    svg2.append("rect").attr({"x": w * .85, "width": w * .1, "y": 0 , "height": h  }).attr("fill", "#4e9eed");

}
