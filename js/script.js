let data = [1,2,3];    
let map = new Map(data)

// here we load the map data
d3.json('data/us_states.json').then(mapData => {
    map.drawMap(mapData);
});