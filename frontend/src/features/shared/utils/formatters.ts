import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { ar, enUS } from "date-fns/locale";

export type Lang = "ar" | "en";

const locales = {
  ar: ar,
  en: enUS,
};

export function formatDate(
  date: Date | string,
  formatStr: string = "MMM d, yyyy",
  lang: Lang = "en"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const locale = locales[lang];
  
  try {
    return format(dateObj, formatStr, { locale });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateObj.toLocaleDateString();
  }
}

export function formatRelativeTime(
  date: Date | string,
  lang: Lang = "en"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const locale = locales[lang];
  
  try {
    if (isToday(dateObj)) {
      return lang === "ar" ? "اليوم" : "Today";
    }
    
    if (isYesterday(dateObj)) {
      return lang === "ar" ? "أمس" : "Yesterday";
    }
    
    return formatDistanceToNow(dateObj, { 
      addSuffix: true, 
      locale 
    });
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return dateObj.toLocaleDateString();
  }
}

export function formatNumber(
  num: number,
  lang: Lang = "en",
  options?: Intl.NumberFormatOptions
): string {
  const locale = lang === "ar" ? "ar-EG" : "en-US";
  
  try {
    return new Intl.NumberFormat(locale, options).format(num);
  } catch (error) {
    console.error("Error formatting number:", error);
    return num.toString();
  }
}

export function formatCompact(num: number, lang: Lang = "en"): string {
  return formatNumber(num, lang, {
    notation: "compact",
    maximumFractionDigits: 1,
  });
}

export function formatPercentage(
  value: number,
  total: number,
  lang: Lang = "en"
): string {
  if (total === 0) return "0%";
  const percentage = (value / total) * 100;
  return formatNumber(percentage, lang, {
    style: "percent",
    maximumFractionDigits: 0,
  });
}

export function formatDuration(
  minutes: number,
  lang: Lang = "en"
): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (lang === "ar") {
    if (hours > 0) {
      return `${hours} ساعة${mins > 0 ? ` و ${mins} دقيقة` : ""}`;
    }
    return `${mins} دقيقة`;
  }
  
  if (hours > 0) {
    return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
  }
  return `${mins}m`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
}