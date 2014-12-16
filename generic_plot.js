/**
 * Created by srinath on 12/13/14.
 */

/**
 * IGViz = Interactive Generic Visualization
 * Following object holds all the state
 * @type {Object}
 */

var igViz = new Object();
igViz.setDataTable = function(dataTable) {
    this.dataTable = dataTable;
}


igViz.plot = function(divId, chartConfig) {
    if ("scatter" == chartConfig.chartType) {
        drawScatterPlot(divId, chartConfig, this.dataTable)
    } else if ("bar" == chartConfig.chartType) {
        drawBarChart(divId, chartConfig, this.dataTable)
    }else{
        console.error("Unknown chart type "+ chartConfig.chartType);
        return;
    }
}

function drawScatterPlot(divId, chartConfig, dataTable) {
    //Width and height
    var w = chartConfig.chartWidth;
    var h = chartConfig.chartHight;
    var padding = chartConfig.padding;

    //prepare the dataset (all plot methods should use { "data":dataLine, "config":chartConfig } format
    //so you can use util methods
    var dataset = dataTable.data.map(function(d) {
        return { "data":d, "config":chartConfig}
    });

    var plotCtx = createScales(dataset, chartConfig, dataTable);
    var xScale = plotCtx.xScale;
    var yScale = plotCtx.yScale;
    var rScale = plotCtx.rScale;
    var colorScale = plotCtx.colorScale;

    var svgID = divId+"_svg";
    //Remove current SVG if it is already there
    d3.select(svgID).remove();

    //Create SVG element
    var svg = d3.select(divId)
        .append("svg")
        .attr("id", svgID.replace("#",""))
        .attr("width", w)
        .attr("height", h);
    svg.append("rect")
        .attr("x", 0).attr("y", 0)
        .attr("width", w).attr("height", h)
        .attr("fill", "rgba(222,235,247, 0.5)")

    createXYAxises(svg, plotCtx, chartConfig, dataTable);

    //Now we really drwa by creating circles. The layout is done such a way that (0,0)
    // starts from bottom left corner as usual.
    var group1 = svg.append("g")
        .attr("id", "circles")
        .selectAll("g")
        .data(dataset)
        .enter()
        .append("g");
    configurePoints(group1, xScale, yScale, rScale, colorScale);
    configurePointLabels(group1, xScale, yScale);
}

function drawBarChart(divId, chartConfig, dataTable) {
    var width = chartConfig.chartWidth;
    var height = chartConfig.chartHight;
    var padding = chartConfig.padding;

    var dataset = dataTable.data.map(function(d) {
        return { "data":d, "config":chartConfig}
    });

    var plotCtx = createScales(dataset, chartConfig, dataTable);
    var xScale = plotCtx.xScale;
    var yScale = plotCtx.yScale;


    var svgID = divId+"_svg";
    //Remove current SVG if it is already there
    d3.select(svgID).remove();


    var svg = d3.select(divId)
        .append("svg")
        .attr("id", svgID.replace("#",""))
        .attr("width", width)
        .attr("height", height);

    createXYAxises(svg, plotCtx, chartConfig, dataTable);

    //Now we really drwa by creating rectangles. The layout is done such a way that (0,0)
    // starts from bottom left corner as usual.
    //TODO handle multiple column groups using color
    //http://bl.ocks.org/mbostock/3887051
    svg.selectAll(".bar")
        .data(dataset)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {
            //console.log(d.data[d.config.xAxisData]);
            return xScale(d.data[d.config.xAxisData]);
        })
        .attr("width", xScale.rangeBand())
        .attr("y", function(d) { return  yScale(d.data[d.config.yAxisData]); })
        .attr("height", function(d) { return height - yScale(d.data[d.config.yAxisData]) - padding; });
}


/**
 * Util Methods
 */

/**
 * Creates correct scales based on x,y axis data columns, this leaving padding space around in SVG.
 * @param dataset
 * @param chartConfig
 * @param dataTable
 * @returns {{xScale: *, yScale: *, rScale: *, colorScale: *}}
 */
function createScales(dataset, chartConfig, dataTable){
    //Create scale functions

    var xScale;
    var yScale;
    if(dataTable.metadata.types[chartConfig.xAxisData] == 'N'){
        xScale = d3.scale.linear()
            .domain([0, d3.max(dataset, function(d) { return d.data[d.config.xAxisData]; })])
            .range([chartConfig.padding, chartConfig.chartWidth - chartConfig.padding]);
    }else{
        xScale = d3.scale.ordinal()
            .domain(dataset.map(function(d) { return d.data[chartConfig.xAxisData]; }))
            .rangeRoundBands([chartConfig.padding, chartConfig.chartWidth - chartConfig.padding], .1)
    }

    //TODO hanle case r and color are missing

    if(dataTable.metadata.types[chartConfig.yAxisData] == 'N'){
        yScale = d3.scale.linear()
            .domain([0, d3.max(dataset, function(d) { return d.data[d.config.yAxisData]; })])
            .range([chartConfig.chartHight - chartConfig.padding, chartConfig.padding]);
        //var yScale = d3.scale.linear()
        //    .range([height, 0])
        //    .domain([0, d3.max(dataset, function(d) { return d.data[d.config.yAxisData]; })])
    }else{
        yScale = d3.scale.ordinal()
            .rangeRoundBands([0, chartConfig.chartWidth], .1)
            .domain(dataset.map(function(d) { return d.data[chartConfig.yAxisData]; }))
    }


    //this is used to scale the size of the point, it will value between 0-20
    var rScale = d3.scale.linear()
        .domain([0, d3.max(dataset, function(d) { return d.config.pointSize?d.data[d.config.pointSize]:20; })])
        .range([0, 20]);

    //TODO have to handle the case color scale is categorical
    //http://synthesis.sbecker.net/articles/2012/07/16/learning-d3-part-6-scales-colors
    // add color to circles see https://www.dashingd3js.com/svg-basic-shapes-and-d3js
    //add legend http://zeroviscosity.com/d3-js-step-by-step/step-3-adding-a-legend
    var colorScale = d3.scale.linear()
        .domain([-1, d3.max(dataset, function(d) { return d.config.pointColor?d.data[d.config.pointColor]:20; })])
        .range(["blue", "green"]);

    //TODO add legend

    return { "xScale":xScale, "yScale":yScale, "rScale":rScale, "colorScale":colorScale }
}

/**
 * Create XY axis and axis labels
 * @param svg
 * @param plotCtx
 * @param chartConfig
 * @param dataTable
 */

function createXYAxises(svg, plotCtx, chartConfig, dataTable) {
    var w = chartConfig.chartWidth;
    var h = chartConfig.chartHight;
    var padding = chartConfig.padding;

    //Define X axis
    var xAxis = d3.svg.axis()
        .scale(plotCtx.xScale)
        .orient("bottom")
        .ticks(5);

    //Define Y axis
    var yAxis = d3.svg.axis()
        .scale(plotCtx.yScale)
        .orient("left")
        .ticks(5);

    //Create X axis
    var axis = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xAxis);

    //if categroical, we slant the text
    if(dataTable.metadata.types[chartConfig.xAxisData] == 'C'){
        axis.selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)"
            });
    }

    axis.append("text")
        .style("font-size", "20px")
        .attr("y", 20)
        .attr("x", w - padding/5)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(dataTable.metadata.names[chartConfig.xAxisData]);


    //Create Y axis
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (padding) + ",0)")
        .call(yAxis)
        .append("text")
        .style("font-size", "20px")
        .attr("y", 6)
        .attr("x", -10)
        .attr("transform", "rotate(-90)")
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(dataTable.metadata.names[chartConfig.yAxisData]);
}


/**
 * Configure a point and set size and color
 * @param group1
 * @param xScale
 * @param yScale
 * @param rScale
 * @param colorScale
 */
function configurePoints(group1, xScale, yScale, rScale, colorScale) {
    //TODO have to handle the case color scale is categorical
    group1.append("circle")
        .attr("cx", function(d) {
            return xScale(d.data[d.config.xAxisData]);
        })
        .attr("cy", function(d) {
            return yScale(d.data[d.config.yAxisData]);
        })
        .attr("r", function(d) {
            if(d.config.pointSize != -1){
                return rScale(d.data[d.config.pointSize]);
            }else{
                return 2;
            }
        })
        .style("fill", function(d) {
            if (d.config.pointColor != -1) {
                return colorScale(d.data[d.config.pointColor]);
            } else {
                return 2;
            }
        });
}


/**
 * Methods for the base.html
 */
/**
 * Add text to each point
 * @param group1
 * @param xScale
 * @param yScale
 */

function configurePointLabels(group1, xScale, yScale) {
    //TODO make this nicer
    group1.append("text")
        .attr("x", function(d) {
            return xScale(d.data[d.config.xAxisData]);
        })
        .attr("y", function(d) {
            return yScale(d.data[d.config.yAxisData]) - 10;
        })
        .style("font-family", "sans-serif")
        .style("font-size", "10px")
        .style("text-anchor", "middle")
        .text(function(d) {
            if(d.config.pointLabel != -1){
                return d.data[d.config.pointLabel];
            }else{
                return "3";
            }
        });
}

function redrawClicked(formID, targetChartId) {
    var form = document.getElementById(formID)
    //-1 means that dimension is disabled
    var chartConfig = {
        "title":"Title",
        "xLog":false,
        "yLog":false,
        "xAxisData":form.xAxis.value,
        "yAxisData":form.yAxis.value,
        "pointColor":form.pointColor.value,
        "pointSize":form.pointSize.value,
        "pointLabel":0,
        "chartWidth":600,
        "chartHight":400,
        "padding":60,
        "chartType":targetChartId.replace("#","")
    }

    igViz.plot(targetChartId, chartConfig);
}

function createForm(dataTable, formID, chartType) {
    if(chartType == "scatter") {
        createSelectFeildWithColumnNames("xAxis", dataTable, 'N', formID);
        createSelectFeildWithColumnNames("yAxis", dataTable, 'N', formID);
        createSelectFeildWithColumnNames("pointColor", dataTable, 'N', formID);
        createSelectFeildWithColumnNames("pointSize", dataTable, 'N', formID);
    }else if (chartType == "bar"){
        createSelectFeildWithColumnNames("xAxis", dataTable, 'C', formID);
        createSelectFeildWithColumnNames("yAxis", dataTable, 'N', formID);
        createSelectFeildWithColumnNames("pointColor", dataTable, 'C', formID);
        //here - means select nothing
        createSelectFeildWithColumnNames("pointSize", dataTable, '-', formID);
    }else{
        console.error("Unknown chart type "+ chartType)
    }
}

function createSelectFeildWithColumnNames(name, dataTable, type, formID) {
    //TODO populate feidls
    var selectedNames = [];											//Initialize empty array
    var namesLength = dataTable.metadata.names.length;										//Number of dummy data points to create
    for (var i = 0; i < namesLength; i++) {					//Loop numDataPoints times
        if(dataTable.metadata.types[i] == type || type == 'A'){
            selectedNames.push({ "name":dataTable.metadata.names[i], "index":i});
        }
    }

    var form = d3.select(formID);
    form.append("text")
        .text(name);

    var select = form.append("select");
    select.attr("name", name)
        .selectAll("option")
        .data(selectedNames)
        .enter().append("option")
            .attr("value", function(d) {
            return d.index;
        })
        .text(function(d) {
            return d.name;
        });

    select.append("option")
        .attr("value","-1")
        .text("Node");
    form.append("br");
}

