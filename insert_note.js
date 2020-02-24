import { insert } from './client';

let newNote = {
    title: "New Note",
    content: "New Note content"
}

insert(newNote, (error, note) => {
    if (!error){
        console.log('New Note created successfully', note)
    } else {
        console.error(error)
    }
})