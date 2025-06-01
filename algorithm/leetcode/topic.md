# 题目
## 35. 搜索插入位置
#### 题目描述
给定一个排序数组和一个目标值，在数组中找到目标值，并返回其索引。如果目标值不存在于数组中，返回它将会被按顺序插入的位置。

请必须使用时间复杂度为 O(log n) 的算法。

[原题链接](https://leetcode.cn/problems/search-insert-position/description/)


递归实现
```go

func searchInsert(nums []int, target int) int {
func searchInsert(nums []int, target int) int {
    return searchInsertRecursive(nums, target, 0, len(nums)-1)
}

func searchInsertRecursive(nums []int, target int, left int, right int) int {
    if left > right {
        return left
    }
    mid := (right-left)>>1 + left
    if target == nums[mid] {
        return mid
    } else if target < nums[mid] {
        return searchInsertRecursive(nums, target, left, mid-1)
    } else {
        return searchInsertRecursive(nums, target, mid+1, right)
    }
}
}

```
非递归实现
```go
func searchInsert(nums []int, target int) int {
    left := 0
    right := len(nums) - 1
    for left <= right {
        mid := (right-left)>>1 + left
        if target == nums[mid] {
            return mid
        } else if target < nums[mid] {
            right = mid - 1
        } else {
            left = mid + 1
        }
    }
}
```

## 26. 删除有序数组中的重复项
#### 题目描述
给你一个 升序排列 的数组 nums ，请你 原地 删除重复出现的元素，使每个元素 只出现一次 ，返回删除后数组的新长度。元素的 相对顺序 应该保持 一致 。
由于在某些语言中不能改变数组的长度，所以必须将结果放在数组nums的第一部分。更规范地说，如果在删除重复项之后有 k 个元素，那么 nums 的前 k 个元素应该保存最终结果。
将最终结果插入 nums 的前 k 个位置后返回 k 。
不要使用额外的空间，你必须在 原地 修改输入数组 并在使用 O(1) 额外空间的条件下完成。
[原题链接](https://leetcode.cn/problems/remove-duplicates-from-sorted-array-ii/description/)

