import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetMyLabourProfile, useUpdateLabourProfile } from '@/hooks/useQueries';
import { toast } from 'sonner';
import { SKILL_OPTIONS } from '@/lib/skillOptions';
import { AREA_OPTIONS } from '@/lib/areaOptions';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LabourEditProfileScreenProps {
  onNavigate: (screen: 'labourHome') => void;
}

export default function LabourEditProfileScreen({ onNavigate }: LabourEditProfileScreenProps) {
  const { data: profile, isLoading } = useGetMyLabourProfile();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [skill, setSkill] = useState('');
  const [area, setArea] = useState('');
  const [wage, setWage] = useState('');

  const updateMutation = useUpdateLabourProfile();

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone);
      setSkill(profile.skill);
      setArea(profile.area);
      setWage(profile.wage.toString());
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }
    if (!skill) {
      toast.error('Please select a skill');
      return;
    }
    if (!area) {
      toast.error('Please select an area');
      return;
    }
    if (!wage.trim() || isNaN(Number(wage)) || Number(wage) <= 0) {
      toast.error('Please enter a valid daily wage');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        skill,
        area,
        wage: BigInt(Math.floor(Number(wage)))
      });

      toast.success('Profile updated successfully');
      onNavigate('labourHome');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-4 py-6">
        <div className="mx-auto max-w-md">
          <Skeleton className="mb-4 h-10 w-32" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-md">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('labourHome')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill">Skill</Label>
                <Select value={skill} onValueChange={setSkill}>
                  <SelectTrigger id="skill" className="h-12">
                    <SelectValue placeholder="Select your skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger id="area" className="h-12">
                    <SelectValue placeholder="Select your area" />
                  </SelectTrigger>
                  <SelectContent>
                    {AREA_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wage">Daily Wage (₹)</Label>
                <Input
                  id="wage"
                  type="number"
                  value={wage}
                  onChange={(e) => setWage(e.target.value)}
                  placeholder="Enter daily wage"
                  className="h-12"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-14 w-full text-lg font-semibold"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
