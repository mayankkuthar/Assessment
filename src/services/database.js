// Import API services for browser use
import { 
  profileApi, 
  packetApi, 
  questionApi, 
  quizApi, 
  quizPacketApi, 
  userApi 
} from './api.js';

// Create services that match the expected interface
export const profileService = {
  getAllProfiles: profileApi.getAllProfiles,
  createProfile: profileApi.createProfile,
  updateProfile: profileApi.updateProfile,
  deleteProfile: profileApi.deleteProfile
};

export const packetService = {
  getAllPackets: packetApi.getAllPackets,
  createPacket: packetApi.createPacket,
  updatePacket: packetApi.updatePacket,
  deletePacket: packetApi.deletePacket
};

export const questionService = {
  createQuestion: questionApi.createQuestion,
  updateQuestion: questionApi.updateQuestion,
  deleteQuestion: questionApi.deleteQuestion
};

export const quizService = {
  getAllQuizzes: quizApi.getAllQuizzes,
  getQuizById: quizApi.getQuizById,
  createQuiz: quizApi.createQuiz,
  updateQuiz: quizApi.updateQuiz,
  deleteQuiz: quizApi.deleteQuiz,
  getAllQuizAssignments: quizApi.getAllQuizAssignments,
  assignQuizToProfiles: quizApi.assignQuizToProfiles,
  removeQuizAssignment: quizApi.removeQuizAssignment
};

export const quizPacketService = {
  getQuizPackets: quizPacketApi.getQuizPackets,
  addPacketsToQuiz: quizPacketApi.addPacketsToQuiz,
  removePacketsFromQuiz: quizPacketApi.removePacketsFromQuiz
};

export const userService = {
  getUserQuizAttempts: userApi.getUserQuizAttempts,
  getAllQuizAttempts: userApi.getAllQuizAttempts,
  getUserStats: userApi.getUserStats,
  getAssignedQuizzesForUser: userApi.getAssignedQuizzesForUser,
  createQuizAttempt: userApi.createQuizAttempt
};

 