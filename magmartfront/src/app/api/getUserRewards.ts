// services/userRewardsService.ts
import Cookies from 'js-cookie';

export interface Reward {
    id: string;
    tierId: string;
    name: string;
    description: string | null;
    experienceRequired: number;
    type: string;
    prize: { pokemon_id: string } | any; // O tipo do prêmio pode ser mais específico
    prizeType: string;
    can_claim: boolean;    // Booleano para verificar se a recompensa pode ser reivindicada
    claimed_at: boolean;   // Booleano para verificar se a recompensa foi reivindicada
    userId: string;
    tier: {
      id: number;
      previousTierId: string | null;
      name: string;
      minimalExperience: number;
      limitExperience: number;
    };
  }
  

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getUserRewards(): Promise<ApiResponse<Reward[]>> {
  try {
    const token = Cookies.get('authToken'); // Obtém o token de autenticação dos cookies
    const response = await fetch(`${process.env.API_URL}/rewards/road`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`, // Adiciona o token de autenticação ao header
      },
    });

    if (response.ok) {
      const data: Reward[] = await response.json();
      return { success: true, data }; // Retorna as recompensas se a requisição for bem-sucedida
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Erro ao buscar recompensas' };
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro de rede' }; // Em caso de erro de rede
  }
}