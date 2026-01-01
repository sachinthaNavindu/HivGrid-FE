import * as Yup from "yup";

export const registerSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),

  code: Yup.string()
    .required("Verification code is required"),

  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .required("Username is required"),

  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});



export const createPostSchema = Yup.object({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(150,"Title must be under 150 characters")
    .required("Title is required"),

  caption: Yup.string()
    .min(20,"Caption must be over 20 characters")
    .max(300, "Caption must be under 300 characters")
    .nullable(),

  tags: Yup.string()
    .nullable(),
});
