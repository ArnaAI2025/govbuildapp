import NetInfo from '@react-native-community/netinfo';
import { URL } from './../../constants/url';
import { GET_DATA } from './../../services/ApiClient';
import { getBaseUrl } from './../../session/SessionManager';
import { ScheduleModel } from './../../utils/interfaces/ISubScreens';
import { COLORS } from '../../theme/colors';
import { ToastService } from '../../components/common/GlobalSnackbar';
import { recordCrashlyticsError } from '../../services/CrashlyticsService';
export const ScheduleService = {
  async fetchSchedules(
    startDate: string,
    endDate: string,
    setLoading: (loading: boolean) => void,
  ): Promise<ScheduleModel[]> {
    try {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        ToastService.show('No internet connection', COLORS.ERROR);
        return [];
      }
      setLoading(true);
      const url = getBaseUrl();
      const response = await GET_DATA({
        url: `${url}${URL.GET_ALL_SCHEDULE_LIST}?startDate=${startDate}&endDate=${endDate}`,
      });
      setLoading(false);
      return response?.status ? response?.data?.data || [] : [];
    } catch (error) {
      setLoading(false);
      recordCrashlyticsError('Error fetching schedules', error);
      ToastService.show('Error fetching schedules', COLORS.ERROR);
      console.error('Error in fetchSchedules:', error);
      return [];
    }
  },
};
