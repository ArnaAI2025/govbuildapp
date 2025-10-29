import { InspectionModel, InspectionTeamMember, InspectionType } from '../interfaces/ISubScreens';
import { convertFrom24To12Format, convertTime24Hours, formatDate } from './helpers';

export const parseDate = (dateStr: string | undefined): Date | null => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

export const sortData = (
  data: InspectionModel[] | undefined,
  sortOrder: 'date_desc' | 'date_asc',
): InspectionModel[] => {
  if (!data || !Array.isArray(data)) return [];
  return [...data].sort((a, b) => {
    const dateA = parseDate(a.appointmentDate);
    const dateB = parseDate(b.appointmentDate);
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return sortOrder === 'date_desc'
      ? dateB.getTime() - dateA.getTime()
      : dateA.getTime() - dateB.getTime();
  });
};

export const getInspectionTypeIds = (selectedTypes: InspectionType[] | undefined): string => {
  return selectedTypes?.map((item) => item.id).join(',') ?? '';
};

export const getInspectionByIds = (
  selectedTeamMembers: InspectionTeamMember[] | undefined,
): string => {
  return selectedTeamMembers?.map((item) => item.id).join(',') ?? '';
};

export const getInspectionByName = (
  selectedTeamMembers: InspectionTeamMember[] | undefined,
): string => {
  return selectedTeamMembers?.map((item) => item.displayText).join(',') ?? '';
};

export const processTime = (date: string | undefined, platform: string): string | null => {
  if (!date) return null;
  return platform === 'ios' || date.includes('T')
    ? convertTime24Hours(date)
    : (date.split(' ').pop() ?? null);
};

export const mapPreferredTime = (preferredTime: string | undefined): string => {
  const preferredTimeMap: { [key: string]: string } = {
    AM: '2',
    PM: '3',
    Day: '4',
  };
  return preferredTime ? (preferredTimeMap[preferredTime] ?? '1') : '1';
};

export const formatTimeForDisplay = (time: string | undefined): string => {
  return time ? convertFrom24To12Format(time) : '';
};

export const combineDateTime = (date: string | undefined, time: string | undefined): string => {
  if (!date || !time) return '';
  return `${formatDate(date, 'YYYY-MM-DD')} ${time}`;
};
