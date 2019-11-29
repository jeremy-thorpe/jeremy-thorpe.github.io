// Append all svgs so size is dynamic
d3.select("#synopsis").append("svg").attr("id", "synopsis-svg").attr("width", "100%").attr("height", "35px");

let temp = d3.select("#bigchart").append("svg").attr("id", "main-chart-svg").attr("width", "100%");
temp.attr("height", (temp.node().getBoundingClientRect().width * 0.6));

d3.select("#map").append("svg").attr("id", "map-svg").attr("width", "100%").attr("height", "100%");

d3.select("#year").append("svg").attr("id", "slider-svg").attr("width", "100%").attr("height", "60px");
d3.select("#map-scale").append("svg").attr("id", "map-scale-svg").attr("width", "100%").attr("height", "100%");

temp = d3.select("#smallchart1").append("svg").attr("id", "sub-chart1-svg").attr("width", "100%");
temp.attr("height", (temp.node().getBoundingClientRect().width * 0.6));

temp = d3.select("#smallchart2").append("svg").attr("id", "sub-chart2-svg").attr("width", "100%");
temp.attr("height", (temp.node().getBoundingClientRect().width * 0.6));

d3.select("#clear-button").on("click", clearStates);

var arrowData = [[0, 15], [10,21], [10, 18], [26, 18], [26, 12], [10,12], [10,9], [0,15]];
var lineGenerator = d3.line();
var arrowPath = lineGenerator(arrowData);

let midChartArea = d3.select(".grid-switch");

midChartArea.append("svg").attr("width", "30px").attr("height", "30px").attr("id", "arrow1").style("visibility", "hidden")
.append("path")
.attr("d", arrowPath)
.style("fill", "coral")
.style("stroke", "black")
.attr("transform", "rotate(105) translate(-6, -40)");

midChartArea.append("text").text("Actual");
midChartArea.append("label")
.attr("class", "switch");
d3.select(".switch")
.append("input")
.attr("id", "toggle-button")
.attr("type", "checkbox")
.attr("transform", "translate(0, -100)");
d3.select(".switch")
.append("span")
.classed("slider", true)
.classed("round", true);
midChartArea.append("text").text("Normalized");

midChartArea.append("svg").attr("width", "30px").attr("height", "30px").attr("id", "arrow2").style("visibility", "hidden")
.append("path")
.attr("d", arrowPath)
.style("fill", "coral")
.style("stroke", "black")
.attr("transform", "rotate(80) translate(3, -30)");

// charts
var mainChart = new Chart("main-chart", swapChart);
var subChart1 = new Chart("sub-chart1", swapChart);
var subChart2 = new Chart("sub-chart2", swapChart);

var map;

// data
var allData;
var data_type = "hours";
var data_sub_type = undefined;
var selected_year = 1969;
var actWageData = [];
var normWageData = [];

// data headers
var wageHeader = "Minimum Wage";
var costHeader = "College Cost";
var hoursHeader = "Hours Worked";
var normalized = false;

let story = new Story();
d3.csv("data/COL_Data.csv").then(d => {
    d3.csv("data/events.csv").then(e => {
        story.createStory(d, e);
    })
});

d3.select("#toggle-button").on("change", function()
{
    normalized = d3.select("#toggle-button").property("checked");
    mainChart.resetChart(mainChart.name, getDataByChartName(mainChart.name), data_sub_type);
    subChart1.resetChart(subChart1.name, getDataByChartName(subChart1.name), data_sub_type);
    subChart2.resetChart(subChart2.name, getDataByChartName(subChart2.name), data_sub_type);
});

d3.select("#data-dropdown").on("change", function()
{
    data_type = d3.select(this).select("select").property("value");
    map.updateHeatMap(selected_year, data_type, data_sub_type);
});

d3.select("#data-sub-dropdown").on("change", function()
{
    data_sub_type = d3.select(this).select("select").property("value");
    map.updateHeatMap(selected_year, data_type, data_sub_type);
    mainChart.changeDataSubType(data_sub_type);
    subChart1.changeDataSubType(data_sub_type);
    subChart2.changeDataSubType(data_sub_type);
});

// Callback function for the year slider to ensure charts and story update as the year changes
function updateYear(year) {
    selected_year = year;
    story.updateStory(year);
    mainChart.updateYear(year);
    subChart1.updateYear(year);
    subChart2.updateYear(year);
    map.updateHeatMap(year, data_type, data_sub_type);
}

function getDataByChartName(chartName)
{
    if (chartName === wageHeader)
    {
        return normalized ? normWageData : actWageData;
    }
    else if (chartName === costHeader)
    {
        return normalized ? allData.costN : allData.costA;
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
        mainChart.resetChart(chartName, getDataByChartName(chartName), data_sub_type);
        subChart1.resetChart(currentChartName, getDataByChartName(currentChartName), data_sub_type);
    }
    else if (chartName === subChart2.getChartName())
    {
        // swap main-chart with sub-chart2
        mainChart.resetChart(chartName, getDataByChartName(chartName), data_sub_type);
        subChart2.resetChart(currentChartName, getDataByChartName(currentChartName), data_sub_type);
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

loadData().then(data => {
    allData = data;
    map = new Map(data, statesChanged, updateYear)
    map.drawMap(data.map);
    map.updateHeatMap(selected_year, data_type, data_sub_type);

    // wrangle wage data
    let inflationscale = data.scale;
    for (let w of data.wage)
    {
        var points = [];
        var normalizedPoints = [];
        for (let i = 1968; i < 2019; ++i)
        {
            points.push([i, w[i]]);
            normalizedPoints.push([i, (inflationscale[2018-1960].Scale/inflationscale[i-1960].Scale) * w[i]]);
        }
        actWageData.push({state:w["State"], data:points});
        normWageData.push({state:w["State"], data:normalizedPoints});
    }

    mainChart.resetChart(hoursHeader, getDataByChartName(hoursHeader), data_sub_type);
    subChart1.resetChart(costHeader, getDataByChartName(costHeader), data_sub_type);
    subChart2.resetChart(wageHeader, getDataByChartName(wageHeader), data_sub_type);
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
    let normalizedCostData = await d3.json('data/All-Constant.json');
    let actualCostData = await d3.json('data/All-Current.json');
    let hourData = await d3.json('data/current_hours.json');

    return {
        'map': mapData,
        'wage': wageData,
        'scale': wageScale,
        'costN': normalizedCostData,
        'costA' : actualCostData,
        'hours': hourData
    };
}

function clearStates() {
    console.log(map);
    map.clearMap();
    
    mainChart.resetChart(hoursHeader, getDataByChartName(hoursHeader), data_sub_type);
    subChart1.resetChart(costHeader, getDataByChartName(costHeader), data_sub_type);
    subChart2.resetChart(wageHeader, getDataByChartName(wageHeader), data_sub_type);
}
