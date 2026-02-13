import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Labour, UserProfile, UserRole } from '../backend';

// Get caller's user profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

// Register user with role
export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (role: UserRole) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.registerUser(role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Get caller's labour profile
export function useGetMyLabourProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Labour | null>({
    queryKey: ['myLabourProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyLabourProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

interface UpdateLabourProfileParams {
  name: string;
  phone: string;
  skill: string;
  area: string;
  wage: bigint;
}

// Update labour profile
export function useUpdateLabourProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateLabourProfileParams) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.updateLabourProfile(
        params.name,
        params.phone,
        params.skill,
        params.area,
        params.wage
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLabourProfile'] });
    },
  });
}

// Set labour availability
export function useSetLabourAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isAvailable: boolean) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.setLabourAvailability(isAvailable);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLabourProfile'] });
    },
  });
}

// Get labours by skill and area
export function useGetLaboursBySkillAndArea(skill: string, area: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Labour[]>({
    queryKey: ['labours', skill, area],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLaboursBySkillAndArea(skill, area);
    },
    enabled: !!actor && !isFetching && !!skill && !!area,
  });
}
