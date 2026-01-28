# 类型定义组织结构

## 📁 目录结构

```
src/types/
├── index.ts           # 统一导出入口
├── core.ts            # 核心类型定义（ChartOption, GridOption, AxisOption 等）
├── component.ts       # 组件类型定义（ComponentType, ComponentContext 等）
├── model.ts           # Model 类型定义（ModelContext）
└── utils.ts           # 工具类型定义（DeepPartial）
```

## 🎯 使用方式

### ✅ 推荐方式

```typescript
// 从统一入口导入
import type { ChartOption, ComponentType, ComponentContext } from "@/types"
import { ComponentType } from "@/types" // 枚举需要非 type 导入
```

### ⚠️ 旧方式（已废弃但仍兼容）

```typescript
// 这些导入仍然有效，但不推荐
import { ChartOption } from "@/core/type"
import { ComponentContext } from "@/component/baseComponent"
```

## 📋 类型分类

### 1. **核心类型** (`types/core.ts`)

包含图表的主要配置接口：

- `ChartOption` - 图表主配置
- `ZRenderInitOptions` - ZRender 初始化选项
- `GridOption` - 网格配置
- `AxisOption` - 坐标轴配置
  - `AxisLineOption`
  - `AxisTickOption`
  - `AxisLabelOption`
  - `AxisUnitOption`
- `SeriesOption` - 系列配置
- `SeriesType` - 系列类型

### 2. **组件类型** (`types/component.ts`)

包含组件系统相关的类型：

- `ComponentType` - 组件类型枚举
- `ComponentContext` - 组件上下文
- `ComponentConstructor` - 组件构造函数类型
- `ComponentInstance` - 组件实例接口

### 3. **Model 类型** (`types/model.ts`)

包含 Model 相关的类型：

- `ModelContext` - Model 上下文

### 4. **工具类型** (`types/utils.ts`)

包含通用工具类型：

- `DeepPartial<T>` - 深度部分类型

## 🔄 迁移指南

如果你正在使用旧的导入方式，建议逐步迁移：

### 步骤 1: 更新核心类型导入

```typescript
// 旧
import { ChartOption } from "@/core/type"

// 新
import type { ChartOption } from "@/types"
```

### 步骤 2: 更新组件类型导入

```typescript
// 旧
import { ComponentType, ComponentContext } from "@/component/baseComponent"

// 新
import { ComponentType } from "@/types"
import type { ComponentContext } from "@/types"
```

### 步骤 3: 更新工具类型导入

```typescript
// 旧
import { DeepPartial } from "@/utils/options"

// 新
import type { DeepPartial } from "@/types"
```

## 💡 设计原则

1. **单一职责** - 每个文件只包含相关的类型定义
2. **统一入口** - 通过 `index.ts` 统一导出，方便使用
3. **向后兼容** - 旧的导入方式仍然有效（通过 `@/core/type.ts` 重导出）
4. **类型优先** - 使用 `import type` 导入类型，避免运行时开销
5. **清晰分类** - 按功能模块分类，便于维护和查找

## 📝 示例

### 创建新组件

```typescript
import type { ComponentContext, ComponentType, ComponentInstance, ChartOption } from "@/types"
import { BaseComponent } from "@/component/baseComponent"

export class MyComponent extends BaseComponent {
  type = ComponentType.Grid

  constructor(context: ComponentContext) {
    super(context)
  }

  onOptionUpdate(option: ChartOption): void {
    // ...
  }
}
```

### 定义新的配置接口

```typescript
// 在 types/core.ts 中添加
export interface MyNewOption {
  show: boolean
  value: number
}

// 在 types/index.ts 中导出
export type { MyNewOption } from "./core"
```
