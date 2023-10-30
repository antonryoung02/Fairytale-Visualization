function SentimentDisplayChart(data, svg){

    var self = this;
    self.svg = svg;
    self.data = data;
    self.init();
};

SentimentDisplayChart.prototype.init = function(){
    console.log("init is called")
    var self = this;
    self.emotions = ["anger", "disgust", "fear", "joy", "neutral", "sadness", "surprise"]
    self.colors = ["#BF1A2F", "#568259", "#4B0082", "#D499B9", "#808080", "#87CFFC", "#FFA500"]

    self.storyIndex = 0
    self.emotionIndex = 0

    self.svg.append("text").attr("x", 5).attr("y", 30).text("Select Emotion")

    let emotionsvg = d3.select("#emotion-svg")
    emotionsvg.selectAll("*").remove();

    self.legend = self.svg.append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(10,40)');
    self.legend.selectAll(".legend-rect").attr("id", null);
    
    self.colorScale = d3.scaleOrdinal()
    .domain(self.emotions)
    .range(self.colors);
};


SentimentDisplayChart.prototype.addLegend = function() {
    var self = this;
     //Moving the entire legend
    
    let legendItems = self.legend.selectAll('.legend-item')
    .data(self.colorScale.domain())
    .enter().append('g')
    .attr('class', 'legend-item')
    .attr('transform', function(d,i) {
        return `translate(0,${i * 24})`; //Moving elements inside the legend
    })
    .on("click", function(event, d) {
        console.log(`At story ${self.storyIndex}`)
        self.emotionIndex = self.emotions.indexOf(d)
        self.displayEmotionChart(self.data, self.emotions.indexOf(d), self.storyIndex)

        self.legend.selectAll(".legend-rect").attr("id", null);
        console.log(this)
        console.log(event.currentTarget)
        d3.select(event.currentTarget).select("rect").attr("id", "selected-box");
    });
    

    legendItems.append('rect')
    .attr('width', 20)
    .attr('height', 20)
    .attr("class", "legend-rect")
    .style('fill', self.colorScale);

    legendItems.append('text')
    .attr('x', 25)
    .attr('y', 15)
    .style('text-anchor', 'start')
    .text(function(d) {
        return d;
    });

}


SentimentDisplayChart.prototype.update = function(index){
    var self = this;
    self.storyIndex = index;
    self.displayEmotionChart(self.data,self.emotionIndex,self.storyIndex);
    let data = self.data;
    let svg = self.svg;

    //Code from A2 that displays information in the tooltip
    tip = d3.tip().attr('class', 'd3-tip')
        .direction('s')
        .offset(function(event, d) {
            return [0,0];
        })
        .html(function(event, d) {
            sentimentInfo = ""
            for(var i=0; i < d.Sentiment.length; i++) {
                sentimentInfo = sentimentInfo + "<br>" + d.Sentiment[i].label + ": " + String(parseFloat(d.Sentiment[i].score * 100).toFixed(2)) + "%"
            }
            let content = `${d.Sentence} <br> <br> Predicted Probabilities: ${sentimentInfo}`;
            return content;
        });

    self.svg.call(tip);

    let xScale = d3.scaleLinear()
    .domain([0,data[index].output.length * 20 + 20]) //Length of data times width of datapt. I just need to make sure the 20 is consistent in sizing
    .range([0,svg.node().getBoundingClientRect().width - 100])

    self.addLegend(svg, self.colorScale);
    
    console.log(data)

    //first just select each sentence
    let sentences = svg.selectAll(".sentence")
    .data(data[index].output)

    sentences = sentences.join("g")
    .attr("class", "sentence")
    .attr("transform", 'translate(100,0)')
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)

    sentences.exit().remove();
    //console.log(sentences)

    sentences.each(function(sentenceData, index) {
        //select the sentence's .sentiment rects and enter on the sentence's .Sentiment data
        var emotions = d3.select(this).selectAll(`.sentiment`)
            .data(sentenceData.Sentiment)
        //console.log(emotions)
        emotions.enter()
            .append("rect")
            .merge(emotions)
            .transition()
            .duration(1000)
            .attr("class", "sentiment")
            .attr("x", xScale(20 + 20 * index))
            .attr("y", function(d, i) {
                var value = 20;
                for(let j = 0; j < i; j++) {
                    value += 200 * sentenceData.Sentiment[j].score;
                }
                return value;
            })
            .attr("height", function(d) {
                return 200 * d.score;
            })
            .attr("width", xScale(20))
            .attr("fill", function(d) {
                return self.colorScale(d.label);
            })
            emotions.exit().remove();

    });
        

}
SentimentDisplayChart.prototype.displayEmotionChart = function(data, emotionIndex, storyIndex) {
    console.log(data)
    console.log(emotionIndex)
    console.log(storyIndex)
    var self = this;

    var svg = d3.select("#emotion-svg");

    let xScale = d3.scaleLinear()
    .domain([0,data[storyIndex].output.length * 20 + 20])
    .range([0,svg.node().getBoundingClientRect().width - 100])

    let sentences = svg.selectAll(".emotion-sentence")
    .data(data[storyIndex].output)

    sentences.enter()
    .append("rect")
    .merge(sentences)
    .transition()
    .duration(1000)
    .attr("x", function(d, i) {
        return xScale(20 + 20 * i)
    })
    .attr("y", function(d) {
        return 100 - (d.Sentiment[emotionIndex].score * 100);
    })
    .attr("height", function(d) {

        return 200 * d.Sentiment[emotionIndex].score;
    })
    .attr("width", xScale(20))
    .attr("fill", function(d) {
        return self.colorScale(d.Sentiment[emotionIndex].label);
    })
    .attr("class", "emotion-sentence")
    .attr("transform", 'translate(100,0)')
    
    sentences.exit().remove();

    

}