export interface DownstreamResponse<TBody = unknown> {
  readonly status: number
  readonly body: TBody
  readonly headers: Readonly<Record<string, string>>
}
