

function timeline (data, id, day) {

    //$("#timeline").empty();


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

        var timeScore;

        if (Math.abs(d.durPer) >= 0 && Math.abs(d.durPer) <= 0.5) {
            timeScore = 0;
        } else {
            timeScore = 2;
        }


        var o = {
            id: i,
            content: contentTimeline(d),
            start: "2016-06-30 " + startNew[1],
            end: "2016-06-30 " + endNew[1],
            group: d["prox.id"] + d.day,
            className: "to" + timeScore + ( 1- d.orderYN)
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

    // Create a Timeline
    var timeline = new vis.Timeline(container, items, groups, options);
    
    // Interaction
    $(".vis-item-overflow").on('mouseover',function (d) {

        var me = this;
        console.log($(d).find("div").find("p"));


        $(".vis-item-overflow").tooltip({
            title: tableTooltip(me),
            html: true,
            placement: "bottom",
            trigger: "hover"
        });

    });


    //vis-item-overflow
    //$(".vis-item-overflow").on('mouseover',function () {
        //$(this).attr("data-toggle","tooltip").attr("title","<h1>Jamon<h1/>");
        /*$(".vis-item-overflow").tooltip({
            title: tableTooltip(this),
            html: true,
            placement: "auto",
            trigger: "hover"
        });*/

        //console.log(this);
        //console.log($(this).find(".vis-item-content").find("p").attr('zone'));
        // data-toggle='tooltip' title='Hooray!'"
    //});

    function contentTimeline (d) {
        //console.log(d);
        return "<p" +
                "  floor=" + d.floor +
                " zone=" + d.zone +
                " office=" + d.office +
                " label=" + d.label +
                " dur=" + d.dur +
                " durPer=" + d.durPer +
                " durRef=" + d.durRef +
                " start=" + d.start +
                " end=" + d.end +
                " orderYN=" + d.orderYN +
                " seqRef=" + d.seqRef +
                " timediff=" + d.timediff +
                " type=" + d.type +
                " x=" + d.x +
                " y=" + d.y +
                ">" +  d.grFlZonOff + "</p>";
    }

    function tableTooltip (el) {

        var p = $(el).find("div").find("p");

        return "<table class='table scatterTip table-condensed'>"
            + "<tbody>"
            + "<tr>"
            + "<td><b>Start:</b></td>"
            + "<td>" + p.attr('start') + "</td>"
            + "</tr>"
            + "<tr>"
            + "<td><b>End:</b></td>"
            + "<td>" + p.attr('end') + ' (' + p.attr('timediff') + " secs.)</td>"
            + "</tr>"
            + "<tr>"
            + "<td><b>Reference:</b></td>"
            + "<td>" + p.attr('durRef') + " secs. (" + p.attr('dur') + ")</td>"
            + "</tr>"
            + "<tr>"
            + "<td><b>Sequence:</b></td>"
            + "<td>" + p.attr('seqRef') + " (" + p.attr('orderYN') + ")</td>"
            + "</tr>"
            + "</tbody>"
            + "</table>";
    }

}