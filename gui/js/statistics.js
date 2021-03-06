// Create the dc.js chart objects & link to div
//var dataTable = dc.dataTable("#dc-table-graph");
var numRegistrantsChart = dc.barChart("#dc-numRegistrants-chart");
var numSubmissionsChart = dc.barChart("#dc-numSubmissions-chart");
var dayOfWeekChart = dc.rowChart("#dc-dayweek-chart");
var statusChart = dc.pieChart("#dc-status-chart");
var timeChart = dc.lineChart("#dc-time-chart");
var challengeTypeChart = dc.pieChart("#dc-challengeType-chart");

// load data from a csv file
d3.json("http://tcws.herokuapp.com/challenges", function (data) {

  var dtgFormat = d3.time.format("%Y-%m-%d");
  
  data.forEach(function(d, i, obj) { 
    d.numRegistrants = +d.numRegistrants;
    d.date = dtgFormat.parse(d.registrationStartDate);
  });

  // Run the data through crossfilter and load our 'facts'
  var facts = crossfilter(data);
  var all = facts.groupAll();

  // for registrants
  var numRegValue = facts.dimension(function (d) {
    return d.numRegistrants;       // add the magnitude dimension
  });
  var numRegValueGroupSum = numRegValue.group()
    .reduceSum(function(d) { return d.numRegistrants; });	// sums 
  var numRegValueGroupCount = numRegValue.group()
    .reduceCount(function(d) { return d.numRegistrants; }) // counts 

  // for submissions
  var numSubValue = facts.dimension(function (d) {
    return d.numSubmissions;
  });
  var numSubValueGroup = numSubValue.group()
    .reduceCount(function(d) { return d.numSubmissions; }) // counts 

  // time chart
  var volumeByDay = facts.dimension(function(d) {
    return d3.time.day(d.date);
  });
  var volumeByDayGroup = volumeByDay.group()
    .reduceCount(function(d) { return d.date; });

  // row chart Day of Week
  var dayOfWeek = facts.dimension(function (d) {
    var day = d.date.getDay();
    switch (day) {
      case 0:
        return "0.Sun";
      case 1:
        return "1.Mon";
      case 2:
        return "2.Tue";
      case 3:
        return "3.Wed";
      case 4:
        return "4.Thu";
      case 5:
        return "5.Fri";
      case 6:
        return "6.Sat";
    }
  });
  var dayOfWeekGroup = dayOfWeek.group();

  // Status Pie Chart
  var status = facts.dimension(function (d) {
      return d.status;
    });
  var statusGroup = status.group();

  // Challenge Type Pie Chart
  var challengeType = facts.dimension(function (d) {
      return d.challengeType;
  });
  var challengeTypeGroup = challengeType.group();

  // Setup the charts

  // count all the facts
  dc.dataCount(".dc-data-count")
    .dimension(facts)
    .group(all);
    
  // Magnitide Bar Graph Counted
  numRegistrantsChart.width(480)
    .height(150)
    .margins({top: 10, right: 10, bottom: 20, left: 40})
    .dimension(numRegValue)
    .group(numRegValueGroupCount)
    .transitionDuration(500)
    .centerBar(true)	
    .x(d3.scale.linear().domain([0, 50]))
    .elasticY(true)
    .xAxis().tickFormat();

  // Depth bar graph
  numSubmissionsChart.width(480)
    .height(150)
    .margins({top: 10, right: 10, bottom: 20, left: 40})
    .dimension(numSubValue)
    .group(numSubValueGroup)
    .transitionDuration(500)
    .centerBar(true)	
    .gap(1)  
    .x(d3.scale.linear().domain([0, 50]))
    .elasticY(true)
    .xAxis().tickFormat(function(v) {return v;});

  // time graph
  timeChart.renderArea(true)
    .width(960)
    .height(150)
    .transitionDuration(500)
    .margins({top: 10, right: 10, bottom: 20, left: 40})
    .dimension(volumeByDay)
    .group(volumeByDayGroup)
    //.mouseZoomable(true)
    .renderHorizontalGridLines(true)
    .elasticY(true)
    .x(d3.time.scale().domain(d3.extent(data, function(d) { return d.date; })))
    .xAxis();

  // row chart day of week
  dayOfWeekChart.width(300)
    .height(220)
    .margins({top: 5, left: 10, right: 10, bottom: 20})
    .dimension(dayOfWeek)
    .group(dayOfWeekGroup)
    .colors(d3.scale.category10())
    .label(function (d){
       return d.key.split(".")[1];
    })
    .title(function(d){return d.value;})
    .elasticX(true)
    .xAxis().ticks(4);

  // status pie chart
  statusChart.width(250)
    .height(220)
    .radius(100)
    .innerRadius(30)
    .dimension(status)
    .title(function(d){return d.key;})
    .group(statusGroup);

  // challenge type pie chart
  challengeTypeChart.width(250)
    .height(220)
    .radius(100)
    .innerRadius(30)
    .dimension(challengeType)
    .title(function(d){return d.key;})
    .group(challengeTypeGroup);

  // Render the Charts
  dc.renderAll();
  
});