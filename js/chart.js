/** Class representing a line chart. */
class Chart {

    /**
     * Creates a Chart Object
     *
     * @param[in] data - The data to use to draw the lines
     */
    constructor(data) {
        console.log("Chart Constructor", data);
        this.data = data;
    }

    createChart()
    {
        let chartWidth = d3.select("#main-chart-svg").attr("width");
        let chartHeight = d3.select("#main-chart-svg").attr("height");
        console.log(chartWidth, chartHeight);

        // set up axes
        let xScale = d3
        .scaleLinear()
        .domain([1968, 2018])
        .range([0,300]);

        let yScale = d3
        .scaleLinear()
        .domain([100, 0])
        .range([0,150]);

        d3.select("#main-chart-svg").append("g")
        .attr("id", "xAxis")
        .attr("transform", "translate(20,140)");
      
        d3.select("#main-chart-svg").append("g")
        .attr("id", "yAxis")
        .attr("transform", "translate(20,0)");

        let xAxis = d3.axisBottom();
        xAxis.scale(xScale);
        d3.select("#xAxis").call(xAxis);

        let yAxis = d3.axisLeft();
        yAxis.scale(yScale);
        d3.select("#yAxis").call(yAxis);
    }

    updateChart(states)
    {

    }

}



