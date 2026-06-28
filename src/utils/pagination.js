export const paginateItems = (items, page, pageSize) => {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
};

export const getTotalPages = (totalItems, pageSize) =>
  Math.max(1, Math.ceil(totalItems / pageSize));

export const filterBySearch = (items, search, fields) => {
  if (!search.trim()) return items;
  const keyword = search.toLowerCase().trim();
  return items.filter((item) =>
    fields.some((field) => {
      const value = field.split(".").reduce((obj, key) => obj?.[key], item);
      return String(value ?? "")
        .toLowerCase()
        .includes(keyword);
    })
  );
};
