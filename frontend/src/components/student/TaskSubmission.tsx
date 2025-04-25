
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { UploadCloud, PaperclipIcon, X, SendIcon } from 'lucide-react';

interface TaskSubmissionProps {
  taskId: number;
  taskTitle: string;
  onSubmissionComplete: () => void;
}

const TaskSubmission: React.FC<TaskSubmissionProps> = ({ taskId, taskTitle, onSubmissionComplete }) => {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };
  
  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setOpen(false);
      onSubmissionComplete();
      setDescription('');
      setFiles([]);
    }, 1000);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">Submit Task</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Submit Task</DialogTitle>
          <DialogDescription>
            Task: {taskTitle}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Describe your submission..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file-upload">Attachments</Label>
            <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center bg-muted/30">
              <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-1">
                Drag and drop files here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Accepted file types: PDF, DOCX, JPG, PNG, MP4 (max 10MB)
              </p>
              <Input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                multiple
                onChange={handleFileChange} 
              />
              <Button 
                type="button" 
                variant="outline" 
                className="mt-4" 
                size="sm"
                asChild
              >
                <label htmlFor="file-upload" className="cursor-pointer">
                  <PaperclipIcon className="h-4 w-4 mr-2" />
                  Choose files
                </label>
              </Button>
            </div>
          </div>
          
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files</Label>
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center justify-between bg-muted/30 rounded-md p-2 text-sm">
                    <span className="truncate max-w-[300px]">{file.name}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || description.trim() === ''}
            >
              {isSubmitting ? 'Submitting...' : (
                <>
                  <SendIcon className="h-4 w-4 mr-2" />
                  Submit
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskSubmission;
