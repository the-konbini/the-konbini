
import { GoogleGenAI } from "@google/genai";
import { ContentType } from '../types';

// Initialize Gemini with apiKey from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCreativeContent = async (
  prompt: string, 
  type: ContentType,
  currentContent?: string
): Promise<string> => {
  try {
    let systemInstruction = "";
    let userPrompt = prompt;

    if (type === ContentType.NOVEL) {
      systemInstruction = "Bạn là một trợ lý viết văn chuyên nghiệp, sáng tạo và giàu cảm xúc. Hãy giúp người dùng viết tiếp câu chuyện, tạo dàn ý hoặc mô tả chi tiết bằng tiếng Việt.";
      if (currentContent) {
        userPrompt = `Dựa trên nội dung hiện tại:\n"${currentContent}"\n\nYêu cầu của người dùng: ${prompt}`;
      }
    } else if (type === ContentType.COMIC) {
      systemInstruction = "Bạn là một biên kịch truyện tranh tài ba. Hãy giúp tạo ra kịch bản phân cảnh (storyboard), mô tả nhân vật hoặc tóm tắt cốt truyện hấp dẫn bằng tiếng Việt.";
    } else if (type === ContentType.VIDEO) {
      systemInstruction = "Bạn là một nhà sáng tạo nội dung video (YouTuber/TikToker) chuyên nghiệp. Hãy giúp viết kịch bản video, tiêu đề hấp dẫn (clickbait nhưng trung thực) và mô tả video chuẩn SEO bằng tiếng Việt.";
    }

    // Using gemini-3-flash-preview as the recommended model for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    // Directly access the text property as per SDK guidelines
    return response.text || "Xin lỗi, tôi không thể tạo nội dung lúc này.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại sau.";
  }
};

export const generateTags = async (title: string, description: string): Promise<string[]> => {
    try {
        // Using gemini-3-flash-preview for tag generation
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Hãy tạo 5 thẻ (tags) ngắn gọn bằng tiếng Việt cho nội dung có tiêu đề "${title}" và mô tả "${description}". Trả về kết quả dưới dạng danh sách ngăn cách bởi dấu phẩy, không có số thứ tự. Ví dụ: Hành động, Tình cảm, Học đường`,
        });
        const text = response.text || "";
        return text.split(',').map(tag => tag.trim());
    } catch (error) {
        return ["Mới", "Hot"];
    }
}