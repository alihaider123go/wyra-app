import moment from "moment";


export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(num % 1_000_000_000 === 0 ? 0 : 1) + "B";
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1) + "M";
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1) + "K";
  } else {
    return num.toString();
  }
}



// Format date as: Jan 15, 2024
export function formatDate(dateString: string): string {
  return moment(dateString).format("MMM D, YYYY");
}

export function formatDateTime(dateString: string): string {
  return moment(dateString).format("MMM D, YYYY h:mm A");
}



// Compact relative time: 3d ago, 5h ago, 10m ago, just now
export function relativeTime(dateString: string): string {
  const now = moment();
  const date = moment(dateString);
  const diffSeconds = now.diff(date, "seconds");

  if (diffSeconds < 5) return "just now";

  const diffMinutes = now.diff(date, "minutes");
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = now.diff(date, "hours");
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = now.diff(date, "days");
  if (diffDays < 7) return `${diffDays}d ago`;

  // fallback to normal formatted date
  return formatDate(dateString);
}