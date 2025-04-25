
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, BarChart3, Calendar, Plus } from 'lucide-react';
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

// Mock sales data for 30 days
const generateMockSalesData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // More sales on weekends and random spikes
    let amount = 0;
    
    if (date.getDay() === 0 || date.getDay() === 6) {
      // Weekends have higher sales
      amount = Math.floor(Math.random() * 40) + 20;
    } else {
      // Weekdays
      amount = Math.floor(Math.random() * 25) + 5;
    }
    
    // Add some spikes
    if (Math.random() > 0.85) {
      amount += Math.floor(Math.random() * 50) + 20;
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      amount
    });
  }
  
  return data;
};

const generateMonthlySalesData = () => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  return months.map(month => ({
    date: month,
    amount: Math.floor(Math.random() * 300) + 100
  }));
};

// Mock data
const mockDailySales = generateMockSalesData();
const mockMonthlySales = generateMonthlySalesData();

const mockProducts = [
  { id: 1, name: 'Eco-friendly Notebook', price: 25 },
  { id: 2, name: 'Bamboo Pen Set', price: 18 },
  { id: 3, name: 'Recycled Paper Journal', price: 22 },
  { id: 4, name: 'Sustainable Pencil Case', price: 15 },
  { id: 5, name: 'Recycled Canvas Bag', price: 30 },
  { id: 6, name: 'Eco-friendly Water Bottle', price: 20 },
];

const salesTransactions = [
  { id: 1, customer: 'John Smith', product: 'Eco-friendly Notebook', amount: 25, date: '2023-10-15' },
  { id: 2, customer: 'Emily Johnson', product: 'Bamboo Pen Set', amount: 18, date: '2023-10-14' },
  { id: 3, customer: 'Michael Lee', product: 'Recycled Paper Journal', amount: 22, date: '2023-10-12' },
  { id: 4, customer: 'Sophia Garcia', product: 'Eco-friendly Notebook', amount: 25, date: '2023-10-10' },
  { id: 5, customer: 'David Wilson', product: 'Sustainable Pencil Case', amount: 15, date: '2023-10-08' },
  { id: 6, customer: 'Emma Rodriguez', product: 'Bamboo Pen Set', amount: 18, date: '2023-10-05' },
  { id: 7, customer: 'James Brown', product: 'Recycled Paper Journal', amount: 22, date: '2023-10-03' },
  { id: 8, customer: 'Olivia Martinez', product: 'Sustainable Pencil Case', amount: 15, date: '2023-10-01' },
];

const Sales = () => {
  const [period, setPeriod] = useState('daily');
  const [transactions, setTransactions] = useState(salesTransactions);
  const totalEarnings = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const { toast } = useToast();
  
  // Form state for new sale
  const [newSale, setNewSale] = useState({
    customer: '',
    product: '',
    customProduct: '',
    amount: '',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSale(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setNewSale(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSale = () => {
    if (!newSale.customer || (!newSale.product && !newSale.customProduct) || !newSale.amount) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const product = newSale.product === 'custom' ? newSale.customProduct : newSale.product;
    const amount = parseFloat(newSale.amount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    const newTransaction = {
      id: Math.max(...transactions.map(t => t.id), 0) + 1,
      customer: newSale.customer,
      product,
      amount,
      date: new Date().toISOString().split('T')[0]
    };

    setTransactions([newTransaction, ...transactions]);
    setNewSale({
      customer: '',
      product: '',
      customProduct: '',
      amount: '',
      notes: ''
    });

    toast({
      title: "Sale recorded",
      description: `$${amount} sale to ${newSale.customer} has been recorded`
    });
  };
  
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
                    value={newSale.customer}
                    onChange={handleInputChange}
                    placeholder="e.g. John Smith"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="product">Product</Label>
                  <Select 
                    value={newSale.product}
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
                
                {newSale.product === 'custom' && (
                  <div className="grid gap-2">
                    <Label htmlFor="customProduct">Custom Product Name</Label>
                    <Input
                      id="customProduct"
                      name="customProduct"
                      value={newSale.customProduct}
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
                    value={newSale.amount}
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
                    value={newSale.notes}
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
              <DollarSign className="h-5 w-5 text-success" />
              <div className="text-2xl font-bold">${totalEarnings}</div>
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
              <div className="text-2xl font-bold">{transactions.length}</div>
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
              <div className="text-2xl font-bold">
                ${(totalEarnings / transactions.length).toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Sales Chart */}
      <SalesChart 
        data={period === 'daily' ? mockDailySales : mockMonthlySales} 
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
              {/* Same content as above dialog */}
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
                    value={newSale.customer}
                    onChange={handleInputChange}
                    placeholder="e.g. John Smith"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="product-alt">Product</Label>
                  <Select 
                    value={newSale.product}
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
                          {product.name} (${product.price})
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Product</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {newSale.product === 'custom' && (
                  <div className="grid gap-2">
                    <Label htmlFor="customProduct-alt">Custom Product Name</Label>
                    <Input
                      id="customProduct-alt"
                      name="customProduct"
                      value={newSale.customProduct}
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
                    value={newSale.amount}
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
                    value={newSale.notes}
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
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.customer}</TableCell>
                  <TableCell>{transaction.product}</TableCell>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="text-right font-medium">${transaction.amount}</TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No transactions recorded yet.</TableCell>
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
          {/* Same content as above dialog */}
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
                value={newSale.customer}
                onChange={handleInputChange}
                placeholder="e.g. John Smith"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="product-fixed">Product</Label>
              <Select 
                value={newSale.product}
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
                      {product.name} (${product.price})
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Product</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newSale.product === 'custom' && (
              <div className="grid gap-2">
                <Label htmlFor="customProduct-fixed">Custom Product Name</Label>
                <Input
                  id="customProduct-fixed"
                  name="customProduct"
                  value={newSale.customProduct}
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
                value={newSale.amount}
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
                value={newSale.notes}
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
