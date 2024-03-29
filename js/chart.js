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
        this.year = 1969;

        this.width = +this.svg.node().getBoundingClientRect().width;
        this.height = +this.svg.node().getBoundingClientRect().height;

        let that = this;

        this.yTicks = chartId === "main-chart" ? 10 : 5;
        this.xTicks = chartId === "main-chart" ? 15 : 5;
        this.fontsize = chartId === "main-chart" ? 20 : 14;

        this.xAxisHeight = this.fontsize * 3;
        this.yAxisWidth = this.fontsize * 3.5;
        this.colCostFormat = function(d) {return parseInt(d/1000);};  

        this.xAxisLabel = this.svg.append("text")
			.text("Year")
			.attr("transform", "translate(" + (this.width/2) + "," + this.height + ")")
			.style("font-size", this.fontsize-2);    

        this.yAxisLabel = this.svg.append("text")
			.text("y label")
			.attr("transform", "rotate(-90) translate(" + (-this.height/2-15) + "," + this.fontsize + ")")
			.style("font-size", this.fontsize-2);

        this.xScale = d3
			.scaleLinear()
			.domain([1968, 2018])
			.range([0,this.width-this.yAxisWidth]);

        this.yScale = d3
			.scaleLinear()
			.domain([100, 0])
			.range([10,this.height-this.xAxisHeight]);

        this.yTicks = chartId === "main-chart" ? 10 : 5;
        this.xTicks = chartId === "main-chart" ? 15 : 5;
        this.colCostFormat = function(d) {return (d/1000).toPrecision(2);};                                          

        if (this.chartId !== "main-chart") {
            this.title = this.svg.append("text")
				.text("Graph Title")
				.attr("transform", "translate(" + (this.yAxisWidth+20) + "," + this.fontsize + ")")
				.style("font-size", this.fontsize+2);
        } else {
            this.title = d3.select("#main-chart-title");
        }

        this.xAxis = d3.axisBottom().scale(this.xScale).tickFormat(d3.format("d")).ticks(this.xTicks);
        this.yAxis = d3.axisLeft().scale(this.yScale).ticks(this.yTicks).tickFormat(this.yFormat);

        this.xAxisGroup = this.svg.append("g")
			.attr("transform", "translate(" + this.yAxisWidth + "," + (this.height-this.xAxisHeight) + ")")
			.attr("width", this.width-this.yAxisWidth)
			.style("font-size", this.fontsize);
      
        this.yAxisGroup = this.svg.append("g")
			.attr("height", this.height-this.xAxisHeight-10)
			.attr("transform", "translate(" + this.yAxisWidth +",0)")
			.style("font-size", this.fontsize-2) 
			.call(this.yAxis);

        this.xAxisGroup.call(this.xAxis)
			.selectAll("text")
			.attr("transform", "translate(" + (-(this.fontsize-2)) + "," + (this.fontsize-2) + ") rotate(-45)");

        this.svg.on("click", function(){
            that.swapChartCallback(that.name)
        });

        this.chartArea = this.svg.append("g")
			.attr("width", this.width - this.yAxisWidth)
			.attr("height", this.height - this.xAxisHeight)
			.attr("transform", "translate(" + this.yAxisWidth + ",0)");

        this.yearLine = this.svg.append("line")
			.style("stroke", "gray")
			.style("stroke-width", ".75px");

        this.fullTimeDesc = this.svg.append("text")
			.text("Full-Time")
			.attr("x", this.yAxisWidth + 3)
			.style("stroke", "gray")
			.style("font-size", "10")
			.style("visibility", "hidden");

        this.fullTimeLine = this.svg.append("line")
			.style("stroke", "gray")
			.style("stroke-width", ".75px")
			.style("visibility", "hidden");

        this.tooltip = this.svg.append("g")
			.attr("transform", "translate(" + (this.width-125) + "," + (this.height-this.xAxisHeight-22) + ")")
			.style("visibility", "hidden");
			
        this.tooltip.append("rect").attr("width", "120px")
			.attr("height", "20px")
			.style("stroke", "black")
			.style("fill", "lightsalmon")
			.style("opacity", "0.5");
			
        this.tooltip.append("text").text("Tooltip").attr("tooltip-text");
        this.tooltip.select("text").attr("transform", "translate(3,15)");

        if (that.chartId !== "main-chart") {
            this.svg
				.on("mousemove", function() {
					var id = that.chartId === "sub-chart1" ? "#arrow1" : "#arrow2";
					d3.select(id).style("visibility", "visible");
				})
				.on("mouseout", function(){
					var id = that.chartId === "sub-chart1" ? "#arrow1" : "#arrow2";
					d3.select(id).style("visibility", "hidden");
				});
        }

        this.states = [];
    }

    wrangleCostData(data, data_sub_type) {
        var costPoints = [];
        var returnData = [];
        for (let d of data) {
            costPoints.push([d["Year"], d[data_sub_type]]);
        }
        returnData.push({state:"Federal (FLSA)", data:costPoints});
        return returnData;
    }

    wrangleHoursData(data, data_sub_type) {
        var returnData = [];
        for (let yearData of data) {
            for (let stateData of yearData.hours) {
                let stateIndex = returnData.findIndex(d => d.state === stateData.state);
                if (stateIndex === -1) {
                    let pointData = [];
                    stateIndex = returnData.push({state:stateData.state, data:pointData}) - 1;
                }
                returnData[stateIndex].data.push([yearData.year, stateData[data_sub_type]]);  
            }
        }
        return returnData;
    }

    changeDataSubType(data_sub_type) {
        this.resetChart(this.name, this.dataset, data_sub_type)
    }

    resetChart(chartName, data, data_sub_type) {
        this.name = chartName;
        this.dataset = data;

        // reset title
        this.title.text(chartName);

        // reset data
        if (chartName === "Hours at Minimum Wage") {
            this.currentData = this.wrangleHoursData(data, data_sub_type);
        } else if (chartName === "Minimum Wage") {
            // minimum wage data should already be in the right format
            this.currentData = data;
        } else if (chartName === "College Cost") {
            this.currentData = this.wrangleCostData(data, data_sub_type);
        } else {
            console.log("No such data");
        }

        // redraw plot
        this.updateChart();
    }

    changeStates(states, colors) {
        this.lineColors = colors;
        this.states = states
        this.updateChart();
    }

    updateYear(year) {
        this.year = year;
        this.updateChart();
    }

    updateChart() {
        let that = this;
        var lineData;

        function getStateId(stateName) {
            return stateName.replace(' ', '');
        }

        if (this.currentData[0].state === undefined) {
            lineData = this.currentData;
        } else {
            lineData = this.currentData.filter(function(d){
                if (that.isFederalData(d.state)) return true; // always want federal chart
                return that.states.includes(getStateId(d.state));
            });
        }

        function getColorForState(state) {
            if (state === undefined) {
                return "black";
            }
			
            if (that.isFederalData(state)) {
                return "black";
            } else {
                return that.lineColors[that.states.indexOf(getStateId(state))];
            }
        }

        var max = 0;
        for (let d of lineData) {
            for (let y of d.data) {
                if (y[1] > max) {
                    max = y[1];
                }
            }
        }

        var format = d3.format("d");
        if (this.name === "Minimum Wage") {
            this.yAxisLabel.text("Wage ($)");
        } else if (this.name === "College Cost") {
            this.yAxisLabel.text("Cost ($ x 1000)")
            format = this.colCostFormat; 
        } else {
			// Hours Worked
            this.yAxisLabel.text("Hours");  
        }

        // reset y axis scale
        this.yScale = d3
			.scaleLinear()
			.domain([Math.ceil(max*1.15), 0])
			.range([10, this.chartArea.attr("height").replace("px", "")]);
        this.yAxis.scale(this.yScale).tickFormat(format).ticks(this.yTicks);
        this.yAxisGroup.transition().duration(500).call(this.yAxis);
      
        let lineGenerator = d3
			.line()
			.x(d => this.xScale(d[0]))
			.y(d => this.yScale(d[1]));
         
        this.chartArea.selectAll('path').data(lineData)
			.join('path')
			.on("mousemove", function(d) {
				if (that.chartId === "main-chart") {
					that.tooltip.style("visibility", "visible");
					// this is to move the tooltip to mouse position if we want
					// that.tooltip.attr("transform", "translate(" + (d3.mouse(this)[0]+50) + "," + (d3.mouse(this)[1]-25) + ")");
					that.tooltip.select("text").text(d.state);
					d3.select(this).style("stroke-width", "2px")
				}
			})
			.on("mouseout", function() {
				that.tooltip.style("visibility", "hidden");
				d3.select(this).style("stroke-width", "1px");
			})
			.transition()
			.duration(500)
			.attr('d', d => lineGenerator(d.data))
			.style('stroke', d => getColorForState(d.state))
			.style('opacity', d => that.isFederalData(d.state) ? '.7' : '1')
			.style("fill", "none");

        // update year line
        this.yearLine
			.attr("y1", this.height - this.xAxisHeight)
			.attr("y2", "0")
			.attr("x1", this.yAxisWidth + this.xScale(this.year))
			.attr("x2", this.yAxisWidth + this.xScale(this.year))

        if (this.name === "Hours at Minimum Wage") {
            this.fullTimeLine
				.transition()
				.duration(500)
				.attr("y1", this.yScale(40))
				.attr("y2", this.yScale(40))
				.attr("x1", this.yAxisWidth)
				.attr("x2", this.width)
				.style("visibility", "visible");

            this.fullTimeDesc
				.transition()
				.duration(500)
				.attr("y", this.yScale(40) - 5)
				.style("visibility", "visible");
        } else {
            this.fullTimeLine.style("visibility", "hidden");
            this.fullTimeDesc.style("visibility", "hidden");
        }
    }

    getChartName() {
        return this.name;
    }

    isFederalData(state) {
        return state === "Federal (FLSA)";
    }

}



