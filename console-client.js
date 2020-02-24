const blessed = require('blessed'),
    contrib = require('blessed-contrib'), 
    screen = blessed.screen(),
    chalk = require('chalk'),
    client = require('./client');
let grid = new contrib.grid({rows: 12, cols: 12, screen: screen})

let markdown = grid.set(0,4,12,8, contrib.markdown,{ label: "Note reader", firstHeading: chalk.red.italic });
markdown.setMarkdown('Loading notes...');

let editor = grid.set(0,4,12,8, blessed.textarea, {
    label: "Note writer",
    bottom: 0,        
	height: 3,        
	inputOnFocus: true,
	padding: {        
		top: 1,
		left: 2
	},
	style: {          
		fg: '#787878',
		bg: '#454545',  

		focus: {        
			fg: '#f6f6f6',
			bg: '#353535' 
		}
	}
});

editor.hide();

let log = grid.set(9,0,3,4, contrib.log,
    { 
        fg: "white",
        selectedFg: "green",
        label: 'Current task'
    }
);

log.log("test");

let table = grid.set(0,0,9,4, contrib.table, 
    { 
        label: 'Content',
        keys: true, 
        vi: true,
        fg: 'white',
        selectedFg: 'white',
        selectedBg: 'blue',
        interactive: true,
        label: 'Notes',
        width: '30%',
        height: '30%',
        border: {type: "line", fg: "cyan"},
        columnSpacing: 10,
        columnWidth: [5, 12]
    }
);

table.setData(
    {  
    headers: ['#', 'title'],
    data:
    [ ]});
table.focus();
let data = [];

setData = function(){
    client.list({}, (error, notes) => {
        if (!error) {
            log.log('successfully fetch List notes');
           
            data = [];
            for(var item in notes.notes) {
                const note = notes.notes[item];
                data.push([note.id, note.title])
            }

            table.setData(
                {
                    headers: ['#', 'title'],
                    data: data
                }
            );
        } else {
            log.log(error);
        }
    });
}
updateNote = function() {
    client.update(note, (error, note) => {
        if (!error) {
            log.log('Note has been updated successfully', note);
            setData();
        } else {
            log.log(error + "");
        }
    });
}

let note = {
    id: '',
    title: '',
    content: ''
};

setNote = function(){
    client.get({ id: selected_row[0] }, (error, gotnote) => {
        if (!error) {
            note = gotnote;
        } else {
            log.log(error);
        }
    })
}

addNote = function(){
    let newNote = {
        title: "New Note",
        content: "Empty note"
    };
    client.insert(newNote, (error, note) => {
        if (!error) {
            setData();
        } else {
            log.log(error + "")
        }
    })
}
let selected_row;
table.rows.on('select item', (item, index) => {
    selected_row = data[index];
    setNote();
    client.get({ id: selected_row[0] }, (error, notes) => {
        if (!error) {
            log.log("Read " + selected_row[1]);
            markdown.setMarkdown(notes.content)
        } else {
            log.log(error);
        }
    })
});

screen.key(['a'], function(ch, key) { addNote() });
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
    return process.exit(0);
});

table.rows.key('e', function(ch, key) {
    markdown.hide();
    editor.show();
    editor.focus();
    newFunction();
    editor.setValue(note.content);
    screen.render();
}); 

editor.key('C-s', function(ch, key) {
    var message = this.getValue();
    note.content = message;
	updateNote();
	this.clearValue();
    table.focus();
    editor.hide();
    markdown.show();
    screen.render();
}); 

setData();
screen.render()

function newFunction() {
    setNote();
}
