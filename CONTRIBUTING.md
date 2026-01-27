# 贡献指南 (Contributing Guide)

感谢你对 **Signal Chart** 感兴趣！这是一个基于 ZRender 的高性能、可扩展的频谱可视化库。我们非常欢迎社区的贡献，无论是新功能的开发、BUG 修复还是文档改进。

这份文档将帮助你理解项目架构，并指导你如何扩展新的图表组件。

## 🏗 项目架构 (Architecture)

Signal Chart 采用了配置驱动（Option-Driven）和组件化（Component-Based）的架构设计，核心思想类似于 ECharts，但针对音频信号场景进行了简化和优化。

```mermaid
graph TD
    User[User Code] -->|setOption| Chart

    subgraph SignalChart Core
        Chart -->|Delegates| Scheduler
        Chart -->|Owns| ComponentManager
        Chart -->|Wraps| ZRender[ZRender Instance]

        Scheduler -->|1. Normalize & Notify| ComponentManager
        ComponentManager -->|2. Update Lifecycle| Components
    end

    subgraph Components [Component System (MVC)]
        direction TB
        Spec[ComponentSpec\n(Controller)] -->|Updates| Model[ComponentModel\n(Data/Layout)]
        Spec -->|Triggers| View[ComponentView\n(Rendering)]
        View -.->|Draws Shapes| ZRender
        Model -.->|Provides Data| View
    end
```

### 核心模块

1.  **Chart (核心入口)**:
    - 负责管理 ZRender 实例、DOM 容器和生命周期。
    - 维护全局组件注册表 (`Chart.use`)。
    - 单例管理模式 (`getInstanceByDom`)。

2.  **Scheduler (调度器)**:
    - 负责接收用户配置 (`setOption`)。
    - **规范化 (Normalize)**: 将用户输入的松散配置转换为内部标准的配置格式。
    - **通知 (Notify)**: 将最新的配置分发给所有注册的组件。
    - **协调 (Flush)**: 触发组件更新。

### 数据流向 (Data Flow)

以下是 `setOption` 触发更新的完整流程：

```mermaid
sequenceDiagram
    participant User
    participant Chart
    participant Scheduler
    participant CM as ComponentManager
    participant Spec as ComponentSpec
    participant Model as ComponentModel
    participant View as ComponentView

    User->>Chart: setOption(option)
    Chart->>Scheduler: setOption(option)
    Note right of Scheduler: Normalize Option

    Scheduler->>CM: update(unifiedOption)

    rect rgb(40, 40, 40)
        Note over CM, Model: Phase 1: Update Models
        loop Every Component
            CM->>Spec: onOptionUpdate(opt)
            Spec->>Model: updateOption(opt)
            alt if changed
                Model-->>Spec: markDirty()
            end
        end
    end

    rect rgb(40, 40, 40)
        Note over CM, View: Phase 2: Render Views
        loop Every Component (Topological Order)
            CM->>Spec: update()
            alt isDirty
                Spec->>View: render(model)
                View-->>View: ZRender Draw
            end
        end
    end
```

### 组件架构 (Model-View Pattern)

    - 管理所有组件实例。
    - **依赖注入**: 处理组件间的依赖关系（例如 Axis 组件依赖 Grid 组件的布局信息）。
    - **渲染顺序**: 确保正确的渲染层级（Grid -> Axis -> Series）。

### 组件架构 (Model-View Pattern)

为了保持逻辑清晰和可测试性，所有的组件（Component）都遵循 **Model-View** 分离的设计模式：

- **ComponentSpec (Controller)**:
  - 组件的入口类，继承自 `ComponentSpec`。
  - 负责协调 Model 和 View。
  - 管理 `dirty` 状态，避免不必要的重绘。

- **ComponentModel (Model)**:
  - 继承自 `ComponentModel<T>`。
  - **职责**: 解析配置、合并默认值、计算布局数据（如 x, y, width, height）、提供坐标转换方法。
  - **纯逻辑**: 不包含任何 ZRender 绘图代码。

- **ComponentView (View)**:
  - 继承自 `ComponentView<M>`。
  - **职责**: 根据 Model 提供的数据，使用 ZRender 图形元素进行绘制。
  - **纯渲染**: 不处理业务逻辑或配置解析。

---

## 🚀 如何开发新组件 (Extending Guide)

如果你想添加一个新的图表组件（例如一个新的 Series 类型或图例组件），请遵循以下步骤。

### 1. 定义配置接口

在 `src/core/type.ts` 中定义你的组件配置接口：

```typescript
// src/core/type.ts
export interface MyComponentOption {
  show?: boolean
  color?: string
  // ...其他配置
}

// 扩展主配置接口
export interface ChartOption {
  // ...
  myComponent?: MyComponentOption
}
```

### 2. 创建 Model

新建 `src/model/myComponentModel.ts`。Model 负责处理数据逻辑。

```typescript
import { ComponentModel } from "./baseModel"
import { ChartOption } from "@/core/type"

export class MyComponentModel extends ComponentModel<MyComponentOption> {
  // 1. 定义默认配置
  protected getDefaultOption(): MyComponentOption {
    return {
      show: true,
      color: "#000"
    }
  }

  // 2. 提取配置
  protected extractOption(globalOption: ChartOption): MyComponentOption | undefined {
    return globalOption.myComponent
  }

  // 3. (可选) 实现具体的计算逻辑
  public calculateLayout() {
    // 使用 this.context.containerWidth 等计算
  }
}
```

### 3. 创建 View

新建 `src/view/myComponentView.ts`。View 负责绘图。

```typescript
import { ComponentView } from "./baseView"
import { MyComponentModel } from "@/model/myComponentModel"
import { Circle } from "zrender"

export class MyComponentView extends ComponentView<MyComponentModel> {
  public render(model: MyComponentModel): void {
    // 1. 清理旧图形（baseView 已实现基础清理）
    this.clear()

    const option = model.getOption()
    if (!option.show) return

    // 2. 绘制图形
    const circle = new Circle({
      shape: { cx: 100, cy: 100, r: 50 },
      style: { fill: option.color }
    })

    // 3. 添加到组
    this.group.add(circle)
  }
}
```

### 4. 创建 Component 入口

新建 `src/component/myComponent.ts`。

```typescript
import { ComponentSpec, ComponentType } from "./component"
import { MyComponentModel } from "@/model/myComponentModel"
import { MyComponentView } from "@/view/myComponentView"

export class MyComponent extends ComponentSpec {
  type = "myComponent" as any // 需要在 ComponentType 枚举中添加
  private model: MyComponentModel
  private view: MyComponentView

  constructor(context: ComponentContext) {
    super(context)
    const { width, height } = this.zr

    this.model = new MyComponentModel({ containerWidth: width, containerHeight: height })
    this.view = new MyComponentView(this.zr)
  }

  init() {
    this.view.init()
    this.dirty = false
  }

  onOptionUpdate(option: ChartOption) {
    this.model.updateOption(option)
    if (this.model.dirty) {
      this.dirty = true
      this.model.dirty = false // 重置 model 状态
    }
  }

  update() {
    if (!this.dirty) return
    this.view.render(this.model)
    this.dirty = false
  }

  clear() {
    this.view.clear()
  }
  destroy() {
    this.view.destroy()
  }
}
```

### 5. 注册组件

在使用时注册你的新组件：

```typescript
Chart.use(MyComponent)
```

---

## 🛠 开发环境设置

1.  **安装依赖**:

    ```bash
    npm install
    ```

2.  **启动开发服务器**:

    ```bash
    npm run dev
    ```

3.  **代码提交规范**:
    - 请确保代码通过 TypeScript 检查。
    - 遵循现有的代码风格（Model/View 分离）。
    - 提交信息清晰明了（例如：`feat: add waterfall series component`）。

---

## 💡 核心工具函数

- **`src/utils/coordinate.ts`**:
  - `linearMap`: 线性映射，用于将数据值转换为像素坐标。
  - `parsePercent`: 解析 "50%" 或数值。
  - `calculateRect`: 计算容器内的矩形布局。

- **`src/utils/format.ts`**:
  - `calculateNiceTicks`: 生成美观的坐标轴刻度。

## 🤝 提交 Pull Request

1.  Fork 本仓库。
2.  创建一个新的分支 (`git checkout -b feature/AmazingFeature`)。
3.  提交你的更改 (`git commit -m 'Add some AmazingFeature'`)。
4.  推送到分支 (`git push origin feature/AmazingFeature`)。
5.  打开一个 Pull Request。
