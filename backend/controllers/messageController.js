const Message = require('../models/Message');

const sendMessage = async (req, res) => {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    try {
        const newMessage = await Message.create({ senderId, receiverId, message });
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const getStudentMessages = async (req, res) => {
    const studentId = req.user._id;

    try {
        const messages = await Message.find({ receiverId: studentId }).sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const getUnreadCount = async (req, res) => {
    const studentId = req.user._id;

    try {
        const count = await Message.countDocuments({ receiverId: studentId, isRead: false });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        await Message.updateMany({ receiverId: req.user._id, isRead: false }, { isRead: true });
        res.json({ message: 'Messages marked as read' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const getMessagesByFaculty = async (req, res) => {
    const { studentId } = req.params;
    const facultyId = req.user._id;

    try {
        const messages = await Message.find({
            senderId: facultyId,
            receiverId: studentId
        }).sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) return res.status(404).json({ message: 'Message not found' });

        // Only sender can delete
        if (message.senderId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }

        await message.deleteOne();
        res.json({ message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

module.exports = { sendMessage, getStudentMessages, getUnreadCount, markAsRead, getMessagesByFaculty, deleteMessage };
