import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useGetMyLabourProfile, useSetLabourAvailability } from '@/hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Edit, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { SKILL_OPTIONS } from '@/lib/skillOptions';
import { AREA_OPTIONS } from '@/lib/areaOptions';

interface LabourHomeScreenProps {
  onNavigate: (screen: 'labourEditProfile') => void;
}

export default function LabourHomeScreen({ onNavigate }: LabourHomeScreenProps) {
  const { data: profile, isLoading } = useGetMyLabourProfile();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const availabilityMutation = useSetLabourAvailability();

  const handleAvailabilityChange = async (checked: boolean) => {
    try {
      await availabilityMutation.mutateAsync(checked);
      toast.success(checked ? 'You are now available' : 'You are now unavailable');
    } catch (error) {
      console.error('Availability update error:', error);
      toast.error('Failed to update availability');
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-4 py-6">
        <div className="mx-auto max-w-md space-y-4">
          <Skeleton className="h-12 w-full" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-lg text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const skillLabel = SKILL_OPTIONS.find(opt => opt.value === profile.skill)?.label || profile.skill;
  const areaLabel = AREA_OPTIONS.find(opt => opt.value === profile.area)?.label || profile.area;

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">My Profile</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{profile.name}</CardTitle>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{profile.rating.toString()} Rating</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Skill:</span>
                <span className="text-muted-foreground">{skillLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Area:</span>
                <span className="text-muted-foreground">{areaLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Daily Wage:</span>
                <span className="text-muted-foreground">₹{profile.wage.toString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Phone:</span>
                <span className="text-muted-foreground">{profile.phone}</span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="availability-switch">Availability</Label>
                <p className="text-sm text-muted-foreground">
                  {profile.available ? 'Available for work' : 'Not available'}
                </p>
              </div>
              <Switch
                id="availability-switch"
                checked={profile.available}
                onCheckedChange={handleAvailabilityChange}
                disabled={availabilityMutation.isPending}
              />
            </div>

            <Button
              size="lg"
              className="h-12 w-full font-semibold"
              onClick={() => onNavigate('labourEditProfile')}
            >
              <Edit className="mr-2 h-5 w-5" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
