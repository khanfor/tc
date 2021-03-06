var bardata = [];
var xs = [];

function getQueryStrings() { 
  var assoc  = {};
  var decode = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); };
  var queryString = location.search.substring(1); 
  var keyValues = queryString.split('&'); 

  for(var i in keyValues) { 
    var key = keyValues[i].split('=');
    if (key.length > 1) {
      assoc[decode(key[0])] = decode(key[1]);
    }
  } 

  return assoc; 
}

var qs = getQueryStrings();
var myParam = qs["projectId"]; 

var element = document.getElementById("header");
element.innerHTML += myParam;

d3.csv('data/30048038_handles_ratings.csv', function(data) {

	data.forEach(function (d) { 
		d.y = +d.y;
	});

	//console.log(data);

	/*data.sort(function(a, b) {
		return a.y - b.y;
	});*/

	//data = data.splice(0, data.length - 2);
	//data.splice(0, 20);

	for (key in data) {
		bardata.push(data[key].y)
		xs.push(data[key].x)
	}

	var margin = { top: 30, right: 30, bottom: 40, left: 50 };

	var height = 400 - margin.top - margin.bottom,
		width = 600 - margin.right - margin.left,
		barWidth = 50,
		barOffset = 5;

	var tempColor;

	var colors = d3.scale.linear()
					.domain([0, bardata.length])
					.range(['#FFB832','#C61C6F'])

	var yScale = d3.scale.linear()
					.domain([0, d3.max(bardata)])
					.range([0, height]);

	var xScale = d3.scale.ordinal()
					.domain(d3.range(0, bardata.length))
					.rangeBands([0, width], 0.3);


	var tooltip = d3.select('body').append('div')
					.style('position', 'absolute')
					.style('padding', '0 10px')
					.style('background', 'white')
					.style('opacity', '0')

	var myChart = d3.select('#chart').append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.style('background', '#C9D7D6')
		.append('g')
		.attr('transform', 'translate(' + margin.left + ', ' + margin.right + ')')
		.selectAll('rect').data(data)
		.enter().append('rect')
			.style('fill', function(d,i) {
				return colors(i)
			})
			.attr('width', xScale.rangeBand())
			.attr('x', function(d, i) {
				return xScale(i);
			})
			.attr('height', 0)
			.attr('y', height)
			.on('mouseover', function(d) {
				tooltip.transition()
					.style('opacity', .9)

				tooltip.html(d.x + ': ' + d.y + ' challenges')
					.style('left', (d3.event.pageX) + 'px')
					.style('top', (d3.event.pageY) + 'px')

				tempColor = this.style.fill;
				d3.select(this)
					.style('opacity', .5)
					.style('fill', 'yellow')
			})
			.on('mouseout', function(d) {
				d3.select(this)
					.style('opacity', 1)
					.style('fill', tempColor)
			})

	myChart.transition()
		.attr('height', function(d) {
			return yScale(d.y);
		})
		.attr('y', function(d) {
			return height - yScale(d.y);
		})
		.delay(function(d, i) {
			return i * 10;
		})
		.duration(1000)
		.ease('elastic')

	var vGuideScale = d3.scale.linear()
		.domain([0, d3.max(bardata)])
		.range([height, 0])

	var vAxis = d3.svg.axis()
					.scale(vGuideScale)
					.orient('left')
					.ticks(10)

	var vGuide = d3.select('svg').append('g')
	vAxis(vGuide)

	vGuide.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
	vGuide.selectAll('path')
		.style({fill: 'none', stroke: "#000"})
	vGuide.selectAll('line')
		.style({stroke: "#000"})

	var hAxis = d3.svg.axis()
					.scale(xScale)
					.orient('bottom')
					/*.tickValues(xScale.domain().filter(function(d, i) {
						return !(i % (bardata.length/5));
					}))*/
					.tickValues(xScale.domain())

	var hGuide = d3.select('svg').append('g')
	hAxis(hGuide)
	hGuide.attr('transform', 'translate(' + margin.left + ', ' + (height + margin.top) + ')')
	hGuide.selectAll('path')
		.style({fill: 'none', stroke: "#000"})
	hGuide.selectAll('line')
		.style({stroke: "#000"})
});