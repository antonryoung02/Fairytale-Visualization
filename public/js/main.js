d3.json("data/englishfairytales/semantic_data.json").then(function(data) {

    svg = d3.select("#timeline");
    
    var dropdown = d3.select("#choose-fairytale");
    dropdown.selectAll("option").data(data).enter().append("option")
    .attr("value", function(d, i) { 
        return i; 
    })
    .text(function(d) { 
        return d.title; 
    });
    //Update visualization to correct story (at index)
    dropdown.on("change", function(event, d) {
        let element = event.currentTarget;
        let index = Number(element.value);
        
        vis_class.update(index);
        
    });
    console.log("before")

    //Initially just display the first story
    var vis_class = new SentimentDisplayChart(data, svg)
    vis_class.addLegend()
    vis_class.update(0);
    vis_class.update(0);



})
