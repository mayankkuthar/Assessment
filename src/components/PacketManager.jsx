import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SettingsIcon from '@mui/icons-material/Settings';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';

const PacketManager = ({ packets, addPacket, updatePacket, deletePacket, addQuestion, updateQuestion, deleteQuestion, onDataChange }) => {
  const [packetName, setPacketName] = useState('');
  const [packetDescription, setPacketDescription] = useState('');
  const [scoringLogic, setScoringLogic] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('MCQ');
  const [options, setOptions] = useState([
    { text: '', marks: 0 }
  ]);
  const [selectedPacket, setSelectedPacket] = useState(null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editQuestionType, setEditQuestionType] = useState('MCQ');
  const [editOptions, setEditOptions] = useState([
    { text: '', marks: 0 }
  ]);
  const [editingPacket, setEditingPacket] = useState(null);
  const [editPacketName, setEditPacketName] = useState('');
  const [editPacketDescription, setEditPacketDescription] = useState('');
  const [editScoringLogic, setEditScoringLogic] = useState('');

  // Scoring Scale System State
  const [scoringScaleDialog, setScoringScaleDialog] = useState(false);
  const [scoringScale, setScoringScale] = useState([
    { min: 0, max: 2, label: "Needs Improvement", color: "#ff6b6b", image: "📚", largeText: "Keep practicing! You're making progress." },
    { min: 3, max: 5, label: "Average", color: "#ffd93d", image: "📊", largeText: "Good effort! You're on the right track." },
    { min: 6, max: 8, label: "Good", color: "#6bcf7f", image: "🎯", largeText: "Well done! You're showing strong understanding." },
    { min: 9, max: 15, label: "Excellent", color: "#4ecdc4", image: "🏆", largeText: "Outstanding! You've mastered this material!" }
  ]);
  const [enableScoringScale, setEnableScoringScale] = useState(false);

  // Handle question type change
  const handleQuestionTypeChange = (newType) => {
    setQuestionType(newType);
    if (newType === 'MCQ') {
      setOptions([{ text: '', marks: 0 }]);
    } else {
      // For True/False, preserve existing marks if they exist, otherwise use defaults
      if (options.length === 2 && options[0].text === 'True' && options[1].text === 'False') {
        // Keep existing marks if already True/False
        setOptions(options);
      } else {
        // Set default marks for new True/False questions
        setOptions([
          { text: 'True', marks: 3 },
          { text: 'False', marks: 2 }
        ]);
      }
    }
  };

  // Handle edit question type change
  const handleEditQuestionTypeChange = (newType) => {
    console.log('🔍 handleEditQuestionTypeChange called with:', newType);
    console.log('🔍 Current editOptions before change:', editOptions);
    console.log('🔍 Current editQuestionType:', editQuestionType);
    
    // Only change if the type is actually different
    if (newType === editQuestionType) {
      console.log('🔍 Question type unchanged, preserving current options');
      return;
    }
    
    setEditQuestionType(newType);
    if (newType === 'MCQ') {
      setEditOptions([{ text: '', marks: 0 }]);
    } else {
      // For True/False, preserve existing marks if they exist, otherwise use defaults
      if (editOptions.length === 2 && editOptions[0].text === 'True' && editOptions[1].text === 'False') {
        // Keep existing marks if already True/False
        console.log('🔍 Preserving existing True/False marks:', editOptions);
        setEditOptions(editOptions);
      } else {
        // Set default marks for new True/False questions
        console.log('🔍 Setting default True/False marks');
        setEditOptions([
          { text: 'True', marks: 3 },
          { text: 'False', marks: 2 }
        ]);
      }
    }
    console.log('🔍 Final editOptions after change:', editOptions);
  };

  // Add new option for MCQ
  const addOption = () => {
    setOptions([...options, { text: '', marks: 0 }]);
  };

  // Add new option for edit MCQ
  const addEditOption = () => {
    setEditOptions([...editOptions, { text: '', marks: 0 }]);
  };

  // Remove option for MCQ
  const removeOption = (index) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  // Remove option for edit MCQ
  const removeEditOption = (index) => {
    if (editOptions.length > 1) {
      const newOptions = editOptions.filter((_, i) => i !== index);
      setEditOptions(newOptions);
    }
  };

  // Update option text
  const updateOptionText = (index, text) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  // Update edit option text
  const updateEditOptionText = (index, text) => {
    const newOptions = [...editOptions];
    newOptions[index].text = text;
    setEditOptions(newOptions);
  };

  // Update option marks
  const updateOptionMarks = (index, marks) => {
    const newOptions = [...options];
    const parsedMarks = parseInt(marks);
    const finalMarks = isNaN(parsedMarks) ? 0 : parsedMarks;
    console.log(`🔍 updateOptionMarks: index=${index}, input=${marks}, parsed=${parsedMarks}, final=${finalMarks}`);
    newOptions[index].marks = finalMarks;
    setOptions(newOptions);
    console.log(`🔍 Updated options:`, newOptions);
  };

  // Update edit option marks
  const updateEditOptionMarks = (index, marks) => {
    const newOptions = [...editOptions];
    const parsedMarks = parseInt(marks);
    const finalMarks = isNaN(parsedMarks) ? 0 : parsedMarks;
    console.log(`🔍 updateEditOptionMarks: index=${index}, input=${marks}, parsed=${parsedMarks}, final=${finalMarks}`);
    console.log(`🔍 Before update - option ${index}:`, newOptions[index]);
    newOptions[index].marks = finalMarks;
    console.log(`🔍 After update - option ${index}:`, newOptions[index]);
    
    // Update the state
    setEditOptions(newOptions);
    console.log(`🔍 Updated edit options:`, newOptions);
    
    // Store the updated options in a ref to ensure we have the latest values
    window.lastEditOptions = newOptions;
    
    // Force a re-render to ensure state is updated
    setTimeout(() => {
      console.log(`🔍 State after timeout - editOptions:`, editOptions);
      console.log(`🔍 Window stored options:`, window.lastEditOptions);
    }, 100);
  };

  // Image upload handler for scoring scale
  const handleImageUpload = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`🖼️ Uploading image for range ${index}:`, file.name, file.type, file.size);
      
      // Check if file is PNG or JPEG
      if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target.result;
          console.log(`✅ Image ${index} converted to base64, length:`, imageData.length);
          updateScoringScaleRange(index, 'image', imageData);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please upload only PNG or JPEG images.');
      }
    }
  };

  // Scoring Scale System Functions
  const openScoringScaleDialog = () => {
    console.log('Opening scoring scale dialog...');
    console.log('Selected packet:', selectedPacket);
    console.log('Current packet marks:', currentPacketMarks);
    
    if (selectedPacket && currentPacketMarks) {
      // Check if we already have saved scoring scale data for this packet
      const packet = packets.find(p => p.id === selectedPacket);
      
      if (packet && packet.scoringScale && packet.scoringScale.length > 0) {
        // Use existing saved data
        console.log('✅ Loading existing scoring scale data:', packet.scoringScale);
        setScoringScale(packet.scoringScale);
        setEnableScoringScale(packet.enableScoringScale || false);
      } else {
        // Auto-generate ranges only if no existing data
        const minMarks = currentPacketMarks.minMarks;
        const maxMarks = currentPacketMarks.maxMarks;
        const range = maxMarks - minMarks;
        
        console.log('Min marks:', minMarks, 'Max marks:', maxMarks, 'Range:', range);
        
        const newScale = [
          { min: minMarks, max: Math.floor(minMarks + range * 0.25), label: "Needs Improvement", color: "#ff6b6b", image: "📚", largeText: "Keep practicing! You're making progress." },
          { min: Math.floor(minMarks + range * 0.25) + 1, max: Math.floor(minMarks + range * 0.5), label: "Average", color: "#ffd93d", image: "📊", largeText: "Good effort! You're on the right track." },
          { min: Math.floor(minMarks + range * 0.5) + 1, max: Math.floor(minMarks + range * 0.75), label: "Good", color: "#6bcf7f", image: "🎯", largeText: "Well done! You're showing strong understanding." },
          { min: Math.floor(minMarks + range * 0.75) + 1, max: maxMarks, label: "Excellent", color: "#4ecdc4", image: "🏆", largeText: "Outstanding! You've mastered this material!" }
        ];
        
        console.log('🎯 Auto-generated scale ranges:', newScale.map(s => `${s.min}-${s.max}`));
        console.log('New scale:', newScale);
        setScoringScale(newScale);
        setEnableScoringScale(false);
      }
    }
    setScoringScaleDialog(true);
  };

  const closeScoringScaleDialog = () => {
    setScoringScaleDialog(false);
  };

  const updateScoringScaleRange = (index, field, value) => {
    console.log(`🔄 Updating scoring scale range ${index}, field: ${field}, value:`, value);
    console.log('📊 Current scoring scale before update:', scoringScale);
    
    const newScale = [...scoringScale];
    newScale[index][field] = field === 'min' || field === 'max' ? parseInt(value) || 0 : value;
    
    console.log('📊 New scoring scale after update:', newScale);
    setScoringScale(newScale);
  };

  const getScoreLevel = (score) => {
    if (!enableScoringScale || !scoringScale.length) return null;
    
    const level = scoringScale.find(range => score >= range.min && score <= range.max);
    return level || null;
  };

  const saveScoringScale = async () => {
    // Validate ranges - only check that min <= max for each range
    let isValid = true;
    for (let i = 0; i < scoringScale.length; i++) {
      if (scoringScale[i].min > scoringScale[i].max) {
        isValid = false;
        break;
      }
      // Remove the strict connection requirement - allow gaps between ranges
    }
    
    if (isValid) {
      setEnableScoringScale(true);
      
      // Save scoring scale to the selected packet data
      if (selectedPacket) {
        try {
          console.log('🚀 Attempting to save scoring scale for packet:', selectedPacket);
          console.log('📊 Scoring scale data to save:', scoringScale);
          console.log('📊 Scoring scale length:', scoringScale.length);
          console.log('📊 Each range details:');
          scoringScale.forEach((range, idx) => {
            console.log(`  Range ${idx}: min=${range.min}, max=${range.max}, hasImage=${!!range.image}, imageLength=${range.image?.length || 0}`);
          });
          
          // Update the packet with scoring scale data
          const packetToUpdate = {
            scoringScale: scoringScale,
            enableScoringScale: true
          };
          
          console.log('📤 Sending update request with data:', packetToUpdate);
          
          // Validate the data structure before sending
          const isValidData = packetToUpdate.scoringScale.every((range, idx) => {
            const isValid = range && 
                          typeof range.min === 'number' && 
                          typeof range.max === 'number' && 
                          range.min <= range.max &&
                          typeof range.label === 'string' &&
                          typeof range.color === 'string';
            
            if (!isValid) {
              console.error(`❌ Invalid range data at index ${idx}:`, range);
            }
            return isValid;
          });
          
          if (!isValidData) {
            throw new Error('Invalid scoring scale data structure detected');
          }
          
          // Update the packet in the database
          const result = await updatePacket(selectedPacket, packetToUpdate);
          console.log('✅ Scoring scale saved successfully. Server response:', result);
          
          // Refresh the packets list to show updated data
          if (onDataChange) {
            await onDataChange();
          }
        } catch (err) {
          console.error('❌ Failed to save scoring scale to packet:', err);
          console.error('❌ Error details:', err.message, err.stack);
          alert('Failed to save scoring scale. Please try again.');
        }
      } else {
        console.error('❌ No packet selected for saving scoring scale');
        alert('Please select a packet first.');
      }
      
      closeScoringScaleDialog();
    } else {
      alert('Please fix the scoring ranges. Each range must have min <= max.');
    }
  };

  // Set correct answer
  const setCorrectAnswerOption = (optionText) => {
    // This function is no longer needed as correct answer is not tracked per question
  };

  // Set edit correct answer
  const setEditCorrectAnswerOption = (optionText) => {
    // This function is no longer needed as correct answer is not tracked per question
  };

  // Calculate min and max marks for a packet
  const calculatePacketMarks = (packetId) => {
    const packet = packets.find(p => p.id === packetId);
    if (!packet || !packet.questions || packet.questions.length === 0) {
      return { minMarks: 0, maxMarks: 0, totalQuestions: 0 };
    }

    let totalMinMarks = 0;
    let totalMaxMarks = 0;
    let totalQuestions = packet.questions.length;

    packet.questions.forEach(question => {
      if (question.options && Array.isArray(question.options)) {
        // For questions with options, calculate based on individual option marks
        if (typeof question.options[0] === 'object') {
          // New format with individual option marks
          const optionMarks = question.options.map(opt => opt.marks || 1);
          const questionMin = Math.min(...optionMarks); // Worst possible answer
          const questionMax = Math.max(...optionMarks); // Best possible answer
          totalMinMarks += questionMin;
          totalMaxMarks += questionMax;
        } else {
          // Old format - use question marks (fallback)
          totalMinMarks += question.marks || 1;
          totalMaxMarks += question.marks || 1;
        }
      } else {
        // Fallback for questions without options
        totalMinMarks += question.marks || 1;
        totalMaxMarks += question.marks || 1;
      }
    });

    return {
      minMarks: totalMinMarks, // Total marks if student chooses worst answer for every question
      maxMarks: totalMaxMarks, // Total marks if student chooses best answer for every question
      totalQuestions
    };
  };

  // Get current packet marks info
  const currentPacketMarks = selectedPacket ? calculatePacketMarks(selectedPacket) : { minMarks: 0, maxMarks: 0, totalQuestions: 0 };

  // Load scoring scale from packet data when packet is selected
  useEffect(() => {
    if (selectedPacket) {
      const packet = packets.find(p => p.id === selectedPacket);
      console.log('🔍 Loading scoring scale for packet:', selectedPacket);
      console.log('📦 Found packet:', packet);
      console.log('📊 Packet scoring scale:', packet?.scoringScale);
      
      if (packet && packet.scoringScale) {
        setScoringScale(packet.scoringScale);
        setEnableScoringScale(packet.enableScoringScale || false);
        console.log('✅ Loaded scoring scale from packet data:', packet.scoringScale);
        console.log('🖼️ First range image:', packet.scoringScale[0]?.image);
      } else {
        // Reset to default scale if no custom scale found
        setScoringScale([
          { min: 0, max: 2, label: "Needs Improvement", color: "#ff6b6b", image: "📚", largeText: "Keep practicing! You're making progress." },
          { min: 3, max: 5, label: "Average", color: "#ffd93d", image: "📊", largeText: "Good effort! You're on the right track." },
          { min: 6, max: 8, label: "Good", color: "#6bcf7f", image: "🎯", largeText: "Well done! You're showing strong understanding." },
          { min: 9, max: 15, label: "Excellent", color: "#4ecdc4", image: "🏆", largeText: "Outstanding! You've mastered this material!" }
        ]);
        setEnableScoringScale(false);
        console.log('🔄 Reset to default scoring scale');
      }
    }
  }, [selectedPacket, packets]);

  // Recalculate marks when options change during editing
  useEffect(() => {
    if (editingQuestionId && selectedPacket) {
      // Force re-render to update marks calculation when editing
      setSelectedPacket(selectedPacket);
    }
  }, [editOptions, editingQuestionId, selectedPacket]);





  const handleAddPacket = async () => {
    if (packetName) {
      try {
        await addPacket({ 
          name: packetName, 
          description: packetDescription,
          scoringLogic: scoringLogic
        });
        setPacketName('');
        setPacketDescription('');
        setScoringLogic('');
      } catch (error) {
        console.error('Error adding packet:', error);
        alert('Failed to add packet. Please try again.');
      }
    }
  };

  const startEditPacket = (packet) => {
    setEditingPacket(packet.id);
    setEditPacketName(packet.name);
    setEditPacketDescription(packet.description || '');
    setEditScoringLogic(packet.scoringLogic || '');
  };

  const saveEditPacket = async () => {
    if (editPacketName && editingPacket) {
      try {
        await updatePacket(editingPacket, {
          name: editPacketName,
          description: editPacketDescription,
          scoringLogic: editScoringLogic
        });
        setEditingPacket(null);
        setEditPacketName('');
        setEditPacketDescription('');
        setEditScoringLogic('');
      } catch (error) {
        console.error('Error updating packet:', error);
        alert('Failed to update packet. Please try again.');
      }
    }
  };

  const cancelEditPacket = () => {
    setEditingPacket(null);
    setEditPacketName('');
    setEditPacketDescription('');
    setEditScoringLogic('');
  };

  const handleDeletePacket = async (id) => {
    if (window.confirm('Are you sure you want to delete this packet?')) {
      try {
        await deletePacket(id);
        if (selectedPacket === id) setSelectedPacket(null);
      } catch (error) {
        console.error('Error deleting packet:', error);
        alert('Failed to delete packet. Please try again.');
      }
    }
  };

  const handleAddQuestion = async () => {
    if (!questionText || !selectedPacket) return;
    
    try {
      const questionData = {
        packet_id: selectedPacket,
        question_text: questionText,
        question_type: questionType === 'MCQ' ? 'mcq' : 'true_false',
        options: options,
        marks: options.reduce((sum, opt) => sum + opt.marks, 0) // Total marks for the question
      };
      
      console.log('🚀 Frontend sending question data:', questionData);
      console.log('🔍 Options being sent:', options);
      console.log('🔍 Question type:', questionType);
      console.log('🔍 Options structure check:');
      console.log('  - Options is array:', Array.isArray(options));
      console.log('  - Options length:', options.length);
      console.log('  - First option:', options[0]);
      console.log('  - First option has text:', options[0]?.hasOwnProperty('text'));
      console.log('  - First option has marks:', options[0]?.hasOwnProperty('marks'));
      console.log('  - First option text:', options[0]?.text);
      console.log('  - First option marks:', options[0]?.marks);
      
      await addQuestion(questionData);
      setQuestionText('');
      setOptions([{ text: '', marks: 0 }]);
      
      // Force re-render to update marks calculation
      setSelectedPacket(selectedPacket);
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Failed to add question. Please try again.');
    }
  };

  const handleDeleteQuestion = async (qid) => {
    try {
      await deleteQuestion(qid);
      
      // Force re-render to update marks calculation
      setSelectedPacket(selectedPacket);
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Failed to delete question. Please try again.');
    }
  };

  const startEditQuestion = (q) => {
    console.log('🔍 startEditQuestion - Starting edit for question:', q.id);
    console.log('🔍 startEditQuestion - Question data:', q);
    console.log('🔍 startEditQuestion - Question options:', q.options);
    console.log('🔍 startEditQuestion - Question marks:', q.marks);
    console.log('🔍 startEditQuestion - Question type:', q.question_type);
    
    setEditingQuestionId(q.id);
    setEditQuestionText(q.question_text || q.text);
    setEditQuestionType(q.question_type === 'mcq' ? 'MCQ' : 'TrueFalse');
    
    if (q.question_type === 'mcq' && q.options) {
      // Convert options to new format if they're in old format
      if (Array.isArray(q.options) && typeof q.options[0] === 'string') {
        console.log('🔍 Converting MCQ options from old format');
        setEditOptions(q.options.map((opt, idx) => ({
          text: opt,
          marks: q.marks || 0
        })));
      } else {
        console.log('🔍 Using MCQ options as-is');
        setEditOptions(q.options || [{ text: '', marks: 0 }]);
      }
    } else if (q.question_type === 'true_false') {
      // For True/False questions, check if they have individual marks
      if (q.options && Array.isArray(q.options) && q.options.length === 2) {
        // Check if options have individual marks
        const hasIndividualMarks = q.options[0]?.hasOwnProperty('marks') && q.options[1]?.hasOwnProperty('marks');
        
        console.log('🔍 True/False options found:', q.options);
        console.log('🔍 Has individual marks:', hasIndividualMarks);
        console.log('🔍 Option 0:', q.options[0]);
        console.log('🔍 Option 1:', q.options[1]);
        
        if (hasIndividualMarks) {
          // Use existing individual marks
          console.log('🔍 Using existing individual marks:', q.options[0]?.marks, q.options[1]?.marks);
          const newOptions = [
            { text: 'True', marks: q.options[0].marks },
            { text: 'False', marks: q.options[1].marks }
          ];
          console.log('🔍 Setting editOptions to:', newOptions);
          setEditOptions(newOptions);
          
          // Also store in window for debugging
          window.lastEditOptions = newOptions;
        } else {
          // Convert from old format (total marks) to individual marks
          console.log('🔍 Converting from total marks to individual marks');
          const totalMarks = q.marks || 2;
          const trueMarks = Math.ceil(totalMarks * 0.6); // 60% for True
          const falseMarks = totalMarks - trueMarks; // Remaining for False
          
          const newOptions = [
            { text: 'True', marks: trueMarks },
            { text: 'False', marks: falseMarks }
          ];
          console.log('🔍 Setting editOptions to:', newOptions);
          setEditOptions(newOptions);
          
          // Also store in window for debugging
          window.lastEditOptions = newOptions;
        }
      } else {
        // Default marks for new True/False questions
        console.log('🔍 Using default marks for new True/False question');
        const newOptions = [
          { text: 'True', marks: 3 },
          { text: 'False', marks: 2 }
        ];
        console.log('🔍 Setting editOptions to:', newOptions);
        setEditOptions(newOptions);
        
        // Also store in window for debugging
        window.lastEditOptions = newOptions;
      }
    }
    
    console.log('🔍 startEditQuestion - Final editOptions set to:', editOptions);
  };

  const saveEditQuestion = async (qid) => {
    try {
      // Log the current state right before creating updates
      console.log('🔍 saveEditQuestion - Current editOptions state:', editOptions);
      console.log('🔍 saveEditQuestion - Current editQuestionText:', editQuestionText);
      console.log('🔍 saveEditQuestion - Current editQuestionType:', editQuestionType);
      console.log('🔍 saveEditQuestion - Window stored options:', window.lastEditOptions);
      
      // Use the stored options if there's a state mismatch
      const optionsToUse = window.lastEditOptions && window.lastEditOptions.length > 0 ? window.lastEditOptions : editOptions;
      console.log('🔍 saveEditQuestion - Options to use for save:', optionsToUse);
      
      const updates = {
        question_text: editQuestionText,
        question_type: editQuestionType === 'MCQ' ? 'mcq' : 'true_false',
        options: optionsToUse,
        marks: optionsToUse.reduce((sum, opt) => sum + opt.marks, 0) // Total marks for the question
      };
      
      console.log('🚀 Frontend sending edit data:', updates);
      console.log('🔍 Edit options being sent:', editOptions);
      console.log('🔍 Edit question type:', editQuestionType);
      console.log('🔍 Edit options structure check:');
      console.log('  - Edit options is array:', Array.isArray(editOptions));
      console.log('  - Edit options length:', editOptions.length);
      console.log('  - First edit option:', editOptions[0]);
      console.log('  - First edit option has text:', editOptions[0]?.hasOwnProperty('text'));
      console.log('  - First edit option has marks:', editOptions[0]?.hasOwnProperty('marks'));
      console.log('  - First edit option text:', editOptions[0]?.text);
      console.log('  - First edit option marks:', editOptions[0]?.marks);
      console.log('  - Second edit option text:', editOptions[1]?.text);
      console.log('  - Second edit option marks:', editOptions[1]?.marks);
      
      await updateQuestion(qid, updates);
      setEditingQuestionId(null);
      setEditQuestionText('');
      setEditOptions([{ text: '', marks: 0 }]);
      
      // Force re-render to update marks calculation
      setSelectedPacket(selectedPacket);
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Failed to update question. Please try again.');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={4} sx={{ width: '100%', margin: 0 }}>
        <Grid item xs={12} lg={4}>
          <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 2, height: 'fit-content', position: 'sticky', top: 20 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>New Packet</Typography>
              <TextField
                label="Packet Name"
                value={packetName}
                onChange={e => setPacketName(e.target.value)}
                size="medium"
                fullWidth
                variant="outlined"
                sx={{ mb: 3 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Description"
                value={packetDescription}
                onChange={e => setPacketDescription(e.target.value)}
                size="medium"
                fullWidth
                variant="outlined"
                sx={{ mb: 3 }}
                InputLabelProps={{ shrink: true }}
                multiline
                rows={2}
              />
              <TextField
                label="Scoring Logic"
                value={scoringLogic}
                onChange={e => setScoringLogic(e.target.value)}
                size="medium"
                fullWidth
                variant="outlined"
                sx={{ mb: 3 }}
                InputLabelProps={{ shrink: true }}
                multiline
                rows={3}
                placeholder="Enter scoring logic for this packet..."
                helperText="Describe how this packet should be scored"
              />
              <Button 
                variant="contained" 
                startIcon={<AddCircleOutlineIcon />} 
                onClick={handleAddPacket} 
                fullWidth
                sx={{ 
                  height: 48, 
                  fontWeight: 600,
                  background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)',
                    transform: 'scale(1.02)'
                  }
                }}
              >
                Add Packet
              </Button>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ mt: 3, borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>Packets</Typography>
              
              {/* Overall Statistics */}
              {packets.length > 0 && (
                <Box sx={{ 
                  mb: 3, 
                  p: 2, 
                  backgroundColor: 'rgba(103, 58, 183, 0.1)', 
                  borderRadius: 2,
                  border: '1px solid rgba(103, 58, 183, 0.3)'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                    📈 Overall Assessment Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Total Packets: <strong>{packets.length}</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Total Questions: <strong>
                          {packets.reduce((total, packet) => total + (packet.questions?.length || 0), 0)}
                        </strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Min Marks: <strong>
                          {(() => {
                            const allMarks = packets.map(p => calculatePacketMarks(p.id)).filter(m => m.minMarks > 0);
                            if (allMarks.length === 0) return 0;
                            return Math.min(...allMarks.map(m => m.minMarks));
                          })()}
                        </strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Max Marks: <strong>
                          {(() => {
                            const allMarks = packets.map(p => calculatePacketMarks(p.id)).filter(m => m.maxMarks > 0);
                            if (allMarks.length === 0) return 0;
                            return Math.max(...allMarks.map(m => m.maxMarks));
                          })()}
                        </strong>
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
              <List sx={{ p: 0 }}>
                {packets.map((packet) => (
                  <ListItem
                    key={packet.id}
                    button={editingPacket !== packet.id}
                    selected={selectedPacket === packet.id && editingPacket !== packet.id}
                    onClick={() => editingPacket !== packet.id && setSelectedPacket(packet.id)}
                    secondaryAction={
                      editingPacket !== packet.id ? (
                        <Box>
                          <IconButton edge="end" aria-label="edit" onClick={() => startEditPacket(packet)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" aria-label="delete" onClick={() => handleDeletePacket(packet.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ) : null
                    }
                    sx={{ 
                      borderRadius: 2, 
                      mb: 1,
                      '&:hover': { backgroundColor: 'rgba(67, 233, 123, 0.1)' },
                      '&.Mui-selected': { 
                        backgroundColor: 'rgba(67, 233, 123, 0.2)',
                        '&:hover': { backgroundColor: 'rgba(67, 233, 123, 0.3)' }
                      }
                    }}
                  >
                    {editingPacket === packet.id ? (
                      <Box sx={{ width: '100%', p: 2 }}>
                        <TextField
                          label="Packet Name"
                          value={editPacketName}
                          onChange={e => setEditPacketName(e.target.value)}
                          size="small"
                          fullWidth
                          variant="outlined"
                          sx={{ mb: 2 }}
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          label="Description"
                          value={editPacketDescription}
                          onChange={e => setEditPacketDescription(e.target.value)}
                          size="small"
                          fullWidth
                          variant="outlined"
                          sx={{ mb: 2 }}
                          InputLabelProps={{ shrink: true }}
                          multiline
                          rows={2}
                        />
                        <TextField
                          label="Scoring Logic"
                          value={editScoringLogic}
                          onChange={e => setEditScoringLogic(e.target.value)}
                          size="small"
                          fullWidth
                          variant="outlined"
                          sx={{ mb: 2 }}
                          InputLabelProps={{ shrink: true }}
                          multiline
                          rows={3}
                          placeholder="Enter scoring logic for this packet..."
                          helperText="Describe how this packet should be scored"
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            variant="contained" 
                            size="small" 
                            onClick={saveEditPacket}
                            sx={{ 
                              fontWeight: 600,
                              background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                              '&:hover': {
                                background: 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)'
                              }
                            }}
                          >
                            Save
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            onClick={cancelEditPacket}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <ListItemText 
                        primary={packet.name} 
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {packet.questions?.length || 0} questions
                            </Typography>
                            {packet.description && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic' }}>
                                {packet.description}
                              </Typography>
                            )}
                            {packet.scoringLogic && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 500 }}>
                                Scoring: {packet.scoringLogic}
                              </Typography>
                            )}
                            {packet.questions && packet.questions.length > 0 && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Total: {(() => {
                                  const marks = calculatePacketMarks(packet.id);
                                  if (marks.minMarks === marks.maxMarks) {
                                    return `${marks.minMarks} marks`;
                                  } else {
                                    return `${marks.minMarks}-${marks.maxMarks} marks`;
                                  }
                                })()}
                              </Typography>
                            )}
                            {packet.questions && packet.questions.length > 0 && (
                              <Box sx={{ 
                                mt: 1, 
                                p: 1, 
                                backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                                borderRadius: 1,
                                border: '1px solid rgba(76, 175, 80, 0.3)'
                              }}>
                                <Typography variant="caption" sx={{ 
                                  color: 'success.main', 
                                  fontWeight: 600,
                                  display: 'block',
                                  textAlign: 'center'
                                }}>
                                  {(() => {
                                    const marks = calculatePacketMarks(packet.id);
                                    if (marks.minMarks === marks.maxMarks) {
                                      return `🎯 ${marks.minMarks} total marks`;
                                    } else {
                                      return `🎯 ${marks.minMarks}-${marks.maxMarks} total marks`;
                                    }
                                  })()}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        }
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={8}>
          {selectedPacket && (
            <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 2, minHeight: 500 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>Add Question to Packet</Typography>
                
                {/* Packet Marks Summary */}
                {currentPacketMarks.totalQuestions > 0 && (
                  <Box sx={{ 
                    mb: 3, 
                    p: 2, 
                    backgroundColor: 'rgba(67, 233, 123, 0.1)', 
                    borderRadius: 2,
                    border: '1px solid rgba(67, 233, 123, 0.3)'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        📊 Packet Scoring Range
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<SettingsIcon />}
                        onClick={openScoringScaleDialog}
                        sx={{ minWidth: 'auto' }}
                      >
                        Configure Scale
                      </Button>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">
                          Questions: <strong>{currentPacketMarks.totalQuestions}</strong>
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <Typography variant="body2" color="text.secondary">
                          Score Range: <strong>{currentPacketMarks.minMarks} - {currentPacketMarks.maxMarks} marks</strong>
                        </Typography>
                      </Grid>
                    </Grid>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      💡 Students can score between {currentPacketMarks.minMarks} and {currentPacketMarks.maxMarks} total marks in this packet
                    </Typography>

                    {/* Scoring Scale Display */}
                    {enableScoringScale && scoringScale.length > 0 && (
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                          🎯 Performance Scale:
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {scoringScale.map((range, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={`${range.image && range.image.startsWith('data:image') ? '🖼️' : range.image} ${range.label} (${range.min}-${range.max})`}
                                sx={{
                                  backgroundColor: range.color,
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                              {range.largeText && (
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: 'text.secondary',
                                    fontStyle: 'italic'
                                  }}
                                >
                                  "{range.largeText}"
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                    

                  </Box>
                )}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={8}>
                    <TextField
                      label="Question Text"
                      value={questionText}
                      onChange={e => setQuestionText(e.target.value)}
                      size="medium"
                      fullWidth
                      variant="outlined"
                      sx={{ mb: 2 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      label="Type"
                      value={questionType}
                      onChange={e => handleQuestionTypeChange(e.target.value)}
                      size="medium"
                      SelectProps={{ native: true }}
                      fullWidth
                    >
                      <option value="MCQ">MCQ</option>
                      <option value="TrueFalse">True/False</option>
                    </TextField>
                  </Grid>
                </Grid>
                {questionType === 'MCQ' && (
                  <Grid container spacing={2} sx={{ mb: 3 }} style={{ flexDirection: 'column' }}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Options</Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={addOption}
                          sx={{ minWidth: 'auto' }}
                        >
                          Add Option
                        </Button>
                      </Box>
                    </Grid>
                    {options.map((opt, idx) => (
                      <Grid item xs={12} key={idx}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                          <TextField
                            label={`Option ${idx + 1}`}
                            value={opt.text}
                            onChange={e => updateOptionText(idx, e.target.value)}
                            size="medium"
                            fullWidth
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                            sx={{ flex: 1 }}
                          />
                          <TextField
                            label="Marks"
                            type="number"
                            value={opt.marks}
                            onChange={e => updateOptionMarks(idx, e.target.value)}
                            size="medium"
                            variant="outlined"
                            inputProps={{ min: 0, max: 100 }}
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: 100 }}
                          />
                          <IconButton
                            onClick={() => removeOption(idx)}
                            disabled={options.length <= 1}
                            color="error"
                            size="small"
                          >
                            <RemoveIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
                {questionType === 'TrueFalse' && (
                  <Grid container spacing={2} sx={{ mb: 3 }} style={{ flexDirection: 'column' }}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>True/False Options</Typography>
                    </Grid>
                    {options.map((opt, idx) => (
                      <Grid item xs={12} sm={6} key={idx} >
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <TextField
                            label={opt.text}
                            type="number"
                            value={opt.marks}
                            onChange={e => updateOptionMarks(idx, e.target.value)}
                            size="medium"
                            variant="outlined"
                            inputProps={{ min: 0, max: 100 }}
                            InputLabelProps={{ shrink: true }}
                            sx={{ flex: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            marks for {opt.text}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
                <Button 
                  variant="contained" 
                  onClick={handleAddQuestion} 
                  startIcon={<AddCircleOutlineIcon />} 
                  sx={{ 
                    mb: 4,
                    height: 48,
                    fontWeight: 600,
                    background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)',
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  Add Question
                </Button>
                <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>Questions in Packet</Typography>
                <List sx={{ p: 0 }}>
                  {packets.find(p => p.id === selectedPacket)?.questions?.map((q) => (
                    <ListItem key={q.id} alignItems="flex-start" sx={{ 
                      mb: 2, 
                      borderRadius: 2, 
                      border: '1px solid rgba(0,0,0,0.1)',
                      backgroundColor: 'rgba(255,255,255,0.5)'
                    }}
                      secondaryAction={
                        <>
                          <IconButton edge="end" aria-label="edit" onClick={() => startEditQuestion(q)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteQuestion(q.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </>
                      }
                    >
                      {editingQuestionId === q.id ? (
                        <Box sx={{ width: '100%' }}>
                          <TextField
                            value={editQuestionText}
                            onChange={e => setEditQuestionText(e.target.value)}
                            size="medium"
                            fullWidth
                            variant="outlined"
                            sx={{ mb: 2 }}
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            select
                            label="Type"
                            value={editQuestionType}
                            onChange={e => handleEditQuestionTypeChange(e.target.value)}
                            size="medium"
                            SelectProps={{ native: true }}
                            fullWidth
                            variant="outlined"
                            sx={{ mb: 2 }}
                            InputLabelProps={{ shrink: true }}
                          >
                            <option value="MCQ">MCQ</option>
                            <option value="TrueFalse">True/False</option>
                          </TextField>
                          <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Options</Typography>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<AddIcon />}
                                  onClick={addEditOption}
                                  sx={{ minWidth: 'auto' }}
                                >
                                  Add Option
                                </Button>
                              </Box>
                            </Grid>
                            {editOptions.map((opt, idx) => (
                              <Grid item xs={12} key={idx}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                  <TextField
                                    label={`Option ${idx + 1}`}
                                    value={opt.text}
                                    onChange={e => updateEditOptionText(idx, e.target.value)}
                                    size="medium"
                                    fullWidth
                                    variant="outlined"
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ flex: 1 }}
                                  />
                                  <TextField
                                    label="Marks"
                                    type="number"
                                    value={opt.marks}
                                    onChange={e => updateEditOptionMarks(idx, e.target.value)}
                                    size="medium"
                                    variant="outlined"
                                    inputProps={{ min: 0, max: 100 }}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ width: 100 }}
                                  />
                                  <IconButton
                                    onClick={() => removeEditOption(idx)}
                                    disabled={editOptions.length <= 1}
                                    color="error"
                                    size="small"
                                  >
                                    <RemoveIcon />
                                  </IconButton>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button 
                              variant="contained" 
                              size="medium" 
                              onClick={() => {
                                console.log('🔍 Save button clicked for question:', q.id);
                                console.log('🔍 Current editOptions before save:', editOptions);
                                console.log('🔍 Window stored options:', window.lastEditOptions);
                                saveEditQuestion(q.id);
                              }}
                              sx={{ 
                                fontWeight: 600,
                                background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                                '&:hover': {
                                  background: 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)'
                                }
                              }}
                            >
                              Save
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="medium" 
                              onClick={() => {
                                setEditingQuestionId(null);
                                setEditQuestionText('');
                                setEditOptions([{ text: '', marks: 0 }]);
                              }}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <ListItemText
                          primary={q.question_text || q.text}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Type: {q.question_type === 'mcq' ? 'MCQ' : 'True/False'}
                              </Typography>
                              {q.options && Array.isArray(q.options) && q.options.length > 0 && (
                                <Typography variant="caption" color="text.secondary">
                                  Options: {q.options.map((opt, idx) => 
                                    `${opt.text} (${opt.marks} marks)`
                                  ).join(' | ')}
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                Total Marks: {q.options ? q.options.reduce((sum, opt) => sum + (opt.marks || 1), 0) : (q.marks || 1)}
                              </Typography>
                            </Box>
                          }
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      )}
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Scoring Scale Configuration Dialog */}
      <Dialog 
        open={scoringScaleDialog} 
        onClose={closeScoringScaleDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          🎯 Configure Performance Scoring Scale
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
            Define performance ranges and labels for this packet
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Debug: Dialog is open, enableScoringScale = {enableScoringScale.toString()}
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={enableScoringScale}
                  onChange={(e) => {
                    console.log('Switch changed to:', e.target.checked);
                    setEnableScoringScale(e.target.checked);
                  }}
                />
              }
              label="Enable Custom Scoring Scale"
              sx={{ mb: 2 }}
            />
            
            {/* Test button to manually toggle state */}
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => {
                console.log('Button clicked, current state:', enableScoringScale);
                setEnableScoringScale(!enableScoringScale);
              }}
              sx={{ ml: 2 }}
            >
              Toggle State: {enableScoringScale ? 'ON' : 'OFF'}
            </Button>
            
            {enableScoringScale && (
              <Box>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Debug: Switch is enabled, rendering content...
                </Typography>
                
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Current Packet Range: {currentPacketMarks?.minMarks || 0} - {currentPacketMarks?.maxMarks || 0} marks
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Debug: Scoring scale has {scoringScale.length} items
                </Typography>
                
                {scoringScale.map((range, index) => (
                  <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Level {index + 1}: {range.label}
                    </Typography>
                    
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={2}>
                        <TextField
                          label="Min Score"
                          type="number"
                          value={range.min}
                          onChange={(e) => updateScoringScaleRange(index, 'min', e.target.value)}
                          size="small"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          label="Max Score"
                          type="number"
                          value={range.max}
                          onChange={(e) => updateScoringScaleRange(index, 'max', e.target.value)}
                          size="small"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          label="Label"
                          value={range.label}
                          onChange={(e) => updateScoringScaleRange(index, 'label', e.target.value)}
                          size="small"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <TextField
                          label="Color"
                          value={range.color}
                          onChange={(e) => updateScoringScaleRange(index, 'color', e.target.value)}
                          size="small"
                          fullWidth
                          inputProps={{ placeholder: '#ff6b6b' }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Image
                          </Typography>
                          
                          {/* Image Preview */}
                          {range.image && range.image.startsWith('data:image') && (
                            <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                              <Box
                                sx={{
                                  width: 60,
                                  height: 60,
                                  border: '2px solid #ddd',
                                  borderRadius: 1,
                                  overflow: 'hidden',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: '#f5f5f5'
                                }}
                              >
                                <img
                                  src={range.image}
                                  alt={`Preview for ${range.label}`}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                              </Box>
                            </Box>
                          )}
                          
                          <input
                            accept="image/png,image/jpeg,image/jpg"
                            type="file"
                            onChange={(e) => handleImageUpload(index, e)}
                            style={{ display: 'none' }}
                            id={`image-upload-${index}`}
                          />
                          <label htmlFor={`image-upload-${index}`}>
                            <Button
                              variant="outlined"
                              size="small"
                              component="span"
                              fullWidth
                              sx={{ minHeight: 40 }}
                            >
                              {range.image && range.image.startsWith('data:image') ? 'Change Image' : 'Upload Image'}
                            </Button>
                          </label>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    {/* Large Text Field */}
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12}>
                        <TextField
                          label="Large Text"
                          value={range.largeText || ''}
                          onChange={(e) => updateScoringScaleRange(index, 'largeText', e.target.value)}
                          size="small"
                          fullWidth
                          multiline
                          rows={2}
                          placeholder="Enter motivational text for this performance level..."
                          helperText="This text will be displayed prominently when students achieve this level"
                        />
                      </Grid>
                    </Grid>
                    
                    {/* Range Preview */}
                    <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                        Preview:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          label={`${range.image && range.image.startsWith('data:image') ? '🖼️' : range.image} ${range.label} (${range.min}-${range.max})`}
                          sx={{
                            backgroundColor: range.color,
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                      {range.largeText && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            Large Text Preview:
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              p: 1, 
                              backgroundColor: range.color, 
                              color: 'white', 
                              borderRadius: 1,
                              fontWeight: 500,
                              textAlign: 'center'
                            }}
                          >
                            {range.largeText}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  💡 Make sure each range connects properly (e.g., if Level 1 ends at 5, Level 2 should start at 6)
                </Alert>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeScoringScaleDialog}>Cancel</Button>
          <Button 
            onClick={saveScoringScale} 
            variant="contained"
            disabled={!enableScoringScale}
          >
            Save Scale
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PacketManager; 