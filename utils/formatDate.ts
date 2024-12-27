export function formatNoWeekday(dateString: string | string[]) {
    const date = new Date(String(dateString));
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
export function formatDate(dateString: string | string[]) {
   const date = new Date(String(dateString));
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = date.getFullYear();
  const vietnameseWeekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const weekday = vietnameseWeekdays[date.getDay()];
  // Chuyển đổi ngày tháng năm sang định dạng yêu cầu
  const formattedDate = `${weekday}, ${day}/${month}/${year}`;
  return formattedDate;
}