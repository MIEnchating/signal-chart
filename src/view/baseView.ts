/**
 * 组件 View 基类 - 负责渲染逻辑
 */

import { Group } from "zrender"
import type { ZRenderType } from "zrender"
import { ComponentModel } from "@/model/BaseModel"

/**
 * 组件 View 抽象类
 */
export abstract class ComponentView<M extends ComponentModel = ComponentModel> {
  protected zr: ZRenderType
  protected group: Group

  constructor(zr: ZRenderType) {
    this.zr = zr
    this.group = new Group()
  }

  /**
   * 初始化（将 group 添加到 ZRender）
   */
  public init(): void {
    this.zr.add(this.group)
  }

  /**
   * 根据 Model 渲染（子类实现）
   * @param model 数据模型
   */
  public abstract render(model: M): void

  /**
   * 清除渲染内容
   */
  public clear(): void {
    this.group.removeAll()
  }

  /**
   * 销毁 View
   */
  public destroy(): void {
    this.clear()
    this.zr.remove(this.group)
  }
}
