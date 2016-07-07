

function timeline (filterData) {


    var mainDiv = d3.select("#timeline").append("div").attr("id","timeline").style("padding-left", "1%");


    // Visualization
    mainDiv.append("div").attr("id", "timeline-vis");
    var container = document.getElementById("timeline-vis");

    var plotData = [];
    var groupData = [];


    filterData.forEach(function(d,i){

        var startNew = d.start; // .split(" ");
        var endNew = d.end; //.split(" ");

        var timeScore,
            officeWarning = 0;

        if (Math.abs(d.durPer) >= 0 && Math.abs(d.durPer) <= 0.25) {
            timeScore = 0;
        } else {
            timeScore = 1;
        }

        if ((typeof d.office != "undefined") && (d.office != "NA" && d.office!= d.officeplan)) {
            console.log(d,d.office, d.officeplan);

            officeWarning = 1
        }


        var o = {
            id: i,
            content: contentTimeline(d),
            start: startNew,
            end: endNew,
            group: d["prox.id"],
            className: "to" + timeScore + ( 1- d.orderYN) + officeWarning
        };

        plotData.push(o);
    });

    var nestData = d3.nest()
        .key(function(d) {return d["prox.id"]})
        .entries(filterData);


    nestData.forEach(function(d,i){
            
        var o = {
            id: d.key,
            content: d.key + "<br>" + d.values[0].department,
            value: i
        };

        groupData.push(o);
    });

    // Create a DataSet (allows two way data-binding)
    var items = new vis.DataSet(plotData);

    var groups = new vis.DataSet(groupData);

    // Configuration for the Timeline
    var options = {
        groupOrder: function (a, b) {
            return a.value - b.value;
        },
        zoomMax: 86400000 * 14,
        zoomMin: 30000
    };


    var timeline = new vis.Timeline(container, items, groups, options);

    // Create the title attribute
    var listDiv = $(".vis-item-overflow");
    for (var key in listDiv) {
        if (parseInt(key) >= 0) {
            $(listDiv[key]).attr("title", tableTooltip(listDiv[key]))
        }

    }


    // Interaction
    $(".vis-item-overflow").on('mouseover',function (d) {

        $(".vis-item-overflow").tooltip({
            html: true,
            track: true,
            container: 'body',
            placement: "bottom",
            trigger: "hover"
        });

    });


    function contentTimeline (d) {

        return "<p" +
            " floor=" + d.floor +
            " zone=" + d.zone +
            " office=" + d.office +
            " officeplan=" + d.officeplan +
            " label=" + d.label +
            " dur=" + d.dur +
            " durPer=" + d.durPer +
            " durRef=" + d.durRef +
            " start=" + d.start.replace(" ", "_") +
            " end=" + d.end.replace(" ", "_") +
            " orderYN=" + d.orderYN +
            " seqRef=" + d.seqRef.replaceAll(" ", "_") +
            " timediff=" + d.timediff +
            " type=" + d.type +
            " x=" + d.x +
            " y=" + d.y +
            ">" +  d.grFlZonOff + "</p>";
    }

    function tableTooltip (el) {

        var p = $(el).find("div").find("p"),
            order = p.attr('orderYN') == 0 ? "Different seq." : "Same seq.";


        return "<table style='text-align:left' class='table scatterTip' z-index='-1'>"
            + "<tbody>"
            + "<tr><td>Start: " + p.attr("start").replace("_", " ")
            + " <br>Stop: " + p.attr('end').replace("_", " ")
            + "<br>Duration: " + Math.round(parseInt(p.attr('timediff'))/60) + " min.</td>"
            + "</tr>"

            + "<tr><td>Office assigned: " + p.attr('officeplan') + "</td></tr>"

            + "<tr><td>Ref. Seq.: " + p.attr('seqRef').replaceAll("_", " ")
            + "<br>" +  order + "</td>"
            + "</tr>"

            + "<tr><td>Ref. Dur.: " + Math.round(parseInt(p.attr('durRef'))/60) + " min."
            + "<br>Difference: " + Math.round(parseInt(p.attr('dur'))/60) + " min."
            + "<br>Percentage: " + p.attr('durPer') + "%</td>"
            + "</tr>"

            + "</tbody>"
            + "</table>";
    }

}