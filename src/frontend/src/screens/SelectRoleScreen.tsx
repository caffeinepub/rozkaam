import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRegisterUser } from '@/hooks/useQueries';
import { UserRole } from '../backend';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface SelectRoleScreenProps {
  onNavigate: (screen: 'labourProfileSetup' | 'customerHome') => void;
}

export default function SelectRoleScreen({ onNavigate }: SelectRoleScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const registerMutation = useRegisterUser();

  const handleRoleSelect = async (role: UserRole) => {
    setSelectedRole(role);
    try {
      await registerMutation.mutateAsync(role);
      toast.success('Role selected successfully');
      // Navigation will be handled by App.tsx routing logic
    } catch (error: any) {
      console.error('Role registration error:', error);
      toast.error('Failed to register role. Please try again.');
      setSelectedRole(null);
    }
  };

  const isProcessing = registerMutation.isPending;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">Select Your Role</CardTitle>
            <CardDescription className="text-base">
              Choose how you want to use RozKaam
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              size="lg"
              className="h-16 w-full text-xl font-semibold"
              onClick={() => handleRoleSelect(UserRole.labour)}
              disabled={isProcessing}
            >
              {isProcessing && selectedRole === UserRole.labour ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'I am Labour'
              )}
            </Button>
            
            <Button
              size="lg"
              className="h-16 w-full text-xl font-semibold"
              onClick={() => handleRoleSelect(UserRole.customer)}
              disabled={isProcessing}
            >
              {isProcessing && selectedRole === UserRole.customer ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'I am Customer'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
