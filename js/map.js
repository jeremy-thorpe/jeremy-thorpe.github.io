/** Class representing the map view. */
class Map {

    /**
     * Creates a Map Object
     *
     * @param data
     */
    constructor(data, selectionChanged, updateYear) {
        this.data = data;
        this.selectedStates = [];
        this.states = data.hours[0].hours.map(d => d.state).slice(1)
        // console.log("states", data.hours[0].hours.map(d => d.state).slice(1));

        this.maxSelectedStates = 10;
        this.selectionChangedCallback = selectionChanged;
        this.updateYear = updateYear;
        this.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        this.colorArray = [];
    }

    drawMap(mapData) {
        let that = this;

        function getStateId(stateName) {
            return stateName.replace(' ', '');
        }

        function reserveNextColor() {
            for (let i = 0; i < 10; ++i) {
                let color = that.colorScale(i);
                if (!that.colorArray.includes(color)) {
                    that.colorArray.push(color);
                    return color;
                }
            }
        }

        function mapClicked(data) {
            let clickedState = getStateId(data.properties.NAME);
            if (that.selectedStates.includes(clickedState)) {
                that.removeSelection(clickedState);
            } else {
                if (that.selectedStates.length < that.maxSelectedStates) {
                    that.selectedStates.push(clickedState);
                    d3.select("#map_" + clickedState).style("stroke", reserveNextColor()).style("stroke-width", "2").raise();
                }
            }
            that.selectionChangedCallback(that.selectedStates, that.colorArray);
        }

        // Scale the map based on the size of the svg
        let projScale = d3.select("#map-svg").node().getBoundingClientRect().width;
        let projection = d3.geoAlbersUsa().scale([projScale]).translate([projScale / 2, projScale / 4]);

        console.log("drawing map", mapData);
        let path = d3.geoPath()
            .projection(projection);

        d3.select("#map-svg").selectAll("path").data(mapData.features)
            .join("path")
            .attr("id", d => "map_" + getStateId(d.properties.NAME))
            .attr("class", "state")
            .style("stroke", "black")
            .style("stroke-width", "0.5px")
            .attr("d", path)
            .on("click", d => mapClicked(d));

        d3.select("#map-svg").selectAll("path").append('title')
        
        d3.select('#map-scale-svg')
            .append('g')
            .attr('id', 'legend')
            .append('g')
            .attr('id', 'legend-axis');

        this.setup();

    }
    
    removeSelection(state)
    {
        let index = this.selectedStates.indexOf(state);
        this.selectedStates.splice(index,1);
        this.colorArray.splice(index,1);
        d3.select("#map_" + state).style("stroke", "black").style("stroke-width", "0.5").lower();  
    }
    
    /**
     * Uses https://github.com/johnwalley/d3-simple-slider to create a discrete year slider and dropdown callbacks.
     */
    setup() {
        let that = this;
        let width = d3.select("#slider-svg").node().getBoundingClientRect().width;

        // Time
        var dataTime = d3.range(0, 51).map(function (d) {
            return new Date(1968 + d, 10, 3);
        });
        
        var sliderTime = d3
            .sliderBottom()
            .min(d3.min(dataTime))
            .max(d3.max(dataTime))
            .step(1000 * 60 * 60 * 24 * 365)
            .width(width - 60)
            .ticks(0)
            .handle(
                d3.symbol()
                .type(d3.symbolCircle)
                .size(200)()
            )
            .on('onchange', val => {
                d3.select('.parameter-value text')
                    .classed('slider-label', true)
                    .text(d3.timeFormat('%Y')(val));

                that.updateHeatMap(+d3.timeFormat('%Y')(val), d3.select("#map-dropdown").select("select").property("value"));
                that.updateYear(d3.timeFormat('%Y')(val));
            });

        var gTime = d3
            .select('#slider-svg')
            .append('g')
            .attr('id', 'slider')
            .attr('transform', 'translate(30, 10)');

        gTime.call(sliderTime);

        d3.select('.parameter-value text')
            .classed('slider-label', true)
            .text(d3.timeFormat('%Y')(sliderTime.value()));

        d3.select("#map-dropdown")
            .on("change", function () {
                that.updateHeatMap(+d3.timeFormat('%Y')(sliderTime.value()), d3.select(this).select("select").property("value"), d3.select("#map-sub-dropdown").select("select").property("value"))
            })

        d3.select("#map-sub-dropdown")
            .on("change", function () {
                that.updateHeatMap(+d3.timeFormat('%Y')(sliderTime.value()), d3.select("#map-dropdown").select("select").property("value"), d3.select(this).select("select").property("value"))
            })

        this.updateHeatMap(+d3.timeFormat('%Y')(sliderTime.value()), d3.select("#map-dropdown").select("select").property("value"))

    }

    /**
     * Updates the heat map for the given year.
     * @param {number} year 
     */
    updateHeatMap(year, data_type, sub_type = "Total-All") {
        let data;
        let interpolateFunc;
        
        if (data_type === "hours" && year !== 2018) {
            d3.select("#map-sub-dropdown").style("opacity", 1);
            interpolateFunc = d3.interpolateYlOrRd;
            data = new Object();
            data.year = year;
            data.data = [];

            for (const hours of this.data.hours.filter(d => d.year === year)[0].hours) {
                data.data.push({
                    state: hours.state,
                    datum: hours[sub_type]
                });

            }
        } else if (data_type === "wage") {
            d3.select("#map-sub-dropdown").style("opacity", 0);
            interpolateFunc = d3.interpolateYlGn;
            data = new Object()
            data.year = year;
            data.data = [];

            for (const wage of this.data.wage) {
                data.data.push({
                    state: wage.State,
                    datum: wage[year]
                });
            }
        } else if (data_type === "none") {
            d3.select("#map-sub-dropdown").style("opacity", 0);
            data = new Object();
        } else {
            console.log("No such data.");
            data = new Object();
        }

        let scaleSvg = d3.select("#map-scale-svg");
        
        if (Object.entries(data).length !== 0 || data.constructor !== Object) {
            let fed = data.data[0];
            data = data.data.slice(1);

            scaleSvg.style("opacity", 1);

            var legendHeight = scaleSvg.node().getBoundingClientRect().height,
                legendWidth = scaleSvg.node().getBoundingClientRect().width,
                margin = {
                    top: 10,
                    right: 50,
                    bottom: 10,
                    left: 2
                };

            // Color scale
            var colorScale = d3.scaleSequential(interpolateFunc)
                .domain([d3.min(data.map(d => d.datum)), d3.max(data.map(d => d.datum))]);

            var legendScale = d3.scaleLinear()
                .range([legendHeight - 30, 0])
                .domain([d3.min(data.map(d => d.datum)), d3.max(data.map(d => d.datum))])
                .nice();

            var legendAxis = d3.axisRight()
                .scale(legendScale)
                .tickSize(0);

            scaleSvg
                .selectAll(".fed-wage-line")
                .data([fed])
                .join("line")
                    .classed("fed-wage-line", true)
                    .style("stroke", "black")
                    .style("opacity", 1)
                    .transition()
                    .duration(200)
                    .attr("x1", 0)
                    .attr("x2", legendWidth - margin.left - margin.right)
                    .attr("y1", d => legendScale(d.datum))
                    .attr("y2", d => legendScale(d.datum))
                    .attr("transform", `translate(${0}, ${margin.top})`)

            scaleSvg
                .selectAll(".fed-wage-text")
                .data([fed])
                .join("text")
                    .classed("fed-wage-text", true)
                    .html("FLSA")
                    .style("opacity", 1)
                    .transition()
                    .duration(200)
                    .attr("x", 1)
                    .attr("y", d => legendScale(d.datum))
                    .attr("transform", `translate(0, ${margin.top - 4})`)



            scaleSvg.select('#legend-axis')
                .attr("transform", "translate(" + (legendWidth - margin.left - margin.right + 2) + "," + (margin.top) + ")")
                .transition()
                .duration(200)
                .call(legendAxis);

            //Append a defs (for definition) element to your SVG

            scaleSvg.select('defs').remove();
            
            var defs = scaleSvg
                .selectAll('defs')
                .data([0])
                .join('defs')

            scaleSvg.selectAll('#legend rect').remove();

            //Append a linearGradient element to the defs and give it a unique id
            var linearGradient = defs.selectAll('linearGradient').data([0]).join("linearGradient")
                .attr("id", "linear-gradient");

            // Vertical gradient
            linearGradient
                .attr("x1", "0%")
                .attr("y1", "100%")
                .attr("x2", "0%")
                .attr("y2", "0%");

            linearGradient.selectAll("stop")
                .data(colorScale.ticks().map((t, i, n) => ({
                    offset: `${100*i/n.length}%`,
                    color: colorScale(t)
                })))
                .enter().append("stop")
                    .attr("offset", d => d.offset)
                    .attr("stop-color", d => d.color);

            //Draw the rectangle and fill with gradient
            scaleSvg.select('#legend')
                .selectAll("rect")
                .data([0])
                .join("rect")
                    .attr("width", 30)
                    .attr("height", legendHeight - 30)
                    .attr('transform', `translate(0, ${margin.top})`)
                    .style("fill", "url(#linear-gradient)");

            // Color states
            for (const item of data) {
                let state = item.state.replace(' ', '');

                d3.select("#map_" + state)
                    .style('fill', colorScale(item.datum))
                    .select('title')
                    .html(`${item.datum.toFixed(2)}hrs`)
            }
        } else {
            scaleSvg.style("opacity", 0);

            for (const st of this.states) {
                let state = st.replace(' ', '');

                d3.select("#map_" + state)
                    .style('fill', 'white')
                    .select('title')
                    .html(`${st}`)
            }
        }
    }
    
    /**
    * Clears all highlighted states from map
    *
    */
    clearMap() {
        while (this.selectedStates.length > 0)
        {
            this.removeSelection(this.selectedStates[0]);
        }
    }
}