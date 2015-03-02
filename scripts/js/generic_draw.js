/*
 *  Copyright (c) 2014-2015, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

//Global variables

//Store specific chart configurations as user inputs data
var svgID;
var svg;
var width = 900;
var height = 550;
var topVal = 30;
var bottom = 0;
var left = 120;
var right = 120;
var duration = 750,
    delay = 25;
var xAxis;
var yAxis;
var y;
var x;
var barSize = 30;
var color;

var dataTable = {
    "metadata":{
        "names":["Country","Province","City","Area","GDP","Inflation","Life.expect","Military","Pop.growth","Unemployment","Revenue"],
        "types":['C', 'C','C', 'N', 'N', 'N', 'N', 'N','N']
    },
    "data": [
        ["Austria","provinceAusOne","cityAusOne",41935.5,20800,1.75,39.955,0.4,0.015,2.1],
        ["Austria","provinceAusTwo","cityAusTwo",41935.5,20800,1.75,39.955,0.4,0.015,2.1],
        ["Belgium","provinceBel","cityBelOne",30528,37800,3.5,79.65,1.3,0.06,7.2],
        ["Bulgaria","provinceBul","cityBulOne",110879,13800,4.2,73.84,2.6,-0.8,9.6],
        ["Croatia","provinceCro","cityCroOne",56594,18000,2.3,75.99,2.39,-0.09,17.7],
        ["Czech Republic","provinceCzech","cityCzechOne",78867,27100,1.9,77.38,1.15,-0.13,8.5],
        ["Denmark","provinceDen","cityDenOne",43094,37000,2.8,78.78,1.3,0.24,6.1],
        ["Estonia","provinceEst","cityEstOne",45228,20400,5,73.58,2,-0.65,12.5],
        ["Finland","provinceFin","cityFinOne",338145,36000,3.3,79.41,2,0.07,7.8],
        ["Germany","provinceGer","cityGerOne",357022,38100,2.5,80.19,1.5,-0.2,6],
        ["Greece","provinceGree","cityGreeceOne",131957,26300,3.3,80.05,4.3,0.06,17.4],
        ["Hungary","provinceHun","cityHunOne",93028,19600,3.9,75.02,1.75,-0.18,10.9],
        ["Iceland","provinceIce","cityIceOne",103000,38100,4,81,0,0.67,7.4],
        ["Ireland","provinceIre","cityIreOne",70273,40800,2.6,80.32,0.9,1.11,14.4],
        ["Italy","provinceIta","cityItaOne",301340,30500,2.9,81.86,1.8,0.38,8.4],
        ["Latvia","provinceLat","cityLatOne",64589,16800,4.4,72.93,1.1,-0.6,12.8]

    ]
}

    var rowValues = new Array();
    var columnValues = new Array();

    $(document).on('change', '.input-row-group-multiple-select:last-child select', function(){
          addselectedOption('row','.input-row-group-multiple-select:last-child select',dataTable,rowValues);
    });

    $(document).on('change', '.input-row-group-multiple-select:not(:last-child) select', function(){
        updateValues('row');
    });

    $(document).on('click', '.input-row-group-addon-remove', function(){
        $(this).parent().remove();
        updateValues('row');
    });

    $(document).on('change', '.input-column-group-multiple-select:last-child select', function(){
        addselectedOption('column','.input-column-group-multiple-select:last-child select',dataTable,columnValues);
    });

    $(document).on('change', '.input-column-group-multiple-select:not(:last-child) select', function(){
        updateValues('column');
    });

    $(document).on('click', '.input-column-group-addon-remove', function(){
        $(this).parent().remove();
        updateValues('column');
    });

    $(document).ready(function() {
        initializeGraphics();
    });


function addselectedOption(selectionType,id,dataSet,typeArray){


    var selectsLength = $('.input-'+selectionType+'-group-multiple-select select').length;
    var optionsLength = ($(id).find('option').length)-1;

    var selectedVal = 0;

    $('.input-'+selectionType+'-group-multiple-select select').each(function(){
        var value = $(this).val();

        if(value != 0 && value != ""){
            selectedVal = value;
        }
    });
    $(id).parent().addClass(selectionType + 'uniqueNum' + selectedVal).removeClass(selectionType + 'uniqueNum');

    if(selectsLength < optionsLength){

        var sInputGroupHtml = $(id).parent().html();
        var sInputGroupClasses = $(id).parent().attr('class');

        var classes = sInputGroupClasses.split(' ');

        var uniqueClas = "";

        for(i=0;i<classes.length;i++){

            if(classes[i].indexOf("uniqueNum") > -1){
                uniqueClas += selectionType + 'uniqueNum ' ;
            } else {
                uniqueClas += classes[i] +' ';
            }

        }
        $(id).parent().parent().append('<div class="'+uniqueClas+'">'+sInputGroupHtml+'</div>');
    }
    updateValues(selectionType,dataSet,typeArray);
}

function updateValues(selectionType,dataSet,values){

    values = new Array();
    var comboBoxClassName = '.input-'+selectionType+'-group-multiple-select select';

    $(comboBoxClassName).each(function(){
        var value = $(this).val();
        if(value != 0 && value != ""){
            values.push(value);
        }
    });

    $(comboBoxClassName).find('option').each(function(){
        var optionValue = $(this).val();
        var selectValue = $(this).parent().val();

        if(in_array(optionValue,values)!= -1 && selectValue != optionValue)
        {
            $(this).attr('disabled', 'disabled');
        }
        else
        {
            $(this).removeAttr('disabled');
        }
    });

    if(selectionType == "row"){
        rowValues = values;
    } else if(selectionType == "column"){
        columnValues = values;
    }
    constructPlotData(selectionType,dataSet,comboBoxClassName);
}

function in_array(optionVal, valueArr){
    var length = valueArr.length;

    for (var i=0 ; i<length ; i++) {

        if (valueArr[i] == optionVal) {
            return i;
        }
    }
    return -1;
}

function initializeGraphics(){

    var divId = '#chart';
    svgID = divId.replace("#","")+"_svg";
    width = width - left - right;
    height = height - topVal;
    //Remove current SVG if it is already there
    d3.select(svgID).remove();

    svg = d3.select(divId)
        .append("svg")
        .attr("id", svgID)
        .attr("width", width + left + right)
        .attr("height", height + topVal + 50)
        .append("g")
        .attr("transform", "translate(" + (left - 60) + "," + 0 + ")");
    svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
        .attr("fill","white")
        .on("click", drillUp);
    svg.append("g")
        .attr("class", "y axis");
    svg.append("g")
        .attr("class", "x axis");

    initializeChartConfigurations(dataTable)
}

function initializeChartConfigurations(data) {
    createSelectFeildWithNames(data, 'C', "selectColumnsId");
    createSelectFeildWithNames(data, 'N', "selectRowsId");
}

function constructPlotData(dataType,dataSet,className){

    if($(".input-row-group-multiple-select option:selected").val() !="" && $(".input-column-group-multiple-select option:selected").val() !=""){
        var selectedRowAttrName = $('.rowuniqueNum' +rowValues[0]+' select option[value='+rowValues[0]+']').text();
        var namesLength = dataSet.metadata.names.length;
        var rowPositionInDataSet;
        var columnPositionsInDataSet = [];

        for (var i = 0; i < namesLength; i++) {					//Loop numDataPoints times

            if(dataSet.metadata.names[i] == selectedRowAttrName){
                rowPositionInDataSet = i;
            }

            for(var z=0; z<columnValues.length;z++){

                if(dataSet.metadata.names[i] == $('.columnuniqueNum' +columnValues[z]+' select option[value='+columnValues[z]+']').text()){
                    columnPositionsInDataSet.push(i);
                }
            }
        }

        var constructedSelectedData = constructSelectedDataSet(columnPositionsInDataSet,rowPositionInDataSet,dataSet.data);
        drawChart(constructedSelectedData);
    }
}

function drawChart(dataMap){

    d3.select(svgID).remove();
    var heirarchy = convertToHeirachy(dataMap);
    var partition = d3.layout.partition()
        .value(function(d) { return d.size; });

    partition.nodes(heirarchy);
    color = d3.scale.ordinal()
        .range(["steelblue", "#ccc"]);
    x = d3.scale.linear()
        .range([0, width]);
    y = d3.scale.linear()
        .range([height, topVal]);
    xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
    yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    y.domain([0, heirarchy.value]).nice();

    drillDown(heirarchy, 0);
}

function convertToHeirachy(dataMap){

    var data = dataMap.map(function(d) {
        return d.toString().split(",");
    });
    var working = {};

    for (var i = 0; i < data.length; i++) {
        addToHeirarchy(data[i], 0, working);
    }

    var heirarchy = {
        "name" : "ROOT",
        "children" : remapHeirarchy(working)
    };

    return heirarchy;
}

function addToHeirarchy(val, level, heirarchy) {
    if (val[level]) {
        if (!heirarchy.hasOwnProperty(val[level])) {
            heirarchy[val[level]] = {};
        }
        addToHeirarchy(val, level + 1, heirarchy[val[level]]);
    }
}

function remapHeirarchy(item) {

    var children = [];

    for (var k in item) {

        if ( !isNaN(k)) {
            return k;
        }

        if(!isNaN(remapHeirarchy(item[k]))){

            children.push({
                "name" : k,
                "size" : remapHeirarchy(item[k])
            });
        } else {
            children.push({
                "name" : k,
                "children" : remapHeirarchy(item[k])
            });
        }

    }
    return children;
}

function constructSelectedDataSet(columnData,rowData,dataSet){

    var plotArray = new Array();
    for(var i=0;i < dataSet.length;i++){
        plotArray[i] = new Array();
        for(var z=0;z<dataSet[i].length;z++){
            for(var cnt =0; cnt < columnData.length; cnt++){
                if(columnData[cnt] == z){
                    plotArray[i].push(dataSet[i][z]);
                }
            }
        }
    }

    for(var i=0;i<dataSet.length;i++){

        for(var z=0;z<dataSet[i].length;z++){

            if(rowData == z){
                plotArray[i].push(dataSet[i][z]);
                break;
            }
        }
    }
    return plotArray;
}

function createSelectFeildWithNames(data, type,formID) {

    var selectedNames = [];	//Initialize empty array
    var namesLength = data.metadata.names.length;
    for (var i = 0; i < namesLength; i++) {					//Loop numDataPoints times
        if(data.metadata.types[i] == type){
            selectedNames.push({ "name":dataTable.metadata.names[i], "index":i});
        }
    }
    $.each(selectedNames, function (index, value) {
        $('#'+formID+'').append("<option value='" +(index + 1)+ "'>" + value.name + "</option>");

    });
}

function drillDown(root, index) {

    if (!root.children) return;
    var end = duration + root.children.length * delay;
    var exit = svg.selectAll(".enter")
        .attr("class", "exit");
    var enter;
    var enterTransition;
    enter = bar(root,svg,y)
        .attr("transform", stack(index,y))
        .style("opacity", 1);

    // Color the bars as parents; they will fade to children if appropriate.
    enter.select("text").style("fill-opacity", 1e-6);
    enter.select("rect").style("fill", color(true));

    // Update the y-scale domain.
    y.domain([0, d3.max(root.children, function(d) { return d.value; })]).nice();

    // Update the y-axis.
    svg.selectAll(".y.axis").transition()
        .duration(duration)
        .call(yAxis);

    // Update the x-axis.
    svg.selectAll(".x.axis")
        .append("line")
        .attr("x1", "86%")
        .attr("transform","translate(0,"+height+")");

    // Transition entering bars to their new position.
    enterTransition = enter.transition()
        .duration(duration)
        .delay(function(d, i) { return i * delay; })
        .attr("transform", function(d, i) { return "translate("+ barSize * i * 1.2 +",0)"; });

    // Transition entering text.
    enterTransition.select("text")
        .style("fill-opacity", 1);

    // Transition entering rects to the new y-scale.
    enterTransition.select("rect")
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .style("fill", function(d) { return color(!!d.children); });

    // Transition exiting bars to fade out.
    var exitTransition = exit.transition()
        .duration(duration)
        .style("opacity", 1e-6)
        .remove();

    // Rebind the current node to the background.
    svg.select(".background")
        .datum(root)
        .transition()
        .duration(end);

    root.index = index;
}


function drillUp(d) {

    if (!d.parent) return;
    var end = duration + d.children.length * delay;
    // Mark any currently-displayed bars as exiting.
    var exit = svg.selectAll(".enter")
        .attr("class", "exit");
    // Enter the new bars for the clicked-on data's parent.
    var enter = bar(d.parent,svg,y)
        .attr("transform", function(d, i) { return "translate("+ barSize * i * 1.2 +",0)"; })
        .style("opacity", 1e-6);
    // Color the bars as appropriate.
    // Exiting nodes will obscure the parent bar, so hide it.
    enter.select("rect")
        .style("fill", function(d) { return color(!!d.children); })
        .filter(function(p) { return p === d; })
        .style("fill-opacity", 1e-6);

    // Update the y-scale domain.
    y.domain([0, d3.max(d.parent.children, function(d) { return d.value; })]).nice();

    // Update the y-axis.
    svg.selectAll(".y.axis").transition()
        .duration(duration)
        .call(yAxis);

    // Transition entering bars to fade in over the full duration.
    var enterTransition = enter.transition()
        .duration(end)
        .style("opacity", 1);

    // Transition entering rects to the new y-scale.
    // When the entering parent rect is done, make it visible!
    enterTransition.select("rect")
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .each("end", function(p) { if (p === d) d3.select(this).style("fill-opacity", null); });

    // Transition exiting bars to the parent's position.
    var exitTransition = exit.selectAll("g").transition()
        .duration(duration)
        .delay(function(d, i) { return i * delay; })
        .attr("transform", stack(d.index,y));

    // Transition exiting text to fade out.
    exitTransition.select("text")
        .style("fill-opacity", 1e-6);

    // Transition exiting rects to the new scale and fade to parent color.
    exitTransition.select("rect")
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .style("fill", color(true));

    // Remove exiting nodes when the last child has finished transitioning.
    exit.transition()
        .duration(end)
        .remove();

    // Rebind the current parent to the background.
    svg.select(".background")
        .datum(d.parent)
        .transition()
        .duration(end);
}

function bar(d,svg,y) {

    var bar = svg.insert("g", ".x.axis")
        .attr("class", "enter")
        .selectAll("g")
        .data(d.children)
        .enter().append("g")
        .style("cursor", function(d) { return !d.children ? null : "pointer"; })
        .on("click", drillDown);

    bar.append("text")
        .attr("x", -214)
        .attr("y", 148)
        .attr("dy", "0.99em")
        .attr("dx", "-20.8em")
        .attr("transform", function(d) {
            return "rotate(-73)"
        })
        .style("text-anchor", "end")
        .text(function(d) { return d.name; });

    bar.append("rect")
        .attr("width", barSize);
    return bar;
}

function stack(i,y) {
    var z0 = 0;
    var tz;
    return function(d) {
        tz = "translate(" + barSize * i * 1.2 + "," + z0 + ")";
        z0 += y(d.value);
        return tz;
    };
}


