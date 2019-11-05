/** Class representing the map view. */
class Map {

    /**
     * Creates a Map Object
     *
     * @param data
     */
    constructor(data) {
        console.log("what");
        this.data = data;
    }

    drawMap(mapData)
    {
        let mapWidth = d3.select("#map-svg").attr("width");
        let mapHeight = d3.select("#map-svg").attr("height");
        console.log(mapWidth, mapHeight);
        let projection = d3.geoAlbersUsa().scale([300]).translate([150, 80]);

        console.log("drawing map", mapData);
        let path = d3.geoPath()
            .projection(projection);

        d3.select("#map-svg").selectAll("path")
            .data(mapData.features)
            .join("path")
            .style("stroke", "black")
            .style("stroke-width", "0.5px")
            .style("fill", "none")
            .attr("d", path);
    }
}