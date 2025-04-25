import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from "axios";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { 
  Search, 
  Plus, 
  Filter, 
  DollarSign, 
  Briefcase, 
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  BookOpen,
  School,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import UserAvatar from '@/components/ui-custom/UserAvatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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

const AdminStudents = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [showEditStudentDialog, setShowEditStudentDialog] = useState(false);
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [studentsData, setStudentsData] = useState([]);
  const [batchesData, setBatchesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // For batch name to ID mapping
  const [batchNameToIdMap, setBatchNameToIdMap] = useState({});
  const [batchIdToNameMap, setBatchIdToNameMap] = useState({});

  // Form setup
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      batches: [], // Changed from batch to batches to match schema
      age: '',
      school: '',
      password: ''
    }
  });

  const editForm = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      batches: [], // Changed from batch to batches to match schema
      age: '',
      school: ''
    }
  });

  // Fetch students and batches data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, batchesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/students"),
        axios.get("http://localhost:5000/api/batches")
      ]);
      
      setStudentsData(studentsRes.data);
      setBatchesData(batchesRes.data);
      
      // Create mapping between batch names and IDs
      const nameToId = {};
      const idToName = {};
      batchesRes.data.forEach(batch => {
        nameToId[batch.batchName] = batch._id;
        idToName[batch._id] = batch.batchName;
      });
      
      setBatchNameToIdMap(nameToId);
      setBatchIdToNameMap(idToName);
      
    } catch (err) {
      console.error("Failed to fetch data", err);
      toast({
        title: "Error fetching data",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle add student form submission
  const handleAddStudent = async (data) => {
    setIsSubmitting(true);
    try {
      // Convert batch name to batch ID and put in an array
      const batchId = batchNameToIdMap[data.batches];
      const studentData = {
        ...data,
        batches: batchId ? [batchId] : [] // Use an array of batch IDs as per schema
      };
      
      const response = await axios.post("http://localhost:5000/api/students", studentData);
      toast({
        title: "Student added",
        description: "New student has been successfully added"
      });
      setShowAddStudentDialog(false);
      form.reset();
      // Refresh student list
      fetchData();
    } catch (error) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit student functionality
  const handleEditStudent = (studentId) => {
    const student = studentsData.find(s => s._id === studentId);
    if (student) {
      setCurrentStudent(student);
      
      // Find batch name from batch ID if available
      let batchName = '';
      if (student.batches && student.batches.length > 0) {
        const batchId = student.batches[0]; // Assuming first batch
        batchName = batchIdToNameMap[batchId] || '';
      }
      
      editForm.reset({
        name: student.name,
        email: student.email,
        phone: student.phone,
        batches: batchName, // Use batch name for display
        age: student.age?.toString() || '',
        school: student.school || ''
      });
      
      setShowEditStudentDialog(true);
    }
  };

  // Handle update student form submission
  const handleUpdateStudent = async (data) => {
    if (!currentStudent) return;
    
    setIsSubmitting(true);
    try {
      // Convert batch name to batch ID
      const batchId = batchNameToIdMap[data.batches];
      
      const studentData = {
        ...data,
        batches: batchId ? [batchId] : [] // Use an array of batch IDs as per schema
      };
      
      const response = await axios.patch(
        `http://localhost:5000/api/students/${currentStudent._id}`, 
        studentData
      );
      
      toast({
        title: "Student updated",
        description: "Student information has been successfully updated"
      });
      
      setShowEditStudentDialog(false);
      // Refresh student list
      fetchData();
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete student functionality
  const handleDeleteClick = (student) => {
    setCurrentStudent(student);
    setShowDeleteDialog(true);
  };

  const confirmDeleteStudent = async () => {
    if (!currentStudent) return;
    
    setIsSubmitting(true);
    try {
      await axios.delete(`http://localhost:5000/api/students/${currentStudent._id}`);
      
      toast({
        title: "Student deleted",
        description: "Student has been successfully removed"
      });
      
      setShowDeleteDialog(false);
      // Refresh student list
      fetchData();
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle bulk upload
  const handleBulkUpload = () => {
    toast({
      title: "Students uploaded",
      description: "Students have been successfully uploaded"
    });
    setShowBulkUploadDialog(false);
  };

  // Get batch name from batch ID for display
  const getBatchNameFromId = (batchId) => {
    if (!batchId) return '';
    return batchIdToNameMap[batchId] || 'Unknown Batch';
  };

  // Filter students based on search and filter criteria
  const filteredStudents = studentsData
    .filter(student => 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(student => 
      statusFilter === 'all' || student.status === statusFilter
    )
    .filter(student => {
      if (batchFilter === 'all') return true;
      // Check if student has the batch ID or name matching the filter
      if (student.batches && student.batches.length > 0) {
        return student.batches.includes(batchNameToIdMap[batchFilter]) || 
               student.batches.some(id => getBatchNameFromId(id) === batchFilter);
      }
      return false;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Manage Students</h1>
        
        <div className="flex gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <div className="p-2">
                <p className="text-sm font-medium mb-2">Status</p>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-2">
                <p className="text-sm font-medium mb-2">Batch</p>
                <Select value={batchFilter} onValueChange={setBatchFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    {batchesData.map(batch => (
                      <SelectItem key={batch._id} value={batch.batchName}>
                        {batch.batchName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Students
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setShowAddStudentDialog(true)}>
                Add Single Student
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <p>Loading students...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Task Completion</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar name={student.name} size="sm" />
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />{student.email}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />{student.phone}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {student.batches && student.batches.length > 0 
                              ? getBatchNameFromId(student.batches[0])
                              : 'No Batch'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            student.status === 'active' 
                              ? 'default' 
                              : student.status === 'pending' 
                                ? 'outline' 
                                : 'secondary'
                          }
                          className={student.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full max-w-24">
                            <div className="h-2 w-full bg-muted rounded-full">
                              <div 
                                className={`h-full rounded-full ${
                                  student.attendance >= 90 ? 'bg-green-500' : 
                                  student.attendance >= 75 ? 'bg-amber-500' : 
                                  'bg-destructive'
                                }`}
                                style={{ width: `${student.attendance}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs">{student.attendance}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full max-w-24">
                            <div className="h-2 w-full bg-muted rounded-full">
                              <div 
                                className={`h-full rounded-full ${
                                  student.taskCompletion >= 90 ? 'bg-green-500' : 
                                  student.taskCompletion >= 75 ? 'bg-amber-500' : 
                                  'bg-destructive'
                                }`}
                                style={{ width: `${student.taskCompletion}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs">{student.taskCompletion}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                          ${student.earning || 0} {/* Changed to match schema (earning instead of earnings) */}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/admin/students/${student._id}`)}
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
                                onClick={() => handleEditStudent(student._id)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Student
                              </DropdownMenuItem>
                              {student.status === 'pending' && (
                                <DropdownMenuItem className="flex items-center text-green-500">
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Approve Student
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="flex items-center text-destructive"
                                onClick={() => handleDeleteClick(student)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Student
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No students found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Student Dialog */}
      <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Add a new student to the platform by filling out their details.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddStudent)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter student's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter age" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="school"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter school name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="batches"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Batch</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a batch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {batchesData.map(batch => (
                          <SelectItem key={batch._id} value={batch.batchName}>
                            {batch.batchName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setShowAddStudentDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Student"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={showEditStudentDialog} onOpenChange={setShowEditStudentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information below.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateStudent)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter student's full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter age" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="school"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter school name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="batches"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Batch</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a batch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {batchesData.map(batch => (
                          <SelectItem key={batch._id} value={batch.batchName}>
                            {batch.batchName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setShowEditStudentDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Student"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Student Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Delete Student
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {currentStudent?.name}? This action cannot be undone and will remove all their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteStudent}
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting ? "Deleting..." : "Delete Student"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUploadDialog} onOpenChange={setShowBulkUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Upload Students</DialogTitle>
            <DialogDescription>
              Upload multiple students at once using a CSV or Excel file.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <label className="cursor-pointer">
                <Input type="file" className="hidden" accept=".csv,.xlsx" />
                <div className="space-y-2">
                  <Plus className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-sm font-medium">Upload CSV or Excel file</p>
                  <p className="text-xs text-muted-foreground">
                    Drag and drop or click to browse
                  </p>
                </div>
              </label>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Required Format</h3>
              <div className="bg-muted p-3 rounded text-xs">
                <p className="mb-1">Your file should include the following columns:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Name (required)</li>
                  <li>Email (required)</li>
                  <li>Phone (required)</li>
                  <li>Age</li>
                  <li>School</li>
                  <li>Password (required)</li>
                  <li>Batch ID or Name</li>
                </ul>
              </div>
            </div>
            
            <div>
              <Button 
                className="w-full"
                onClick={handleBulkUpload}
              >
                Upload Students
              </Button>
            </div>
            
            <div>
              <a 
                href="#" 
                className="text-sm text-primary hover:underline block text-center"
                onClick={(e) => {
                  e.preventDefault();
                  // Would download a template in a real app
                  toast({
                    title: "Template downloaded",
                    description: "Student upload template has been downloaded"
                  });
                }}
              >
                Download template file
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStudents;
