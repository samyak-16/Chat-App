// Message Controller Outline

// Send a message to a chat
const sendMessage = async (req, res) => {}

// Get messages in a chat (with pagination)
const getMessages = async (req, res) => {}

// Mark a message as seen
const markMessageAsSeen = async (req, res) => {}

// Soft delete a message for current user
const softDeleteMessage = async (req, res) => {}

export {
  sendMessage,
  getMessages,
  markMessageAsSeen,
  softDeleteMessage
};
