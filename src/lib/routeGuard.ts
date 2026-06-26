/** Query ainda sem cache — bloqueia rota; refetch em background não bloqueia. */
export function isQueryBootstrapping<T>(isPending: boolean, data: T | undefined): boolean {
  return isPending && data === undefined;
}
