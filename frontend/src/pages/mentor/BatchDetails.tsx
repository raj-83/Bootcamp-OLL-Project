import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import TaskManager from "@/components/mentor/TaskManager";
import TaskSubmissionViewer from "@/components/mentor/TaskSubmissionViewer";
import {
  Calendar,
  Clock,
  IndianRupee,
  Users,
  School,
  Check,
  Plus,
  File,
  Calendar as CalendarIcon,
  Video,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  getTasksByBatchId,
  createTask,
  updateTask,
  deleteTask,
} from "@/services/taskService.js"; // Adjust the import path as necessary
import axios from "axios";
// Import Section - Add these imports
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // Add this import
import {
  getBatchSubmissions,
  getSubmissionById,
  updateSubmission,
} from "@/services/taskService.js";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const apiUrl = import.meta.env.VITE_REACT_API_URL || "https://localhost:5000";

// Add the form schema
const taskFormSchema = z.object({
  title: z.string()
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(100, { message: "Title cannot exceed 100 characters" }),
  dueDate: z.string()
    .min(1, { message: "Due date is required" })
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, { message: "Due date cannot be in the past" }),
  description: z.string()
    .min(10, { message: "Description must be at least 10 characters long" })
    .max(500, { message: "Description cannot exceed 500 characters" })
});

const BatchDetails = () => {
  const { batchId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batchData, setBatchData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [teacherName, setTeacherName] = useState("");
  const [studentNames, setStudentNames] = useState({});
  const [tasks, setTasks] = useState([]);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: "",
    dueDate: "",
    description: "",
    batch: batchId,
  });
  const [activeSubmissionTab, setActiveSubmissionTab] = useState("tasks");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  // Add these state variables inside the BatchDetails component
  const [editTask, setEditTask] = useState({
    id: "",
    title: "",
    dueDate: "",
    description: "",
    status: "pending",
    batch: batchId,
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [feedback, setFeedback] = useState({
    status: "",
    feedback: "",
    rating: 0,
    points: 0,
  });

  // Initialize form with Zod resolver
  const form = useForm({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      dueDate: "",
      description: ""
    }
  });

  const openEditDialog = (task) => {
    setEditTask({
      id: task._id,
      title: task.title,
      dueDate: formatDateForInput(task.dueDate),
      description: task.description,
      status: task.status || "pending",
      batch: batchId,
    });
    setShowEditTaskDialog(true);
  };

  // Add this function to handle task updates
  const handleUpdateTask = async () => {
    try {
      if (!editTask.title || !editTask.dueDate) {
        toast({
          title: "Missing information",
          description: "Please provide both a title and due date for the task.",
          variant: "destructive",
        });
        return;
      }

      setShowEditTaskDialog(false);
      await updateTask(editTask.id, editTask);

      // Refresh tasks list
      fetchTasks();

      toast({
        title: "Task updated",
        description: "Task has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  // Add this function to handle task deletion
  const handleDeleteTask = async () => {
    try {
      if (!taskToDelete) return;

      await deleteTask(taskToDelete._id);

      // Refresh tasks list
      fetchTasks();

      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);

      toast({
        title: "Task deleted",
        description: "Task has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  // Add this function to handle opening the delete confirmation dialog
  const openDeleteDialog = (task) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  // Add this useEffect to fetch submissions when the component loads
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setIsLoadingSubmissions(true);
        const data = await getBatchSubmissions(batchId);
        setSubmissions(data);
      } catch (error) {
        console.error("Error fetching submissions:", error);
        toast({
          title: "Error",
          description: "Failed to load task submissions",
          variant: "destructive",
        });
      } finally {
        setIsLoadingSubmissions(false);
      }
    };

    if (batchId && activeSubmissionTab === "submissions") {
      fetchSubmissions();
    }
  }, [batchId, activeSubmissionTab]);

  // Add this to close the TaskSubmissionViewer
  const handleCloseSubmissionViewer = () => {
    setSelectedSubmissionId(null);
  };

  // Calculate revenue breakdown based on batch data
  const calculateRevenueBreakdown = (batchRevenue) => {
    const total = batchRevenue || 0;
    const studentEarnings = total * 0.5; // 50% to students
    const teacherEarnings = total * 0.2; // 20% to teacher
    const ollShare = total * 0.3; // 30% to OLL

    return {
      total,
      studentEarnings,
      teacherEarnings,
      ollShare,
    };
  };

  // Format date string from DB to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return format(date, "yyyy-MM-dd");
  };

  // Update handleAddTask to use form validation
  const handleAddTask = async (data) => {
    try {
      const taskData = {
        ...data,
        batch: batchId
      };

      await createTask(taskData);
      
      // Reset form
      form.reset();
      setShowAddTaskDialog(false);
      
      // Refresh tasks list
      fetchTasks();
      
      toast({
        title: "Task added",
        description: "New task has been successfully added to the batch."
      });
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Fetch batch data
  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/api/batches/${batchId}`);
        const batch = response.data;

        // 1️⃣ teacher as before
        if (batch.teacher) {
          const { data: t } = await axios.get(
            `${apiUrl}/api/teachers/${batch.teacher}`
          );
          setTeacherName(t.name);
        }

        // 2️⃣ now pull student names
        if (batch.students && batch.students.length > 0) {
          // build up a map { id: name }
          const namesMap = {};
          await Promise.all(
            batch.students.map(async (studId) => {
              try {
                const { data: s } = await axios.get(
                  `${apiUrl}/api/students/${studId}`
                );
                namesMap[studId] = s.name;
              } catch {
                namesMap[studId] = "Unknown";
              }
            })
          );
          setStudentNames(namesMap);
        }

        setBatchData(batch);
      } catch (err) {
        console.error("Error fetching batch data:", err);
        setError("Failed to load batch data");
        toast({
          title: "Error",
          description: "Failed to load batch data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchSessions = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/api/sessions/batch/${batchId}`
        );
        setSessions(response.data);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      }
    };

    if (batchId) {
      fetchBatchData();
      fetchSessions();
    }
  }, [batchId]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const taskData = await getTasksByBatchId(batchId);
      setTasks(taskData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) {
      fetchTasks();
    }
  }, [batchId]);

  // Format date to display
  const formatDateDisplay = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "yyyy-MM-dd");
  };

  // Format date for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Get appropriate status badge styling
  const getStatusBadgeVariant = (
    status: string
  ): {
    variant: "default" | "destructive" | "outline" | "secondary" | "warning";
    className: string;
  } => {
    switch (status) {
      case "completed":
        return {
          variant: "default",
          className: "bg-green-500 hover:bg-green-600",
        };
      case "in-progress":
        return { variant: "outline", className: "" };
      default:
        return { variant: "secondary", className: "" };
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading tasks...</div>;
  }

  const handleViewSubmission = async (submissionId) => {
    try {
      const submission = await getSubmissionById(submissionId);
      setCurrentSubmission(submission);
      setSelectedSubmissionId(submissionId);
    } catch (error) {
      console.error("Error fetching submission details:", error);
      toast({
        title: "Error",
        description: "Failed to load submission details",
        variant: "destructive",
      });
    }
  };

  const openFeedbackDialog = (submission) => {
    setCurrentSubmission(submission);
    setFeedback({
      status: submission.status || "submitted",
      feedback: submission.feedback || "",
      rating: submission.rating || 0,
      points: submission.points || 0,
    });
    setShowFeedbackDialog(true);
  };

  const handleSubmitFeedback = async () => {
    try {
      await updateSubmission(currentSubmission._id, feedback);

      // Refresh submissions list
      const updatedSubmissions = submissions.map((sub) =>
        sub._id === currentSubmission._id ? { ...sub, ...feedback } : sub
      );
      setSubmissions(updatedSubmissions);

      setShowFeedbackDialog(false);
      toast({
        title: "Feedback submitted",
        description: "Submission has been successfully reviewed.",
      });
    } catch (error) {
      console.error("Error updating submission:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
    }
  };

  const getSubmissionStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return {
          variant: "default",
          className: "bg-green-500 hover:bg-green-600",
        };
      case "rejected":
        return { variant: "destructive", className: "" };
      case "resubmit":
        return {
          variant: "outline",
          className: "border-amber-500 text-amber-500",
        };
      case "reviewed":
        return {
          variant: "secondary",
          className: "bg-blue-500 text-white hover:bg-blue-600",
        };
      default:
        return { variant: "secondary", className: "" };
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // For loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading batch details...
      </div>
    );
  }

  // For error state
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  // If no batch data is found
  if (!batchData) {
    return <div>No batch data found</div>;
  }

  const revenueData = calculateRevenueBreakdown(batchData.revenue);

  // Calculate batch progress (kept as is for now)
  const batchProgress = 65; // Mock progress value

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">{batchData.batchName}</h1>
        <p className="text-muted-foreground">
          {batchData.sessionTopic || "No description available"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              <div>
                <div>{formatDate(batchData.startDate)}</div>
                <div className="text-sm text-muted-foreground">
                  to {formatDate(batchData.endDate)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              <div>
                <div className="text-base">
                  {batchData.scheduleDays
                    ? batchData.scheduleDays.join(", ")
                    : "N/A"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {batchData.sessionTime || "N/A"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              {batchData.students ? batchData.students.length : 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Batch Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batchProgress}%</div>
            <div className="w-full h-2 bg-muted rounded-full mt-2">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${batchProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>
            Distribution of earnings from this batch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Student Earnings (50%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 flex items-center">
                  <IndianRupee className="h-5 w-5 mr-1" />
                  {revenueData.studentEarnings}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Teacher Earnings (20%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 flex items-center">
                  <IndianRupee className="h-5 w-5 mr-1" />
                  {revenueData.teacherEarnings}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  OLL Share (30%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 flex items-center">
                  <IndianRupee className="h-5 w-5 mr-1" />
                  {revenueData.ollShare}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <div className="w-full h-4 bg-muted rounded-full overflow-hidden flex">
              <div className="h-full bg-green-500" style={{ width: "50%" }} />
              <div className="h-full bg-blue-500" style={{ width: "20%" }} />
              <div className="h-full bg-purple-500" style={{ width: "30%" }} />
            </div>
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Total Revenue: ₹{revenueData.total}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Batch Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <School className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Teacher</p>
                      <p className="font-medium">{teacherName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">
                        {formatDate(batchData.startDate)} to{" "}
                        {formatDate(batchData.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Schedule</p>
                      <p className="font-medium">
                        {batchData.scheduleDays
                          ? batchData.scheduleDays.join(", ")
                          : "Not set"}{" "}
                        at {batchData.sessionTime || "Not set"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Batch Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">
                        Overall Progress
                      </span>
                      <span className="text-sm font-medium">
                        {batchProgress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${batchProgress}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">
                        Task Completion
                      </span>
                      <span className="text-sm font-medium">70%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: "70%" }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">
                        Attendance
                      </span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: "85%" }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">
                        Sales Achievement
                      </span>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: "60%" }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle>Students in Batch</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Task Completion</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchData?.students?.length ? (
                    batchData.students.map((student) => (
                      <TableRow key={student}>
                        {/* lookup via studentNames map */}
                        <TableCell className="font-medium">
                          {studentNames[student] || "Loading..."}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full max-w-24">
                              <div className="h-2 w-full bg-muted rounded-full">
                                <div
                                  className={`h-full rounded-full ${
                                    (student.attendance || 0) >= 90
                                      ? "bg-green-500"
                                      : (student.attendance || 0) >= 75
                                      ? "bg-amber-500"
                                      : "bg-destructive"
                                  }`}
                                  style={{
                                    width: `${student.attendance || 0}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <span className="text-xs">
                              {student.attendance || 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full max-w-24">
                              <div className="h-2 w-full bg-muted rounded-full">
                                <div
                                  className={`h-full rounded-full ${
                                    (student.taskCompletion || 0) >= 90
                                      ? "bg-green-500"
                                      : (student.taskCompletion || 0) >= 75
                                      ? "bg-amber-500"
                                      : "bg-destructive"
                                  }`}
                                  style={{
                                    width: `${student.taskCompletion || 0}%`,
                                  }}
                                />
                              </div>
                            </div>
                            <span className="text-xs">
                              {student.taskCompletion || 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <IndianRupee className="h-4 w-4 mr-1 text-green-500" />
                            ₹{student.earning || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              student.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {student.status || "Active"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No students in this batch
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Batch Tasks</h3>
            <Button onClick={() => setShowAddTaskDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          <Tabs
            value={activeSubmissionTab}
            onValueChange={(value) => setActiveSubmissionTab(value)}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks">
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card key={task._id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                task.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : task.status === "in-progress"
                                  ? "bg-blue-100 text-blue-700"
                                  : task.status === "overdue"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {task.status === "completed" ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <File className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">{task.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                Due: {formatDateDisplay(task.dueDate)}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm mt-3">{task.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={getStatusBadgeVariant(task.status).variant}
                            className={
                              getStatusBadgeVariant(task.status).className
                            }
                          >
                            {task.status === "completed"
                              ? "Completed"
                              : task.status === "in-progress"
                              ? "In Progress"
                              : task.status === "overdue"
                              ? "Overdue"
                              : "Not Started"}
                          </Badge>
                          <Button
                            onClick={() => openEditDialog(task)}
                            variant="outline"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteDialog(task)}
                            className="border-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            Delete
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveSubmissionTab("submissions");
                            }}
                          >
                            View Submissions
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="submissions">
              {selectedSubmissionId ? (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSubmissionId(null);
                        setActiveSubmissionTab("tasks");
                      }}
                    >
                      Back to Tasks
                    </Button>
                  </div>
                  <TaskSubmissionViewer submissionId={selectedSubmissionId} />
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Task Submissions</CardTitle>
                    <CardDescription>
                      Review and grade student task submissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {submissions.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No submissions found for this batch.
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Task</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {submissions.map((submission) => (
                            <TableRow key={submission._id}>
                              <TableCell className="font-medium">
                                {studentNames[submission.student] ||
                                  "Unknown Student"}
                              </TableCell>
                              <TableCell>
                                {submission.task?.title || "Unknown Task"}
                              </TableCell>
                              <TableCell>
                                {formatDateDisplay(submission.submissionDate)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    getSubmissionStatusBadge(submission.status)
                                      .variant as "default" | "destructive" | "outline" | "secondary" | "warning"
                                  }
                                  className={
                                    getSubmissionStatusBadge(submission.status)
                                      .className
                                  }
                                >
                                  {submission.status === "approved"
                                    ? "Approved"
                                    : submission.status === "rejected"
                                    ? "Rejected"
                                    : submission.status === "resubmit"
                                    ? "Needs Revision"
                                    : submission.status === "reviewed"
                                    ? "Reviewed"
                                    : "Pending Review"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleViewSubmission(submission._id)
                                  }
                                >
                                  Review
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <Dialog
            open={showEditTaskDialog}
            onOpenChange={setShowEditTaskDialog}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogDescription>
                  Update task details for this batch.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editTitle">Task Title</Label>
                  <Input
                    id="editTitle"
                    placeholder="Enter task title"
                    value={editTask.title}
                    onChange={(e) =>
                      setEditTask({ ...editTask, title: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editDueDate">Due Date</Label>
                  <Input
                    id="editDueDate"
                    type="date"
                    value={editTask.dueDate}
                    onChange={(e) =>
                      setEditTask({ ...editTask, dueDate: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editStatus">Status</Label>
                  <Select
                    value={editTask.status}
                    onValueChange={(value) =>
                      setEditTask({ ...editTask, status: value })
                    }
                  >
                    <SelectTrigger id="editStatus">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editDescription">Description</Label>
                  <Textarea
                    id="editDescription"
                    placeholder="Enter task description"
                    value={editTask.description}
                    onChange={(e) =>
                      setEditTask({ ...editTask, description: e.target.value })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowEditTaskDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateTask}>Update Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add this JSX for the Delete Task Dialog */}
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the task "{taskToDelete?.title}"
                  and all associated submissions. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteTask}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Create a new task for students in this batch.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddTask)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter task title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter task description" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        form.reset();
                        setShowAddTaskDialog(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Add Task</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
            <DialogDescription>
              Review the submission and provide feedback to the student.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="submissionStatus">Status</Label>
              <Select
                value={feedback.status}
                onValueChange={(value) =>
                  setFeedback({ ...feedback, status: value })
                }
              >
                <SelectTrigger id="submissionStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Pending Review</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="resubmit">Needs Revision</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="submissionFeedback">Feedback</Label>
              <Textarea
                id="submissionFeedback"
                placeholder="Provide feedback to the student..."
                value={feedback.feedback}
                onChange={(e) =>
                  setFeedback({ ...feedback, feedback: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="submissionRating">Rating (0-5)</Label>
                <Input
                  id="submissionRating"
                  type="number"
                  min="0"
                  max="5"
                  value={feedback.rating}
                  onChange={(e) =>
                    setFeedback({
                      ...feedback,
                      rating: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="submissionPoints">Points</Label>
                <Input
                  id="submissionPoints"
                  type="number"
                  min="0"
                  value={feedback.points}
                  onChange={(e) =>
                    setFeedback({
                      ...feedback,
                      points: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFeedbackDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitFeedback}>Submit Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BatchDetails;
