import React, { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import {
  Search,
  Users,
  Calendar,
  Plus,
  Edit,
  Trash2,
  School,
  Clock,
  Filter,
  MoreVertical,
  DollarSign,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
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

const AdminBatches = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showAddBatchDialog, setShowAddBatchDialog] = useState(false);
  const [showEditBatchDialog, setShowEditBatchDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [currentBatch, setCurrentBatch] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [batchesData, setBatchesData] = useState([
    {
      _id: 1,
      batchName: "Batch A",
      status: "ongoing",
      teacher: "John Doe",
      teacherId: "123456789", // Added teacherId for reference
      startDate: "2023-01-01",
      endDate: "2023-06-01",
      scheduleDays: ["Monday", "Wednesday", "Friday"],
      sessionTime: "10:00 AM - 12:00 PM",
      sessionTopic: "Math, Science",
      totalStudents: 20,
      revenue: 2000,
      teacherEarnings: 400,
      ollShare: 600,
    },
    // Add more dummy data as needed
  ]);
  const [teachersData, setTeachersData] = useState([
    {
      _id: "123456789", // Updated to _id for MongoDB compatibility
      name: "Jamie Smith",
      email: "jamie.smith@example.com",
      phone: "+1 234-567-8901",
      specialization: "Business Strategy",
      status: "active",
      totalBatches: 2,
      currentBatches: 1,
      totalStudents: 31,
      revenue: 1450,
      rating: 4.8,
      joiningDate: "2023-01-15",
    },
  ]);

  // Mapping to keep track of teacher IDs to names
  const [teacherMap, setTeacherMap] = useState<{ [key: string]: string }>({});


  // Define your form schema to match the MongoDB schema
  const formSchema = z.object({
    batchName: z.string().min(1, { message: "Batch name is required" }),
    teacher: z.string().min(1, { message: "Teacher selection is required" }),
    startDate: z.string().min(1, { message: "Start date is required" }),
    endDate: z.string().min(1, { message: "End date is required" }),
    time: z.string().min(1, { message: "Session time is required" }),
    topics: z.string().min(1, { message: "At least one topic is required" }),
    totalStudents: z.number().default(10).optional(),
    revenue: z.number().default(100).optional(),
  });

  const getBatchStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return "upcoming";
    if (now > end) return "completed";
    return "ongoing";
  };

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      // Modify this to populate the students field or request count
      const res = await fetch("http://localhost:5000/api/batches?populate=students");
      const data = await res.json();
  
      // Process the data to include teacher names
      const processedData = data.map((batch) => {
        const teacherName = teacherMap[batch.teacher] || "Unknown Teacher";
        return {
          ...batch,
          teacherName,
          // Add a convenience property for student count
          studentCount: batch.students ? batch.students.length : 0
        };
      });
  
      setBatchesData(processedData);
    } catch (err) {
      console.error("Failed to fetch batches", err);
      toast({
        title: "Error",
        description: "Failed to load batches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/teachers");
        const data = await res.json();
        setTeachersData(data);

        // Create a mapping of teacher IDs to names
        const teacherMapping = {};
        data.forEach((teacher) => {
          teacherMapping[teacher._id] = teacher.name;
        });
        setTeacherMap(teacherMapping);
      } catch (err) {
        console.error("Failed to fetch teachers", err);
      }
    };

    fetchTeachers();
    fetchBatches();
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batchName: "",
      teacher: "",
      startDate: "",
      endDate: "",
      time: "",
      topics: "",
      totalStudents: 10,
      revenue: 100,
    },
  });

  const editForm = useForm({
    defaultValues: {
      batchName: "",
      startDate: "",
      endDate: "",
      teacher: "",
      teacherName: "", // Added field to store teacher name for display
      time: "",
      topics: "",
    },
  });

  const scheduleDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];


  

  const handleDayToggle = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleAddBatch = async (data) => {
    try {
      const response = await fetch("http://localhost:5000/api/batches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          batchName: data.batchName,
          teacher: data.teacher, // Now passing the teacher ID instead of name
          startDate: data.startDate,
          endDate: data.endDate,
          scheduleDays: selectedDays,
          sessionTime: data.time,
          sessionTopic: data.topics,
          totalStudents: data.totalStudents || 10, // Use form value or default
          revenue: data.revenue || 100, // Use form value or default
          students: [], // Initialize with empty array
        }),
      });
      const resData = await response.json();
      if (!response.ok)
        throw new Error(resData.error || "Something went wrong");
      toast({
        title: "Batch Created",
        description: "New batch has been added successfully",
      });
      fetchBatches(); // Refresh batches data
      form.reset();
      setSelectedDays([]);
      setShowAddBatchDialog(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleEditBatch = (batchId: number) => {
    const batch = batchesData.find((b) => b._id === batchId);
    if (batch) {
      setCurrentBatch(batch);
      // Format dates for the date input (YYYY-MM-DD)
      const startDate = batch.startDate.split("T")[0];
      const endDate = batch.endDate.split("T")[0];

      editForm.reset({
        batchName: batch.batchName,
        startDate: startDate,
        endDate: endDate,
        teacher: batch.teacher, // Using teacherId
        teacherName: teacherMap[batch.teacher] || batch.teacher, // Display name
        time: batch.sessionTime,
        topics: Array.isArray(batch.sessionTopic)
          ? batch.sessionTopic.join("\n")
          : batch.sessionTopic || "",
      });
      setSelectedDays(batch.scheduleDays);
      setShowEditBatchDialog(true);
    }
  };

  const handleUpdateBatch = async (data) => {
    if (!currentBatch) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/batches/${currentBatch._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            batchName: data.batchName,
            teacher: data.teacher, // Using teacherId
            startDate: data.startDate,
            endDate: data.endDate,
            scheduleDays: selectedDays,
            sessionTime: data.time,
            sessionTopic: data.topics
              .split("\n")
              .filter((topic) => topic.trim()),
            // We're not changing the teacher in the edit form
          }),
        }
      );

      const resData = await response.json();

      if (!response.ok)
        throw new Error(resData.error || "Something went wrong");

      toast({
        title: "Batch Updated",
        description: "Batch has been successfully updated",
      });

      fetchBatches(); // Refresh batches data
      setShowEditBatchDialog(false);
      editForm.reset();
      setSelectedDays([]);
      setCurrentBatch(null);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to update batch",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (batch) => {
    setCurrentBatch(batch);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentBatch) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/batches/${currentBatch._id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete batch");
      }

      toast({
        title: "Batch Deleted",
        description: "The batch has been successfully deleted",
      });

      // Remove the batch from local state
      setBatchesData(
        batchesData.filter((batch) => batch._id !== currentBatch._id)
      );
      setShowDeleteDialog(false);
      setCurrentBatch(null);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const batchesWithStatus = batchesData.map((batch) => ({
    ...batch,
    status: getBatchStatus(batch.startDate, batch.endDate),
  }));

  const filteredBatches = batchesWithStatus.filter(
    (batch) =>
      (batch.batchName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) &&
      (activeTab === "all" || batch.status === activeTab)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Manage Batches</h1>

        <div className="flex gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search batches..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button onClick={() => setShowAddBatchDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Batch
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Teacher (20%)</TableHead>
                    <TableHead>OLL Share (30%)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10">
                        Loading batches...
                      </TableCell>
                    </TableRow>
                  ) : filteredBatches.length > 0 ? (
                    filteredBatches.map((batch) => (
                      <TableRow key={batch._id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{batch.batchName}</div>
                            <div className="text-xs text-muted-foreground">
                              {batch.startDate.split("T")[0]} to{" "}
                              {batch.endDate.split("T")[0]}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              batch.status === "upcoming"
                                ? "outline"
                                : batch.status === "completed"
                                ? "secondary"
                                : "default"
                            }
                          >
                            {batch.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <School className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {teacherMap[batch.teacher] || batch.teacher}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="text-xs flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                              {batch.scheduleDays.join(", ")}
                            </div>
                            <div className="text-xs flex items-center mt-1">
                              <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                              {batch.sessionTime}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                            {(batch as any).studentCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-success" />
                            ${batch.revenue}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-blue-500" />
                            ${(batch.revenue * 0.2).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-purple-500" />
                            ${(batch.revenue * 0.3).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(`/admin/batches/${batch._id}`)
                              }
                            >
                              View
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="flex items-center"
                                  onClick={() => handleEditBatch(batch._id)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Batch
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center text-destructive"
                                  onClick={() => handleDeleteClick(batch)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Batch
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No batches found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Batch Dialog - Updated to use teacher ID */}
      <Dialog open={showAddBatchDialog} onOpenChange={setShowAddBatchDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Batch</DialogTitle>
            <DialogDescription>
              Create a new batch by filling out the details below.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleAddBatch)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="batchName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter batch name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teacher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teacher</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a teacher" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teachersData.map((teacher) => (
                            <SelectItem key={teacher._id} value={teacher._id}>
                              {teacher.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel>Schedule Days</FormLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  {scheduleDays.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={
                        selectedDays.includes(day) ? "default" : "outline"
                      }
                      onClick={() => handleDayToggle(day)}
                      className="flex-1"
                    >
                      {day.substring(0, 3)}
                    </Button>
                  ))}
                </div>
                {selectedDays.length === 0 && (
                  <p className="text-sm text-destructive mt-1">
                    Please select at least one day
                  </p>
                )}
              </div>

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Time</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 3:00 PM - 5:00 PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="topics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Topics</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter topics to be covered in this batch, one per line"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter one topic per line. These will be used to create
                      session schedules.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Bulk Add Students</FormLabel>
                <div className="mt-2 border-2 border-dashed rounded-lg p-4 text-center">
                  <label className="cursor-pointer">
                    <Input type="file" className="hidden" accept=".csv,.xlsx" />
                    <div className="space-y-2">
                      <Plus className="h-6 w-6 mx-auto text-muted-foreground" />
                      <p className="text-sm font-medium">
                        Upload CSV or Excel file
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Format: Name, Email, Phone, Age, School, Password
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowAddBatchDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Batch"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Batch Dialog - Updated */}
      <Dialog open={showEditBatchDialog} onOpenChange={setShowEditBatchDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Batch</DialogTitle>
            <DialogDescription>
              Update batch information below.
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleUpdateBatch)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="batchName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter batch name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="teacher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teacher</FormLabel>
                      <FormControl>
                        <select
                          className="border border-input rounded-md px-3 py-2 w-full"
                          {...field}
                        >
                          <option value="">Select a teacher</option>
                          {teachersData.map((teacher) => (
                            <option key={teacher._id} value={teacher._id}>
                              {teacher.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel>Schedule Days</FormLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  {scheduleDays.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={
                        selectedDays.includes(day) ? "default" : "outline"
                      }
                      onClick={() => handleDayToggle(day)}
                      className="flex-1"
                    >
                      {day.substring(0, 3)}
                    </Button>
                  ))}
                </div>
                {selectedDays.length === 0 && (
                  <p className="text-sm text-destructive mt-1">
                    Please select at least one day
                  </p>
                )}
              </div>

              <FormField
                control={editForm.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Time</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 3:00 PM - 5:00 PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="topics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Topics</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter topics to be covered in this batch, one per line"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter one topic per line. These will be used to create
                      session schedules.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowEditBatchDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Batch"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the batch{" "}
              <span className="font-semibold">{currentBatch?.batchName}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Batch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBatches;
