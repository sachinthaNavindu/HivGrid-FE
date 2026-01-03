import axios, { AxiosError, AxiosRequestConfig } from "axios";

const API_BASE_URL = "https://hiv-grid-be.vercel.app"; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials:true,
});

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

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        return Promise.reject(error);
      }
//https://hiv-grid-be.vercel.app
      try {
        const res = await api.post(
          "/api/HivGrid/auth/refreshToken",
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = res.data;

        setTokens(accessToken, newRefreshToken);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${accessToken}`,
        };

        return api(originalRequest);
      } catch (err) {
        clearTokens();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

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

export interface HiringAd {
  _id: string;
  description: string;
  selectedSkills: string[];
  email: string;
  username: string;
  whatsApp?: string;
  createdAt: string;
  updatedAt: string;

  user: {
    _id: string;
    email: string;
    username: string;
    imageUrl?: string;
  };
}


export interface HiringAdInput {
  name:string
  userEmail: string
  description: string;
  selectedSkills: string[];
  countryCode: string;
  phoneNumber: string;
}


export interface EnhanceDescriptionResponse {
  enhancedDescription: string;
}


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
    const response = await api.post("/api/HivGrid/auth/forgottPassword", { email });
    return response.data;
  },

  verify: async (verificationCode: string) => {
    const response = await api.post("/api/HivGrid/auth/verify", { verificationCode });
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post("/api/HivGrid/auth/refreshToken", { refreshToken });
    return response.data;
  },
};

export const profileAPI = {
  getUserProfile: async (): Promise<LoadUserDataResponse> => {
    const response = await api.get("/api/HivGrid/profile/userProfile");
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
    const response = await api.post("/api/HivGrid/profile/deleteAccount");
    return response.data;
  },
};

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

 export const hireApi = {
  createHiringAd: async (data: HiringAdInput) => {
    const response = await api.post("/api/HivGrid/hire/publish", data);
    return response.data;
  },
  getAllHiringAds: async (): Promise<HiringAd[] > => {
    const response = await api.get("/api/HivGrid/hire/all");
    return response.data.data;
  },

  getMyHiringAd: async():Promise<HiringAd>=>{
    const response = await api.get("/api/HivGrid/hire/getMyHiringAd")
    return response.data.data
  },

  updateMyHiringAd: async(data) =>{
    const response = await api.put("/api/HivGrid/hire/updateAd",data)
    return response.data
  },

  hireAdDescriptionEnhance:async(data):Promise<EnhanceDescriptionResponse>=>{
    const response = await api.post("/api/HivGrid/hire/enhance-description",{data})
    return response.data
  }
};


export default api;