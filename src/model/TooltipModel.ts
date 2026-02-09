/**
 * Tooltip 组件 Model - 管理提示框配置
 */

import { ComponentModel } from "./BaseModel"
import type { TooltipOption, ChartOption } from "@/types"

/**
 * TooltipModel - 负责管理 Tooltip 配置
 */
export class TooltipModel extends ComponentModel<TooltipOption> {
  protected extractOption(globalOption: ChartOption): TooltipOption {
    return globalOption.tooltip
  }

  /**
   * 获取 Tooltip 配置
   */
  public getTooltipOption(): TooltipOption | null {
    return this.option || null
  }
}
