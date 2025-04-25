
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Phone, 
  Mail, 
  MessagesSquare, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  FileQuestion, 
  MessageCircle 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const faqData = [
  {
    id: 1,
    question: "How do I join a new batch?",
    answer: "To join a new batch, navigate to the 'Batches' section and click on 'Join Batch'. You'll see a list of available batches you can enroll in. Select your preferred batch and follow the registration process."
  },
  {
    id: 2,
    question: "How are earnings calculated?",
    answer: "Earnings are calculated based on successful sales and customer acquisition. Each successful sale earns you a commission percentage. You can view your earning details in the 'Earnings' section."
  },
  {
    id: 3,
    question: "How can I submit my assignments?",
    answer: "You can submit assignments through the 'Tasks' section. Click on the assignment you want to complete, upload your submission, and click 'Submit'. Make sure to submit before the deadline."
  },
  {
    id: 4,
    question: "What happens if I miss a session?",
    answer: "If you miss a session, you can watch the recorded version available in the 'Sessions' section. However, we recommend attending live sessions for better interaction and learning."
  },
  {
    id: 5,
    question: "How is my performance evaluated?",
    answer: "Your performance is evaluated based on session attendance, task completion, quiz scores, and practical application of learning. You can check your progress in the 'Dashboard'."
  },
  {
    id: 6,
    question: "How do I provide feedback about the program?",
    answer: "You can provide feedback through the 'Feedback' section. Your inputs help us improve the program experience for everyone."
  },
  {
    id: 7,
    question: "Can I access the platform on mobile devices?",
    answer: "Yes, our platform is fully responsive and can be accessed on mobile devices, tablets, and computers through any modern web browser."
  },
  {
    id: 8,
    question: "How do leaderboards work?",
    answer: "Leaderboards rank students based on their overall performance in tasks, attendance, and special achievements. Rankings are updated regularly to reflect recent activities."
  }
];

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaqs, setExpandedFaqs] = useState<number[]>([]);
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", contactFormData);
    toast({
      title: "Message sent",
      description: "We've received your message and will get back to you soon."
    });
    setContactFormData({
      name: '',
      email: '',
      message: ''
    });
  };

  const toggleFaq = (id: number) => {
    setExpandedFaqs(prev => 
      prev.includes(id) 
        ? prev.filter(faqId => faqId !== id) 
        : [...prev, id]
    );
  };

  const filteredFaqs = searchTerm 
    ? faqData.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : faqData;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Help & Support</h1>
      
      <Tabs defaultValue="faq">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="faq" className="flex items-center">
            <FileQuestion className="h-4 w-4 mr-2" />
            FAQs
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center">
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact Us
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="faq" className="space-y-4 pt-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search FAQs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {filteredFaqs.length > 0 ? (
            <div className="space-y-2">
              {filteredFaqs.map(faq => (
                <Card key={faq.id} className="overflow-hidden">
                  <div 
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <h3 className="font-medium">{faq.question}</h3>
                    {expandedFaqs.includes(faq.id) ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  {expandedFaqs.includes(faq.id) && (
                    <CardContent className="pt-0 pb-4 px-4 text-muted-foreground">
                      {faq.answer}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No FAQs found matching your search term.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="contact" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
                <CardDescription>
                  Have a question or need help? Send us a message and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Full Name
                      </label>
                      <Input 
                        id="name" 
                        name="name" 
                        placeholder="Enter your full name" 
                        value={contactFormData.name}
                        onChange={handleContactFormChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        placeholder="Enter your email" 
                        value={contactFormData.email}
                        onChange={handleContactFormChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      placeholder="Type your message here..." 
                      rows={5}
                      value={contactFormData.message}
                      onChange={handleContactFormChange}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Get in touch with our support team through the following channels.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">+91 9920188188</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">info@oll.co</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessagesSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Live Chat</p>
                    <p className="font-medium">Available 9 AM - 6 PM</p>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Our support team is available Monday to Friday, 9 AM to 6 PM IST. We typically respond within 24 hours.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Help;
