export interface IAIToolCriteriaRepository {
  findTextByTool(toolName: string): Promise<string[]>
}
