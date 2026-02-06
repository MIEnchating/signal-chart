/**
 * 组件 View 基类 - 负责渲染逻辑
 */

import { Group } from "zrender"
import type { ZRenderType } from "zrender"

/**
 * 组件 View 抽象类
 * 泛型 T 为 render 方法接受的数据类型
 */
export abstract class ComponentView<T = any> {
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
   * 根据数据渲染（子类实现）
   * @param data 渲染所需数据（可以是 Model 或预处理后的数据）
   */
  public abstract render(data: T): void

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
