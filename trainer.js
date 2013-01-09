/**
 * @author bbezine
 */

var TrainerApp = {};

String.prototype.repeat = function(num) {
    return new Array(num + 1).join(this);
};

// Returns a random integer between min and max
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

Key.abcmapping = [
    'C2',
	'^C2',
	'D2',
	'^D2',
	'E2',
	'F2',
	'^F2',
	'G2',
	'^G2',
	'A2',
	'^A2',
	'B2'
];

TrainerApp.allMappings = {
	english: {
        id: 'english',
		name: 'English',
		sharpNames: [
			{id:0, name:'C'},
			{id:1, name:'C#'},
			{id:2, name:'D'},
			{id:3, name:'D#'},
			{id:4, name:'E'},
			{id:5, name:'F'},
			{id:6, name:'F#'},
			{id:7, name:'G'},
			{id:8, name:'G#'},
			{id:9, name:'A'},
			{id:10, name:'A#'},
			{id:11, name:'B'}
		]
	},
	southern_europe: {
        id: 'southern_europe',
		name: 'Southern Europe',
		sharpNames: [
			{id:0, name:'Do'},
			{id:1, name:'Do#'},
			{id:2, name:'Re'},
			{id:3, name:'Re#'},
			{id:4, name:'Mi'},
			{id:5, name:'Fa'},
			{id:6, name:'Fa#'},
			{id:7, name:'Sol'},
			{id:8, name:'Sol#'},
			{id:9, name:'La'},
			{id:10, name:'La#'},
			{id:11, name:'Si'}
		]
	},
	northern_europe: {
        id: 'northern_europe',
		name: 'Northern Europe',
		sharpNames: [
			{id:0, name:'C'},
			{id:1, name:'C#'},
			{id:2, name:'D'},
			{id:3, name:'D#'},
			{id:4, name:'E'},
			{id:5, name:'F'},
			{id:6, name:'F#'},
			{id:7, name:'G'},
			{id:8, name:'G#'},
			{id:9, name:'A'},
			{id:10, name:'A#'},
			{id:11, name:'H'}
		]
	}
};

TrainerApp.configurationController = {
    guidedTourTaken: false,
	keyMapping: TrainerApp.allMappings.english
};

function Key(n, oct) {
	var key = n;
	var octave = oct;

	this.addHalfTones = function(diff) {
		var newKey = key + diff;
		var newOctave = octave + Math.floor(newKey / Key.abcmapping.length);
		newKey = newKey % Key.abcmapping.length;
		
		return new Key(newKey, newOctave);
	};
	
	this.getKey = function() {
		return key;
	};
	
	this.getABCString = function() {
		var abc = Key.abcmapping[key];
		if (octave >= 1) {
			abc = abc.toLowerCase();
			if (octave > 1) {
				abc += "'".repeat(octave - 1);
			}
		} else if (octave < 0) {
			abc += ",".repeat(-octave);
		}
		
		return abc;
	};
}

TrainerApp.loadConfiguration = function() {
    var guidedTour = localStorage.guidedTourTaken;
    if (guidedTour) {
        TrainerApp.configurationController.guidedTourTaken = guidedTour;
    }
    
    var keyMapping = localStorage.keyMapping;
    if (keyMapping && TrainerApp.allMappings[keyMapping]) {
        TrainerApp.configurationController.keyMapping = TrainerApp.allMappings[keyMapping];
    }
};

TrainerApp.saveConfiguration = function() {
    localStorage.guidedTourTaken = TrainerApp.configurationController.guidedTourTaken;
    localStorage.keyMapping = TrainerApp.configurationController.keyMapping.id;
};

TrainerApp.takeTour = function() {
    TrainerApp.configurationController.guidedTourTaken = true;
    TrainerApp.saveConfiguration();
};

TrainerApp.setNotation = function(notationId) {
    if (TrainerApp.allMappings[notationId]) {
        TrainerApp.configurationController.keyMapping = TrainerApp.allMappings[notationId];
        TrainerApp.saveConfiguration();
        TrainerApp.showChoices();
    }
};

$(document).ready(function() {
    $(document).foundationNavigation();
    
    TrainerApp.loadConfiguration();
    
    $(window).resize(TrainerApp.onResize);
    
    $("#nav_tour").on('click', TrainerApp.takeTour);
    $("#nav_notation_english").on('click', function() { TrainerApp.setNotation('english'); });
    $("#nav_notation_southern_europe").on('click', function() { TrainerApp.setNotation('southern_europe'); });
    $("#nav_notation_northern_europe").on('click', function() { TrainerApp.setNotation('northern_europe'); });

    $("#choice0").on('click', function() { TrainerApp.selected(0); });
    $("#choice1").on('click', function() { TrainerApp.selected(1); });
    $("#choice2").on('click', function() { TrainerApp.selected(2); });
    $("#choice3").on('click', function() { TrainerApp.selected(3); });

    TrainerApp.onResize();
    
    TrainerApp.newQuestion();
    
    if (TrainerApp.configurationController.guidedTourTaken === false) {
        TrainerApp.takeTour();
    }
});

TrainerApp.printerParams = {
    scale: 2,
    staffwidth: 300,
    paddingtop: 15,
    paddingbottom: 30,
    paddingright: 50,
    paddingleft: 15,
    editable: false	
};

TrainerApp.onResize = function() {
    TrainerApp.printerParams.staffwidth = $(window).width() - TrainerApp.printerParams.paddingleft - TrainerApp.printerParams.paddingright;
    TrainerApp.showNote();
};

TrainerApp.currentNote = null;
TrainerApp.currentChoices = [null, null, null, null];

TrainerApp.newQuestion = function() {
    // Choose 4 random notes
    var choices = [
        TrainerApp.randomNote(),
        TrainerApp.randomNote(),
        TrainerApp.randomNote(),
        TrainerApp.randomNote()
        ];
    
    TrainerApp.currentChoices = choices;
    TrainerApp.currentNote = choices[getRandomInt(0, 3)];
    
    TrainerApp.showChoices();
    TrainerApp.showNote();
};

TrainerApp.randomNote = function() {
    return new Key(getRandomInt(0, 11), getRandomInt(-1, 1));
};

TrainerApp.showNote = function() {
    if (TrainerApp.currentNote) {
        var abcString = TrainerApp.currentNote.getABCString();
		ABCJS.renderAbc('score', abcString, null, TrainerApp.printerParams);
    }
};

TrainerApp.showChoices = function() {
    for(var i=0; i<TrainerApp.currentChoices.length; i++) {
        TrainerApp.setButtonText(i);
    }
};

TrainerApp.setButtonText = function(choiceId) {
    var textNote = TrainerApp.configurationController.keyMapping.sharpNames[TrainerApp.currentChoices[choiceId].getKey()];
    $("#choice" + choiceId).text(textNote.name);  
};

TrainerApp.selected = function(choiceId) {
    
    if (TrainerApp.currentNote == TrainerApp.currentChoices[choiceId]) {
        // Success
        TrainerApp.newQuestion();             
    } else {
        // Failure
        $("#failureMessage").reveal({animation: 'fade', animationSpeed:100});
         setTimeout(function() {
            $('#failureMessage').trigger('reveal:close');
         }, 500);
    }
};
