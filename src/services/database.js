// Import API services for browser use
import { 
  profileApi, 
  organizationApi,
  employeeApi,
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

export const organizationService = {
  getAllOrganizations: organizationApi.getAllOrganizations,
  createOrganization: organizationApi.createOrganization,
  updateOrganization: organizationApi.updateOrganization,
  deleteOrganization: organizationApi.deleteOrganization,
  regenerateOnboardingCode: organizationApi.regenerateOnboardingCode
};

export const employeeService = {
  getEmployeesByOrg: employeeApi.getEmployeesByOrg,
  importEmployees: employeeApi.importEmployees,
  deleteEmployee: employeeApi.deleteEmployee
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
  removeQuizAssignment: quizApi.removeQuizAssignment,
  assignQuizToUsers: quizApi.assignQuizToUsers,
  removeUserQuizAssignment: quizApi.removeUserQuizAssignment
};

export const quizPacketService = {
  getQuizPackets: quizPacketApi.getQuizPackets,
  addPacketsToQuiz: quizPacketApi.addPacketsToQuiz,
  removePacketsFromQuiz: quizPacketApi.removePacketsFromQuiz
};

export const userService = {
  getAllUsers: userApi.getAllUsers,
  getUserQuizAttempts: userApi.getUserQuizAttempts,
  getAllQuizAttempts: userApi.getAllQuizAttempts,
  getUserStats: userApi.getUserStats,
  getAssignedQuizzesForUser: userApi.getAssignedQuizzesForUser,
  createQuizAttempt: userApi.createQuizAttempt,
  updateQuizAttempt: userApi.updateQuizAttempt
};

 