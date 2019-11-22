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
        this.maxSelectedStates = 10;
        this.selectionChangedCallback = selectionChanged;
        this.updateYear = updateYear;
        this.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        this.colorArray = [];
    }

    drawMap(mapData)
    {
        let that = this;

        function getStateId(stateName)
        {
            return stateName.replace(' ', '');
        }

        function removeSelection(state)
        {
            let index = that.selectedStates.indexOf(state);
            that.selectedStates.splice(index,1);
            that.colorArray.splice(index,1);
            d3.select("#map_" + state).style("stroke", "black").style("stroke-width", "1").lower();  
        }

        function reserveNextColor()
        {
            for (let i = 0; i < 10; ++i)
            {
                let color = that.colorScale(i);
                if (!that.colorArray.includes(color))
                {
                    that.colorArray.push(color);
                    return color;
                }
            }
        }

        function mapClicked(data)
        {
            let clickedState = getStateId(data.properties.NAME);
            if (that.selectedStates.includes(clickedState))
            {
                removeSelection(clickedState);
            }
            else
            {
                if (that.selectedStates.length < that.maxSelectedStates)
                {
                    that.selectedStates.push(clickedState);
                    d3.select("#map_" + clickedState).style("stroke", reserveNextColor()).style("stroke-width", "2").raise();
                }
            }
            that.selectionChangedCallback(that.selectedStates, that.colorArray);
        }

        // Scale the map based on the size of the svg
        let projScale = d3.select("#map-svg").node().getBoundingClientRect().width;
        let projection = d3.geoAlbersUsa().scale([projScale]).translate([projScale/2, projScale/4]);

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
    
            this.drawSlider();
    
        }
    
        /**
         * Uses https://github.com/johnwalley/d3-simple-slider to create a discrete year slider.
         */
        drawSlider(){
            let that = this;
            let width = d3.select("#slider-svg").node().getBoundingClientRect().width;

            // Time
            var dataTime = d3.range(0, 51).map(function(d) {
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
    
                    that.updateHeatMap(+d3.timeFormat('%Y')(val), "hours");
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
    
            this.updateHeatMap(+d3.timeFormat('%Y')(sliderTime.value()), "hours")
    
        }
    
        /**
         * Updates the heat map for the given year.
         * @param {number} year 
         */
        updateHeatMap(year, data_type){
            // expand to include other datasets     
            let data;
            if (data_type === "hours"){
                data = this.data.hours;
            }
            else if (data_type === "wage"){
                data = this.data.wage;
            }
            else if (data_type === "cost"){
                data = this.data.cost;
            }
            else{
                console.log("No such data.");
                return;
            }
            let yearData = this.data.hours.filter(d => {
                return d.year === year;
            });
    
    
            if (yearData[0]){
                yearData = yearData[0].hours.slice(1);
    
                //console.log(yearData.map(d => d['Total-All']));
                var legendHeight = d3.select("#map-scale-svg").node().getBoundingClientRect().height,
                    legendWidth = d3.select("#map-scale-svg").node().getBoundingClientRect().width,
                    margin = {top: 10, right: 50, bottom: 10, left: 2};
                
                // Color scale
                var colorScale = d3.scaleSequential(d3.interpolateCool)
                    .domain([d3.min(yearData.map(d => d['Total-All'])), d3.max(yearData.map(d => d['Total-All']))]);
    
                var legendScale = d3.scaleLinear()
                    .range([legendHeight - 100, 0])
                    .domain([d3.min(yearData.map(d => d['Total-All'])), d3.max(yearData.map(d => d['Total-All']))])
                    .nice();
    
                var legendAxis = d3.axisRight()
                    .scale(legendScale)
                    .tickSize(0);
    
                d3.select("#map-scale-svg").select('#legend-axis')
                    .attr("transform", "translate(" + (legendWidth - margin.left - margin.right + 2) + "," + (margin.top) + ")")
                    .call(legendAxis)
                    .call(g => g.select(".domain").remove());
    
                //Append a defs (for definition) element to your SVG
                var defs = d3.select("#map-scale-svg")
                    .selectAll('defs')
                    .data([0])
                    .join('defs')
                    
    
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
                    .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorScale(t) })))
                    .enter().append("stop")
                    .attr("offset", d => d.offset)
                    .attr("stop-color", d => d.color);
    
                //Draw the rectangle and fill with gradient
                d3.select("#map-scale-svg").select('#legend')
                    .selectAll("rect")
                    .data([0])
                    .join("rect")
                        .attr("width", 30)
                        .attr("height", legendHeight - 100)
                        .attr('transform', `translate(0, ${margin.top})`)
                        .style("fill", "url(#linear-gradient)");
    
                // Color states
                for (const hours of yearData) {
                    let state = hours.state.replace(' ', '');
                    
                    d3.select("#map_" + state)
                        .style('fill', colorScale(hours['Total-All']))
                        .select('title')
                        .html(`${hours['Total-All'].toFixed(2)}hrs`)
                }
            }
        }
}