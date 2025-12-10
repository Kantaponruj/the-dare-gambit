import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTournamentRemote,
  listTournaments,
  type TournamentDTO,
} from "../auth/apiClient";

export function useTournamentsQuery() {
  return useQuery<TournamentDTO[]>({
    queryKey: ["tournaments"],
    queryFn: listTournaments,
  });
}

export function useCreateTournamentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["createTournament"],
    mutationFn: async (name: string) => {
      const t = await createTournamentRemote(name);
      // Persist tournament id for navigation/ownership
      localStorage.setItem("tournament.id", t.id);
      return t;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
}
