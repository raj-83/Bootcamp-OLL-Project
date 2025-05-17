import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IndianRupee, TrendingUp, BarChart3, Calendar, Plus } from 'lucide-react';
import SalesChart from '@/components/student/SalesChart';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface Sale {
  _id: string;
  student: string;
  product: string;
  customer: string;
  amount: number;
  date: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  product: string;
  amount: string;
  customer: string;
  notes: string;
  customProduct: string;
}

const apiUrl = import.meta.env.VITE_REACT_API_URL || "https://localhost:5000";
// Mock products for the add sale form
const mockProducts = [
  { id: 1, name: 'Eco-friendly Notebook', price: 25 },
  { id: 2, name: 'Bamboo Pen Set', price: 18 },
  { id: 3, name: 'Recycled Paper Journal', price: 22 },
  { id: 4, name: 'Sustainable Pencil Case', price: 15 },
  { id: 5, name: 'Recycled Canvas Bag', price: 30 },
  { id: 6, name: 'Eco-friendly Water Bottle', price: 20 },
];

const Sales = () => {
  const [period, setPeriod] = useState('daily');
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const { toast } = useToast();
  
  // Form state for new sale
  const [formData, setFormData] = useState<FormData>({
    product: '',
    amount: '',
    customer: '',
    notes: '',
    customProduct: ''
  });

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${apiUrl}/api/sales/my-sales`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSales(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching sales:', err);
        setError(err.response?.data?.error || 'Failed to fetch sales data');
        toast({
          title: "Error",
          description: "Failed to fetch sales data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSale = async () => {
    try {
      if (!formData.customer || !formData.product || !formData.amount) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      const product = formData.product === 'custom' ? formData.customProduct : formData.product;
      const amount = parseFloat(formData.amount);
      
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid amount",
          variant: "destructive"
        });
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(`${apiUrl}/api/sales`, {
        product,
        amount,
        customer: formData.customer,
        notes: formData.notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSales(prevSales => [response.data, ...prevSales]);
      setFormData({
        product: '',
        amount: '',
        customer: '',
        notes: '',
        customProduct: ''
      });

      toast({
        title: "Sale recorded",
        description: `$${amount} sale to ${formData.customer} has been recorded`
      });
    } catch (err) {
      console.error('Error adding sale:', err);
      toast({
        title: "Error",
        description: "Failed to record sale",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div>Loading sales data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const totalEarnings = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const averageSale = sales.length > 0 ? totalEarnings / sales.length : 0;

  // Process sales data for charts
  const processSalesData = () => {
    // Group sales by date for the last 30 days
    const dailySales = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Find sales for this date
      const daySales = sales.filter(sale => {
        const saleDate = new Date(sale.date).toISOString().split('T')[0];
        return saleDate === dateStr;
      });
      
      // Calculate total amount for this day
      const amount = daySales.reduce((total, sale) => total + sale.amount, 0);
      
      dailySales.push({
        date: dateStr,
        amount
      });
    }
    
    // Group sales by month
    const monthlySales = [];
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // For each month, calculate total sales
    for (let i = 0; i < 12; i++) {
      const monthSales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getMonth() === i && saleDate.getFullYear() === currentYear;
      });
      
      const amount = monthSales.reduce((total, sale) => total + sale.amount, 0);
      
      monthlySales.push({
        date: months[i],
        amount
      });
    }
    
    return {
      dailySales,
      monthlySales
    };
  };

  const { dailySales, monthlySales } = processSalesData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sales</h1>
        <div className="flex items-center gap-3">
          <Select defaultValue="daily" onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <Plus size={16} />
                Record Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Record New Sale</DialogTitle>
                <DialogDescription>
                  Enter the details of your new sale to track your earnings
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer">Customer Name</Label>
                  <Input
                    id="customer"
                    name="customer"
                    value={formData.customer}
                    onChange={handleInputChange}
                    placeholder="e.g. John Smith"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="product">Product</Label>
                  <Select 
                    value={formData.product}
                    onValueChange={handleSelectChange('product')}
                  >
                    <SelectTrigger id="product">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProducts.map(product => (
                        <SelectItem 
                          key={product.id} 
                          value={product.name}
                        >
                          {product.name} (${product.price})
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Product</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.product === 'custom' && (
                  <div className="grid gap-2">
                    <Label htmlFor="customProduct">Custom Product Name</Label>
                    <Input
                      id="customProduct"
                      name="customProduct"
                      value={formData.customProduct}
                      onChange={handleInputChange}
                      placeholder="e.g. Handmade Craft"
                    />
                  </div>
                )}
                
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Additional details about the sale..."
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddSale}>Record Sale</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-success" />
              <div className="text-2xl font-bold">₹{totalEarnings}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div className="text-2xl font-bold">{sales.length}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              <div className="text-2xl font-bold">₹{averageSale.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Sales Chart */}
      <SalesChart 
        data={period === 'daily' ? dailySales : monthlySales} 
        title={`${period === 'daily' ? 'Daily' : 'Monthly'} Sales History`}
        description={`Your ${period} sales performance over time`}
      />
      
      {/* Transactions */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest sales</CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-2 sm:mt-0 gap-1">
                <Plus size={14} />
                Add Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Record New Sale</DialogTitle>
                <DialogDescription>
                  Enter the details of your new sale to track your earnings
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer-alt">Customer Name</Label>
                  <Input
                    id="customer-alt"
                    name="customer"
                    value={formData.customer}
                    onChange={handleInputChange}
                    placeholder="e.g. John Smith"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="product-alt">Product</Label>
                  <Select 
                    value={formData.product}
                    onValueChange={handleSelectChange('product')}
                  >
                    <SelectTrigger id="product-alt">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProducts.map(product => (
                        <SelectItem 
                          key={product.id} 
                          value={product.name}
                        >
                          {product.name} (₹{product.price})
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Product</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.product === 'custom' && (
                  <div className="grid gap-2">
                    <Label htmlFor="customProduct-alt">Custom Product Name</Label>
                    <Input
                      id="customProduct-alt"
                      name="customProduct"
                      value={formData.customProduct}
                      onChange={handleInputChange}
                      placeholder="e.g. Handmade Craft"
                    />
                  </div>
                )}
                
                <div className="grid gap-2">
                  <Label htmlFor="amount-alt">Amount ($)</Label>
                  <Input
                    id="amount-alt"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="notes-alt">Notes (Optional)</Label>
                  <Textarea
                    id="notes-alt"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Additional details about the sale..."
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddSale}>Record Sale</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale._id}>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell>{sale.product}</TableCell>
                  <TableCell>
                    {new Date(sale.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="text-right font-medium">₹{sale.amount}</TableCell>
                </TableRow>
              ))}
              {sales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No sales recorded yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex justify-center mt-4">
            <Button variant="outline">View All Transactions</Button>
          </div>
        </CardContent>
      </Card>

      {/* Fixed Add Sale Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            size="icon" 
            className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg"
          >
            <Plus size={24} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Record New Sale</DialogTitle>
            <DialogDescription>
              Enter the details of your new sale to track your earnings
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="customer-fixed">Customer Name</Label>
              <Input
                id="customer-fixed"
                name="customer"
                value={formData.customer}
                onChange={handleInputChange}
                placeholder="e.g. John Smith"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="product-fixed">Product</Label>
              <Select 
                value={formData.product}
                onValueChange={handleSelectChange('product')}
              >
                <SelectTrigger id="product-fixed">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {mockProducts.map(product => (
                    <SelectItem 
                      key={product.id} 
                      value={product.name}
                    >
                      {product.name} (₹{product.price})
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Product</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.product === 'custom' && (
              <div className="grid gap-2">
                <Label htmlFor="customProduct-fixed">Custom Product Name</Label>
                <Input
                  id="customProduct-fixed"
                  name="customProduct"
                  value={formData.customProduct}
                  onChange={handleInputChange}
                  placeholder="e.g. Handmade Craft"
                />
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="amount-fixed">Amount ($)</Label>
              <Input
                id="amount-fixed"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0.01"
                step="0.01"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes-fixed">Notes (Optional)</Label>
              <Textarea
                id="notes-fixed"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional details about the sale..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddSale}>Record Sale</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sales;