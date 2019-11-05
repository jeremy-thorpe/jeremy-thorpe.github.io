loadData().then(data => {

    console.log(data);

    let map = new Map(data)
    let minWageChart = new Chart(data.wage);

    // here we load the map data
    map.drawMap(data.map);
    minWageChart.createChart();
});

async function loadFile(file) {
    let data = await d3.csv(file).then(d => {
        let mapped = d.map(g => {
            for (let key in g) {
                let numKey = +key;
                if (numKey) {
                    g[key] = +g[key];
                }
            }
            return g;
        });
        return mapped;
    });
    return data;
}

async function loadData()
{
    let wageData = await loadFile("data/min-wage.csv");
    let mapData = await d3.json('data/us_states.json');

    return {
        'map': mapData,
        'wage': wageData
    };
}


