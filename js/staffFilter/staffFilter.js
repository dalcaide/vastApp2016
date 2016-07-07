

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

    d3.csv("data/staff/sensorAndScores.csv", function(error, proxMobile){
    d3.csv("data/staff/sensorAndScoresNoMobile.csv", function(error, proxNoMobile){

        var sensorCsv = proxMobile;
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

        $(".dataset").on("click", function () {
            var me = this;
            sensorCsv =  d3.select(me).text() == "Prox and Mobile" ? proxMobile : proxNoMobile;
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

            var listusers = [];

            var general = sensorCsv.filter(function(d){
                var startData = new Date (d.start),
                    endData = new Date (d.end),
                    startRef = new Date (c.dMin),
                    endRef = new Date (c.dMax);

                if ((typeof c.zone != "undefined" && typeof c.user !== "undefined") &&
                    c.zone == d.grFlZon && c.user == d["prox.id"] &&
                    (
                        ((startData >= startRef) && (endData <= endRef)) ||
                        ((startData <= startRef) && (endData >= startRef)) ||
                        ((startData <= endRef) && (endData >= endRef))
                    )
                ) {
                    listusers.push(d["prox.id"]);

                } else if ((typeof c.zone != "undefined" && typeof c.user == "undefined" &&
                            c.zone == d.grFlZon) &&
                            (
                                ((startData >= startRef) && (endData <= endRef)) ||
                                ((startData <= startRef) && (endData >= startRef)) ||
                                ((startData <= endRef) && (endData >= endRef))
                            )
                ) {

                    listusers.push(d["prox.id"]);
                } else if ((typeof c.user != "undefined") && (typeof c.zone == "undefined") &&
                            c.user == d["prox.id"] &&
                            (
                                ((startData >= startRef) && (endData <= endRef)) ||
                                ((startData <= startRef) && (endData >= startRef)) ||
                                ((startData <= endRef) && (endData >= endRef))
                            )
                ) {
                    listusers.push(d["prox.id"]);
                } else if ((typeof c.user == "undefined")  && (typeof c.zone == "undefined") &&
                    (
                        ((startData >= startRef) && (endData <= endRef)) ||
                        ((startData <= startRef) && (endData >= startRef)) ||
                        ((startData <= endRef) && (endData >= endRef))
                    )
                ) {
                    listusers.push(d["prox.id"]);
                }
            });

            listusers = listusers.getUnique();
            //console.log(listusers);


            var filter = sensorCsv.filter(function(d){
                var startData = new Date (d.start),
                    endData = new Date (d.end),
                    startRef = new Date (c.dMin),
                    endRef = new Date (c.dMax);

                if (typeof c.zone != "undefined" && typeof c.user !== "undefined") {
                    d.frame = c.zone == d.grFlZon ? 1 : 0;
                    return  c.user == d["prox.id"] && listusers.indexOf(d["prox.id"]) >= 0 &&
                    (((startData >= startRef) && (endData <= endRef)) ||
                        ((startData <= startRef) && (endData >= startRef)) ||
                        ((startData <= endRef) && (endData >= endRef))
                    );

                } else if (typeof c.zone != "undefined") {
                    d.frame = c.zone == d.grFlZon ? 1 : 0;
                    return listusers.indexOf(d["prox.id"]) >= 0 &&
                        (((startData >= startRef) && (endData <= endRef)) ||
                            ((startData <= startRef) && (endData >= startRef)) ||
                            ((startData <= endRef) && (endData >= endRef))
                        );

                } else if (typeof c.user != "undefined") {
                    d.frame = 0;
                    return c.user == d["prox.id"] && listusers.indexOf(d["prox.id"]) >= 0 &&
                        (((startData >= startRef) && (endData <= endRef)) ||
                            ((startData <= startRef) && (endData >= startRef)) ||
                            ((startData <= endRef) && (endData >= endRef))
                        );

                } else {
                    d.frame = 0;
                    return listusers.indexOf(d["prox.id"]) >= 0 &&
                        (((startData >= startRef) && (endData <= endRef)) ||
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
            //console.log(dataset);

            if (dataset ) {
                timeline(dataset);
            } else {
                alert("Selection is too big, please reduce it!")
            }

        }
    });
    });
});
