
const grpc = require('grpc');
const uuidv1 = require('uuid/v1')

const notesProto = grpc.load('notes.proto');
const notes = [ 
    { id: '1', title: 'Note 1', content: '# Eindelijk alles afronden', done: false},
    { id: '2', title: 'Note 2', content: '# STUFF I need to do stuff', done: false},
];
const server = new grpc.Server();

server.addService(notesProto.notess.NoteService.service, {
    // returns all notes
    list: (_, callback) => {
        callback(null, notes);
    },
    // get single note
    get: (call, callback) => {
        let note = notes.find((n) => n.id == call.request.id)
        if (note) {
            callback(null, note)
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not found"
            })
        }
    },
    //adding a note
    insert: (call, callback) => {
        let note = call.request;
        note.id = uuidv1();
        notes.push(note);
        callback(null, note);
    },
    //updating a note
    update: (call, callback) => {
        let existingNote = notes.find((n) => n.id == call.request.id)
        if (existingNote) {
            existingNote.title = call.request.title
            existingNote.content = call.request.content
            existingNote.done = call.request.done
            callback(null, existingNote)         
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not found"
            })
        }
    },
    // deleting a note
    delete: (call, callback) => {
        let existingNoteIndex = notes.findIndex((n) => n.id == call.request.id);

        if (existingNoteIndex != -1) {
            notes.splice(existingNoteIndex, 1);
            callback(null, {});
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not found"
            });
        }
    }
})
// starting server
server.bind('127.0.0.1:50051', grpc.ServerCredentials.createInsecure());
server.start();
console.log('Server running at http://127.0.0.1:50051');