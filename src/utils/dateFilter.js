/**
 * Lọc danh sách items theo date range dựa trên field createdAt.
 * @param {Array}  items
 * @param {"all"|"today"|"week"|"month"} range
 */
export const filterByDateRange = (items, range) => {
  if (!range || range === "all") return items;

  const now = new Date();
  const startOf = (unit) => {
    const d = new Date(now);
    if (unit === "today") { d.setHours(0, 0, 0, 0); return d; }
    if (unit === "week")  { d.setDate(d.getDate() - d.getDay()); d.setHours(0, 0, 0, 0); return d; }
    if (unit === "month") { d.setDate(1); d.setHours(0, 0, 0, 0); return d; }
    return d;
  };

  const from = startOf(range);
  return items.filter((item) => new Date(item.createdAt) >= from);
};
