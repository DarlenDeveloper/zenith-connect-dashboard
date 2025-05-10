import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const CompanyPhoneNumber = () => {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchPhoneNumber = async () => {
      try {
        const { data, error } = await supabase
          .from('company_phone_numbers')
          .select('phone_number')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') { // No rows returned
            setPhoneNumber(null);
          } else {
            console.error('Error fetching company phone number:', error);
          }
        } else {
          setPhoneNumber(data?.phone_number || null);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhoneNumber();

    // Subscribe to changes
    const subscription = supabase
      .channel('company_phone_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'company_phone_numbers',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setPhoneNumber(payload.new?.phone_number || null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  return (
    <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl shadow-lg overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-purple-100">Company Phone</p>
          {loading ? (
            <Skeleton className="h-6 w-28 mt-1 bg-purple-500" />
          ) : (
            <p className="text-lg font-bold mt-1 truncate">
              {phoneNumber || 'Not Assigned'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyPhoneNumber; 