import React, { useState, useEffect } from "react";
import "./Note.css";

const Note = () => {
  const [notes, setNotes] = useState(JSON.parse(localStorage.getItem('notes')) || []);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(null);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [hasUnsavedNote, setHasUnsavedNote] = useState(false);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    // Проверяем, есть ли несохраненные изменения в заметке
    if (currentNoteIndex !== null) {
      setHasUnsavedNote(newNoteContent !== notes[currentNoteIndex].content);
    }
  }, [newNoteContent]);

  const addNote = () => {
    if (newNoteTitle.trim() !== "") {
      const newNote = { title: newNoteTitle, content: "" };
      setNotes([...notes, newNote]);
      setNewNoteTitle("");
    }
  };

  const deleteNote = (index) => {
    if (!hasUnsavedNote || window.confirm('Вы уверены, что хотите удалить эту заметку?')) {
      const updatedNotes = notes.filter((_, i) => i !== index);
      setNotes(updatedNotes);
      if (currentNoteIndex === index) setCurrentNoteIndex(null);
    }
  };

  const updateNoteContent = (e) => {
    setNewNoteContent(e.target.value);
  };

  const saveNote = () => {
    if (currentNoteIndex !== null) {
      const updatedNotes = [...notes];
      updatedNotes[currentNoteIndex].content = newNoteContent;
      setNotes(updatedNotes);
      setCurrentNoteIndex(null);
      setHasUnsavedNote(false); // Сбрасываем флаг незасохраненных изменений
    }
  };

  const handleNoteClick = (index) => {
    setCurrentNoteIndex(index);
    setNewNoteContent(notes[index].content);
    setHasUnsavedNote(false); // Сбрасываем флаг незасохраненных изменений
  };

  const deleteAllNotes = () => {
    if (!hasUnsavedNote || window.confirm('Вы уверены, что хотите удалить все заметки?')) {
      setNotes([]);
    }
  };

  return (
    <div className="note-app">
      
      <div className="new-note-container">
        <input
          type="text"
          value={newNoteTitle}
          onChange={(e) => setNewNoteTitle(e.target.value)}
          placeholder="Введите название..."
        />
        <button onClick={addNote} className="add-note-button">
          Добавить заметку
        </button>
      </div>
      
      <div className="notes-grid">
        {notes.map((note, index) => (
          <button
            key={index}
            className="note-item"
            onClick={() => handleNoteClick(index)}
          >
            <div className="note-icon">📒</div>
            <span className="note-title">{note.title}</span>
          </button>
        ))}
      </div>

      {currentNoteIndex !== null && (
        <div className="note-details">
          <div className="note-title-container">
            <h4>{notes[currentNoteIndex].title}</h4>
          </div>
          <textarea
            value={newNoteContent}
            onChange={updateNoteContent}
            placeholder="Пишите здесь..."
          />
          <div className="note-actions">
            <button onClick={saveNote} className="save-button">
              Сохранить
            </button>
            <button onClick={() => deleteNote(currentNoteIndex)} className="delete-button">
              Удалить
            </button>
          </div>
        </div>
      )}

      <div className="delete-all-container">
        <button 
          onClick={deleteAllNotes} 
          className="delete-all-button"
          disabled={hasUnsavedNote}
        >
          Удалить все заметки
        </button>
      </div>
    </div>
  );
};

export default Note;
