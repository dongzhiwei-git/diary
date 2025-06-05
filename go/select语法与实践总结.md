# Go `select` 语法与实践总结

> 作者：ricardo <br>
> 标签：并发、channel、select、goroutine

---

## 🧠 什么是 `select`？

`select` 是 Go 提供的**用于监听多个 channel** 的控制结构。  
它和 `switch` 类似，但 case 是基于 **channel 的收发操作**。它让你可以优雅地处理并发场景下的通信。

---

## 🔧 基本语法

```go
select {
case val := <-ch1:
    // 从 ch1 读取数据
case ch2 <- 1:
    // 向 ch2 写入数据
default:
    // 所有 channel 都阻塞时执行
}

	•	select 会随机执行一个 可操作的 case。
	•	如果没有 case 可执行（全部阻塞），则：
	•	有 default 时执行 default
	•	没有 default 时阻塞等待

```

## 📦 典型使用场景
```
场景	描述
超时控制	等待数据或超时后继续执行
多通道监听	同时监听多个 channel，谁先来处理谁
主动退出 goroutine	用 signal channel 通知退出
防止 goroutine 泄露	可超时、可关闭
实现非阻塞通信	配合 default 实现非阻塞读/写
```
## 🧪 常见示例

### 1. 超时控制
```go
select {
case res := <-ch:
    fmt.Println("收到结果:", res)
case <-time.After(2 * time.Second):
    fmt.Println("超时退出")
}
```
### 2. 多通道优先处理
```go
select {
case <-ch1:
    fmt.Println("收到 ch1")
case <-ch2:
    fmt.Println("收到 ch2")
}
```
### 3. 主动退出 goroutine

```go
func worker(stopChan chan struct{}) {
    for {
        select {
        case <-stopChan:
            fmt.Println("收到退出信号，退出")
            return
        default:
            fmt.Println("工作中...")
            time.Sleep(500 * time.Millisecond)
        }
    }
}
```
### 4. 非阻塞写入
```go
select {
case ch <- data:
    fmt.Println("写入成功")
default:
    fmt.Println("写入失败，通道满了")
}
```

### 5. 多路合并（fan-in）
```go
func merge(a, b <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        for {
            select {
            case v := <-a:
                out <- v
            case v := <-b:
                out <- v
            }
        }
    }()
    return out
}
```
## ⚠️ 使用注意事项
	•	不要在 select 中关闭 channel，否则可能 panic。
	•	所有 case 都阻塞时，select 会阻塞主线程。
	•	select 中 case 的顺序无优先级，Go 会随机调度。
	•	若 channel 被关闭，读取操作仍会触发 case，返回零值。


## ✅ 实战技巧（来自经验）
	•	超时要用 time.After，但注意内存泄露（推荐使用 time.NewTimer 手动控制）。
	•	用 select + default 可写非阻塞队列或限流器。
	•	长时间运行的 goroutine 里一定要留有 stopChan 控制。

## 🔍 select 的工作机制（高级部分）

Go 会在编译期将 select 编译成一个runtime.Select 调度结构，底层维护一个伪随机调度器用于公平性。
这也是为什么多个 case 可执行时，最终执行哪个是不可预测的。


## 🧵 select vs switch
```
特性	switch	select
匹配目标	表达式	channel 状态（可读/写）
执行逻辑	顺序匹配第一个 case	随机选择一个可运行 case
应用场景	分支控制	并发通道控制
```

## 🧭 一句话总结

select 是并发通信场景下的多路复用利器，能让你从多个 channel 中优雅地做出决策，是 Go 并发编程的核心武器之一。
