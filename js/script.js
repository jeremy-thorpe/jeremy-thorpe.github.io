var mainChart = new Chart("main-chart", swapChart);
var subChart1 = new Chart("sub-chart1", swapChart);
var subChart2 = new Chart("sub-chart2", swapChart);

var wageHeader = "Minimum Wage";
var costHeader = "College Cost";
var hoursHeader = "Hours Worked";

function getDataByChartName(chartName)
{
    return minimumWageData; // remove this line once cost and hours are ready
    if (chartName === wageHeader)
    {
        return allData.wage;
    }
    else if (chartName === costHeader)
    {
        return allData.cost;
    }
    else if (chartName === hoursHeader)
    {
        return allData.hours;
    }
    return null;
}

function swapChart(chartName)
{
    let currentChartName = mainChart.getChartName();
    if (chartName === currentChartName)
    {
        // this is already the main chart
        return;
    }
    else if (chartName === subChart1.getChartName())
    {
        // swap main-chart with sub-chart1
        mainChart.resetChart(chartName, getDataByChartName(chartName));
        subChart1.resetChart(currentChartName, getDataByChartName(currentChartName));
    }
    else if (chartName === subChart2.getChartName())
    {
        // swap main-chart with sub-chart2
        mainChart.resetChart(chartName, getDataByChartName(chartName));
        subChart2.resetChart(currentChartName, getDataByChartName(currentChartName));
    }
    else
    {
        // something went wrong, do nothing
        return;
    }
}

var minimumWageData;

loadData().then(data => {

    allData = data;
    console.log(data);

    let map = new Map(data)
    map.drawMap(data.map);

    let wage = data.wage;
    var wage_data = [];
    console.log(wage);
    for (let w of wage)
    {
        var points = [];
        for (let i = 1968; i < 2019; ++i)
        {
            points.push([i, w[i]]);
        }
        var item = {state:w["State"], data:points};
        wage_data.push(item);
    }
    minimumWageData = wage_data;

    mainChart.resetChart(hoursHeader, getDataByChartName(hoursHeader));
    subChart1.resetChart(costHeader, getDataByChartName(costHeader));
    subChart2.resetChart(wageHeader, getDataByChartName(wageHeader));

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
    let wageScale = await loadFile("data/wage-scale.csv");
    let mapData = await d3.json('data/us_states.json');

    return {
        'map': mapData,
        'wage': wageData,
        'scale': wageScale
    };
}


