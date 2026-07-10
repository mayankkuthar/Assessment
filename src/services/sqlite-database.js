import { db, generateId, generateOnboardingCode, generateUniqueEmployeeCode } from '../database/sqlite.js';
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

// Organization Service
export const organizationService = {
  async getAllOrganizations() {
    try {
      const stmt = db.prepare('SELECT * FROM organizations ORDER BY created_at DESC');
      return stmt.all();
    } catch (error) {
      console.error('Error getting organizations:', error);
      throw new Error('Failed to fetch organizations');
    }
  },

  async createOrganization(org) {
    try {
      const id = generateId();
      const status = org.status || 'active';
      const code = generateOnboardingCode();
      const onboardedAt = org.onboarded_at || new Date().toISOString();
      const stmt = db.prepare(`
        INSERT INTO organizations (id, name, description, status, onboarding_code, onboarded_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(id, org.name, org.description || null, status, code, onboardedAt);
      
      const getStmt = db.prepare('SELECT * FROM organizations WHERE id = ?');
      return getStmt.get(id);
    } catch (error) {
      console.error('Error creating organization:', error);
      throw new Error('Failed to create organization');
    }
  },

  async updateOrganization(id, updates) {
    try {
      const fields = Object.keys(updates).filter(key => key !== 'id');
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field]);
      
      const stmt = db.prepare(`UPDATE organizations SET ${setClause} WHERE id = ?`);
      stmt.run(...values, id);
      
      const getStmt = db.prepare('SELECT * FROM organizations WHERE id = ?');
      return getStmt.get(id);
    } catch (error) {
      console.error('Error updating organization:', error);
      throw new Error('Failed to update organization');
    }
  },

  async deleteOrganization(id) {
    try {
      const stmt = db.prepare('DELETE FROM organizations WHERE id = ?');
      const result = stmt.run(id);
      
      if (result.changes === 0) {
        throw new Error('Organization not found');
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
      throw new Error('Failed to delete organization');
    }
  },

  async regenerateOnboardingCode(orgId) {
    try {
      const code = generateOnboardingCode();
      const stmt = db.prepare('UPDATE organizations SET onboarding_code = ? WHERE id = ?');
      const result = stmt.run(code, orgId);
      if (result.changes === 0) {
        throw new Error('Organization not found');
      }
      return { onboarding_code: code };
    } catch (error) {
      console.error('Error regenerating onboarding code:', error);
      throw new Error('Failed to regenerate onboarding code');
    }
  }
};

// Employee Service
export const employeeService = {
  async getEmployeesByOrg(orgId) {
    try {
      const stmt = db.prepare(`
        SELECT e.*, 
               (CASE WHEN u.id IS NOT NULL THEN 1 ELSE 0 END) as registered 
        FROM employees e 
        LEFT JOIN users u ON LOWER(e.email) = LOWER(u.email) AND e.organization_id = u.organization_id
        WHERE e.organization_id = ?
        ORDER BY e.created_at DESC
      `);
      const rows = stmt.all(orgId);
      // Parse metadata from JSON strings back to objects
      return rows.map(r => ({
        ...r,
        metadata: r.metadata ? JSON.parse(r.metadata) : {}
      }));
    } catch (error) {
      console.error('Error getting employees:', error);
      throw new Error('Failed to fetch employees');
    }
  },

  async importEmployees(orgId, employeesList) {
    const insertTransaction = db.transaction((list) => {
      const stmt = db.prepare(`
        INSERT INTO employees (id, organization_id, name, email, code, metadata)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const imported = [];
      for (const emp of list) {
        const id = generateId();
        const code = generateUniqueEmployeeCode(db);
        const metadataStr = JSON.stringify(emp.metadata || {});
        stmt.run(id, orgId, emp.name, emp.email, code, metadataStr);
        imported.push({
          id,
          organization_id: orgId,
          name: emp.name,
          email: emp.email,
          code,
          metadata: emp.metadata || {}
        });
      }
      return imported;
    });

    try {
      return insertTransaction(employeesList);
    } catch (error) {
      console.error('Error importing employees:', error);
      throw new Error(error.message || 'Failed to import employees');
    }
  },

  async deleteEmployee(id) {
    try {
      const stmt = db.prepare('DELETE FROM employees WHERE id = ?');
      const result = stmt.run(id);
      if (result.changes === 0) {
        throw new Error('Employee not found');
      }
      return true;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw new Error('Failed to delete employee');
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
        questions: packet.questions 
          ? JSON.parse(packet.questions)
              .filter(q => q.id !== null)
              .map(q => ({
                ...q,
                options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
              }))
          : []
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
        questions: packet.questions 
          ? JSON.parse(packet.questions)
              .filter(q => q.id !== null)
              .map(q => ({
                ...q,
                options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
              }))
          : []
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
        INSERT INTO quizzes (id, name, description, time_limit, passing_score, report_header, report_footer)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        id, 
        quiz.name, 
        quiz.description, 
        quiz.time_limit, 
        quiz.passing_score || 70,
        quiz.report_header || '',
        quiz.report_footer || ''
      );
      
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
        questions: packet.questions 
          ? JSON.parse(packet.questions)
              .filter(q => q.id !== null)
              .map(q => ({
                ...q,
                options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
              }))
          : []
      }));
    } catch (error) {
      console.error('Error getting quiz packets:', error);
      throw new Error('Failed to fetch quiz packets');
    }
  }
};

// User Service
export const userService = {
  async createUser(email, password, role = 'user', organizationId = null) {
    try {
      const id = generateId();
      const passwordHash = hashPassword(password);
      
      const stmt = db.prepare(`
        INSERT INTO users (id, email, password_hash, role, organization_id)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      stmt.run(id, email, passwordHash, role, organizationId);
      
      // Also create user_roles entry for compatibility
      const roleStmt = db.prepare(`
        INSERT INTO user_roles (id, user_id, role, email)
        VALUES (?, ?, ?, ?)
      `);
      
      roleStmt.run(generateId(), id, role, email);
      
      // Return user without password hash
      return { id, email, role, organization_id: organizationId };
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
        role: user.role,
        organization_id: user.organization_id
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
        SELECT s.*, u.id as user_id, u.email, u.role, u.organization_id
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

  async findOrganizationByCode(code) {
    try {
      const stmt = db.prepare(`
        SELECT o.id, o.name, o.status, e.email, e.name as employeeName
        FROM employees e
        JOIN organizations o ON e.organization_id = o.id
        WHERE e.code = ?
      `);
      return stmt.get(code) || null;
    } catch (error) {
      console.error('Error finding organization by employee code:', error);
      return null;
    }
  },

  async linkUserToOrganization(userId, orgId) {
    try {
      const stmt = db.prepare('UPDATE users SET organization_id = ? WHERE id = ?');
      const result = stmt.run(orgId, userId);
      return result.changes > 0;
    } catch (error) {
      console.error('Error linking user to organization:', error);
      throw new Error('Failed to link user to organization');
    }
  },

  async getAllUsers() {
    try {
      const stmt = db.prepare(`
        SELECT u.id, u.email, u.role, u.organization_id,
               e.name as employee_name,
               o.name as organization_name
        FROM users u
        LEFT JOIN employees e ON LOWER(u.email) = LOWER(e.email) AND u.organization_id = e.organization_id
        LEFT JOIN organizations o ON u.organization_id = o.id
      `);
      const rows = stmt.all();
      return rows.map(r => ({
        id: r.id,
        email: r.email,
        role: r.role,
        organization_id: r.organization_id,
        user_name: r.employee_name || (r.email ? r.email.split('@')[0] : `User ${r.id}`),
        organization: r.organization_name || 'Individual'
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw new Error('Failed to fetch all users');
    }
  },

  async getUserById(id) {
    try {
      const stmt = db.prepare(`
        SELECT u.id, u.email, u.role, u.organization_id,
               e.name as employee_name,
               o.name as organization_name
        FROM users u
        LEFT JOIN employees e ON LOWER(u.email) = LOWER(e.email) AND u.organization_id = e.organization_id
        LEFT JOIN organizations o ON u.organization_id = o.id
        WHERE u.id = ?
      `);
      const r = stmt.get(id);
      if (!r) return null;
      return {
        id: r.id,
        email: r.email,
        role: r.role,
        organization_id: r.organization_id,
        user_name: r.employee_name || (r.email ? r.email.split('@')[0] : `User ${r.id}`),
        organization: r.organization_name || 'Individual'
      };
    } catch (error) {
      console.error('Error getting user by id:', error);
      throw new Error('Failed to fetch user');
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
        answers: parseJsonOptions(attempt.answers),
        packet_marks: parseJsonOptions(attempt.packet_marks)
      }));
    } catch (error) {
      console.error('Error getting user quiz attempts:', error);
      throw new Error('Failed to fetch user quiz attempts');
    }
  },

  async getAllQuizAttempts() {
    try {
      const stmt = db.prepare(`
        SELECT qa.*, q.name as quiz_name, p.name as profile_name,
               u.email as user_email,
               e.name as employee_name,
               o.name as organization_name
        FROM quiz_attempts qa
        JOIN quizzes q ON qa.quiz_id = q.id
        JOIN users u ON qa.user_id = u.id
        LEFT JOIN employees e ON LOWER(u.email) = LOWER(e.email) AND u.organization_id = e.organization_id
        LEFT JOIN organizations o ON u.organization_id = o.id
        LEFT JOIN profiles p ON qa.profile_id = p.id
        ORDER BY qa.created_at DESC
      `);

      const attempts = stmt.all();

      return attempts.map(attempt => {
        const userName = attempt.employee_name
          || (attempt.user_email ? attempt.user_email.split('@')[0] : `User ${attempt.user_id}`);
        return {
          ...attempt,
          quiz: { name: attempt.quiz_name },
          profile: attempt.profile_name ? { name: attempt.profile_name } : null,
          user: {
            user_name: userName,
            name: userName,
            email: attempt.user_email || null,
            organization: attempt.organization_name || 'Individual'
          },
          answers: parseJsonOptions(attempt.answers),
          packet_marks: parseJsonOptions(attempt.packet_marks)
        };
      });
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
      const id = attemptData.id || generateId();
      const stmt = db.prepare(`
        INSERT INTO quiz_attempts (
          id, quiz_id, user_id, profile_id, score, total_questions, 
          correct_answers, time_taken, started_at, completed_at, answers,
          status, current_question_index, packet_marks, total_marks
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        id,
        attemptData.quiz_id,
        attemptData.user_id,
        attemptData.profile_id,
        attemptData.score || 0,
        attemptData.total_questions || 0,
        attemptData.correct_answers || 0,
        attemptData.time_taken || null,
        attemptData.started_at || new Date().toISOString(),
        attemptData.completed_at || null,
        stringifyJson(attemptData.answers || {}),
        attemptData.status || 'completed',
        attemptData.current_question_index || 0,
        stringifyJson(attemptData.packet_marks || {}),
        attemptData.total_marks || 0
      );
      
      // Return the created attempt
      const getStmt = db.prepare('SELECT * FROM quiz_attempts WHERE id = ?');
      const attempt = getStmt.get(id);
      
      return {
        ...attempt,
        answers: parseJsonOptions(attempt.answers),
        packet_marks: parseJsonOptions(attempt.packet_marks)
      };
    } catch (error) {
      console.error('Error creating quiz attempt:', error);
      throw new Error('Failed to create quiz attempt');
    }
  },

  async updateQuizAttempt(attemptId, attemptData) {
    try {
      const getStmt = db.prepare('SELECT * FROM quiz_attempts WHERE id = ?');
      const attempt = getStmt.get(attemptId);
      if (!attempt) {
        throw new Error('Attempt not found');
      }

      const stmt = db.prepare(`
        UPDATE quiz_attempts
        SET score = ?,
            total_questions = ?,
            correct_answers = ?,
            time_taken = ?,
            completed_at = ?,
            answers = ?,
            status = ?,
            current_question_index = ?,
            packet_marks = ?,
            total_marks = ?
        WHERE id = ?
      `);

      stmt.run(
        attemptData.score !== undefined ? attemptData.score : attempt.score,
        attemptData.total_questions !== undefined ? attemptData.total_questions : attempt.total_questions,
        attemptData.correct_answers !== undefined ? attemptData.correct_answers : attempt.correct_answers,
        attemptData.time_taken !== undefined ? attemptData.time_taken : attempt.time_taken,
        attemptData.completed_at !== undefined ? attemptData.completed_at : attempt.completed_at,
        attemptData.answers ? stringifyJson(attemptData.answers) : attempt.answers,
        attemptData.status !== undefined ? attemptData.status : attempt.status,
        attemptData.current_question_index !== undefined ? attemptData.current_question_index : attempt.current_question_index,
        attemptData.packet_marks ? stringifyJson(attemptData.packet_marks) : attempt.packet_marks,
        attemptData.total_marks !== undefined ? attemptData.total_marks : attempt.total_marks,
        attemptId
      );

      const updatedAttempt = getStmt.get(attemptId);
      return {
        ...updatedAttempt,
        answers: parseJsonOptions(updatedAttempt.answers),
        packet_marks: parseJsonOptions(updatedAttempt.packet_marks)
      };
    } catch (error) {
      console.error('Error updating quiz attempt:', error);
      throw new Error('Failed to update quiz attempt');
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
