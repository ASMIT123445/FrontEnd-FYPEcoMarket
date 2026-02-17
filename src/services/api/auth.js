import axiosInstance from "../axiosInstance";

export const saveSection = async ({ step, answers }) => {
  const formData = new FormData();

  for (const key in answers) {
    if (answers[key] !== null) {
      formData.append(key, answers[key]);
    }
  }

  try {
    await axiosInstance.post(
      `/auth/seller/onboarding/${step}/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      }
    );
  } catch (error) {
    throw error;
  }
};
