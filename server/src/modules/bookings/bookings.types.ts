export type BookingDto = {
  id: string;
  start: string;
  end: string;
  status: string;
  owner: { localUserId?: string | null; supersaasUserKey?: string | null };
};
