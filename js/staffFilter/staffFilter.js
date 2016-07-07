

$(function() {

    // Date picker
    $('input[name="daterange"]').daterangepicker({
        minDate: "05/31/2016 12:00 AM",
        maxDate: "06/13/2016 11:59 PM" ,
        timePicker: true,
        timePickerIncrement: 1,
        locale: {
            format: 'MM/DD/YYYY h:mm A'
        }
    });

    d3.csv("data/staff/sensorAndScores.csv", function(error, sensorCsv){

        // -- Zones --
        var zones = [];
        sensorCsv.forEach(function(d){ zones.push(d.grFlZon); });
        zones = zones.getUnique().sort();
        // Append values in the list
        d3.select("#dropdown-zone")
            .selectAll('li')
            .data(zones).enter()
            .append('li')
            .classed('zones', true)
            .append('a')
            .attr('href', '#')
            .text(function (d) {
                return d;
            });

        // -- Users --
        var users = [];
        sensorCsv.forEach(function(d){ users.push(d["prox.id"]); });
        users = users.getUnique().sort();
        // Append values in the list
        d3.select("#dropdown-user")
            .selectAll('li')
            .data(users).enter()
            .append('li')
            .classed('users', true)
            .append('a')
            .attr('href', '#')
            .text(function (d) {
                return d;
            });


        // -- Interaction --
        var zoneSel, userSel,
            dMin = "05/31/2016 12:00 AM",
            dMax = "05/31/2016 6:00 AM";
        $(".zones").on("click", function () {
            var me = this;
            zoneSel = d3.select(me).text();
            execution({dMin: dMin, dMax: dMax, zone: zoneSel, user: userSel});
        });

        $(".users").on("click", function () {
            var me = this;
            userSel = d3.select(me).text();
            execution({dMin: dMin, dMax: dMax, zone: zoneSel, user: userSel});
        });

        $('input[name="daterange"]').on('apply.daterangepicker', function(error, picker) {
            dMin = picker.startDate.format('MM/DD/YYYY h:mm A');
            dMax = picker.endDate.format('MM/DD/YYYY h:mm A');
            execution({dMin: dMin, dMax: dMax, zone: zoneSel, user: userSel});
        });

        execution({dMin: dMin, dMax: dMax, zone: zoneSel, user: userSel});

        // -- Remove button --
        $("#reset").on("click", function () {
            zoneSel = undefined;
            userSel = undefined;
            dMin = "05/31/2016 12:00 AM";
            dMax = "05/31/2016 6:00 AM";
            $("#timeline").empty();
        });
        
        
        // -- Filter --
        function filterData (c) {

            console.log(c);

            var filter = sensorCsv.filter(function(d){
                var startData = new Date (d.start),
                    endData = new Date (d.end),
                    startRef = new Date (c.dMin),
                    endRef = new Date (c.dMax);

                if (typeof c.zone != "undefined" && typeof c.user !== "undefined") {
                    return  c.zone == d.grFlZon &&  c.user == d["prox.id"] &&
                    (((startData >= startRef) && (endData <= endRef)) ||
                        ((startData <= startRef) && (endData >= startRef)) ||
                        ((startData <= endRef) && (endData >= endRef))
                    );

                } else if (typeof c.zone != "undefined") {
                    return  c.zone == d.grFlZon &&
                        (((startData >= startRef) && (endData <= endRef)) ||
                            ((startData <= startRef) && (endData >= startRef)) ||
                            ((startData <= endRef) && (endData >= endRef))
                        );

                } else if (typeof c.user !== "undefined") {
                    return c.user == d["prox.id"] &&
                        (((startData >= startRef) && (endData <= endRef)) ||
                            ((startData <= startRef) && (endData >= startRef)) ||
                            ((startData <= endRef) && (endData >= endRef))
                        );

                } else {
                    return (((startData >= startRef) && (endData <= endRef)) ||
                        ((startData <= startRef) && (endData >= startRef)) ||
                        ((startData <= endRef) && (endData >= endRef))
                    );
                }
            });

            return filter;
        }
        // -- Execution --
        function execution (c) {
            $("#timeline").empty();
            var dataset = filterData(c);
            if (dataset ) {
                timeline(dataset);
            } else {
                alert("Selection is too big, please reduce it!")
            }

        }
    });
});
