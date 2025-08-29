import { db, generateId } from '../database/sqlite.js';
import crypto from 'crypto';

// Helper function to hash passwords
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper function to parse JSON options
function parseJsonOptions(options) {
  if (!options) return null;
  try {
    return typeof options === 'string' ? JSON.parse(options) : options;
  } catch {
    return null;
  }
}

// Helper function to stringify JSON
function stringifyJson(obj) {
  if (!obj) return null;
  return typeof obj === 'object' ? JSON.stringify(obj) : obj;
}

// Profile Service
export const profileService = {
  async getAllProfiles() {
    try {
      const stmt = db.prepare('SELECT * FROM profiles ORDER BY created_at DESC');
      return stmt.all();
    } catch (error) {
      console.error('Error getting profiles:', error);
      throw new Error('Failed to fetch profiles');
    }
  },

  async createProfile(profile) {
    try {
      const id = generateId();
      const stmt = db.prepare(`
        INSERT INTO profiles (id, name, type)
        VALUES (?, ?, ?)
      `);
      
      stmt.run(id, profile.name, profile.type);
      
      // Return the created profile
      const getStmt = db.prepare('SELECT * FROM profiles WHERE id = ?');
      return getStmt.get(id);
    } catch (error) {
      console.error('Error creating profile:', error);
      throw new Error('Failed to create profile');
    }
  },

  async updateProfile(id, updates) {
    try {
      const fields = Object.keys(updates).filter(key => key !== 'id');
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field]);
      
      const stmt = db.prepare(`UPDATE profiles SET ${setClause} WHERE id = ?`);
      stmt.run(...values, id);
      
      // Return the updated profile
      const getStmt = db.prepare('SELECT * FROM profiles WHERE id = ?');
      return getStmt.get(id);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  },

  async deleteProfile(id) {
    try {
      const stmt = db.prepare('DELETE FROM profiles WHERE id = ?');
      const result = stmt.run(id);
      
      if (result.changes === 0) {
        throw new Error('Profile not found');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw new Error('Failed to delete profile');
    }
  }
};

// Packet Service
export const packetService = {
  async getAllPackets() {
    try {
      const stmt = db.prepare(`
        SELECT p.*, 
               json_group_array(
                 json_object(
                   'id', q.id,
                   'question_text', q.question_text,
                   'question_type', q.question_type,
                   'options', q.options,
                   'correct_answer', q.correct_answer,
                   'created_at', q.created_at,
                   'updated_at', q.updated_at
                 )
               ) as questions
        FROM packets p
        LEFT JOIN questions q ON p.id = q.packet_id
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `);
      
      const packets = stmt.all();
      
      // Process the JSON questions data
      return packets.map(packet => ({
        ...packet,
        questions: packet.questions ? JSON.parse(packet.questions).filter(q => q.id !== null) : []
      }));
    } catch (error) {
      console.error('Error getting packets:', error);
      throw new Error('Failed to fetch packets');
    }
  },

  async createPacket(packet) {
    try {
      const id = generateId();
      const stmt = db.prepare(`
        INSERT INTO packets (id, name, description)
        VALUES (?, ?, ?)
      `);
      
      stmt.run(id, packet.name, packet.description);
      
      // Return the created packet
      const getStmt = db.prepare('SELECT * FROM packets WHERE id = ?');
      const newPacket = getStmt.get(id);
      return { ...newPacket, questions: [] };
    } catch (error) {
      console.error('Error creating packet:', error);
      throw new Error('Failed to create packet');
    }
  },

  async updatePacket(id, updates) {
    try {
      const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'questions');
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field]);
      
      const stmt = db.prepare(`UPDATE packets SET ${setClause} WHERE id = ?`);
      stmt.run(...values, id);
      
      // Return the updated packet with questions
      const getStmt = db.prepare(`
        SELECT p.*, 
               json_group_array(
                 json_object(
                   'id', q.id,
                   'question_text', q.question_text,
                   'question_type', q.question_type,
                   'options', q.options,
                   'correct_answer', q.correct_answer,
                   'created_at', q.created_at,
                   'updated_at', q.updated_at
                 )
               ) as questions
        FROM packets p
        LEFT JOIN questions q ON p.id = q.packet_id
        WHERE p.id = ?
        GROUP BY p.id
      `);
      
      const packet = getStmt.get(id);
      return {
        ...packet,
        questions: packet.questions ? JSON.parse(packet.questions).filter(q => q.id !== null) : []
      };
    } catch (error) {
      console.error('Error updating packet:', error);
      throw new Error('Failed to update packet');
    }
  },

  async deletePacket(id) {
    try {
      const stmt = db.prepare('DELETE FROM packets WHERE id = ?');
      const result = stmt.run(id);
      
      if (result.changes === 0) {
        throw new Error('Packet not found');
      }
    } catch (error) {
      console.error('Error deleting packet:', error);
      throw new Error('Failed to delete packet');
    }
  }
};

// Question Service
export const questionService = {
  async createQuestion(question) {
    try {
      const id = generateId();
      const stmt = db.prepare(`
        INSERT INTO questions (id, packet_id, question_text, question_type, options, correct_answer)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        id,
        question.packet_id,
        question.question_text,
        question.question_type,
        stringifyJson(question.options),
        question.correct_answer
      );
      
      // Return the created question
      const getStmt = db.prepare('SELECT * FROM questions WHERE id = ?');
      const newQuestion = getStmt.get(id);
      return {
        ...newQuestion,
        options: parseJsonOptions(newQuestion.options)
      };
    } catch (error) {
      console.error('Error creating question:', error);
      throw new Error('Failed to create question');
    }
  },

  async updateQuestion(id, updates) {
    try {
      const fields = Object.keys(updates).filter(key => key !== 'id');
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => {
        if (field === 'options') {
          return stringifyJson(updates[field]);
        }
        return updates[field];
      });
      
      const stmt = db.prepare(`UPDATE questions SET ${setClause} WHERE id = ?`);
      stmt.run(...values, id);
      
      // Return the updated question
      const getStmt = db.prepare('SELECT * FROM questions WHERE id = ?');
      const question = getStmt.get(id);
      return {
        ...question,
        options: parseJsonOptions(question.options)
      };
    } catch (error) {
      console.error('Error updating question:', error);
      throw new Error('Failed to update question');
    }
  },

  async deleteQuestion(id) {
    try {
      const stmt = db.prepare('DELETE FROM questions WHERE id = ?');
      const result = stmt.run(id);
      
      if (result.changes === 0) {
        throw new Error('Question not found');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      throw new Error('Failed to delete question');
    }
  }
};

// Quiz Service
export const quizService = {
  async getAllQuizzes() {
    try {
      const stmt = db.prepare('SELECT * FROM quizzes ORDER BY created_at DESC');
      return stmt.all();
    } catch (error) {
      console.error('Error getting quizzes:', error);
      throw new Error('Failed to fetch quizzes');
    }
  },

  async createQuiz(quiz) {
    try {
      const id = generateId();
      const stmt = db.prepare(`
        INSERT INTO quizzes (id, name, description, time_limit, passing_score)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      stmt.run(id, quiz.name, quiz.description, quiz.time_limit, quiz.passing_score || 70);
      
      // Return the created quiz
      const getStmt = db.prepare('SELECT * FROM quizzes WHERE id = ?');
      return getStmt.get(id);
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw new Error('Failed to create quiz');
    }
  },

  async updateQuiz(id, updates) {
    try {
      const fields = Object.keys(updates).filter(key => key !== 'id');
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field]);
      
      const stmt = db.prepare(`UPDATE quizzes SET ${setClause} WHERE id = ?`);
      stmt.run(...values, id);
      
      // Return the updated quiz
      const getStmt = db.prepare('SELECT * FROM quizzes WHERE id = ?');
      return getStmt.get(id);
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw new Error('Failed to update quiz');
    }
  },

  async deleteQuiz(id) {
    try {
      const stmt = db.prepare('DELETE FROM quizzes WHERE id = ?');
      const result = stmt.run(id);
      
      if (result.changes === 0) {
        throw new Error('Quiz not found');
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw new Error('Failed to delete quiz');
    }
  },

  async assignQuizToProfiles(quizId, profileIds) {
    try {
      const stmt = db.prepare(`
        INSERT OR IGNORE INTO quiz_assignments (id, quiz_id, profile_id)
        VALUES (?, ?, ?)
      `);
      
      const insertMany = db.transaction((assignments) => {
        for (const assignment of assignments) {
          stmt.run(assignment.id, assignment.quiz_id, assignment.profile_id);
        }
      });
      
      const assignments = profileIds.map(profileId => ({
        id: generateId(),
        quiz_id: quizId,
        profile_id: profileId
      }));
      
      insertMany(assignments);
    } catch (error) {
      console.error('Error assigning quiz to profiles:', error);
      throw new Error('Failed to assign quiz to profiles');
    }
  },

  async getQuizById(id) {
    try {
      const stmt = db.prepare('SELECT * FROM quizzes WHERE id = ?');
      const quiz = stmt.get(id);
      
      if (!quiz) {
        throw new Error('Quiz not found');
      }
      
      return quiz;
    } catch (error) {
      console.error('Error getting quiz by ID:', error);
      throw new Error('Failed to fetch quiz');
    }
  },

  async getAllQuizAssignments() {
    try {
      const stmt = db.prepare(`
        SELECT qa.*, q.name as quiz_name, p.name as profile_name
        FROM quiz_assignments qa
        JOIN quizzes q ON qa.quiz_id = q.id
        JOIN profiles p ON qa.profile_id = p.id
        ORDER BY qa.created_at DESC
      `);
      return stmt.all();
    } catch (error) {
      console.error('Error getting quiz assignments:', error);
      throw new Error('Failed to fetch quiz assignments');
    }
  },

  async removeQuizAssignment(profileId, quizId) {
    try {
      const stmt = db.prepare('DELETE FROM quiz_assignments WHERE profile_id = ? AND quiz_id = ?');
      const result = stmt.run(profileId, quizId);
      
      if (result.changes === 0) {
        throw new Error('Assignment not found');
      }
    } catch (error) {
      console.error('Error removing quiz assignment:', error);
      throw new Error('Failed to remove quiz assignment');
    }
  }
};

// Quiz Packet Service
export const quizPacketService = {
  async addPacketsToQuiz(quizId, packetIds) {
    try {
      const stmt = db.prepare(`
        INSERT OR IGNORE INTO quiz_packets (id, quiz_id, packet_id)
        VALUES (?, ?, ?)
      `);
      
      const insertMany = db.transaction((packets) => {
        for (const packet of packets) {
          stmt.run(packet.id, packet.quiz_id, packet.packet_id);
        }
      });
      
      const packets = packetIds.map(packetId => ({
        id: generateId(),
        quiz_id: quizId,
        packet_id: packetId
      }));
      
      insertMany(packets);
    } catch (error) {
      console.error('Error adding packets to quiz:', error);
      throw new Error('Failed to add packets to quiz');
    }
  },

  async removePacketsFromQuiz(quizId, packetIds) {
    try {
      const placeholders = packetIds.map(() => '?').join(',');
      const stmt = db.prepare(`DELETE FROM quiz_packets WHERE quiz_id = ? AND packet_id IN (${placeholders})`);
      stmt.run(quizId, ...packetIds);
    } catch (error) {
      console.error('Error removing packets from quiz:', error);
      throw new Error('Failed to remove packets from quiz');
    }
  },

  async getQuizPackets(quizId) {
    try {
      const stmt = db.prepare(`
        SELECT p.*, 
               json_group_array(
                 json_object(
                   'id', q.id,
                   'question_text', q.question_text,
                   'question_type', q.question_type,
                   'options', q.options,
                   'correct_answer', q.correct_answer,
                   'created_at', q.created_at,
                   'updated_at', q.updated_at
                 )
               ) as questions
        FROM quiz_packets qp
        JOIN packets p ON qp.packet_id = p.id
        LEFT JOIN questions q ON p.id = q.packet_id
        WHERE qp.quiz_id = ?
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `);
      
      const packets = stmt.all(quizId);
      
      return packets.map(packet => ({
        ...packet,
        questions: packet.questions ? JSON.parse(packet.questions).filter(q => q.id !== null) : []
      }));
    } catch (error) {
      console.error('Error getting quiz packets:', error);
      throw new Error('Failed to fetch quiz packets');
    }
  }
};

// User Service
export const userService = {
  async createUser(email, password, role = 'user') {
    try {
      const id = generateId();
      const passwordHash = hashPassword(password);
      
      const stmt = db.prepare(`
        INSERT INTO users (id, email, password_hash, role)
        VALUES (?, ?, ?, ?)
      `);
      
      stmt.run(id, email, passwordHash, role);
      
      // Also create user_roles entry for compatibility
      const roleStmt = db.prepare(`
        INSERT INTO user_roles (id, user_id, role, email)
        VALUES (?, ?, ?, ?)
      `);
      
      roleStmt.run(generateId(), id, role, email);
      
      // Return user without password hash
      return { id, email, role };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('User with this email already exists');
      }
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  },

  async validateUser(email, password) {
    try {
      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      const user = stmt.get(email);
      
      if (!user) {
        return null;
      }
      
      const passwordHash = hashPassword(password);
      if (passwordHash !== user.password_hash) {
        return null;
      }
      
      // Return user without password hash
      return {
        id: user.id,
        email: user.email,
        role: user.role
      };
    } catch (error) {
      console.error('Error validating user:', error);
      return null;
    }
  },

  async createSession(userId, expiresInDays = 7) {
    try {
      const sessionId = generateId();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
      
      const stmt = db.prepare(`
        INSERT INTO sessions (id, user_id, expires_at)
        VALUES (?, ?, ?)
      `);
      
      stmt.run(sessionId, userId, expiresAt.toISOString());
      
      return { id: sessionId, expires_at: expiresAt.toISOString() };
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  },

  async validateSession(sessionId) {
    try {
      const stmt = db.prepare(`
        SELECT s.*, u.id as user_id, u.email, u.role
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ? AND datetime(s.expires_at) > datetime('now')
      `);
      
      const session = stmt.get(sessionId);
      return session || null;
    } catch (error) {
      console.error('Error validating session:', error);
      return null;
    }
  },

  async getUserRole(userId) {
    try {
      const stmt = db.prepare('SELECT role FROM users WHERE id = ?');
      const user = stmt.get(userId);
      return user?.role || 'user';
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'user';
    }
  },

  async getUserQuizAttempts(userId) {
    try {
      const stmt = db.prepare(`
        SELECT qa.*, q.name as quiz_name, p.name as profile_name
        FROM quiz_attempts qa
        JOIN quizzes q ON qa.quiz_id = q.id
        LEFT JOIN profiles p ON qa.profile_id = p.id
        WHERE qa.user_id = ?
        ORDER BY qa.created_at DESC
      `);
      
      const attempts = stmt.all(userId);
      
      return attempts.map(attempt => ({
        ...attempt,
        quiz: { name: attempt.quiz_name },
        profile: attempt.profile_name ? { name: attempt.profile_name } : null,
        answers: parseJsonOptions(attempt.answers)
      }));
    } catch (error) {
      console.error('Error getting user quiz attempts:', error);
      throw new Error('Failed to fetch user quiz attempts');
    }
  },

  async getAllQuizAttempts() {
    try {
      const stmt = db.prepare(`
        SELECT qa.*, q.name as quiz_name, p.name as profile_name, u.email as user_email
        FROM quiz_attempts qa
        JOIN quizzes q ON qa.quiz_id = q.id
        JOIN users u ON qa.user_id = u.id
        LEFT JOIN profiles p ON qa.profile_id = p.id
        ORDER BY qa.created_at DESC
      `);
      
      const attempts = stmt.all();
      
      return attempts.map(attempt => ({
        ...attempt,
        quiz: { name: attempt.quiz_name },
        profile: attempt.profile_name ? { name: attempt.profile_name } : null,
        user: { email: attempt.user_email },
        answers: parseJsonOptions(attempt.answers)
      }));
    } catch (error) {
      console.error('Error getting all quiz attempts:', error);
      throw new Error('Failed to fetch all quiz attempts');
    }
  },

  async getUserStats(userId) {
    try {
      const stmt = db.prepare(`
        SELECT 
          COUNT(*) as total_attempts,
          AVG(score) as average_score,
          SUM(total_questions) as total_questions,
          SUM(correct_answers) as total_correct,
          ROUND(AVG(CASE WHEN completed_at IS NOT NULL THEN 1.0 ELSE 0.0 END) * 100) as completion_rate
        FROM quiz_attempts
        WHERE user_id = ?
      `);
      
      const stats = stmt.get(userId);
      
      return {
        totalAttempts: stats.total_attempts || 0,
        averageScore: Math.round(stats.average_score || 0),
        totalQuestions: stats.total_questions || 0,
        totalCorrect: stats.total_correct || 0,
        completionRate: stats.completion_rate || 0
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw new Error('Failed to fetch user stats');
    }
  },

  async getAssignedQuizzesForUser(userId) {
    try {
      // For now, return all quizzes as we don't have direct user-profile mapping
      const stmt = db.prepare('SELECT * FROM quizzes ORDER BY created_at DESC');
      return stmt.all();
    } catch (error) {
      console.error('Error getting assigned quizzes:', error);
      throw new Error('Failed to fetch assigned quizzes');
    }
  },

  async createQuizAttempt(attemptData) {
    try {
      const id = generateId();
      const stmt = db.prepare(`
        INSERT INTO quiz_attempts (
          id, quiz_id, user_id, profile_id, score, total_questions, 
          correct_answers, time_taken, started_at, completed_at, answers
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        id,
        attemptData.quiz_id,
        attemptData.user_id,
        attemptData.profile_id,
        attemptData.score,
        attemptData.total_questions,
        attemptData.correct_answers,
        attemptData.time_taken,
        attemptData.started_at,
        attemptData.completed_at,
        stringifyJson(attemptData.answers)
      );
      
      // Return the created attempt
      const getStmt = db.prepare('SELECT * FROM quiz_attempts WHERE id = ?');
      const attempt = getStmt.get(id);
      
      return {
        ...attempt,
        answers: parseJsonOptions(attempt.answers)
      };
    } catch (error) {
      console.error('Error creating quiz attempt:', error);
      throw new Error('Failed to create quiz attempt');
    }
  },

  async deleteSession(sessionId) {
    try {
      const stmt = db.prepare('DELETE FROM sessions WHERE id = ?');
      stmt.run(sessionId);
    } catch (error) {
      console.error('Error deleting session:', error);
      throw new Error('Failed to delete session');
    }
  }
};
