// services/taskService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_REACT_API_URL || 'https://bootcamp-project-oll.onrender.com';

export const createTask = async (taskData) => {
    
    const response = await axios.post(`${API_URL}/api/tasks`, taskData);
    return response.data;
};

export const getTasksByBatchId = async (batchId) => {
    const response = await axios.get(`${API_URL}/api/tasks/batch/${batchId}`);
    return response.data;
};

export const updateTask = async (taskId, taskData) => {
    const response = await axios.put(`${API_URL}/api/tasks/${taskId}`, taskData);
    return response.data;
};

export const deleteTask = async (taskId) => {
    const response = await axios.delete(`${API_URL}/api/tasks/${taskId}`);
    return response.data;
};

// Get submissions for a task
export const getTaskSubmissions = async (taskId) => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks/${taskId}/submissions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching task submissions:', error);
      throw error;
    }
  };
  
  // Get submissions for a batch
  export const getBatchSubmissions = async (batchId) => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks/batch/${batchId}/submissions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching batch submissions:', error);
      throw error;
    }
  };

  export const getSubmissionById = async (submissionId) => {
    try {
      const response = await axios.get(`${API_URL}/api/taskSubmission/${submissionId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching submission details:", error);
      throw error;
    }
  };
  
  // Get a single submission
  export const getSubmission = async (submissionId) => {
    try {
      const response = await axios.get(`${API_URL}/api/submissions/${submissionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching submission:', error);
      throw error;
    }
  };
  
  // Update a submission (feedback, rating, etc.)
  export const updateSubmission = async (submissionId, submissionData) => {
    try {
      const response = await axios.put(`${API_URL}/api/taskSubmission/${submissionId}`, submissionData);
      return response.data;
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  };