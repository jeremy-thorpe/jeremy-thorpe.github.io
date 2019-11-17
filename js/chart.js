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

        this.width = +this.svg.node().getBoundingClientRect().width;
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

        this.yTicks = chartId === "main-chart" ? 10 : 5;
        this.xTicks = chartId === "main-chart" ? 15 : 5;
        this.fontsize = chartId === "main-chart" ? 16 : 10;
        this.minWageFormat = function(d) {return "$" + d; };
        this.colCostFormat = function(d) {return "$" + parseInt(d/1000) + "k";};                                          

        this.title = this.svg.append("text")
        .text("Graph Title")
        .attr("transform", "translate(" + (this.width/2-10) + ",12)")
        .style("font-size", this.fontsize);

        this.xAxis = d3.axisBottom().scale(this.xScale).tickFormat(d3.format("d")).ticks(this.xTicks);
        this.yAxis = d3.axisLeft().scale(this.yScale).ticks(this.yTicks).tickFormat(this.yFormat);

        this.xAxisGroup = this.svg.append("g")
        .attr("transform", "translate(30," + (this.height-30) + ")")
        .attr("width", this.width-20);
      
        this.yAxisGroup = this.svg.append("g")
        .attr("height", this.height-20)
        .attr("transform", "translate(30,25)")
        .call(this.yAxis);

        this.xAxisGroup.call(this.xAxis)
        .selectAll("text")
        .attr("transform", "translate(-10,10) rotate(-45)");
        
        this.svg.on("dblclick", function(){
            that.swapChartCallback(that.name)
        });

        this.chartArea = this.svg.append("g")
        .attr("width", this.width - 25)
        .attr("height", this.height - 25)
        .attr("transform", "translate(30, 25)");

        this.states = [];
    }

    resetChart(chartName, data)
    {
        this.name = chartName;

        // reset title
        this.title.text(chartName);

        // reset y axis scale
        // not sure if we want to derive this or hard-code it based on name
        if (chartName === "Minimum Wage")
        {
            this.yScale = d3
            .scaleLinear()
            .domain([18, 0])
            .range([0, this.chartArea.attr("height").replace("px", "") - 30]);
            this.yAxis.scale(this.yScale).tickFormat(this.minWageFormat).ticks(this.yTicks);
            this.yAxisGroup.call(this.yAxis);
        }
        else if (chartName === "College Cost")
        {
            this.yScale = d3
            .scaleLinear()
            .domain([25000, 0])
            .range([0, this.chartArea.attr("height").replace("px", "") - 30]);
            this.yAxis.scale(this.yScale).tickFormat(this.colCostFormat).ticks(this.yTicks);
            this.yAxisGroup.call(this.yAxis);        }
        else // Hours Worked
        {
            this.yScale = d3
            .scaleLinear()
            .domain([140, 0])
            .range([0, this.chartArea.attr("height").replace("px", "") - 30]);
            this.yAxis.scale(this.yScale).tickFormat(d3.format("d")).ticks(this.yTicks);
            this.yAxisGroup.call(this.yAxis);        }

        // reset data
        this.data = data;
        console.log("Setting data for " + chartName, this.data);

        // redraw plot
        this.updateChart();
    }

    changeStates(states, colors)
    {
        this.lineColors = colors;
        this.states = states
        this.updateChart();
    }

    updateChart()
    {
        let that = this;
        var lineData;

        function getStateId(stateName)
        {
            return stateName.replace(' ', '');
        }

        if (this.data[0].state === undefined)
        {
            lineData = this.data;
        }
        else
        {
            lineData = this.data.filter(function(d){
                if (that.isFederalData(d.state)) return true; // always want federal chart
                return that.states.includes(getStateId(d.state));
            });
            lineData.push(lineData.shift()); // this moves the federal to the end so it gets drawn on top
        }

        function getColorForState(state)
        {
            if (state === undefined)
            {
                return "black";
            }
            if (that.isFederalData(state))
            {
                return "black";
            }
            else
            {
                return that.lineColors[that.states.indexOf(getStateId(state))];
            }
        }
        
        let lineGenerator = d3
        .line()
        .x(d => this.xScale(d[0]))
        .y(d => this.yScale(d[1]));
         
        this.chartArea.selectAll('path').data(lineData)
        .join('path')
        .attr('d', d => lineGenerator(d.data))
        .style('stroke', d => getColorForState(d.state))
        .style('opacity', d => that.isFederalData(d.state) ? '.7' : '1')
        .style("fill", "none");
    }

    getChartName()
    {
        return this.name;
    }

    isFederalData(state)
    {
        return state === "Federal (FLSA)";
    }

}



