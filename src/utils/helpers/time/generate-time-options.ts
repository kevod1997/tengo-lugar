interface TimeOption {
    value: string;
    label: string;
  }
  
  export function generateTimeOptions(): TimeOption[] {
    const options: TimeOption[] = [];
    
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const hourFormatted = hour.toString().padStart(2, '0');
        const minuteFormatted = minute.toString().padStart(2, '0');
        const timeValue = `${hourFormatted}:${minuteFormatted}`;
        const displayText = `${hourFormatted}:${minuteFormatted}`;
        options.push({ value: timeValue, label: displayText });
      }
    }
    
    return options;
  }

  