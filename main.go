package main

import (
	"fmt"
)

// 合并字幕片段
func mergeSubtitles(subtitles []Subtitle, maxLength int) []Subtitle {
	if len(subtitles) <= 1 {
		return subtitles
	}

	result := make([]Subtitle, 0)
	currentSubtitle := subtitles[0]
	for i := 1; i < len(subtitles); i++ {
		if len(currentSubtitle.Text)+len(subtitles[i].Text) > maxLength {
			result = append(result, currentSubtitle)
			currentSubtitle = subtitles[i]
		} else {
			currentSubtitle.Text += " " + subtitles[i].Text
			currentSubtitle.End = subtitles[i].End
		}
	}
	result = append(result, currentSubtitle)
	return result
}

// 字幕结构体
type Subtitle struct {
	Text  string
	Start int
	End   int
}

func main() {
	// 输入的字幕片段
	subtitles := []Subtitle{
		{"Hello", 0, 4},
		{"World", 5, 10},
		{"This", 13, 18},
		{"is", 18, 20},
		{"a", 20, 21},
		{"test", 21, 23},
	}

	// 最大字幕长度
	maxLength := 12

	// 合并字幕
	mergedSubtitles := mergeSubtitles(subtitles, maxLength)

	// 输出结果
	for _, sub := range mergedSubtitles {
		fmt.Printf("('%s', %d, %d)\n", sub.Text, sub.Start, sub.End)
	}
}
