import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, LogOut, Star } from 'lucide-react';
import { useGetLaboursBySkillAndArea } from '@/hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { SKILL_OPTIONS } from '@/lib/skillOptions';
import { AREA_OPTIONS } from '@/lib/areaOptions';
import { openWhatsAppChat } from '@/lib/whatsapp';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomerHomeScreenProps {
  onNavigate: (screen: 'selectRole') => void;
}

export default function CustomerHomeScreen({ onNavigate }: CustomerHomeScreenProps) {
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const { data: labours, isLoading } = useGetLaboursBySkillAndArea(selectedSkill, selectedArea);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const bothFiltersSelected = selectedSkill && selectedArea;

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Find Labour</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        <div className="mb-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skill-filter">Select Skill</Label>
            <Select value={selectedSkill} onValueChange={setSelectedSkill}>
              <SelectTrigger id="skill-filter" className="h-12">
                <SelectValue placeholder="Choose a skill" />
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
            <Label htmlFor="area-filter">Select Area</Label>
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger id="area-filter" className="h-12">
                <SelectValue placeholder="Choose an area" />
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
        </div>

        <div className="space-y-4">
          {!bothFiltersSelected ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-lg text-muted-foreground">
                  Please select both skill and area to view available labour
                </p>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="mb-2 h-6 w-3/4" />
                    <Skeleton className="mb-2 h-4 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : labours && labours.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-lg text-muted-foreground">
                  No labour available for the selected skill and area
                </p>
              </CardContent>
            </Card>
          ) : (
            labours?.map((labour) => {
              const skillLabel = SKILL_OPTIONS.find(opt => opt.value === labour.skill)?.label || labour.skill;
              const areaLabel = AREA_OPTIONS.find(opt => opt.value === labour.area)?.label || labour.area;

              return (
                <Card key={labour.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h3 className="text-xl font-semibold text-foreground">{labour.name}</h3>
                      <p className="text-sm text-muted-foreground">{skillLabel}</p>
                    </div>
                    
                    <div className="mb-4 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Area:</span> {areaLabel}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Daily Wage:</span> ₹{labour.wage.toString()}
                      </p>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="font-medium">Rating:</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-muted-foreground">{labour.rating.toString()}</span>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="h-12 w-full font-semibold"
                      onClick={() => openWhatsAppChat(labour.phone)}
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Chat on WhatsApp
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
