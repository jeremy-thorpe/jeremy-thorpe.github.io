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
        this.maxSelectedStates = 50;
        this.selectionChangedCallback = selectionChanged;
    }

    drawMap(mapData)
    {
        let that = this;

        function getStateId(stateName)
        {
            return stateName.replace(' ', '');
        }

        function mapClicked(data)
        {
            let clickedState = getStateId(data.properties.NAME);
            if (that.maxSelectedStates === 1)
            {
                that.selectedStates = [clickedState];
            }
            else if (that.selectedStates.includes(clickedState))
            {
                that.selectedStates.splice(that.selectedStates.indexOf(clickedState),1);
                d3.select("#map_" + clickedState).classed("selected", false);
            }
            else
            {
                if (that.selectedStates.length < that.maxSelectedStates)
                {
                    that.selectedStates.push(clickedState);
                    d3.select("#map_" + clickedState).classed("selected", true);
                }
            }
            that.selectionChangedCallback(that.selectedStates);
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