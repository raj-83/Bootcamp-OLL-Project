import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Users,
  Pencil,
  Trash2,
  Check,
  Plus,
  Loader2,
  ExternalLink,
  Video as VideoIcon,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
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

const API_URL =
  import.meta.env.VITE_REACT_API_URL ||
  "https://bootcamp-project-oll.onrender.com";

// Add the session form schema
const sessionFormSchema = z.object({
  title: z.string()
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(100, { message: "Title cannot exceed 100 characters" }),
  batch: z.string()
    .min(1, { message: "Please select a batch" }),
  date: z.string()
    .min(1, { message: "Date is required" })
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, { message: "Session date cannot be in the past" }),
  time: z.string()
    .min(1, { message: "Time is required" })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s*(AM|PM|am|pm)\s*-\s*([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s*(AM|PM|am|pm)$/, 
      { message: "Time must be in format: HH:MM AM/PM - HH:MM AM/PM" }),
  notes: z.string()
    .min(10, { message: "Notes must be at least 10 characters long" })
    .max(500, { message: "Notes cannot exceed 500 characters" }),
  meetingLink: z.string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .or(z.literal(""))
});

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [newSession, setNewSession] = useState({
    title: "",
    batch: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "",
    notes: "",
    meetingLink: "",
  });
  const [editMode, setEditMode] = useState(false);

  // Initialize form with Zod resolver
  const form = useForm({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      title: "",
      batch: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "",
      notes: "",
      meetingLink: ""
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get teacher ID from localStorage
      const teacherId = localStorage.getItem("id");

      // Fetch teacher's sessions
      const sessionsResponse = await axios.get(
        `${API_URL}/api/sessions/teacher/${teacherId}`
      );
      setSessions(sessionsResponse.data);

      // Fetch teacher's batches for the dropdown
      const batchesResponse = await axios.get(
        `${API_URL}/api/batches/teacher/${teacherId}`
      );
      setBatches(batchesResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load sessions data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter sessions by tab
  const upcomingSessions = sessions.filter(
    (session) => session.status === "upcoming"
  );
  const completedSessions = sessions.filter(
    (session) => session.status === "completed"
  );

  // Filter sessions by selected date
  const selectedDateStr = date ? format(date, "yyyy-MM-dd") : "";
  const sessionsOnSelectedDate = sessions.filter((session) => {
    const sessionDate = new Date(session.date);
    return format(sessionDate, "yyyy-MM-dd") === selectedDateStr;
  });

  const handleNewSessionChange = (e) => {
    setNewSession({
      ...newSession,
      [e.target.name]: e.target.value,
    });
  };

  const handleBatchChange = (value) => {
    setNewSession({
      ...newSession,
      batch: value,
    });
  };

  const handleDateSelect = (selectedDate) => {
    setDate(selectedDate);
    if (selectedDate) {
      setNewSession({
        ...newSession,
        date: format(selectedDate, "yyyy-MM-dd"),
      });
    }
  };

  const handleCreateSession = async (data) => {
    try {
      if (editMode && selectedSession) {
        // Update existing session
        const response = await axios.put(
          `${API_URL}/api/sessions/${selectedSession._id}`,
          data
        );

        // Update local state
        const updatedSessions = sessions.map((session) =>
          session._id === selectedSession._id
            ? { ...session, ...data }
            : session
        );
        setSessions(updatedSessions);

        toast({
          title: "Session updated",
          description: "The session has been updated successfully",
        });
      } else {
        // Create new session
        const response = await axios.post(
          `${API_URL}/api/sessions`,
          data
        );
        setSessions([...sessions, response.data.session]);

        toast({
          title: "Session created",
          description: "New session has been created successfully",
        });
      }

      // Reset form and close dialog
      form.reset({
        title: "",
        batch: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: "",
        notes: "",
        meetingLink: ""
      });
      setShowSessionDialog(false);
      setEditMode(false);

      // Refresh data to ensure consistency
      fetchData();
    } catch (error) {
      console.error("Error handling session:", error);
      toast({
        title: "Error",
        description: editMode
          ? "Failed to update session"
          : "Failed to create session",
        variant: "destructive",
      });
    }
  };

  const handleEditSession = (session) => {
    setSelectedSession(session);
    form.reset({
      title: session.title,
      batch: session.batch._id || session.batch,
      date: format(new Date(session.date), "yyyy-MM-dd"),
      time: session.time,
      notes: session.notes || "",
      meetingLink: session.meetingLink || ""
    });
    setEditMode(true);
    setShowSessionDialog(true);
  };

  const handleDeleteSession = async () => {
    try {
      await axios.delete(`${API_URL}/api/sessions/${sessionToDelete}`);

      // Update local state
      setSessions(
        sessions.filter((session) => session._id !== sessionToDelete)
      );
      setShowDeleteDialog(false);
      setSessionToDelete(null);

      toast({
        title: "Session deleted",
        description: "The session has been removed",
      });
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteSession = (sessionId) => {
    setSessionToDelete(sessionId);
    setShowDeleteDialog(true);
  };

  const handleOpenAttendance = async (session) => {
    setSelectedSession(session);
    setLoadingAttendance(true);

    try {
      // Fetch real students and their attendance status
      const response = await axios.get(
        `${API_URL}/api/sessions/${session._id}/attendance`
      );

      setAttendanceData(response.data.attendance);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive",
      });
    } finally {
      setLoadingAttendance(false);
      setShowAttendanceDialog(true);
    }
  };

  const handleAttendanceChange = (studentId, checked) => {
    // Update the attendance data
    const updatedAttendance = attendanceData.map((record) =>
      record.student._id === studentId
        ? { ...record, present: checked }
        : record
    );

    setAttendanceData(updatedAttendance);
  };

  const handleSaveAttendance = async () => {
    try {
      // Save attendance to the backend
      await axios.post(
        `${API_URL}/api/sessions/${selectedSession._id}/attendance`,
        { attendance: attendanceData }
      );

      // Update local session status
      const updatedSessions = sessions.map((session) =>
        session._id === selectedSession._id
          ? { ...session, status: "completed" }
          : session
      );

      setSessions(updatedSessions);
      setShowAttendanceDialog(false);

      toast({
        title: "Attendance saved",
        description: "The attendance has been recorded successfully",
      });

      // Refresh data to ensure consistency
      fetchData();
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast({
        title: "Error",
        description: "Failed to save attendance data",
        variant: "destructive",
      });
    }
  };

  // Function to handle joining a session
  const handleJoinSession = (session) => {
    if (!session.meetingLink) {
      toast({
        title: "No meeting link available",
        description: "This session doesn't have a meeting link set up.",
        variant: "destructive",
      });
      return;
    }

    // Open the meeting link in a new tab
    window.open(session.meetingLink, "_blank", "noopener,noreferrer");

    toast({
      title: "Joining session",
      description: "Opening the meeting link in a new tab.",
    });
  };

  // Function to handle viewing session recordings
  const handleViewRecording = (session) => {
    // This is a placeholder - in a real implementation you would
    // either redirect to a recordings page or show a dialog with recordings
    toast({
      title: "Recordings feature",
      description: "This feature will allow you to view session recordings.",
      variant: "default",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading sessions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sessions</h1>
        <Button
          onClick={() => {
            setEditMode(false);
            setSelectedSession(null);
            form.reset({
              title: "",
              batch: "",
              date: format(new Date(), "yyyy-MM-dd"),
              time: "",
              notes: "",
              meetingLink: ""
            });
            setShowSessionDialog(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Session
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="upcoming">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingSessions.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedSessions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4 mt-6">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => (
                  <Card key={session._id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{session.title}</CardTitle>
                          <CardDescription>
                            {session.batch?.batchName || "No batch"}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditSession(session)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => confirmDeleteSession(session._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {format(new Date(session.date), "MMMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{session.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {session.students ||
                              session.batch?.students?.length ||
                              0}{" "}
                            Students
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-muted-foreground" />
                          <span>Online Session</span>
                        </div>
                      </div>
                      {session.notes && (
                        <div className="mt-4 text-sm text-muted-foreground">
                          <p>{session.notes}</p>
                        </div>
                      )}
                      {/* {session.meetingLink && (
                        <div className="mt-4 text-sm">
                          <span className="font-medium">Meeting link:</span>{" "}
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline truncate inline-block max-w-md"
                          >
                            {session.meetingLink}
                          </a>
                        </div>
                      )} */}
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button
                        variant="default"
                        className="w-1/2"
                        onClick={() => handleOpenAttendance(session)}
                      >
                        Take Attendance
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-1/2"
                        onClick={() => handleJoinSession(session)}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Join Session
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No upcoming sessions scheduled.
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-6">
              {completedSessions.length > 0 ? (
                completedSessions.map((session) => (
                  <Card key={session._id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{session.title}</CardTitle>
                          <CardDescription>
                            {session.batch?.batchName || "No batch"}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => confirmDeleteSession(session._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {format(new Date(session.date), "MMMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{session.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {session.attendance
                              ? `${
                                  session.attendance.filter((s) => s.present)
                                    .length
                                }/${session.attendance.length} Attended`
                              : `${
                                  session.students ||
                                  session.batch?.totalStudents ||
                                  0
                                } Students`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-muted-foreground" />
                          <span>Online Session</span>
                        </div>
                      </div>
                      {session.notes && (
                        <div className="mt-4 text-sm text-muted-foreground">
                          <p>{session.notes}</p>
                        </div>
                      )}
                      {/* {session.meetingLink && (
                        <div className="mt-4 text-sm">
                          <span className="font-medium">Meeting link:</span>{" "}
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline truncate inline-block max-w-md"
                          >
                            {session.meetingLink}
                          </a>
                        </div>
                      )} */}
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button
                        variant="outline"
                        className="w-1/2"
                        onClick={() => handleOpenAttendance(session)}
                      >
                        View Attendance
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-1/2"
                        onClick={() => handleViewRecording(session)}
                      >
                        <VideoIcon className="mr-2 h-4 w-4" />
                        View Recording
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No completed sessions found.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Session Calendar</CardTitle>
              <CardDescription>
                View and manage sessions by date
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                className="rounded-md border"
              />
            </CardContent>

            <CardContent className="pt-6">
              <h3 className="font-medium mb-3">
                Sessions on{" "}
                {date ? format(date, "MMMM d, yyyy") : "selected date"}
              </h3>
              {sessionsOnSelectedDate.length > 0 ? (
                <div className="space-y-3">
                  {sessionsOnSelectedDate.map((session) => (
                    <div
                      key={session._id}
                      className="p-3 rounded-md border hover:border-primary transition-colors cursor-pointer"
                      onClick={() => handleEditSession(session)}
                    >
                      <div className="font-medium">{session.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {session.time}
                      </div>
                      <div className="text-xs mt-1 text-muted-foreground">
                        {session.batch?.batchName || "No batch"}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            session.status === "upcoming"
                              ? "bg-primary/10 text-primary"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {session.status === "upcoming"
                            ? "Upcoming"
                            : "Completed"}
                        </span>
                        {session.status === "upcoming" &&
                          session.meetingLink && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinSession(session);
                              }}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Join
                            </Button>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No sessions on this date.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create/Edit Session Dialog */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Session" : "Create New Session"}
            </DialogTitle>
            <DialogDescription>
              {editMode
                ? "Update the session details below"
                : "Fill in the details for the new session"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateSession)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Session title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="batch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.map((batch) => (
                          <SelectItem key={batch._id} value={batch._id}>
                            {batch.batchName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., 10:00 AM - 11:30 AM" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Session details and agenda"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meetingLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Link</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://meet.google.com/xxx-xxxx-xxx or Zoom link"
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
                  onClick={() => setShowSessionDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editMode ? "Update Session" : "Create Session"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog
        open={showAttendanceDialog}
        onOpenChange={setShowAttendanceDialog}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {selectedSession?.status === "completed"
                ? "Attendance Record"
                : "Take Attendance"}
            </DialogTitle>
            <DialogDescription>
              {selectedSession?.title} -{" "}
              {selectedSession?.date &&
                format(new Date(selectedSession.date), "MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {loadingAttendance ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span>Loading attendance data...</span>
              </div>
            ) : (
              <>
                {attendanceData && attendanceData.length > 0 ? (
                  <div className="space-y-2">
                    {attendanceData.map((record) => (
                      <div
                        key={record.student._id}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`student-${record.student._id}`}
                            checked={record.present}
                            onCheckedChange={(checked) =>
                              handleAttendanceChange(
                                record.student._id,
                                checked
                              )
                            }
                            disabled={selectedSession?.status === "completed"}
                          />
                          <Label htmlFor={`student-${record.student._id}`}>
                            {record.student.name}
                          </Label>
                        </div>
                        {record.present ? (
                          <span className="text-xs text-green-600 flex items-center">
                            <Check size={14} className="mr-1" /> Present
                          </span>
                        ) : (
                          <span className="text-xs text-red-500">Absent</span>
                        )}
                      </div>
                    ))}

                    <div className="mt-4 p-3 bg-muted/50 rounded-md">
                      <p className="text-sm font-medium">Attendance Summary</p>
                      <p className="text-sm">
                        {attendanceData.filter((r) => r.present).length} out of{" "}
                        {attendanceData.length} students present (
                        {Math.round(
                          (attendanceData.filter((r) => r.present).length /
                            attendanceData.length) *
                            100
                        )}
                        %)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    No students found for this session.
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAttendanceDialog(false)}
            >
              Close
            </Button>
            {selectedSession?.status !== "completed" &&
              attendanceData &&
              attendanceData.length > 0 && (
                <Button onClick={handleSaveAttendance}>Save Attendance</Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this session? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => sessionToDelete && handleDeleteSession()}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sessions;
