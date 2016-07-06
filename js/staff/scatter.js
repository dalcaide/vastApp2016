



function scatter (c) {

    //rawData, div, wDiv, hDiv, dMin, dMax, color, arc, behaviour, sensorCsv

    //---- Options ----
    var xMargin = 0.05,
        xValue = function (d) { return +d.currTime / 3600; },
        yValue = function (d) { return +d[c.var]; },
        idValue = function(d) { return d.id},
        rMin = c.wDiv * 20/950,
        rMax = c.wDiv * 50/950,
        dayValue = function (d) {return +d.day},
        sepBtwClass = "  ";


    // ---- Filter Data ---
    var data = c.data.filter(function(d){
        if ((c.dMin === "31") && (c.dMin == c.dMax)) {
            return dayValue(d) == 31;
        } else if (c.dMin === "31") {
            return ((dayValue(d) >= 1) && (dayValue(d) == 31)) || (dayValue(d) <= c.dMax);
        } else {
            return (dayValue(d) >= c.dMin) && (dayValue(d) <= c.dMax);
        }

    });

    // ---- Size of the SVG ----
    var margin = {top: 0.1 * c.hDiv, right: 0.05 * c.wDiv, bottom: 0.12 * c.hDiv, left: 0.17 * c.wDiv},
        width = c.wDiv - margin.left - margin.right,
        height = c.hDiv - margin.top - margin.bottom;

    // ---- Create the SVG ----
    var svg = d3.select(c.div).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // ---- Scales ----
    // --- Color ----
    cValue = function (d) { return d[color]; };
    cScale = d3.scale.ordinal().domain([0,1,2,3]).range(["#e8e8e8","#00AEED","#EC54A1", "#923F8C"]);

    // ---- X dimension ----
    var xMin = 0, // <-- rawData
        xMax = 18, // <-- rawData
        xRange = Math.abs(xMax - xMin) * xMargin,
        xScale = d3.scale.linear().range([0, width]).domain([xMin - xRange, xMax + xRange]),
        xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    // ---- Y dimension ----
    var yScale = d3.scale.linear().range([height, 0]).domain([0, 1]),
        yAxis = d3.svg.axis().scale(yScale).orient("left");

    // ---- Axis ----
    // x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height + (height * 0.01)) + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Duration");

    // y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Mean");

    // ---- Tip ----
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            return "<table class='table scatterTip table-condensed'>"
            + "<tbody>"
            + "<tr>"
            + "<td><b>Identification:</b></td>"
            + "<td>" + idValue(d) + "</td>"
            + "</tr>"
            + "<tr>"
            + "<td><b>Department:</b></td>"
            + "<td>" + d.department + "</td>"
            + "</tr>"
            + "<tr>"
            + "<td><b>Day:</b></td>"
            + "<td>" + dayValue(d) + " (" + d.weekday + ")"+ "</td>"
            + "</tr>"
            + "</tbody>"
            + "</table>";
        });

    svg.call(tip);


    // ---- Glyphs ----
    // Groups
    var groupGlyph = svg.selectAll(".glyph")
        .data(data).enter()
        .append("g")
        .attr("class", function (d) { return "glyph " + idValue(d) + "-scatter"; })
        .attr("transform", function(d) {
            return "translate(" + xScale(xValue(d)) + ", " + yScale(yValue(d)) + ")"
        });

    // Dots
    groupGlyph.append("circle")
        .attr("class", "dot")
        .attr("r", rMin)
        .style("fill", defineColor);

    groupGlyph
        .on("mouseover",  function(d){
            d3.select(this).select(".dot").transition().duration(100).attr("r", rMax);
            tip.show(d);
        }).on("mouseout", function (d) {
            d3.select(this).select(".dot").transition().duration(100).attr("r", rMin);
            tip.hide(d);
        }).on("click", click);


    // ---- Legend ----

    $("#legend").empty();

    var legendContainer = d3.select("#legend")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top * 3 + ")");

    var legend = legendContainer.selectAll(".legend")
            .data(cScale.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(50," + i * 35 + ")"; });

        // draw legend colored rectangles
         legend.append("circle")
         .attr("x", 40)
         .attr("r", rMin)
         .style("fill", function(d){return cScale(d)});

         // draw legend text
         legend.append("text")
         .attr("x", 50)
         .attr("y", 0)
         .attr("dy", ".35em")
         .style("text-anchor", "start")
         .text(function(d) {
             if (d == "0"){
                 return "None";
             } else if (d == "1"){
                 return "Sequence order";
             } else if (d == "2"){
                 return "Duration in location";
             } else if (d == "3"){
                 return "Both";
             }
         });



    // -- Additional functions --
    function click (o) {

        var listIds = selectIds(o);

        listIds.forEach(function(d){

            var selection = d3.selectAll("."+ d.id.split(" ")[1] +"-scatter"  );


            if ( selection.select(".dot" )[0][0] ) { // <--  if exists .dot class inside the group (not selected)

                timeline(c.timeline, d.id, d.day);

                // increase the size of the circle
                selection
                    .select(".dot")
                    .attr("r", rMax)
                    .style("fill", "#fff7bc" )
                    .attr("class", "dotSelected");

                // add the number of day inside
                selection.append("text")
                    .attr("class", "textSelected")
                    .attr("dy", ".35em")
                    .attr("dx", "-.15em")
                    .text(function(d) { return d.id; });


            } else { // if selected

                // restore the dot
                selection
                    .select(".dotSelected")
                    .attr("r", rMin)
                    .style("fill", defineColor)
                    .attr("class", "dot");

                // remove the text
                selection
                    .select(".textSelected")
                    .remove();

            }

        });


    }

    function defineColor(d){
        var color,
            durationValue = function (d) { return +d.duration },
            orderValue = function (d) { return +d.order };

        if (durationValue(d) < 0.05 && orderValue(d) < 0.05) {
            color = 0;
        } else if (durationValue(d) < orderValue(d) && orderValue(d) - durationValue(d) >= 0.05  ) {
            color = 1;
        } else if (durationValue(d) > orderValue(d) && durationValue(d) - orderValue(d) >= 0.05 ) {
            color = 2;
        } else {
            color = 3;
        }

        return cScale(color);

    }

    function selectIds(d){

        var day = d.day,
            time = yValue(d),
            mean = xValue(d);

        var data = c.data.filter(function(e){

            return e.day == day &&
                Math.abs( xValue(e) - mean) <= mean*0.05 &&
                Math.abs( yValue(e) - time) <= time*0.05;
        });

        return data;
    }




}
