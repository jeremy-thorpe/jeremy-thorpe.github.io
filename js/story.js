class Story {
    /*
    * Construct the Story object
    *
    */
    constructor() {
        d3.select("#col-story").append("svg").attr("id", "col-story-svg").attr("width", "100%").attr("height", "150px");
        
        this.cats = ["Stamp", "Gas", "Eggs", "Milk"]
    }
    
    /*
    * Set the inital values for the story field
    * Default Year is 2007
    */
    createStory(colData, eventsData) {
		console.log(eventsData);
		this.spacing = 30;
        this.colData = colData;
        this.eventsData = eventsData;   
        this.currentYear = "1969";
        
        this.tempData = this.colData[this.currentYear - 1968];
        let temp = d3.select("#col-story-svg");
        console.log(this.tempData);
            
		temp.append("text").attr("class", "story-headline").attr("x", 10).attr("y", this.spacing).text("Cost of Living:");
        temp.append("text").attr("id", "stampText").attr("class", "cola")
			.attr("x", 10).attr("y", this.spacing * 2).text("   Stamps: $" + this.tempData["stamp"]);
        temp.append("text").attr("id", "gasText").attr("class", "cola")
			.attr("x", 10).attr("y", this.spacing * 3).text("Gas: $" + this.tempData["gas"]);
        temp.append("text").attr("id", "eggsText").attr("class", "cola")
			.attr("x", 10).attr("y", this.spacing * 4).text("Eggs: $" + this.tempData["eggs"]);
        temp.append("text").attr("id", "milkText").attr("class", "cola")
			.attr("x", 10).attr("y", this.spacing * 5).text("Milk: $" + this.tempData["milk"]);
		
		this.tempEvent = this.eventsData.find(e => e["year"] == this.currentYear);
		
		if (typeof(this.tempEvent) !== "undefined") {
			temp = d3.select("#events");
			
			temp.append("text").attr("id", "event-date").attr("class", "event-headline").attr("x", 10).attr("y", this.spacing)
				.text(this.tempEvent["date"] + ", " + this.tempEvent["year"]);
			temp.append("br").attr("id", "event-br");
			temp.append("a").attr("id", "event-link").attr("href", this.tempEvent["link"])
				.attr("target", "_blank").text(this.tempEvent["headline"]);
		}
    }
    
    /*
    * Update the Story display
    * Get the value of the slider and update the display for the current year
    */
    updateStory(year) {
        this.currentYear = year;
        this.tempData = this.colData[this.currentYear - 1968];

        d3.select("#stampText").text("Stamps: $" + this.tempData["stamp"]);
        d3.select("#gasText").text("Gas: $" + this.tempData["gas"]);
        d3.select("#eggsText").text("Eggs: $" + this.tempData["eggs"]);
        d3.select("#milkText").text("Milk: $" + this.tempData["milk"]);
		
		d3.select("#event-date").remove();
		d3.select("#event-br").remove();
		d3.select("#event-link").remove();
		
		this.tempEvent = this.eventsData.find(e => e["year"] == this.currentYear);
		
		if (typeof(this.tempEvent) !== "undefined") {
			temp = d3.select("#events");
			
			temp.append("text").attr("id", "event-date").attr("class", "event-headline").attr("x", 10).attr("y", this.spacing)
				.text(this.tempEvent["date"] + ", " + this.tempEvent["year"]);
			temp.append("br").attr("id", "event-br");
			temp.append("a").attr("id", "event-link").attr("href", this.tempEvent["link"])
				.attr("target", "_blank").text(this.tempEvent["headline"]);
		}
    }
    
}