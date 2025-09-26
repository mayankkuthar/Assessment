import { useState, useEffect, useCallback } from 'react'
import { 
  profileService, 
  packetService, 
  questionService, 
  quizService, 
  quizPacketService,
  userService
} from '../services/database'

export const useDatabase = () => {
  const [profiles, setProfiles] = useState([])
  const [packets, setPackets] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quizAssignments, setQuizAssignments] = useState([])
  const [userQuizAttempts, setUserQuizAttempts] = useState([])
  const [allQuizAttempts, setAllQuizAttempts] = useState([])
  const [userStats, setUserStats] = useState(null)

  // Load all data on component mount
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use SQLite database directly
      const [profilesData, packetsData, quizzesData, quizAssignmentsData] = await Promise.all([
        profileService.getAllProfiles(),
        packetService.getAllPackets(),
        quizService.getAllQuizzes(),
        quizService.getAllQuizAssignments()
      ])
      
      setProfiles(profilesData)
      setPackets(packetsData)
      setQuizzes(quizzesData)
      setQuizAssignments(quizAssignmentsData)
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Profile operations
  const addProfile = useCallback(async (profile) => {
    try {
      const newProfile = await profileService.createProfile(profile)
      setProfiles(prev => [...prev, newProfile])
      return newProfile
    } catch (err) {
      console.error('Error adding profile:', err)
      setError(err.message)
      throw err
    }
  }, [])

  const updateProfile = useCallback(async (id, updates) => {
    try {
      const updatedProfile = await profileService.updateProfile(id, updates)
      setProfiles(prev => prev.map(p => p.id === id ? updatedProfile : p))
      return updatedProfile
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err.message)
      throw err
    }
  }, [])

  const deleteProfile = useCallback(async (id) => {
    try {
      await profileService.deleteProfile(id)
      setProfiles(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('Error deleting profile:', err)
      setError(err.message)
      throw err
    }
  }, [])

  // Packet operations
  const addPacket = useCallback(async (packet) => {
    try {
      const newPacket = await packetService.createPacket(packet)
      setPackets(prev => [...prev, newPacket])
      return newPacket
    } catch (err) {
      console.error('Error adding packet:', err)
      setError(err.message)
      throw err
    }
  }, [])

  const updatePacket = useCallback(async (id, updates) => {
    try {
      const updatedPacket = await packetService.updatePacket(id, updates)
      // Preserve existing packet data and only update the specified fields
      setPackets(prev => prev.map(p => p.id === id ? { ...p, ...updatedPacket } : p))
      return updatedPacket
    } catch (err) {
      console.error('Error updating packet:', err)
      setError(err.message)
      throw err
    }
  }, [])

  const deletePacket = useCallback(async (id) => {
    try {
      await packetService.deletePacket(id)
      setPackets(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('Error deleting packet:', err)
      setError(err.message)
      throw err
    }
  }, [])

  // Question operations
  const addQuestion = useCallback(async (question) => {
    try {
      const newQuestion = await questionService.createQuestion(question)
      setPackets(prev => prev.map(p => 
        p.id === question.packet_id 
          ? { ...p, questions: [...(p.questions || []), newQuestion] }
          : p
      ))
      return newQuestion
    } catch (err) {
      console.error('Error adding question:', err)
      setError(err.message)
      throw err
    }
  }, [])

  const updateQuestion = useCallback(async (id, updates) => {
    try {
      const updatedQuestion = await questionService.updateQuestion(id, updates)
      setPackets(prev => prev.map(p => ({
        ...p,
        questions: (p.questions || []).map(q => q.id === id ? updatedQuestion : q)
      })))
      return updatedQuestion
    } catch (err) {
      console.error('Error updating question:', err)
      setError(err.message)
      throw err
    }
  }, [])

  const deleteQuestion = useCallback(async (id) => {
    try {
      await questionService.deleteQuestion(id)
      setPackets(prev => prev.map(p => ({
        ...p,
        questions: (p.questions || []).filter(q => q.id !== id)
      })))
    } catch (err) {
      console.error('Error deleting question:', err)
      setError(err.message)
      throw err
    }
  }, [])

  // Quiz operations
  const addQuiz = useCallback(async (quiz) => {
    try {
      const newQuiz = await quizService.createQuiz(quiz)
      setQuizzes(prev => [...prev, newQuiz])
      return newQuiz
    } catch (err) {
      console.error('Error adding quiz:', err)
      setError(err.message)
      throw err
    }
  }, [])

  const updateQuiz = useCallback(async (id, updates) => {
    try {
      const updatedQuiz = await quizService.updateQuiz(id, updates)
      setQuizzes(prev => prev.map(q => q.id === id ? updatedQuiz : q))
      return updatedQuiz
    } catch (err) {
      console.error('Error updating quiz:', err)
      setError(err.message)
      throw err
    }
  }, [])

  const deleteQuiz = useCallback(async (id) => {
    try {
      await quizService.deleteQuiz(id)
      setQuizzes(prev => prev.filter(q => q.id !== id))
    } catch (err) {
      console.error('Error deleting quiz:', err)
      setError(err.message)
      throw err
    }
  }, [])

  // Quiz packet operations
  const addPacketsToQuiz = useCallback(async (quizId, packetIds) => {
    try {
      await quizPacketService.addPacketsToQuiz(quizId, packetIds)
      // Refresh data to show updated relationships
      await loadData()
    } catch (err) {
      console.error('Error adding packets to quiz:', err)
      setError(err.message)
      throw err
    }
  }, [loadData])

  const removePacketsFromQuiz = useCallback(async (quizId, packetIds) => {
    try {
      await quizPacketService.removePacketsFromQuiz(quizId, packetIds)
      // Refresh data to show updated relationships
      await loadData()
    } catch (err) {
      console.error('Error removing packets from quiz:', err)
      setError(err.message)
      throw err
    }
  }, [loadData])

  // Quiz assignment operations
  const assignQuizToProfiles = useCallback(async (quizId, profileIds) => {
    try {
      await quizService.assignQuizToProfiles(quizId, profileIds)
      // Refresh assignments
      const updatedAssignments = await quizService.getAllQuizAssignments()
      setQuizAssignments(updatedAssignments)
    } catch (err) {
      console.error('Error assigning quiz to profiles:', err)
      setError(err.message)
      throw err
    }
  }, [])

  const removeQuizAssignment = useCallback(async (profileId, quizId) => {
    try {
      await quizService.removeQuizAssignment(profileId, quizId)
      const updatedAssignments = await quizService.getAllQuizAssignments()
      setQuizAssignments(updatedAssignments)
    } catch (err) {
      console.error('Error removing quiz assignment:', err)
      setError(err.message)
      throw err
    }
  }, [])

  // Get quiz by ID
  const getQuizById = useCallback(async (id) => {
    try {
      return await quizService.getQuizById(id)
    } catch (err) {
      console.error('Error getting quiz by ID:', err)
      setError(err.message)
      throw err
    }
  }, [])

  // Get quiz packets
  const getQuizPackets = useCallback(async (quizId) => {
    try {
      return await quizPacketService.getQuizPackets(quizId)
    } catch (err) {
      console.error('Error getting quiz packets:', err)
      setError(err.message)
      throw err
    }
  }, [])

  // User-related functions
  const loadUserQuizAttempts = useCallback(async (userId) => {
    try {
      const attempts = await userService.getUserQuizAttempts(userId)
      setUserQuizAttempts(attempts)
      return attempts
    } catch (err) {
      console.error('Error loading user quiz attempts:', err)
      setError(err.message)
      throw err
    }
  }, [])

  const loadAllQuizAttempts = useCallback(async () => {
    try {
      const attempts = await userService.getAllQuizAttempts()
      setAllQuizAttempts(attempts)
      return attempts
    } catch (err) {
      console.error('Error loading all quiz attempts:', err)
      setError(err.message)
      throw err
    }
  }, [])

  const loadUserStats = useCallback(async (userId) => {
    try {
      const stats = await userService.getUserStats(userId)
      setUserStats(stats)
      return stats
    } catch (err) {
      console.error('Error loading user stats:', err)
      setError(err.message)
      throw err
    }
  }, [])

  const getAssignedQuizzesForUser = useCallback(async (userId) => {
    try {
      return await userService.getAssignedQuizzesForUser(userId)
    } catch (err) {
      console.error('Error getting assigned quizzes for user:', err)
      setError(err.message)
      throw err
    }
  }, [])

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    // State
    profiles,
    packets,
    quizzes,
    loading,
    error,
    quizAssignments,
    userQuizAttempts,
    allQuizAttempts,
    userStats,
    
    // Actions
    loadData,
    addProfile,
    updateProfile,
    deleteProfile,
    addPacket,
    updatePacket,
    deletePacket,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addQuiz,
    updateQuiz,
    deleteQuiz,
    addPacketsToQuiz,
    removePacketsFromQuiz,
    assignQuizToProfiles,
    removeQuizAssignment,
    getQuizById,
    getQuizPackets,
    
    // User-related actions
    loadUserQuizAttempts,
    loadAllQuizAttempts,
    loadUserStats,
    getAssignedQuizzesForUser
  }
} 