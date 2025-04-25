import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  Users,
  Star,
  School,
  Edit,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import UserAvatar from "@/components/ui-custom/UserAvatar";
import axios from "axios";

const AdminTeacherDetails = () => {
  const navigate = useNavigate();
  const { teacherId } = useParams();
  const [teacherData, setTeacherData] = useState({
        id: 1,
        name: 'Jamie Smith',
        email: 'jamie.smith@example.com',
        phone: '+1 234-567-8901',
        specialization: 'Business Strategy',
        status: 'active',
        batches: [],
        students: [],
        totalBatches: 2,
        currentBatches: 1,
        totalStudents: 31,
        totalEarnings: 1450,
        rating: 4.8,
        joiningDate: '2023-01-15',
        earnings: [
          { month: 'January', amount: 450 },
          { month: 'February', amount: 520 },
          { month: 'March', amount: 480 }
        ]
      }
  );

  const [batchData, setBatchData] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const fetchTeacherBatchAndStudent = async () => {
      try {
        setLoading(true);
        const teacherResponse = await axios.get(`http://localhost:5000/api/teachers/${teacherId}`);
        setTeacherData(teacherResponse.data);

        const batchIds = teacherResponse.data.batches || [];
        const batchPromises = batchIds.map((batchId) =>
          axios.get(`http://localhost:5000/api/batches/${batchId}`)
        );

        const batchResponses = await Promise.all(batchPromises);
        const fetchedBatches = batchResponses.map((response) => response.data);
        setBatchData(fetchedBatches);

        const studentIds = teacherResponse.data.students || [];
        const studentPromises = studentIds.map((studentId) =>
          axios.get(`http://localhost:5000/api/students/${studentId}`)
        );
        const studentResponses = await Promise.all(studentPromises);
        const fetchedStudents = studentResponses.map((response) => response.data);
        setStudentData(fetchedStudents);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        setLoading(false);
      }
     }

    if (teacherId) {
      fetchTeacherBatchAndStudent();
    }
  }, [teacherId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/teachers")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Teachers
          </Button>
          <h1 className="text-2xl font-bold">Teacher Details</h1>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex flex-col items-center text-center md:w-1/4">
              <UserAvatar name={teacherData.name} size="xl" />
              <h2 className="text-xl font-bold mt-4">{teacherData.name}</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                {teacherData.status}
              </span>
              <p className="text-sm text-muted-foreground mt-2">
                Joined on {teacherData.joiningDate}
              </p>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{teacherData.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{teacherData.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <School className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Specialization
                  </p>
                  <p className="font-medium">{teacherData.specialization}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Batches</p>
                  <p className="font-medium">
                    {teacherData.batches.length} current /{" "}
                    {teacherData.batches.length} total
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="font-medium">
                    {teacherData.students.length} total
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Earnings
                  </p>
                  <p className="font-medium">${teacherData.totalEarnings}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="font-medium">{teacherData.rating}/5.0</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>
                Overall performance metrics for this teacher
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Current Batches
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {teacherData.batches.length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Active Students
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {teacherData.students.length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Average Rating
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold flex items-center">
                      {teacherData.rating}
                      <Star className="h-4 w-4 ml-1 text-yellow-500 fill-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batches" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Batches</CardTitle>
              <CardDescription>
                All batches this teacher is managing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {batchData.map((batch) => (
                  <div
                    key={batch.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{batch.batchName}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        batch.status === "ongoing"
                          ? "bg-green-100 text-green-800"
                          : batch.status === "upcoming"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {batch.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Students</CardTitle>
              <CardDescription>
                Students this teacher is mentoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentData.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar name={student.name} size="sm" />
                      <div>
                        <p className="font-medium">{student.name}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.performance === "Excellent"
                          ? "bg-green-100 text-green-800"
                          : student.performance === "Good"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {student.performance}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Earnings History</CardTitle>
              <CardDescription>Monthly earnings breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teacherData.earnings.map((earning, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{earning.month} 2023</p>
                      </div>
                    </div>
                    <div className="font-medium text-green-600">
                      ${earning.amount}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTeacherDetails;