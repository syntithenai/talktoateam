import { useState, useEffect, useCallback } from 'react';
import { TextModel } from "@visheratin/web-ai/text";
import localforage from 'localforage';
const { Voy } = await import("voy-search");

export default function useVoyFileManager({file}) {
    const [model, setModel] = useState(null);
    const [index, setIndex] = useState(null);
    const [fragments, setFragments] = useState([]);

    useEffect(() => {
        const init = async () => {
            // Initialize the text model for embeddings
            const textModel = await (await TextModel.create("gtr-t5-quant")).model;
            setModel(textModel);

            // Initialize IndexedDB
            const db = localforage.createInstance({
                name: 'voyFileManagerDB'
            });

            // Load fragments and build the index if there are any fragments
            const keys = await db.keys();
            if (keys.length > 0) {
                const data = await Promise.all(keys.map(async key => {
                    const { document, embeddings } = await db.getItem(key);
                    return { id: key, title: document, embeddings };
                }));
                setIndex(new Voy({ embeddings: data }));
                setFragments(data);
            }
        };

        init();
    }, []);

    const generateEmbeddings = useCallback(async (document) => {
        if (!model) {
            throw new Error("Model is not initialized.");
        }
        const processed = await model.process(document);
        return processed.result;
    }, [model]);

    const addFragment = useCallback(async (id, document) => {
        try {
            const embeddings = await generateEmbeddings(document);
            const docData = { document, embeddings };

            // Save document and embeddings to IndexedDB
            const db = localforage.createInstance({
                name: 'voyFileManagerDB'
            });
            await db.setItem(id, docData);

            // Update the fragments and index
            const newDocEntry = { id, title: document, embeddings };
            const updatedFragments = [...fragments, newDocEntry];
            setFragments(updatedFragments);
            setIndex(new Voy({ embeddings: updatedFragments }));

            console.log(`Fragment with ID ${id} added successfully.`);
        } catch (error) {
            console.error(`Error adding document with ID ${id}:`, error);
        }
    }, [fragments, generateEmbeddings]);

    const updateFragment = useCallback(async (id, document) => {
        try {
            const embeddings = await generateEmbeddings(document);
            const docData = { document, embeddings };

            // Update document and embeddings in IndexedDB
            const db = localforage.createInstance({
                name: 'voyFileManagerDB'
            });
            await db.setItem(id, docData);

            // Update the fragments and index
            const updatedFragments = fragments.map(doc => 
                doc.id === id ? { ...doc, title: document, embeddings } : doc
            );
            setFragments(updatedFragments);
            setIndex(new Voy({ embeddings: updatedFragments }));

            console.log(`Fragment with ID ${id} updated successfully.`);
        } catch (error) {
            console.error(`Error updating document with ID ${id}:`, error);
        }
    }, [fragments, generateEmbeddings]);

    const deleteFragment = useCallback(async (id) => {
        try {
            const db = localforage.createInstance({
                name: 'voyFileManagerDB'
            });
            await db.removeItem(id);

            // Update the fragments and index
            const updatedFragments = fragments.filter(doc => doc.id !== id);
            setFragments(updatedFragments);
            setIndex(new Voy({ embeddings: updatedFragments }));

            console.log(`Fragment with ID ${id} deleted successfully.`);
        } catch (error) {
            console.error(`Error deleting document with ID ${id}:`, error);
        }
    }, [fragments]);

    const getFragment = useCallback(async (id) => {
        try {
            const db = localforage.createInstance({
                name: 'voyFileManagerDB'
            });
            const docData = await db.getItem(id);
            if (docData) {
                console.log(`Fragment with ID ${id} retrieved successfully.`);
                return docData.document;
            } else {
                console.log(`Fragment with ID ${id} not found.`);
                return null;
            }
        } catch (error) {
            console.error(`Error retrieving document with ID ${id}:`, error);
        }
    }, []);

    const searchFragments = useCallback(async (query, limit = 1) => {
        try {
            const q = await generateEmbeddings(query);
            const result = index.search(q, limit);

            const searchResults = result.neighbors.map(({ id }) => {
                const docEntry = fragments.find(doc => doc.id === id);
                return docEntry ? { id: docEntry.id, document: docEntry.title } : null;
            }).filter(doc => doc !== null);

            console.log(`Search completed. Found ${searchResults.length} matching fragments.`);
            return searchResults;
        } catch (error) {
            console.error('Error searching fragments:', error);
        }
    }, [index, fragments, generateEmbeddings]);

    return {
        addFragment,
        updateFragment,
        deleteFragment,
        getFragment,
        searchFragments
    };
};
