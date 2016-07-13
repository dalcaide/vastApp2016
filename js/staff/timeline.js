

function timeline (data, id, day) {
    

    var mainDiv = d3.select("#timeline").append("div").attr("id", id.trim() + "-timeline").style("padding-left", "1%");

    // Labels
    var labelDiv = mainDiv.append("div").attr("id", id.trim() + "-timeline-label");
    labelDiv.append("h4").text(id.trim() + " ").style("display","inline-block");
    labelDiv.append("button").attr({
        type:"button",
        id : id.trim() + "-timeline-button",
        class: "btn btn-primary"
    }).text("Close")
    .style("margin-left", "2%");

    $( "#" + id.trim() + "-timeline-button").on('click', function() {
        $("#" + id.trim() + "-timeline").remove();
    });

    // Visualization
    mainDiv.append("div").attr("id", id.trim() + "-timeline-vis");
    var container = document.getElementById(id.trim() + "-timeline-vis");

    var plotData = [];
    var groupData = [];


    var filterData = data.filter(function(d){
        return d["prox.id"] == id; //" rparade001"
    });


    filterData.forEach(function(d,i){

        var startNew = d.start.split(" ");
        var endNew = d.end.split(" ");

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
            start: "2016-06-30 " + startNew[1],
            end: "2016-06-30 " + endNew[1],
            group: d["prox.id"] + d.day,
            className: "to" + timeScore + ( 1- d.orderYN) + officeWarning
        };

        plotData.push(o);
    });

    var nestData = d3.nest()
        .key(function(d) {return d["prox.id"]})
        .key(function(d) {return d.day})
        .entries(filterData);


    nestData.forEach(function(d){
       d.values.forEach(function(e){

           var value = e.key == "31" ? 1 : parseInt(e.key) + 1;

           var o = {
               id: d.key + e.key,
               content: d.key + "<br>" + e.values[0].department + "<br>" +
                e.values[0].weekday + " " + e.key,
               value: value
           };

           groupData.push(o);

       })
    });

    // Create a DataSet (allows two way data-binding)
    var items = new vis.DataSet(plotData);

    var groups = new vis.DataSet(groupData);

    // Configuration for the Timeline
    var options = {
        groupOrder: function (a, b) {
            return a.value - b.value;
        },
        zoomMax: 86400000,
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
                + "<br>Percentage: " + (+p.attr('durPer')*100) + "%</td>"
            + "</tr>"

            + "</tbody>"
            + "</table>";
    }

}