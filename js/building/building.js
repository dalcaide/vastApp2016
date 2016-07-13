

$(document).ready(function(){


    d3.csv("data/buildBivariateHeatmap.csv", function(error, bivariateHeatmapCsv){
    d3.csv("data/lineChartByZoneFloorDayTime.csv", function(error, globalLineChartCSV){

        // ---- Bivariate HeatMap ---
        bivariateHeatmap({
            data: bivariateHeatmapCsv,
            id: "#bivariate-heatmap",
            idLegend: "#legend-bivariate-heatmap"
        });

        // Interaction with the Heatmap
        d3.select("#bivariate-heatmap").select("svg").selectAll(".bivariate-heatmap").on("click", function (d) {
            var day = d.day,
                floor = d.floor,
                zone = d.zone;

            linechartLegend();

            // -- Highlight the clicking --
            d3.selectAll(".rectangle-selected-val").classed("rectangle-selected-val", false);
            d3.selectAll(".rectangle-selected-back").classed("rectangle-selected-back", false);
            d3.select(this.parentNode).select(".rectangle-border-val").classed("rectangle-selected-val", true);
            d3.select(this.parentNode).select(".rectangle-border-back").classed("rectangle-selected-back", true);

            // -- Map & Individual LineChart  --
            d3.csv("data/positionsFloors.csv", function(error, posFloorsCsv) {
            d3.csv("data/building/building" + day + "-" + floor + "-" + zone + ".csv", function(error, buildingCsv) {

                // -- Map --
                var posFloorsFiltered = posFloorsCsv.filter(function(d){
                    return d.floor == floor && d.zone == zone;
                });
                mapHvac({id: "#map-hvac", floor: floor, data: posFloorsFiltered });

                // --  Global LineChart --
                var globalLineChartData = globalLineChartCSV.filter(function (d) {
                    return d.day == day && d.floor == floor && d.zone == zone;
                });

                // -- Individual Line Charts --
                globalLineChart({data: globalLineChartData, id: "#zoneGroup", dataRaw: globalLineChartCSV});

                // Empty the DIVs
                $("#ilc-W").empty(); $("#ilc-per").empty(); $("#ilc-C").empty(); $("#ilc-kgs").empty();
                $("#ilc-position").empty(); $("#ilc-ppm").empty();

                var wDiv = $("#ilc-W").width()/4;
                var hDiv = wDiv * .6;

                var buildingNested = d3.nest()
                    .key(function(d){ return d.units; })
                    .key(function(d){ return d.variable; })
                    .entries(buildingCsv);

                buildingNested.forEach(function(d){
                    var units;

                    if (d.key == "%") { units = "per";
                    } else if (d.key == "kg/s"){ units = "kgs";
                    } else { units = d.key;
                    }

                    d.values.forEach(function(e){
                        individualLineChart({ data: e.values, width: wDiv, height: hDiv, id: "#ilc-" + units, label: e.key,
                            ref: ['4','5','11','12'].indexOf(day) > -1 ? "refWeekend": "ref"
                        });
                    });
                });
            });
            });
        }); // <-- Close interaction
    });
    });
});