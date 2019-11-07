/** Class representing a line chart. */
class Chart {

    /**
     * Creates a Chart Object
     *
     * @param[in] chartId - The chart this is for (either main-chart, sub-chart1, or sub-chart2)
     * @param[in] swapChartCallback - The callback for if a user swaps the big chart
     */
    constructor(chartId, swapChartCallback) {
        this.chartId = chartId;
        this.name = "";
        this.swapChartCallback = swapChartCallback;
        this.svg = d3.select("#" + chartId + "-svg");

        this.width = this.chartId === "main-chart" ? 500 : 200;
        this.height = this.chartId === "main-chart" ? 300 : 125;

        this.xScale = d3
        .scaleLinear()
        .domain([1968, 2018])
        .range([0,this.width-20]);

        this.yScale = d3
        .scaleLinear()
        .domain([100, 0])
        .range([0,this.height-40]);

        let that = this;

        this.title = this.svg.append("text")
        .text("Graph Title")
        .attr("transform", "translate(" + (this.width/2-10) + ",12)")
        .style("font-size", this.chartId === "main-chart" ? 16 : 10);

        this.xAxis = this.svg.append("g")
        .attr("transform", "translate(25," + (this.height-30) + ")")
        .attr("width", this.width-20);
      
        this.yAxis = this.svg.append("g")
        .attr("height", this.height-20)
        .attr("transform", "translate(25,10)")
        .call(d3.axisLeft().scale(this.yScale));

        this.xAxis.call(d3.axisBottom()
        .scale(this.xScale)
        .tickFormat(d3.format("d")))
        .selectAll("text")
        .attr("transform", "translate(-10,10) rotate(-45)");
        
        this.svg.on("dblclick", function(){
            that.swapChartCallback(that.name)
        });
    }

    resetChart(chartName, data)
    {
        this.data = data;
        this.name = chartName;

        // reset title
        this.title.text(chartName);

        // reset y axis scale

        // reset data
    }

    updateChart(states)
    {

    }

    getChartName()
    {
        return this.name;
    }

}



