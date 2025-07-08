"use client"
import React, { useState } from 'react';
import { Edit, Trash2, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';


function InvestmentPortfolio({ portfolio, onPortfolioUpdate }) {
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (percentage) => {
    if (percentage === null || percentage === undefined) return '0.00%';
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this investment?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/investments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Investment deleted successfully');
        onPortfolioUpdate();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete investment');
      }
    } catch (error) {
      console.error('Error deleting investment:', error);
      toast.error('Failed to delete investment');
    } finally {
      setLoading(false);
    }
  };

  const getInvestmentIcon = (type) => {
    switch (type) {
      case 'stock':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'mutual_fund':
        return <TrendingDown className="w-5 h-5 text-green-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'stock':
        return 'Stock';
      case 'mutual_fund':
        return 'Mutual Fund';
      case 'etf':
        return 'ETF';
      default:
        return type;
    }
  };

  if (!portfolio || portfolio.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No investments yet</h3>
        <p className="text-gray-500 mb-4">Start building your investment portfolio to track your wealth growth</p>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Add Investment
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {portfolio.map((investment) => (
        <div
          key={investment.id}
          className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-lg">
                {investment.symbol || investment.code}
              </h4>
              <p className="text-sm text-gray-600">{investment.name}</p>
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                investment.type === 'stock' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {investment.type === 'stock' ? 'Stock' : 'Mutual Fund'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(investment.id)}
                disabled={loading}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Quantity/Units</p>
              <p className="font-semibold">{investment.quantity || investment.units}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Avg Price</p>
              <p className="font-semibold">{formatCurrency(investment.avgPrice)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Current Price</p>
              <p className="font-semibold">{formatCurrency(investment.currentPrice)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Total Invested</p>
              <p className="font-semibold">{formatCurrency(investment.totalInvested)}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Current Value</p>
                <p className="font-semibold text-lg">{formatCurrency(investment.currentValue)}</p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  {investment.profitLoss >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`font-semibold ${
                    investment.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(investment.profitLoss)}
                  </span>
                </div>
                <p className={`text-sm ${
                  investment.profitLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(investment.profitLossPercentage)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Edit Investment Dialog */}
      {selectedInvestment && (
        <EditInvestment
          investment={selectedInvestment}
          onClose={() => setSelectedInvestment(null)}
          onUpdate={onPortfolioUpdate}
        />
      )}
    </div>
  );
}

// Investment Details Component
function InvestmentDetails({ investment }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchInvestmentDetails();
  }, [investment.id]);

  const fetchInvestmentDetails = async () => {
    try {
      const response = await fetch(`/api/investments/${investment.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setDetails(data);
      }
    } catch (error) {
      console.error('Error fetching investment details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!details) {
    return <div>Failed to load investment details</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-sm text-gray-500">Symbol</h4>
          <p>{details.holding.symbol}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-500">Type</h4>
          <p className="capitalize">{details.holding.type}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-500">Quantity</h4>
          <p>{details.holding.quantity}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-500">Average Price</h4>
          <p>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(details.holding.averagePrice)}</p>
        </div>
      </div>

      {details.transactions && details.transactions.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Transaction History</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {details.transactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    transaction.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.type.toUpperCase()}
                  </span>
                  <span className="ml-2 text-sm">{transaction.quantity} units</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(transaction.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.transactionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Edit Investment Component
function EditInvestment({ investment, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    quantity: '',
    price: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.quantity || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/investments/${investment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: parseFloat(formData.quantity),
          price: parseFloat(formData.price),
          notes: formData.notes,
          transactionDate: new Date().toISOString()
        }),
      });

      if (response.ok) {
        toast.success('Investment updated successfully');
        onUpdate();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update investment');
      }
    } catch (error) {
      console.error('Error updating investment:', error);
      toast.error('Failed to update investment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Investment - {investment.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="Enter quantity"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="Enter price"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2 border rounded-md"
              rows="3"
              placeholder="Add transaction notes"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Investment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default InvestmentPortfolio; 