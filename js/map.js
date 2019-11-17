/** Class representing the map view. */
class Map {

    /**
     * Creates a Map Object
     *
     * @param data
     */
    constructor(data, selectionChanged) {
        this.data = data;
        this.selectedStates = [];
        this.maxSelectedStates = 10;
        this.selectionChangedCallback = selectionChanged;
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

        let projScale = 550;
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

    }
}