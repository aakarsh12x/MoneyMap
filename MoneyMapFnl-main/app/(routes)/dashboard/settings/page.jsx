"use client";
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/utils/dbConfig';
import { UserSettings, Currencies } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { CurrencySelector } from '@/components/ui/currency-selector';
import { Button } from '@/components/ui/button';
import { Loader, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [baseCurrency, setBaseCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    if (isLoaded && user) {
      loadUserSettings();
    }
  }, [isLoaded, user]);
  
  async function loadUserSettings() {
    try {
      setLoading(true);
      
      // Try to find existing user settings
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      const existingSettings = await db.select()
        .from(UserSettings)
        .where(eq(UserSettings.userId, userEmail));
      
      if (existingSettings && existingSettings.length > 0) {
        setBaseCurrency(existingSettings[0].baseCurrency);
      } else {
        // Create default settings for the user
        await db.insert(UserSettings)
          .values({
            userId: userEmail,
            baseCurrency: 'INR',
            theme: 'light'
          });
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }
  
  async function saveSettings() {
    try {
      setSaving(true);
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      
      await db.update(UserSettings)
        .set({ baseCurrency })
        .where(eq(UserSettings.userId, userEmail));
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }
  
  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader size={30} className="animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Settings</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Currency Preferences</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Currency
            </label>
            <p className="text-sm text-gray-500 mb-3">
              All your financial data will be converted to this currency for reports and analytics.
            </p>
            <div className="max-w-xs">
              <CurrencySelector 
                value={baseCurrency} 
                onChange={setBaseCurrency} 
                placeholder="Select base currency"
              />
            </div>
          </div>
          
          <Button 
            onClick={saveSettings} 
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
            Save Settings
          </Button>
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">About Currency Conversion</h2>
        <p className="text-gray-600">
          Currency conversions are based on exchange rates stored in the system. These rates are 
          approximations and may not reflect real-time market rates. For precise financial 
          calculations, please verify with official exchange rate sources.
        </p>
      </div>
    </div>
  );
} 