// Type definitions for the Traffic Warden Duty Management System

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  children: Child[];
  duties: Duty[];
  createdAt: string;
  updatedAt: string;
}

export interface Child {
  id: string;
  name: string;
  grade: string;
  parentId: string;
  parent: Parent;
  createdAt: string;
  updatedAt: string;
}

export interface Crossing {
  id: string;
  name: string;
  location: string;
  description?: string;
  duties: Duty[];
  createdAt: string;
  updatedAt: string;
}

export interface Week {
  id: string;
  year: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  duties: Duty[];
  createdAt: string;
  updatedAt: string;
}

export interface Duty {
  id: string;
  crossingId: string;
  crossing: Crossing;
  parentId?: string;
  parent?: Parent;
  weekId: string;
  week: Week;
  dayOfWeek: number; // 1 = Monday, 2 = Tuesday, ..., 5 = Friday
  timeSlot: string; // "morning" or "afternoon"
  status: string; // "assigned", "swapped", "vacant"
  createdAt: string;
  updatedAt: string;
}

export interface DutySwap {
  id: string;
  fromDutyId: string;
  toDutyId: string;
  fromParentId: string;
  toParentId: string;
  status: string; // "pending", "approved", "rejected"
  requestedAt: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateParentData {
  name: string;
  email: string;
  phone?: string;
}

export interface CreateChildData {
  name: string;
  grade: string;
  parentId: string;
}

export interface CreateCrossingData {
  name: string;
  location: string;
  description?: string;
}

export interface CreateWeekData {
  year: number;
  weekNumber: number;
  startDate: string;
}

export interface CreateDutyData {
  crossingId: string;
  parentId?: string;
  weekId: string;
  dayOfWeek: number;
  timeSlot: string;
}

export interface GenerateDutiesData {
  weekId: string;
  crossingIds: string[];
}