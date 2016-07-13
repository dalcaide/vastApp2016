/**
 * Created by houda.lamqaddam on 15/06/16.
 */


var movement = function (timestamp, employeeID, employeeDep, floor, zone, entering) {
    this.timestamp = timestamp;
    this.employeeID = employeeID;
    this.employeeDep = employeeDep;
    this.floor = floor;
    this.zone = zone;
    this.entering = entering;
};

var movementList = [];


var w = $("body").width()/12;

var margin = {top: 25, right: 0, bottom: 30, left: 0},
    width = w - margin.left - margin.right,
    height = (w * 1.2) - margin.top - margin.bottom;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .innerTickSize(height)
    .outerTickSize(0)
    .tickPadding(1);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");


var svg = d3.select("body").append("svg")
    .attr("width", w*12)
    .attr("height", (w*12) * 0.37)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var zoomable = true;


var colorDom = d3.scale.ordinal()
    .domain(["Engineering", "Executive", "Facilities","Security", "Administration",  "Information Technology","HR", "Unknown"])
    .range(["DarkRed", "OliveDrab", "PaleVioletRed", "DodgerBlue", "Peru", "Gray", "LightSeaGreen", "red"]);


var dayValue;

d3.csv("res/sensor.csv", function (data) {

    dayValue = -1;

    data.forEach(function (d) {
        var timestamp_in = new Date(d.timestamp);
        var timestamp_out = timestamp_in.getTime() / 1000;
        var thisEmployeeID = d.prox_id;
        var thisEmployeeDep = d.department;
        var thisFloor = d.floor;
        var thisZone = d.zone;
        var thisMovement_in = new movement(new Date(d.timestamp), thisEmployeeID, thisEmployeeDep, thisFloor, thisZone, true);
        movementList.push(thisMovement_in);


        if (parseInt(d.timediff) > 0) {
            timestamp_out = new Date((timestamp_out + parseInt(d.timediff)) * 1000);
            var thisMovement_out = new movement(timestamp_out, thisEmployeeID, thisEmployeeDep, thisFloor, thisZone, false);
            movementList.push(thisMovement_out);
        }


    });


    var movementByDep = d3.nest()
        .key(function (d) {
            return d.floor;
        })
        .key(function (d) {
            return d.zone;
        })
        .key(function (d) {
            return d.employeeDep;
        })
        .entries(movementList);


    var movementByFloor = d3.nest()
        .key(function (d) {
            return d.floor;
        })
        .key(function (d) {
            return d.zone;
        })
        .entries(movementList);


    var zoneData = function (time, lOP) {
        this.time = time;
        this.listOfPeople = lOP;
        this.numberOfPeople = this.listOfPeople.length;
    };

    var zoneDataListInfo = function (floor, zone, zoneActivity) {
        this.floor = floor;
        this.zone = zone;
        this.zoneActivity = zoneActivity;
    };

    var zoneDataList = [];
    var zoneDataListFull = [];
    var mappedData = [];
    var currentListOfPeople = [];

    var departments = ["Engineering", "Executive", "Facilities","Security", "Administration",  "Information Technology","HR", "Unknown"];

    var zoneActivityPerDep = function (floor, zone, dep, zoneAct) {
        this.dep = dep;
        this.floor = floor;
        this.zone = zone;
        this.zoneActivity = zoneActivity;
    };

    var depActivity = [];
    for (var h = 0; h < movementByDep.length; h++) {
        for (var i = 0; i < movementByDep[h].values.length; i++) {
            for (var j = 0; j < movementByDep[h].values[i].values.length; j++) {

                var thisZoneInfo = movementByDep[h].values[i].values[j].values;

                var zoneActivity = [];
                currentListOfPeople = [];

                thisZoneInfo.sort(function (a, b) {
                    return (a.timestamp - b.timestamp);
                });
                for (var k = 0; k < thisZoneInfo.length; k++) {

                    if (!thisZoneInfo[k].entering) {
                        currentListOfPeople.splice(currentListOfPeople.lastIndexOf(thisZoneInfo[k].employeeID), 1);

                    }
                    else if (thisZoneInfo[k].entering) {
                        if (currentListOfPeople.indexOf(thisZoneInfo[k].employeeID) < 0) {
                            currentListOfPeople.push(thisZoneInfo[k].employeeID);
                        }
                    }
                    zoneActivity.push(new zoneData(thisZoneInfo[k].timestamp, currentListOfPeople));
                    mappedData.push(new zoneData(thisZoneInfo[k].timestamp, currentListOfPeople));

                    // console.log(zoneActivity)

                }
                // zoneDataList.push(new zoneDataListInfo(i, movementByFloor[i].values[j].key - 1, zoneActivity.map(type)));

                zoneDataList.push(new zoneActivityPerDep(h, i, movementByDep[h].values[i].values[j].key, zoneActivity.map(type)));
                zoneDataListFull.push(new zoneActivityPerDep(h, i, movementByDep[h].values[i].values[j].key, zoneActivity.map(type)));

            }
        }

        depActivity.push(zoneDataList);
        zoneDataList = [];

    }

    var depActivityData = d3.nest()
        .key(function (d) {
            return d.floor;
        })
        .key(function (d) {
            return d.zone;
        })
        .key(function (d) {
            return d.dep;
        })
        .entries(zoneDataListFull);


    x.domain(d3.extent(data, function (d) {
        return (new Date(d.timestamp));
    }));

    y.domain([0, d3.max(mappedData, function (d) {
        return d.numberOfPeople;
    })]);


    var line = d3.svg.line()
        .x(function (d) {
            return x(d.time);
        })
        .y(function (d) {
            return y(d.numberOfPeople);
        });

    line.interpolate('step-after');

    var fullDataPerZone = [];

    var dates = [31, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13];
    var colors = ["DarkRed", "OliveDrab", "PaleVioletRed", "DodgerBlue", "Peru", "Gray", "LightSeaGreen", "pink"];


    var fullDates = [new Date("May 31, 2016 00:00:00"), new Date("June 01, 2016 00:00:00"), new Date("June 02, 2016 00:00:00"), new Date("June 03, 2016 00:00:00"), new Date("June 04, 2016 00:00:00"), new Date("June 05, 2016 00:00:00"), new Date("June 06, 2016 00:00:00"), new Date("June 07, 2016 00:00:00"), new Date("June 08, 2016 00:00:00"),
        new Date("June 09, 2016 00:00:00"), new Date("June 10, 2016 00:00:00"), new Date("June 11, 2016 00:00:00"), new Date("June 12, 2016 00:00:00"), new Date("June 13, 2016 00:00:00")];

    var dropDown = d3.select("#filter").append("select")
        .attr("name", "day-list");

    var options = dropDown.selectAll("option")
        .data(dates)
        .enter()
        .append("option")
        .text(function (d) {
            return d;
        })
        .attr("value", function (d) {
            return d;
        });

    dropDown.on("change", function (d, e) {
        var selectedDate = fullDates[dates.indexOf(+this.value)];
        // console.log(selectedDate);
        var thisIndex = 0;
        d3.selectAll(".line").remove();
        d3.selectAll(".x.axis").remove();
        d3.selectAll(".y.axis").remove();

        d3.selectAll(".chart").each(function (d, i) {
            thisIndex = i;
            // return (this);
            var nextDate = new Date(selectedDate);
            x.domain([selectedDate, nextDate.setDate(selectedDate.getDate() + 1)]);

            var currentChart = d3.select(this);
            currentChart.append("g")
                .attr("class", "x axis")
                .attr("x", function (d, i) {
                    return (i * 4);
                })
                // .attr("transform", ("translate(" + (width * zoneDataList[thisIndex].zone) + "," + (height * zoneDataList[thisIndex].floor) + ")"))
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("x", 0)
                .attr("y", height)
                .attr("dx", "-.8em")
                .attr("dy", ".20em")
                .attr("transform", "rotate(-65,0," + height + ")");

            currentChart.append("g")
                .attr("class", "y axis")
                // .attr("transform", ("translate(" + (width * zoneDataList[thisIndex].zone) + "," + (height * zoneDataList[thisIndex].floor) + ")"))
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end");


            var filteredData = [];
            fullDataPerZone[thisIndex].forEach(function (d, i) {
                console.log("this dep: " + d.dep);
                filteredData = (d.zoneActivity.filter(function (a) {
                    return (a.time.getDate() === selectedDate.getDate());
                }));
                console.log(filteredData);
                var thisDep;
                switch (d.dep) {
                    case "Engineering":
                        thisDep = 0;
                        break;
                    case "Executive":
                        thisDep = 1;
                        break;
                    case "Facilities":
                        thisDep = 2;

                        break;
                    case "Security":
                        thisDep = 3;

                        break;
                    case "Administration":
                        thisDep = 4;

                        break;
                    case "Information Technology":
                        thisDep = 5;

                        break;
                    case "HR":
                        thisDep = 6;

                        break;
                    case "Unknown":
                        thisDep = 7;

                        break;
                }


                currentChart.append("path")
                    .datum(filteredData)
                    .attr("class", "line")
                    .attr("d", line)
                    .style("stroke", colors[thisDep]);


            });


        })


    });


    for (var a = 0; a < movementByFloor.length; a++) {
        for (var b = 0; b < movementByFloor[a].values.length; b++) {

            // console.log(a + " " + b);


            var chart = svg.append("g")
                .attr("class", "chart")
                .attr("transform", "translate(" + (width * (movementByFloor[a].values[b].key-1) + (movementByFloor[a].values[b].key-1) * 50 + 30) + "," + (height * a + a * 60) + ")");


            chart.append("text")
                .attr("text-anchor", "left")
                .attr("y", -2)
                .style("font-size", "12")
                .text("Floor " + parseInt(movementByFloor[a].key) + " Zone " + (movementByFloor[a].values[b].key));


            chart.append("g")
                .attr("class", "x axis")
                .attr("x", function (d, i) {
                    return (i * 4);
                })
                .call(xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("x", 0)
                .attr("y", height)
                .attr("dx", "-.8em")
                .attr("dy", ".20em")
                .attr("transform", "rotate(-65,0," + height + ")");

            chart.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end");

            var thisDepFloorZoneActivity = zoneDataListFull.filter(function (item) {
                return ((item.floor === a) && (item.zone === b));
            });


            var nested = d3.nest()
                .key(function (d) {
                    return d.dep;
                })
                .entries(thisDepFloorZoneActivity);

            fullDataPerZone.push(thisDepFloorZoneActivity);

            var thisDep;

            nested.forEach(function (d, i) {


                switch (d.key) {
                    case "Engineering":
                        thisDep = 0;
                        break;
                    case "Executive":
                        thisDep = 1;
                        break;
                    case "Facilities":
                        thisDep = 2;

                        break;
                    case "Security":
                        thisDep = 3;

                        break;
                    case "Administration":
                        thisDep = 4;

                        break;
                    case "Information Technology":
                        thisDep = 5;

                        break;
                    case "HR":
                        thisDep = 6;

                        break;
                    case "Unknown":
                        thisDep = 7;

                        break;
                }


                console.log(d);


                chart.append("path")
                    .datum(d.values[0].zoneActivity)
                    .attr("class", "line")
                    .attr("d", line)
                    .style("stroke", colors[thisDep]);

            });


        }


    }


    var legendSquareHeight = w * 0.13;
    var posLegend = w > 180? 9 : 10.2;
    console.log(w);
    var legend = svg.append("g")
        .attr("transform", "translate(" + w * posLegend + "," + (w*12) *0.11 + ")")
        .selectAll("g")
        .data(colorDom.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function (d, i) {
            var height = legendSquareHeight;
            var x = 0;
            var y = i * height;
            return 'translate(' + x + ',' + y + ')';
        });

    legend.append('rect')
        .attr('width', legendSquareHeight - 5)
        .attr('height', legendSquareHeight - 5)
        .style('fill', colorDom)
        .style('stroke', colorDom);

    legend.append('text')
        .attr('x', legendSquareHeight + 5)
        .attr('y', legendSquareHeight - 5)
        .text(function (d) {
            return d;
        });


    function type(d) {
        d.numberOfPeople = +d.numberOfPeople;
        return d;
    }


})
;

