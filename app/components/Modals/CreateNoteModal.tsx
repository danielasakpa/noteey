"use client";
import { NextPage } from "next";
import React, { useEffect, useRef, useState } from "react";
import { CreateModalProps } from "../../types/components";
import Overlay from "../Overlay";
import Input from "../Input";
import { toast } from "sonner";
import { addDoc, collection, doc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/app/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export interface formData {
  title: string;
}

const CreateNoteModal: NextPage<CreateModalProps> = ({
  show,
  setShow,
  content,
  buttonContent,
  addNewNote,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [inputData, setInputData] = useState<formData>({ title: "" });
  const [user] = useAuthState(auth);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setInputData({ title: event.target.value });
  };

  const formValidation = () => {
    if (!inputData.title) {
      return false;
    }
    return true;
  };

  const handleCreateNoteey = async () => {
    if (!formValidation()) {
      toast.error("Please enter a title.");
    } else {
      if (user) {
        const userDocRef = doc(db, "user", user?.uid); // Reference to the user document
        const noteCollectionRef = collection(userDocRef, "note"); // Reference to the "note" subcollection
        try {
          const newNoteData = {
            title: inputData.title,
            timestamp: serverTimestamp(),
          };
          const newNoteDocRef = await addDoc(noteCollectionRef, newNoteData);
          const newNote = { id: newNoteDocRef.id, ...newNoteData };
          addNewNote(newNote);
          setShow(false);
        } catch (error) {
          toast.error("Error adding note to user document");
        }
      }
    }
  };

  const cancelModal = () => {
    setShow(false);
  };

  return (
    <Overlay show={show} setShow={setShow} modalRef={modalRef}>
      {show && (
        <div
          ref={modalRef}
          className="m-10 max-w-[405px] p-6 flex h-fit w-full flex-col items-center rounded-[10px] dark:bg-[#1f1f1f] bg-white gap-3"
        >
          <p className="text-center text-lg text-[#221b3a] dark:text-[#eee] font-mono">
            {content}
          </p>
          <form action="" className="w-full">
            <Input
              name="createNote"
              id="createNote"
              value={inputData.title}
              autoComplete="off"
              required
              onChange={handleInputChange}
              type="text"
              placeholder="What's the title of your note?"
            />
          </form>
          {buttonContent && (
            <div className="flex w-full py-2 gap-4">
              <button
                className="w-full py-2 rounded-lg transition-all duration-300 dark:hover:bg-[#b6b5b5] hover:bg-[#e1dfdf] hover:text-black border dark:text-white"
                onClick={cancelModal}
              >
                Cancel
              </button>
              <button
                className="w-full rounded-lg bg-[#e85444] hover:opacity-90 transition-all duration-300  px-4 py-2 text-sm text-white"
                onClick={handleCreateNoteey}
              >
                {buttonContent}
              </button>
            </div>
          )}
        </div>
      )}
    </Overlay>
  );
};

export default CreateNoteModal;
