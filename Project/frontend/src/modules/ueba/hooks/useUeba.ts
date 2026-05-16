import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';

export function useUebaData() {
  const fetchRiskScores = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/v1/ueba/risk-scores`);
    return res.data;
  };

  const fetchAnomalies = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/v1/ueba/anomalies`);
    return res.data;
  };

  const fetchBaselines = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/v1/ueba/baselines`);
    return res.data;
  };

  const { data: riskData, isLoading: loadingRisk } = useQuery({
    queryKey: ['ueba-risk-scores'],
    queryFn: fetchRiskScores,
    refetchInterval: 15000
  });

  const { data: anomaliesData, isLoading: loadingAnomalies } = useQuery({
    queryKey: ['ueba-anomalies'],
    queryFn: fetchAnomalies,
    refetchInterval: 15000
  });

  const { data: baselinesData, isLoading: loadingBaselines } = useQuery({
    queryKey: ['ueba-baselines'],
    queryFn: fetchBaselines,
    refetchInterval: 60000
  });

  return {
    riskScores: riskData?.items || [],
    anomalies: anomaliesData?.items || [],
    baselines: baselinesData?.items || [],
    isLoading: loadingRisk || loadingAnomalies || loadingBaselines
  };
}
