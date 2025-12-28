import axios, { AxiosError, AxiosRequestConfig } from "axios";

const API_BASE_URL = "http://localhost:5000"; // Replace with actual API URL

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management
export const getAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem("refreshToken");
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refreshToken`,
            {
              refreshToken,
            }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          setTokens(accessToken, newRefreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Types
export interface User {
  id?: string;
  email: string;
  username: string;
  imageUrl?: string;
  roles?: string[];
  isVerified?: boolean;
}

export interface Post {
  _id: string;
  title: string;
  caption: string;
  imageUrl: string;
  tags: string[];
  user: User | string;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: User;
}

interface LoginResponse {
  message: string;
  data: AuthResponse;
}

interface LoadUserDataResponse {
  message: string;
  user: User;
  postCount: number;
  posts:Post[]
}


// Auth endpoints


export const authAPI = {
  register: async (email:string, password:string, username:string,code:string) => {
    return api.post("/api/HivGrid/auth/register", {
      email,
      password,
      username,
      code
    });
  },

  sendVerificationCode:async(email) =>{
    return api.post("/api/HivGrid/auth/verify",{
      email
    })
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post("/api/HivGrid/auth/login", { email, password });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post("/auth/forgottPassword", { email });
    return response.data;
  },

  verify: async (verificationCode: string) => {
    const response = await api.post("/auth/verify", { verificationCode });
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post("/auth/refreshToken", { refreshToken });
    return response.data;
  },
};

// Profile endpoints
export const profileAPI = {
  getUserProfile: async (): Promise<LoadUserDataResponse> => {
    const response = await api.get("api/HivGrid/profile/userProfile");
    return response.data;
  },

  updateProfile: async (formData: FormData) => {
    const response = await api.post("/api/HivGrid/profile/updateProfile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.post("/profile/deleteAccount");
    return response.data;
  },
};

// Home/Posts endpoints
export const postsAPI = {
  loadData: async (): Promise<Post[]> => {
    const response = await api.get("/api/HivGrid/home/loadData");
    return response.data.data;
  },

  loadUserData: async (): Promise<LoadUserDataResponse> => {
    const response = await api.get("/api/HivGrid/home/loadUserData");
    return response.data;
  },

  publish: async (formData: FormData): Promise<Post> => {
    const response = await api.post("/api/HivGrid/home/publish", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  updatePost: async(postId:string,title:string,caption:string,tags:string[])=>{
    const response = await api.put("/api/HivGrid/post/updatePost",{postId,title,caption,tags})
    return response.data
  }
};

export default api;
