export function formatDate(date: string | Date): string {
    const now = new Date();
    const inputDate = new Date(date);
    const diffInMilliseconds = now.getTime() - inputDate.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
  
    if (diffInMinutes < 60) {
      return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffInHours < 24) {
      return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    } else {
      return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
    }
  }

  export function formatDatetoLocaleDateString(date: Date | string | null) {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString()
  }

  export function formatDateLong(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
  