


var Sleuthgrids = {};
var $tileAdd = $("#tile_add");
var $contentWrap = $("#content_wrap");


Sleuthgrids = (function(Sleuthgrids) 
{
	Sleuthgrids.cellHandlers = {};
	Sleuthgrids.allGrids = [];
	Sleuthgrids.tileAdd = $("#tile_add");
	Sleuthgrids.contentWrap = $("#content_wrap");
	
	
	Sleuthgrids.isGridTrig = false;
	Sleuthgrids.triggeredCell = null;
	Sleuthgrids.isTriggeredNew = false;
	Sleuthgrids.triggeredType = "";
	
	
	Sleuthgrids.isResizing = false;
	Sleuthgrids.resizeTile = null;
	Sleuthgrids.resizeDir = "";
	
	
	Sleuthgrids.prevWindowHeight = 0;
	Sleuthgrids.prevWindowWidth = 0;
		
	
	
	
	Sleuthgrids.addEventListener = function(eventType, selector, callback)
	{
		$contentWrap.on(eventType, selector, function()
		{
			callback($(this));
		})
		
	};
	
	
	Sleuthgrids.getGrid = function(index)
	{
		var allGrids = this.allGrids;
		var len = allGrids.length;
		var ret = false;
		
		var grid = allGrids[index];
		return grid;
		
		for (var i = 0; i < len; i++)
		{
			var grid = allGrids[i];
			
			if (grid.node.is($node))
			{
				ret = grid;
				break;
			}
		}
		
		return ret;
	};
	
	
	Sleuthgrids.toggleTileAdd = function(show)
	{
		if (show)
		{
			$tileAdd.addClass("active")
		}
		else
		{
			$tileAdd.removeClass("active")
		}
	};
	
	
	Sleuthgrids.updateTileAddPos = function(event)
	{
		var mouseX = event.clientX;
		var mouseY = event.clientY;
		
		$tileAdd.css("left", mouseX);
		$tileAdd.css("top", mouseY);
	};
		

	Sleuthgrids.hideAllGrids = function()
	{
		var allGrids = Sleuthgrids.allGrids;
		var len = allGrids.length;
		
		for (var i = 0; i < len; i++)
		{
			var grid = allGrids[i];
			grid.hideGrid();
		}
	}
	
	var Grid = Sleuthgrids.Grid = function()
	{
		this.init.apply(this, arguments)
	}
	
	
	Grid.prototype = 
	{
		
		init: function()
		{	
			var grid = this;
			
			grid.tiles = [];
			grid.cells = [];

			
			grid.gridDOM = $($("#grid_template").html());
			grid.index = Sleuthgrids.allGrids.length;
			grid.gridDOM.attr("data-gridindex", grid.index);
			grid.isActive = false;

			grid.initEventListeners();
			
			Sleuthgrids.allGrids.push(grid);
			
			$(".grids").append(grid.gridDOM);

		},
		
		
		
		showGrid: function()
		{
			var grid = this;
			
			grid.gridDOM.addClass("active");
			grid.isActive = true;
		},
		
		
		
		hideGrid: function()
		{
			var grid = this;
			
			grid.gridDOM.removeClass("active");
			grid.isActive = false;
		},
		
		
		
		initEventListeners: function()
		{
			var grid = this;
			
			
			grid.gridDOM.find(".grid-arrow, .grid-arrow-middle").on("mouseover", function(e)
			{
				grid.mouseover($(this));
			})

			grid.gridDOM.find(".grid-arrow, .grid-arrow-middle").on("mouseout", function(e)
			{
				grid.mouseout($(this));
			})
			
			grid.gridDOM.find(".grid-arrow, .grid-arrow-middle").on("mouseup", function(e)
			{
				grid.mouseup($(this));
			})
			
		},
		
		
		removeTile: function(tile)
		{
			var grid = this;
			var tileIndex = tile.index;
			
			tile.removeTile();
			
			grid.tiles.splice(tileIndex, 1);
			
			Sleuthgrids.updateArrayIndex(grid.tiles);
		},
		
		
		
		makeTile: function(arrowDirections, newTilePositions, tile)
		{
			var grid = this;
			var isTriggeredNew = Sleuthgrids.isTriggeredNew;

			//console.log(isTriggeredNew);
			
			if (isTriggeredNew)
			{
				var triggeredCellType = Sleuthgrids.triggeredType;
				
				var $tile = $($("#tile_template").html())

				$tile.css("height", newTilePositions.height);
				$tile.css("width", newTilePositions.width);
				$tile.css("top", newTilePositions.top);
				$tile.css("left", newTilePositions.left);
				$tile.attr("data-arrow", arrowDirections.direction);
				
				var tile = new Sleuthgrids.Tile(grid, $tile);
				tile.index = grid.tiles.length;
				grid.tiles.push(tile);
				grid.gridDOM.append($tile);		

				
				tile.addCell(triggeredCellType, arrowDirections);

			}
			else
			{
				var triggeredCell = Sleuthgrids.triggeredCell;
				var triggeredTile = triggeredCell.tile;
				var $triggeredTile = triggeredTile.tileDOM;
				var cellIndex = triggeredCell.index;
				var triggeredTileNavCell = triggeredTile.navCells[cellIndex];
				
				var numCells = triggeredTile.cells.length;
				//console.log(numCells);
				
				if (numCells == 1)
				{
					triggeredTile.closeTileResizer();
				}
				
				if (!arrowDirections.isMiddle)
				{
					var $prev = grid.gridDOM.find(".preview-tile");
					newTilePositions = Sleuthgrids.getPositions($prev, true);
				}
				
				if (numCells == 1 && !arrowDirections.isMiddle)
				{
					$triggeredTile.css("height", newTilePositions.height);
					$triggeredTile.css("width", newTilePositions.width);
					$triggeredTile.css("top", newTilePositions.top);
					$triggeredTile.css("left", newTilePositions.left);
					$triggeredTile.attr("data-arrow", arrowDirections.direction);	
				}
				
				if (numCells > 1)
				{
					triggeredTile.navCells.splice(cellIndex, 1);
					Sleuthgrids.updateArrayIndex(triggeredTile.navCells);
					
					triggeredTile.cells.splice(cellIndex, 1);
					Sleuthgrids.updateArrayIndex(triggeredTile.cells);
				}
				
				if (numCells > 1 && !arrowDirections.isMiddle)
				{
					var $newTile = $($("#tile_template").html())

					$newTile.css("height", newTilePositions.height);
					$newTile.css("width", newTilePositions.width);
					$newTile.css("top", newTilePositions.top);
					$newTile.css("left", newTilePositions.left);
					$newTile.attr("data-arrow", arrowDirections.direction);
					
					var newTile = new Sleuthgrids.Tile(grid, $newTile);
					newTile.index = grid.tiles.length;
					grid.tiles.push(newTile);
					Sleuthgrids.updateArrayIndex(grid.tiles);
					grid.gridDOM.append($newTile);
					
					triggeredCell.tile = newTile;
					newTile.cells.push(triggeredCell);
					triggeredCell.cellDOM.appendTo($newTile.find(".tile-cells"))
					
					triggeredTileNavCell.tile = newTile;
					newTile.navCells.push(triggeredTileNavCell);
					triggeredTileNavCell.tileNavCellDOM.appendTo(newTile.tileHeaderDOM)
					
					Sleuthgrids.updateArrayIndex(newTile.cells);
					Sleuthgrids.updateArrayIndex(newTile.navCells);

					triggeredTileNavCell.unbindEventListeners();
					triggeredTileNavCell.initEventListeners();
					
					var tempIndex = cellIndex - 1 > 0 ? cellIndex - 1 : 0;
					triggeredTile.navCells[tempIndex].changeCellTabs();	
				
				}
				

				if (arrowDirections.isMiddle)
				{
					var $tile = tile.tileDOM;
					
					triggeredCell.tile = tile;
					tile.cells.push(triggeredCell);
					triggeredCell.cellDOM.appendTo($tile.find(".tile-cells"))
					
					triggeredTileNavCell.tile = tile;
					tile.navCells.push(triggeredTileNavCell);
					triggeredTileNavCell.tileNavCellDOM.appendTo(tile.tileHeaderDOM)
					
					triggeredTileNavCell.unbindEventListeners();
					triggeredTileNavCell.initEventListeners();

					Sleuthgrids.updateArrayIndex(tile.cells);
					Sleuthgrids.updateArrayIndex(tile.navCells);

					tile.toggleHeaderTabbed(true);

					triggeredTileNavCell.changeCellTabs();
					
				}
				
				if (numCells == 1 && arrowDirections.isMiddle)
				{
					grid.tiles.splice(triggeredTile.index, 1);
					Sleuthgrids.updateArrayIndex(grid.tiles);
					triggeredTile.tileDOM.remove();
				}
				
				if (numCells == 2)
				{
					triggeredTile.toggleHeaderTabbed(false);
				}
				if (numCells > 1)
				{
					var tempIndex = cellIndex - 1 > 0 ? cellIndex - 1 : 0;
					triggeredTile.navCells[tempIndex].changeCellTabs();	
				}
				
			}
		
			grid.resizeTileCells();
		},
		
		
		toggleTileResizeOverlay: function(isResizing)
		{
			var grid = this;
			var tiles = grid.tiles;
			
			for (var i = 0; i < tiles.length; i++)
			{
				var tile = tiles[i];
				tile.toggleTileOverlay(isResizing);
			}
		},

		
		
		resizeTileCells: function()
		{
			var grid = this;
			var tiles = grid.tiles;
			
			for (var i = 0; i < tiles.length; i++)
			{
				var tile = tiles[i];
				tile.resizeCells();
			}
		},
		
	
		mouseover: function($arrow)
		{
			var grid = this;
			
			Sleuthgrids.toggleTileAdd(false);
			
			var arrowDirections = Sleuthgrids.getArrowDirections($arrow);
			
			var $previewTile = $($("#preview_tile_template").html());

			$previewTile.css("height", "100%");
			$previewTile.css("width", "100%");
			$previewTile.css("top", 0);
			$previewTile.css("left", 0);

			
			if (arrowDirections.isMiddle)
			{
				grid.gridDOM.append($previewTile);
			}
			else
			{
				var els = grid.findMain(arrowDirections.direction, false);
				
				
				if (els.length)
				{
					var $smallestTile = grid.getLowest(els, arrowDirections.direction);
					var smallestTilePos = Sleuthgrids.getPositions($smallestTile, true);
					
					var absKey = arrowDirections.isHoriz ? "left" : "top";
					var sizeKey = arrowDirections.isHoriz ? "width" : "height";
					var newSize = smallestTilePos[sizeKey]/2;
					
					
					grid.resizeMain(els, arrowDirections, newSize, absKey, sizeKey, true);
					

					var mainPos = Sleuthgrids.getPositions(grid.gridDOM);
					
					var prevAbs = (arrowDirections.isBottom || arrowDirections.isRight) ? (mainPos[sizeKey] - newSize) : 0;
					
					
					$previewTile.css(sizeKey, newSize);
					$previewTile.css(absKey, prevAbs);

					grid.gridDOM.append($previewTile)
				}
			}
		},
	
		
		
		mouseout: function($arrow)
		{
			var grid = this;
			
			if (Sleuthgrids.isGridTrig)
			{
				Sleuthgrids.toggleTileAdd(true);
				
				var arrowDirections = Sleuthgrids.getArrowDirections($arrow);


				if (arrowDirections.isMiddle)
				{
					grid.gridDOM.find(".preview-tile").remove();
				}
				else
				{
					var els = grid.findMain(arrowDirections.direction, true);

					if (els.length)
					{					
						var $smallestTile = grid.getLowest(els, arrowDirections.direction);
						var smallestTilePos = Sleuthgrids.getPositions($smallestTile, true);
						
						var absKey = arrowDirections.isHoriz ? "left" : "top";
						var sizeKey = arrowDirections.isHoriz ? "width" : "height";
						var newSize = smallestTilePos[sizeKey];
						
						grid.resizeMain(els, arrowDirections, newSize, absKey, sizeKey, false);
						
						grid.gridDOM.find(".preview-tile").remove();
					}
				}
			}
		},

		
		
		mouseup: function($arrow)
		{
			Sleuthgrids.toggleTileAdd(false);

			var grid = this;
			
			var arrowDirections = Sleuthgrids.getArrowDirections($arrow);

			var $previewTile = grid.gridDOM.find(".preview-tile");
			var previewTilePositions = Sleuthgrids.getPositions($previewTile, true);
			
			//console.log($previewTile);

			grid.makeTile(arrowDirections, previewTilePositions);
			
			
			grid.gridDOM.find(".preview-tile").remove();
		},
		
		
		
		findMain: function(direction, withPreview)
		{
			var grid = this;
			var els = [];
			var mainPositions = Sleuthgrids.getPositions(grid.gridDOM);
			var pos = mainPositions[direction];

			
			grid.gridDOM.find(".tile").each(function()
			{
				var $tile = $(this);
				var tilePositions = Sleuthgrids.getPositions($tile);

				if (withPreview)
				{
					var $prev = grid.gridDOM.find(".preview-tile");
					var prevPositions = Sleuthgrids.getPositions($prev);
					
					var prevDir = Sleuthgrids.invertDirection(direction);

					var isDirection = tilePositions[direction] == prevPositions[prevDir];
				}
				else
				{
					var isDirection = tilePositions[direction] == pos;
				}

				if (isDirection)
				{
					els.push($tile);
				}
			});
			

			return els;
		},
		
		
		
		getLowest: function(els, direction)
		{
			var $lowEl = null;
			var lowest = -1;
			var sizeKey = (direction == "left" || direction == "right") ? "width" : "height";

			for (var i = 0; i < els.length; i++)
			{
				var $el = els[i];
				var size = $el[0].getBoundingClientRect()[sizeKey];

				if (size < lowest || lowest == -1)
				{
					$lowEl = $el;
					lowest = size;
				}
			}

			return $lowEl;
		},

		
		
		resizeMain: function(els, arrowDirections, newSize, absKey, sizeKey, isMouseover)
		{
			
			for (var i = 0; i < els.length; i++)
			{
				var $el = els[i];
				var pos = Sleuthgrids.getPositions($el, true);
				
				var size = pos[sizeKey];
				var adjSize = isMouseover ? size - newSize : size + newSize;
				
				var newAbs = isMouseover ? (pos[absKey] + newSize) : (pos[absKey] - newSize);
				newAbs = (arrowDirections.isLeft || arrowDirections.isTop) ? newAbs : pos[absKey];
				
				
				$el.css(sizeKey, adjSize);
				$el.css(absKey, newAbs);
			}
		},
		
		
		
		searchForAdjacentTiles: function(arr, points, direction)
		{
			var grid = this;
			
			var hKeys = ["left", "right"];
			var vKeys = ["top", "bottom"];
			var results = [];
			
			for (var i = 0; i < arr.length; i++)
			{
				var one = arr[i];
				var oneRes = [];
				
				for (var j = 0; j < hKeys.length; j++)
				{
					var hKey = hKeys[j];
					
					for (var k = 0; k < vKeys.length; k++)
					{
						var vKey = vKeys[k];
						
						var coord = [one.pos[hKey], one.pos[vKey]]
						
						var obj = {};
						obj.h = hKey;
						obj.v = vKey;
						obj.el = one;
						
						if (grid.compareCoord(points, coord, direction))
							oneRes.push(obj)
					}
				}
				
				if (oneRes.length > 1)
					results.push(oneRes)
			}
			
			return results;
		},
		
		
		
		compareCoord: function(mainPoints, compPoint, direction)
		{
			var isVert = (direction == "left" || direction == "right")
			var indexOfSame = isVert ? 0 : 1;
			var indexOfBetween = isVert ? 1 : 0;
			
			var min = Math.min(mainPoints[0][indexOfBetween], mainPoints[1][indexOfBetween])
			var max = Math.max(mainPoints[0][indexOfBetween], mainPoints[1][indexOfBetween])

			var isSame = (mainPoints[0][indexOfSame] == compPoint[indexOfSame])
			var isBetween = (compPoint[indexOfBetween] >= min && compPoint[indexOfBetween] <= max)


			return isSame && isBetween
		},
		
		
		
		
		
		resizeTile: function(mouseX, mouseY)
		{
			var grid = this;
			var tile = Sleuthgrids.resizeTile;
			var $tile = tile.tileDOM;
			var tilePositions = Sleuthgrids.getPositions($tile, true);
			
			var resizeDirection = Sleuthgrids.resizeDir;
			var isLeftOrTop =  (resizeDirection == "left" || resizeDirection == "top");
			var isHoriz = (resizeDirection == "top" || resizeDirection == "bottom"); //backwards
			var isVert = (resizeDirection == "left" || resizeDirection == "right");
			var absKey = isVert ? "left" : "top";
			var sizeKey = isVert ? "width" : "height";
			
			
			var allTilesPositions = [];

			
			for (var i = 0; i < grid.tiles.length; i++)
			{
				var loopTile = grid.tiles[i];
				var $loopTile = loopTile.tileDOM;
				
				if (!$loopTile.is($tile))
				{
					var obj = {};
					obj.node = $loopTile;
					obj.pos = Sleuthgrids.getPositions($loopTile, true);
					allTilesPositions.push(obj);
				}
			}


			var obj = {};
			obj.node = $tile;
			obj.pos = tilePositions;
			
			var loop = []
			loop.push(obj)
			
			var clone = Sleuthgrids.cloneListOfObjects(allTilesPositions);
			var flip = isVert ? ["top", "bottom"] : ["left", "right"];

			var all = {};
			all[flip[0]] = [];
			all[flip[1]] = [];
			
			for (var i = 0; i < clone.length; i++)
			{
				var one = clone[i];
							
				for (var v = 0; v < loop.length; v++)
				{
					var oneLoop = loop[v]
				
					if (one.pos[resizeDirection] == oneLoop.pos[resizeDirection])
					{			
						var check = false;
						
						for (var k = 0; k < flip.length; k++)
						{
							var key = flip[k]

							for (var j = 0; j < flip.length; j++)
							{
								var flipKey = flip[j];

								if (one.pos[key] == oneLoop.pos[flipKey])
								{
									check = true;
									break
								}
							}
							if (check)
								break
						}
						
						if (check)
						{
							all[flipKey].push(one)
							loop.push(one)
							clone.splice(i, 1)
							i = -1;
							break;
						}
					}
				}
			}
			

			var poss = [];
			
			poss.push([tilePositions[flip[0]], tilePositions[flip[1]]])
			
			var first = all[flip[0]]
			var second = all[flip[1]];
			
			var constant = tilePositions[resizeDirection]
			
			for (var i = 0; i < first.length; i++)
			{
				var minor = first[i].pos[flip[0]]
				var major = tilePositions[flip[1]]
				poss.push([minor, major])
			}
			
			for (var i = 0; i < second.length; i++)
			{
				var minor = tilePositions[flip[0]]
				var major = second[i].pos[flip[1]]
				poss.push([minor, major])
			}
			
			for (var i = 0; i < first.length; i++)
			{
				var minor = first[i].pos[flip[0]]
				
				for (var j = 0; j < second.length; j++)
				{
					var major = second[j].pos[flip[1]]
					poss.push([minor, major])
				}
			}
			
			var points = [];
			
			for (var i = 0; i < poss.length; i++)
			{
				var pos = poss[i]
				
				if (isVert)
				{
					var one = [[constant, pos[0]],[constant, pos[1]]]
				}
				else
				{
					var one = [[pos[0], constant],[pos[1],constant]]
				}

				points.push(one)
			}
			
			
			//console.log(clone);
			//console.log(allTilesPositions);
			
			for (var i = 0; i < points.length; i++)
			{
				var point = points[i];
				var results = grid.searchForAdjacentTiles(clone, point, resizeDirection); // clone == filtered list
				
				if (results.length)
				{
					var coordOne = isVert ? point[0][1] : point[0][0];
					var coordTwo = isVert ? point[1][1] : point[1][0];
					var min = Math.min(coordOne, coordTwo)
					var max = Math.max(coordOne, coordTwo)
					var size = max - min;
					var runningSize = 0;
					var sizeKey = isVert ? "height" : "width";
					
					for (var j = 0; j < results.length; j++)
					{
						runningSize += results[j][0].el.pos[sizeKey];
					}
										
					if (runningSize == size || Math.abs(runningSize - size) < 0.5)
					{
						break;
					}
					else
					{
						//console.log([size, runningSize])
						results = [];
					}
				}
			}

			if (!results.length)
			{
				return;
			}
			
			
			var tes = [];
			
			for (var i = 0; i < loop.length; i++)
			{
				var coordOne = isVert ? point[0][1] : point[0][0];
				var coordTwo = isVert ? point[1][1] : point[1][0];
				
				var $el = loop[i].node;
				var pos = loop[i].pos;
					
				var min = Math.min(coordOne, coordTwo)
				var max = Math.max(coordOne, coordTwo)
				
				var firstBetween = pos[flip[0]] >= min && pos[flip[0]] <= max
				var secondBetween = pos[flip[1]] >= min && pos[flip[1]] <= max
				
				if (firstBetween && secondBetween)
				{
					tes.push(loop[i])
				}
			}

			
			
			var isLeftOrTop =  (resizeDirection == "left" || resizeDirection == "top");
			var isHoriz = (resizeDirection == "top" || resizeDirection == "bottom"); //backwards
			var isVert = (resizeDirection == "left" || resizeDirection == "right");
			var absKey = isVert ? "left" : "top";
			var sizeKey = isVert ? "width" : "height";
			
			var loopMouse = isVert ? mouseX : mouseY;
			var diff = loopMouse - tilePositions[resizeDirection];
			
			
			for (var i = 0; i < tes.length; i++)
			{
				var $el = tes[i].node;
				var pos = tes[i].pos;
				
				var newSize = isLeftOrTop ? (pos[sizeKey] - diff) : (pos[sizeKey] + diff);
				
				$el.css(sizeKey, newSize);
				
				if (isLeftOrTop)
				{
					var newAbs = pos[absKey] + diff;
					$el.css(absKey, newAbs);
				}
				
			
			}
			for (var i = 0; i < results.length; i++)
			{
				var pos = results[i][0].el.pos;
				var $el = results[i][0].el.node;
		
				
				var newSize = isLeftOrTop ? (pos[sizeKey] + diff) : (pos[sizeKey] - diff);
				$el.css(sizeKey, newSize);


				if (!isLeftOrTop)
				{
					var newAbs = pos[absKey] + diff;
					$el.css(absKey, newAbs);
				}
			}

		}
	

		

	}
	
	


	return Sleuthgrids;
	
	
}(Sleuthgrids || {}));
	



