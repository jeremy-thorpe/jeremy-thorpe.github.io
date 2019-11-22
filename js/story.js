class Story {
	/*
	* Construct the Story object
	*
	*/
	constructor() {
		d3.select("#col-story").append("svg").attr("id", "col-story-svg").attr("width", "100%").attr("height", "150px");
		d3.select("#events").append("svg").attr("id", "events-svg").attr("width", "100%").attr("height", "150px");
		
		this.cats = ["Stamp", "Gas", "Eggs", "Milk"]
	}
	
	/*
	* Set the inital values for the story field
	* Default Year is 2007
	*/
	createStory(colData, eventsData) {
		this.colData = colData;
		this.eventsData = eventsData;	
		this.currentYear = "1971";
		
		this.tempData = this.colData[this.currentYear - 1968];
		let temp = d3.select("#col-story-svg");
		console.log(this.tempData);
			
		temp.append("text").attr("id", "stampText").attr("x", 10).attr("y", 20).text("Stamps: $" + this.tempData["stamp"]);
		temp.append("text").attr("id", "gasText").attr("x", 10).attr("y", 40).text("Gas: $" + this.tempData["gas"]);
		temp.append("text").attr("id", "eggsText").attr("x", 10).attr("y", 60).text("Eggs: $" + this.tempData["eggs"]);
		temp.append("text").attr("id", "milkText").attr("x", 10).attr("y", 80).text("Milk: $" + this.tempData["milk"]);
	}
	
	/*
	* Update the Story display
	* Get the value of the slider and update the display for the current year
	*/
	updateStory(year) {
		this.currentYear = year;
		this.tempData = this.colData[this.currentYear - 1968];
		// this.currentYear = d3.select("#year-slider").get current year
		d3.select("#stampText").text("Stamps: $" + this.tempData["stamp"]);
		d3.select("#gasText").text("Gas: $" + this.tempData["gas"]);
		d3.select("#eggsText").text("Eggs: $" + this.tempData["eggs"]);
		d3.select("#milkText").text("Milk: $" + this.tempData["milk"]);
	}
	
}