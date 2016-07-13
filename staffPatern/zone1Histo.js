/**
 * Created by houda.lamqaddam on 13/06/16.
 */


var rowData = function (timestamp, type, prox_id, floor, zone, timestamp_out) {
    this.timestamp = timestamp;
    this.type = type;
    this.prox_id = prox_id;
    this.floor = floor;
    this.zone = zone;
    this.timestamp_out = timestamp_out;
};


var movement = function (timestamp, employeeID_in, employeeID_out, floor, zone) {
    this.timestamp = timestamp;
    this.employeeID_in = employeeID_in;
    this.employeeID_out = employeeID_out;
    this.floor = floor;
    this.zone = zone;
};

var movementList = [];
var rows = [];


var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var formatDate = d3.time.format("%Y-%m-%d %H:%M:%S");

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .innerTickSize(-height)
    .outerTickSize(0)
    .tickPadding(0.5);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");


var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


d3.csv("res/sensorData1.csv", function (data) {
    data.forEach(function (d) {


        var thisTimestamp = d.timestamp;
        var thisType = d.type;
        var thisProx_id = d.prox_id;
        var thisFloor = d.floor;
        var thisZone = d.zone;

        var thisRow = new rowData(thisTimestamp, thisType, thisProx_id, thisFloor, thisZone);

        var val = rows.map(function (item) {
            return item.prox_id;
        }).lastIndexOf(thisRow.prox_id);


        rows.push(thisRow);

        if (val >= 0) {
            rows[val].timestamp_out = thisTimestamp;
            var thisMovement_out = new movement(thisTimestamp, "", thisProx_id, rows[val].floor, rows[val].zone);
            movementList.push(thisMovement_out);
        }

        var thisMovement_in = new movement(thisTimestamp, thisProx_id, "", thisFloor, thisZone);
        movementList.push(thisMovement_in);


    });


    var zone1 = function (time, lOP) {
        this.time = time;
        this.listOfPeople = lOP;
        this.numberOfPeople = this.listOfPeople.length;
    };

    var zone1list = [];


    var zone1f1Data = movementList.filter(function (el) {
        return el.floor === "1" && el.zone === "2";
    });

    var var0 = new zone1("2016-05-31 00:00:00", []);

    zone1list.push(var0);
    var currentListOfPeople = [];

    for (var i = 0; i < zone1f1Data.length; i++) {


        if (zone1f1Data[i].employeeID_out) {
            currentListOfPeople.splice(currentListOfPeople.lastIndexOf(zone1f1Data[i].employeeID_out), 1);
            zone1list.push(new zone1(zone1f1Data[i].timestamp, currentListOfPeople));
        }
        else if (zone1f1Data[i].employeeID_in) {
            currentListOfPeople.push(zone1f1Data[i].employeeID_in);
            zone1list.push(new zone1(zone1f1Data[i].timestamp, currentListOfPeople));

        }
    }


    var data = zone1list.map(type);


    x.domain(d3.extent(zone1list, function (d) {
        return d.time;
    }));


    y.domain(d3.extent(zone1list, function (d) {
        return d.numberOfPeople;
    }));


    var line = d3.svg.line()
        .x(function (d) {
            return x(d.time);
        })
        .y(function (d) {
            return y(d.numberOfPeople);
        });


    line.interpolate('step-after');

    var bins = d3.histogram()
        .domain(x.domain())
        (data);


    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Occupancy");

    var bar = svg.selectAll(".bar")
        .data(bins)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function (d) {
            return "translate(" + x(d.time) + "," + y(d.numberOfPeople) + ")";
        });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", x(data[0].dx) - 1)
        .attr("height", function (d) {
            return height - y(d.numberOfPeople);
        });



    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);


    function type(d) {
        d.time = formatDate.parse(d.time);
        d.numberOfPeople = +d.numberOfPeople;
        return d;
    }

});

