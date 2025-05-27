import { 
  Info,
  XCircle,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export   const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return { 
          label: "Pendiente de aprobación", 
          color: "bg-yellow-100 text-yellow-800",
          icon: AlertTriangle
        };
      case 'APPROVED_PENDING_PAYMENT':
        return { 
          label: "Aprobada - Pendiente de pago", 
          color: "bg-blue-100 text-blue-800",
          icon: CheckCircle
        };
      case 'APPROVED':
        return { 
          label: "Aprobada", 
          color: "bg-green-100 text-green-800",
          icon: CheckCircle
        };
      case 'CONFIRMED':
        return { 
          label: "Confirmada", 
          color: "bg-green-100 text-green-800",
          icon: CheckCircle
        };
      case 'COMPLETED':
        return { 
          label: "Completada", 
          color: "bg-purple-100 text-purple-800",
          icon: CheckCircle
        };
      case 'CANCELLED_BY_DRIVER':
        return { 
          label: "Cancelada por conductor", 
          color: "bg-red-100 text-red-800",
          icon: XCircle
        };
      case 'CANCELLED_BY_PASSENGER':
        return { 
          label: "Cancelada por ti", 
          color: "bg-red-100 text-red-800",
          icon: XCircle
        };
      default:
        return { 
          label: status, 
          color: "bg-gray-100 text-gray-800",
          icon: Info
        };
    }
  };