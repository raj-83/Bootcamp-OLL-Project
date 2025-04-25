
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { PhoneCall, Mail, MessageSquare } from 'lucide-react';

const FAQs = [
  {
    question: "How do I submit my assignments?",
    answer: "Go to the Tasks section in your dashboard, find the assignment you want to submit, click on the 'Submit Task' button, and follow the instructions to upload your work."
  },
  {
    question: "How is my performance evaluated?",
    answer: "Your performance is evaluated based on task completion, sales achievements, mentor feedback, and overall participation in the program."
  },
  {
    question: "Can I change my mentor?",
    answer: "Mentor assignments are typically fixed for the duration of a batch. However, if you're experiencing difficulties, please contact our support team to discuss your situation."
  },
  {
    question: "How do I track my sales?",
    answer: "Navigate to the Sales section in your dashboard to view detailed information about your transactions, revenue, and sales history."
  },
  {
    question: "When will I receive my earnings?",
    answer: "Earnings are typically processed at the end of each month. You can view your earnings status in the Sales section of your dashboard."
  },
  {
    question: "What happens if I miss a session?",
    answer: "It's important to attend all sessions. If you miss a session, you should contact your mentor immediately and review the session recording if available."
  },
  {
    question: "How do I provide feedback about the program?",
    answer: "You can provide feedback through the Feedback section in your dashboard, or by contacting our support team directly."
  }
];

const HelpSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Find answers to common questions about the program</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {FAQs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
          <CardDescription>Reach out to us if you need further assistance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-3">
              <PhoneCall className="h-8 w-8 text-primary" />
              <div className="text-center">
                <p className="font-medium">Call Us</p>
                <p className="text-sm text-muted-foreground">9920188188</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-3">
              <Mail className="h-8 w-8 text-primary" />
              <div className="text-center">
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">info@oll.co</p>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div className="text-center">
                <p className="font-medium">WhatsApp</p>
                <p className="text-sm text-muted-foreground">9920188188</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpSection;
