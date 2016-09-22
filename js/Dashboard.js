queue()
    .defer(d3.json, "./data/data.json")
    .await(makeGraphs);

function makeGraphs(error, apiData) {
  //Start Transformations
	var dataSet = apiData;
	dataSet.forEach(function(d) {
		d.nightly_price = Number(d.nightly_price.replace(/[^0-9\.]+/g,""));
    if(d.satisfaction_guest == null) { d.satisfaction_guest = 0 };
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(dataSet);

	//Define Dimensions
	var nightlyPrice = ndx.dimension(function(d) { return d.nightly_price; });
	var roomType = ndx.dimension(function(d) { return d.room_type; });
  var roomType2 = ndx.dimension(function(d) { return d.room_type; });
	var ratingCheckin = ndx.dimension(function(d) { return d.rating_checkin; });
	var satisfactionGuest = ndx.dimension(function(d) { return d.satisfaction_guest; });
	var responseTime = ndx.dimension(function(d) { return d.responseTime; });
	var personCapacity = ndx.dimension(function(d) { return d.person_capacity; });
	var ratingCleanliness  = ndx.dimension(function(d) { return d.rating_cleanliness; });
  var runDimension = ndx.dimension(function(d) {return [+d.rev_count, +d.satisfaction_guest]; });

	//Calculate metrics
	var propertiesByType = roomType.group();
  var propertiesByType2 = roomType2.group();
	var propertiesByRatings = ratingCheckin.group();
	var propertiesByGuests = satisfactionGuest.group();
	var propertiesByCapacity = personCapacity.group();
  var speedSumGroup = runDimension.group().reduceSum(function(d) { return d.rev_count; });

	var all = ndx.groupAll();

	//Calculate Groups
  var totalProperties;
	var totalProperties = ndx.groupAll().reduceSum(function(d) {
    totalProperties = totalProperties+1;
    return totalProperties;
	});

  var n_bins = 30;
  var xExtent = d3.extent(dataSet, function(d) { return d.nightly_price; });
  var binWidth = (xExtent[1] - xExtent[0]) / n_bins;
  var propertiesByPrice = nightlyPrice.group(function(d){return Math.floor(d / binWidth) * binWidth;});


	var totalTypes = roomType.group().reduceSum(function(d) {
		return d.room_type;
	});

	var totalRatings = ratingCheckin.group().reduceSum(function(d) {
		return d.rating_checkin;
	});

// 	//Define threshold values for data
// 	var minDate = datePosted.bottom(1)[0].date_posted;
// 	var maxDate = datePosted.top(1)[0].date_posted;
//
// console.log(minDate);
// console.log(maxDate);

    //Charts
  var totalnum = dc.numberDisplay("#total-properties");
  // var netDonations = dc.numberDisplay("#net-donations");
  var barChart = dc.barChart("#date-chart");
  var rowChartA = dc.rowChart("#grade-chart");
	var rowChartB = dc.rowChart("#resource-chart");
	var pieChart = dc.pieChart("#funding-chart");
	var scatterPlot = dc.scatterPlot("#poverty-chart");
	// var stateDonations = dc.barChart("#state-donations");


  selectField = dc.selectMenu('#menuselect')
        .dimension(roomType)
        .group(propertiesByType)

       dc.dataCount("#row-selection")
        .dimension(ndx)
        .group(all);


	totalnum
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);


	barChart
    .xUnits(function(){return n_bins;})
		// .width(600)
		.height(220)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(nightlyPrice)
		.group(propertiesByPrice)
		.transitionDuration(500)
    // .clipPadding(10)
    .centerBar(false)
    .x(d3.scale.linear().domain([0,300]))
    .elasticY(true)
    .yAxisLabel("Number of Properties")
		.xAxisLabel("Price")
    .xAxis().ticks(4);
		// .yAxis().ticks(6);

	rowChartB
        .width(300)
        .height(220)
        .dimension(personCapacity)
        .group(propertiesByCapacity)
        .elasticX(true)
        // .xAxis().ticks(5)
	scatterPlot
		//.width(300)
    .height(440)
    .x(d3.scale.linear().domain([0,150]))
    .y(d3.scale.linear().domain([60,100]))
    .symbolSize(8)
    .clipPadding(10)
    .yAxisLabel("Guest Satisfaction")
    .xAxisLabel("Number of Reviews")
    .dimension(runDimension)
    .group(speedSumGroup);

	rowChartA
		//.width(300)
		.height(440)
        .dimension(satisfactionGuest)
        .group(propertiesByGuests)
        .xAxis().ticks(4);
  //
  //


      pieChart
        .height(220)
        //.width(350)
        .radius(90)
        .innerRadius(40)
        .transitionDuration(1000)
        .dimension(roomType2)
        .group(propertiesByType2);
  //
  //
  //   stateDonations
  //   	//.width(800)
  //       .height(220)
  //       .transitionDuration(1000)
  //       .dimension(state)
  //       .group(totalDonationsState)
  //       .margins({top: 10, right: 50, bottom: 30, left: 50})
  //       .centerBar(false)
  //       .gap(5)
  //       .elasticY(true)
  //       .x(d3.scale.ordinal().domain(state))
  //       .xUnits(dc.units.ordinal)
  //       .renderHorizontalGridLines(true)
  //       .renderVerticalGridLines(true)
  //       .ordering(function(d){return d.value;})
  //
  //       .yAxis().tickFormat(d3.format("s"));






    dc.renderAll();

};
