  // Helper to determine badge color based on trip status
  export const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'ACTIVE':
        return "bg-green-100 text-green-800 border-green-200";
      case 'COMPLETED':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'CANCELLED':
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Helper to get human-readable status
export const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return "Pendiente";
        case 'PENDING_APPROVAL':
        return "Pendiente de Aprobación";
        case 'APPROVED':
        return "Aprobada";
      case 'ACTIVE':
        return "Activo";
      case 'COMPLETED':
        return "Completada";
      case 'CANCELLED':
        return "Cancelada";
      default:
        return status;
    }
  };