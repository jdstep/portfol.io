/* Backbone view for the graph view
find more information on mbostock's page for charting line charts: http://bl.ocks.org/mbostock/3883245 */

var GameStockView = Backbone.View.extend({

  className: 'graph col-xs-4 col-md-4',

  initialize: function() {
    this.model.on('sync edited remove reset', this.render, this);
    var context = this;
    $(window).on("resize", function() {
      context.render.apply(context);
    });
    //this.render();
  },

  // creates an array of data (of length sampleSize)
  getStockData: function() {

    // number of samples in the data array
    var sampleSize = 365;

    var rawData = this.model.getTrajectory();
    if (rawData.length <= sampleSize) {
      return rawData;
    } else {
      var result = [], increment = rawData.length / sampleSize;
      for (var i = 0; i < rawData.length; i += increment) {
        var index = Math.floor(i);
        result.push(rawData[index]);
        // if (results.length === sampleSize) return results;
      }
      return result;
    }
  },
  drawStockLine: function() {

    // time to each new data point, in ms
    var clockSpeed = 300;

    // array of data for one stock in the collection
    var stockData = this.getStockData();
    console.log("stock data is: ", stockData);

    // number of data points to show at a time
    var n = 20;
    
    // first n points of data
    var data = stockData.splice(0, 20);

    var margin = {top: 20, right: 20, bottom: 20, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .domain([0, n - 1])
        .range([0, width]);

    //y-axis scaled in standard linear format ($ values)
    var y = d3.scale.linear()
        .range([height, 0]);
        // .nice();

    //set y-domain to min and max stock $ ranges
    y.domain([
       d3.min(stockData, function(d) { return d.value; }),
       d3.max(stockData, function(d) { return d.value; })
     ]);

    // line generation function
    var line = d3.svg.line()
        .x(function(d, i) { return x(i); })
        .y(function(d, i) { return y(d.value); });

    // append svg and axes to graph container
    var svg = d3.select('.graph').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", width)
        .attr("height", height);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + y(0) + ")")
        .call(d3.svg.axis().scale(x).orient("bottom"));

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.svg.axis().scale(y).orient("left"));


    var path = svg.append("g")
        .attr("clip-path", "url(#clip)")
      .append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);


    var tick = function() {

      // push a new data point onto the back
      data.push(stockData.shift());

      // redraw the line, and slide it to the left
      path
          .attr("d", line)
          .attr("transform", null)
        .transition()
          .duration(clockSpeed)
          .ease("linear")
          .attr("transform", "translate(" + x(-1) + ",0)")
          .each('end', function(){
            // pop the old data point off the front
            data.shift();
            tick();
          });
    };

    tick();

  },

  render: function() {
    this.$el.empty(); 
    this.drawStockLine();
    return this.$el;
  }

});
