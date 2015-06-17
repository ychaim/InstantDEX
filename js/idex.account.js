

var IDEX = (function(IDEX, $, undefined)
{

	IDEX.Account.prototype.setNXTRS = function(nxtIDAndRS)
	{
		this.nxtID = "";
		this.nxtRS = "";
		
		if (nxtIDAndRS.length == 1)
		{
			
		}
		else if (nxtIDAndRS.length == 2)
		{
			this.nxtID = nxtIDAndRS[0];
			this.nxtRS = nxtIDAndRS[1];
		}
	}

	
	IDEX.Account.prototype.updateNXTRS = function()
	{
		var dfd = new $.Deferred();
		var nxtIDAndRS = [];
		var account = this;
		var params = {"requestType":"openorders"};
		
		IDEX.sendPost(params).then(function(data)
		{
			if ('NXT' in data && data['NXT'].length)
			{
				var id = data['NXT']
				var rs = IDEX.toRS(id);
				nxtIDAndRS.push(id);
				nxtIDAndRS.push(rs);
			}
			
			$(".nxtrs").text(nxtIDAndRS[1])
			account.setNXTRS(nxtIDAndRS);
			
			dfd.resolve([account.nxtID, account.nxtRS])
		})
		
		return dfd.promise()
	}
	
	
	IDEX.Account.prototype.updateOpenOrders = function()
	{
		var dfd = new $.Deferred();
		var params = {"requestType":"openorders"};
		var account = this;
		
		IDEX.sendPost(params).then(function(data)
		{
			var temp = [];

			if ("openorders" in data)
			{
				data = data.openorders;
				
				for (var i = 0; i < data.length; i++)
					if (data[i].baseid == IDEX.user.curBase.assetID && data[i].relid == IDEX.user.curRel.assetID)
						temp.push(data[i]);
			}
			else
			{
				data = [];
			}
			
			account.openOrders = data;
			account.marketOpenOrders = temp;
			dfd.resolve();
		})
		
		return dfd.promise();
	}
	
	
	IDEX.Account.prototype.pollOpenOrders = function(timeout)
	{
		var account = this;
		timeout = typeof timeout === "undefined" ? 1 : timeout;

		this.setTimeout(timeout).done(function(a)
		{
			IDEX.makeTable("marketOpenOrdersTable", function()
			{
				timeout = 4000;
				account.pollOpenOrders(timeout);
			});
		})
	}
	
	
	IDEX.Account.prototype.stopPollingOpenOrders = function()
	{
		
	}
	
	
	IDEX.Account.prototype.refreshOpenOrdersPoll = function()
	{
		
	}
	
	
	IDEX.Account.prototype.setTimeout = function(timeout)
	{
		this.timeoutDFD = new $.Deferred();
		var account = this;

		this.openOrdersTimeout = setTimeout(function() 
		{
			account.timeoutDFD.resolve(false);
			account.timeoutDFD = false;
			
		}, timeout)
		
		return this.timeoutDFD.promise();
	}
	
	
	IDEX.Account.prototype.clearTimeout = function()
	{
		if (this.timeoutDFD)
		{
			clearTimeout(this.openOrdersTimeout);
			this.timeoutDFD.resolve(true);
			this.timeoutDFD = false;
		}
	}
	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));