// Chat Controller Outline

// -------------------- SINGLE & GROUP CHAT BASE ACTIONS --------------------

// Start or get 1-on-1 chat
const startOrGetPrivateChat = async (req, res) => {};

// Create new group chat
const createGroupChat = async (req, res) => {};

// Get chat details
const getChatDetails = async (req, res) => {};

// Leave chat or delete it
const leaveOrDeleteChat = async (req, res) => {};

// Get all chats for current user (preview)
const getAllChatsForUser = async (req, res) => {};

// -------------------- GROUP CHAT MANAGEMENT ACTIONS --------------------

// Add users to group chat
const addUsersToGroup = async (req, res) => {};

// Remove users from group chat
const removeUsersFromGroup = async (req, res) => {};

// Promote user to admin
const promoteUserToAdmin = async (req, res) => {};

// Demote user from admin
const demoteUserFromAdmin = async (req, res) => {};

export {
  startOrGetPrivateChat,
  createGroupChat,
  getChatDetails,
  leaveOrDeleteChat,
  getAllChatsForUser,
  addUsersToGroup,
  removeUsersFromGroup,
  promoteUserToAdmin,
  demoteUserFromAdmin,
};
