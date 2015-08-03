var Sleuthcharts = {};


Sleuthcharts = (function(Sleuthcharts) 
{
	
	Sleuthcharts.allCharts = [];
	
	
	$.fn.sleuthcharts = function () 
	{
		var args = arguments;
		var options;
		var ret;
		var chart;
		
		
		if (this[0]) 
		{


			options = args[0];

			// Create the chart
			if (typeof options !== "undefined") 
			{
				//console.log(options);
				chart = new Sleuthcharts.Chart(options);
				ret = chart;
			}

			if (typeof options === "undefined") 
			{
				var index = $(this).attr('data-sleuthcharts');
				ret = Sleuthcharts.allCharts[index];
			}
		}
		
		return ret;
	};
	
	
	
	Sleuthcharts.getChart = function($node)
	{
		var allCharts = this.allCharts;
		var len = allCharts.length;
		var ret = false;
		
		for (var i = 0; i < len; i++)
		{
			var chart = allCharts[i];
			
			if (chart.node.is($node))
			{
				ret = chart;
				break;
			}
		}
		
		return ret;
	};
	

	
	var Chart = Sleuthcharts.Chart = function()
	{
		this.init.apply(this, arguments)
	}
	
	Chart.prototype = 
	{
		
		init: function(userOptions)
		{
			
			var chart = this;
			chart.userOptions = userOptions;
			chart.chartOptions = userOptions.chart;
			
			chart.node = chart.userOptions.chart.node;
			chart.pointInfoDOM = chart.node.parent().find(".chart-marketInfo");
			
			chart.initCanvas();
			
			
			chart.allPoints = [];
			chart.visiblePhases = [];
			chart.DOMPosition = {};
			chart.padding = new Sleuthcharts.Padding();
			chart.padding = Sleuthcharts.extend(chart.padding, chart.chartOptions.padding);
			
			chart.isDragging = false;
			chart.isCrosshair = true;
			chart.prevIndex = -2;
			chart.needsResize = false;
			chart.hasRenderedOnce = false;
			
			
			chart.DOMEventHandler;
			chart.marketHandler
			chart.series = [];
			chart.axes = [];
			chart.xAxis = [];
			chart.yAxis = [];
							
			
			chart.setContainerSize();
			chart.initAxes();
			chart.initSeries();
			chart.initMarketHandler();
			chart.initDOMEventHandler();


				
			chart.node.attr("data-sleuthcharts", Sleuthcharts.allCharts.length)

			Sleuthcharts.allCharts.push(chart);
			
			var load = "marketSettings" in chart.userOptions;

			
			if (load)
			{
				var marketHandler = chart.marketHandler;
				
				chart.toggleLoading(true);

				marketHandler.getMarketData().done(function()
				{
					var tempSeries = chart.series[0];
					
					//console.log(chart);
					chart.resizeAxis();
					chart.updateAxisPos();
					
					chart.drawMarketName();

					tempSeries.setDefaultMarketDataRange();
					tempSeries.getPointPositions();
					
					chart.equalizeYAxisWidth();
					chart.resizeAxis();
					chart.updateAxisPos();
					
	
					tempSeries.setDefaultMarketDataRange();
					tempSeries.getPointPositions();
					
					//chart.updateAxisMinMax(chart.visiblePhases, chart.xAxis[0].minIndex, chart.xAxis[0].maxIndex);
					
					
					for (var i = 0; i < chart.series.length; i++)
					{
						var series = chart.series[i];
						//console.log(series);
						series.drawPoints();
					}
					
					//chart.drawBothInds();

					chart.updateAxisTicks();
					chart.drawAxisLines();
					
					chart.hasRenderedOnce = true;
					chart.toggleLoading(false);

					
					//highLowPrice(chart);
				}).fail(function()
				{
					chart.editLoading("Error loading market " + marketHandler.marketSettings.pairName);
				})
				
			}
			
			return chart;
		},
		
		
		
		initCanvas: function()
		{
			var chart = this;
			
			var canvas = document.createElement('canvas');
			canvas.width = chart.node.parent().width();
			canvas.height = chart.node.parent().height();
			canvas.style.position = "absolute";
			canvas.style.top = 0;
			canvas.style.left = 0;
			//canvas.style.zIndex = 2;
			
			chart.node.parent().append(canvas);

			chart.canvas = canvas;
			chart.canvasJQ = $(canvas);
			chart.ctx = canvas.getContext("2d");
			chart.ctx.translate(0.5, 0.5);
			
			
			var infoCanvas = document.createElement('canvas');
			infoCanvas.width = chart.node.parent().width();
			infoCanvas.height = chart.node.parent().height();
			infoCanvas.style.position = "absolute";
			infoCanvas.style.top = 0;
			infoCanvas.style.left = 0;
			
			
			chart.node.parent().append(infoCanvas);

			chart.infoCanvas = infoCanvas;
			chart.infoCTX = infoCanvas.getContext("2d");
			chart.infoCTX.translate(0.5, 0.5);
			
			
			var crosshairCanvas = document.createElement('canvas');
			crosshairCanvas.width = chart.node.parent().width();
			crosshairCanvas.height = chart.node.parent().height();
			crosshairCanvas.style.position = "absolute";
			crosshairCanvas.style.top = 0;
			crosshairCanvas.style.left = 0;
			
			
			chart.node.parent().append(crosshairCanvas);

			chart.crosshairCanvas = crosshairCanvas;
			chart.crosshairCTX = crosshairCanvas.getContext("2d");
			chart.crosshairCTX.translate(0.5, 0.5);
		},
		
		
		
		updateChart: function()
		{

			var dfd = new $.Deferred();
			var chart = this;
			var marketHandler = chart.marketHandler;
			
			chart.toggleLoading(true);
			chart.editLoading();
			chart.prevIndex = -2;
			
			//chart.emptyChart();
			//chart.unbindEventListeners();	//$("#"+node).unbind();

			chart.ctx.clearRect(0, 0, chart.canvas.width, chart.canvas.height);

			marketHandler.getMarketData().done(function()
			{
				var tempSeries = chart.series[0];
				
				chart.resizeAxis();
				chart.updateAxisPos();
				
				chart.drawMarketName();

				tempSeries.setDefaultMarketDataRange();
				tempSeries.getPointPositions();
				
				chart.equalizeYAxisWidth();
				
				chart.resizeAxis();
				chart.updateAxisPos();
				tempSeries.setDefaultMarketDataRange();
				tempSeries.getPointPositions();
								
				
				for (var i = 0; i < chart.series.length; i++)
				{
					var series = chart.series[i];
					series.drawPoints();
				}
				
				//chart.drawBothInds();

				chart.updateAxisTicks();
				chart.drawAxisLines();
				
				chart.toggleLoading(false);	

				dfd.resolve();
				
				//highLowPrice(chart);
				
			}).fail(function()
			{
				chart.editLoading("Error loading market " + marketHandler.marketSettings.pairName);
			})
			
			
			
			return dfd.promise()
		},
		
		
		
		redraw: function()
		{
			var chart = this;
			
			chart.ctx.clearRect(0, 0, chart.canvas.width, chart.canvas.height);

			if (chart.hasRenderedOnce)
			{
				var tempSeries = chart.series[0];
				
				//console.log(chart.xAxis[0].series[0].seriesType);
				//console.log(chart);
				chart.setContainerSize();
				
				chart.resizeAxis();
				chart.updateAxisPos();
				chart.recalcPointWidth(); //hack
				tempSeries.getPointPositions();
				
				chart.equalizeYAxisWidth();
				
				chart.resizeAxis();
				chart.updateAxisPos();
				chart.recalcPointWidth(); //hack
				tempSeries.getPointPositions();
				
				
				for (var i = 0; i < chart.series.length; i++)
				{
					var series = chart.series[i];
					series.drawPoints();
				}
				
				chart.updateAxisTicks();
				chart.drawAxisLines();
			}
			
		},
		
		
		
		recalcPointWidth: function()
		{
			var chart = this;
			var series = chart.series[0];
			var xAxis = chart.xAxis[0];
			var marketHandler = chart.marketHandler;
			
			//var allPhases = marketHandler.marketData.ohlc;
			var startIndex = xAxis.minIndex;
			var endIndex = xAxis.maxIndex;
			//var visiblePhases = allPhases.slice(startIndex);
			var visiblePhases = chart.visiblePhases;

			
			if (series.calcPointWidth(visiblePhases))
			{
				chart.visiblePhases = visiblePhases;
				series.updateAxisMinMax(startIndex, endIndex);
			}
		},
		
		
		
		shiftXAxis: function(shifts, direction)
		{
			var chart = this;
			var xAxis = chart.xAxis[0];
			var vis = [];
			var marketHandler = chart.marketHandler;
			var allPhases = marketHandler.marketData.ohlc;

			
			if (direction == false)
			{
				if (xAxis.minIndex > 0)
				{
					var startIndex = xAxis.minIndex - shifts;
					var endIndex = xAxis.maxIndex - shifts;
					vis = allPhases.slice(startIndex, endIndex+1);
				}
			}
			else
			{
				if (xAxis.maxIndex < allPhases.length - 1)
				{
					var startIndex = xAxis.minIndex + shifts;
					var endIndex = xAxis.maxIndex + shifts;
					vis = allPhases.slice(startIndex, endIndex+1);
				}
			}

			if (vis.length)
			{
				//console.log(vis);
				var series = chart.series[0];

				if (series.calcPointWidth(vis))
				{
					chart.visiblePhases = vis;
					series.updateAxisMinMax(startIndex, endIndex);
				}
			}
		},
		
		
		
		zoomChart: function(isZoomOut)
		{
			var chart = this;
			var xAxis = chart.xAxis[0]
			
			var marketHandler = chart.marketHandler;
			var allPhases = marketHandler.marketData.ohlc;
			
			var curMax = xAxis.max;
			var curMin = xAxis.min;
			var dataMax = xAxis.dataMax;
			var dataMin = xAxis.dataMin;
			var diff = (curMax - curMin) / 10;
			   
			var newMax = curMax;
			
			if (isZoomOut)
				var newMin = (curMin-diff > dataMin) ? curMin-diff : dataMin;
			else
				var newMin = (curMin + diff < curMax) ? curMin + diff : curMin;
			
				
			var startIndex = 0;
			
			for (startIndex = 0; startIndex < allPhases.length; startIndex++)
			{
				var phase = allPhases[startIndex];
				
				if (phase.startTime >= newMin)
				{
					if (startIndex != 0)
						startIndex--;
					
					break;
				}
			}
			
			var endIndex = xAxis.maxIndex;
			

			var vis = allPhases.slice(startIndex, endIndex + 1);
			
			var series = chart.series[0];

			if (series.calcPointWidth(vis))
			{
				chart.visiblePhases = vis;
				series.updateAxisMinMax(startIndex, endIndex);
			}

			chart.redraw()
		},

		
	
		isInsidePlot: function(mouseX, mouseY)
		{
			var chart = this;
			
			var isInsideX = mouseX > chart.plotLeft && mouseX < chart.plotRight;
			var isInsideY = mouseY > chart.plotTop && mouseY < chart.plotBottom;
			
			var isInside = isInsideX && isInsideY;
			
			return isInside
		},
		
		
		
		getPoint: function(points, value) 
		{
			var chart = this;
			var val = null;

			if (value >= points[points.length-1].pos.left)
			{
				val = points[points.length-1]
			}
			else if (value <= points[0].pos.left)
			{
				val = points[0]
			}
			else
			{
				for (var i = 0; i < points.length; i++) 
				{
					point = points[i]
					if ( point.pos.left >= value) 
					{
						val = points[i-1]
						break;
					}
				}
			}
			
			return val;
		},
		
	
	
		setContainerSize: function()
		{
			var chart = this;
			var chartPadding = chart.padding;
			var $chartNode = chart.node;
			
			//console.log(chart.canvas.getBoundingClientRect());

			var $copied_elem = chart.canvasJQ.clone()
							  .attr("id", false)
							  .css({visibility:"hidden", display:"block", 
									   position:"absolute"});
			$("body").append($copied_elem);
			
			var DOMPosition = Sleuthcharts.getDOMPosition($copied_elem);
			$copied_elem.remove();

			chart.DOMPosition = DOMPosition;
			
			
			chart.plotTop = DOMPosition.top + chartPadding.top;
			chart.plotBottom = DOMPosition.bottom - chartPadding.bottom;
			chart.plotLeft = DOMPosition.left + chartPadding.left;
			chart.plotRight = DOMPosition.right - chartPadding.right;
			
			chart.plotHeight = chart.plotBottom - chart.plotTop;
			chart.plotWidth = chart.plotRight - chart.plotLeft;
			

			var height = chart.node.parent().height();
			var width = chart.node.parent().width();
			chart.canvas.height = height;
			chart.canvas.width = width;
			chart.infoCanvas.height = height;
			chart.infoCanvas.width = width;
			chart.crosshairCanvas.height = height;
			chart.crosshairCanvas.width = width;
			//chart.canvas.height = DOMPosition.height;
			//chart.canvas.width = DOMPosition.width;
		},
		
		
		
		initMarketHandler: function()
		{
			var chart = this;
			
			var marketSettings = chart.userOptions.marketSettings || {};
			
			//console.log(marketSettings);
			
			var marketHandler = new Sleuthcharts.MarketHandler(chart, marketSettings);
			chart.marketHandler = marketHandler;
		},
		
	
		
		initSeries: function()
		{
			var chart = this;
			var seriesOptions = chart.userOptions.series;
			
			
			for (var i = 0; i < seriesOptions.length; i++)
			{
				var opt = seriesOptions[i];
				opt.index = i;
				var seriesType = opt.seriesType;
				var seriesClass = Sleuthcharts.seriesTypes[seriesType];
				var series = new seriesClass();
				series.init(chart, opt);
				chart.series.push(series);
			}
		},
		
		
		
		initAxes: function()
		{
			var chart = this;
			var xAxisOptions = chart.userOptions.xAxis;
			var yAxisOptions = chart.userOptions.yAxis;
			
			for (var i = 0; i < xAxisOptions.length; i++)
			{
				var opt = xAxisOptions[i];
				opt.isXAxis = true;
				opt.index = i;
				
				var axis = new Sleuthcharts.Axis(chart, opt)
				chart.xAxis.push(axis)
			}
			
			for (var i = 0; i < yAxisOptions.length; i++)
			{
				var opt = yAxisOptions[i];
				opt.isXAxis = false;
				opt.index = i;
				
				var axis = new Sleuthcharts.Axis(chart, opt)
				chart.yAxis.push(axis)
			}
			
			chart.axes = chart.xAxis.concat(chart.yAxis);
		},
		
		
		
		initDOMEventHandler: function()
		{
			var chart = this;
			var DOMEventHandler = new Sleuthcharts.DOMEventHandler(chart);
			DOMEventHandler.setDOMEvents();
			
			chart.DOMEventHandler = DOMEventHandler;
		},
		
		
		
		equalizeYAxisWidth: function()
		{
			var chart = this;
			var allSeries = chart.series;
			var biggestWidth = 0;
			
			for (var i = 0; i < allSeries.length; i++)
			{
				var yAxis = allSeries[i].yAxis;
				
				var paddedMax = yAxis.max + (yAxis.max * (yAxis.maxPadding))
				var paddedMin = yAxis.min - (yAxis.min * (yAxis.minPadding))
				
				var scale = d3.scale.linear()
				.domain([paddedMin, paddedMax])
				.range([yAxis.height, yAxis.pos.top])
				
				var tickVals = scale.ticks(yAxis.numTicks) //.map(o.tickFormat(8))
				
				
				var maxTextWidth = Sleuthcharts.getMaxTextWidth(tickVals, yAxis.labels.fontSize, yAxis.ctx)
				var textPadding = yAxis.labels.textPadding;
				var combinedWidth = maxTextWidth + (yAxis.tickLength * 2) + (textPadding * 2);
				var newAxisWidth = combinedWidth;

				biggestWidth = newAxisWidth > biggestWidth ? newAxisWidth : biggestWidth;
			}
			for (var i = 0; i < allSeries.length; i++)
			{
				var yAxis = allSeries[i].yAxis
				yAxis.widthInit = biggestWidth
				yAxis.width = biggestWidth;
			}
		},
		

		
		resizeAxis: function()
		{
			var chart = this;
			
			for (var i = 0; i < chart.axes.length; i++)
			{
				chart.axes[i].resizeAxis();
			}
		},
		
		updateAxisPos: function()
		{
			var chart = this;
			
			for (var i = 0; i < chart.axes.length; i++)
			{
				chart.axes[i].updateAxisPos();
			}
		},
		
		updateAxisTicks: function()
		{
			var chart = this;
			
			for (var i = 0; i < chart.axes.length; i++)
			{
				chart.axes[i].makeAxis();
			}
		},
		
		drawAxisLines: function()
		{
			var chart = this;
			
			for (var i = 0; i < chart.axes.length; i++)
			{
				chart.axes[i].drawAxisLines();
			}
		},
		
		
		toggleLoading: function(isLoading)
		{
			var chart = this;
			var $node  = chart.node;
			var $parent = $node.parent();
			var $loading = $parent.find(".chart-loading");
			
			if (isLoading)
			{
				$loading.show();
			}
			else
			{
				$loading.hide()
			}
		},
		
		
		
		editLoading: function(text)
		{
			var chart = this;
			var $node  = chart.node;
			var $parent = $node.parent();
			var $loading = $parent.find(".chart-loading");
			
			text = typeof text === "undefined" ? "Loading..." : text;
			$loading.find("span").text(text);
		},
		
		
		
		drawMarketName: function()
		{
			var chart = this;
			var marketHandler = chart.marketHandler;
			var marketSettings = marketHandler.marketSettings;
			
			var pair = marketSettings.pairName;
			var exchange = marketSettings.exchange;
			
			var $el = chart.node.parent().find(".chart-marketName span");
			
			$el.text(pair.toUpperCase() + " - " + exchange.toUpperCase());
		},
		
		
		
		drawMarketInfo: function(closestPoint)
		{
			var chart = this;
			var $node = chart.node;

			var openStr = "O: " + Sleuthcharts.formatNumWidth(Number(closestPoint.phase.open))
			var highStr = " H: " + Sleuthcharts.formatNumWidth(Number(closestPoint.phase.high))
			var lowStr = " L: " + Sleuthcharts.formatNumWidth(Number(closestPoint.phase.low))
			var closeStr = " C: " + Sleuthcharts.formatNumWidth(Number(closestPoint.phase.close))
			var volStr = " V: " + Sleuthcharts.formatNumWidth(Number(closestPoint.phase.vol))
			
			var str = ""
			str += openStr
			str += highStr
			str += lowStr
			str += closeStr
			str += volStr

			
			var $candleInfoWrap = chart.pointInfoDOM.find(".chart-candleInfo");
			var $candleInfoText = $candleInfoWrap.find("span");
			$candleInfoText.text(str);
			
			$candleInfoWrap.addClass("active");
		},
		
		
		
		drawCrosshairX: function(yPos)
		{
			var chart = this;
			var canvas = chart.crosshairCanvas
			var ctx = chart.crosshairCTX;
			
			if (!chart.isCrosshair)
				return;
			
			var lineLeft = chart.xAxis[0].pos.left;
			var lineRight = chart.yAxis[0].pos.left;
			
			//ctx.clearRect(0, 0, canvas.width, canvas.height);

			
			var d = 
			[
				"M", lineLeft, yPos + 0.5, 
				"L", lineRight, yPos + 0.5,  
			]

			var pathStyle = {};
			pathStyle.strokeColor = "#a5a5a5";
			pathStyle.lineWidth = 1;

			Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
		},
		
		
		
		drawCrosshairY: function(closestPoint)
		{
			var chart = this;
			var canvas = chart.crosshairCanvas
			var ctx = chart.crosshairCTX;
			
			if (!chart.isCrosshair)
				return;
			
			
			var xAxis = chart.xAxis[0];
			var lineTop = 0;
			var lineBottom = chart.xAxis[0].pos.top;
			
			var d = 
			[
				"M", closestPoint.pos.middle, lineTop, 
				"L", closestPoint.pos.middle, lineBottom,  
			]

			var pathStyle = {};
			pathStyle.strokeColor = "#a5a5a5";
			pathStyle.lineWidth = 1;

			Sleuthcharts.drawCanvasPath(ctx, d, pathStyle);
		},
		
		
		
		hideRenders: function()
		{
			var chart = this;
			
			var $candleInfoWrap = chart.pointInfoDOM.find(".chart-candleInfo");
			$candleInfoWrap.removeClass("active");
			
			chart.crosshairCTX.clearRect(0, 0, chart.crosshairCanvas.width, chart.crosshairCanvas.height);
			chart.infoCTX.clearRect(0, 0, chart.infoCanvas.width, chart.infoCanvas.height);
		}
		
	}
	
	

	return Sleuthcharts;
	
	
}(Sleuthcharts || {}));



$(window).resize(function(e)
{	
	var prevWindowHeight = $(window).height();
	var prevWindowWidth = $(window).width();
	
	
	setTimeout(function()
	{
		var windowHeight = $(window).height();
		var windowWidth = $(window).width();
		
		//console.log([prevWindowHeight, windowHeight])
		
		if (windowHeight != prevWindowHeight || windowWidth != prevWindowWidth)
		{

		}
		else
		{
			var allCharts = Sleuthcharts.allCharts;
			var len = allCharts.length;
			
			for (var i = 0; i < len; i++)
			{
				var chart = allCharts[i]

				var $chartNode = chart.node;
				var isVisible = $chartNode.is(":visible")

				if (!isVisible)
				{
					chart.needsResize = true;
				}
				else
				{
					chart.redraw();
				}
			}
		}
	}, 300)
})



