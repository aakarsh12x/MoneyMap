"use client"
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

function AddInvestment({ onInvestmentAdded }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'stock',
    symbol: '',
    name: '',
    quantity: '',
    avgPrice: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real implementation, you would save to database
      // For now, just close the dialog
      console.log('Adding investment:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setFormData({
        type: 'stock',
        symbol: '',
        name: '',
        quantity: '',
        avgPrice: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      setIsOpen(false);
      if (onInvestmentAdded) {
        onInvestmentAdded();
      }
    } catch (error) {
      console.error('Error adding investment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Investment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Investment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="stock">Stock</option>
              <option value="mutual_fund">Mutual Fund</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.type === 'stock' ? 'Stock Symbol' : 'Fund Code'}
            </label>
            <Input
              name="symbol"
              value={formData.symbol}
              onChange={handleInputChange}
              placeholder={formData.type === 'stock' ? 'e.g., RELIANCE' : 'e.g., 120010'}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Investment name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.type === 'stock' ? 'Quantity' : 'Units'}
            </label>
            <Input
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Average Price
            </label>
            <Input
              name="avgPrice"
              type="number"
              value={formData.avgPrice}
              onChange={handleInputChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Date
            </label>
            <Input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Investment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddInvestment; 