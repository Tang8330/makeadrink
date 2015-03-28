var utility = {

	getElementValueByID : function(id) {
		return document.getElementById(id).value;
	},	
	getElementValueByClassName : function(className) {
		return document.getElementValueByClassName(className)[0].value;
	}

}