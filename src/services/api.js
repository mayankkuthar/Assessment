// API service to replace direct SQLite calls in the browser
const API_BASE = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function apiCall(endpoint, options = {}) {
  try {
    console.log('🔍 API call to:', `${API_BASE}${endpoint}`);
    console.log('🔍 API call options:', options);
    if (options.body) {
      console.log('🔍 API call body:', JSON.parse(options.body));
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new ApiError(errorData.error || `HTTP ${response.status}`, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('API call failed:', error);
    throw new ApiError('Network error - please check your connection', 0);
  }
}

// Auth API
export const authApi = {
  async signUp(email, password, role = 'user', user_name, profile) {
    return await apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, role, user_name, profile }),
    });
  },

  async signIn(email, password) {
    return await apiCall('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async signOut() {
    return await apiCall('/auth/signout', { method: 'POST' });
  },

  async getUser() {
    return await apiCall('/auth/user');
  }
};

// Profile API
export const profileApi = {
  async getAllProfiles() {
    return await apiCall('/profiles');
  },

  async createProfile(profile) {
    return await apiCall('/profiles', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  },

  async updateProfile(id, updates) {
    return await apiCall(`/profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteProfile(id) {
    return await apiCall(`/profiles/${id}`, { method: 'DELETE' });
  }
};

// Packet API
export const packetApi = {
  async getAllPackets() {
    return await apiCall('/packets');
  },

  async createPacket(packet) {
    return await apiCall('/packets', {
      method: 'POST',
      body: JSON.stringify(packet),
    });
  },

  async updatePacket(id, updates) {
    return await apiCall(`/packets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deletePacket(id) {
    return await apiCall(`/packets/${id}`, { method: 'DELETE' });
  }
};

// Question API
export const questionApi = {
  async createQuestion(question) {
    return await apiCall('/questions', {
      method: 'POST',
      body: JSON.stringify(question),
    });
  },

  async updateQuestion(id, updates) {
    console.log('🔍 API updateQuestion called with:', { id, updates });
    console.log('🔍 Updates options:', updates.options);
    console.log('🔍 Updates marks:', updates.marks);
    const result = await apiCall(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    console.log('🔍 API updateQuestion response:', result);
    return result;
  },

  async deleteQuestion(id) {
    return await apiCall(`/questions/${id}`, { method: 'DELETE' });
  }
};

// Quiz API
export const quizApi = {
  async getAllQuizzes() {
    return await apiCall('/quizzes');
  },

  async getQuizById(id) {
    return await apiCall(`/quizzes/${id}`);
  },

  async createQuiz(quiz) {
    return await apiCall('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quiz),
    });
  },

  async updateQuiz(id, updates) {
    return await apiCall(`/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteQuiz(id) {
    return await apiCall(`/quizzes/${id}`, { method: 'DELETE' });
  },

  async getAllQuizAssignments() {
    return await apiCall('/quiz-assignments');
  },

  async assignQuizToProfiles(quizId, profileIds) {
    return await apiCall('/quiz-assignments', {
      method: 'POST',
      body: JSON.stringify({ quizId, profileIds }),
    });
  },

  async removeQuizAssignment(profileId, quizId) {
    return await apiCall(`/quiz-assignments/profile/${profileId}/quiz/${quizId}`, {
      method: 'DELETE',
    });
  }
};

// Quiz Packet API
export const quizPacketApi = {
  async getQuizPackets(quizId) {
    return await apiCall(`/quiz-packets/${quizId}`);
  },

  async addPacketsToQuiz(quizId, packetIds) {
    return await apiCall(`/quiz-packets/${quizId}`, {
      method: 'POST',
      body: JSON.stringify({ packetIds }),
    });
  },

  async removePacketsFromQuiz(quizId, packetIds) {
    return await apiCall(`/quiz-packets/${quizId}`, {
      method: 'DELETE',
      body: JSON.stringify({ packetIds }),
    });
  }
};

// User API
export const userApi = {
  async getUserQuizAttempts(userId) {
    return await apiCall(`/users/${userId}/quiz-attempts`);
  },

  async getAllQuizAttempts() {
    return await apiCall('/quiz-attempts');
  },

  async getUserStats(userId) {
    return await apiCall(`/users/${userId}/stats`);
  },

  async getAssignedQuizzesForUser(userId) {
    return await apiCall(`/users/${userId}/assigned-quizzes`);
  },

  async createQuizAttempt(attemptData) {
    return await apiCall('/quiz-attempts', {
      method: 'POST',
      body: JSON.stringify(attemptData),
    });
  }
};
