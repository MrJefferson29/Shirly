import { createContext, useState, useEffect } from "react";
import { loginService, signupService, getCurrentUserService } from "../../api/apiServices";
import { notify } from "../../utils/utils";

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userInfo, setUserInfo] = useState(
    localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo"))
      : null
  );
  const [loggingIn, setLoggingIn] = useState(false);
  const [signingUp, setSigningUp] = useState(false);

  // Refresh user data when component mounts (if user is logged in)
  useEffect(() => {
    if (token && userInfo) {
      refreshUserData();
    }
  }, []); // Only run once on mount

  const signupHandler = async ({
    username = "",
    email = "",
    password = "",
  }) => {
    setSigningUp(true);
    try {
      const response = await signupService(username, email, password);
      console.log(response);
      if (response.status === 200 || response.status === 201) {
        localStorage.setItem("token", response?.data?.data?.token);
        localStorage.setItem(
          "userInfo",
          JSON.stringify(response?.data?.data?.user)
        );
        setToken(response?.data?.data?.token);
        notify("success", "Signed Up Successfully!!");
      }
    } catch (err) {
      console.log(err);
      notify(
        "error",
        err?.response?.data?.errors
          ? err?.response?.data?.errors[0]?.msg || err?.response?.data?.message
          : err?.response?.data?.message || "Some Error Occurred!!"
      );
    } finally {
      setSigningUp(false);
    }
  };

  const loginHandler = async ({ email = "", password = "" }) => {
    setLoggingIn(true);
    try {
      const response = await loginService(email, password);
      console.log({ response });
      if (response.status === 200 || response.status === 201) {
        localStorage.setItem("token", response?.data?.data?.token);
        localStorage.setItem(
          "userInfo",
          JSON.stringify(response?.data?.data?.user)
        );
        setToken(response?.data?.data?.token);
        notify("success", "Logged In Successfully!!");
      }
    } catch (err) {
      console.log(err);
      notify(
        "error",
        err?.response?.data?.errors
          ? err?.response?.data?.errors[0]?.msg || err?.response?.data?.message
          : err?.response?.data?.message || "Some Error Occurred!!"
      );
    } finally {
      setLoggingIn(false);
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setToken(null);
    setUserInfo(null);
    notify("info", "Logged out successfully!!", 100);
  };

  const refreshUserData = async () => {
    if (!token) return;
    
    try {
      const response = await getCurrentUserService(token);
      if (response.status === 200) {
        const updatedUserInfo = response.data.data.user;
        localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
        setUserInfo(updatedUserInfo);
        console.log("User data refreshed:", updatedUserInfo);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      // If token is invalid, logout the user
      if (error.response?.status === 401) {
        logoutHandler();
      }
    }
  };
  return (
    <AuthContext.Provider
      value={{
        token,
        loggingIn,
        loginHandler,
        logoutHandler,
        signupHandler,
        signingUp,
        userInfo,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
