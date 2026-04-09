export function getIP(headers: Headers): string {
  return (
    headers.get("x-forwarded-for") || headers.get("remote_addr") || ""
  );
}
