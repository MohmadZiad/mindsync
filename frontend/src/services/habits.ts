import { api } from "./api"; // مثلا انا بدي ارن على العملاء؟ بمسك الدفتر وبرن عليهم نفس الاشي  بدي اوصلللهم !  عن طريق ال اي بي اي !  الي بقدر يبعت طلبات
//
export type Habit = {
  id: string;
  name: string;
  frequenct: "dailay | weekly";
  description?: string;
};

//this is the employee of habits!
export const habitsService = () => {
    return {
      list: () => api.get<Habit[]>('/habits'),
      create: (d: Omit<Habit, 'id'>) => api.post<Habit>('/habits', d),
      update: (id: string, d: Partial<Habit>) => api.put<Habit>(`/habits/${id}`, d),
      remove: (id: string) => api.delete<{ success: true }>(`/habits/${id}`),
    };
  };
  