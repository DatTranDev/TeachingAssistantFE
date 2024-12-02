export function formatNoWeekday(dateString: string | string[]) {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',  // Ngày
      month: '2-digit', // Tháng
      year: 'numeric',  // Năm
    };
    const date = new Date(String(dateString));
    return date.toLocaleDateString('vi-VN', options);
}
export function formatDate(dateString: string | string[]) {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long', // Thứ trong tuần
    day: '2-digit',  // Ngày
    month: '2-digit', // Tháng
    year: 'numeric',  // Năm
  };
  const date = new Date(String(dateString));
  // const vietnameseWeekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  // const weekday = vietnameseWeekdays[date.getDay()];
  // Chuyển đổi ngày tháng năm sang định dạng yêu cầu
  const formattedDate = `${date.toLocaleDateString('vi-VN', options)}`;
  return formattedDate;
}