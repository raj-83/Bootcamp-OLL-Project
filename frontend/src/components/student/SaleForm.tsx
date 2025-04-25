
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { IndianRupee, Plus, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SaleFormProps {
  onSaleAdded?: (saleData: any) => void;
  buttonText?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const SaleForm: React.FC<SaleFormProps> = ({ 
  onSaleAdded,
  buttonText = "Record Sale", 
  buttonVariant = "default",
  buttonSize = "default",
  className
}) => {
  const [open, setOpen] = useState(false);
  const [saleData, setSaleData] = useState({
    amount: '',
    customerName: '',
    customerSource: '',
    productName: '',
    productCategory: '',
    notes: '',
    proofFile: null as File | null,
    proofFileName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSaleData({ ...saleData, [name]: value });
  };

  const handleSelectChange = (value: string, name: string) => {
    setSaleData({ ...saleData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSaleData({ 
        ...saleData, 
        proofFile: file,
        proofFileName: file.name
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!saleData.amount || !saleData.customerName || !saleData.productName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Mock submission
    console.log("Sale submitted:", saleData);
    
    // Show success message
    toast({
      title: "Sale recorded",
      description: `You have successfully recorded a sale of $${saleData.amount}.`,
    });
    
    // Reset form and close dialog
    setSaleData({
      amount: '',
      customerName: '',
      customerSource: '',
      productName: '',
      productCategory: '',
      notes: '',
      proofFile: null,
      proofFileName: ''
    });
    setOpen(false);
    
    // Call the callback if provided
    if (onSaleAdded) {
      onSaleAdded(saleData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={className}>
          <IndianRupee size={16} />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record New Sale</DialogTitle>
          <DialogDescription>
            Enter the details of your sale. Accurate information helps with tracking your earnings.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="required">Sale Amount (₹)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-8"
                  value={saleData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="productCategory">Product Category</Label>
              <Select 
                value={saleData.productCategory} 
                onValueChange={(value) => handleSelectChange(value, 'productCategory')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Physical Product</SelectItem>
                  <SelectItem value="digital">Digital Product</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="productName" className="required">Product/Service Name</Label>
            <Input
              id="productName"
              name="productName"
              placeholder="Enter product or service name"
              value={saleData.productName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="required">Customer Name</Label>
              <Input
                id="customerName"
                name="customerName"
                placeholder="Enter customer name"
                value={saleData.customerName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerSource">Customer Source</Label>
              <Input
                id="customerSource"
                name="customerSource"
                placeholder="Where did they come from?"
                value={saleData.customerSource}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Add any additional notes about the sale"
              value={saleData.notes}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="proof">Upload Proof</Label>
            <div className="border-2 border-dashed rounded-lg p-4 hover:bg-muted/30 transition-colors">
              <label htmlFor="proof" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm font-medium">
                  {saleData.proofFileName || "Click to upload receipt or proof of purchase"}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  PDF, PNG, or JPG (max. 5MB)
                </span>
                <Input
                  id="proof"
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit">Record Sale</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SaleForm;
