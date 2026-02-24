export interface AlertType {
  id: string;
  title: string;
  description?: string;
  type: "success" | "warning" | "error" | "info";
  duration?: number;
}

export interface AlertStoreType {
  alerts: AlertType[];
  addAlert: (alert: AlertType) => void;
  removeAlert: (id: string) => void;
}

export interface CommentsStoreType {
  comment: number | null;
  onClose: () => void;
  onOpen: (id: number) => void;
  onHandle: (id?: number) => void
}
