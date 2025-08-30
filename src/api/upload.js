import api from "../utils/axios.js";

export const uploadImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);
    const response = await api.post("/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return {
      success: true,
      data: response.data,
      message: "Image uploaded successfully",
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to upload image.";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
    };
  }
};
