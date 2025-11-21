export function toURLQueryString(params?: Record<string, unknown>) {
  if (params) {
    const query = new URLSearchParams();
    let key: keyof typeof params;
    for (key in params) {
      query.append(key, params[key]!.toString());
    }
    return `?${query.toString()}`;
  }
  return '';
}
