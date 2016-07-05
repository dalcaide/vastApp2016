

$(document).ready(function(){


    d3.csv("data/hazium/buildHaziumBivariateHeatmap.csv", function(error, bivariateHeatmapCsv){
        d3.csv("data/hazium/lineChartByZoneFloorDayTimeHazium.csv", function(error, globalLineChartCSV){


            var zones = ["F:1-Z:8","F:2-Z:2", "F:2-Z:4","F:3-Z:1"];
            var wDiv = $("#bivariate-heatmap").width() * 2,
                hDiv = wDiv;

            console.log(wDiv, hDiv);
            // ---- Bivariate HeatMap ---
            bivariateHeatmap({
                data: bivariateHeatmapCsv,
                id: "#bivariate-heatmap",
                idLegend: "#legend-bivariate-heatmap",
                zones: zones,
                wDiv : wDiv,
                hDiv : hDiv,
                gridSize: wDiv/34
            });

            // Interaction with the Heatmap
            d3.select("#bivariate-heatmap").select("svg").selectAll(".bivariate-heatmap").on("click", function (d) {
                var day = d.day,
                    floor = d.floor,
                    zone = d.zone;

                // -- Highlight the clicking --
                d3.selectAll(".rectangle-selected-val").classed("rectangle-selected-val", false);
                d3.selectAll(".rectangle-selected-back").classed("rectangle-selected-back", false);
                d3.select(this.parentNode).select(".rectangle-border-val").classed("rectangle-selected-val", true);
                d3.select(this.parentNode).select(".rectangle-border-back").classed("rectangle-selected-back", true);

                // -- Map & Individual LineChart  --
                d3.csv("data/positionsFloors.csv", function(error, posFloorsCsv) {
                    d3.csv("data/hazium/buildingHazium.csv", function(error, buildingCsv) {

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
                        $("#ilc-ppm").empty();

                        var wDiv = $("#ilc-ppm").width();
                        var hDiv = wDiv * .6;

                        var buildingFiltered = buildingCsv.filter(function(d){
                            return d.floor == floor && d.zone == zone && d.day == day;
                        });

                        var buildingNested = d3.nest()
                            .key(function(d){ return d.units; })
                            .key(function(d){ return d.variable; })
                            .entries(buildingFiltered);

                        buildingNested.forEach(function(d){

                            d.values.forEach(function(e){
                                individualLineChart({ data: e.values, width: wDiv, height: hDiv, id: "#ilc-" + d.key, label: e.key,
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