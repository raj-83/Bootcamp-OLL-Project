import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Lock, School } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
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

// Define the user type enum
const UserType = {
  STUDENT: "student",
  MENTOR: "mentor",
  ADMIN: "admin"
} as const;

type UserType = typeof UserType[keyof typeof UserType];

// Add the form schema
const registerFormSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name cannot exceed 50 characters" })
    .regex(/^[a-zA-Z\s]*$/, { message: "Name can only contain letters and spaces" }),
  email: z.string()
    .email({ message: "Please enter a valid email address" })
    .min(1, { message: "Email is required" }),
  phone: z.string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(15, { message: "Phone number cannot exceed 15 digits" })
    .regex(/^[0-9+\-\s()]*$/, { message: "Please enter a valid phone number" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string()
    .min(1, { message: "Please confirm your password" }),
  school: z.string()
    .min(2, { message: "School name must be at least 2 characters long" })
    .max(100, { message: "School name cannot exceed 100 characters" })
    .optional(),
  userType: z.enum([UserType.STUDENT, UserType.MENTOR, UserType.ADMIN])
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
}).refine((data) => {
  if (data.userType === UserType.STUDENT) {
    return !!data.school;
  }
  return true;
}, {
  message: "School name is required for students",
  path: ["school"]
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with Zod resolver
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      school: "",
      userType: UserType.STUDENT
    }
  });

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    
    try {
      // Call register from auth context
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.userType,
        school: data.userType === UserType.STUDENT ? data.school : undefined,
      });
      
      toast({
        title: "Registration successful!",
        description: "Your account has been created.",
      });

      // Navigation will be handled by the auth context after successful registration

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to register",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>
            Join the OLL Business Bootcamp platform
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input 
                          placeholder="John Smith"
                          className="pl-10"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="your.email@example.com"
                          className="pl-10"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                    </div>
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
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input 
                          type="tel"
                          placeholder="(555) 123-4567"
                          className="pl-10"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input 
                            type="password"
                            className="pl-10"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input 
                            type="password"
                            className="pl-10"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                      </div>
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
                    <FormLabel>School Name (For Students)</FormLabel>
                    <div className="relative">
                      <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input 
                          placeholder="Your School Name"
                          className="pl-10"
                          disabled={isLoading || form.watch("userType") !== UserType.STUDENT}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="userType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        type="button" 
                        variant={field.value === UserType.STUDENT ? "default" : "outline"}
                        onClick={() => field.onChange(UserType.STUDENT)}
                        className="flex-1"
                        disabled={isLoading}
                      >
                        Student
                      </Button>
                      <Button 
                        type="button" 
                        variant={field.value === UserType.MENTOR ? "default" : "outline"}
                        onClick={() => field.onChange(UserType.MENTOR)}
                        className="flex-1"
                        disabled={isLoading}
                      >
                        Mentor
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2 border-t p-6 text-center text-sm text-muted-foreground">
          <div>
            Already have an account? 
            <Button variant="link" className="px-2 py-0" onClick={() => navigate("/login")}>
              Sign in
            </Button>
          </div>
          <div>
            By continuing, you agree to our 
            <Button variant="link" className="px-1.5 py-0">Terms of Service</Button> and 
            <Button variant="link" className="px-1.5 py-0">Privacy Policy</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
