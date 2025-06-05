# Mysql索引

MySQL 的索引是用于提高数据库查询效率的一种数据结构。合理地使用索引可以显著加快 SELECT 语句的执行速度，但也会带来一定的维护成本（如 INSERT、UPDATE、DELETE 时需要维护索引）。

下面是关于 MySQL 索引的详细介绍：


## 🧱 一、索引的类型

1. 主键索引（Primary Key Index）
	•	表中只能有一个主键索引，字段值唯一且非空。
	•	通常是聚簇索引（InnoDB 引擎）。

2. 唯一索引（Unique Index）
	•	字段值必须唯一，但可以为 NULL（可多个）。
	•	用于强约束唯一性，比如邮箱、手机号。

3. 普通索引（Normal Index）
	•	没有唯一性约束，常用于加速查询。

4. 复合索引（Composite Index）
	•	又叫联合索引，由多个字段组成。
	•	遵循“最左前缀”原则。

5. 全文索引（Fulltext Index）
	•	主要用于全文搜索，如搜索文章内容，适用于 TEXT 类型。
	•	支持 MATCH…AGAINST 查询。

6. 空间索引（Spatial Index）
	•	用于 GIS 地理空间数据，适用于 GEOMETRY 类型。


## ⚙️ 二、常用引擎的索引机制
```
🔹 InnoDB（默认存储引擎）
	•	使用 B+ 树 结构实现索引。
	•	主键索引为聚簇索引（数据存储与主键索引在一起）。
	•	辅助索引（Secondary Index）中保存的是主键的值而非数据地址。

🔹 MyISAM
	•	也使用 B+ 树。
	•	非聚簇索引：索引和数据是分开的。
	•	读取时先查索引再根据指针找数据行。
```

## 🚀 三、索引的使用原则
	1.	选择性高的列建索引（唯一值越多越好）。
	2.	频繁用于 WHERE、JOIN、ORDER BY、GROUP BY 的列应建索引。
	3.	尽量覆盖查询（使用覆盖索引）。
	4.	避免在索引列上使用函数或计算。
	5.	避免使用 %LIKE% 模式开头的模糊查询。
	6.	不要滥用索引：每多一个索引就会增加维护成本。



## 🔍 四、查看和管理索引

查看表索引：

SHOW INDEX FROM table_name;

添加索引：

-- 添加普通索引
CREATE INDEX idx_col1 ON table_name(col1);

-- 添加唯一索引
CREATE UNIQUE INDEX idx_col1 ON table_name(col1);

-- 添加复合索引
CREATE INDEX idx_multi ON table_name(col1, col2);

删除索引：

DROP INDEX idx_col1 ON table_name;

## 🧠 五、使用索引的查询优化（示例）

-- 假设有以下表结构：
```sql
CREATE TABLE user (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  age INT,
  INDEX idx_name_email (name, email)
);
```
-- 最左前缀生效
```sql
SELECT * FROM user WHERE name = 'Tom';           -- ✅ 使用 idx_name_email
SELECT * FROM user WHERE name = 'Tom' AND email = 'x';  -- ✅ 使用 idx_name_email
SELECT * FROM user WHERE email = 'x';             -- ❌ 无法使用 idx_name_email
```
