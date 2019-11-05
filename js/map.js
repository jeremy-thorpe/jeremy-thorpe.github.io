/** Class representing the map view. */
class Map {

    /**
     * Creates a Map Object
     *
     * @param data
     */
    constructor(data) {
        this.data = data;
        this.selectedStates = [];
    }

    drawMap(mapData)
    {
        let that = this;
        function mapClicked(data)
        {
            let clickedState = data.properties.NAME;
            if (that.selectedStates.includes(clickedState))
            {
                that.selectedStates.splice(that.selectedStates.indexOf(clickedState),1);
                d3.select("#map_" + clickedState).classed("selected", false);
            }
            else
            {
                that.selectedStates.push(clickedState);
                d3.select("#map_" + clickedState).classed("selected", true);
            }
            console.log(d3.select("#map_" + clickedState));
            console.log("Selected states: ", that.selectedStates);
        }

        let mapWidth = d3.select("#map-svg").attr("width");
        let mapHeight = d3.select("#map-svg").attr("height");
        console.log(mapWidth, mapHeight);
        let projection = d3.geoAlbersUsa().scale([300]).translate([150, 80]);

        console.log("drawing map", mapData);
        let path = d3.geoPath()
            .projection(projection);

        d3.select("#map-svg").selectAll("path").data(mapData.features)
            .join("path")
            .attr("id", d => "map_" + d.properties.NAME)
            .attr("class", "state")
            .style("stroke", "black")
            .style("stroke-width", "0.5px")
            .attr("d", path)
            .on("click", d => mapClicked(d));

    }
}