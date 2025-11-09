const getWriters = (req, res) => {
    res.status(200).json({ message: "Get all writers - to be implemented" });
}

const createWriter = (req, res) => {
    res.status(201).json({ message: "Create a new writer - to be implemented" });
}

const editWriter = (req, res) => {
    res.status(200).json({ message: "Edit a writer - to be implemented" });
}

const deleteWriter = (req, res) => {
    res.status(200).json({ message: "Delete a writer - to be implemented" });
}

export {
    getWriters,
    createWriter,
    editWriter,
    deleteWriter
};