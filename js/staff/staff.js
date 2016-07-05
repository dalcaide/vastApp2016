

$(document).ready(function(){
/*
    // Define the daterangepicker
    $('input[name="daterange"]').daterangepicker({
        minDate: "05/31/2016",
        maxDate: "06/13/2016"
    });
*/
    var wDiv = $("#day31").width(),
        hDiv = wDiv * 0.75;

    // Interaction variables
    var dMin = "31",
        dMax = "13",
        color,
        arc = true,
        behaviour = "mean";


    d3.csv("data/staff/timeScores.csv", function(error, scoresData){
    d3.csv("data/staff/sensorAndScores.csv", function(error, sensorCsv){

        // ---- Filter Data ---
        var dayValue = function (d) {return +d.day},

            data = scoresData.filter(function(d){
            if ((dMin === "31") && (dMin == dMax)) {
                return dayValue(d) == 31;
            } else if (dMin === "31") {
                return ((dayValue(d) >= 1) && (dayValue(d) == 31)) || (dayValue(d) <= dMax);
            } else {
                return (dayValue(d) >= dMin) && (dayValue(d) <= dMax);
            }
        });

        var nestedData = d3.nest()
            .key(dayValue)
            .entries(data);

        nestedData.forEach(function(d){
            // Default
            scatter({ data : d.values, div: "#day" + d.key, wDiv:wDiv, hDiv:hDiv, dMin:dMin,
                dMax:dMax, var: behaviour, timeline: sensorCsv
            });
        });

    });
    });
});

