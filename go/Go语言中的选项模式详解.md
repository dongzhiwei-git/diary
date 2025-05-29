# Go 语言中的选项模式（Option Pattern）详解

在 Go 开发中，我们经常会遇到这样的需求：**构造一个复杂对象时，用户需要可选地设置多个参数**。比如一个 HTTP 客户端、数据库连接器、缓存系统等，这些组件往往拥有多个可配置参数，而这些参数又不全是必填项。

Go 没有默认参数或函数重载功能，要优雅地解决这种“可选配置”问题，社区广泛采用了一种模式：**选项模式（Option Pattern）**。

本文将系统介绍选项模式的原理、使用方式和适用场景，并提供最佳实践建议。

---

## 一、为什么需要选项模式？

来看一个例子：我们想构造一个缓存对象，它的初始化可以接受以下可选参数：

- 缓存大小（Size）
- 过期时间（TTL）
- 是否启用 LRU 算法
- 日志输出器

如果使用传统方式（多个构造函数），会变得非常混乱：

```go
NewCache(size int)
NewCacheWithTTL(size int, ttl time.Duration)
NewCacheWithTTLAndLRU(size int, ttl time.Duration, lru bool)
// 构造函数组合爆炸
```
这时候选项模式就能大显身手。



## 二、选项模式的核心思想

选项模式的核心是：

使用一个函数类型（Option）作为参数，允许调用者通过链式方式传入“配置函数”来自定义对象行为。

核心步骤：
-	1.	定义一个 Option 类型（函数类型）
-	2.	构造函数接受可变参数 ...Option
-	3.	每个配置项封装成一个 Option 函数
-	4.	在构造函数内部应用这些配置



## 三、代码示例

假设我们要实现一个 Cache 结构体：

```go
type Cache struct {
    size     int
    ttl      time.Duration
    useLRU   bool
    logger   Logger
}
```
```go
// 1. 定义 Option 类型

type Option func(*Cache)

// 2. 构造函数

func NewCache(opts ...Option) *Cache {
    c := &Cache{
        size:   128,
        ttl:    5 * time.Minute,
        useLRU: false,
        logger: defaultLogger,
    }

    for _, opt := range opts {
        opt(c)
    }
    return c
}

// 3. 提供配置函数

func WithSize(size int) Option {
    return func(c *Cache) {
        c.size = size
    }
}

func WithTTL(ttl time.Duration) Option {
    return func(c *Cache) {
        c.ttl = ttl
    }
}

func WithLRU() Option {
    return func(c *Cache) {
        c.useLRU = true
    }
}

func WithLogger(l Logger) Option {
    return func(c *Cache) {
        c.logger = l
    }
}

// 4. 使用方式

cache := NewCache(
    WithSize(256),
    WithTTL(10*time.Minute),
    WithLRU(),
)
```

代码清晰、扩展性强、无需多个构造函数，尤其适合配置项较多的场景。



## 四、选项模式的优势与不足

✅ 优势
- 参数清晰，易于组合
- 默认值和用户自定义值共存
- 无需多重构造函数，API 简洁
- 扩展新功能时无侵入

❌ 不足
-	相较于结构体字面量方式，稍有抽象，不如直接赋值直观
-	对新手理解函数式配置可能不太友好
-	若 Option 太多可能影响调试（每个都要追踪）



## 五、适用场景

选项模式非常适合：
- 底层库（如客户端 SDK、缓存、数据库连接器等）
- 有多个可选配置项的服务或组件
- 需要向后兼容地添加新参数的情况

不适合过度使用在简单的结构体初始化中。



## 六、对比结构体初始化方式

结构体字面量初始化也常用于配置：

cfg := Config{
    Size: 128,
    TTL:  5 * time.Minute,
}

结构体方式更直观，但无法添加默认值或隐藏实现细节，扩展时需要暴露内部结构。而选项模式更灵活、可封装逻辑、更易于维护。



## 七、总结

选项模式是 Go 语言中弥补“无默认参数”的一种优雅方案。通过函数式的配置组合，它提升了组件构造的灵活性和可维护性。作为一项设计模式，它已经在 Go 生态中被广泛使用。

使用选项模式时建议：
-	只为“配置型”组件设计，不要滥用
-	为每个 Option 函数写注释，提升可读性
-	保持默认配置合理，避免强制传参

