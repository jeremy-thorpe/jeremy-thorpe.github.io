// Append all svgs so size is dynamic
d3.select("#synopsis").append("svg").attr("id", "synopsis-svg").attr("width", "100%").attr("height", "35px");

let temp = d3.select("#bigchart").append("svg").attr("id", "main-chart-svg").attr("width", "100%");
temp.attr("height", (temp.node().getBoundingClientRect().width * 0.6));

d3.select("#map").append("svg").attr("id", "map-svg").attr("width", "100%").attr("height", "100%");

d3.select("#year").append("svg").attr("id", "slider-svg").attr("width", "100%").attr("height", "100%");
d3.select("#map-scale").append("svg").attr("id", "map-scale-svg").attr("width", "100%").attr("height", "100%");

temp = d3.select("#smallchart1").append("svg").attr("id", "sub-chart1-svg").attr("width", "100%");
temp.attr("height", (temp.node().getBoundingClientRect().width * 0.6));

temp = d3.select("#smallchart2").append("svg").attr("id", "sub-chart2-svg").attr("width", "100%");
temp.attr("height", (temp.node().getBoundingClientRect().width * 0.6));

var mainChart = new Chart("main-chart", swapChart);
var subChart1 = new Chart("sub-chart1", swapChart);
var subChart2 = new Chart("sub-chart2", swapChart);

var wageHeader = "Minimum Wage";
var costHeader = "College Cost";
var hoursHeader = "Hours Worked";

let story = new Story();
d3.csv("data/COL_Data.csv").then(d => {
	//d3.csv("data/events_data.csv").then(e => {
		story.createStory(d, /*e*/null);
		
	//}
});

// Callback function for the year slider to ensure charts and story update as the year changes
function updateYear(val) {
	story.updateStory(val);
	mainChart.updateChart();
	subChart1.updateChart();
	subChart2.updateChart();
}

function getDataByChartName(chartName)
{
    if (chartName === wageHeader)
    {
        return minimumWageData;
    }
    else if (chartName === costHeader)
    {
        return collegeCostData;
    }
    else if (chartName === hoursHeader)
    {
        return hoursWorkedData;
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

function statesChanged(newStates, lineColors)
{
    mainChart.changeStates(newStates, lineColors);
    subChart1.changeStates(newStates, lineColors);
    subChart2.changeStates(newStates, lineColors);
}

var minimumWageData = [];
var collegeCostData = [];
var hoursWorkedData = [];

loadData().then(data => {

    allData = data;
    console.log(data);

    let map = new Map(data, statesChanged, updateYear)
    map.drawMap(data.map);

    // wrangle wage data
    for (let w of data.wage)
    {
        var points = [];
        for (let i = 1968; i < 2019; ++i)
        {
            points.push([i, w[i]]);
        }
        var item = {state:w["State"], data:points};
        minimumWageData.push(item);
    }

    // wrangle cost data
    var costPoints = [];
    for (let c of data.cost)
    {
        costPoints.push([c["Year"], c["Total-All"]]);
    }
    var item = {state:"Federal (FLSA)", data:costPoints};
    collegeCostData.push(item);

    // wrangle hours data
    for (let yearData of data.hours)
    {
        for (let stateData of yearData.hours)
        {
            let stateIndex = hoursWorkedData.findIndex(d => d.state === stateData.state);
            if (stateIndex === -1)
            {
                let pointData = [];
                stateIndex = hoursWorkedData.push({state:stateData.state, data:pointData}) - 1;
            }
            hoursWorkedData[stateIndex].data.push([yearData.year, stateData["Total-All"]]);  
        }
    }

    console.log("Wage Data", minimumWageData);
    console.log("Cost Data", collegeCostData);
    console.log("Hours Data", hoursWorkedData);

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
    let costData = await d3.json('data/All-Current.json');
    let hourData = await d3.json('data/current_hours.json');

    return {
        'map': mapData,
        'wage': wageData,
        'scale': wageScale,
        'cost': costData,
        'hours': hourData
    };
}

