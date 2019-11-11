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

        this.width = +this.svg.attr("width").replace("px", "");
        this.height = +this.svg.attr("height").replace("px", "");

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
        .attr("transform", "translate(25,25)")
        .call(d3.axisLeft().scale(this.yScale));

        this.xAxis.call(d3.axisBottom()
        .scale(this.xScale)
        .tickFormat(d3.format("d")))
        .selectAll("text")
        .attr("transform", "translate(-10,10) rotate(-45)");
        
        this.svg.on("dblclick", function(){
            that.swapChartCallback(that.name)
        });

        this.chartArea = this.svg.append("g")
        .attr("width", this.width - 25)
        .attr("height", this.height - 25)
        .attr("transform", "translate(25, 25)");

        this.states = ["California"];
    }

    resetChart(chartName, data)
    {
        this.name = chartName;

        // reset title
        this.title.text(chartName);

        // reset y axis scale
        // not sure if we want to derive this or hard-code it based on name
        this.yScale = d3
        .scaleLinear()
        .domain([18, 0])
        .range([0, this.chartArea.attr("height").replace("px", "") - 30]);

        this.yAxis.call(d3.axisLeft().scale(this.yScale));

        // reset data
        this.data = data;

        // redraw plot
        this.updateChart();
    }

    changeStates(states)
    {
        this.states = states
        this.updateChart();
    }

    updateChart()
    {
        let that = this;
        let stateData = this.data.filter(function(d){
            if (that.isFederalData(d)) return true; // always want federal chart
            return that.states.includes(d.state);
        });

        let lineGenerator = d3
        .line()
        .x(d => this.xScale(d[0]))
        .y(d => this.yScale(d[1]));
         
        this.chartArea.selectAll('path').data(stateData)
        .join('path')
        .attr('d', d => lineGenerator(d.data))
        .style('stroke',d => that.isFederalData(d) ? "black" : "blue")
        .style("fill", "none");

        // draw line for federal

        // draw line for all selected states
    }

    getChartName()
    {
        return this.name;
    }

    isFederalData(data)
    {
        return data.state === "Federal (FLSA)";
    }

}



