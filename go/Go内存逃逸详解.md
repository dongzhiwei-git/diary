# Go 内存逃逸（Escape Analysis）总结

## 📘 什么是逃逸（Escape）？

**逃逸**：指原本应分配在栈上的变量，由于其生命周期超出函数作用域，被编译器判断为应分配在堆上，由 **垃圾回收器 (GC)** 管理。

Go 编译器通过 **逃逸分析** 判断变量的作用域，从而决定是否将其分配在堆上。

---

## 📌 为什么需要逃逸分析？

- Go 是自动内存管理语言。
- 栈上分配更快、更便宜，但生命周期受限于函数作用域。
- 编译器使用逃逸分析确保变量生命周期正确，避免悬垂指针等错误。

---

## 🚩 常见的逃逸场景

| 场景编号 | 描述                        | 是否逃逸 | 示例代码                      |
|----------|-----------------------------|-----------|-------------------------------|
| 1        | 返回局部变量地址            | ✅ 是     | `return &x`                   |
| 2        | 闭包捕获局部变量            | ✅ 是     | `go func() { use(x) }()`      |
| 3        | 接口传值装箱                | ✅ 可能   | `var i interface{} = val`     |
| 4        | 指针存入 map/slice/struct   | ✅ 是     | `m["key"] = &x`               |
| 5        | 函数参数传指针              | ✅ 视情况 | `f(&x)`                       |
| 6        | 大数组局部分配              | ✅ 是     | `var a [10000]int`            |
| 7        | 打印地址（fmt.Printf）      | ✅ 是     | `fmt.Printf("%p", &x)`        |
| 8        | 被 reflect 使用             | ✅ 是     | `reflect.ValueOf(&x)`         |

---

## ✅ 示例详解

### 1. 返回局部变量地址

```go
func foo() *int {
    x := 10
    return &x // x 逃逸到堆
}
```



### 2. 闭包捕获局部变量

```go
func main() {
    x := 100
    go func() {
        fmt.Println(x) // x 被闭包捕获
    }()
}
```
### 3. 接口传值可能导致逃逸
```go
func main() {
    x := 42
    var i interface{} = x // 可能装箱逃逸
}

```
### 4. 存入引用类型容器

```go
func main() {
    x := 1
    m := make(map[string]*int)
    m["key"] = &x // x 逃逸
}
```

## 🔍 如何判断变量是否逃逸？

使用如下命令：

go build -gcflags=-m main.go

输出示例：

main.go:5:6: moved to heap: x

这表示变量 x 被编译器判断为逃逸到了堆上。
## 🧮 栈 vs 堆 对比

```
特性	栈（Stack）	堆（Heap）
分配方式	自动分配	动态分配
分配速度	快（指针移动）	慢（GC 介入）
生命周期	随函数调用结束	被 GC 管理
性能影响	无需 GC，更高效	GC 参与，影响性能
逃逸风险	不会	有逃逸才使用堆
```
## 🛠 优化建议
	•	避免返回局部变量指针。
	•	减少闭包对局部变量的捕获。
	•	避免将指针存入 interface/map/slice 等引用类型。
	•	用 go build -gcflags=-m 检查性能敏感代码是否发生逃逸。

## ✅ 一句话总结

Go 编译器通过逃逸分析判断变量是分配在栈上还是堆上。凡是生命周期逃出函数作用域的变量基本都会逃逸。
