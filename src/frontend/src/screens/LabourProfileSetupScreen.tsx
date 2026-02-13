import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useUpdateLabourProfile } from '@/hooks/useQueries';
import { toast } from 'sonner';
import { SKILL_OPTIONS } from '@/lib/skillOptions';
import { AREA_OPTIONS } from '@/lib/areaOptions';
import { Loader2 } from 'lucide-react';

interface LabourProfileSetupScreenProps {
  onNavigate: (screen: 'labourHome') => void;
}

export default function LabourProfileSetupScreen({ onNavigate }: LabourProfileSetupScreenProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [skill, setSkill] = useState('');
  const [area, setArea] = useState('');
  const [wage, setWage] = useState('');
  const [available, setAvailable] = useState(true);

  const updateMutation = useUpdateLabourProfile();

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

      toast.success('Profile created successfully');
      // Navigation will be handled by App.tsx routing logic
    } catch (error) {
      console.error('Profile setup error:', error);
      toast.error('Failed to create profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Setup Your Profile</CardTitle>
            <CardDescription className="text-center">
              Complete your labour profile to get started
            </CardDescription>
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

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="availability">Availability</Label>
                  <p className="text-sm text-muted-foreground">
                    {available ? 'Available for work' : 'Not available'}
                  </p>
                </div>
                <Switch
                  id="availability"
                  checked={available}
                  onCheckedChange={setAvailable}
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
                  'Save Profile'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
